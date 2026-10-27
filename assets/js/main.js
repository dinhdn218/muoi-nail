(function(){
  "use strict";
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var f = function(n){ return Math.round(n*10)/10; };

  var COLORS = [
    {code:'M-00', name:'Đỏ Mười',     hex:'#E2334F', fin:'bong'},
    {code:'M-01', name:'Xôi Gấc',     hex:'#E0552E', fin:'bong'},
    {code:'M-02', name:'Hồng Sen',    hex:'#E88FA9', fin:'bong'},
    {code:'M-03', name:'Khoai Môn',   hex:'#9B7DC8', fin:'bong'},
    {code:'M-04', name:'Trà Sữa',     hex:'#CFA686', fin:'bong'},
    {code:'M-05', name:'Bạc Hà',      hex:'#8DD5BF', fin:'bong'},
    {code:'M-06', name:'Cốm Non',     hex:'#93B55E', fin:'li'},
    {code:'M-07', name:'Cà Phê Muối', hex:'#6E4B3C', fin:'li'},
    {code:'M-08', name:'Sương Sớm',   hex:'#A9C3DC', fin:'li'},
    {code:'M-09', name:'Hoa Sữa',     hex:'#F2EADD', fin:'nhu'},
    {code:'M-10', name:'Mận Hậu',     hex:'#702249', fin:'bong'},
    {code:'M-11', name:'Bánh Flan',   hex:'#EDB548', fin:'nhu'},
    {code:'M-12', name:'Thạch Đen',   hex:'#2B2427', fin:'bong'}
  ];
  var BY = {}; COLORS.forEach(function(c){ BY[c.code] = c; });
  var FIN = {bong:'Bóng', li:'Lì', nhu:'Nhũ'};
  var HERO_SW = ['M-00','M-02','M-03','M-04','M-05','M-01','M-11','M-10','M-12'];
  var SHAPES = [{id:'tron',label:'Tròn'},{id:'vuong',label:'Vuông'},{id:'hanhnhan',label:'Hạnh nhân'},{id:'ballerina',label:'Ballerina'}];
  var SHAPE_NAME = {}; SHAPES.forEach(function(s){ SHAPE_NAME[s.id] = s.label; });
  var SKINS = [
    {id:'sang', label:'Da sáng', skin:'#F2CFB6', shade:'#D7A688'},
    {id:'trung', label:'Da trung bình', skin:'#D9A07A', shade:'#B47B57'},
    {id:'ngam', label:'Da ngăm', skin:'#9E6646', shade:'#7A4A31'}
  ];

  function onColor(hex){
    var n = parseInt(hex.slice(1),16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
    var L = (0.2126*r + 0.7152*g + 0.0722*b)/255;
    return L > 0.6 ? '#2A1720' : '#FFFFFF';
  }

  /* ---------- Nail geometry ---------- */
  function nailGeom(nw, shape){
    var r = nw/2, h = nw*1.22, sb = h - nw*0.3;
    var ext = {tron:0, vuong:nw*0.2, hanhnhan:nw*0.78, ballerina:nw*0.82}[shape];
    var bottom = 'L'+f(nw)+' '+f(sb)+' Q'+f(nw)+' '+f(h)+' '+f(r)+' '+f(h)+' Q0 '+f(h)+' 0 '+f(sb)+'Z';
    var top;
    if (shape === 'tron') top = 'M0 '+f(sb)+' L0 '+f(r)+' A'+f(r)+' '+f(r)+' 0 0 1 '+f(nw)+' '+f(r)+' ';
    else if (shape === 'vuong') top = 'M0 '+f(sb)+' L0 '+f(-ext+5)+' Q0 '+f(-ext)+' 5 '+f(-ext)+' L'+f(nw-5)+' '+f(-ext)+' Q'+f(nw)+' '+f(-ext)+' '+f(nw)+' '+f(-ext+5)+' ';
    else if (shape === 'hanhnhan') top = 'M0 '+f(sb)+' L0 '+f(nw*0.3)+' C0 '+f(-ext*0.35)+' '+f(nw*0.26)+' '+f(-ext)+' '+f(r)+' '+f(-ext)+' C'+f(nw*0.74)+' '+f(-ext)+' '+f(nw)+' '+f(-ext*0.35)+' '+f(nw)+' '+f(nw*0.3)+' ';
    else top = 'M0 '+f(sb)+' L0 '+f(nw*0.3)+' L'+f(nw*0.25)+' '+f(-ext+4)+' Q'+f(nw*0.27)+' '+f(-ext)+' '+f(nw*0.32)+' '+f(-ext)+' L'+f(nw*0.68)+' '+f(-ext)+' Q'+f(nw*0.73)+' '+f(-ext)+' '+f(nw*0.75)+' '+f(-ext+4)+' L'+f(nw)+' '+f(nw*0.3)+' ';
    var gy0 = shape === 'tron' ? nw*0.42 : (-ext*0.45 + nw*0.3);
    var gloss = 'M'+f(nw*0.25)+' '+f(gy0)+' Q'+f(nw*0.19)+' '+f((gy0+h*0.72)/2)+' '+f(nw*0.25)+' '+f(h*0.72);
    return {d: top + bottom, gloss: gloss, h: h, ext: ext};
  }

  /* ---------- Hand ---------- */
  var FINGERS = [
    {x:110, y:330, w:60, len:140, rot:-36},
    {x:124, y:100, w:54, len:230},
    {x:182, y:72,  w:57, len:258},
    {x:239, y:94,  w:53, len:236},
    {x:290, y:150, w:46, len:180}
  ];
  var state = {code:'M-00', shape:'tron', skin:'sang', set:null};
  var hand = $('#hand');
  var nails = [];

  function buildHand(){
    var ns = 'http://www.w3.org/2000/svg';
    var defs = '<defs><pattern id="glit" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.6" cy="1.6" r=".9" fill="#FFFFFF" opacity=".95"/><circle cx="5" cy="4.6" r=".65" fill="#FFFFFF" opacity=".6"/></pattern>'+
      '<pattern id="rib" width="12" height="10" patternUnits="userSpaceOnUse"><rect class="rib" width="6" height="10"/></pattern></defs>';
    var palm = '<path class="palm" d="M94 300 C94 268 102 252 126 250 L294 250 C312 251 318 266 316 290 L312 420 L100 420 Z"/>'+
      '<path class="edge" d="M96 262 C93 300 96 340 100 372"/><path class="edge" d="M316 262 C318 300 315 340 312 372"/>';
    function fingerSvg(F, i){
      var nw = F.w*0.68, g = nailGeom(nw, state.shape), tf;
      if (F.rot) tf = 'translate('+F.x+' '+F.y+') rotate('+F.rot+') translate(0 '+(-F.len)+')';
      else tf = 'translate('+F.x+' '+F.y+')';
      var yTop = -nw-6, yBot = g.h+3;
      return '<g transform="'+tf+'"><g class="f-anim" style="animation-delay:'+(0.18+i*0.07)+'s">'+
        '<rect class="skin" x="'+(-F.w/2)+'" y="0" width="'+F.w+'" height="'+(F.len+(F.rot?22:40))+'" rx="'+(F.w/2)+'"/>'+
        '<path class="crease" d="M'+f(-F.w*0.2)+' '+f(F.len*0.36)+' q'+f(F.w*0.2)+' 5 '+f(F.w*0.4)+' 0"/>'+
        '<g transform="translate('+f(-nw/2)+' '+f(F.w*0.09)+')">'+
          '<g class="nail" data-i="'+i+'" style="--d:'+(2+i*0.14)+'s">'+
            '<clipPath id="nc'+i+'"><path class="nshape" d="'+g.d+'"/></clipPath>'+
            '<g clip-path="url(#nc'+i+')">'+
              '<rect class="coat-base" x="-3" y="'+f(yTop)+'" width="'+f(nw+6)+'" height="'+f(yBot-yTop)+'" fill="#E2334F"/>'+
              '<rect class="coat-new" x="-3" y="'+f(yBot)+'" width="'+f(nw+6)+'" height="0" fill="#E2334F"/>'+
              '<rect class="glitter" x="-3" y="'+f(yTop)+'" width="'+f(nw+6)+'" height="'+f(yBot-yTop)+'" fill="url(#glit)"/>'+
              '<rect class="shine" x="'+f(-nw*0.9)+'" y="'+f(yTop)+'" width="'+f(nw*0.3)+'" height="'+f(yBot-yTop)+'" style="--tx:'+f(nw*2.6)+'px"/>'+
            '</g>'+
            '<path class="gloss" d="'+g.gloss+'" stroke-width="'+f(nw*0.11)+'"/>'+
            '<path class="nedge nshape" d="'+g.d+'"/>'+
          '</g>'+
        '</g>'+
      '</g></g>';
    }
    var fingers = FINGERS.slice(1).map(function(F, k){ return fingerSvg(F, k+1); }).join('');
    var thumb = fingerSvg(FINGERS[0], 0);
    var cuff = '<g class="f-anim" style="animation-delay:.1s"><rect class="cuff" x="88" y="360" width="236" height="70" rx="14"/><rect x="88" y="372" width="236" height="58" fill="url(#rib)" opacity=".9"/></g>';
    hand.innerHTML = defs + '<g class="f-anim" style="animation-delay:.12s">'+palm+'</g>' + fingers + thumb + cuff;
    nails = [];
    hand.querySelectorAll('.nail').forEach(function(el){
      var i = +el.getAttribute('data-i');
      var F = FINGERS[i], nw = F.w*0.68;
      nails[i] = {el:el, nw:nw, base:el.querySelector('.coat-base'), neu:el.querySelector('.coat-new'), shapes:el.querySelectorAll('.nshape'), gloss:el.querySelector('.gloss'), token:0};
    });
  }

  function setSkin(id){
    var s = SKINS.filter(function(k){ return k.id === id; })[0] || SKINS[0];
    state.skin = s.id;
    hand.style.setProperty('--skin', s.skin);
    hand.style.setProperty('--skin-shade', s.shade);
    document.querySelectorAll('#skins button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.id === s.id ? 'true' : 'false'); });
  }

  function setShape(id, animate){
    state.shape = id;
    nails.forEach(function(n){
      var g = nailGeom(n.nw, id);
      n.shapes.forEach(function(p){ p.setAttribute('d', g.d); });
      n.gloss.setAttribute('d', g.gloss);
      if (animate && !reduce){ n.el.classList.remove('pop'); void n.el.getBoundingClientRect(); n.el.classList.add('pop'); }
    });
    document.querySelectorAll('#shapes button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'); });
  }

  function paintNail(n, i, c, immediate){
    n.el.setAttribute('data-finish', c.fin);
    var token = ++n.token;
    var yTop = -n.nw-6, yBot = nailGeom(n.nw, state.shape).h + 3;
    var H = yBot - yTop;
    if (immediate || reduce){ n.base.setAttribute('fill', c.hex); n.neu.setAttribute('height', 0); return; }
    if (+n.neu.getAttribute('height') > 0 && n.neu.dataset.hex) n.base.setAttribute('fill', n.neu.dataset.hex);
    n.neu.setAttribute('fill', c.hex); n.neu.dataset.hex = c.hex;
    n.neu.setAttribute('y', yBot); n.neu.setAttribute('height', 0);
    var t0 = performance.now() + i*85, dur = 520;
    function step(t){
      if (n.token !== token) return;
      var p = Math.min(1, Math.max(0, (t - t0)/dur));
      var e = 1 - Math.pow(1-p, 3), hh = H*e;
      n.neu.setAttribute('y', f(yBot-hh)); n.neu.setAttribute('height', f(hh));
      if (p < 1) requestAnimationFrame(step);
      else { n.base.setAttribute('fill', c.hex); n.neu.setAttribute('height', 0); }
    }
    requestAnimationFrame(step);
  }

  var stage = $('#stage'), nowChip = $('#now');
  function setLive(c){
    stage.style.setProperty('--polish', c.hex);
    document.documentElement.style.setProperty('--live', c.hex);
  }
  function bumpChip(){ if (reduce) return; nowChip.classList.remove('swap'); void nowChip.offsetWidth; nowChip.classList.add('swap'); }

  function applyColor(code, opts){
    opts = opts || {};
    var c = BY[code]; if (!c) return;
    state.code = code; state.set = null;
    nails.forEach(function(n, i){ paintNail(n, i, c, opts.immediate); });
    setLive(c);
    $('#now-dot').style.background = c.hex;
    $('#now-name').textContent = c.name;
    $('#now-code').textContent = c.code + ' · ' + FIN[c.fin];
    bumpChip();
    document.querySelectorAll('#swatches .sw').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.code === code ? 'true' : 'false'); });
    syncPick(c);
  }

  function applySet(occ){
    state.set = occ.id;
    var cs = occ.nails.map(function(k){ return BY[k]; });
    nails.forEach(function(n, i){ paintNail(n, i, cs[i]); });
    var uniq = []; occ.nails.forEach(function(k){ if (uniq.indexOf(k) < 0) uniq.push(k); });
    var main = BY[uniq[0]];
    setLive(main);
    var stops = uniq.map(function(k, j){ var a = j*100/uniq.length, b = (j+1)*100/uniq.length; return BY[k].hex+' '+a+'% '+b+'%'; }).join(',');
    $('#now-dot').style.background = 'conic-gradient(' + stops + ')';
    $('#now-name').textContent = 'Bộ ' + occ.tab;
    $('#now-code').textContent = uniq.join(' · ');
    bumpChip();
    document.querySelectorAll('#swatches .sw').forEach(function(b){ b.setAttribute('aria-pressed', 'false'); });
    state.code = main.code;
    syncPick(main);
  }

  /* ---------- Hero controls ---------- */
  var cycling = !reduce, cycleTimer = null, cycleIdx = 0, stageVisible = true;
  function stopCycle(){ cycling = false; if (cycleTimer) clearInterval(cycleTimer); cycleTimer = null; }
  function buildControls(){
    var sw = $('#swatches');
    HERO_SW.forEach(function(code){
      var c = BY[code], b = document.createElement('button');
      b.type = 'button'; b.className = 'sw'; b.dataset.code = code;
      b.style.setProperty('--c', c.hex);
      b.setAttribute('aria-label', c.code + ' ' + c.name + ', ' + FIN[c.fin]);
      b.title = c.name;
      b.addEventListener('click', function(){ stopCycle(); applyColor(code); });
      sw.appendChild(b);
    });
    var sh = $('#shapes');
    SHAPES.forEach(function(s){
      var b = document.createElement('button'), g = nailGeom(10, s.id);
      b.type = 'button'; b.dataset.id = s.id;
      b.innerHTML = '<svg viewBox="-1 '+f(-g.ext-1)+' 12 '+f(g.h+g.ext+2)+'" aria-hidden="true"><path d="'+g.d+'"/></svg>' + s.label;
      b.addEventListener('click', function(){ stopCycle(); setShape(s.id, true); });
      sh.appendChild(b);
    });
    var sk = $('#skins');
    SKINS.forEach(function(s){
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.id = s.id; b.style.setProperty('--c', s.skin);
      b.setAttribute('aria-label', s.label); b.title = s.label;
      b.addEventListener('click', function(){ stopCycle(); setSkin(s.id); });
      sk.appendChild(b);
    });
  }
  function startCycle(){
    if (!cycling) return;
    cycleTimer = setInterval(function(){
      if (!cycling || !stageVisible || document.hidden) return;
      cycleIdx = (cycleIdx + 1) % HERO_SW.length;
      applyColor(HERO_SW[cycleIdx]);
    }, 3200);
  }

  /* ---------- Marquee ---------- */
  (function(){
    var html = COLORS.slice(1).map(function(c){ return '<span><i style="--c:'+c.hex+'"></i>'+c.name+' <small>'+c.code+'</small></span>'; }).join('');
    $('#track').innerHTML = html + html;
  })();

  /* ---------- Collection ---------- */
  function bottleHtml(c){
    return '<div class="bottle" data-finish="'+c.fin+'" style="--c:'+c.hex+';--on:'+onColor(c.hex)+'"><span class="cap"></span><span class="neck"></span><span class="body"><b>mười</b></span></div>';
  }
  var shelf = $('#shelf'), shelfColors = COLORS.slice(1);
  shelfColors.forEach(function(c){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ccard'; b.dataset.fin = c.fin;
    b.style.setProperty('--c', c.hex);
    b.setAttribute('aria-label', 'Sơn thử ' + c.name + ', ' + c.code + ', ' + FIN[c.fin]);
    b.innerHTML = '<div class="stand">'+bottleHtml(c)+'</div><div class="meta"><div class="row"><span>'+c.code+'</span><span class="finish">'+FIN[c.fin]+'</span></div><span class="name">'+c.name+'</span><span class="try">Thử trên tay ↑</span></div>';
    b.addEventListener('click', function(){ stopCycle(); applyColor(c.code); goHero(); });
    shelf.appendChild(b);
  });
  var filters = [{id:'all',label:'Tất cả'},{id:'bong',label:'Bóng'},{id:'li',label:'Lì'},{id:'nhu',label:'Nhũ'}];
  filters.forEach(function(fl){
    var n = fl.id === 'all' ? shelfColors.length : shelfColors.filter(function(c){ return c.fin === fl.id; }).length;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'filter'; b.dataset.id = fl.id;
    b.setAttribute('aria-pressed', fl.id === 'all' ? 'true' : 'false');
    b.innerHTML = fl.label + '<span class="n">' + n + '</span>';
    b.addEventListener('click', function(){
      document.querySelectorAll('.filter').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var k = 0;
      shelf.querySelectorAll('.ccard').forEach(function(card){
        var show = fl.id === 'all' || card.dataset.fin === fl.id;
        card.hidden = !show;
        card.classList.remove('in');
        if (show && !reduce){ void card.offsetWidth; card.style.animationDelay = (k++*40)+'ms'; card.classList.add('in'); }
      });
    });
    $('#filters').appendChild(b);
  });

  function goHero(){
    var el = document.getElementById('thu-mau');
    el.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
  }

  /* ---------- Occasions ---------- */
  var OCC = [
    {id:'di-lam', tab:'Đi làm', when:'Thứ Hai – Thứ Sáu', title:'Gọn, sạch, gõ phím không vướng', copy:'Hai tông nude ấm phối cùng nhau trên dáng tròn ngắn. Cầm bút, gõ phím, rửa tay cả ngày vẫn thoải mái, ba tuần sau nhìn vẫn chỉn chu.', shape:'tron', nails:['M-04','M-04','M-09','M-04','M-04'], service:'Sơn gel trơn', svc:'gel', dur:'45 phút', price:'129k'},
    {id:'cuoi-tuan', tab:'Cà phê cuối tuần', when:'Thứ Bảy, Chủ Nhật', title:'Màu mát như ly đá xay', copy:'Bạc Hà và Sương Sớm xen kẽ từng ngón, thêm một ngón Hoa Sữa nhũ. Hợp áo phông, quần jeans và cái bàn cạnh cửa sổ.', shape:'vuong', nails:['M-05','M-08','M-09','M-05','M-08'], service:'Gel + vẽ 2 ngón', svc:'gelve', dur:'60 phút', price:'189k'},
    {id:'hen-ho', tab:'Hẹn hò', when:'Tối thứ Sáu', title:'Hồng Sen dịu, Mận Hậu làm điểm nhấn', copy:'Dáng hạnh nhân giúp ngón tay trông thon hơn. Bốn ngón hồng, riêng ngón áp út màu mận để ánh mắt có chỗ dừng lại.', shape:'hanhnhan', nails:['M-02','M-02','M-02','M-10','M-02'], service:'Úp móng gel', svc:'up', dur:'75 phút', price:'299k'},
    {id:'di-bien', tab:'Đi biển', when:'Kỳ nghỉ, cuối tuần dài', title:'Ba màu nắng cho cả tay lẫn chân', copy:'Xôi Gấc, Bánh Flan và Bạc Hà nổi bật trên da rám nắng, chịu được nước biển và kem chống nắng. Làm combo để tay chân đồng bộ.', shape:'vuong', nails:['M-01','M-11','M-05','M-01','M-11'], service:'Combo tay + chân', svc:'combo', dur:'80 phút', price:'229k'},
    {id:'tiec', tab:'Tiệc cuối năm', when:'Tháng 12, tiệc công ty', title:'Đậm, bóng gương và một chút nhũ', copy:'Mận Hậu và Thạch Đen bóng như gương, thêm Bánh Flan nhũ ở ngón áp út. Dáng ballerina dài vừa đủ để lên ảnh đẹp.', shape:'ballerina', nails:['M-10','M-12','M-10','M-11','M-12'], service:'Úp móng + nail art', svc:'upart', dur:'100 phút', price:'từ 349k'}
  ];
  var occIdx = 0, occPanel = $('#occ-panel');
  OCC.forEach(function(o, i){
    var b = document.createElement('button');
    var uniq = []; o.nails.forEach(function(k){ if (uniq.indexOf(k) < 0) uniq.push(k); });
    b.type = 'button'; b.className = 'occ-tab'; b.id = 'tab-' + o.id;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'occ-panel');
    b.innerHTML = '<span><strong>'+o.tab+'</strong><small>'+o.when+'</small></span><span class="dots" aria-hidden="true">'+uniq.map(function(k){ return '<i style="--c:'+BY[k].hex+'"></i>'; }).join('')+'</span>';
    b.addEventListener('click', function(){ showOcc(i, true); });
    b.addEventListener('keydown', function(e){
      var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
      if (!d) return; e.preventDefault();
      var j = (i + d + OCC.length) % OCC.length; showOcc(j, true); document.getElementById('tab-' + OCC[j].id).focus();
    });
    $('#occ-tabs').appendChild(b);
  });
  function pressonSvg(o){
    var sizes = [46,38,40,34,29], gap = 12, total = sizes.reduce(function(a,b){ return a+b; }, 0) + gap*4;
    var x = (300 - total)/2, base = 156, out = '<defs><pattern id="glit2" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.6" cy="1.6" r=".9" fill="#FFFFFF" opacity=".95"/><circle cx="5" cy="4.6" r=".65" fill="#FFFFFF" opacity=".6"/></pattern></defs>';
    sizes.forEach(function(nw, i){
      var c = BY[o.nails[i]], g = nailGeom(nw, o.shape);
      out += '<g transform="translate('+f(x)+' '+f(base-g.h)+')"><g class="pn nail" data-finish="'+c.fin+'" style="animation-delay:'+(i*60)+'ms">'+
        '<path d="'+g.d+'" fill="'+c.hex+'"/>'+
        (c.fin === 'nhu' ? '<path d="'+g.d+'" fill="url(#glit2)" opacity=".85"/>' : '')+
        '<path class="gloss" d="'+g.gloss+'" stroke-width="'+f(nw*0.11)+'"/>'+
        '<path d="'+g.d+'" fill="none" stroke="rgba(70,20,35,.18)"/></g></g>';
      x += nw + gap;
    });
    return out;
  }
  function showOcc(i, animate){
    occIdx = i; var o = OCC[i];
    document.querySelectorAll('.occ-tab').forEach(function(t, k){ t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    occPanel.setAttribute('aria-labelledby', 'tab-' + o.id);
    occPanel.style.setProperty('--c1', BY[o.nails[0]].hex);
    var pg = nailGeom(46, o.shape), y0 = Math.floor(156 - pg.h - pg.ext - 10);
    $('#presson').setAttribute('viewBox', '0 ' + y0 + ' 300 ' + (166 - y0));
    $('#presson').innerHTML = pressonSvg(o);
    var uniq = []; o.nails.forEach(function(k){ if (uniq.indexOf(k) < 0) uniq.push(k); });
    $('#occ-names').textContent = uniq.map(function(k){ return BY[k].name + ' ' + k; }).join(' · ');
    $('#occ-when').textContent = o.when;
    $('#occ-title').textContent = o.title;
    $('#occ-copy').textContent = o.copy;
    $('#occ-shape').textContent = SHAPE_NAME[o.shape];
    $('#occ-service').textContent = o.service;
    $('#occ-dur').textContent = o.dur;
    $('#occ-price').textContent = o.price;
    if (animate && !reduce){ occPanel.classList.remove('swap'); void occPanel.offsetWidth; occPanel.classList.add('swap'); }
  }
  $('#occ-try').addEventListener('click', function(){
    var o = OCC[occIdx]; stopCycle();
    setShape(o.shape, false);
    applySet(o);
    var sel = $('#f-service'); if (sel) sel.value = o.svc;
    goHero();
  });

  /* ---------- Stamp card ---------- */
  var stampColors = ['M-02','M-05','M-03','M-11','M-01','M-08','M-04','M-10','M-06'];
  function stampHtml(n){
    if (n === 10) return '<span class="stamp free"><b>Lần 10<br>miễn phí</b></span>';
    var c = BY[stampColors[n-1]];
    return '<span class="stamp on" data-n="'+n+'" style="--c:'+c.hex+';--on:'+onColor(c.hex)+'"><i></i><b>'+n+'</b></span>';
  }
  $('#stamps-a').innerHTML = [1,2,3,4,5].map(stampHtml).join('');
  $('#stamps-b').innerHTML = [6,7,8,9,10].map(stampHtml).join('');

  /* ---------- Branches ---------- */
  var BRANCHES = [
    {id:'hang-bai', city:'Hà Nội', name:'Mười Hàng Bài', addr:'28 Hàng Bài, Hoàn Kiếm', note:'10 ghế · gửi xe máy miễn phí'},
    {id:'kim-ma', city:'Hà Nội', name:'Mười Kim Mã', addr:'210 Kim Mã, Ba Đình', note:'8 ghế · góc chờ có trà đá'},
    {id:'tran-duy-hung', city:'Hà Nội', name:'Mười Trần Duy Hưng', addr:'95 Trần Duy Hưng, Cầu Giấy', note:'12 ghế · phòng riêng cho nhóm bạn'},
    {id:'nguyen-trai', city:'TP.HCM', name:'Mười Nguyễn Trãi', addr:'168 Nguyễn Trãi, Bến Thành', note:'10 ghế · gửi xe máy miễn phí'},
    {id:'thao-dien', city:'TP.HCM', name:'Mười Thảo Điền', addr:'41 Xuân Thủy, Thảo Điền', note:'6 ghế · có sân vườn nhỏ'},
    {id:'bach-dang', city:'Đà Nẵng', name:'Mười Bạch Đằng', addr:'72 Bạch Đằng, Hải Châu', note:'8 ghế · nhìn ra sông Hàn'}
  ];
  function vnNow(){
    var o = {};
    try {
      new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})
        .formatToParts(new Date()).forEach(function(p){ o[p.type] = p.value; });
    } catch(e) {
      var d = new Date(Date.now() + 7*3600000);
      o = {year:String(d.getUTCFullYear()), month:('0'+(d.getUTCMonth()+1)).slice(-2), day:('0'+d.getUTCDate()).slice(-2), hour:String(d.getUTCHours()), minute:String(d.getUTCMinutes())};
    }
    return {date: o.year+'-'+o.month+'-'+o.day, mins: (parseInt(o.hour,10)%24)*60 + parseInt(o.minute,10)};
  }
  function statusText(){
    var m = vnNow().mins;
    if (m >= 540 && m < 1260) return {open:true, text:'Đang mở · đến 21:00'};
    if (m < 540) return {open:false, text:'Mở cửa lúc 9:00'};
    return {open:false, text:'Đã đóng · mở lại 9:00 sáng mai'};
  }
  function renderBranches(){
    var s = statusText();
    $('#branches').innerHTML = BRANCHES.map(function(b){
      return '<article class="branch lift"><span class="city">'+b.city+'</span><h3>'+b.name+'</h3><p>'+b.addr+'</p><p>'+b.note+'</p>'+
        '<div class="bfoot"><span class="status'+(s.open?' open':'')+'">'+s.text+'</span><a href="#dat-lich" data-branch="'+b.id+'">Đặt lịch ở đây →</a></div></article>';
    }).join('');
  }
  renderBranches();
  setInterval(renderBranchStatus, 60000);
  function renderBranchStatus(){
    var s = statusText();
    document.querySelectorAll('.branch .status').forEach(function(el){ el.textContent = s.text; el.classList.toggle('open', s.open); });
  }
  $('#branches').addEventListener('click', function(e){
    var a = e.target.closest('a[data-branch]'); if (!a) return;
    $('#f-branch').value = a.getAttribute('data-branch');
  });

  /* ---------- Booking ---------- */
  var SERVICES = [
    {id:'gel', label:'Sơn gel trơn · 129k'},
    {id:'gelve', label:'Gel + vẽ 2 ngón · 189k'},
    {id:'art', label:'Nail art theo mẫu · từ 249k'},
    {id:'up', label:'Úp móng gel · 299k'},
    {id:'upart', label:'Úp móng + nail art · từ 349k'},
    {id:'chan', label:'Sơn gel chân · 119k'},
    {id:'spa', label:'Chăm sóc da chân · 149k'},
    {id:'combo', label:'Combo tay + chân · 229k'}
  ];
  var SLOTS = ['09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30'];
  var DOW = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  var fs = $('#f-service'), fc = $('#f-color'), fb = $('#f-branch'), fd = $('#f-date');
  fs.innerHTML = SERVICES.map(function(s){ return '<option value="'+s.id+'">'+s.label+'</option>'; }).join('');
  fc.innerHTML = COLORS.map(function(c){ return '<option value="'+c.code+'">'+c.code+' · '+c.name+' ('+FIN[c.fin]+')</option>'; }).join('') + '<option value="tai-tiem">Chọn tại tiệm</option>';
  fb.innerHTML = BRANCHES.map(function(b){ return '<option value="'+b.id+'">'+b.name+' · '+b.city+'</option>'; }).join('');
  $('#slots').innerHTML = SLOTS.map(function(t, i){ var id = 'slot-'+t.replace(':',''); return '<input type="radio" name="slot" id="'+id+'" value="'+t+'"><label for="'+id+'">'+t+'</label>'; }).join('');
  var colorTouched = false;
  fc.addEventListener('change', function(){ colorTouched = true; if (BY[fc.value]) paintPick(BY[fc.value]); });

  function addDays(ds, n){ var d = new Date(ds+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
  function dayLabel(ds){ var d = new Date(ds+'T00:00:00Z'); return DOW[d.getUTCDay()] + ', ' + ds.slice(8,10) + '/' + ds.slice(5,7); }
  (function initDate(){
    var now = vnNow();
    fd.min = now.date; fd.max = addDays(now.date, 30);
    fd.value = now.mins >= 1140 ? addDays(now.date, 1) : now.date;
    updateSlots();
  })();
  function updateSlots(){
    var now = vnNow(), isToday = fd.value === now.date;
    $('#f-date-help').textContent = fd.value ? dayLabel(fd.value) + (isToday ? ' · hôm nay' : '') : '';
    SLOTS.forEach(function(t){
      var el = document.getElementById('slot-'+t.replace(':','')), m = parseInt(t.slice(0,2),10)*60 + parseInt(t.slice(3),10);
      el.disabled = isToday && m <= now.mins + 30;
      if (el.disabled) el.checked = false;
    });
  }
  fd.addEventListener('change', updateSlots);

  function paintPick(c){
    var b = $('#pick-bottle');
    b.style.setProperty('--c', c.hex); b.style.setProperty('--on', onColor(c.hex)); b.setAttribute('data-finish', c.fin);
    $('#pick-name').textContent = c.name;
    $('#pick-sub').textContent = c.code + ' · ' + FIN[c.fin];
  }
  function syncPick(c){
    if (colorTouched) return;
    paintPick(c); fc.value = c.code;
  }

  function showErr(id, on, input){
    document.getElementById(id).hidden = !on;
    if (input) input.setAttribute('aria-invalid', on ? 'true' : 'false');
  }
  $('#book-form').addEventListener('submit', function(e){
    e.preventDefault();
    var name = $('#f-name').value.trim();
    var phone = $('#f-phone').value.replace(/[\s.\-]/g, '');
    var slot = document.querySelector('input[name="slot"]:checked');
    var okName = name.length > 0, okPhone = /^0\d{9}$/.test(phone), okSlot = !!slot;
    showErr('err-name', !okName, $('#f-name'));
    showErr('err-phone', !okPhone, $('#f-phone'));
    showErr('err-slot', !okSlot);
    if (!okName){ $('#f-name').focus(); return; }
    if (!okSlot){ document.querySelector('input[name="slot"]:not(:disabled)') && document.querySelector('input[name="slot"]:not(:disabled)').focus(); return; }
    if (!okPhone){ $('#f-phone').focus(); return; }
    var svc = SERVICES.filter(function(s){ return s.id === fs.value; })[0];
    var br = BRANCHES.filter(function(b){ return b.id === fb.value; })[0];
    var col = BY[fc.value];
    var code = 'M10-' + String(Math.floor(1000 + Math.random()*9000));
    var masked = phone.slice(0,4) + ' ••• ' + phone.slice(-3);
    $('#c-title').textContent = 'Đã giữ chỗ cho ' + name;
    var rows = [
      ['Mã đặt lịch', '<span class="code">'+code+'</span>'],
      ['Thời gian', slot.value + ', ' + dayLabel(fd.value)],
      ['Chi nhánh', br.name + ' · ' + br.addr],
      ['Dịch vụ', svc.label],
      ['Màu', col ? col.code + ' · ' + col.name : 'Chọn tại tiệm'],
      ['Số điện thoại', masked]
    ];
    var dl = $('#c-list'); dl.innerHTML = '';
    rows.forEach(function(r){
      var dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = r[0];
      if (r[0] === 'Mã đặt lịch') dd.innerHTML = r[1]; else dd.textContent = r[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    var cf = $('#confirm');
    var mc = col ? col.hex : getComputedStyle(document.documentElement).getPropertyValue('--accent');
    cf.style.setProperty('--polish-b', mc); cf.style.setProperty('--on-b', col ? onColor(col.hex) : '#FFFFFF');
    $('#book-form').hidden = true; cf.hidden = false; cf.focus({preventScroll:true});
  });
  $('#c-again').addEventListener('click', function(){
    $('#confirm').hidden = true; $('#book-form').hidden = false;
    $('#f-name').value = ''; $('#f-phone').value = '';
    var s = document.querySelector('input[name="slot"]:checked'); if (s) s.checked = false;
    $('#f-service').focus();
  });
  ['f-name','f-phone'].forEach(function(id){
    document.getElementById(id).addEventListener('input', function(){ showErr(id === 'f-name' ? 'err-name' : 'err-phone', false, this); });
  });
  $('#slots').addEventListener('change', function(){ showErr('err-slot', false); });

  $('#copy-hotline').addEventListener('click', function(){
    var btn = this, txt = $('#hotline').textContent;
    function done(ok){
      if (!ok){ var r = document.createRange(); r.selectNodeContents($('#hotline')); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
      btn.textContent = ok ? 'Đã chép' : 'Đã chọn số'; setTimeout(function(){ btn.textContent = 'Chép số'; }, 1800);
    }
    try { navigator.clipboard.writeText(txt).then(function(){ done(true); }, function(){ done(false); }); } catch(e){ done(false); }
  });

  /* ---------- Header + scroll effects ---------- */
  var top = $('#top');
  function onScroll(){ top.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  if ('IntersectionObserver' in window && !reduce){
    var vh = window.innerHeight;
    var liftIO = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if (en.isIntersecting){ en.target.classList.remove('pre'); liftIO.unobserve(en.target); } });
    }, {rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.lift').forEach(function(el, i){
      if (el.getBoundingClientRect().top > vh){ el.classList.add('pre'); el.style.transitionDelay = ((i%5)*50)+'ms'; liftIO.observe(el); }
    });

    var card = $('#card10'), cardDone = false;
    var cardIO = new IntersectionObserver(function(ents){
      ents.forEach(function(en){
        if (!en.isIntersecting || cardDone) return;
        cardDone = true; cardIO.disconnect();
        var st = card.querySelectorAll('.stamp.on'), cnt = $('#c10-count');
        st.forEach(function(s){ s.classList.remove('on'); });
        cnt.textContent = '0';
        st.forEach(function(s, k){
          setTimeout(function(){ s.classList.add('on','stamping'); cnt.textContent = String(k+1); }, 250 + k*170);
        });
      });
    }, {threshold:.45});
    cardIO.observe(card);

    var stIO = new IntersectionObserver(function(ents){ ents.forEach(function(en){ stageVisible = en.isIntersecting; }); }, {threshold:.25});
    stIO.observe(stage);
  }

  /* ---------- Init ---------- */
  buildHand();
  buildControls();
  setSkin('sang');
  setShape('tron', false);
  applyColor('M-00', {immediate:true});
  showOcc(0, false);
  setTimeout(startCycle, 1400);
})();
