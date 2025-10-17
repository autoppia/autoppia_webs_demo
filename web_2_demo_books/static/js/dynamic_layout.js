function __runDynamicLayout(){
  try {
    var params0 = new URLSearchParams(window.location.search);
    var debugForce = params0.get('forceDynamic') === '1';
    var enabled = Boolean(window.__DYNAMIC_HTML_ENABLED__) || debugForce;
    var initialSeed = Number(window.__INITIAL_SEED__ || 1) || 1;

    // Read seed from URL (1..300)
    var params = new URLSearchParams(window.location.search);
    var seedParam = params.get('seed');
    var rawSeed = seedParam ? parseInt(seedParam, 10) : initialSeed;
    var seed = (rawSeed >= 1 && rawSeed <= 300) ? rawSeed : 1;

    if (!enabled) {
      document.body.setAttribute('data-layout', 'disabled');
      document.body.classList.add('layout-1');
      document.body.style.setProperty('--seed', '1');
      document.body.style.setProperty('--variant', '1');
      return;
    }

    // Map seed to layout index: (seed-1) % 10 + 1
    var layoutIndex = ((seed - 1) % 10) + 1;

    // Placeholder for special cases mirroring web_6
    // if (seed >= 160 && seed <= 170) layoutIndex = 3;
    // if (seed % 10 === 5) layoutIndex = 2;
    // if (seed === 8) layoutIndex = 1;

    document.body.setAttribute('data-layout', String(layoutIndex));
    document.body.classList.add('layout-' + layoutIndex);
    document.body.style.setProperty('--seed', String(seed));
    document.body.style.setProperty('--variant', String((seed % 10) || 10));

    // Helper API for templates/tests
    window.DynamicLayout = {
      enabled: true,
      seed: seed,
      layoutIndex: layoutIndex,
      getElementId: function(prefix, index){
        index = typeof index === 'number' ? index : 0;
        return prefix + '-' + seed + '-' + index;
      },
      getElementAttrs: function(type, index){
        index = typeof index === 'number' ? index : 0;
        return { id: type + '-' + seed + '-' + index, 'data-seed': String(seed), 'data-variant': String((seed % 10) || 10) };
      }
    };

    // Deterministic reorder util (seeded Fisher–Yates)
    function seededRandomWithSalt(salt) {
      var m = 0x80000000, a = 1103515245, c = 12345;
      var base = (seed % m) ^ (salt % m);
      var state = base > 0 ? base : (base + m);
      return function() {
        state = (a * state + c) % m;
        return state / (m - 1);
      };
    }
    function saltedHash(str) {
      var h = 0;
      for (var i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
      return Math.abs(h);
    }
    function reorderGroup(groupEl, itemSelector) {
      if (!groupEl) return;
      var items = Array.prototype.slice.call(groupEl.querySelectorAll(itemSelector));
      if (items.length < 2) return;
      var salt = saltedHash(groupEl.tagName + '|' + groupEl.className + '|' + (groupEl.id || ''));
      var rand = seededRandomWithSalt(salt);
      var order = items.map(function(_, i){ return i; });
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }
      order.forEach(function(idx){ groupEl.appendChild(items[idx]); });
    }

    // Aggressive recursive reordering across most containers
    var SKIP_TAGS = { 'SCRIPT':1, 'STYLE':1, 'LINK':1, 'META':1, 'TITLE':1, 'HEAD':1, 'HTML':1 };
    function reorderChildren(el, depth) {
      if (!el || depth <= 0) return;
      if (SKIP_TAGS[el.tagName]) return;
      if (el.getAttribute && el.getAttribute('data-dynamic') === 'off') return;
      var children = Array.prototype.slice.call(el.children || []);
      if (children.length > 1) {
        // Use generic child selector
        reorderGroup(el, ':scope > *');
      }
      // Recurse
      for (var k = 0; k < children.length; k++) reorderChildren(children[k], depth - 1);
    }

    // Apply to known groups
    var navbar = document.querySelector('[data-dynamic-group="navbar"]');
    if (navbar) reorderGroup(navbar, ':scope > li');
    var footerLinks = document.querySelector('[data-dynamic-group="footer-links"]');
    if (footerLinks) reorderGroup(footerLinks, ':scope > li');
    var bookGrid = document.querySelector('[data-dynamic-group="book-grid"]');
    if (bookGrid) reorderGroup(bookGrid, ':scope > div[class^="col-"]');

    // Our Library bar: swap title and filters per parity and reorder inner controls
    var libBar = document.querySelector('[data-dynamic-group="library-bar"]');
    if (libBar) {
      var libTitle = libBar.querySelector('[data-dyn="library-title"]');
      var libFilters = libBar.querySelector('[data-dyn="library-filters"]');
      if (libTitle && libFilters) {
        if (isEven) {
          libBar.insertBefore(libFilters, libTitle);
        } else if (libTitle.previousElementSibling !== libFilters) {
          libBar.insertBefore(libTitle, libFilters);
        }
      }
      var libRow = libBar.querySelector('[data-dynamic-group="library-filters-row"]');
      if (libRow) reorderGroup(libRow, ':scope > *');
    }

    // Hero row explicit swap text/image per seed parity
    var hero = document.querySelector('[data-dynamic-group="hero-row"]');
    if (hero) {
      var text = hero.querySelector('[data-dyn="hero-text"]');
      var image = hero.querySelector('[data-dyn="hero-image"]');
      if (text && image) {
        // Reset any previous order classes
        [text, image].forEach(function(el){
          el.classList.remove('order-md-1','order-md-2','order-1','order-2');
        });
        if (isEven) {
          // Ensure visual flip even if DOM reflow is constrained
          image.classList.add('order-md-1');
          text.classList.add('order-md-2');
          if (image !== hero.firstElementChild) hero.insertBefore(image, hero.firstElementChild);
        } else {
          text.classList.add('order-md-1');
          image.classList.add('order-md-2');
          if (text !== hero.firstElementChild) hero.insertBefore(text, hero.firstElementChild);
        }
      }
    }

    // Generic dynamic application across pages to confuse scrapers
    var dynamicSelectors = [
      'ul', 'ol', '.navbar-nav', '.dropdown-menu', '.list-group',
      '.row', '.card-deck', '.card-columns', '.grid',
      '.form-row'
    ];
    dynamicSelectors.forEach(function(sel){
      var groups = document.querySelectorAll(sel);
      groups.forEach(function(group){
        if (group.getAttribute && group.getAttribute('data-dynamic') === 'off') return;
        var childSel = ':scope > *';
        if (group.matches('ul,ol,.navbar-nav,.dropdown-menu,.list-group')) childSel = ':scope > li, :scope > a, :scope > .dropdown-item, :scope > .list-group-item';
        if (group.matches('.row,.card-deck,.card-columns,.grid,.form-row')) childSel = ':scope > [class*="col-"], :scope > .card, :scope > *';
        reorderGroup(group, childSel);
      });
    });

    // Global recursive pass: reorder most containers up to depth 3
    reorderChildren(document.body, 3);

    // Assign seed-based IDs and data attributes to interactive elements for XPath variance
    var counter = 0;
    var interactive = document.querySelectorAll('a, button, input, select, textarea');
    interactive.forEach(function(el){
      if (!el.id) {
        el.id = 'dyn-' + el.tagName.toLowerCase() + '-' + seed + '-' + (counter++);
      }
      el.setAttribute('data-seed', String(seed));
      el.setAttribute('data-variant', String((seed % 10) || 10));
    });

    // Also tag all block-level sections to vary XPath anchors
    var blocks = document.querySelectorAll('section, article, aside, nav, header, footer, main, div');
    blocks.forEach(function(el, idx){
      if (!el.getAttribute('data-seed')) el.setAttribute('data-seed', String(seed));
      if (!el.getAttribute('data-variant')) el.setAttribute('data-variant', String((seed % 10) || 10));
      if (!el.id && idx < 500) el.id = 'blk-' + (seed % 1000) + '-' + idx;
    });

    // Swap auth block vs navbar by parity
    var isEven = (seed % 2) === 0;
    var navCollapse = document.getElementById('navbarNav');
    if (navCollapse) {
      var left = navCollapse.querySelector('[data-dynamic-group="navbar"]');
      var rightAuth = navCollapse.querySelector('[data-dyn="auth"]');
      if (left && rightAuth) {
        if (isEven) {
          navCollapse.insertBefore(rightAuth, left);
        } else if (rightAuth.previousElementSibling !== left) {
          navCollapse.insertBefore(left, rightAuth);
        }
      }
    }

    // Flip column order in all .row groups by parity
    var rows = document.querySelectorAll('.row');
    rows.forEach(function(r){
      var cols = Array.prototype.slice.call(r.querySelectorAll(':scope > [class*="col-"]'));
      if (cols.length < 2) return;
      if (isEven) {
        var times = (seed % cols.length);
        for (var t = 0; t < times; t++) {
          r.insertBefore(r.lastElementChild, r.firstElementChild);
        }
      } else {
        var times2 = (seed % cols.length);
        for (var t2 = 0; t2 < times2; t2++) {
          r.appendChild(r.firstElementChild);
        }
      }
    });
  } catch (e) {
    console.error('dynamic_layout initialization failed', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __runDynamicLayout);
} else {
  __runDynamicLayout();
}


