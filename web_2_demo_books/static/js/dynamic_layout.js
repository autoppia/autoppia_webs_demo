function __runDynamicLayout(){
  try {
    var enabled = Boolean(window.__DYNAMIC_HTML_ENABLED__);
    var initialSeed = Number(window.__INITIAL_SEED__ || 1) || 1;

    var params = new URLSearchParams(window.location.search);
    var seedParam = params.get('seed');
    var rawSeed = seedParam ? parseInt(seedParam, 10) : initialSeed;
    var seed = (rawSeed >= 1 && rawSeed <= 300) ? rawSeed : 1;
    var isEven = (seed % 2) === 0;

    if (!enabled && !debugForce) return;

    document.body.style.setProperty('--seed', String(seed));
    document.body.style.setProperty('--variant', String((seed % 10) || 10));

    function saltedHash(str){
      var h = 0; for (var i=0;i<str.length;i++) h = ((h<<5)-h)+str.charCodeAt(i)|0; return Math.abs(h);
    }
    function seededRandomWithSalt(salt){
      var m=0x80000000,a=1103515245,c=12345; var base=(seed % m) ^ (salt % m); var state=base>0?base:(base+m);
      return function(){ state=(a*state+c)%m; return state/(m-1); };
    }

    var SKIP_TAGS = { 'SCRIPT':1, 'STYLE':1, 'LINK':1, 'META':1, 'TITLE':1, 'HEAD':1, 'HTML':1 };
    
    // Function to check if element should be completely skipped
    function shouldSkipElement(el) {
      if (!el) return true;
      if (SKIP_TAGS[el.tagName]) return true;
      if (el.getAttribute && el.getAttribute('data-dynamic')==='off') return true;
      if (el.className && el.className.includes('hero-section')) return true;
      // Also skip if element is inside a hero section
      if (el.closest && el.closest('.hero-section')) return true;
      return false;
    }

    function reorderGroup(groupEl, sel){
      if (!groupEl) return;
      
      // Completely skip if this group is a hero section or contains a hero section
      // But allow hero-content to be processed for internal reordering
      if (groupEl.classList.contains('hero-section') || 
          groupEl.querySelector('.hero-section') || 
          groupEl.closest('.hero-section')) {
        return;
      }
      
      // Skip if data-dynamic="off" but allow hero-content
      if (groupEl.getAttribute('data-dynamic') === 'off' && 
          groupEl.getAttribute('data-dynamic-group') !== 'hero-content') {
        return;
      }
      
      var items = Array.prototype.slice.call(groupEl.querySelectorAll(sel));
      if (items.length < 2) return;
      var salt = saltedHash(groupEl.tagName + '|' + groupEl.className + '|' + (groupEl.id || ''));
      var rand = seededRandomWithSalt(salt);
      
      // Simple Fisher-Yates shuffle for more predictable reordering
      var shuffled = items.slice();
      for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }
      
      // Re-append in new order
      shuffled.forEach(function(el){ groupEl.appendChild(el); });
    }

    function reorderChildren(el, depth){
      if (shouldSkipElement(el) || depth<=0) return;
      
      // Skip reordering major sections - only reorder elements within them
      var skipSections = ['BODY', 'HEADER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FOOTER'];
      var skipClasses = ['hero-section', 'hero', 'jumbotron'];
      
      // Check if element is a major section or has a protected class
      if (skipSections.includes(el.tagName) || 
          (el.className && skipClasses.some(cls => el.className.includes(cls)))) {
        // Only reorder children of major sections, not the sections themselves
        var children = Array.prototype.slice.call(el.children||[]);
        for (var k=0;k<children.length;k++) reorderChildren(children[k], depth-1);
        return;
      }
      
      // Also skip elements with data-dynamic-group="hero-content" to prevent hero section from moving
      if (el.getAttribute && el.getAttribute('data-dynamic-group') === 'hero-content') {
        // Only reorder children of hero content, not the hero content itself
        var children = Array.prototype.slice.call(el.children||[]);
        for (var k=0;k<children.length;k++) reorderChildren(children[k], depth-1);
        return;
      }
      
      var children = Array.prototype.slice.call(el.children||[]);
      if (children.length>1) reorderGroup(el, ':scope > *');
      for (var k=0;k<children.length;k++) reorderChildren(children[k], depth-1);
    }

    // Perform reordering when dynamic HTML is enabled
    if (enabled) {
      // Known groups (add markers in templates if needed)
      var navbar = document.querySelector('.navbar-nav'); if (navbar) reorderGroup(navbar, ':scope > li');
      
      // Reorder rows but skip rows inside hero sections
      var rows = document.querySelectorAll('.row'); 
      rows.forEach(function(r){
        // Skip rows that are inside hero sections
        if (r.closest('.hero-section')) {
          return;
        }
        reorderGroup(r, ':scope > [class*="col-"]'); 
      });
      
      var lists = document.querySelectorAll('ul,ol,.dropdown-menu,.list-group'); 
      lists.forEach(function(l){
        // Skip lists that are inside hero sections
        if (l.closest('.hero-section')) {
          return;
        }
        reorderGroup(l, ':scope > *'); 
      });
      
      // Handle data-dynamic-group elements
      var dynamicGroups = document.querySelectorAll('[data-dynamic-group]');
      dynamicGroups.forEach(function(group){
        var groupName = group.getAttribute('data-dynamic-group');
        
        // Allow hero-content to be processed even if data-dynamic="off" for internal reordering
        if (group.getAttribute('data-dynamic') === 'off' && groupName !== 'hero-content') {
          return;
        }
        if (groupName === 'navbar-nav') {
          // Create multiple navbar layout variants
          var navItems = Array.prototype.slice.call(group.querySelectorAll('li'));
          if (navItems.length >= 3) {
            var variant = seed % 4; // 4 different navbar variants (0-3)
            
            switch(variant) {
              case 0: // Default: Home, About, Contact
                reorderGroup(group, ':scope > li');
                break;
              case 1: // Reversed: Contact, About, Home
                var reversed = navItems.slice().reverse();
                while (group.firstChild) group.removeChild(group.firstChild);
                reversed.forEach(function(item) { group.appendChild(item); });
                break;
              case 2: // Middle first: About, Home, Contact
                var middleFirst = [navItems[1], navItems[0], navItems[2]];
                while (group.firstChild) group.removeChild(group.firstChild);
                middleFirst.forEach(function(item) { group.appendChild(item); });
                break;
              case 3: // Ends first: Contact, Home, About
                var endsFirst = [navItems[2], navItems[0], navItems[1]];
                while (group.firstChild) group.removeChild(group.firstChild);
                endsFirst.forEach(function(item) { group.appendChild(item); });
                break;
            }
          } else {
            reorderGroup(group, ':scope > li');
          }
        } else if (groupName === 'book-grid') {
          reorderGroup(group, ':scope > [class*="col-"]');
        } else if (groupName === 'hero-content') {
          // Create multiple hero layout variants
          var container = group.querySelector('.container');
          if (container) {
            var row = container.querySelector('.row');
            if (row) {
              var columns = Array.prototype.slice.call(row.querySelectorAll('[class*="col-"]'));
              if (columns.length >= 2) {
                var variant = seed % 6; // 6 different variants (0-5)
                
                // Add variant class to hero section for styling
                group.className += ' hero-variant-' + variant;
                
                switch(variant) {
                  case 0: // Default: Text left, Image right
                    // Keep original order
                    break;
                  case 1: // Image left, Text right
                    // Manually swap the columns
                    var firstCol = columns[0];
                    var secondCol = columns[1];
                    row.removeChild(firstCol);
                    row.removeChild(secondCol);
                    row.appendChild(secondCol);
                    row.appendChild(firstCol);
                    break;
                  case 2: // Stacked: Text on top, Image below
                    columns.forEach(function(col, index) {
                      if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-12');
                      if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-12');
                    });
                    break;
                  case 3: // Stacked: Image on top, Text below
                    columns.forEach(function(col, index) {
                      if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-12');
                      if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-12');
                    });
                    // Manually swap the columns for stacked layout
                    var firstCol = columns[0];
                    var secondCol = columns[1];
                    row.removeChild(firstCol);
                    row.removeChild(secondCol);
                    row.appendChild(secondCol);
                    row.appendChild(firstCol);
                    break;
                  case 4: // Centered layout: Both columns centered
                    columns.forEach(function(col) {
                      col.className = col.className.replace(/col-md-\d+/, 'col-md-6') + ' text-center';
                    });
                    break;
                  case 5: // Wide layout: Text takes more space
                    columns.forEach(function(col, index) {
                      if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-md-8');
                      if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-md-4');
                    });
                    break;
                }
              }
            }
          }
        } else {
          reorderGroup(group, ':scope > *');
        }
      });

      // Reorder selects (keep first placeholder)
      document.querySelectorAll('select').forEach(function(sel){
        var opts = Array.prototype.slice.call(sel.options); if (opts.length<=2) return;
        var head=null; if (opts[0] && (opts[0].value===''||opts[0].disabled)) head=opts.shift();
        var salt = saltedHash((sel.id||sel.name||'select') + '|' + (sel.className||'')); var rand = seededRandomWithSalt(salt);
        var idxs = opts.map(function(_,i){return i;}); for (var i=idxs.length-1;i>0;i--){ var j=Math.floor(rand()*(i+1)); var tmp=idxs[i]; idxs[i]=idxs[j]; idxs[j]=tmp; }
        var selectedVal = sel.value; while (sel.firstChild) sel.removeChild(sel.firstChild); if (head) sel.appendChild(head);
        idxs.forEach(function(k){ sel.appendChild(opts[k]); }); if (selectedVal) sel.value=selectedVal;
      });

      // Global recursive pass - limited depth to avoid reordering major sections
      // But completely skip hero section
      var bodyChildren = Array.prototype.slice.call(document.body.children);
      bodyChildren.forEach(function(child) {
        // Completely skip hero section and any element that contains or is inside a hero section
        if (shouldSkipElement(child) || 
            child.classList.contains('hero-section') || 
            child.querySelector('.hero-section') || 
            child.closest('.hero-section')) {
          return;
        }
        reorderChildren(child, 2);
      });
    }

    // Tag all nodes with seed markers for XPath variance
    var all = document.getElementsByTagName('*');
    for (var n=0;n<all.length;n++){
      var node = all[n]; if (SKIP_TAGS[node.tagName]) continue;
      if (!node.getAttribute('data-seed')) node.setAttribute('data-seed', String(seed));
      if (!node.getAttribute('data-variant')) node.setAttribute('data-variant', String((seed%10)||10));
      if (!node.getAttribute('data-xid')) node.setAttribute('data-xid', 'x-'+seed+'-'+n);
      if (node.classList) node.classList.add('sx-'+seed);
    }
  } catch(e) { /* Silent error handling */ }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', __runDynamicLayout); else __runDynamicLayout();
