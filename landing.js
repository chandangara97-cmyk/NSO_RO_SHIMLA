/* Landing page behaviour: greeting + clock, hero terrain map, tool directory.
   Tool list comes from tools/assets/tools.js, so new tools appear here automatically. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var CATS = window.NSO_CATEGORIES || [], ALL = window.NSO_TOOLS || [], icon = window.NSO_icon;
  var TOOLS = ALL.filter(function (t) { return t.status !== 'soon'; });

  /* ---- greeting and clock (Shimla time) ---- */
  function tick() {
    var now = new Date(), p;
    try {
      p = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(now);
    } catch (e) { p = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2); }
    var h = +p.slice(0, 2), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    $('#hello').textContent = g + '. It is ' + p + ' in Shimla.';
  }
  tick(); setInterval(tick, 20000);

  /* ---- facts line ---- */
  $('#facts').textContent = TOOLS.length + ' tools across ' + CATS.length + ' work areas. The property survey tool carries ward outlines for 67 urban bodies.';

  /* ---- hero terrain map ---- */
  (function () {
    var hero = $('#hero'), cv = $('#terrain'), zone = $('#mapZone');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'),
        reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
        roPos = $('#roPos'), roElev = $('#roElev'), roBlk = $('#roBlk');
    var W, H, dpr, S, base, polys = [], pin = { x: 0, y: 0 }, hover = -1, anim = 0, raf = 0, ready = false;
    var LOCAL = [
      [[.05,.14],[.37,.06],[.43,.38],[.09,.46]],
      [[.37,.06],[.73,.13],[.67,.41],[.43,.38]],
      [[.73,.13],[.97,.23],[.93,.52],[.67,.41]],
      [[.09,.46],[.43,.38],[.47,.71],[.13,.79]],
      [[.43,.38],[.67,.41],[.71,.73],[.47,.71]],
      [[.67,.41],[.93,.52],[.89,.84],[.71,.73]]
    ];
    var NAMES = ['01','02','03','04','05','06'];
    var PEAKS = [[.80,.28,.20,.28,1.0],[.58,.80,.28,.17,.8],[.95,.82,.18,.2,.7],[.32,.18,.24,.18,.6],[.08,.72,.28,.24,.5]];
    function height(x, y) {
      var h = 0, i, p, dx, dy;
      for (i = 0; i < PEAKS.length; i++) {
        p = PEAKS[i]; dx = (x - p[0] * W) / S; dy = (y - p[1] * H) / S;
        h += p[4] * Math.exp(-(dx * dx / (2 * p[2] * p[2]) + dy * dy / (2 * p[3] * p[3])));
      }
      return h + .07 * Math.sin(x / S * 5.1 + 1.3) * Math.cos(y / S * 4.3) + .045 * Math.sin(x / S * 11 + y / S * 7);
    }
    function contours(g, c, nx, ny, c2d) {
      var minor = new Path2D(), major = new Path2D(), lv, k = 0;
      for (lv = .06; lv < 1.7; lv += .06, k++) {
        var path = (k % 5 === 4) ? major : minor, x, y;
        for (y = 0; y < ny - 1; y++) for (x = 0; x < nx - 1; x++) {
          var a = g[y * nx + x], b = g[y * nx + x + 1], d = g[(y + 1) * nx + x + 1], e = g[(y + 1) * nx + x];
          var idx = (a >= lv ? 8 : 0) | (b >= lv ? 4 : 0) | (d >= lv ? 2 : 0) | (e >= lv ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          var X = x * c, Y = y * c;
          var E = [
            [X + c * (lv - a) / (b - a), Y],
            [X + c, Y + c * (lv - b) / (d - b)],
            [X + c * (lv - e) / (d - e), Y + c],
            [X, Y + c * (lv - a) / (e - a)]
          ];
          var T = {1:[[3,2]],2:[[2,1]],3:[[3,1]],4:[[0,1]],5:[[3,0],[2,1]],6:[[0,2]],7:[[3,0]],8:[[3,0]],9:[[0,2]],10:[[3,2],[0,1]],11:[[0,1]],12:[[3,1]],13:[[2,1]],14:[[3,2]]}[idx], s;
          for (s = 0; s < T.length; s++) { path.moveTo(E[T[s][0]][0], E[T[s][0]][1]); path.lineTo(E[T[s][1]][0], E[T[s][1]][1]); }
        }
      }
      c2d.lineWidth = 1; c2d.strokeStyle = 'rgba(150,210,188,.15)'; c2d.stroke(minor);
      c2d.lineWidth = 1.2; c2d.strokeStyle = 'rgba(165,225,200,.3)'; c2d.stroke(major);
    }
    function inside(pt, poly) {
      var i, j, r = false;
      for (i = 0, j = poly.length - 1; i < poly.length; j = i++)
        if ((poly[i][1] > pt.y) !== (poly[j][1] > pt.y) && pt.x < (poly[j][0] - poly[i][0]) * (pt.y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) r = !r;
      return r;
    }
    function centroid(poly) { var x = 0, y = 0; poly.forEach(function (p) { x += p[0]; y += p[1]; }); return { x: x / poly.length, y: y / poly.length }; }
    function build() {
      var hr = hero.getBoundingClientRect(), zr = zone.getBoundingClientRect();
      W = Math.round(hr.width); H = Math.round(hr.height); dpr = Math.min(2, window.devicePixelRatio || 1); S = Math.max(W, H * 1.15);
      cv.width = W * dpr; cv.height = H * dpr;
      var box = { x: zr.left - hr.left, y: zr.top - hr.top, w: zr.width, h: Math.max(200, zr.height - 78) };
      polys = LOCAL.map(function (p) { return p.map(function (q) { return [box.x + q[0] * box.w, box.y + q[1] * box.h]; }); });
      base = document.createElement('canvas'); base.width = W * dpr; base.height = H * dpr;
      var b = base.getContext('2d'); b.scale(dpr, dpr);
      var c = W < 700 ? 6 : 8, nx = Math.ceil(W / c) + 2, ny = Math.ceil(H / c) + 2, g = new Float32Array(nx * ny), x, y;
      for (y = 0; y < ny; y++) for (x = 0; x < nx; x++) g[y * nx + x] = height(x * c, y * c);
      contours(g, c, nx, ny, b);
      b.lineWidth = 1.4; b.setLineDash([6, 5]); b.strokeStyle = 'rgba(232,246,239,.6)';
      b.font = '600 13px "Public Sans",system-ui,sans-serif'; b.textAlign = 'center'; b.textBaseline = 'middle';
      polys.forEach(function (p, i) {
        b.beginPath(); p.forEach(function (q, j) { j ? b.lineTo(q[0], q[1]) : b.moveTo(q[0], q[1]); }); b.closePath(); b.stroke();
      });
      b.setLineDash([]); b.fillStyle = 'rgba(232,246,239,.75)';
      polys.forEach(function (p, i) { var c0 = centroid(p); b.fillText(NAMES[i], c0.x, c0.y + 20); });
      ready = true;
    }
    function elevAt(x, y) { return Math.round((1300 + height(x, y) * 850) / 10) * 10; }
    function draw() {
      raf = 0; if (!ready) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.drawImage(base, 0, 0, W, H);
      hover = -1; polys.forEach(function (p, i) { if (hover < 0 && inside(pin, p)) hover = i; });
      if (hover >= 0) {
        var p = polys[hover]; ctx.beginPath(); p.forEach(function (q, j) { j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath();
        ctx.fillStyle = 'rgba(224,80,60,.26)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#ff7a64'; ctx.stroke();
      }
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.beginPath(); ctx.moveTo(pin.x - 18, pin.y); ctx.lineTo(pin.x - 7, pin.y); ctx.moveTo(pin.x + 7, pin.y); ctx.lineTo(pin.x + 18, pin.y);
      ctx.moveTo(pin.x, pin.y - 18); ctx.lineTo(pin.x, pin.y - 7); ctx.moveTo(pin.x, pin.y + 7); ctx.lineTo(pin.x, pin.y + 18); ctx.stroke();
      ctx.beginPath(); ctx.arc(pin.x, pin.y, 4.5, 0, 6.283); ctx.fillStyle = '#ff7a64'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
      var lat = 31.2 - pin.y / H * .2, lon = 77.05 + pin.x / W * .3;
      roPos.textContent = lat.toFixed(4) + '° N  ' + lon.toFixed(4) + '° E';
      roElev.textContent = elevAt(pin.x, pin.y).toLocaleString('en-IN') + ' m';
      roBlk.textContent = hover >= 0 ? 'Block ' + NAMES[hover] : 'Outside the blocks';
    }
    function ask() { if (!raf) raf = requestAnimationFrame(draw); }
    function setPin(x, y) { pin.x = Math.max(0, Math.min(W, x)); pin.y = Math.max(0, Math.min(H, y)); ask(); }
    function stopIntro() { anim = 0; }
    function intro() {
      var stops = [1, 4, 5, 2, 4].map(function (i) { return centroid(polys[i]); }), t0 = 0, dur = 5200;
      function step(t) {
        if (!anim) return; if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), f = k * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f)), u = f - i;
        u = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        setPin(stops[i].x + (stops[i + 1].x - stops[i].x) * u, stops[i].y + (stops[i + 1].y - stops[i].y) * u);
        if (k < 1) requestAnimationFrame(step); else anim = 0;
      }
      anim = 1; requestAnimationFrame(step);
    }
    function place() {
      var c = centroid(polys[4]); setPin(c.x, c.y);
      if (!reduce) { var s = centroid(polys[1]); setPin(s.x, s.y); setTimeout(function () { if (ready) intro(); }, 500); }
    }
    function local(e) { var r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; stopIntro(); var p = local(e); setPin(p.x, p.y); });
    hero.addEventListener('pointerdown', function (e) { if (e.target.closest('a,button')) return; stopIntro(); var p = local(e); setPin(p.x, p.y); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var was = { x: pin.x / (W || 1), y: pin.y / (H || 1) }; build(); setPin(was.x * W, was.y * H); }, 150); });
    function start() { build(); place(); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  })();

  /* ---- tool directory ---- */
  var WANT = { plfs: 'I want to track PLFS field work', 'ufs-ops': 'I want to check UFS progress and plan the month',
    'ufs-geo': 'I want to find, record and check urban blocks', office: 'I want to handle office paperwork: bills, diary, tour programme',
    property: 'I want to survey properties in an urban body', tools: 'I want to convert maps and coordinates' };
  var st = { cat: 'all', q: '' };
  $('#chipsTools').innerHTML = '<button class="chip" data-c="all" aria-pressed="true">All areas</button>' + CATS.map(function (c) {
    return '<button class="chip" data-c="' + c.id + '" aria-pressed="false"><span class="dot" style="background:' + c.color + '"></span>' + esc(c.name) + '</button>';
  }).join('');
  function row(t) {
    return '<li><a class="row" href="tools/' + esc(t.file) + '"><span class="tile">' + icon(t.icon, 22) + '</span><span class="rt"><b>' + esc(t.title) + '</b>' +
      (t.isNew ? '<em>NEW</em>' : '') + '<span class="ty">' + esc(t.type) + '</span><span class="rd">' + esc(t.desc) + '</span><span class="ru"><b style="font:600 14px var(--body)">Use when:</b> ' + esc(t.use) + '</span></span></a></li>';
  }
  function drawTools() {
    var q = st.q.toLowerCase(), h = '';
    CATS.forEach(function (c) {
      if (st.cat !== 'all' && st.cat !== c.id) return;
      var l = TOOLS.filter(function (t) { return t.cat === c.id && (!q || (t.title + ' ' + t.type + ' ' + t.desc + ' ' + t.use + ' ' + (t.keys || '')).toLowerCase().indexOf(q) > -1); });
      if (!l.length) return;
      h += '<section class="grp" style="--ac:' + c.color + '"><div class="grp-head"><h3>' + esc(c.name) + '</h3><p>' + esc(WANT[c.id] || c.blurb) + '</p></div><ul class="rows">' + l.map(row).join('') + '</ul></section>';
    });
    $('#toolgroups').innerHTML = h || '<p class="empty">No tool matches that search. Clear the search or pick another work area.</p>';
  }
  $('#chipsTools').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; st.cat = b.dataset.c;
    this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); drawTools();
  });
  $('#tq').addEventListener('input', function () { st.q = this.value; drawTools(); });
  drawTools();
})();
