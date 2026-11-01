(async function(){
var $=function(s){return document.querySelector(s);};
var esc=function(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
if(typeof SUPABASE_URL==='undefined'||SUPABASE_URL.indexOf('YOUR_PROJECT')>-1){location.replace('index.html');return;}
var sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
var ses=(await sb.auth.getSession()).data.session; if(!ses){location.replace('index.html');return;}
if(!(await sb.rpc('is_admin')).data){await sb.auth.signOut();location.replace('index.html?denied=1');return;}
sb.auth.onAuthStateChange(function(ev){ if(ev==='SIGNED_OUT') location.replace('index.html'); });
$('#out').onclick=function(){ sb.auth.signOut(); };

var STATUS=['new','read','replied','done','archived'];
var T={
 projects:{label:'Projects',order:'sort',asc:1,cols:['title','category','featured','published'],fields:[
  ['title','text','req'],['slug','text','req','Unique, lowercase, e.g. my-project'],['category','select',['data','web','uiux','branding']],['tag','text'],['client','text'],['duration','text'],
  ['summary','textarea','','Shown on the project card'],['overview','textarea'],['request','textarea'],['challenge','textarea'],['solution','textarea'],['results','textarea'],
  ['tools','text','','Comma-separated'],['icon','text','','An emoji'],['image_url','text','','Optional thumbnail URL'],['featured','bool','','Show on home page (first 3 featured)'],['published','bool'],['sort','number']]},
 services:{label:'Services',order:'sort',asc:1,cols:['icon','title','published'],fields:[
  ['title','text','req'],['description','textarea'],['icon','text','','An emoji'],['color','select',['blue','violet','magenta','teal','orange']],['includes','textarea','','Comma-separated list'],['published','bool'],['sort','number']]},
 reviews:{label:'Reviews',cols:['name','rating','message','approved'],fields:[
  ['name','text','req'],['role','text'],['rating','number','req','1 to 5'],['message','textarea','req'],['approved','bool','','Untick to hide from the public site']]},
 bookings:{label:'Bookings',cols:['name','email','preferred_time','status'],fields:[
  ['name','text','req'],['email','text','req'],['preferred_time','text'],['message','textarea'],['status','select',STATUS],['notes','textarea','','Private notes']]},
 quiz_leads:{label:'Project leads',cols:['name','email','budget','status'],fields:[
  ['name','text','req'],['email','text','req'],['phone','text'],['budget','text'],['timeline','text'],['services','json'],['features','json'],['details','textarea'],['status','select',STATUS],['notes','textarea','','Private notes']]},
 contact_messages:{label:'Messages',cols:['name','email','message','status'],fields:[
  ['name','text','req'],['email','text','req'],['message','textarea','req'],['status','select',STATUS],['notes','textarea','','Private notes']]},
 plugins:{label:'Plugins',pk:'key',order:'key',asc:1,cols:['name','key','enabled'],note:'Switch on tools for the public site. <b>config</b>: Google Analytics = measurement ID (G-XXXX); Meta Pixel = pixel ID; Tawk.to = propertyId/widgetId; Custom CSS / JavaScript = the code itself.',fields:[['key','text','req'],['name','text','req'],['enabled','bool'],['config','textarea']]},
 webhooks:{label:'Webhooks',order:'created_at',cols:['name','url','events','active'],note:'Events: <b>booking.created, message.created, lead.created, review.created, post.publish</b>. Leave events empty to receive all. Works with Zapier, Make, n8n, Discord and similar. The secret is sent in the <b>X-Webhook-Secret</b> header.',fields:[['name','text','req'],['url','text','req','https://…'],['events','text','','Comma-separated'],['secret','text'],['active','bool']]},
 social_posts:{label:'Social posts',cols:['content','platforms','status'],note:'Set status to <b>queued</b> and save: the post is sent to your webhooks (event <b>post.publish</b>) so Zapier/Make/n8n can publish it to each platform. The share buttons open each network pre-filled so you can post manually.',fields:[['content','textarea','req'],['image_url','text','','Paste a URL from Media'],['link_url','text'],['platforms','text','','Comma-separated: x, facebook, linkedin, instagram, telegram, whatsapp'],['status','select',['draft','queued','sent']]]},
 settings:{label:'Site settings',pk:'key',order:'key',asc:1,cols:['key','value'],note:'Keys the site uses: <b>footer_text</b>, <b>footer_tagline</b>, <b>hero_lead</b>. Leave a key out to keep the built-in text.',fields:[['key','text','req'],['value','textarea']]},
 admins:{label:'Admins',pk:'email',order:'email',asc:1,cols:['email'],note:'Emails allowed into this panel. The person must also have a user in Supabase Authentication. Never delete your own row.',fields:[['email','text','req']]}
};
var cur,rows=[];
$('#nav').innerHTML='<button data-t="overview">Overview</button><button data-t="appearance">Appearance</button><button data-t="media">Media</button>'+Object.keys(T).map(function(k){return '<button data-t="'+k+'">'+T[k].label+'</button>';}).join('');
$('#nav').onclick=function(e){ var b=e.target.closest('button'); if(b) show(b.dataset.t); };
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2400);}
function mark(t){ document.querySelectorAll('#nav button').forEach(function(b){b.classList.toggle('on',b.dataset.t===t);}); }

async function show(t){
  cur=t; mark(t); location.hash=t; var m=$('#main');
  if(t==='appearance') return appearance(); if(t==='media') return media(); if(t==='overview'||!T[t]) return overview();
  var c=T[t]; m.innerHTML='<div class="bar"><h2>'+c.label+'</h2><input id="q" placeholder="Search…"><button class="btn" id="new">+ New</button></div>'+(c.note?'<div class="note">'+c.note+'</div>':'')+'<div class="tbl" id="tbl"><p class="muted" style="padding:16px">Loading…</p></div>';
  $('#new').onclick=function(){ form(null); }; $('#q').oninput=draw;
  var r=await sb.from(t).select('*').order(c.order||'created_at',{ascending:!!c.asc});
  if(r.error){ $('#tbl').innerHTML='<p class="muted" style="padding:16px">'+esc(r.error.message)+' (did you run supabase-admin.sql?)</p>'; return; }
  rows=r.data||[]; draw();
}
function cell(v){ if(v===true) return '<span class="pill y">yes</span>'; if(v===false) return '<span class="pill n">no</span>'; if(v&&typeof v==='object') v=JSON.stringify(v); return esc(String(v==null?'':v).slice(0,90)); }
function draw(){
  var c=T[cur], q=($('#q').value||'').toLowerCase();
  var list=rows.filter(function(r){return !q||JSON.stringify(r).toLowerCase().indexOf(q)>-1;});
  $('#tbl').innerHTML=list.length?'<table><thead><tr>'+c.cols.map(function(k){return '<th>'+k.replace(/_/g,' ')+'</th>';}).join('')+'<th></th></tr></thead><tbody>'+
   list.map(function(r){return '<tr>'+c.cols.map(function(k){return '<td>'+cell(r[k])+'</td>';}).join('')+'<td class="act">'+(cur==='social_posts'?shareBtns(r):'')+'<button class="btn ghost sm" data-e="'+rows.indexOf(r)+'">Edit</button><button class="btn danger sm" data-d="'+rows.indexOf(r)+'">Delete</button></td></tr>';}).join('')+'</tbody></table>':'<p class="muted" style="padding:16px">Nothing here yet.</p>';
  $('#tbl').onclick=function(e){ var b=e.target.closest('button'); if(!b) return; if(b.dataset.e!=null) form(rows[b.dataset.e]); if(b.dataset.d!=null) del(rows[b.dataset.d]); };
}
function form(row){
  var c=T[cur], pk=c.pk||'id', md=$('#modal');
  md.innerHTML='<form class="dlg"><h3>'+(row?'Edit':'New')+' · '+c.label+'</h3>'+c.fields.map(function(f){
    var n=f[0],ty=f[1],v=row?row[n]:undefined,h=f[3]?' <small>('+f[3]+')</small>':'',rq=f[2]==='req'?' required':'';
    if(ty==='bool') return '<label class="chk"><input type="checkbox" name="'+n+'"'+((row?v:true)?' checked':'')+'> '+n.replace(/_/g,' ')+h+'</label>';
    var inp;
    if(ty==='textarea'||ty==='json') inp='<textarea name="'+n+'"'+rq+'>'+esc(ty==='json'&&v!=null?JSON.stringify(v):v)+'</textarea>';
    else if(ty==='select') inp='<select name="'+n+'">'+f[2].map(function(o){return '<option'+(o===v?' selected':'')+'>'+o+'</option>';}).join('')+'</select>';
    else inp='<input name="'+n+'" type="'+(ty==='number'?'number':'text')+'" value="'+esc(v==null?'':v)+'"'+rq+((row&&n===pk)?' readonly':'')+'>';
    return '<label>'+n.replace(/_/g,' ')+h+inp+'</label>';
  }).join('')+'<div class="foot"><button type="button" class="btn ghost" id="x">Cancel</button><button class="btn">Save</button></div></form>';
  md.hidden=false; $('#x').onclick=function(){md.hidden=true;};
  md.querySelector('form').onsubmit=async function(e){
    e.preventDefault(); var fd=new FormData(e.target), o={};
    try{ c.fields.forEach(function(f){ var n=f[0],ty=f[1],v=fd.get(n);
      if(ty==='bool') o[n]=!!e.target.elements[n].checked;
      else if(ty==='number') o[n]=v===''?null:Number(v);
      else if(ty==='json') o[n]=v.trim()?JSON.parse(v):null;
      else o[n]=(v===''&&f[2]!=='req')?null:v; }); }catch(x){ toast('Invalid JSON in a field'); return; }
    var r=row?await sb.from(cur).update(o).eq(pk,row[pk]):await sb.from(cur).insert(o);
    if(r.error){ toast(r.error.message); return; }
    md.hidden=true; toast('Saved'); show(cur);
  };
}
async function del(row){
  var c=T[cur], pk=c.pk||'id';
  if(!confirm('Delete this item? This cannot be undone.')) return;
  var r=await sb.from(cur).delete().eq(pk,row[pk]); if(r.error){ toast(r.error.message); return; }
  toast('Deleted'); show(cur);
}
async function overview(){
  var ks=Object.keys(T), m=$('#main');
  var cn=await Promise.all(ks.map(function(k){return sb.from(k).select('*',{count:'exact',head:true});}));
  var rec=await Promise.all(['bookings','contact_messages','quiz_leads'].map(function(k){return sb.from(k).select('*').order('created_at',{ascending:false}).limit(5);}));
  var lab=['Recent bookings','Recent messages','Recent project leads'];
  m.innerHTML='<div class="bar"><h2>Overview</h2></div><div class="stats">'+ks.map(function(k,i){return '<div class="stat" data-t="'+k+'"><b>'+(cn[i].count==null?'–':cn[i].count)+'</b><span>'+T[k].label+'</span></div>';}).join('')+'</div><div class="recent">'+
   rec.map(function(r,i){return '<section><h3>'+lab[i]+'</h3>'+((r.data||[]).map(function(x){return '<p><b>'+esc(x.name)+'</b> · <span class="muted">'+esc((x.message||x.details||x.email||'').slice(0,70))+'</span></p>';}).join('')||'<p class="muted">Nothing yet.</p>')+'</section>';}).join('')+'</div>';
  m.onclick=function(e){ var s=e.target.closest('.stat'); if(s) show(s.dataset.t); };
}

function shareBtns(r){
  var t=encodeURIComponent(r.content||''), u=encodeURIComponent(r.link_url||location.origin.replace(/\/admin.*/,'')), L=function(n,h){return '<a class="btn ghost sm" target="_blank" rel="noopener" href="'+h+'">'+n+'</a>';};
  return L('X','https://twitter.com/intent/tweet?text='+t+'&url='+u)+L('FB','https://www.facebook.com/sharer/sharer.php?u='+u)+L('in','https://www.linkedin.com/sharing/share-offsite/?url='+u)+L('WA','https://wa.me/?text='+t+'%20'+u)+L('TG','https://t.me/share/url?url='+u+'&text='+t);
}
var FONTS=['Inter','Space Grotesk','Poppins','Montserrat','Playfair Display','Lora','Roboto','Open Sans','DM Sans','Raleway','Merriweather','Manrope','Sora','Nunito'];
var SOC=['x','linkedin','instagram','facebook','youtube','github','tiktok','whatsapp','telegram'];
var COLS=[['color_accent','Accent (buttons, highlights)','#f5821f'],['color_blue','Gradient blue','#4c7fff'],['color_violet','Gradient violet','#8b5fe8'],['color_bg','Page background','#0a0e27'],['color_text','Text','#ffffff']];
async function appearance(){
  var m=$('#main'); m.innerHTML='<p class="muted">Loading…</p>';
  var r=await sb.from('settings').select('*'), s={}; (r.data||[]).forEach(function(x){s[x.key]=x.value;});
  var fsel=function(k,l){return '<label>'+l+'<select name="'+k+'"><option value="">Default</option>'+FONTS.map(function(f){return '<option'+(s[k]===f?' selected':'')+'>'+f+'</option>';}).join('')+'</select></label>';};
  m.innerHTML='<div class="bar"><h2>Appearance &amp; social</h2></div><form id="ap" class="form-grid">'+
   '<div class="sec"><h3>Theme</h3><label>Mode<select name="theme_mode"><option value="">Dark (default)</option><option value="light"'+(s.theme_mode==='light'?' selected':'')+'>Light</option></select></label></div>'+
   '<div class="sec"><h3>Colors</h3><p class="muted">Tick “use” to override a color; untick to go back to the default.</p>'+COLS.map(function(c){return '<label>'+c[1]+'<span class="cp"><input type="color" name="'+c[0]+'" value="'+(s[c[0]]||c[2])+'"><input type="checkbox" name="use_'+c[0]+'"'+(s[c[0]]?' checked':'')+'> use</span></label>';}).join('')+'</div>'+
   '<div class="sec"><h3>Fonts</h3>'+fsel('font_heading','Headings')+fsel('font_body','Body text')+'</div>'+
   '<div class="sec"><h3>Social links</h3><p class="muted">Full https:// links (WhatsApp: number with country code; Telegram: username). Empty = hidden.</p>'+SOC.map(function(k){return '<label>'+k+'<input name="social_'+k+'" value="'+esc(s['social_'+k]||'')+'"></label>';}).join('')+'</div>'+
   '<div class="foot" style="justify-content:flex-start"><button class="btn">Save appearance</button><a class="btn ghost" href="../index.html" target="_blank">Preview site ↗</a></div></form>';
  $('#ap').onsubmit=async function(e){
    e.preventDefault(); var f=e.target.elements, up=[], del=[];
    var put=function(k,v){ v?up.push({key:k,value:v}):del.push(k); };
    put('theme_mode',f.theme_mode.value);
    COLS.forEach(function(c){ put(c[0],f['use_'+c[0]].checked?f[c[0]].value:''); });
    put('font_heading',f.font_heading.value); put('font_body',f.font_body.value);
    SOC.forEach(function(k){ put('social_'+k,f['social_'+k].value.trim()); });
    var a=up.length?await sb.from('settings').upsert(up):{}; var b=del.length?await sb.from('settings').delete().in('key',del):{};
    if(a.error||b.error){ toast((a.error||b.error).message); return; } toast('Saved. Refresh the site to see it.');
  };
}
async function media(){
  var m=$('#main'), B=sb.storage.from('media');
  m.innerHTML='<div class="bar"><h2>Media library</h2><label class="btn" style="cursor:pointer">Upload<input id="up" type="file" accept="image/*,video/*,application/pdf" multiple hidden></label></div><div class="note">Stored in your Supabase Storage bucket <b>media</b>. Use <b>Copy URL</b>, then paste it into a project image or a social post.</div><div id="gal" class="gal"><p class="muted">Loading…</p></div>';
  $('#up').onchange=async function(){ for(var i=0;i<this.files.length;i++){ var f=this.files[i], r=await B.upload(Date.now()+'-'+f.name.replace(/[^\w.-]+/g,'-'),f,{cacheControl:'31536000'}); if(r.error) toast(r.error.message); } toast('Uploaded'); media(); };
  var l=await B.list('',{limit:200,sortBy:{column:'created_at',order:'desc'}});
  if(l.error){ $('#gal').innerHTML='<p class="muted">'+esc(l.error.message)+' (run supabase-features.sql)</p>'; return; }
  var fl=(l.data||[]).filter(function(x){return x.name!=='.emptyFolderPlaceholder';});
  $('#gal').innerHTML=fl.length?fl.map(function(x){ var u=B.getPublicUrl(x.name).data.publicUrl, im=/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(x.name);
    return '<div class="it">'+(im?'<img src="'+esc(u)+'" alt="" loading="lazy">':'<div style="height:120px;display:grid;place-items:center;font-size:34px">📄</div>')+'<div>'+esc(x.name)+'<span><button class="btn ghost sm" data-c="'+esc(u)+'">Copy URL</button> <button class="btn danger sm" data-x="'+esc(x.name)+'">Delete</button></span></div></div>';}).join(''):'<p class="muted">No files yet. Upload your first one.</p>';
  $('#gal').onclick=async function(e){ var b=e.target.closest('button'); if(!b) return;
    if(b.dataset.c){ try{ await navigator.clipboard.writeText(b.dataset.c); toast('URL copied'); }catch(x){ prompt('Copy this URL:',b.dataset.c); } }
    if(b.dataset.x&&confirm('Delete this file?')){ var r=await B.remove([b.dataset.x]); if(r.error) toast(r.error.message); else { toast('Deleted'); media(); } } };
}
$('#modal').onclick=function(e){ if(e.target.id==='modal') this.hidden=true; };
show((location.hash||'#overview').slice(1));
})();
