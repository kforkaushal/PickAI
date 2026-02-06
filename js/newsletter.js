/**
 * PickAI Newsletter System (Clean Rewrite)
 * Uses Event Delegation to handle all newsletter forms on the site.
 */

const SUPABASE_URL = 'https://vurerooapkkvqjzbixjx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cmVyb29hcGtrdnFqemJpeGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAwODQsImV4cCI6MjA4MzgwNjA4NH0.ryY3YxIs4z4kDHzUY3BNdtUbXHP_ub1yMRjpwJkiW48';

let client = null;

// 1. Initialize Supabase
function initClient() {
    if (window.supabase) {
        try {
            const { createClient } = window.supabase;
            client = createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("PickAI: Supabase connected.");
        } catch (err) {
            console.error("PickAI: Supabase init failed", err);
        }
    } else {
        console.warn("PickAI: Supabase SDK not found.");
    }
}

// 2. Main Submission Handler
async function handleNewsletterSubmit(form) {
    const emailInput = form.querySelector('input[type="email"]');
    // Feedback is likely a sibling, not a child. Check parent.
    let feedback = form.querySelector('.newsletter-feedback');
    if (!feedback) {
        feedback = form.parentElement.querySelector('.newsletter-feedback');
    }
    const btn = form.querySelector('button');

    if (!emailInput) return; // Not a valid form

    // -- Validation --
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
        updateFeedback(feedback, 'Please enter a valid email.', 'error');
        return;
    }

    // -- Checking System --
    if (!client) {
        // Try init one more time just in case script loaded late
        initClient();
        if (!client) {
            updateFeedback(feedback, 'System unavailable. Please reload.', 'error');
            return;
        }
    }

    // -- UI Loading --
    const btnOriginal = btn ? btn.textContent : 'Subscribe';
    if (btn) btn.textContent = '...';
    updateFeedback(feedback, 'Joining...', 'processing');

    try {
        // -- API Call --
        const { error } = await client
            .from('subscribers')
            .insert([{ email: email }]);

        if (error) {
            // Unique Index Violation (Code 23505)
            if (error.code === '23505') {
                updateFeedback(feedback, 'You are already subscribed!', 'error');
            } else {
                console.error("Supabase Error:", error);
                updateFeedback(feedback, 'Error: ' + error.message, 'error');
            }
        } else {
            // -- Success --
            updateFeedback(feedback, 'Thank you for subscribing!', 'success');
            form.reset();
        }

    } catch (err) {
        console.error("Network Error:", err);
        updateFeedback(feedback, 'Network error. Try again.', 'error');
    } finally {
        if (btn) btn.textContent = btnOriginal;

        // Clear success message after delay
        if (feedback && feedback.classList.contains('success')) {
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
        }
    }
}

// Helper: Update UI text
function updateFeedback(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = `newsletter-feedback ${type}`;
    el.style.display = 'block';
}

// 3. Event Delegation (The Magic)
// 3. Event Delegation (The Magic) - DISABLED FOR NETLIFY FORMS
/*
document.addEventListener('submit', (e) => {
    // Check if the submitted element is a newsletter form
    if (e.target && e.target.classList.contains('newsletter-form')) {
        e.preventDefault(); // STOP standard submit
        e.stopPropagation(); // Stop bubbling
        handleNewsletterSubmit(e.target);
    }
});
*/

// 4. Initialize on Logic Load
initClient();
// Also listen for button clicks to ensure focus? Not needed for submit.
