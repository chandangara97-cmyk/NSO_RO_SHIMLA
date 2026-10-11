(function(){
var D=window.SURVEY_INDICES||{surveys:[]},st={level:'all',q:''};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function latest(s,k){var o=(s.observations||[]).filter(function(x){return x.key===k}).sort(function(a,b){return a.period<b.period?1:-1});return o[0]}
function card(s){
 var rows=s.indicators.map(function(i){var o=latest(s,i.key);
  var v=o?'<b>'+esc(o.value)+' '+esc(i.unit==='index'||i.unit==='count'?'':i.unit)+'</b>':'<span class="na">no value loaded</span>';
  var sub=o?'<div class="meta">'+esc(o.period)+(o.source_url?' · <a href="'+esc(o.source_url)+'" target="_blank" rel="noopener">source</a>':'')+'</div>':'';
  return '<div class="ind"><span>'+esc(i.label)+sub+'</span>'+v+'</div>'}).join('');
 return '<div class="card"><span class="tag '+s.level+'">'+s.level+'</span><h3>'+esc(s.name)+'</h3><div class="meta">'+esc(s.body)+' · '+esc(s.frequency)+'</div>'+rows+'</div>'}
function draw(){
 var q=st.q.toLowerCase(),list=D.surveys.filter(function(s){return(st.level==='all'||s.level===st.level)&&(!q||(s.name+' '+s.body+' '+s.indicators.map(function(i){return i.label}).join(' ')).toLowerCase().indexOf(q)>-1)});
 document.getElementById('cards').innerHTML=list.map(card).join('')||'<p class="na">No surveys match.</p>'}
document.getElementById('levels').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;st.level=b.dataset.level;this.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});draw()});
document.getElementById('q').addEventListener('input',function(){st.q=this.value;draw()});
draw();
})();
