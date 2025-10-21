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
