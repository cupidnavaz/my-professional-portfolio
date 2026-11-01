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
      return '<div class="service-detail in-view"><div class="card-ic ic-'+esc(s.color)+'">'+esc(s.icon)+'</div><div><h3>'+esc(s.title)+'</h3><p class="desc">'+esc(s.description)+'</p><div class="includes">'+
        (s.includes||'').split(',').map(function(x){return x.trim();}).filter(Boolean).map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div></div></div>';
    }).join('');
    if(tea) tea.innerHTML=rows.map(function(s){
      return '<div class="card in-view"><div class="card-ic ic-'+esc(s.color)+'">'+esc(s.icon)+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.description)+'</p></div>';
    }).join('');
  });

  // ----- appearance, social links, plugins (managed in Admin -> Appearance / Plugins)
  var hex=/^#[0-9a-f]{3,8}$/i, fontOk=/^[\w ]{2,40}$/;
  function applyTheme(s){
    var v={}, css='', fonts=[];
    if(s.theme_mode==='light') v={'--bg':'#f6f7fb','--bg-alt':'#eceef6','--bg-card':'#ffffff','--line':'rgba(20,30,70,.14)','--ink':'#1a2040','--ink-dim':'#5a6385','--ink-glow':'#141a3a'};
    if(hex.test(s.color_accent||'')) v['--orange']=s.color_accent;
    if(hex.test(s.color_blue||'')) v['--blue']=s.color_blue;
    if(hex.test(s.color_violet||'')) v['--violet']=s.color_violet;
    if(hex.test(s.color_bg||'')){ v['--bg']=s.color_bg; v['--bg-alt']=s.color_bg; }
    if(hex.test(s.color_text||'')){ v['--ink-glow']=s.color_text; v['--ink']=s.color_text; }
    css=':root{'+Object.keys(v).map(function(n){return n+':'+v[n]+';';}).join('')+'}';
    if(s.theme_mode==='light'||s.color_text) css+='h1,h2,h3{color:var(--ink-glow)!important}';
    if(s.theme_mode==='light') css+='header{background:rgba(255,255,255,.85)!important}';
    if(fontOk.test(s.font_heading||'')){ fonts.push(s.font_heading); css+="h1,h2,h3,.display,.brand{font-family:'"+s.font_heading+"',sans-serif!important}"; }
    if(fontOk.test(s.font_body||'')){ fonts.push(s.font_body); css+="body{font-family:'"+s.font_body+"',system-ui,sans-serif!important}"; }
    return {css:css,fonts:fonts};
  }
  function paint(t){
    var st=document.getElementById('cms-theme')||document.head.appendChild(Object.assign(document.createElement('style'),{id:'cms-theme'})); st.textContent=t.css;
    t.fonts.forEach(function(f){ var id='cms-font-'+f.replace(/\W/g,''); if(document.getElementById(id)) return;
      var l=document.createElement('link'); l.id=id; l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family='+f.replace(/ /g,'+')+':wght@400;500;600;700&display=swap'; document.head.appendChild(l); });
  }
  try{ var cached=JSON.parse(localStorage.getItem('cms_theme')||'null'); if(cached) paint(cached); }catch(e){}
  fetchRecords('settings','?select=*').then(function(rows){
    var s={}; rows.forEach(function(r){ s[r.key]=r.value; });
    var t=applyTheme(s); paint(t); try{ localStorage.setItem('cms_theme',JSON.stringify(t)); }catch(e){}
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
})();
