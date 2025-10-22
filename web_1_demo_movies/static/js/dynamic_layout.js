function __runDynamicLayout(){
  try {
    var params0 = new URLSearchParams(window.location.search);
    var debugForce = params0.get('forceDynamic') === '1';
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

    function reorderGroup(groupEl, sel){
      if (!groupEl) return;
      var items = Array.prototype.slice.call(groupEl.querySelectorAll(sel));
      if (items.length < 2) return;
      var salt = saltedHash(groupEl.tagName + '|' + groupEl.className + '|' + (groupEl.id || ''));
      var rand = seededRandomWithSalt(salt);
      var buckets = {0:[],1:[],2:[]};
      for (var i=0;i<items.length;i++){ var b=(seed+i)%3; buckets[b].push(items[i]); }
      function shuffle(arr){ var idxs=arr.map(function(_,k){return k;}); for (var t=idxs.length-1;t>0;t--){ var j=Math.floor(rand()*(t+1)); var tmp=idxs[t]; idxs[t]=idxs[j]; idxs[j]=tmp; } return idxs.map(function(k){return arr[k];}); }
      var top=shuffle(buckets[0]), mid=shuffle(buckets[1]), bot=shuffle(buckets[2]);
      var mode = seed%3; var newOrder = mode===0? top.concat(mid,bot) : (mode===1? mid.concat(bot,top) : bot.concat(top,mid));
      newOrder.forEach(function(el){ groupEl.appendChild(el); });
    }

    function reorderChildren(el, depth){
      if (!el || depth<=0) return; if (SKIP_TAGS[el.tagName]) return; if (el.getAttribute && el.getAttribute('data-dynamic')==='off') return;
      var children = Array.prototype.slice.call(el.children||[]);
      if (children.length>1) reorderGroup(el, ':scope > *');
      for (var k=0;k<children.length;k++) reorderChildren(children[k], depth-1);
    }

    // Only perform reordering when explicitly forced via ?forceDynamic=1
    if (debugForce) {
      // Known groups (add markers in templates if needed)
      var navbar = document.querySelector('.navbar-nav'); if (navbar) reorderGroup(navbar, ':scope > li');
      var rows = document.querySelectorAll('.row'); rows.forEach(function(r){ reorderGroup(r, ':scope > [class*="col-"]'); });
      var lists = document.querySelectorAll('ul,ol,.dropdown-menu,.list-group'); lists.forEach(function(l){ reorderGroup(l, ':scope > *'); });

      // Reorder selects (keep first placeholder)
      document.querySelectorAll('select').forEach(function(sel){
        var opts = Array.prototype.slice.call(sel.options); if (opts.length<=2) return;
        var head=null; if (opts[0] && (opts[0].value===''||opts[0].disabled)) head=opts.shift();
        var salt = saltedHash((sel.id||sel.name||'select') + '|' + (sel.className||'')); var rand = seededRandomWithSalt(salt);
        var idxs = opts.map(function(_,i){return i;}); for (var i=idxs.length-1;i>0;i--){ var j=Math.floor(rand()*(i+1)); var tmp=idxs[i]; idxs[i]=idxs[j]; idxs[j]=tmp; }
        var selectedVal = sel.value; while (sel.firstChild) sel.removeChild(sel.firstChild); if (head) sel.appendChild(head);
        idxs.forEach(function(k){ sel.appendChild(opts[k]); }); if (selectedVal) sel.value=selectedVal;
      });

      // Global recursive pass strengthens vertical movement across the page
      reorderChildren(document.body, 4);
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
  } catch(e) { console.error('dynamic movies init failed', e); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', __runDynamicLayout); else __runDynamicLayout();


