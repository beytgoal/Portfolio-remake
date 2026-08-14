/**
 * RainX - Header Maximize/Minimize Controller for Mobile & Tablet
 * Hydration-safe navigation expander
 */
(function() {
  'use strict';

  function initHeaderToggle() {
    const headerDiv = document.querySelector('header > div') || document.querySelector('main > header > div');
    if (!headerDiv) return;

    let toggleBtn = document.getElementById('header-maximize-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'header-maximize-toggle';
      toggleBtn.type = 'button';
      toggleBtn.className = 'header-maximize-toggle';
      toggleBtn.setAttribute('aria-label', 'Maximize navigation menu');
      toggleBtn.setAttribute('aria-expanded', 'false');

      // Append inside header div next to nav
      const nav = headerDiv.querySelector('nav');
      if (nav && nav.parentNode) {
        nav.parentNode.insertBefore(toggleBtn, nav.nextSibling);
      } else {
        headerDiv.appendChild(toggleBtn);
      }
    }

    function updateButtonUI(isMaximized) {
      toggleBtn.setAttribute('aria-expanded', isMaximized ? 'true' : 'false');
      toggleBtn.setAttribute('aria-label', isMaximized ? 'Minimize navigation' : 'Maximize navigation');
      toggleBtn.className = `header-maximize-toggle ${isMaximized ? 'is-maximized' : 'is-minimized'}`;
      toggleBtn.innerHTML = isMaximized
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>`;
    }

    updateButtonUI(headerDiv.classList.contains('header-is-maximized'));

    toggleBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      const isMax = headerDiv.classList.toggle('header-is-maximized');
      updateButtonUI(isMax);
    };

    // Close when clicking any nav link
    const navLinks = headerDiv.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (headerDiv.classList.contains('header-is-maximized')) {
          headerDiv.classList.remove('header-is-maximized');
          updateButtonUI(false);
        }
      });
    });
  }

  // Defer initialization to after initial tick to avoid any React SSR hydration conflict
  if (document.readyState === 'complete') {
    setTimeout(initHeaderToggle, 50);
  } else {
    window.addEventListener('load', () => setTimeout(initHeaderToggle, 50));
  }

  window.addEventListener('popstate', () => setTimeout(initHeaderToggle, 50));

  // Debounced observer to re-attach if React re-renders header
  let debounceTimer = null;
  const obs = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const headerDiv = document.querySelector('header > div') || document.querySelector('main > header > div');
      const toggleBtn = document.getElementById('header-maximize-toggle');
      if (headerDiv && (!toggleBtn || !headerDiv.contains(toggleBtn))) {
        initHeaderToggle();
      }
    }, 150);
  });

  if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
