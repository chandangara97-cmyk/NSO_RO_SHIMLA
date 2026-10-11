(function(){
var C=window.NSO_CATEGORIES,T=window.NSO_TOOLS.filter(function(t){return t.status!=='soon'}),icon=window.NSO_icon;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
document.getElementById('toolgroups').innerHTML=C.map(function(c){
 var l=T.filter(function(t){return t.cat===c.id});if(!l.length)return '';
 return '<div style="margin:0 0 16px"><div class="meta" style="font-weight:600;margin-bottom:6px;color:'+c.color+'">'+esc(c.name)+'</div><div class="grid">'+l.map(function(t){
  return '<a class="card" href="tools/'+esc(t.file)+'" style="display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit;border-left:5px solid '+c.color+'"><span style="color:'+c.color+'">'+icon(t.icon,24)+'</span><span><b style="font-size:15px">'+esc(t.title)+'</b><span class="meta" style="display:block">'+esc(t.type)+'</span></span></a>'}).join('')+'</div></div>'}).join('');
})();
