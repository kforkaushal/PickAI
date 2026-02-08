
/**
 * PickAI Astrology Hub - Dynamic Header Logic
 * Handles daily updates for Date, Moon Phase, and Cosmic Theme.
 */

document.addEventListener('DOMContentLoaded', () => {
    updateCosmicHeader();
});

function updateCosmicHeader() {
    const today = new Date();

    // 1. Update Date Display
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateStr = today.toLocaleDateString('en-US', dateOptions);

    const dateEl = document.querySelector('.today-date');
    if (dateEl) dateEl.textContent = dateStr;

    // 2. Update Moon Phase
    const phase = getMoonPhase(today);
    const moonTextEl = document.querySelector('.moon-phase span');
    if (moonTextEl) moonTextEl.textContent = phase;

    // 3. Update Daily Theme
    const theme = getDailyTheme(today);
    const themeTitleEl = document.querySelector('.cosmic-theme-title');
    const themeDescEl = document.querySelector('.cosmic-hero p');

    if (themeTitleEl) themeTitleEl.textContent = theme.title;
    if (themeDescEl) themeDescEl.textContent = theme.desc;
}

/**
 * Calculates simplified moon phase.
 * Base New Moon: January 11, 2024 (approximate reference)
 * Synodic Month: 29.53059 days
 */
function getMoonPhase(date) {
    const newMoonRef = new Date('2024-01-11T11:57:00'); // Known New Moon
    const diffTime = date.getTime() - newMoonRef.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const cycle = 29.53059;
    const currentCycle = diffDays % cycle;

    // 8 Phases
    // 0 - 1: New Moon
    // 1 - 7: Waxing Crescent
    // 7 - 8: First Quarter
    // 8 - 14: Waxing Gibbous
    // 14 - 15: Full Moon
    // 15 - 21: Waning Gibbous
    // 21 - 22: Last Quarter
    // 22 - 29.5: Waning Crescent

    if (currentCycle < 1) return "New Moon";
    if (currentCycle < 7) return "Waxing Crescent";
    if (currentCycle < 8.5) return "First Quarter";
    if (currentCycle < 14) return "Waxing Gibbous";
    if (currentCycle < 15.5) return "Full Moon";
    if (currentCycle < 21) return "Waning Gibbous";
    if (currentCycle < 22.5) return "Last Quarter";
    return "Waning Crescent";
}

/**
 * Returns a deterministic theme based on Day of Year.
 */
function getDailyTheme(date) {
    const themes = [
        {
            title: "Precision in Motion",
            desc: "The alignment of Mercury and Saturn brings a rare clarity to complex problems. It's a day for strategic planning and executing long-awaited decisions."
        },
        {
            title: "Emotional Resilience",
            desc: "The Moon enters a stable phase, grounding volatile emotions. Focus on nurturing personal connections and finding strength in vulnerability."
        },
        {
            title: "Creative Spark",
            desc: "Venus trines Mars, igniting a fire of creativity and passion. Perfect for starting new artistic projects or rekindling lost inspirations."
        },
        {
            title: "Bold Action",
            desc: "Mars takes center stage, demanding courage and decisiveness. Hesitation is the enemy today—take the leap you've been considering."
        },
        {
            title: "Deep Reflection",
            desc: "A quiet cosmic energy invites introspection. Look inward to find the answers you've been seeking in the external world."
        },
        {
            title: "Social Harmony",
            desc: "The stars align to smooth over conflicts. It's an ideal time for diplomacy, negotiation, and reconnecting with old friends."
        },
        {
            title: "Hidden Truths",
            desc: "Pluto's influence reveals what was previously concealed. Trust your intuition and look beneath the surface of interactions."
        },
        {
            title: "Financial Focus",
            desc: "Practical energy dominates. Review your resources and plan for stability; small investments now will yield long-term results."
        },
        {
            title: "Boundless Energy",
            desc: "The Sun boosts vitality and confidence. Tackle your most challenging tasks today while your stamina is high."
        },
        {
            title: "Healing Vibes",
            desc: "Chiron activates soothing energies. A powerful day for physical recovery, forgiveness, and letting go of past grievances."
        },
        {
            title: "Intellectual Peak",
            desc: "Mercury is at its strongest. Communication flows effortlessly, making this the perfect day for writing, speaking, and learning."
        },
        {
            title: "Spiritual Growth",
            desc: "Neptune opens the door to higher consciousness. Meditation and dream work will be especially profound and revealing today."
        },
        {
            title: "Structural Shift",
            desc: "Saturn challenges the status quo. Be ready to adapt as old foundations display cracks, making way for stronger improvements."
        },
        {
            title: "Unexpected Joy",
            desc: "Uranus brings pleasant surprises. Stay open to spontaneity—the best moments today will be the ones you didn't plan for."
        }
    ];

    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return themes[dayOfYear % themes.length];
}
