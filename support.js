// Customer support widget on every page: FAQ help, message form (creates a ticket) and direct contact options.
(function(){
  var d=document; if(d.getElementById('supBtn')) return;
  var esc=function(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var GI={"whatsapp": "<svg class=\"gi gi-fill\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z\"/></svg>", "mail": "<svg class=\"gi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"m3 7 9 6 9-6\"/></svg>", "phone": "<svg class=\"gi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>", "calendar": "<svg class=\"gi\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/></svg>"};
  var cfg={hi:'Hi 👋 How can we help you today? Search the answers below or send us a message.',wa:'2349039454419',em:'uchennagodswill9@gmail.com',ph:'+2349039454419',hrs:''};
  var faq=[{question:'How do I book a consultation?',answer:'Open the Contact page and choose the “Book a consultation” tab.'},{question:'How can I start a project?',answer:'Use “Start a project” on the site or send us a message here with a few details.'},{question:'Can I download your CV?',answer:'Yes. Open the About page and use Preview CV or Download PDF.'}];
  var btn=d.createElement('button'); btn.id='supBtn'; btn.type='button'; btn.className='sup-btn'; btn.setAttribute('aria-label','Customer support'); btn.setAttribute('aria-expanded','false'); btn.innerHTML='<span class="sup-ic">💬</span><span class="sup-lbl">Support</span>';
  var p=d.createElement('section'); p.id='supPanel'; p.className='sup-panel'; p.hidden=true; p.setAttribute('role','dialog'); p.setAttribute('aria-label','Customer support');
  p.innerHTML='<div class="sup-head"><span class="sup-av">🛟</span><div><b>Customer support</b><small id="supHrs"><i class="pulse"></i> We’re here to help</small></div><button type="button" class="sup-x" aria-label="Close support">✕</button></div>'+
   '<div class="sup-tabs"><button type="button" class="on" data-st="help">Help</button><button type="button" data-st="msg">Message us</button><button type="button" data-st="contact">Contact</button></div>'+
   '<div class="sup-body"><div data-sp="help"><div class="sup-bubble" id="supHi"></div><input id="supQ" type="search" placeholder="Search help…" aria-label="Search help"><div id="supFaq"></div></div>'+
   '<div data-sp="msg" hidden><form id="supForm"><input name="name" placeholder="Your name" required maxlength="80"><input name="email" type="email" placeholder="Email for our reply" required maxlength="120"><textarea name="message" rows="4" placeholder="How can we help?" required minlength="5" maxlength="3000"></textarea>'+
   '<input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px"><button class="btn btn-primary" type="submit">Send message</button><p id="supMsg" role="status"></p></form></div>'+
   '<div data-sp="contact" hidden id="supLinks"></div></div>';
  d.body.appendChild(btn); d.body.appendChild(p);
  var $=function(s){ return p.querySelector(s); }, $$=function(s){ return [].slice.call(p.querySelectorAll(s)); };
  function draw(){
    $('#supHi').textContent=cfg.hi; if(cfg.hrs) $('#supHrs').innerHTML='<i class="pulse"></i> '+esc(cfg.hrs);
    $('#supFaq').innerHTML=faq.map(function(f){ return '<details class="sup-q"><summary>'+esc(f.question)+'</summary><p>'+esc(f.answer)+'</p></details>'; }).join('')||'<p class="sup-empty">No articles yet.</p>';
    var digits=(cfg.wa||'').replace(/\D/g,''), L=[];
    if(digits) L.push('<a class="sup-link" target="_blank" rel="noopener" href="https://wa.me/'+digits+'?text='+encodeURIComponent('Hello, I need help with ')+'"><span class="sup-gi" style="color:#25D366">'+GI.whatsapp+'</span><div><b>WhatsApp</b><small>Chat with us</small></div></a>');
    if(cfg.em) L.push('<a class="sup-link" href="mailto:'+esc(cfg.em)+'"><span class="sup-gi">'+GI.mail+'</span><div><b>Email</b><small>'+esc(cfg.em)+'</small></div></a>');
    if(cfg.ph) L.push('<a class="sup-link" href="tel:'+esc(cfg.ph.replace(/[^\d+]/g,''))+'"><span class="sup-gi">'+GI.phone+'</span><div><b>Call</b><small>'+esc(cfg.ph)+'</small></div></a>');
    L.push('<button type="button" class="sup-link" data-act="book"><span class="sup-gi">'+GI.calendar+'</span><div><b>Book a consultation</b><small>Pick a time that suits you</small></div></button>');
    $('#supLinks').innerHTML=L.join('');
  }
  draw();
  function open(o){ p.hidden=!o; btn.setAttribute('aria-expanded',String(o)); btn.classList.toggle('open',o); if(o){ p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); } }
  btn.addEventListener('click',function(){ open(p.hidden); });
  $('.sup-x').addEventListener('click',function(){ open(false); btn.focus(); });
  d.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!p.hidden) open(false); });
  p.addEventListener('click',function(e){
    var t=e.target.closest('[data-st]'); if(t){ $$('[data-st]').forEach(function(x){ x.classList.toggle('on',x===t); }); $$('[data-sp]').forEach(function(s){ s.hidden=s.getAttribute('data-sp')!==t.getAttribute('data-st'); }); }
    if(e.target.closest('[data-act="book"]')){ open(false); if(window.openBooking) window.openBooking(); }
  });
  $('#supQ').addEventListener('input',function(){ var q=this.value.toLowerCase(); $$('.sup-q').forEach(function(x){ x.hidden=q&&x.textContent.toLowerCase().indexOf(q)<0; }); });
  $('#supForm').addEventListener('submit',function(e){
    e.preventDefault(); var f=e.target.elements, m=$('#supMsg'), b=e.target.querySelector('button'); if(f.website.value) return; b.disabled=true; m.textContent='Sending…';
    var rec={name:f.name.value.trim(),email:f.email.value.trim(),subject:'Support request',message:f.message.value.trim(),page:(location.pathname.split('/').pop()||'index.html').slice(0,100)}, jobs=[];
    if(typeof SUPABASE_READY!=='undefined'&&SUPABASE_READY) jobs.push(fetch(SUPABASE_URL+'/rest/v1/support_tickets',{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+SUPABASE_ANON_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(rec)}).then(function(r){ return {ok:r.ok}; }).catch(function(){ return {ok:false}; }));
    if(typeof sendEmail==='function') jobs.push(Promise.resolve(sendEmail({_subject:'Support request from '+rec.name,formType:'Support ticket',name:rec.name,email:rec.email,message:rec.message,page:rec.page})).then(function(r){ return {ok:!!(r&&r.ok)}; }).catch(function(){ return {ok:false}; }));
    Promise.all(jobs).then(function(rs){
      var ok=rs.some(function(r){ return r.ok; });
      if(ok){ e.target.reset(); m.textContent='✓ Thanks! Your message was received. We’ll reply by email.'; }
      else m.innerHTML='We couldn’t send that right now. Please <a href="mailto:'+esc(cfg.em)+'?subject=Support%20request&body='+encodeURIComponent(rec.message)+'">email us instead</a>.';
      b.disabled=false;
    });
  });
  // settings + editable FAQs from the admin panel
  if(typeof fetchRecords==='function'&&typeof SUPABASE_READY!=='undefined'&&SUPABASE_READY){
    fetchRecords('settings','?select=*&key=in.(support_enabled,support_greeting,support_whatsapp,support_email,support_phone,support_hours)').then(function(rows){
      var s={}; rows.forEach(function(r){ s[r.key]=r.value; });
      if(s.support_enabled==='off'){ btn.remove(); p.remove(); return; }
      if(s.support_greeting) cfg.hi=s.support_greeting; if(s.support_whatsapp) cfg.wa=s.support_whatsapp; if(s.support_email) cfg.em=s.support_email; if(s.support_phone) cfg.ph=s.support_phone; if(s.support_hours) cfg.hrs=s.support_hours; draw();
    });
    fetchRecords('faqs','?select=*&published=eq.true&order=sort.asc').then(function(rows){ if(rows.length){ faq=rows; draw(); } });
  }
})();
