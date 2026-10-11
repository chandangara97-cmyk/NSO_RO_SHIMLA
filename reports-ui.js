/* Renders the auto-updated MoSPI / HP Statistics list. Needs data/reports.js (window.NSO_REPORTS). */
(function () {
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function fmt(d){ if(!d) return '—'; var p=d.split('-'); var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return p.length===3? (+p[2])+' '+M[+p[1]-1]+' '+p[0] : d; }
  function row(i){
    return '<li><span class="d">'+fmt(i.date)+'</span><span class="org '+(i.org==='MoSPI'?'':'hp')+'">'+esc(i.org)+'</span><span><a href="'+esc(i.url)+'" target="_blank" rel="noopener">'+esc(i.title)+'</a>'+(i.isNew?'<span class="newtag">NEW</span>':'')+(i.note?'<span class="note">'+esc(i.note)+'</span>':'')+'</span></li>';
  }
  window.NSO_renderReports = function (opts) {
    var R = window.NSO_REPORTS, el = document.getElementById(opts.listId);
    if (!el) return;
    if (!R) { el.innerHTML = '<li>Report list unavailable. Open the official MoSPI and HP sources below.</li>'; return; }
    var state = { org: 'all' };
    function draw() {
      var items = (R.items || []).filter(function (i) { return state.org === 'all' || i.org === state.org; });
      if (opts.limit) items = items.slice(0, opts.limit);
      var html = items.map(row).join('');
      if (!html) html = '<li>No automatically detected releases yet. The list fills in after the first daily check — meanwhile use the official links below.</li>';
      el.innerHTML = html;
    }
    draw();
    var chips = document.getElementById(opts.chipsId);
    if (chips) chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.org = b.dataset.org;
      chips.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      draw();
    });
    var meta = document.getElementById(opts.metaId);
    if (meta) {
      var st = R.status || {}, bad = Object.keys(st).filter(function (k) { return !st[k].ok; });
      var gen = R.generated ? new Date(R.generated) : null, days = gen ? Math.floor((Date.now() - gen) / 864e5) : null;
      var ran = Object.keys(st).length > 0;
      var t = !ran ? 'The automatic check has not run yet. It runs daily once the GitHub workflow is enabled; until then only the official links are listed.' : 'Last checked ' + fmt(R.generated.slice(0, 10));
      if (ran && days !== null && days > 3) t += ' <span class="warn">(more than ' + days + ' days ago — the daily check may have stopped)</span>';
      if (bad.length) t += ' · <span class="warn">Could not reach: ' + bad.map(function (k) { return esc(st[k].name); }).join(', ') + ' — showing last known items</span>';
      meta.innerHTML = t;
    }
    var up = document.getElementById(opts.upcomingId);
    if (up) up.innerHTML = (R.upcoming || []).map(function (u) { return '<li><span class="d">' + fmt(u.date) + '</span><span class="org">' + esc(u.org) + '</span><span>' + esc(u.title) + '</span></li>'; }).join('') +
      (R.upcoming_source ? '<li style="font-size:12.5px;color:var(--ink-soft)">' + esc(R.upcoming_source) + '</li>' : '');
    var pin = document.getElementById(opts.pinnedId);
    if (pin) pin.innerHTML = (R.pinned || []).map(row).join('');
  };
})();
