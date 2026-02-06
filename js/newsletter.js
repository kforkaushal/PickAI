// PickAI Newsletter System - Netlify Forms AJAX Handler
const SUCCESS_MODAL_HTML = `
<div class="newsletter-modal-overlay" id="newsletter-success-modal">
    <div class="newsletter-modal-content">
        <button class="modal-close-btn" id="modal-close-btn">&times;</button>
        <div class="modal-icon">&#10003;</div>
        <h3>Thank you!</h3>
        <p>Your subscription has been confirmed.</p>
        <button class="modal-action-btn" id="modal-action-btn">Back to reading</button>
    </div>
</div>
`;

function showSuccessModal() {
    // Check if modal already exists
    let modal = document.getElementById('newsletter-success-modal');
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', SUCCESS_MODAL_HTML);
        modal = document.getElementById('newsletter-success-modal');

        // Attach events
        const closeBtn = document.getElementById('modal-close-btn');
        const actionBtn = document.getElementById('modal-action-btn');

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300); // Remove after animation
        };

        closeBtn.addEventListener('click', closeModal);
        actionBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Small delay to allow DOM render before adding active class (for animation)
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

const handleNewsletterSubmit = async (form) => {
    const btn = form.querySelector('button');
    const feedback = form.parentElement.querySelector('.newsletter-feedback') || form.querySelector('.newsletter-feedback');
    const OriginalBtnText = btn ? btn.textContent : 'Subscribe';

    if (btn) btn.textContent = 'Joining...';

    try {
        const formData = new FormData(form);
        const body = new URLSearchParams(formData).toString();

        const response = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body,
        });

        if (response.ok) {
            // Success
            showSuccessModal();
            form.reset();
            if (feedback) feedback.style.display = 'none'; // Hide any previous errors
        } else {
            throw new Error(`Submission failed: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Newsletter Error:", error);
        if (feedback) {
            feedback.textContent = "Something went wrong. Please try again.";
            feedback.className = "newsletter-feedback error";
            feedback.style.display = "block";
        }
    } finally {
        if (btn) btn.textContent = OriginalBtnText;
    }
};

// Event Delegation
document.addEventListener('submit', (e) => {
    if (e.target && e.target.classList.contains('newsletter-form')) {
        e.preventDefault();
        handleNewsletterSubmit(e.target);
    }
});
