(function() {
  function updateAutoYear() {
    const currentYear = new Date().getFullYear().toString();
    const selectors = [
      'main:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(4) > span:nth-of-type(1)',
      '.text-6xl.font-black.leading-none'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el && el.textContent.trim() !== currentYear && /^\d{4}$/.test(el.textContent.trim())) {
          el.textContent = currentYear;
        }
      });
    });
  }

  // Update immediately
  updateAutoYear();

  // Observer to handle Next.js client-side re-renders / hydration
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function() {
      updateAutoYear();
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  function initLiquidGlass() {
    updateAutoYear();

    // Scroll progress bar indicator
    let scrollBar = document.getElementById('liquid-scroll-bar');
    if (!scrollBar) {
      scrollBar = document.createElement('div');
      scrollBar.id = 'liquid-scroll-bar';
      document.body.appendChild(scrollBar);
    }

    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
          if (scrollBar) scrollBar.style.width = scrolled + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  if (document.readyState === 'complete') {
    setTimeout(initLiquidGlass, 100);
  } else {
    window.addEventListener('load', function() {
      setTimeout(initLiquidGlass, 100);
    });
  }
})();

