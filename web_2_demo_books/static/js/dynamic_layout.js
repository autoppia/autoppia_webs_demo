// Layout variant functions for 10 different layouts
function applyNavbarLayout(group, variant) {
  var navItems = Array.prototype.slice.call(group.querySelectorAll('li'));
  if (navItems.length < 3) {
    reorderGroup(group, ':scope > li');
    return;
  }
  
  switch(variant) {
    case 1: // Default: Home, About, Contact
      reorderGroup(group, ':scope > li');
      break;
    case 2: // Reversed: Contact, About, Home
      var reversed = navItems.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(item) { group.appendChild(item); });
      break;
    case 3: // Middle first: About, Home, Contact
      var middleFirst = [navItems[1], navItems[0], navItems[2]];
      while (group.firstChild) group.removeChild(group.firstChild);
      middleFirst.forEach(function(item) { group.appendChild(item); });
      break;
    case 4: // Ends first: Contact, Home, About
      var endsFirst = [navItems[2], navItems[0], navItems[1]];
      while (group.firstChild) group.removeChild(group.firstChild);
      endsFirst.forEach(function(item) { group.appendChild(item); });
      break;
    case 5: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
    case 6: // Home, Contact, About
      var homeContactAbout = [navItems[0], navItems[2], navItems[1]];
      while (group.firstChild) group.removeChild(group.firstChild);
      homeContactAbout.forEach(function(item) { group.appendChild(item); });
      break;
    case 7: // About, Contact, Home
      var aboutContactHome = [navItems[1], navItems[2], navItems[0]];
      while (group.firstChild) group.removeChild(group.firstChild);
      aboutContactHome.forEach(function(item) { group.appendChild(item); });
      break;
    case 8: // Contact, About, Home (different from case 2)
      var contactAboutHome = [navItems[2], navItems[1], navItems[0]];
      while (group.firstChild) group.removeChild(group.firstChild);
      contactAboutHome.forEach(function(item) { group.appendChild(item); });
      break;
    case 9: // Home, About, Contact (same as case 1 but with different styling)
      reorderGroup(group, ':scope > li');
      break;
    case 10: // Random shuffle with different algorithm
      reorderGroup(group, ':scope > li');
      break;
  }
}

function applyBookGridLayout(group, variant) {
  var bookCards = Array.prototype.slice.call(group.querySelectorAll('[class*="col-"]'));
  if (bookCards.length < 2) return;
  
  switch(variant) {
    case 1: // Default grid
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 2: // Reverse order
      var reversed = bookCards.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(card) { group.appendChild(card); });
      break;
    case 3: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 4: // Every other card
      var everyOther = [];
      for (var i = 0; i < bookCards.length; i += 2) {
        everyOther.push(bookCards[i]);
      }
      for (var i = 1; i < bookCards.length; i += 2) {
        everyOther.push(bookCards[i]);
      }
      while (group.firstChild) group.removeChild(group.firstChild);
      everyOther.forEach(function(card) { group.appendChild(card); });
      break;
    case 5: // Middle out
      var middle = Math.floor(bookCards.length / 2);
      var middleOut = [bookCards[middle]];
      for (var i = 1; i <= middle; i++) {
        if (middle - i >= 0) middleOut.push(bookCards[middle - i]);
        if (middle + i < bookCards.length) middleOut.push(bookCards[middle + i]);
      }
      while (group.firstChild) group.removeChild(group.firstChild);
      middleOut.forEach(function(card) { group.appendChild(card); });
      break;
    case 6: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 7: // Reverse every other
      var reverseEveryOther = [];
      for (var i = bookCards.length - 1; i >= 0; i -= 2) {
        reverseEveryOther.push(bookCards[i]);
      }
      for (var i = bookCards.length - 2; i >= 0; i -= 2) {
        reverseEveryOther.push(bookCards[i]);
      }
      while (group.firstChild) group.removeChild(group.firstChild);
      reverseEveryOther.forEach(function(card) { group.appendChild(card); });
      break;
    case 8: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 9: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 10: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
  }
}

function applyHeroLayout(group, variant) {
  var container = group.querySelector('.container');
  if (!container) return;
  
  var row = container.querySelector('.row');
  if (!row) return;
  
  var columns = Array.prototype.slice.call(row.querySelectorAll('[class*="col-"]'));
  if (columns.length < 2) return;
  
  // Add variant class to hero section for styling
  group.className += ' hero-variant-' + variant;
  
  switch(variant) {
    case 1: // Default: Text left, Image right
      // Keep original order
      break;
    case 2: // Image left, Text right
      var firstCol = columns[0];
      var secondCol = columns[1];
      row.removeChild(firstCol);
      row.removeChild(secondCol);
      row.appendChild(secondCol);
      row.appendChild(firstCol);
      break;
    case 3: // Stacked: Text on top, Image below
      columns.forEach(function(col, index) {
        if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-12');
        if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-12');
      });
      break;
    case 4: // Stacked: Image on top, Text below
      columns.forEach(function(col, index) {
        if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-12');
        if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-12');
      });
      var firstCol = columns[0];
      var secondCol = columns[1];
      row.removeChild(firstCol);
      row.removeChild(secondCol);
      row.appendChild(secondCol);
      row.appendChild(firstCol);
      break;
    case 5: // Centered layout: Both columns centered
      columns.forEach(function(col) {
        col.className = col.className.replace(/col-md-\d+/, 'col-md-6') + ' text-center';
      });
      break;
    case 6: // Wide layout: Text takes more space
      columns.forEach(function(col, index) {
        if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-md-8');
        if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-md-4');
      });
      break;
    case 7: // Narrow layout: Image takes more space
      columns.forEach(function(col, index) {
        if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-md-4');
        if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-md-8');
      });
      break;
    case 8: // Equal width with different styling
      columns.forEach(function(col) {
        col.className = col.className.replace(/col-md-\d+/, 'col-md-6');
      });
      break;
    case 9: // Stacked with different proportions
      columns.forEach(function(col, index) {
        if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-12');
        if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-12');
      });
      break;
    case 10: // Custom layout
      columns.forEach(function(col, index) {
        if (index === 0) col.className = col.className.replace(/col-md-\d+/, 'col-md-7');
        if (index === 1) col.className = col.className.replace(/col-md-\d+/, 'col-md-5');
      });
      break;
  }
}

function applyFooterLayout(group, variant) {
  var footerColumns = Array.prototype.slice.call(group.querySelectorAll('[class*="col-"]'));
  if (footerColumns.length < 3) return;
  
  switch(variant) {
    case 1: // Default order
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 2: // Reverse order
      var reversed = footerColumns.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(col) { group.appendChild(col); });
      break;
    case 3: // Middle first
      var middleFirst = [footerColumns[1], footerColumns[0], footerColumns[2]];
      while (group.firstChild) group.removeChild(group.firstChild);
      middleFirst.forEach(function(col) { group.appendChild(col); });
      break;
    case 4: // Last first
      var lastFirst = [footerColumns[2], footerColumns[0], footerColumns[1]];
      while (group.firstChild) group.removeChild(group.firstChild);
      lastFirst.forEach(function(col) { group.appendChild(col); });
      break;
    case 5: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 6: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 7: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 8: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 9: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
    case 10: // Random shuffle
      reorderGroup(group, ':scope > [class*="col-"]');
      break;
  }
}

function applyFooterLinksLayout(group, variant) {
  var links = Array.prototype.slice.call(group.querySelectorAll('li'));
  if (links.length < 2) return;
  
  switch(variant) {
    case 1: // Default order
      reorderGroup(group, ':scope > li');
      break;
    case 2: // Reverse order
      var reversed = links.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(link) { group.appendChild(link); });
      break;
    case 3: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
    case 4: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
    case 5: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
    case 6: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
    case 7: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
    case 8: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
    case 9: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
    case 10: // Random shuffle
      reorderGroup(group, ':scope > li');
      break;
  }
}

function applyFooterSocialLayout(group, variant) {
  var socialLinks = Array.prototype.slice.call(group.querySelectorAll('a'));
  if (socialLinks.length < 2) return;
  
  switch(variant) {
    case 1: // Default order
      reorderGroup(group, ':scope > a');
      break;
    case 2: // Reverse order
      var reversed = socialLinks.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(link) { group.appendChild(link); });
      break;
    case 3: // Random shuffle
      reorderGroup(group, ':scope > a');
      break;
    case 4: // Random shuffle
      reorderGroup(group, ':scope > a');
      break;
    case 5: // Random shuffle
      reorderGroup(group, ':scope > a');
      break;
    case 6: // Random shuffle
      reorderGroup(group, ':scope > a');
      break;
    case 7: // Random shuffle
      reorderGroup(group, ':scope > a');
      break;
    case 8: // Random shuffle
      reorderGroup(group, ':scope > a');
      break;
    case 9: // Random shuffle
      reorderGroup(group, ':scope > a');
      break;
    case 10: // Random shuffle
      reorderGroup(group, ':scope > a');
      break;
  }
}

// Login page layout functions
function applyLoginContainerLayout(group, variant) {
  // Apply different container styles based on variant
  switch(variant) {
    case 1: // Default centered layout
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      break;
    case 2: // Left aligned
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-start');
      break;
    case 3: // Right aligned
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-end');
      break;
    case 4: // Space between
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-between');
      break;
    case 5: // Space around
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-around');
      break;
    case 6: // Space evenly
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-evenly');
      break;
    case 7: // Flex start with margin
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-start');
      group.style.marginLeft = '10%';
      break;
    case 8: // Flex end with margin
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-end');
      group.style.marginRight = '10%';
      break;
    case 9: // Center with padding
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      group.style.paddingLeft = '5%';
      group.style.paddingRight = '5%';
      break;
    case 10: // Center with custom positioning
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      group.style.position = 'relative';
      group.style.left = '2%';
      break;
  }
}

function applyLoginColumnLayout(group, variant) {
  // Apply different column sizes based on variant
  switch(variant) {
    case 1: // Default: col-md-6 col-lg-5
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-6 col-lg-5');
      break;
    case 2: // Wider: col-md-8 col-lg-6
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-8 col-lg-6');
      break;
    case 3: // Narrower: col-md-4 col-lg-3
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-4 col-lg-3');
      break;
    case 4: // Full width on small: col-12 col-md-6
      group.className = group.className.replace(/col-\w+-\d+/, 'col-12 col-md-6');
      break;
    case 5: // Large only: col-lg-4
      group.className = group.className.replace(/col-\w+-\d+/, 'col-lg-4');
      break;
    case 6: // Medium only: col-md-5
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-5');
      break;
    case 7: // Extra wide: col-md-10 col-lg-8
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-10 col-lg-8');
      break;
    case 8: // Extra narrow: col-md-3 col-lg-2
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-3 col-lg-2');
      break;
    case 9: // Responsive: col-12 col-sm-8 col-md-6 col-lg-4
      group.className = group.className.replace(/col-\w+-\d+/, 'col-12 col-sm-8 col-md-6 col-lg-4');
      break;
    case 10: // Custom: col-11 col-md-7 col-lg-6
      group.className = group.className.replace(/col-\w+-\d+/, 'col-11 col-md-7 col-lg-6');
      break;
  }
}

function applyLoginFormFieldsLayout(group, variant) {
  var formFields = Array.prototype.slice.call(group.querySelectorAll('.form-group'));
  if (formFields.length < 2) return;
  
  // Use deterministic shuffle based on variant for consistent results
  function deterministicShuffle(array, seed) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = (seed + i) % (i + 1);
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
  
  switch(variant) {
    case 1: // Default order: Username, Password
      reorderGroup(group, ':scope > .form-group');
      break;
    case 2: // Reverse order: Password, Username
      var reversed = formFields.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(field) { group.appendChild(field); });
      break;
    case 3: // Deterministic shuffle with seed 3
      var shuffled = deterministicShuffle(formFields, 3);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 4: // Deterministic shuffle with seed 4
      var shuffled = deterministicShuffle(formFields, 4);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 5: // Deterministic shuffle with seed 5
      var shuffled = deterministicShuffle(formFields, 5);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 6: // Deterministic shuffle with seed 6
      var shuffled = deterministicShuffle(formFields, 6);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 7: // Deterministic shuffle with seed 7
      var shuffled = deterministicShuffle(formFields, 7);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 8: // Deterministic shuffle with seed 8
      var shuffled = deterministicShuffle(formFields, 8);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 9: // Deterministic shuffle with seed 9
      var shuffled = deterministicShuffle(formFields, 9);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 10: // Deterministic shuffle with seed 10
      var shuffled = deterministicShuffle(formFields, 10);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
  }
}

function applyLoginCardLayout(group, variant) {
  // Apply different element reordering within the card based on variant
  // All visual styling is preserved as original
  var cardElements = Array.prototype.slice.call(group.children);
  if (cardElements.length < 3) return; // Need header, body, footer
  
  // Find specific elements
  var header = group.querySelector('.card-header');
  var body = group.querySelector('.card-body');
  var footer = group.querySelector('.card-footer');
  
  if (!header || !body || !footer) return;
  
  // Clear the card
  while (group.firstChild) {
    group.removeChild(group.firstChild);
  }
  
  switch(variant) {
    case 1: // Default order: Header, Body, Footer
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      break;
    case 2: // Reversed order: Footer, Body, Header
      group.appendChild(footer);
      group.appendChild(body);
      group.appendChild(header);
      break;
    case 3: // Header, Footer, Body
      group.appendChild(header);
      group.appendChild(footer);
      group.appendChild(body);
      break;
    case 4: // Body, Header, Footer
      group.appendChild(body);
      group.appendChild(header);
      group.appendChild(footer);
      break;
    case 5: // Body, Footer, Header
      group.appendChild(body);
      group.appendChild(footer);
      group.appendChild(header);
      break;
    case 6: // Footer, Header, Body
      group.appendChild(footer);
      group.appendChild(header);
      group.appendChild(body);
      break;
    case 7: // Header, Body, Footer (same as default but with different positioning)
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      // Add subtle positioning differences
      header.style.marginBottom = '0';
      body.style.marginTop = '0';
      break;
    case 8: // Header, Body, Footer with different spacing
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      // Add different spacing
      body.style.marginTop = '5px';
      footer.style.marginTop = '5px';
      break;
    case 9: // Header, Body, Footer with custom positioning
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      // Add custom positioning
      header.style.position = 'relative';
      header.style.zIndex = '1';
      break;
    case 10: // Header, Body, Footer with unique layout
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      // Add unique layout properties
      group.style.display = 'flex';
      group.style.flexDirection = 'column';
      group.style.gap = '2px';
      break;
  }
}

// Register page layout functions
function applyRegisterContainerLayout(group, variant) {
  // Apply different container styles based on variant
  switch(variant) {
    case 1: // Default centered layout
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      break;
    case 2: // Left aligned
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-start');
      break;
    case 3: // Right aligned
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-end');
      break;
    case 4: // Space between
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-between');
      break;
    case 5: // Space around
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-around');
      break;
    case 6: // Space evenly
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-evenly');
      break;
    case 7: // Flex start with margin
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-start');
      group.style.marginLeft = '15%';
      break;
    case 8: // Flex end with margin
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-end');
      group.style.marginRight = '15%';
      break;
    case 9: // Center with padding
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      group.style.paddingLeft = '8%';
      group.style.paddingRight = '8%';
      break;
    case 10: // Center with custom positioning
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      group.style.position = 'relative';
      group.style.left = '3%';
      break;
  }
}

function applyRegisterColumnLayout(group, variant) {
  // Apply different column sizes based on variant
  switch(variant) {
    case 1: // Default: col-md-7 col-lg-6
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-7 col-lg-6');
      break;
    case 2: // Wider: col-md-9 col-lg-8
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-9 col-lg-8');
      break;
    case 3: // Narrower: col-md-5 col-lg-4
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-5 col-lg-4');
      break;
    case 4: // Full width on small: col-12 col-md-7
      group.className = group.className.replace(/col-\w+-\d+/, 'col-12 col-md-7');
      break;
    case 5: // Large only: col-lg-5
      group.className = group.className.replace(/col-\w+-\d+/, 'col-lg-5');
      break;
    case 6: // Medium only: col-md-6
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-6');
      break;
    case 7: // Extra wide: col-md-11 col-lg-10
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-11 col-lg-10');
      break;
    case 8: // Extra narrow: col-md-4 col-lg-3
      group.className = group.className.replace(/col-\w+-\d+/, 'col-md-4 col-lg-3');
      break;
    case 9: // Responsive: col-12 col-sm-9 col-md-7 col-lg-5
      group.className = group.className.replace(/col-\w+-\d+/, 'col-12 col-sm-9 col-md-7 col-lg-5');
      break;
    case 10: // Custom: col-10 col-md-8 col-lg-7
      group.className = group.className.replace(/col-\w+-\d+/, 'col-10 col-md-8 col-lg-7');
      break;
  }
}

function applyRegisterFormFieldsLayout(group, variant) {
  var formFields = Array.prototype.slice.call(group.querySelectorAll('.form-group'));
  if (formFields.length < 4) return; // Need username, email, password1, password2
  
  // Use deterministic shuffle based on variant for consistent results
  function deterministicShuffle(array, seed) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = (seed + i) % (i + 1);
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
  
  switch(variant) {
    case 1: // Default order: Username, Email, Password, Confirm Password
      reorderGroup(group, ':scope > .form-group');
      break;
    case 2: // Reverse order: Confirm Password, Password, Email, Username
      var reversed = formFields.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(field) { group.appendChild(field); });
      break;
    case 3: // Deterministic shuffle with seed 3
      var shuffled = deterministicShuffle(formFields, 3);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 4: // Deterministic shuffle with seed 4
      var shuffled = deterministicShuffle(formFields, 4);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 5: // Deterministic shuffle with seed 5
      var shuffled = deterministicShuffle(formFields, 5);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 6: // Deterministic shuffle with seed 6
      var shuffled = deterministicShuffle(formFields, 6);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 7: // Deterministic shuffle with seed 7
      var shuffled = deterministicShuffle(formFields, 7);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 8: // Deterministic shuffle with seed 8
      var shuffled = deterministicShuffle(formFields, 8);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 9: // Deterministic shuffle with seed 9
      var shuffled = deterministicShuffle(formFields, 9);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 10: // Deterministic shuffle with seed 10
      var shuffled = deterministicShuffle(formFields, 10);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
  }
}

function applyRegisterCardLayout(group, variant) {
  // Apply different element reordering within the card based on variant
  // All visual styling is preserved as original
  var cardElements = Array.prototype.slice.call(group.children);
  if (cardElements.length < 3) return; // Need header, body, footer
  
  // Find specific elements
  var header = group.querySelector('.card-header');
  var body = group.querySelector('.card-body');
  var footer = group.querySelector('.card-footer');
  
  if (!header || !body || !footer) return;
  
  // Clear the card
  while (group.firstChild) {
    group.removeChild(group.firstChild);
  }
  
  switch(variant) {
    case 1: // Default order: Header, Body, Footer
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      break;
    case 2: // Reversed order: Footer, Body, Header
      group.appendChild(footer);
      group.appendChild(body);
      group.appendChild(header);
      break;
    case 3: // Header, Footer, Body
      group.appendChild(header);
      group.appendChild(footer);
      group.appendChild(body);
      break;
    case 4: // Body, Header, Footer
      group.appendChild(body);
      group.appendChild(header);
      group.appendChild(footer);
      break;
    case 5: // Body, Footer, Header
      group.appendChild(body);
      group.appendChild(footer);
      group.appendChild(header);
      break;
    case 6: // Footer, Header, Body
      group.appendChild(footer);
      group.appendChild(header);
      group.appendChild(body);
      break;
    case 7: // Header, Body, Footer with zero margins
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      // Add subtle positioning differences
      header.style.marginBottom = '0';
      body.style.marginTop = '0';
      break;
    case 8: // Header, Body, Footer with different spacing
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      // Add different spacing
      body.style.marginTop = '8px';
      footer.style.marginTop = '8px';
      break;
    case 9: // Header, Body, Footer with custom positioning
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      // Add custom positioning
      header.style.position = 'relative';
      header.style.zIndex = '2';
      break;
    case 10: // Header, Body, Footer with unique layout
      group.appendChild(header);
      group.appendChild(body);
      group.appendChild(footer);
      // Add unique layout properties
      group.style.display = 'flex';
      group.style.flexDirection = 'column';
      group.style.gap = '3px';
      break;
  }
}

// Book details page layout functions
function applyBookDetailsContainerLayout(group, variant) {
  // Apply different container styles based on variant
  switch(variant) {
    case 1: // Default centered layout
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      break;
    case 2: // Left aligned
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-start');
      break;
    case 3: // Right aligned
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-end');
      break;
    case 4: // Space between
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-between');
      break;
    case 5: // Space around
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-around');
      break;
    case 6: // Space evenly
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-evenly');
      break;
    case 7: // Flex start with margin
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-start');
      group.style.marginLeft = '5%';
      break;
    case 8: // Flex end with margin
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-end');
      group.style.marginRight = '5%';
      break;
    case 9: // Center with padding
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      group.style.paddingLeft = '3%';
      group.style.paddingRight = '3%';
      break;
    case 10: // Center with custom positioning
      group.className = group.className.replace(/justify-content-\w+/, 'justify-content-center');
      group.style.position = 'relative';
      group.style.left = '1%';
      break;
  }
}

function applyBookDetailsRowLayout(group, variant) {
  // Apply different row layouts based on variant
  switch(variant) {
    case 1: // Default: Image left, Info right
      group.className = group.className.replace(/no-gutters/, 'no-gutters');
      break;
    case 2: // Reversed: Info left, Image right
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        group.removeChild(imageCol);
        group.removeChild(infoCol);
        group.appendChild(infoCol);
        group.appendChild(imageCol);
      }
      break;
    case 3: // Stacked: Image top, Info bottom
      group.className = group.className.replace(/no-gutters/, 'no-gutters flex-column');
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        imageCol.className = imageCol.className.replace(/col-md-4/, 'col-12');
        infoCol.className = infoCol.className.replace(/col-md-8/, 'col-12');
      }
      break;
    case 4: // Stacked: Info top, Image bottom
      group.className = group.className.replace(/no-gutters/, 'no-gutters flex-column');
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        group.removeChild(imageCol);
        group.removeChild(infoCol);
        group.appendChild(infoCol);
        group.appendChild(imageCol);
        imageCol.className = imageCol.className.replace(/col-md-4/, 'col-12');
        infoCol.className = infoCol.className.replace(/col-md-8/, 'col-12');
      }
      break;
    case 5: // Centered image, full width info
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        imageCol.className = imageCol.className.replace(/col-md-4/, 'col-md-6 col-lg-4');
        infoCol.className = infoCol.className.replace(/col-md-8/, 'col-12');
      }
      break;
    case 6: // Full width image, centered info
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        imageCol.className = imageCol.className.replace(/col-md-4/, 'col-12');
        infoCol.className = infoCol.className.replace(/col-md-8/, 'col-md-6 col-lg-8');
      }
      break;
    case 7: // Narrow image, wide info
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        imageCol.className = imageCol.className.replace(/col-md-4/, 'col-md-3');
        infoCol.className = infoCol.className.replace(/col-md-8/, 'col-md-9');
      }
      break;
    case 8: // Wide image, narrow info
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        imageCol.className = imageCol.className.replace(/col-md-4/, 'col-md-6');
        infoCol.className = infoCol.className.replace(/col-md-8/, 'col-md-6');
      }
      break;
    case 9: // Responsive layout
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        imageCol.className = imageCol.className.replace(/col-md-4/, 'col-12 col-sm-6 col-md-4');
        infoCol.className = infoCol.className.replace(/col-md-8/, 'col-12 col-sm-6 col-md-8');
      }
      break;
    case 10: // Custom layout
      var imageCol = group.querySelector('[data-dynamic-group="book-image-column"]');
      var infoCol = group.querySelector('[data-dynamic-group="book-info-column"]');
      if (imageCol && infoCol) {
        imageCol.className = imageCol.className.replace(/col-md-4/, 'col-md-5');
        infoCol.className = infoCol.className.replace(/col-md-8/, 'col-md-7');
      }
      break;
  }
}

function applyBookInfoSectionLayout(group, variant) {
  // Apply different info section layouts based on variant
  var leftCol = group.querySelector('[data-dynamic-group="book-info-left"]');
  var rightCol = group.querySelector('[data-dynamic-group="book-info-right"]');
  
  if (!leftCol || !rightCol) return;
  
  // Use deterministic shuffle based on variant for consistent results
  function deterministicShuffle(array, seed) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = (seed + i) % (i + 1);
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
  
  switch(variant) {
    case 1: // Default order: Left, Right
      break;
    case 2: // Reversed order: Right, Left
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      group.appendChild(rightCol);
      group.appendChild(leftCol);
      break;
    case 3: // Deterministic shuffle with seed 3
      var shuffled = deterministicShuffle([leftCol, rightCol], 3);
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      shuffled.forEach(function(col) { group.appendChild(col); });
      break;
    case 4: // Deterministic shuffle with seed 4
      var shuffled = deterministicShuffle([leftCol, rightCol], 4);
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      shuffled.forEach(function(col) { group.appendChild(col); });
      break;
    case 5: // Deterministic shuffle with seed 5
      var shuffled = deterministicShuffle([leftCol, rightCol], 5);
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      shuffled.forEach(function(col) { group.appendChild(col); });
      break;
    case 6: // Deterministic shuffle with seed 6
      var shuffled = deterministicShuffle([leftCol, rightCol], 6);
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      shuffled.forEach(function(col) { group.appendChild(col); });
      break;
    case 7: // Deterministic shuffle with seed 7
      var shuffled = deterministicShuffle([leftCol, rightCol], 7);
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      shuffled.forEach(function(col) { group.appendChild(col); });
      break;
    case 8: // Deterministic shuffle with seed 8
      var shuffled = deterministicShuffle([leftCol, rightCol], 8);
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      shuffled.forEach(function(col) { group.appendChild(col); });
      break;
    case 9: // Deterministic shuffle with seed 9
      var shuffled = deterministicShuffle([leftCol, rightCol], 9);
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      shuffled.forEach(function(col) { group.appendChild(col); });
      break;
    case 10: // Deterministic shuffle with seed 10
      var shuffled = deterministicShuffle([leftCol, rightCol], 10);
      group.removeChild(leftCol);
      group.removeChild(rightCol);
      shuffled.forEach(function(col) { group.appendChild(col); });
      break;
  }
}

function applyBookActionsLayout(group, variant) {
  // Apply different action button layouts based on variant
  var buttons = Array.prototype.slice.call(group.querySelectorAll('a, button'));
  if (buttons.length < 2) return;
  
  // Use deterministic shuffle based on variant for consistent results
  function deterministicShuffle(array, seed) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = (seed + i) % (i + 1);
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
  
  switch(variant) {
    case 1: // Default order
      break;
    case 2: // Reversed order
      var reversed = buttons.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(btn) { group.appendChild(btn); });
      break;
    case 3: // Deterministic shuffle with seed 3
      var shuffled = deterministicShuffle(buttons, 3);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(btn) { group.appendChild(btn); });
      break;
    case 4: // Deterministic shuffle with seed 4
      var shuffled = deterministicShuffle(buttons, 4);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(btn) { group.appendChild(btn); });
      break;
    case 5: // Deterministic shuffle with seed 5
      var shuffled = deterministicShuffle(buttons, 5);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(btn) { group.appendChild(btn); });
      break;
    case 6: // Deterministic shuffle with seed 6
      var shuffled = deterministicShuffle(buttons, 6);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(btn) { group.appendChild(btn); });
      break;
    case 7: // Deterministic shuffle with seed 7
      var shuffled = deterministicShuffle(buttons, 7);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(btn) { group.appendChild(btn); });
      break;
    case 8: // Deterministic shuffle with seed 8
      var shuffled = deterministicShuffle(buttons, 8);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(btn) { group.appendChild(btn); });
      break;
    case 9: // Deterministic shuffle with seed 9
      var shuffled = deterministicShuffle(buttons, 9);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(btn) { group.appendChild(btn); });
      break;
    case 10: // Deterministic shuffle with seed 10
      var shuffled = deterministicShuffle(buttons, 10);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(btn) { group.appendChild(btn); });
      break;
  }
}

// Comment section layout functions
function applyCommentsSectionLayout(group, variant) {
  // Apply different comment section layouts based on variant
  var header = group.querySelector('[data-dynamic-group="comments-header"]');
  var body = group.querySelector('[data-dynamic-group="comments-body"]');
  
  if (!header || !body) return;
  
  // Clear the section
  while (group.firstChild) {
    group.removeChild(group.firstChild);
  }
  
  switch(variant) {
    case 1: // Default order: Header, Body
      group.appendChild(header);
      group.appendChild(body);
      break;
    case 2: // Reversed order: Body, Header
      group.appendChild(body);
      group.appendChild(header);
      break;
    case 3: // Header, Body with custom spacing
      group.appendChild(header);
      group.appendChild(body);
      header.style.marginBottom = '0';
      body.style.marginTop = '0';
      break;
    case 4: // Header, Body with increased spacing
      group.appendChild(header);
      group.appendChild(body);
      header.style.marginBottom = '10px';
      body.style.marginTop = '10px';
      break;
    case 5: // Header, Body with custom positioning
      group.appendChild(header);
      group.appendChild(body);
      header.style.position = 'relative';
      header.style.zIndex = '1';
      break;
    case 6: // Header, Body with flex layout
      group.appendChild(header);
      group.appendChild(body);
      group.style.display = 'flex';
      group.style.flexDirection = 'column';
      group.style.gap = '5px';
      break;
    case 7: // Body, Header with zero margins
      group.appendChild(body);
      group.appendChild(header);
      body.style.marginBottom = '0';
      header.style.marginTop = '0';
      break;
    case 8: // Body, Header with spacing
      group.appendChild(body);
      group.appendChild(header);
      body.style.marginBottom = '8px';
      header.style.marginTop = '8px';
      break;
    case 9: // Body, Header with custom positioning
      group.appendChild(body);
      group.appendChild(header);
      body.style.position = 'relative';
      body.style.zIndex = '1';
      break;
    case 10: // Body, Header with flex layout
      group.appendChild(body);
      group.appendChild(header);
      group.style.display = 'flex';
      group.style.flexDirection = 'column-reverse';
      group.style.gap = '3px';
      break;
  }
}

function applyCommentFormLayout(group, variant) {
  // Apply different comment form layouts based on variant
  var nameField = group.querySelector('[data-dynamic-group="comment-name"]');
  var contentField = group.querySelector('[data-dynamic-group="comment-content"]');
  var submitBtn = group.querySelector('[data-dynamic-group="comment-submit"]');
  
  if (!nameField || !contentField || !submitBtn) return;
  
  // Use deterministic shuffle based on variant for consistent results
  function deterministicShuffle(array, seed) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = (seed + i) % (i + 1);
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
  
  switch(variant) {
    case 1: // Default order: Name, Content, Submit
      break;
    case 2: // Reversed order: Submit, Content, Name
      var reversed = [nameField, contentField, submitBtn].reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(field) { group.appendChild(field); });
      break;
    case 3: // Deterministic shuffle with seed 3
      var shuffled = deterministicShuffle([nameField, contentField, submitBtn], 3);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 4: // Deterministic shuffle with seed 4
      var shuffled = deterministicShuffle([nameField, contentField, submitBtn], 4);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 5: // Deterministic shuffle with seed 5
      var shuffled = deterministicShuffle([nameField, contentField, submitBtn], 5);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 6: // Deterministic shuffle with seed 6
      var shuffled = deterministicShuffle([nameField, contentField, submitBtn], 6);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 7: // Deterministic shuffle with seed 7
      var shuffled = deterministicShuffle([nameField, contentField, submitBtn], 7);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 8: // Deterministic shuffle with seed 8
      var shuffled = deterministicShuffle([nameField, contentField, submitBtn], 8);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 9: // Deterministic shuffle with seed 9
      var shuffled = deterministicShuffle([nameField, contentField, submitBtn], 9);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
    case 10: // Deterministic shuffle with seed 10
      var shuffled = deterministicShuffle([nameField, contentField, submitBtn], 10);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(field) { group.appendChild(field); });
      break;
  }
}

function applyCommentsListLayout(group, variant) {
  // Apply different comment list layouts based on variant
  var comments = Array.prototype.slice.call(group.querySelectorAll('[data-dynamic-group="comment-item"]'));
  if (comments.length < 2) return;
  
  // Use deterministic shuffle based on variant for consistent results
  function deterministicShuffle(array, seed) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = (seed + i) % (i + 1);
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
  
  switch(variant) {
    case 1: // Default order (newest first)
      break;
    case 2: // Reversed order (oldest first)
      var reversed = comments.slice().reverse();
      while (group.firstChild) group.removeChild(group.firstChild);
      reversed.forEach(function(comment) { group.appendChild(comment); });
      break;
    case 3: // Deterministic shuffle with seed 3
      var shuffled = deterministicShuffle(comments, 3);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(comment) { group.appendChild(comment); });
      break;
    case 4: // Deterministic shuffle with seed 4
      var shuffled = deterministicShuffle(comments, 4);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(comment) { group.appendChild(comment); });
      break;
    case 5: // Deterministic shuffle with seed 5
      var shuffled = deterministicShuffle(comments, 5);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(comment) { group.appendChild(comment); });
      break;
    case 6: // Deterministic shuffle with seed 6
      var shuffled = deterministicShuffle(comments, 6);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(comment) { group.appendChild(comment); });
      break;
    case 7: // Deterministic shuffle with seed 7
      var shuffled = deterministicShuffle(comments, 7);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(comment) { group.appendChild(comment); });
      break;
    case 8: // Deterministic shuffle with seed 8
      var shuffled = deterministicShuffle(comments, 8);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(comment) { group.appendChild(comment); });
      break;
    case 9: // Deterministic shuffle with seed 9
      var shuffled = deterministicShuffle(comments, 9);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(comment) { group.appendChild(comment); });
      break;
    case 10: // Deterministic shuffle with seed 10
      var shuffled = deterministicShuffle(comments, 10);
      while (group.firstChild) group.removeChild(group.firstChild);
      shuffled.forEach(function(comment) { group.appendChild(comment); });
      break;
  }
}

function applyCommentItemLayout(group, variant) {
  // Apply different comment item layouts based on variant
  var avatar = group.querySelector('[data-dynamic-group="comment-avatar"]');
  var content = group.querySelector('[data-dynamic-group="comment-content"]');
  
  if (!avatar || !content) return;
  
  // Clear the comment item
  while (group.firstChild) {
    group.removeChild(group.firstChild);
  }
  
  switch(variant) {
    case 1: // Default order: Avatar, Content
      group.appendChild(avatar);
      group.appendChild(content);
      break;
    case 2: // Reversed order: Content, Avatar
      group.appendChild(content);
      group.appendChild(avatar);
      break;
    case 3: // Avatar, Content with custom spacing
      group.appendChild(avatar);
      group.appendChild(content);
      avatar.style.marginRight = '0';
      content.style.marginLeft = '0';
      break;
    case 4: // Avatar, Content with increased spacing
      group.appendChild(avatar);
      group.appendChild(content);
      avatar.style.marginRight = '20px';
      content.style.marginLeft = '20px';
      break;
    case 5: // Avatar, Content with custom positioning
      group.appendChild(avatar);
      group.appendChild(content);
      avatar.style.position = 'relative';
      avatar.style.zIndex = '1';
      break;
    case 6: // Avatar, Content with flex layout
      group.appendChild(avatar);
      group.appendChild(content);
      group.style.display = 'flex';
      group.style.gap = '10px';
      break;
    case 7: // Content, Avatar with zero margins
      group.appendChild(content);
      group.appendChild(avatar);
      content.style.marginRight = '0';
      avatar.style.marginLeft = '0';
      break;
    case 8: // Content, Avatar with spacing
      group.appendChild(content);
      group.appendChild(avatar);
      content.style.marginRight = '15px';
      avatar.style.marginLeft = '15px';
      break;
    case 9: // Content, Avatar with custom positioning
      group.appendChild(content);
      group.appendChild(avatar);
      content.style.position = 'relative';
      content.style.zIndex = '1';
      break;
    case 10: // Content, Avatar with flex layout
      group.appendChild(content);
      group.appendChild(avatar);
      group.style.display = 'flex';
      group.style.flexDirection = 'row-reverse';
      group.style.gap = '8px';
      break;
  }
}

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

    var SKIP_TAGS = { 'SCRIPT':1, 'STYLE':1, 'LINK':1, 'META':1, 'TITLE':1, 'HEAD':1, 'HTML':1, 'MAIN':1 };
    
    // Function to check if element should be completely skipped
    function shouldSkipElement(el) {
      if (!el) return true;
      if (SKIP_TAGS[el.tagName]) return true;
      if (el.getAttribute && el.getAttribute('data-dynamic')==='off') return true;
      if (el.className && el.className.includes('hero-section')) return true;
      // Also skip if element is inside a hero section
      if (el.closest && el.closest('.hero-section')) return true;
      // Skip main element to prevent it from being reordered
      if (el.tagName === 'MAIN') return true;
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
      
      // Special handling for MAIN element - skip it completely to prevent reordering
      if (el.tagName === 'MAIN') {
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
      // Calculate layout variant (1-10)
      var layoutVariant = ((seed - 1) % 10) + 1;
      
      // Apply layout-specific styling
      document.body.setAttribute('data-layout-variant', layoutVariant);
      document.body.classList.add('layout-variant-' + layoutVariant);
      
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
      
      // Handle data-dynamic-group elements with 10 layout variants
      var dynamicGroups = document.querySelectorAll('[data-dynamic-group]');
      dynamicGroups.forEach(function(group){
        var groupName = group.getAttribute('data-dynamic-group');
        
        // Skip main element to prevent it from being reordered
        if (group.tagName === 'MAIN' || groupName === 'main') {
          return;
        }
        
        // Allow hero-content to be processed even if data-dynamic="off" for internal reordering
        if (group.getAttribute('data-dynamic') === 'off' && groupName !== 'hero-content') {
          return;
        }
        
        // Apply layout variant to all groups
        group.classList.add('layout-variant-' + layoutVariant);
        
        if (groupName === 'navbar-nav') {
          applyNavbarLayout(group, layoutVariant);
        } else if (groupName === 'book-grid') {
          applyBookGridLayout(group, layoutVariant);
        } else if (groupName === 'hero-content') {
          applyHeroLayout(group, layoutVariant);
        } else if (groupName === 'footer-columns') {
          applyFooterLayout(group, layoutVariant);
        } else if (groupName === 'footer-links') {
          applyFooterLinksLayout(group, layoutVariant);
        } else if (groupName === 'footer-social') {
          applyFooterSocialLayout(group, layoutVariant);
        } else if (groupName === 'login-container') {
          applyLoginContainerLayout(group, layoutVariant);
        } else if (groupName === 'login-column') {
          applyLoginColumnLayout(group, layoutVariant);
        } else if (groupName === 'login-form-fields') {
          applyLoginFormFieldsLayout(group, layoutVariant);
        } else if (groupName === 'login-card') {
          applyLoginCardLayout(group, layoutVariant);
        } else if (groupName === 'register-container') {
          applyRegisterContainerLayout(group, layoutVariant);
        } else if (groupName === 'register-column') {
          applyRegisterColumnLayout(group, layoutVariant);
        } else if (groupName === 'register-form-fields') {
          applyRegisterFormFieldsLayout(group, layoutVariant);
        } else if (groupName === 'register-card') {
          applyRegisterCardLayout(group, layoutVariant);
        } else if (groupName === 'book-details-container') {
          applyBookDetailsContainerLayout(group, layoutVariant);
        } else if (groupName === 'book-details-row') {
          applyBookDetailsRowLayout(group, layoutVariant);
        } else if (groupName === 'book-info-row') {
          applyBookInfoSectionLayout(group, layoutVariant);
        } else if (groupName === 'book-actions') {
          applyBookActionsLayout(group, layoutVariant);
        } else if (groupName === 'comments-section') {
          applyCommentsSectionLayout(group, layoutVariant);
        } else if (groupName === 'comment-form') {
          applyCommentFormLayout(group, layoutVariant);
        } else if (groupName === 'comments-list') {
          applyCommentsListLayout(group, layoutVariant);
        } else if (groupName === 'comment-item') {
          applyCommentItemLayout(group, layoutVariant);
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
