# PickAI — Premium AI News & Insights Platform

**PickAI** is a comprehensive news and information platform covering AI technology, financial markets, astrology, and sports. Built with modern web technologies, it delivers real-time data, engaging content, and a premium user experience.

🌐 **Live Site**: [pickai.netlify.app](https://pickai.netlify.app/)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Content Management](#content-management)
- [Analytics & Monetization](#analytics--monetization)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🤖 AI News & Analysis
- **Breaking News**: Hero section with auto-rotating news slider
- **Category Browsing**: Organized by AI Models, Policy & Ethics, Industry, and Guides
- **Deep Dive Articles**: Long-form analysis and opinion pieces
- **Daily Stories**: Full-screen story carousel for quick updates
- **Search Functionality**: Fast, client-side search across all content

### 💰 Financial Pulse
- **Live Commodity Prices**: Real-time Gold, Silver, and Copper rates across Indian cities
- **Forex Terminal**: Live USD/INR exchange rates with institutional data
- **Market Ticker**: Scrolling ticker with live market updates
- **Financial News**: Curated articles on market trends and analysis

### 🌟 Astrology Hub
- **Daily Horoscopes**: Personalized readings for all 12 zodiac signs
- **Cosmic Outlook**: Theme of the day based on celestial events
- **Moon Phase Tracking**: Current lunar phase with visual indicators

### 🏏 Sports Coverage
- **T20 World Cup 2026**: Comprehensive coverage including:
  - Live match schedules
  - Team statistics and leaderboards
  - Match analysis and articles
  - Interactive data visualizations

### 📰 Content Features
- **Newsletter Subscription**: Netlify-integrated email collection
- **Daily Polls**: Interactive polls with real-time results
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **SEO Optimized**: Structured data, meta tags, and sitemap for search engines
- **Progressive Loading**: Skeleton screens for improved perceived performance

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup and accessibility
- **CSS3** - Custom design system with CSS variables
- **Vanilla JavaScript** - Zero framework dependencies
- **Google Fonts** - Custom typography (Inter, Playfair Display, Merriweather)

### Backend & APIs
- **Express.js** - Node.js server for API endpoints (optional)
- **Supabase** - Authentication and database (for admin features)
- **External APIs**:
  - Financial data APIs for commodity prices
  - Custom T20 cricket stats API

### Services & Tools
- **Netlify** - Hosting and continuous deployment
- **Google Analytics 4** - User analytics with consent mode
- **Google AdSense** - Advertisement management
- **Google Reader Revenue Manager** - Premium content subscriptions
- **OneSignal** - Push notification service

### Development Tools
- **PowerShell Scripts** - Batch processing and automation
- **Python Scripts** - Sitemap generation and content management

---

## 📁 Project Structure

```
PickAI/
│
├── articles/               # News articles
│   ├── index.html         # Article hub
│   └── news/              # Individual article pages (45+ articles)
│
├── Sports/                # T20 World Cup coverage
│   ├── T20-World-Cup.html
│   ├── india-usa-t20-wc-2026.html
│   └── *.ps1              # PowerShell automation scripts
│
├── Financial/             # Financial market pages
│   ├── gold-price.html
│   ├── silver-price.html
│   └── copper-price.html
│
├── tools/                 # AI tools directory
│   └── index.html
│
├── css/                   # Stylesheets
│   ├── astrology.css
│   ├── stories.css
│   ├── newsletter.css
│   ├── skeleton.css
│   └── currency-card.css
│
├── js/                    # JavaScript modules
│   ├── app.js             # Main application logic
│   ├── search.js          # Search functionality
│   ├── accordion.js       # Category accordion
│   ├── astrology.js       # Horoscope features
│   ├── stories.js         # Story carousel
│   ├── newsletter.js      # Newsletter subscription
│   ├── gold-price.js      # Gold price updates
│   ├── silver-price.js    # Silver price updates
│   ├── copper-price.js    # Copper price updates
│   ├── crypto-news.js     # Financial news loading
│   ├── t20-api.js         # T20 cricket data
│   ├── poll.js            # Daily poll system
│   ├── tools.js           # AI tools directory
│   ├── hamburger.js       # Mobile menu
│   └── analytics-setup.js # GA4 setup
│
├── data/                  # JSON data files
│   ├── news.json          # News article metadata
│   └── tools.json         # AI tools directory
│
├── assets/                # Images and media
│   └── *.png, *.jpg
│
├── scripts/               # Automation scripts
│   └── update_sitemap.py  # Sitemap generator
│
├── cms/                   # Content management system
│
├── netlify/               # Netlify functions
│
├── index.html             # Homepage
├── style.css              # Main stylesheet
├── about.html             # About page
├── contact.html           # Contact page
├── privacy.html           # Privacy policy
├── editorial-policy.html  # Editorial policy
├── sitemap.xml            # SEO sitemap
├── rss.xml                # RSS feed
├── robots.txt             # Search crawler rules
├── ads.txt                # AdSense verification
├── netlify.toml           # Netlify configuration
└── package.json           # Node dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher) - For running local development server
- **Git** - Version control
- **Code Editor** - VS Code, Sublime Text, etc.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mraaglave/TakeAI.git
   cd PickAI
   ```

2. **Install dependencies** (optional, for backend features)
   ```bash
   npm install
   ```

3. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     npx http-server -p 8000
     ```
   - Navigate to `http://localhost:8000`

---

## 💻 Development

### Running Locally

The site is built with vanilla HTML/CSS/JS and can run without a build process:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

### Data Management

#### News Articles
Edit `data/news.json` to add/update articles:

```json
{
  "title": "Article Title",
  "url": "articles/news/article-slug.html",
  "summary": "Brief description",
  "category": "models",
  "subcategory": "Analysis",
  "date": "2026-02-09",
  "image": "assets/thumbnail.jpg"
}
```

#### AI Tools
Edit `data/tools.json` to manage the tools directory.

### Automation Scripts

#### Update Sitemap
```bash
python scripts/update_sitemap.py
```

#### Batch Transform HTML (PowerShell)
```powershell
.\Sports\batch_transform.ps1
```

### Styling

The site uses a custom design system with CSS variables defined in `style.css`:

```css
:root {
  --color-primary: #1a1a2e;
  --color-accent: #e94560;
  --color-text: #333333;
  --spacing-unit: 8px;
}
```

---

## 🌐 Deployment

### Netlify (Current Hosting)

The site is configured for automatic deployment via Netlify:

1. **Connect Repository**: Link your GitHub repo to Netlify
2. **Build Settings**: 
   - Build command: (none, static site)
   - Publish directory: `/`
3. **Deploy**: Push to `main` branch triggers automatic deployment

### Environment Variables

For features requiring API keys, set these in Netlify dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- Other API keys as needed

### Custom Domain

Configure in `netlify.toml` and Netlify DNS settings.

---

## 📝 Content Management

### Adding a New Article

1. **Create HTML file** in `articles/news/`
   - Use `article-template.html` as a starting point
   
2. **Add metadata** to `data/news.json`
   
3. **Generate thumbnail** (use image generation tools or place in `assets/`)

4. **Update sitemap**
   ```bash
   python scripts/update_sitemap.py
   ```

5. **Update RSS feed** (`rss.xml`) if needed

### Writing Style Guidelines

- Follow the editorial policy defined in `editorial-policy.html`
- Use semantic HTML for accessibility
- Include proper meta tags for SEO
- Add structured data (JSON-LD) for rich snippets

---

## 📊 Analytics & Monetization

### Google Analytics 4
- Configured with consent mode
- Custom events tracked via `js/analytics-setup.js`

### Google AdSense
- Ad units configured in HTML
- Ad blocker recovery enabled
- `ads.txt` verification included

### Newsletter
- Netlify Forms integration
- Subscriber data collected via form submissions

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style and structure
- Test all changes across devices and browsers
- Update documentation for new features
- Ensure SEO best practices are maintained

---

## 📄 License

© 2026 PickAI Media. All rights reserved.

---

## 📧 Contact

- **Website**: [pickai.netlify.app](https://pickai.netlify.app/)
- **Email**: Contact form at [pickai.netlify.app/contact.html](https://pickai.netlify.app/contact.html)
- **GitHub**: [github.com/mraaglave/TakeAI](https://github.com/mraaglave/TakeAI)

---

## 🎯 Roadmap

- [ ] Implement user authentication system
- [ ] Add article commenting functionality
- [ ] Create mobile app version
- [ ] Expand sports coverage to more leagues
- [ ] Add cryptocurrency price tracking
- [ ] Implement personalized content recommendations
- [ ] Multi-language support

---

**Built with ❤️ for the AI community**
