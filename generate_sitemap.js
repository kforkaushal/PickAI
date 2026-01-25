const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://pickai.netlify.app';
const TODAY = new Date().toISOString().split('T')[0];

const staticPages = [
    '',
    'tools/index.html',
    'research.html',
    'opinion.html',
    'explainers.html',
    'about.html',
    'contact.html',
    'privacy.html',
    'editorial-policy.html'
];

function getFiles(dir) {
    const files = fs.readdirSync(dir);
    return files.filter(file => file.endsWith('.html')).map(file => path.join(dir, file));
}

const newsFiles = getFiles(path.join(__dirname, 'articles/news'));

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

// 1. Static Pages
staticPages.forEach(page => {
    // Clean URL logic: index.html -> /
    let urlPath = page;
    if (page === '') urlPath = '';
    else if (page.endsWith('index.html')) urlPath = page.replace('index.html', '');

    // Priority logic
    let priority = '0.8';
    if (page === '') priority = '1.0';
    if (page.includes('tools')) priority = '0.9';

    xml += `
    <url>
        <loc>${DOMAIN}/${urlPath}</loc>
        <lastmod>${TODAY}</lastmod>
        <priority>${priority}</priority>
    </url>`;
});

// 2. News Articles
newsFiles.forEach(file => {
    const filename = path.basename(file);
    const urlPath = `articles/news/${filename}`;

    xml += `
    <url>
        <loc>${DOMAIN}/${urlPath}</loc>
        <lastmod>${TODAY}</lastmod>
        <priority>0.7</priority>
    </url>`;
});

xml += `
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml.trim());
console.log(`Generated sitemap with ${staticPages.length + newsFiles.length} URLs.`);
