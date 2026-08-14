/**
 * RainX - Ultra-Smooth Kinetic Intro & Zoom-Out Transition Controller
 * Transforms full-screen intro viewport into the exact Hero Portfolio card
 * Hydration-safe implementation (isolates overlay from React root tree)
 */
(function() {
  'use strict';

  // Only run on homepage
  const pathname = window.location.pathname;
  if (pathname !== '/' && pathname !== '/index.html' && pathname !== '') {
    return;
  }

  // Prevent multiple executions
  if (window.__rainx_intro_initialized) return;
  window.__rainx_intro_initialized = true;

  function runIntroAnimation() {
    const targetCard = document.querySelector('.border-cobalt.bg-cobalt') || 
                       document.querySelector('main section:first-of-type > div > div:nth-child(2)');

    if (!targetCard) {
      return;
    }

    // Create full-screen intro overlay
    const overlay = document.createElement('div');
    overlay.id = 'rainx-intro-overlay';
    overlay.className = 'rainx-intro-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    // Create letter-by-letter HTML for smooth kinetic liquid wave animation
    const portLetters = ['P', 'O', 'R', 'T']
      .map((l, i) => `<span class="rainx-letter" style="--char-idx: ${i};">${l}</span>`)
      .join('');
    
    const folioLetters = ['F', 'O', 'L', 'I', 'O']
      .map((l, i) => `<span class="rainx-letter" style="--char-idx: ${i + 4};">${l}</span>`)
      .join('');

    overlay.innerHTML = `
      <div class="rainx-intro-inner">
        <!-- Top Guideline -->
        <div class="rainx-intro-line rainx-intro-line-top"></div>

        <!-- Top Right Arrow Icon -->
        <div class="rainx-intro-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-right">
            <path d="m7 7 10 10"></path>
            <path d="M17 7v10H7"></path>
          </svg>
        </div>

        <!-- Center Kinetic Typography -->
        <div class="rainx-intro-center">
          <div class="rainx-intro-title -skew-y-3" id="intro-title">
            <span class="rainx-intro-word rainx-word-port" id="intro-port">${portLetters}</span>
            <span class="rainx-intro-word rainx-word-folio" id="intro-folio">${folioLetters}</span>
          </div>
        </div>

        <!-- Bottom Guideline -->
        <div class="rainx-intro-line rainx-intro-line-bottom"></div>

        <!-- Bottom Metadata Row -->
        <div class="rainx-intro-bottom">
          <div class="rainx-intro-year" id="intro-year">
            <div class="rainx-odometer-wheel">
              <span class="rainx-odometer-num">0000</span>
              <span class="rainx-odometer-num">1984</span>
              <span class="rainx-odometer-num">2001</span>
              <span class="rainx-odometer-num">2024</span>
              <span class="rainx-odometer-num">2025</span>
              <span class="rainx-odometer-num is-current">2026</span>
            </div>
          </div>
          <div class="rainx-intro-desc">
            <span class="rainx-intro-tagline" id="intro-tagline">Full-stack software, AI agents, cloud systems.</span>
          </div>
        </div>

        <!-- Skip / Click anywhere hint -->
        <button type="button" class="rainx-intro-skip" id="rainx-skip-btn" aria-label="Skip Intro">
          Skip ✕
        </button>
      </div>
    `;

    // Attach to documentElement so React body hydration tree remains 100% untouched
    document.documentElement.appendChild(overlay);
    document.documentElement.classList.add('rainx-intro-active');

    let hasTransitioned = false;

    function executeZoomOut() {
      if (hasTransitioned) return;
      hasTransitioned = true;

      // Lock current scroll at top during transition
      window.scrollTo(0, 0);

      // Measure target card's exact position on screen in unscaled space
      const rect = targetCard.getBoundingClientRect();
      const style = window.getComputedStyle(targetCard);
      const borderRadius = style.borderRadius || '28px';

      // Ensure target card content is ready
      targetCard.style.visibility = 'visible';

      // Reveal page background elements smoothly via root class
      document.documentElement.classList.remove('rainx-intro-active');
      document.documentElement.classList.add('rainx-page-revealed');

      // Settle kinetic letters before zooming out for a seamless match
      overlay.classList.add('rainx-settle-letters');

      // Trigger zoom-out morphing
      overlay.classList.add('rainx-zooming-out');
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.borderRadius = borderRadius;

      // Handover to actual card when transition completes
      setTimeout(() => {
        overlay.classList.add('rainx-intro-fadeout');

        setTimeout(() => {
          if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          document.documentElement.classList.remove('rainx-page-revealed');
        }, 400);
      }, 1450); // Matches transition timing
    }

    // Auto-trigger zoom out after 3.8s of rich intro animation showcase
    const timer = setTimeout(() => {
      executeZoomOut();
    }, 3800);

    // Allow user to click or tap anywhere to zoom out immediately
    overlay.addEventListener('click', () => {
      clearTimeout(timer);
      executeZoomOut();
    });

    const skipBtn = document.getElementById('rainx-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(timer);
        executeZoomOut();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runIntroAnimation);
  } else {
    runIntroAnimation();
  }
})();
