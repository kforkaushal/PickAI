document.addEventListener("DOMContentLoaded", function () {
    const consentKey = "pickai_consent_accepted";

    // 1. Check if consent is already given
    if (localStorage.getItem(consentKey)) {
        return; // Stop if already accepted
    }

    // 2. Create the banner HTML structure
    const banner = document.createElement("div");
    banner.id = "consent-banner";
    banner.className = "consent-banner";
    banner.innerHTML = `
        <div class="consent-content">
            <p>
                We use cookies to improve your experience and analyze site traffic. 
                By continuing to use our site, you agree to our <a href="/privacy.html">Privacy Policy</a>.
            </p>
            <div class="consent-actions">
                <button id="consent-accept" class="consent-btn btn-primary">Accept</button>
                <button id="consent-close" class="consent-btn btn-secondary">Close</button>
            </div>
        </div>
    `;

    // 3. Append to body
    document.body.appendChild(banner);

    // 4. Add Event Listeners
    document.getElementById("consent-accept").addEventListener("click", function () {
        localStorage.setItem(consentKey, "true");
        banner.classList.add("hidden");

        // Consent Mode v2: Update to Granted
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        }
    });

    document.getElementById("consent-close").addEventListener("click", function () {
        // Just close for the session or set a temporary dismissal? 
        // For "Close", we usually treat it as a "Notice seen", but maybe not "Consent granted".
        // To be less annoying, we'll mark it as accepted or use a session cookie.
        // For simplicity in this request, we'll hide it.
        banner.classList.add("hidden");
    });
});
