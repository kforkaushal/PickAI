# Product Requirements Document (PRD): PickAI

## 1. Executive Summary
**PickAI** is a premium digital news and insights platform designed to bridge the gap between complex AI technology and everyday information needs. It aggregates real-time data across AI, finance, astrology, and sports to provide a singular, high-quality hub for the modern information consumer.

---

## 2. Product Purpose & Vision
### Vision Statement
To become the definitive authority on AI news and multi-domain insights, delivering premium, human-verified content through a high-performance, minimalist interface.

### Goals
- Provide deep-dive technical analysis on AI research and industry shifts.
- Deliver real-time financial data (gold, silver, forex) for the Indian market.
- Maintain a high-engagement user experience with interactive features like daily polls and stories.
- Achieve lightning-fast load times through a framework-less (vanilla JS) architecture.

---

## 3. Target Audience & User Personas
1. **AI Enthusiasts & Researchers**: Individual looking for technical depth, arXiv paper breakdowns, and policy analysis.
2. **Retail Investors**: Users tracking commodity prices (Gold/Silver) and forex rates for financial decision-making.
3. **General Information Consumers**: Users interested in astrology, sports (T20 World Cup), and curated news summaries.

---

## 4. Functional Requirements

### 4.1 AI News & Analysis Hub
- **Dynamic News Feed**: Auto-rotating hero slider for breaking news.
- **Categorization**: Multi-tier organization (Models, Policy, Industry, Guides).
- **Research Journal**: Dedicated section for academic paper analysis.
- **Story Carousel**: Full-screen "story" format for rapid consumption on mobile.

### 4.2 Financial Pulse (Real-time)
- **Commodity Tracker**: Live Gold, Silver, and Copper prices across major Indian cities.
- **Forex Dashboard**: Live USD/INR institutional data.
- **Market News**: Integration of financial news and analysis articles.

### 4.3 Interactive Features
- **Daily Polls**: Interactive polls with real-time result visualization.
- **Client-side Search**: Instant search across all articles and resources.
- **Newsletter**: Robust subscription system for daily news digests.

### 4.4 Astrology & Sports
- **Zodiac Engine**: Daily horoscopes and cosmic outlooks.
- **Cricket Terminal**: Comprehensive T20 World Cup 2026 coverage (stats, analysis, schedules).

---

## 5. Technical Requirements & Constraints

### 5.1 Architecture
- **Frontend**: Framework-less (Vanilla HTML/CSS/JS) for maximum SEO and performance.
- **CSS**: Custom-built design system using CSS variables.
- **Interactivity**: Event-delegation based JS for scalability.

### 5.2 Backend & Services
- **Database**: Supabase for admin features and potential future user modularity.
- **Hosting**: Netlify with optimized `netlify.toml` configuration.
- **Analytics**: GA4 with consent mode and custom event tracking.
- **Notifications**: OneSignal integration for push updates.

---

## 6. User Experience (UX) & Design Principles
- **Minimalism**: Focus on content readability with clean typography (Inter, Merriweather).
- **Glassmorphism**: Subtle UI elements for a premium, modern feel.
- **Speed**: Use of skeleton screens and progressive loading to reduce perceived latency.
- **Accessibility**: Semantic HTML and ARIA labels.

---

## 7. SEO & Growth Strategy
- **Sitemap/RSS**: Automated generation via Python/PowerShell scripts.
- **Structured Data**: Deep integration of JSON-LD for Articles, Organizations, and Tools.
- **Monetization**:
  - Google AdSense for display revenue.
  - Reader Revenue Manager for premium content.
- **Content Marketing**: Pinterest-optimized RSS feeds for social traffic.

---

## 8. Roadmap & Future Enhancements
- **User Authentication**: Personalized profiles and saved articles.
- **Community**: Commenting and discussion forums.
- **Mobile App**: PWA conversion or native mobile versions.
- **Expansion**: Multi-language support and broader crypto tracking.
