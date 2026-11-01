(async function(){
var $=function(s){return document.querySelector(s);};
var esc=function(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
if(typeof SUPABASE_URL==='undefined'||SUPABASE_URL.indexOf('YOUR_PROJECT')>-1){location.replace('index.html');return;}
var sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
var ses=(await sb.auth.getSession()).data.session; if(!ses){location.replace('index.html');return;}
if(!(await sb.rpc('is_admin')).data){await sb.auth.signOut();location.replace('index.html?denied=1');return;}
sb.auth.onAuthStateChange(function(ev){ if(ev==='SIGNED_OUT') location.replace('index.html'); });
$('#out').onclick=function(){ sb.auth.signOut(); };
$('#who').textContent=ses.user.email;

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
 webhooks:{label:'Webhooks',order:'created_at',cols:['name','url','events','active'],note:'Events: <b>booking.created, message.created, lead.created, review.created, post.publish, reminder.due, task.due</b>. Leave events empty to receive all. Works with Zapier, Make, n8n, Discord and similar. The secret is sent in the <b>X-Webhook-Secret</b> header.',fields:[['name','text','req'],['url','text','req','https://…'],['events','text','','Comma-separated'],['secret','text'],['active','bool']]},
 social_posts:{label:'Social posts',cols:['content','platforms','status'],note:'Set status to <b>queued</b> and save: the post is sent to your webhooks (event <b>post.publish</b>) so Zapier/Make/n8n can publish it to each platform. The share buttons open each network pre-filled so you can post manually.',fields:[['content','textarea','req'],['image_url','text','','Paste a URL from Media'],['link_url','text'],['platforms','text','','Comma-separated: x, facebook, linkedin, instagram, telegram, whatsapp'],['status','select',['draft','queued','sent']]]},
 activity_log:{label:'Activity log',ro:1,order:'created_at',cols:['created_at','kind','message','actor'],note:'Everything that happens: public submissions, your own admin actions, reminders and tasks. Newest first.'},
 page_views:{label:'Page views',ro:1,order:'created_at',cols:['created_at','path','referrer']},
 tasks:{label:'Tasks',qdone:1,order:'due_at',asc:1,cols:['title','due_at','priority','done','source'],fields:[['title','text','req'],['details','textarea'],['due_at','datetime'],['priority','select',['low','med','high']],['done','bool']]},
 reminders:{label:'Reminders',qdone:1,order:'remind_at',asc:1,cols:['title','remind_at','kind','done'],note:'Due reminders show on the bell icon. If pg_cron is enabled, they are also sent to your webhooks (event <b>reminder.due</b>) every 5 minutes.',fields:[['title','text','req'],['remind_at','datetime','req'],['kind','select',['general','booking','lead','task']],['ref','text','','Optional related ID'],['done','bool']]},
 event_handlers:{label:'Event handlers',order:'created_at',cols:['name','event','action','offset_hours','active'],note:'When an event happens, run an action automatically. Use <b>{name}</b> in the title for the person’s name. Offset = hours from the event.',fields:[['name','text','req'],['event','select',['booking.created','lead.created','message.created','review.created']],['action','select',['create_task','create_reminder']],['title','text','req','e.g. Reply to {name}'],['offset_hours','number'],['active','bool']]},
 settings:{label:'Site settings',pk:'key',order:'key',asc:1,cols:['key','value'],note:'Keys the site uses: <b>footer_text</b>, <b>footer_tagline</b>, <b>hero_lead</b>. Leave a key out to keep the built-in text.',fields:[['key','text','req'],['value','textarea']]},
 admins:{label:'Admins',pk:'email',order:'email',asc:1,cols:['email'],note:'Emails allowed into this panel. The person must also have a user in Supabase Authentication. Never delete your own row.',fields:[['email','text','req']]}
};
var cur,rows=[];
var NAV=[['Dashboard',[['overview','📊','Dashboard'],['reports','📈','Reports'],['activity_log','🕒','Activity log'],['page_views','👁','Page views']]],['Inbox',[['bookings','📅','Bookings'],['quiz_leads','🎯','Project leads'],['contact_messages','✉️','Messages'],['reviews','⭐','Reviews']]],['Content',[['projects','🗂','Projects'],['services','🛠','Services'],['media','🖼','Media'],['appearance','🎨','Appearance'],['social_posts','📣','Social posts']]],['Automation',[['advisor','💡','Task advisor'],['tasks','✅','Tasks'],['reminders','⏰','Reminders'],['event_handlers','⚡','Event handlers'],['webhooks','🔗','Webhooks'],['plugins','🧩','Plugins']]],['System',[['settings','⚙️','Site settings'],['admins','🔐','Admins']]]];
$('#nav').innerHTML=NAV.map(function(g){return '<h4>'+g[0]+'</h4>'+g[1].map(function(x){return '<button data-t="'+x[0]+'"><span>'+x[1]+'</span>'+x[2]+'</button>';}).join('');}).join('');
$('#nav').onclick=function(e){ var b=e.target.closest('button'); if(b) show(b.dataset.t); };
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2400);}
function mark(t){ document.querySelectorAll('#nav button').forEach(function(b){b.classList.toggle('on',b.dataset.t===t);}); var l=''; NAV.forEach(function(g){g[1].forEach(function(x){if(x[0]===t) l=x[2];});}); $('#ttl').textContent=l||'Dashboard'; document.body.classList.remove('nav-open'); }

async function show(t){
  cur=t; mark(t); killCharts(); location.hash=t; var m=$('#main');
  if(t==='reports') return reports(); if(t==='advisor') return advisorPage(); if(t==='appearance') return appearance(); if(t==='media') return media(); if(t==='overview'||!T[t]) return overview();
  var c=T[t]; m.innerHTML='<div class="bar"><h2>'+c.label+'</h2><input id="q" placeholder="Search…">'+(c.ro?'':'<button class="btn" id="new">+ New</button>')+'</div>'+(c.note?'<div class="note">'+c.note+'</div>':'')+'<div class="tbl'+(c.ro?' ro':'')+'" id="tbl"><p class="muted" style="padding:16px">Loading…</p></div>';
  if($('#new')) $('#new').onclick=function(){ form(null); }; $('#q').oninput=draw;
  var r=await sb.from(t).select('*').order(c.order||'created_at',{ascending:!!c.asc});
  if(r.error){ $('#tbl').innerHTML='<p class="muted" style="padding:16px">'+esc(r.error.message)+' (did you run supabase-admin.sql?)</p>'; return; }
  rows=r.data||[]; draw();
}
function cell(v,k){ if(k&&/_at$/.test(k)&&v) return esc(new Date(v).toLocaleString([],{dateStyle:'medium',timeStyle:'short'})); if(v===true) return '<span class="pill y">yes</span>'; if(v===false) return '<span class="pill n">no</span>'; if(v&&typeof v==='object') v=JSON.stringify(v); return esc(String(v==null?'':v).slice(0,90)); }
function draw(){
  var c=T[cur], q=($('#q').value||'').toLowerCase();
  var list=rows.filter(function(r){return !q||JSON.stringify(r).toLowerCase().indexOf(q)>-1;});
  $('#tbl').innerHTML=list.length?'<table><thead><tr>'+c.cols.map(function(k){return '<th>'+k.replace(/_/g,' ')+'</th>';}).join('')+'<th></th></tr></thead><tbody>'+
   list.map(function(r){return '<tr>'+c.cols.map(function(k){return '<td>'+cell(r[k],k)+'</td>';}).join('')+'<td class="act">'+(T[cur].qdone?'<button class="btn ghost sm" data-k="'+rows.indexOf(r)+'">'+(r.done?'↺ Reopen':'✓ Done')+'</button>':'')+(cur==='social_posts'?shareBtns(r):'')+'<button class="btn ghost sm" data-e="'+rows.indexOf(r)+'">Edit</button><button class="btn danger sm" data-d="'+rows.indexOf(r)+'">Delete</button></td></tr>';}).join('')+'</tbody></table>':'<p class="muted" style="padding:16px">Nothing here yet.</p>';
  $('#tbl').onclick=function(e){ var b=e.target.closest('button'); if(!b) return; if(b.dataset.e!=null) form(rows[b.dataset.e]); if(b.dataset.d!=null) del(rows[b.dataset.d]); if(b.dataset.k!=null){ var rw=rows[b.dataset.k]; sb.from(cur).update({done:!rw.done}).eq('id',rw.id).then(function(){ log((rw.done?'Reopened ':'Completed ')+T[cur].label.toLowerCase()+': '+(rw.title||'')); show(cur); }); } };
}
function form(row){
  var c=T[cur], pk=c.pk||'id', md=$('#modal');
  md.innerHTML='<form class="dlg"><h3>'+(row?'Edit':'New')+' · '+c.label+'</h3>'+c.fields.map(function(f){
    var n=f[0],ty=f[1],v=row?row[n]:undefined,h=f[3]?' <small>('+f[3]+')</small>':'',rq=f[2]==='req'?' required':'';
    if(ty==='bool') return '<label class="chk"><input type="checkbox" name="'+n+'"'+((row?v:true)?' checked':'')+'> '+n.replace(/_/g,' ')+h+'</label>';
    var inp;
    if(ty==='textarea'||ty==='json') inp='<textarea name="'+n+'"'+rq+'>'+esc(ty==='json'&&v!=null?JSON.stringify(v):v)+'</textarea>';
    else if(ty==='select') inp='<select name="'+n+'">'+f[2].map(function(o){return '<option'+(o===v?' selected':'')+'>'+o+'</option>';}).join('')+'</select>';
    else inp='<input name="'+n+'" type="'+(ty==='number'?'number':ty==='datetime'?'datetime-local':'text')+'" value="'+esc(v==null?'':(ty==='datetime'?dtl(v):v))+'"'+rq+((row&&n===pk)?' readonly':'')+'>';
    return '<label>'+n.replace(/_/g,' ')+h+inp+'</label>';
  }).join('')+'<div class="foot"><button type="button" class="btn ghost" id="x">Cancel</button><button class="btn">Save</button></div></form>';
  md.hidden=false; $('#x').onclick=function(){md.hidden=true;};
  md.querySelector('form').onsubmit=async function(e){
    e.preventDefault(); var fd=new FormData(e.target), o={};
    try{ c.fields.forEach(function(f){ var n=f[0],ty=f[1],v=fd.get(n);
      if(ty==='bool') o[n]=!!e.target.elements[n].checked;
      else if(ty==='datetime') o[n]=v?new Date(v).toISOString():null;
      else if(ty==='number') o[n]=v===''?null:Number(v);
      else if(ty==='json') o[n]=v.trim()?JSON.parse(v):null;
      else o[n]=(v===''&&f[2]!=='req')?null:v; }); }catch(x){ toast('Invalid JSON in a field'); return; }
    var r=row?await sb.from(cur).update(o).eq(pk,row[pk]):await sb.from(cur).insert(o);
    if(r.error){ toast(r.error.message); return; }
    md.hidden=true; toast('Saved'); log((row?'Updated ':'Created ')+c.label.toLowerCase()+(o.title||o.name?': '+(o.title||o.name):'')); show(cur);
  };
}
async function del(row){
  var c=T[cur], pk=c.pk||'id';
  if(!confirm('Delete this item? This cannot be undone.')) return;
  var r=await sb.from(cur).delete().eq(pk,row[pk]); if(r.error){ toast(r.error.message); return; }
  toast('Deleted'); log('Deleted '+c.label.toLowerCase()+(row.title||row.name?': '+(row.title||row.name):'')); show(cur);
}

var DAYS=30, charts=[];
function log(m){ try{ sb.from('activity_log').insert({kind:'admin',message:m,actor:ses.user.email}).then(function(){}); }catch(e){} }
function dtl(v){ var d=new Date(v); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,16); }
function killCharts(){ charts.forEach(function(c){c.destroy();}); charts=[]; }
function mk(id,cfg){ var el=document.getElementById(id); if(el&&window.Chart) charts.push(new Chart(el,cfg)); }
function inP(rows,i){ var a=Date.now()-DAYS*(i+1)*864e5, b=Date.now()-DAYS*i*864e5; return rows.filter(function(r){var t=new Date(r.created_at).getTime();return t>=a&&t<b;}); }
function delta(c,p){ if(!p) return c?'new':'–'; var d=Math.round((c-p)/p*100); return (d>0?'+':'')+d+'%'; }
function series(rows){ var step=DAYS>30?7:1,n=Math.ceil(DAYS/step),st=Date.now()-DAYS*864e5,o=new Array(n).fill(0); rows.forEach(function(r){var i=Math.floor((new Date(r.created_at).getTime()-st)/(step*864e5)); if(i>=0&&i<n) o[i]++;}); return o; }
function labels(){ var step=DAYS>30?7:1,n=Math.ceil(DAYS/step),st=Date.now()-DAYS*864e5; return Array.from({length:n},function(_,i){return new Date(st+i*step*864e5).toLocaleDateString(undefined,{month:'short',day:'numeric'});}); }
async function load(){
  var since=new Date(Date.now()-DAYS*2*864e5).toISOString(), R=function(x){return (x&&x.data)||[];};
  var w=function(t,c){return sb.from(t).select(c).gte('created_at',since).order('created_at',{ascending:false}).limit(5000);};
  var np=function(t){return sb.from(t).select('created_at').eq('status','new');};
  var q=await Promise.all([w('page_views','path,created_at'),w('bookings','status,created_at'),w('quiz_leads','status,created_at'),w('contact_messages','status,created_at'),w('reviews','rating,approved,created_at'),
    sb.from('projects').select('title,published,featured,image_url'),sb.from('services').select('published'),sb.from('tasks').select('*'),sb.from('reminders').select('*'),sb.from('social_posts').select('status,created_at'),
    sb.from('webhooks').select('active'),sb.from('plugins').select('key,enabled'),sb.from('activity_log').select('*').order('created_at',{ascending:false}).limit(8),np('bookings'),np('quiz_leads'),np('contact_messages')]);
  var k=['pv','bk','ld','ms','rv','pj','sv','tk','rm','sp','wh','pl','act','pbk','pld','pms'], D={}; k.forEach(function(n,i){D[n]=R(q[i]);}); D.err=q.slice(0,13).some(function(x){return x.error;}); return D;
}
function advise(D){
  var A=[],now=Date.now(),add=function(l,m,go){A.push({l:l,m:m,go:go});}, old=function(r,h){return r.filter(function(x){return now-new Date(x.created_at)>h*36e5;}).length;}, n;
  if(n=old(D.pbk,24)) add('high',n+' booking'+(n>1?'s are':' is')+' still waiting for a reply after 24+ hours.','bookings');
  if(n=old(D.pld,48)) add('high',n+' project lead'+(n>1?'s have':' has')+' not been followed up in 48+ hours.','quiz_leads');
  if(n=old(D.pms,24)) add('med',n+' contact message'+(n>1?'s are':' is')+' unanswered after 24+ hours.','contact_messages');
  if(n=D.tk.filter(function(t){return !t.done&&t.due_at&&new Date(t.due_at)<now;}).length) add('high',n+' task'+(n>1?'s are':' is')+' overdue.','tasks');
  if(n=D.rm.filter(function(r){return !r.done&&new Date(r.remind_at)<=now;}).length) add('med',n+' reminder'+(n>1?'s are':' is')+' due now.','reminders');
  var c=inP(D.pv,0).length,p=inP(D.pv,1).length; if(p>=20&&c<p*.7) add('med','Traffic is down '+Math.round((1-c/p)*100)+'% compared with the previous period.','reports');
  if(c>=50&&inP(D.bk,0).length+inP(D.ld,0).length+inP(D.ms,0).length===0) add('med','Visitors are arriving but nobody enquired this period. Check your contact page and calls to action.','reports');
  if(!D.sp.some(function(x){return now-new Date(x.created_at)<14*864e5;})) add('low','No social post in the last 14 days. Share a project or a review.','social_posts');
  if(!D.wh.some(function(x){return x.active;})) add('low','No active webhooks. Connect one to get alerts and enable cross-posting.','webhooks');
  if(n=D.pj.filter(function(x){return x.published&&!x.image_url;}).length) add('low',n+' published project'+(n>1?'s have':' has')+' no image URL. Visuals lift engagement.','projects');
  if(n=D.pj.filter(function(x){return !x.published;}).length) add('low',n+' project'+(n>1?'s are':' is')+' unpublished drafts.','projects');
  if(n=D.rv.filter(function(x){return !x.approved;}).length) add('low',n+' review'+(n>1?'s are':' is')+' hidden from the public site.','reviews');
  if(!D.pl.some(function(x){return x.key==='google_analytics'&&x.enabled;})) add('low','Google Analytics is off. Enable it under Plugins for deeper reporting.','plugins');
  if(!A.length) add('ok','All clear. Nothing needs attention right now.','overview');
  return A;
}
function adviceHtml(A,lim){ return A.slice(0,lim||99).map(function(x,i){return '<div class="li"><span class="tag '+x.l+'">'+({high:'URGENT',med:'SOON',low:'TIP',ok:'OK'})[x.l]+'</span><div class="m">'+esc(x.m)+'</div><div class="acts"><button class="btn ghost sm" data-go="'+x.go+'">Open</button>'+(x.l==='ok'?'':'<button class="btn ghost sm" data-ta="'+i+'">+ Task</button>')+'</div></div>';}).join(''); }
function wireAdvice(el,A){ el.onclick=async function(e){ var b=e.target.closest('button'); if(!b) return; if(b.dataset.go) show(b.dataset.go);
  if(b.dataset.ta){ var x=A[b.dataset.ta], r=await sb.from('tasks').insert({title:x.m.replace(/\.$/,''),due_at:new Date(Date.now()+864e5).toISOString(),priority:x.l==='high'?'high':'med',source:'advisor'}); toast(r.error?r.error.message:'Task added'); if(!r.error) log('Task created from advisor'); } }; }
async function overview(){
  var m=$('#main'); m.innerHTML='<p class="muted">Loading analytics…</p>'; var D=await load();
  var cnt=function(r){return [inP(r,0).length,inP(r,1).length];}, pv=cnt(D.pv), bk=cnt(D.bk), ld=cnt(D.ld), ms=cnt(D.ms);
  var inq=[bk[0]+ld[0]+ms[0],bk[1]+ld[1]+ms[1]], cr=function(i){return inq[i]&&0||0;};
  var rt=function(i){var r=inP(D.rv,i).filter(function(x){return x.rating;}); return r.length?r.reduce(function(s,x){return s+x.rating;},0)/r.length:0;};
  var conv=pv[0]?inq[0]/pv[0]*100:0, convP=pv[1]?inq[1]/pv[1]*100:0, open=D.tk.filter(function(t){return !t.done;}).length, due=D.rm.filter(function(r){return !r.done&&new Date(r.remind_at)<=Date.now();}).length;
  var K=[['👁','Page views',pv[0],delta(pv[0],pv[1]),'page_views'],['📅','Bookings',bk[0],delta(bk[0],bk[1]),'bookings'],['🎯','Project leads',ld[0],delta(ld[0],ld[1]),'quiz_leads'],['✉️','Messages',ms[0],delta(ms[0],ms[1]),'contact_messages'],
   ['⭐','Avg rating',rt(0)?rt(0).toFixed(1):'–',rt(1)?(rt(0)-rt(1)>=0?'+':'')+(rt(0)-rt(1)).toFixed(1):'–','reviews'],['🔄','Conversion',conv.toFixed(1)+'%',conv||convP?(conv-convP>=0?'+':'')+(conv-convP).toFixed(1)+'pt':'–','reports'],
   ['✅','Open tasks',open,'','tasks'],['⏰','Reminders due',due,'','reminders']];
  var A=advise(D), up=D.rm.filter(function(r){return !r.done;}).sort(function(a,b){return new Date(a.remind_at)-new Date(b.remind_at);}).slice(0,5);
  m.innerHTML=(D.err?'<div class="note">Some analytics tables are missing. Run <b>supabase-dashboard.sql</b> in Supabase to enable all reports.</div>':'')+
   '<div class="bar"><h2>Overview</h2><select id="per"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div>'+
   '<div class="kpis">'+K.map(function(k){var cl=/^\+|^new/.test(k[3])?'up':/^-/.test(k[3])?'down':''; return '<div class="kpi" data-go="'+k[4]+'"><span class="ic">'+k[0]+'</span><div><small>'+k[1]+'</small><b>'+k[2]+'</b></div>'+(k[3]?'<em class="'+cl+'">'+k[3]+'</em>':'')+'</div>';}).join('')+'</div>'+
   '<div class="grid2"><div class="card"><h3>Traffic &amp; inquiries</h3><canvas id="c1"></canvas></div><div class="card"><h3>Inbox status</h3><canvas id="c2"></canvas></div></div>'+
   '<div class="grid2"><div class="card"><h3>Top pages</h3><canvas id="c3"></canvas></div><div class="card"><h3>Feature activity</h3><canvas id="c4"></canvas></div></div>'+
   '<div class="grid2"><div class="card"><h3>Task advisor <button class="btn ghost sm" data-go="advisor">All</button></h3><div id="adv">'+adviceHtml(A,5)+'</div></div>'+
   '<div class="card"><h3>Upcoming reminders <button class="btn ghost sm" data-go="reminders">All</button></h3>'+(up.map(function(r){return '<div class="li"><div class="m">'+esc(r.title)+'<small>'+new Date(r.remind_at).toLocaleString([],{dateStyle:'medium',timeStyle:'short'})+'</small></div></div>';}).join('')||'<p class="muted">No reminders scheduled.</p>')+
   '<h3 style="margin-top:16px">Recent activity <button class="btn ghost sm" data-go="activity_log">History</button></h3>'+(D.act.map(function(x){return '<div class="li"><div class="m">'+esc(x.message||x.kind)+'<small>'+esc(x.kind)+' · '+new Date(x.created_at).toLocaleString([],{dateStyle:'short',timeStyle:'short'})+'</small></div></div>';}).join('')||'<p class="muted">Nothing yet.</p>')+'</div></div>';
  $('#per').value=DAYS; $('#per').onchange=function(){ DAYS=+this.value; overview(); };
  m.onclick=function(e){ var g=e.target.closest('[data-go]'); if(g&&!e.target.closest('#adv')) show(g.dataset.go); }; wireAdvice($('#adv'),A);
  var lab=labels(), inqS=series(D.bk.concat(D.ld,D.ms).filter(function(r){return new Date(r.created_at)>Date.now()-DAYS*864e5;}));
  mk('c1',{type:'line',data:{labels:lab,datasets:[{label:'Page views',data:series(D.pv),borderColor:'#4c7fff',backgroundColor:'rgba(76,127,255,.15)',fill:true,tension:.35,yAxisID:'y'},{label:'Inquiries',data:inqS,borderColor:'#f5821f',tension:.35,yAxisID:'y1'}]},
    options:{interaction:{mode:'index',intersect:false},scales:{y:{beginAtZero:true,ticks:{precision:0}},y1:{beginAtZero:true,position:'right',grid:{drawOnChartArea:false},ticks:{precision:0}}}}});
  var st={}; D.bk.concat(D.ld,D.ms).filter(function(r){return new Date(r.created_at)>Date.now()-DAYS*864e5;}).forEach(function(r){var s=r.status||'new'; st[s]=(st[s]||0)+1;});
  mk('c2',{type:'doughnut',data:{labels:Object.keys(st).length?Object.keys(st):['No data'],datasets:[{data:Object.keys(st).length?Object.values(st):[1],backgroundColor:['#f5821f','#4c7fff','#4fd1c5','#8b5fe8','#6c79a8'],borderWidth:0}]},options:{cutout:'62%'}});
  var tp={}; inP(D.pv,0).forEach(function(r){tp[r.path||'/']=(tp[r.path||'/']||0)+1;}); var tk=Object.entries(tp).sort(function(a,b){return b[1]-a[1];}).slice(0,6);
  mk('c3',{type:'bar',data:{labels:tk.length?tk.map(function(x){return x[0];}):['No data'],datasets:[{label:'Views',data:tk.length?tk.map(function(x){return x[1];}):[0],backgroundColor:'#8b5fe8',borderRadius:6}]},options:{indexAxis:'y',plugins:{legend:{display:false}}}});
  mk('c4',{type:'bar',data:{labels:['Bookings','Leads','Messages','Reviews','Social posts'],datasets:[{label:'This period',data:[bk[0],ld[0],ms[0],inP(D.rv,0).length,inP(D.sp,0).length],backgroundColor:'#f5821f',borderRadius:6},{label:'Previous',data:[bk[1],ld[1],ms[1],inP(D.rv,1).length,inP(D.sp,1).length],backgroundColor:'rgba(155,167,209,.35)',borderRadius:6}]},options:{scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
}
async function advisorPage(){
  var m=$('#main'); m.innerHTML='<p class="muted">Analysing…</p>'; var D=await load(), A=advise(D);
  m.innerHTML='<div class="bar"><h2>Task advisor</h2><button class="btn ghost" id="rf">Re-analyse</button></div><div class="note">Rules run on your live data each time you open this page: unanswered inquiries, overdue tasks, traffic changes, content gaps and setup tips. Use <b>+ Task</b> to turn any advice into a tracked task.</div><div class="card" id="adv">'+adviceHtml(A)+'</div>';
  $('#rf').onclick=advisorPage; wireAdvice($('#adv'),A);
}
async function reports(){
  var m=$('#main'); m.innerHTML='<p class="muted">Building report…</p>'; var D=await load(), c=function(r){return [inP(r,0).length,inP(r,1).length];};
  var rt=function(i){var r=inP(D.rv,i).filter(function(x){return x.rating;}); return r.length?(r.reduce(function(s,x){return s+x.rating;},0)/r.length).toFixed(2):'–';};
  var rows=[['Page views'].concat(c(D.pv)),['Bookings'].concat(c(D.bk)),['Project leads'].concat(c(D.ld)),['Contact messages'].concat(c(D.ms)),['Reviews received'].concat(c(D.rv)),['Social posts'].concat(c(D.sp))].map(function(r){return [r[0],r[1],r[2],delta(r[1],r[2])];});
  rows.push(['Average rating',rt(0),rt(1),'']);
  var inv=[['Projects',D.pj.length,D.pj.filter(function(x){return x.published;}).length+' published · '+D.pj.filter(function(x){return x.featured;}).length+' featured · '+D.pj.filter(function(x){return !x.image_url;}).length+' without image'],
   ['Services',D.sv.length,D.sv.filter(function(x){return x.published;}).length+' published'],['Tasks',D.tk.length,D.tk.filter(function(x){return x.done;}).length+' done · '+D.tk.filter(function(x){return !x.done;}).length+' open'],
   ['Reminders',D.rm.length,D.rm.filter(function(x){return !x.done;}).length+' pending'],['Webhooks',D.wh.length,D.wh.filter(function(x){return x.active;}).length+' active'],['Plugins',D.pl.length,D.pl.filter(function(x){return x.enabled;}).length+' enabled']];
  var tb=function(h,r){return '<div class="tbl" style="margin-bottom:18px"><table><thead><tr>'+h.map(function(x){return '<th>'+x+'</th>';}).join('')+'</tr></thead><tbody>'+r.map(function(x){return '<tr>'+x.map(function(y){return '<td>'+esc(y)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';};
  m.innerHTML='<div class="bar"><h2>Performance report</h2><select id="per"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><button class="btn ghost" id="csv">Export CSV</button><button class="btn" id="pr">Print / PDF</button></div>'+
   '<h3 style="margin-bottom:10px">Activity vs previous period</h3>'+tb(['Feature','This period','Previous','Change'],rows)+'<h3 style="margin-bottom:10px">Content &amp; automation inventory</h3>'+tb(['Feature','Total','Breakdown'],inv);
  $('#per').value=DAYS; $('#per').onchange=function(){ DAYS=+this.value; reports(); }; $('#pr').onclick=function(){ window.print(); };
  $('#csv').onclick=function(){ var all=[['Feature','This period','Previous','Change']].concat(rows,[[],['Feature','Total','Breakdown']],inv); var s=all.map(function(r){return r.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
    var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([s],{type:'text/csv'})); a.download='performance-report-'+DAYS+'d.csv'; a.click(); log('Exported performance report'); };
}
// reminder bell + browser notifications
var lastDue=0;
async function pollDue(){ var r=await sb.from('reminders').select('id',{count:'exact',head:true}).eq('done',false).lte('remind_at',new Date().toISOString()); var n=r.count||0, b=$('#bc'); b.hidden=!n; b.textContent=n;
  if(n>lastDue&&window.Notification&&Notification.permission==='granted') new Notification('Reminder due',{body:n+' reminder'+(n>1?'s':'')+' need attention'}); lastDue=n; }
$('#bell').onclick=function(){ if(window.Notification&&Notification.permission==='default') Notification.requestPermission(); show('reminders'); };
$('#burger').onclick=function(){ document.body.classList.toggle('nav-open'); }; $('#scrim').onclick=function(){ document.body.classList.remove('nav-open'); };
pollDue(); setInterval(pollDue,60000);
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
