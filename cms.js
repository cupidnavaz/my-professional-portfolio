// Loads content managed in the admin panel. Falls back to the built-in HTML if Supabase isn't set up.
(function(){
  try{
    var k='sb-'+new URL(SUPABASE_URL).hostname.split('.')[0]+'-auth-token', s=JSON.parse(localStorage.getItem(k)||'null');
    if(s && s.expires_at*1000>Date.now()) document.querySelectorAll('.admin-only').forEach(function(e){ e.hidden=false; });
  }catch(e){}
  if(typeof SUPABASE_READY==='undefined' || !SUPABASE_READY) return;
  try{ var pg=location.pathname.split('/').pop()||'index.html', sk='pv_'+pg;
    if(!sessionStorage.getItem(sk) && !document.querySelector('.admin-only:not([hidden])')){ sessionStorage.setItem(sk,1);
      fetch(SUPABASE_URL+'/rest/v1/page_views',{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+SUPABASE_ANON_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({path:pg.slice(0,100),referrer:(document.referrer||'').slice(0,190)})}).catch(function(){}); } }catch(e){}
  var esc=function(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var $=function(s,r){ return (r||document).querySelector(s); }, $$=function(s,r){ return [].slice.call((r||document).querySelectorAll(s)); };
  var qs='?select=*&published=eq.true&order=sort.asc';
  var ic=function(s){ return s.image_url?'<div class="card-ic card-img"><img src="'+esc(s.image_url)+'" alt="" loading="lazy"></div>':''+ic(s)+''; };

  // ----- site settings
  fetchRecords('settings','?select=*').then(function(rows){
    var map={footer_text:'footer .wrap p:nth-of-type(1)',footer_tagline:'footer .wrap p:nth-of-type(2)',hero_lead:'.hero p.lead'};
    rows.forEach(function(r){ var el=map[r.key]&&$(map[r.key]); if(el&&r.value) el.textContent=r.value; });
  });

  // ----- projects
  var pGrid=$('#projects .project-grid'), pPage=$('.category-block');
  if(pGrid||pPage) fetchRecords('projects',qs).then(function(rows){
    if(!rows.length) return;
    rows.forEach(function(p){
      if(window.__projectsData) window.__projectsData[p.slug]={tag:p.tag,title:p.title,client:p.client,duration:p.duration,overview:p.overview,request:p.request,challenge:p.challenge,solution:p.solution,results:p.results,
        tools:(p.tools||'').split(',').map(function(x){return x.trim();}).filter(Boolean),images:[{icon:p.icon||'📁',cap:p.title}]};
    });
    var card=function(p,i){
      var th=p.image_url?'<img src="'+esc(p.image_url)+'" alt="" style="width:100%;height:100%;object-fit:cover">':'<span style="font-size:54px">'+esc(p.icon||'📁')+'</span>';
      return '<div class="project-card in-view" data-cat="'+esc(p.category)+'"><div class="project-thumb thumb-'+(i%3+1)+'">'+th+'</div><div class="project-body"><span class="project-tag">'+esc(p.tag)+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.summary||p.overview)+'</p><a href="#" class="project-link" data-cms-project="'+esc(p.slug)+'">View case study →</a></div></div>';
    };
    if(pGrid){ var f=rows.filter(function(p){return p.featured;}); pGrid.innerHTML=(f.length?f:rows.slice(0,3)).map(card).join(''); }
    $$('.category-block').forEach(function(b){
      var c0=$('.project-card',b), cat=c0&&c0.getAttribute('data-cat'); if(!cat) return;
      var mine=rows.filter(function(p){return p.category===cat;});
      $('.project-grid',b).innerHTML=mine.map(card).join('');
      var cnt=$('.category-head span',b); if(cnt) cnt.textContent=mine.length+' project'+(mine.length===1?'':'s');
      b.style.display=mine.length?'':'none';
    });
    if(window.fxScan) window.fxScan();
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-cms-project]');
    if(a){ e.preventDefault(); if(window.__openProject) window.__openProject(a.getAttribute('data-cms-project')); }
  });

  // ----- services
  var det=$('.service-detail'), tea=$('#services .grid-6');
  if(det||tea) fetchRecords('services',qs).then(function(rows){
    if(!rows.length) return;
    if(det) det.parentNode.innerHTML=rows.map(function(s){
      return '<div class="service-detail in-view">'+ic(s)+'<div><h3>'+esc(s.title)+'</h3><p class="desc">'+esc(s.description)+'</p><div class="includes">'+
        (s.includes||'').split(',').map(function(x){return x.trim();}).filter(Boolean).map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div></div></div>';
    }).join('');
    if(tea) tea.innerHTML=rows.map(function(s){
      return '<div class="card in-view">'+ic(s)+'<h3>'+esc(s.title)+'</h3><p>'+esc(s.description)+'</p></div>';
    }).join('');
  });

  // ----- appearance, social links, plugins (managed in Admin -> Appearance / Plugins)
  var hex=/^#[0-9a-f]{3,8}$/i, fontOk=/^[\w ]{2,40}$/, SERIF=['Alice','Playfair Display','Lora','Merriweather','Cormorant Garamond','Libre Baskerville'], SINGLE=['Alice','Bebas Neue','Pacifico'];
  function applyTheme(s){
    var mode=(s.theme_toggle==='on'&&localStorage.getItem('site_mode'))||s.theme_mode||'dark', P=mode==='light'?'lt_':'dk_', v={}, css='', fonts=[];
    var g=function(k){ return hex.test(s[k]||'')?s[k]:''; };
    if(mode==='light') v={'--bg':'#f6f7fb','--bg-alt':'#eceef6','--bg-card':'#ffffff','--line':'rgba(20,30,70,.14)','--ink':'#1a2040','--ink-dim':'#5a6385','--ink-glow':'#141a3a'};
    if(g('color_accent')) v['--orange']=g('color_accent');
    if(g('color_blue')) v['--blue']=g('color_blue');
    if(g('color_violet')) v['--violet']=g('color_violet');
    if(g('color_bg')){ v['--bg']=g('color_bg'); v['--bg-alt']=g('color_bg'); }
    var tx=g(P+'text')||g('color_text');
    if(tx){ v['--ink-glow']=tx; v['--ink']=tx; v['--ink-dim']='color-mix(in srgb,'+tx+' 72%,transparent)'; }
    css=':root{'+Object.keys(v).map(function(n){return n+':'+v[n]+';';}).join('')+'}';
    var hd=g(P+'heading');
    css+=hd?'h1,h2,h3,h4,.display{color:'+hd+'!important}':((mode==='light'||tx)?'h1,h2,h3{color:var(--ink-glow)!important}':'');
    if(mode==='light') css+='header{background:rgba(255,255,255,.85)!important}';
    var stc=g(P+'site_title'); if(stc) css+='.logo,#siteName{color:'+stc+'!important}';
    var sp=s.spin_speed||''; if(sp==='off') css+='.ring-1,.ring-2,.orbit-spin,.orbit-node{animation:none!important}'; if(sp==='slow') css+='.ring-1{animation-duration:52s!important}.ring-2{animation-duration:80s!important}'; if(sp==='fast') css+='.ring-1{animation-duration:12s!important}.ring-2{animation-duration:20s!important}';
    var lh=g(P+'link_hover'); if(lh) css+='a:not(.btn):hover{color:'+lh+'}';
    var nv=g(P+'nav'); if(nv) css+='.nav-links a{color:'+nv+'!important}';
    var nh=g(P+'nav_hover'); if(nh) css+='.nav-links a:hover,.nav-links a.active{color:'+nh+'!important}';
    var ft=g(P+'footer'); if(ft) css+='footer,footer p,footer a{color:'+ft+'!important}';
    if(lh) css+='footer a:hover{color:'+lh+'!important}';
    if(g('btn_hover')) css+='.btn-primary:hover{background:'+g('btn_hover')+'!important;border-color:'+g('btn_hover')+'!important}';
    var an=s.anim_hover||'', hc=g('card_hover')||g('color_accent')||'#f5821f', H='.card:hover,.project-card:hover,.service-detail:hover,.cred-card:hover,.obj-card:hover,.rec-card:hover';
    if(g('card_hover')) css+=H+'{border-color:'+hc+'!important}';
    if(an==='none') css+=H+'{transform:none!important;box-shadow:none!important}';
    if(an==='glow') css+=H+'{transform:none!important;box-shadow:0 0 0 1px '+hc+',0 0 34px color-mix(in srgb,'+hc+' 40%,transparent)!important}';
    if(an==='zoom') css+=H+'{transform:scale(1.04)!important}';
    var dur={fast:'.15s',slow:'.6s'}[s.anim_speed||''];
    if(dur) css+='.card,.project-card,.service-detail,.cred-card,.btn,.nav-links a,a{transition-duration:'+dur+'!important}.fx{transition-duration:'+(s.anim_speed==='fast'?'.35s':'1.1s')+'!important}';
    if(s.anim_reveal==='off') css+='.fx{opacity:1!important;transform:none!important;transition:none!important}';
    if(s.anim_button==='off') css+='.btn::after{display:none!important}';
    if(s.anim_enabled==='off') css+='*,*::before,*::after{animation:none!important;transition:none!important}.fx{opacity:1!important;transform:none!important}';
    if(s.logo_shape==='circle') css+='#siteLogo{border-radius:50%!important;aspect-ratio:1;width:auto;object-fit:cover}';
    if(s.logo_shape==='square') css+='#siteLogo{border-radius:2px!important}';
    if(g('logo_border')) css+='#siteLogo{border:2px solid '+g('logo_border')+'}';
    if(fontOk.test(s.font_heading||'')){ fonts.push(s.font_heading); css+="h1,h2,h3,.display,.brand{font-family:'"+s.font_heading+"',"+(SERIF.indexOf(s.font_heading)>-1?'serif':'sans-serif')+"!important}"; }
    if(fontOk.test(s.font_body||'')){ fonts.push(s.font_body); css+="body{font-family:'"+s.font_body+"',"+(SERIF.indexOf(s.font_body)>-1?'serif':'system-ui,sans-serif')+"!important}"; }
    return {css:css,fonts:fonts,notilt:(an!==''||s.anim_tilt==='off'||s.anim_enabled==='off')};
  }
  function themeBtn(){
    var s=window.__S||{}, b=document.getElementById('themeBtn'), cta=$('.nav-cta');
    if(s.theme_toggle!=='on'||!cta){ if(b) b.remove(); return; }
    var mode=localStorage.getItem('site_mode')||s.theme_mode||'dark';
    if(!b){ b=document.createElement('button'); b.id='themeBtn'; b.type='button'; b.className='theme-btn'; b.setAttribute('aria-label','Switch light or dark mode'); cta.insertBefore(b,cta.firstChild);
      b.addEventListener('click',function(){ var cur=localStorage.getItem('site_mode')||window.__S.theme_mode||'dark'; localStorage.setItem('site_mode',cur==='light'?'dark':'light');
        var t=applyTheme(window.__S); paint(t); try{ localStorage.setItem('cms_theme',JSON.stringify(t)); }catch(e){} themeBtn(); }); }
    b.textContent=mode==='light'?'🌙':'☀️';
  }
  function paint(t){
    var st=document.getElementById('cms-theme')||document.head.appendChild(Object.assign(document.createElement('style'),{id:'cms-theme'})); st.textContent=t.css; document.body.classList.toggle('no-tilt',!!t.notilt);
    t.fonts.forEach(function(f){ var id='cms-font-'+f.replace(/\W/g,''); if(document.getElementById(id)) return;
      var l=document.createElement('link'); l.id=id; l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family='+f.replace(/ /g,'+')+(SINGLE.indexOf(f)>-1?'':':wght@400;700')+'&display=swap'; document.head.appendChild(l); });
  }
  try{ var cached=JSON.parse(localStorage.getItem('cms_theme')||'null'); if(cached) paint(cached); }catch(e){}
  fetchRecords('settings','?select=*').then(function(rows){
    var s={}; rows.forEach(function(r){ s[r.key]=r.value; });
    window.__S=s; var t=applyTheme(s); paint(t); themeBtn(); try{ localStorage.setItem('cms_theme',JSON.stringify(t)); }catch(e){}
    var ic={x:'𝕏',linkedin:'in',instagram:'◎',facebook:'f',youtube:'▶',github:'⌥',tiktok:'♪',whatsapp:'✆',telegram:'✈'}, nm={x:'X',linkedin:'LinkedIn',instagram:'Instagram',facebook:'Facebook',youtube:'YouTube',github:'GitHub',tiktok:'TikTok',whatsapp:'WhatsApp',telegram:'Telegram'}, html='';
    Object.keys(ic).forEach(function(n){
      var v=(s['social_'+n]||'').trim(); if(!v) return;
      if(n==='whatsapp'&&/^\+?\d+$/.test(v)) v='https://wa.me/'+v.replace('+','');
      if(n==='telegram'&&/^@?\w+$/.test(v)) v='https://t.me/'+v.replace('@','');
      if(!/^https?:\/\//i.test(v)) return;
      html+='<a href="'+esc(v)+'" target="_blank" rel="noopener" aria-label="'+nm[n]+'">'+ic[n]+'</a>';
    });
    if(html){ $$('.social-row').forEach(function(r){ r.innerHTML=html; });
      var fw=$('footer .wrap'); if(fw&&!$('footer .social-row')){ var d=document.createElement('div'); d.className='social-row'; d.style.marginTop='12px'; d.innerHTML=html; fw.appendChild(d); } }
  });
  fetchRecords('plugins','?select=*&enabled=eq.true').then(function(rows){
    rows.forEach(function(p){
      var v=(p.config||'').trim(); if(!v) return;
      function js(src,code){ var s=document.createElement('script'); if(src){ s.async=true; s.src=src; } else s.textContent=code; document.head.appendChild(s); }
      if(p.key==='google_analytics'&&/^[\w-]+$/.test(v)){ js('https://www.googletagmanager.com/gtag/js?id='+v); js(null,"window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','"+v+"');"); }
      if(p.key==='meta_pixel'&&/^\d+$/.test(v)) js(null,"!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','"+v+"');fbq('track','PageView');");
      if(p.key==='tawk_to'&&/^[\w]+\/[\w]+$/.test(v)) js('https://embed.tawk.to/'+v);
      if(p.key==='custom_css'){ var st=document.createElement('style'); st.textContent=v; document.head.appendChild(st); }
      if(p.key==='custom_js') js(null,v);
    });
  });

  // ----- CV link, credentials, recommendations
  fetchRecords('settings','?select=*&key=eq.cv_url').then(function(r){ if(r[0]&&r[0].value) window.CV_URL=r[0].value; });
  var cg=$$('[data-cred]'), pv=$('#credPreview');
  if(cg.length||pv) fetchRecords('credentials','?select=*&published=eq.true&order=sort.asc').then(function(rows){
    var card=function(c){ return '<article class="cred-card" data-t="'+esc(c.type)+'"><div class="cred-top"><span class="cred-ic">'+(c.image_url?'<img src="'+esc(c.image_url)+'" alt="">':esc(c.icon||(c.type==='certification'?'🏅':'🎓')))+'</span><span class="cred-badge">'+(c.type==='certification'?'Certification':'Qualification')+'</span></div><h3>'+esc(c.title)+'</h3><p class="cred-issuer">'+esc(c.issuer)+(c.year?' · <b>'+esc(c.year)+'</b>':'')+'</p>'+(c.description?'<p class="cred-desc">'+esc(c.description)+'</p>':'')+(/^https?:\/\//.test(c.credential_url||'')?'<a class="cred-link" target="_blank" rel="noopener" href="'+esc(c.credential_url)+'">View credential ↗</a>':'')+'</article>'; };
    cg.forEach(function(g){ var mine=rows.filter(function(x){return x.type===g.getAttribute('data-cred');}); g.innerHTML=mine.map(card).join('')||'<p class="muted-note">Nothing added yet.</p>'; });
    if(pv) pv.innerHTML=rows.slice(0,4).map(card).join('')||'<p class="muted-note">Credentials will appear here soon.</p>';
    if(window.fxScan) window.fxScan();
  });
  var rl=$('#recList');
  if(rl) fetchRecords('recommendations','?select=*&approved=eq.true&order=created_at.desc&limit=30').then(function(rows){
    rl.innerHTML=rows.length?rows.map(function(r){ return '<blockquote class="rec-card"><p>“'+esc(r.message)+'”</p><footer><b>'+esc(r.name)+'</b>'+(r.role?' · '+esc(r.role):'')+(r.rating?' <span class="stars">'+'★'.repeat(Math.min(5,r.rating))+'</span>':'')+'</footer></blockquote>'; }).join(''):'<p class="muted-note">Be the first to leave a recommendation.</p>';
    if(window.fxScan) window.fxScan();
  });
  var rf=$('#recForm');
  if(rf) rf.addEventListener('submit',function(e){
    e.preventDefault(); var f=rf.elements, m=$('#recMsg'), b=rf.querySelector('button[type=submit]'); if(f.website.value) return; b.disabled=true; m.textContent='Sending…';
    fetch(SUPABASE_URL+'/rest/v1/recommendations',{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+SUPABASE_ANON_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify({name:f.name.value.trim().slice(0,80),role:f.role.value.trim().slice(0,80)||null,rating:+f.rating.value||null,message:f.message.value.trim().slice(0,2000)})})
    .then(function(r){ if(!r.ok) throw 0; rf.reset(); m.textContent='Thank you! Your recommendation will appear once it has been reviewed.'; })
    .catch(function(){ m.textContent='Could not send right now. Please try again later.'; }).then(function(){ b.disabled=false; });
  });

  // ----- branding: logo, site name, favicon (Admin > Appearance)
  fetchRecords('settings','?select=*&key=in.(site_name,brand_display,site_logo,site_favicon)').then(function(rows){
    var s={}; rows.forEach(function(r){ s[r.key]=r.value; });
    var img=$('#siteLogo'), nm=$('#siteName'), safe=function(u){ return /^(https?:\/\/|assets\/|\/)/i.test(u||''); };
    if(s.site_logo&&safe(s.site_logo)&&img) img.src=s.site_logo;
    if(s.site_name&&nm){ nm.textContent=s.site_name; var parts=document.title.split(' — ');
      if(parts.length>1) document.title=(/index\.html$|\/$/.test(location.pathname)||!location.pathname.split('/').pop())?s.site_name+' — '+parts.slice(1).join(' — '):parts[0]+' — '+s.site_name; }
    if(nm) nm.hidden=s.brand_display==='logo'; if(img) img.hidden=s.brand_display==='name';
    if(s.site_favicon&&safe(s.site_favicon)){ var l=document.querySelector('link[rel~="icon"]')||document.head.appendChild(Object.assign(document.createElement('link'),{rel:'icon'}));
      l.removeAttribute('type'); l.href=s.site_favicon; var a=document.querySelector('link[rel="apple-touch-icon"]')||document.head.appendChild(Object.assign(document.createElement('link'),{rel:'apple-touch-icon'})); a.href=s.site_favicon; }
  });

  // ----- footer links, hero image, resume (Admin > Appearance)
  fetchRecords('settings','?select=*&key=in.(footer_links,hero_image,avatar_image,cv_url)').then(function(rows){
    var s={}; rows.forEach(function(r){ s[r.key]=r.value; });
    var safe=function(u){ return /^(https?:\/\/|assets\/|\/)/i.test(u||''); };
    if(s.hero_image&&safe(s.hero_image)) $$('.orbit-core-inner img').forEach(function(i){ i.src=s.hero_image; i.style.objectFit='cover'; });
    if(s.avatar_image&&safe(s.avatar_image)) $$('.hero-top .avatar-inner img,.bio-avatar img').forEach(function(i){ i.src=s.avatar_image; i.style.objectFit='cover'; });
    if(s.cv_url&&safe(s.cv_url)){ window.CV_URL=s.cv_url; var dl=/\/storage\/v1\/object\/public\//.test(s.cv_url)?s.cv_url+'?download=Resume.pdf':s.cv_url;
      $$('a[href="assets/cv.pdf"]').forEach(function(a){ a.href=dl; }); }
    var links=(s.footer_links||'').split('\n').map(function(l){ var p=l.split('|'); return p.length>1?[p[0].trim(),p.slice(1).join('|').trim()]:null; })
      .filter(function(p){ return p&&p[0]&&/^(https?:\/\/|mailto:|tel:|#|[\w\-.\/]+\.html(#[\w-]+)?$)/i.test(p[1]); });
    var fw=$('footer .wrap'), old=$('.footer-links'); if(old) old.remove();
    if(fw&&links.length){ var d=document.createElement('div'); d.className='footer-links';
      d.innerHTML=links.map(function(p){ var ext=/^https?:/i.test(p[1]); return '<a href="'+esc(p[1])+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+esc(p[0])+'</a>'; }).join('');
      fw.insertBefore(d,fw.querySelector('.social-row')); if(!d.parentNode) fw.appendChild(d); }
  });

  // ----- editable page content, hidden sections, custom sections and custom pages
  var PG=document.body.getAttribute('data-pg')||'', ok=function(u){ return /^(https?:\/\/|mailto:|tel:|#|assets\/|\/|[\w.\-\/]+\.html)/i.test(u||''); };
  function clean(h){ var t=document.createElement('template'), good={B:1,I:1,EM:1,STRONG:1,BR:1,SPAN:1,A:1,SMALL:1,CODE:1}; t.innerHTML=h;
    (function walk(n){ [].slice.call(n.childNodes).forEach(function(c){ if(c.nodeType!==1) return;
      if(!good[c.tagName]){ c.replaceWith(document.createTextNode(c.textContent)); return; }
      [].slice.call(c.attributes).forEach(function(a){ if(!((a.name==='class'&&/^(accent|muted)$/.test(a.value))||(a.name==='href'&&ok(a.value)))) c.removeAttribute(a.name); });
      if(c.tagName==='A'&&/^https?:/i.test(c.getAttribute('href')||'')){ c.target='_blank'; c.rel='noopener'; } walk(c); }); })(t.content); return t.innerHTML; }
  function md(t){ return esc(t||'').split(/\n{2,}/).map(function(p){ return '<p>'+p.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|[\w.\/-]+\.html|#[\w-]+|mailto:[^)\s]+)\)/g,'<a href="$2">$1</a>').replace(/\n/g,'<br>')+'</p>'; }).join(''); }
  function secEl(r){
    var img=r.image_url&&ok(r.image_url)?'<div class="cs-img"><img src="'+esc(r.image_url)+'" alt="" loading="lazy"></div>':'', ext=/^https?:/i.test(r.button_url||'');
    var btn=r.button_text&&ok(r.button_url)?'<a class="btn btn-primary" href="'+esc(r.button_url)+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+esc(r.button_text)+'</a>':'';
    var tx='<div class="cs-text">'+(r.eyebrow?'<p class="eyebrow">'+esc(r.eyebrow)+'</p>':'')+(r.heading?'<h2>'+esc(r.heading)+'</h2>':'')+md(r.body)+btn+'</div>';
    var inner=r.layout==='image-left'?img+tx:r.layout==='image-right'?tx+img:tx+(img?img:'');
    var s=document.createElement('section'); s.className='cs cs-'+esc(r.layout)+' cs-'+esc(r.style); s.innerHTML='<div class="wrap cs-in">'+inner+'</div>'; return s;
  }
  function addSections(page){
    fetchRecords('page_sections','?select=*&published=eq.true&page=eq.'+encodeURIComponent(page)+'&order=sort.asc').then(function(rows){
      var ftr=$('footer'), anchor=$('.pg-hero')||$('.hero'), last=anchor;
      rows.forEach(function(r){ var e=secEl(r); if(r.placement==='top'&&anchor){ last.after(e); last=e; } else if(ftr) ftr.before(e); });
      if(window.fxScan) window.fxScan();
    });
  }
  if(PG&&PG!=='dyn'){
    fetchRecords('page_content','?select=*&page=in.('+PG+',bio,nav)').then(function(rows){
      rows.forEach(function(r){
        if(r.kind==='hide'){ var s=document.querySelector('[data-sec="'+r.key.slice(5).replace(/"/g,'')+'"]'); if(s) s.style.display='none'; return; }
        var e=document.querySelector('[data-edit="'+r.key.replace(/"/g,'')+'"]'); if(!e||r.value==null) return;
        if(e.tagName==='IMG'){ if(ok(r.value)) e.src=r.value; }
        else if(e.tagName==='A'||e.tagName==='BUTTON'){ e.textContent=r.value; if(r.href&&ok(r.href)&&e.tagName==='A'&&!/^data-(open|cv)/.test([].map.call(e.attributes,function(a){return a.name;}).join(' '))) e.href=r.href; }
        else e.innerHTML=clean(r.value);
      });
    });
    addSections(PG);
  }
  // custom pages in the menu
  fetchRecords('site_pages','?select=*&published=eq.true&show_in_nav=eq.true&order=sort.asc').then(function(rows){
    var ul=$('#navLinks'), adm=ul&&$('.admin-only',ul), cur=new URLSearchParams(location.search).get('p');
    rows.forEach(function(p){ if(!ul) return; var li=document.createElement('li'); li.innerHTML='<a href="page.html?p='+encodeURIComponent(p.slug)+'"'+(PG==='dyn'&&cur===p.slug?' class="active"':'')+'>'+esc(p.nav_label||p.title)+'</a>'; ul.insertBefore(li,adm||null); });
  });
  if(PG==='dyn'){
    var slug=new URLSearchParams(location.search).get('p')||'', top=$('#dynTop');
    fetchRecords('site_pages','?select=*&published=eq.true&slug=eq.'+encodeURIComponent(slug)).then(function(rows){
      var p=rows[0]; top.innerHTML='<section class="pg-hero"><div class="wrap"><p class="breadcrumb"><a href="index.html">Home</a> / '+esc(p?p.title:'Not found')+'</p><h1>'+esc(p?p.title:'Page not found')+'</h1><p class="lead">'+esc(p?(p.intro||''):'This page doesn’t exist or isn’t published yet.')+'</p></div></section>';
      if(p){ document.title=p.title+' — '+(document.title.split(' — ')[1]||'Portfolio'); addSections(slug); }
    });
  }
})();
