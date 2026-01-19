// Google Analytics 4 + Consent Mode v2 Setup

// 1. Initialize dataLayer
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// 2. Check for stored consent (from consent.js)
// If technically they accepted before, we set default to 'granted' to avoid data gaps.
// If never accepted, default is 'denied'.
const consentKey = "pickai_consent_accepted";
const hasConsent = localStorage.getItem(consentKey) === "true";
const defaultState = hasConsent ? 'granted' : 'denied';

// 3. Set Consent Defaults (Must be done before config)
gtag('consent', 'default', {
    'ad_storage': defaultState,
    'ad_user_data': defaultState,
    'ad_personalization': defaultState,
    'analytics_storage': defaultState,
    'wait_for_update': 500 // Give 500ms for update signals if needed
});

// 4. Load Google Tag Library dynamically
const script = document.createElement('script');
script.async = true;
script.src = "https://www.googletagmanager.com/gtag/js?id=G-CC4NJZX4QC";
document.head.appendChild(script);

// 5. Initialize Config
gtag('js', new Date());
gtag('config', 'G-CC4NJZX4QC');

// Export gtag for use in other scripts if needed (it's global anyway)
window.gtag = gtag;
