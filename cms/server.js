const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for potential images/large text
app.use(express.static(path.join(__dirname, '../')));

// 1. GET / - Serve Admin UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 1.5 API: Get All Articles
app.get('/api/articles', (req, res) => {
    try {
        const jsonPath = path.join(__dirname, '../data/news.json');
        const newsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // Collect all articles from various sections
        let all = [];
        // Helper to add unique links
        const add = (arr) => arr.forEach(x => all.push({ title: x.title, link: x.link }));

        add(newsData.hero_slides);
        add(newsData.latest_updates);
        add(newsData.analysis_grid);
        add(newsData.opinion_grid || []);
        add(newsData.explainers_grid || []);

        console.log("Total raw articles found:", all.length);


        // Normalize link function: remove ./ or / prefix
        const clean = (l) => l ? l.replace(/^\.?\/?/, '') : '';

        // Remove duplicates based on CLEAN link
        const uniqueLinks = new Set();
        const unique = [];

        all.forEach(a => {
            if (!a.link) return;
            const link = clean(a.link);
            if (!uniqueLinks.has(link)) {
                uniqueLinks.add(link);
                unique.push(a);
            }
        });

        console.log("Unique articles returning:", unique.length);

        res.json(unique);
    } catch (err) {
        console.error("Error in /api/articles:", err);
        res.json([]);
    }
});

// 1.6 API: Get Single Article Details
app.get('/api/article/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../articles/news', filename);

        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

        const content = fs.readFileSync(filePath, 'utf-8');

        // PARSE HTML to recover fields
        // 1. Meta / SEO
        const getMeta = (name) => {
            const match = content.match(new RegExp(`<meta name="${name}" content="([\\s\\S]*?)"`));
            return match ? match[1] : '';
        };
        const getOg = (prop) => {
            const match = content.match(new RegExp(`<meta property="${prop}" content="([\\s\\S]*?)"`));
            return match ? match[1] : '';
        };

        // 2. Body (Heuristic: Between <div class="article-body"> and closing </div> before </main>)
        const bodyMatch = content.match(/<div class="article-body">([\s\S]*?)<\/div>\s*<\/main>/);
        let body = bodyMatch ? bodyMatch[1].trim() : '';

        // 2.1 Key Takeaways
        const keyMatch = body.match(/<div class="key-takeaways">([\s\S]*?)<\/div>/);
        let key_takeaways = '';
        if (keyMatch) {
            key_takeaways = keyMatch[1].trim(); // Extract inner HTML (UL/LI)
            body = body.replace(keyMatch[0], '').trim(); // Remove from Body
        }

        // 2.2 Remove FAQ (New Structure)
        const faqStart = body.indexOf('<section class="faq-section">');
        if (faqStart !== -1) {
            body = body.substring(0, faqStart).trim();
        }
        // Fallback for old structure
        const oldFaqStart = body.indexOf('<h3>Frequently Asked Questions</h3>');
        if (faqStart === -1 && oldFaqStart !== -1) {
            body = body.substring(0, oldFaqStart).trim();
        }

        // 3. Related Links
        // Pattern: <li><a href="..."><span class="list-category">...</span> Title</a></li>
        const related = [];
        const relRegex = /<li><a href="(.*?)"><span class="list-category">.*?<\/span>\s*([\s\S]*?)<\/a><\/li>/g;
        let m;
        while ((m = relRegex.exec(content)) !== null) {
            related.push({ link: m[1], title: m[2].trim() });
        }

        // 4. FAQs
        // Pattern: <p class="faq-question">Question</p><p class="faq-answer">Answer</p>
        const faqs = [];
        // Support new "Perfect" structure first
        const faqRegex = /<p class="faq-question">(.*?)<\/p>\s*<p class="faq-answer">([\s\S]*?)<\/p>/g;
        // Fallback for old DL structure? (Optional, but strict regex might miss)

        while ((m = faqRegex.exec(content)) !== null) {
            faqs.push({ q: m[1], a: m[2] });
        }

        // 5. Breadcrumb Parent & Category
        const breadMatch = content.match(/<span class="current">(.*?)<\/span>/);
        const breadcrumb_parent = breadMatch ? breadMatch[1] : 'News';

        const catMatch = content.match(/<span class="category">(.*?)<\/span>/);
        const category = catMatch ? catMatch[1] : breadcrumb_parent;

        const response = {
            title: getOg('og:title').split(' — ')[0],
            category: category,
            author: getMeta('author'),
            date: '', // We will fill this from JSON match below if possible
            body,
            key_takeaways,
            meta_desc: getMeta('description'),
            meta_keywords: getMeta('keywords'),
            og_image: getOg('og:image'),
            image_url: getOg('og:image'),
            related,
            faqs,
            breadcrumb_parent
        };

        // Enrich with data from news.json (Summary, Date, exact title) if found
        const jsonPath = path.join(__dirname, '../data/news.json');
        const newsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        console.log(`Loading article: ${filename}`);

        // Flatten all lists to search
        const allItems = [...newsData.hero_slides, ...newsData.latest_updates, ...newsData.analysis_grid];
        // Clean link matcher
        const clean = (l) => l ? l.replace(/^\.?\/?/, '') : '';

        // Stricter matching: must match exact filename at end of path
        const match = allItems.find(i => {
            const l = clean(i.link);
            return l === `articles/news/${filename}` || l.endsWith(`/${filename}`);
        });

        if (match) {
            response.summary = match.summary || '';
            response.date = match.date || match.time || '';
            // response.title = match.title; // Optional: Override HTML title with JSON title? Keep HTML for now.
        }

        res.json(response);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. POST /publish
app.post('/publish', (req, res) => {
    try {
        const data = req.body;
        console.log("Publishing Request:", data.title || "Manual Update");

        if (data.triggerOnly) {
            triggerSEOUpdate("manual-trigger");
            return res.json({ success: true, message: "SEO Update Triggered" });
        }


        // A. Helpers
        const slug = data.title.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
        const filename = `${slug}.html`;
        const relativePath = `articles/news/${filename}`;
        const absolutePath = path.join(__dirname, '../articles/news', filename);

        const dateStr = data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        // B. Component Generation

        // 1. Breadcrumbs
        // Home / News / [Category]
        const breadcrumbHtml = `
            <nav class="breadcrumb">
                <a href="../../index.html">Home</a>
                <span class="separator">/</span>
                <a href="../../index.html#news">News</a>
                <span class="separator">/</span>
                <span class="current">${data.breadcrumb_parent || data.category}</span>
            </nav>
        `;

        // 2. Related Articles
        // If user didn't fill them, provide defaults (or keep placeholder? no, default to blank or generic)
        let relatedHtml = '';
        const links = [
            { t: data.rel_1_title, u: data.rel_1_link },
            { t: data.rel_2_title, u: data.rel_2_link },
            { t: data.rel_3_title, u: data.rel_3_link }
        ];

        links.forEach(l => {
            if (l.t && l.u) {
                relatedHtml += `<li><a href="${l.u}"><span class="list-category">Related</span> ${l.t}</a></li>\n`;
            }
        });
        // Fallback if empty
        if (!relatedHtml) {
            relatedHtml = `<li><a href="../../index.html"><span class="list-category">Home</span> Return to Home</a></li>`;
        }

        // 3. FAQ Generation
        let faqHtml = '';
        let faqSchema = '';
        if (data.faqs && data.faqs.length > 0) {
            // HTML
            // HTML
            faqHtml += `<section class="faq-section"><h3>Frequently Asked Questions</h3>`;
            data.faqs.forEach(f => {
                faqHtml += `<div class="faq-item">
                    <p class="faq-question">${f.q}</p>
                    <p class="faq-answer">${f.a}</p>
                </div>`;
            });
            faqHtml += `</section>`;

            // Schema
            const schemaObj = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": data.faqs.map(f => ({
                    "@type": "Question",
                    "name": f.q,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f.a
                    }
                }))
            };
            faqSchema = `<script type="application/ld+json">${JSON.stringify(schemaObj, null, 2)}</script>`;
        }

        // C. Template Injection
        let template = fs.readFileSync(path.join(__dirname, '../article-template.html'), 'utf-8');

        let newContent = template
            // Metadata
            .replace('Article Title — PickAI', `${data.title} — PickAI`)
            .replace('Brief summary of the article for SEO.', data.meta_desc || data.summary) // Meta Desc
            .replace('content="Brief summary of the article for SEO."', `content="${data.meta_desc || data.summary}"`) // OG Desc too
            .replace('Category Name', data.category)
            .replace('Your Article Title Goes Here', data.title)
            .replace('Oct 24, 2026', dateStr)

            // New Hooks
            .replace('{{META_KEYWORDS}}', data.meta_keywords || '')
            .replace('{{OG_IMAGE}}', data.og_image || data.image_url)
            .replace('{{BREADCRUMB_HTML}}', breadcrumbHtml)
            .replace('{{RELATED_ARTICLES_HTML}}', relatedHtml)
            .replace('{{FAQ_SCHEMA}}', faqSchema)

            // Images
            .replace('https://picsum.photos/seed/chip/1200/675', data.image_url);

        // Body Construction
        let finalBody = data.body;

        // Inject Key Takeaways if present (after first paragraph or at top)
        if (data.key_takeaways) {
            const takeawaysHtml = `
                <div class="key-takeaways">
                    ${data.key_takeaways}
                </div>`;

            // Try to insert after first paragraph for flow
            const firstP = finalBody.indexOf('</p>');
            if (firstP !== -1) {
                finalBody = finalBody.slice(0, firstP + 4) + takeawaysHtml + finalBody.slice(firstP + 4);
            } else {
                finalBody = takeawaysHtml + finalBody;
            }
        }

        // Append FAQ
        finalBody += `\n${faqHtml}`;

        if (newContent.includes('{{ARTICLE_BODY}}')) {
            newContent = newContent.replace('{{ARTICLE_BODY}}', finalBody);
        } else {
            newContent = newContent.replace('<p>This is the placeholder text. The CMS will replace this block.</p>', finalBody);
        }

        // D. Save Files
        fs.writeFileSync(absolutePath, newContent);

        // E. Update JSON
        const jsonPath = path.join(__dirname, '../data/news.json');
        const newsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        const newEntry = {
            title: data.title,
            summary: data.summary,
            link: `articles/news/${filename}`,
            image_url: data.image_url,
            category: data.category,
            author: data.author,
            date: "Just Now"
        };

        // Helper to upsert (update or insert)
        const upsert = (arr, entry) => {
            const index = arr.findIndex(x => x.link === entry.link);
            if (index !== -1) {
                // Update existing, preserving ID if present
                arr[index] = { ...arr[index], ...entry, id: arr[index].id }; // ID preservation key
            } else {
                // Insert new at start
                arr.unshift({ ...entry, id: Date.now() });
            }
        };

        if (data.isHeroSlide) upsert(newsData.hero_slides, newEntry);

        // Latest Updates uses a slightly different structure (time field)
        const latestEntry = {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + " GMT",
            title: data.title,
            link: newEntry.link,
            image_url: newEntry.image_url
        };

        // Special upsert for Latest Updates
        const latestIndex = newsData.latest_updates.findIndex(x => x.link === latestEntry.link);
        if (data.isLatest) {
            if (latestIndex !== -1) {
                newsData.latest_updates[latestIndex] = latestEntry;
            } else {
                newsData.latest_updates.unshift(latestEntry);
            }
        }

        if (data.isAnalysis) {
            upsert(newsData.analysis_grid, newEntry);
            if (newsData.analysis_grid.length > 20) newsData.analysis_grid.pop();
        }

        if (data.isOpinion) {
            upsert(newsData.opinion_grid, newEntry);
            if (newsData.opinion_grid.length > 10) newsData.opinion_grid.pop();
        }

        if (data.isExplainer) {
            upsert(newsData.explainers_grid, newEntry);
            if (newsData.explainers_grid.length > 10) newsData.explainers_grid.pop();
        }

        fs.writeFileSync(jsonPath, JSON.stringify(newsData, null, 4));

        // F. Trigger SEO & IndexNow
        triggerSEOUpdate(newEntry.link);

        res.json({ success: true, path: relativePath });


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`CMS Server running at http://localhost:${PORT}`);
});

function triggerSEOUpdate(newLink) {
    const { exec } = require('child_process');
    const pythonCmd = process.platform === "win32" ? "py" : "python3";
    const scriptPath = path.join(__dirname, '../scripts/generate_seo.py');

    console.log(`Triggering SEO Update: ${pythonCmd} ${scriptPath}`);

    exec(`${pythonCmd} "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`SEO Script Error: ${error.message}`);
            return;
        }
        console.log(`SEO Script Output: ${stdout}`);
        if (stderr) console.error(`SEO Script Stderr: ${stderr}`);
    });
}

