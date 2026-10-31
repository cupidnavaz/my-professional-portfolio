// ==========================================================
// BACKEND CONFIGURATION — replace these with your own values
// ==========================================================
// This site has no server of its own, so two free third-party services
// handle the two jobs "wire it up" needs:
//
// 1) FORMSPREE — sends a real email for every submission and gives back
//    a real HTTP response, which is what powers the "message delivered"
//    confirmation. Sign up free at https://formspree.io, create a form,
//    then paste its endpoint below (Settings -> Integration -> your endpoint
//    looks like https://formspree.io/f/abcdwxyz).
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpppjbgo'; // EDIT ME

// 2) SUPABASE — a free hosted database. This is what makes reviews (and
//    every other submission) actually persist for every visitor instead of
//    only the browser that sent them. Sign up free at https://supabase.com,
//    create a project, run the SQL in supabase-setup.sql (included alongside
//    this file) in the Supabase SQL Editor, then copy these two values from
//    Project Settings -> API.
var SUPABASE_URL = 'https://ajdsdckaucivcjeslxuc.supabase.co'; // EDIT ME
var SUPABASE_ANON_KEY = 'sb_publishable_1sFqR3Dk3bhQkeLWgqlj_A_0uELR7mF'; // EDIT ME

var FORMSPREE_READY = FORMSPREE_ENDPOINT.indexOf('YOUR_FORM_ID') === -1;
var SUPABASE_READY = SUPABASE_URL.indexOf('YOUR_PROJECT') === -1 &&
                      SUPABASE_ANON_KEY.indexOf('YOUR_ANON_PUBLIC_KEY') === -1;

// Sends an email via Formspree. Resolves { ok, skipped } — skipped is true
// when FORMSPREE_ENDPOINT hasn't been configured yet, so callers can fall
// back to a mailto: link instead of silently losing the message.
function sendEmail(payload){
  if(!FORMSPREE_READY) return Promise.resolve({ ok:false, skipped:true });
  return fetch(FORMSPREE_ENDPOINT, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
    body: JSON.stringify(payload)
  }).then(function(res){ return { ok: res.ok, skipped:false }; })
    .catch(function(){ return { ok:false, skipped:false }; });
}

// Stores a row in a Supabase table. Resolves { ok, skipped, data }.
function storeRecord(table, record){
  if(!SUPABASE_READY) return Promise.resolve({ ok:false, skipped:true, data:null });
  return fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization':'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer':'return=representation'
    },
    body: JSON.stringify(record)
  }).then(function(res){
    return res.json().catch(function(){ return null; }).then(function(data){
      return { ok:res.ok, skipped:false, data:data };
    });
  }).catch(function(){ return { ok:false, skipped:false, data:null }; });
}

// Reads rows from a Supabase table. Resolves an array (empty on any failure).
function fetchRecords(table, query){
  if(!SUPABASE_READY) return Promise.resolve([]);
  return fetch(SUPABASE_URL + '/rest/v1/' + table + (query || ''), {
    headers:{ 'apikey': SUPABASE_ANON_KEY, 'Authorization':'Bearer ' + SUPABASE_ANON_KEY }
  }).then(function(res){ return res.ok ? res.json() : []; })
    .catch(function(){ return []; });
}

// Builds a mailto: fallback so a message is never silently lost if the
// backend above isn't configured yet (or a request fails).
var RECIPIENT_EMAIL = "info@cupidcreativex.com";
function mailtoFallback(subject, bodyText){
  return 'mailto:' + RECIPIENT_EMAIL + '?subject=' + encodeURIComponent(subject) +
         '&body=' + encodeURIComponent(bodyText);
}

  // ---------- Scroll-reveal via IntersectionObserver ----------
  (function(){
    var targets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    if(!('IntersectionObserver' in window) || targets.length === 0){
      targets.forEach(function(t){ t.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function(t){ io.observe(t); });
  })();

  // ---------- Stat counter ----------
  (function(){
    var statEls = document.querySelectorAll('.stat b');
    if(statEls.length === 0) return;
    var animated = false;
    function run(){
      if(animated) return;
      animated = true;
      statEls.forEach(function(el){
        var raw = el.textContent.trim();
        var match = raw.match(/^(\d+)(.*)$/);
        if(!match) return;
        var target = parseInt(match[1], 10);
        var suffix = match[2];
        var start = 0;
        var duration = 900;
        var startTime = null;
        function step(ts){
          if(!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var value = Math.floor(progress * target);
          el.textContent = value + suffix;
          if(progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
      });
    }
    var statRow = document.querySelector('.stat-row');
    if(statRow && 'IntersectionObserver' in window){
      var io2 = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ run(); io2.disconnect(); }
        });
      }, { threshold: 0.4 });
      io2.observe(statRow);
    } else { run(); }
  })();

  // ---------- Booking modal ----------
  (function(){
    var fab = document.getElementById('bookFab');
    var overlay = document.getElementById('bookOverlay');
    var closeBtn = document.getElementById('bookClose');
    var form = document.getElementById('consultForm');
    var formWrap = document.getElementById('bookForm');
    var successWrap = document.getElementById('bookSuccess');
    var bookAgain = document.getElementById('bookAgain');
    var submitBtn = document.getElementById('bookSubmitBtn');
    var statusEl = document.getElementById('bookStatus');

    function openModal(){
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      var firstField = document.getElementById('bName');
      if(firstField) setTimeout(function(){ firstField.focus(); }, 200);
    }
    function closeModal(){
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    fab.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){
      if(e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('bName').value.trim();
      var email = document.getElementById('bEmail').value.trim();
      var date = document.getElementById('bDate').value;
      var msg = document.getElementById('bMsg').value.trim();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      var subject = 'New consultation request from ' + name;
      var payload = {
        _subject: subject, formType:'Consultation booking',
        name:name, email:email, preferredDateTime:date, message:msg
      };
      var record = { name:name, email:email, preferred_time:date, message:msg };

      Promise.all([
        sendEmail(payload),
        storeRecord('bookings', record)
      ]).then(function(results){
        var emailResult = results[0];
        formWrap.style.display = 'none';
        successWrap.classList.add('show');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request consultation';

        if(emailResult.ok){
          statusEl.textContent = '✓ Delivered — I\'ll get back to you shortly to confirm the time.';
        } else if(emailResult.skipped){
          statusEl.innerHTML = 'Saved locally, but email delivery isn\'t connected yet. ' +
            '<a href="' + mailtoFallback(subject, 'Name: '+name+'\\nEmail: '+email+'\\nPreferred time: '+date+'\\n\\n'+msg) + '" style="color:var(--teal);">Click here to send it by email instead →</a>';
        } else {
          statusEl.innerHTML = 'Couldn\'t confirm delivery. ' +
            '<a href="' + mailtoFallback(subject, 'Name: '+name+'\\nEmail: '+email+'\\nPreferred time: '+date+'\\n\\n'+msg) + '" style="color:var(--teal);">Click here to send it by email instead →</a>';
        }
      });
    });

    bookAgain.addEventListener('click', function(){
      successWrap.classList.remove('show');
      formWrap.style.display = 'block';
      form.reset();
    });
  })();

// ---------- Mobile nav toggle ----------
(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if(!toggle || !links) return;
  toggle.addEventListener('click', function(){
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ links.classList.remove('open'); });
  });
})();

// ---------- Project category filter (projects page) ----------
(function(){
  var filterBtns = document.querySelectorAll('.filter-btn');
  if(filterBtns.length === 0) return;
  var cards = document.querySelectorAll('.project-card');
  var blocks = document.querySelectorAll('.category-block');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.getAttribute('data-filter');
      if(cat === 'all'){
        cards.forEach(function(c){ c.removeAttribute('data-hide'); });
        blocks.forEach(function(b){ b.style.display = ''; });
        return;
      }
      blocks.forEach(function(b){
        var visibleInBlock = 0;
        b.querySelectorAll('.project-card').forEach(function(c){
          if(c.getAttribute('data-cat') === cat){
            c.removeAttribute('data-hide');
            visibleInBlock++;
          } else {
            c.setAttribute('data-hide', 'true');
          }
        });
        b.style.display = visibleInBlock > 0 ? '' : 'none';
      });
    });
  });
})();

// ==========================================================
// PROJECT QUIZ — tailored multi-step service scoping wizard
// ==========================================================
(function(){
  var overlay = document.getElementById('quizOverlay');
  if(!overlay) return; // quiz markup not present on this page

  var modal        = overlay.querySelector('.quiz-modal');
  var closeBtn      = document.getElementById('quizClose');
  var body          = document.getElementById('quizBody');
  var stepLabel     = document.getElementById('quizStepLabel');
  var progressBar   = document.getElementById('quizProgressBar');
  var backBtn       = document.getElementById('quizBack');
  var nextBtn       = document.getElementById('quizNext');
  var titleEl       = document.getElementById('quizTitle');
  var subEl         = document.getElementById('quizSub');
  var footerNav     = document.querySelector('.quiz-nav');
  var successView   = document.getElementById('quizSuccess');

  var TOTAL_STEPS = 5;

  var SERVICE_FEATURES = {
    web:       { label:"Web & App Development", icon:"💻", options:["Responsive Website","E-commerce / Online Store","Custom Web App","Mobile App","API Integration","Website Redesign","CMS (WordPress etc.)"] },
    ai:        { label:"Generative AI Services", icon:"🤖", options:["AI Chatbot / Assistant","Workflow Automation","Content Generation Tool","Custom AI Model Integration"] },
    uiux:      { label:"UI/UX Design", icon:"🎨", options:["Wireframes & Prototypes","User Research","Design System","Usability Testing","Mobile App UI","Website UI"] },
    data:      { label:"Data Analytics & Insights", icon:"📊", options:["Dashboard Design","SQL / Database Reporting","KPI Tracking","Data Pipeline / ETL","Power BI / Looker Setup"] },
    graphics:  { label:"Graphics Design", icon:"🖌️", options:["Logo Design","Brand Style Guide","Social Media Graphics","Marketing Materials / Flyers","Packaging Design"] },
    consult:   { label:"Digital Consultation", icon:"🧭", options:["Tech Stack Audit","Digital Transformation Roadmap","Vendor / Tool Selection","Process Optimization"] },
    marketing: { label:"Digital Marketing", icon:"📣", options:["SEO","Social Media Marketing","Paid Ad Campaigns","Content Strategy","Email Marketing"] }
  };
  var BUDGETS   = ["Under $500","$500 – $2,000","$2,000 – $5,000","$5,000+","Not sure yet"];
  var TIMELINES = ["ASAP","Within 1 month","1–3 months","3+ months","Flexible"];

  var state, step;

  function resetState(){
    state = { services: [], features: {}, budget: null, timeline: null, details: "", name: "", email: "", phone: "" };
    step = 1;
  }
  resetState();

  function esc(str){
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function toggleArrayItem(arr, item){
    var i = arr.indexOf(item);
    if(i === -1) arr.push(item); else arr.splice(i,1);
  }

  // ---------- Step renderers ----------
  function renderStep1(){
    titleEl.textContent = "Which service(s) do you need?";
    subEl.textContent = "Select everything that applies — the next step will tailor feature questions to your picks.";
    var html = '<div class="quiz-option-grid">';
    Object.keys(SERVICE_FEATURES).forEach(function(key){
      var s = SERVICE_FEATURES[key];
      var selected = state.services.indexOf(key) > -1;
      html += '<button type="button" class="quiz-option'+(selected?' selected':'')+'" data-action="toggle-service" data-key="'+key+'">'+
                '<span class="box">'+(selected?'✓':'')+'</span>'+
                '<span class="label-text">'+s.icon+' '+esc(s.label)+'</span>'+
              '</button>';
    });
    html += '</div><p class="quiz-error" id="quizErr">Please select at least one service to continue.</p>';
    body.innerHTML = html;
  }

  function renderStep2(){
    titleEl.textContent = "What features are you after?";
    subEl.textContent = "Optional, but the more detail you give, the more accurate your scoping call will be.";
    if(state.services.length === 0){
      body.innerHTML = '<p style="color:var(--ink-dim); font-size:14px;">No services selected — go back and pick at least one.</p>';
      return;
    }
    var html = '';
    state.services.forEach(function(key){
      var s = SERVICE_FEATURES[key];
      if(!state.features[key]) state.features[key] = [];
      html += '<p class="quiz-group-title">'+s.icon+' '+esc(s.label)+'</p><div class="quiz-option-grid">';
      s.options.forEach(function(opt){
        var selected = state.features[key].indexOf(opt) > -1;
        html += '<button type="button" class="quiz-option'+(selected?' selected':'')+'" data-action="toggle-feature" data-service="'+key+'" data-feature="'+esc(opt)+'">'+
                  '<span class="box">'+(selected?'✓':'')+'</span>'+
                  '<span class="label-text">'+esc(opt)+'</span>'+
                '</button>';
      });
      html += '</div>';
    });
    body.innerHTML = html;
  }

  function renderStep3(){
    titleEl.textContent = "Budget & timeline";
    subEl.textContent = "Rough ranges are fine — this just helps set expectations early.";
    var html = '<p class="quiz-group-title">💰 Estimated budget</p><div class="quiz-option-grid">';
    BUDGETS.forEach(function(b){
      var selected = state.budget === b;
      html += '<button type="button" class="quiz-option radio'+(selected?' selected':'')+'" data-action="select-budget" data-value="'+esc(b)+'">'+
                '<span class="box">'+(selected?'●':'')+'</span><span class="label-text">'+esc(b)+'</span></button>';
    });
    html += '</div><p class="quiz-group-title">⏱️ Ideal timeline</p><div class="quiz-option-grid">';
    TIMELINES.forEach(function(t){
      var selected = state.timeline === t;
      html += '<button type="button" class="quiz-option radio'+(selected?' selected':'')+'" data-action="select-timeline" data-value="'+esc(t)+'">'+
                '<span class="box">'+(selected?'●':'')+'</span><span class="label-text">'+esc(t)+'</span></button>';
    });
    html += '</div><p class="quiz-error" id="quizErr">Please choose both a budget and a timeline.</p>';
    body.innerHTML = html;
  }

  function renderStep4(){
    titleEl.textContent = "Tell me about the project";
    subEl.textContent = "A few lines is plenty — and how to reach you.";
    body.innerHTML =
      '<div class="field"><label for="qDetails">What are you trying to achieve?</label>'+
      '<textarea id="qDetails" placeholder="A quick overview of the project, goals, or problem you\'re solving...">'+esc(state.details)+'</textarea></div>'+
      '<div class="field"><label for="qName">Your name</label><input id="qName" type="text" placeholder="Jordan Lee" value="'+esc(state.name)+'"></div>'+
      '<div class="field"><label for="qEmail">Email address</label><input id="qEmail" type="email" placeholder="jordan@company.com" value="'+esc(state.email)+'"></div>'+
      '<div class="field"><label for="qPhone">Phone (optional)</label><input id="qPhone" type="tel" placeholder="+234 700 000 0000" value="'+esc(state.phone)+'"></div>'+
      '<p class="quiz-error" id="quizErr">Please enter your name and a valid email.</p>';
  }

  function renderStep5(){
    titleEl.textContent = "Review & submit";
    subEl.textContent = "Here's everything that'll be sent over — hit submit when you're ready.";
    var rows = '';
    rows += '<div class="qs-row"><b>Services:</b> '+ (state.services.map(function(k){ return SERVICE_FEATURES[k].label; }).join(', ') || '—') +'</div>';
    state.services.forEach(function(key){
      var f = state.features[key] || [];
      if(f.length){
        rows += '<div class="qs-row"><b>'+esc(SERVICE_FEATURES[key].label)+' features:</b> '+ f.map(esc).join(', ') +'</div>';
      }
    });
    rows += '<div class="qs-row"><b>Budget:</b> '+ esc(state.budget || '—') +'</div>';
    rows += '<div class="qs-row"><b>Timeline:</b> '+ esc(state.timeline || '—') +'</div>';
    rows += '<div class="qs-row"><b>Project details:</b> '+ (esc(state.details) || '—') +'</div>';
    rows += '<div class="qs-row"><b>Name:</b> '+ esc(state.name) +'</div>';
    rows += '<div class="qs-row"><b>Email:</b> '+ esc(state.email) +'</div>';
    if(state.phone) rows += '<div class="qs-row"><b>Phone:</b> '+ esc(state.phone) +'</div>';
    body.innerHTML = '<div class="quiz-summary">'+rows+'</div>'+
      '<p class="form-note" style="margin-top:14px;">Hitting submit opens your email app with this summary pre-filled, addressed to me — just hit send.</p>';
  }

  var renderers = { 1:renderStep1, 2:renderStep2, 3:renderStep3, 4:renderStep4, 5:renderStep5 };

  function render(){
    body.classList.remove('quiz-fade');
    void body.offsetWidth; // restart animation
    body.classList.add('quiz-fade');
    renderers[step]();
    stepLabel.textContent = 'Step ' + step + ' of ' + TOTAL_STEPS;
    progressBar.style.width = (step / TOTAL_STEPS * 100) + '%';
    backBtn.style.display = step === 1 ? 'none' : 'inline-flex';
    nextBtn.textContent = step === TOTAL_STEPS ? 'Submit inquiry' : 'Next →';
    hideError();
  }

  function hideError(){
    var err = document.getElementById('quizErr');
    if(err) err.classList.remove('show');
  }
  function showError(msg){
    var err = document.getElementById('quizErr');
    if(err){ if(msg) err.textContent = msg; err.classList.add('show'); }
  }

  // ---------- Interaction (event delegation on body) ----------
  body.addEventListener('click', function(e){
    var el = e.target.closest('[data-action]');
    if(!el) return;
    var action = el.getAttribute('data-action');
    if(action === 'toggle-service'){
      toggleArrayItem(state.services, el.getAttribute('data-key'));
      renderStep1();
    } else if(action === 'toggle-feature'){
      var svc = el.getAttribute('data-service');
      if(!state.features[svc]) state.features[svc] = [];
      toggleArrayItem(state.features[svc], el.getAttribute('data-feature'));
      renderStep2();
    } else if(action === 'select-budget'){
      state.budget = el.getAttribute('data-value');
      renderStep3();
    } else if(action === 'select-timeline'){
      state.timeline = el.getAttribute('data-value');
      renderStep3();
    }
  });

  function syncStep4Fields(){
    var d = document.getElementById('qDetails');
    var n = document.getElementById('qName');
    var em = document.getElementById('qEmail');
    var p = document.getElementById('qPhone');
    if(d) state.details = d.value.trim();
    if(n) state.name = n.value.trim();
    if(em) state.email = em.value.trim();
    if(p) state.phone = p.value.trim();
  }

  function validateCurrentStep(){
    if(step === 1){
      if(state.services.length === 0){ showError(); return false; }
    }
    if(step === 3){
      if(!state.budget || !state.timeline){ showError(); return false; }
    }
    if(step === 4){
      syncStep4Fields();
      var emailOk = /^\S+@\S+\.\S+$/.test(state.email);
      if(!state.name || !emailOk){ showError(); return false; }
    }
    return true;
  }

  function buildMailBody(){
    var lines = [];
    lines.push('New project inquiry from the website quiz');
    lines.push('');
    lines.push('Name: ' + state.name);
    lines.push('Email: ' + state.email);
    if(state.phone) lines.push('Phone: ' + state.phone);
    lines.push('');
    lines.push('Services requested:');
    state.services.forEach(function(k){ lines.push('- ' + SERVICE_FEATURES[k].label); });
    lines.push('');
    state.services.forEach(function(k){
      var f = state.features[k] || [];
      if(f.length){
        lines.push(SERVICE_FEATURES[k].label + ' features:');
        f.forEach(function(item){ lines.push('  - ' + item); });
      }
    });
    lines.push('');
    lines.push('Budget: ' + (state.budget || 'Not specified'));
    lines.push('Timeline: ' + (state.timeline || 'Not specified'));
    lines.push('');
    lines.push('Project details:');
    lines.push(state.details || '(none provided)');
    return lines.join('\n');
  }

  function submitQuiz(){
    var subject = 'New Project Inquiry — ' + state.name;
    var statusEl = document.getElementById('quizStatus');

    nextBtn.disabled = true;
    nextBtn.textContent = 'Sending…';

    var payload = {
      _subject: subject, formType:'Project quiz',
      name: state.name, email: state.email, phone: state.phone,
      services: state.services.join(', '),
      budget: state.budget, timeline: state.timeline,
      details: state.details,
      body: buildMailBody()
    };
    var record = {
      name: state.name, email: state.email, phone: state.phone,
      services: state.services, features: state.features,
      budget: state.budget, timeline: state.timeline, details: state.details
    };

    Promise.all([
      sendEmail(payload),
      storeRecord('quiz_leads', record)
    ]).then(function(results){
      var emailResult = results[0];

      footerNav.style.display = 'none';
      body.style.display = 'none';
      document.getElementById('quizStepLabel').style.display = 'none';
      document.querySelector('.quiz-progress').style.display = 'none';
      subEl.style.display = 'none';
      titleEl.style.display = 'none';
      successView.classList.add('show');
      nextBtn.disabled = false;
      nextBtn.textContent = 'Next →';

      var mailto = mailtoFallback(subject, buildMailBody());
      if(emailResult.ok){
        statusEl.textContent = '✓ Delivered — I\'ll follow up by email shortly.';
      } else if(emailResult.skipped){
        statusEl.innerHTML = 'Saved locally, but email delivery isn\'t connected yet. ' +
          '<a href="' + mailto + '" style="color:var(--teal);">Click here to send it by email instead →</a>';
      } else {
        statusEl.innerHTML = 'Couldn\'t confirm delivery. ' +
          '<a href="' + mailto + '" style="color:var(--teal);">Click here to send it by email instead →</a>';
      }
    });
  }

  // ---------- Nav buttons ----------
  nextBtn.addEventListener('click', function(){
    if(!validateCurrentStep()) return;
    if(step === TOTAL_STEPS){ submitQuiz(); return; }
    step++;
    render();
  });
  backBtn.addEventListener('click', function(){
    if(step > 1){ step--; render(); }
  });

  // ---------- Open / close ----------
  function openQuiz(){
    resetState();
    footerNav.style.display = 'flex';
    body.style.display = 'block';
    stepLabel.style.display = 'block';
    document.querySelector('.quiz-progress').style.display = 'block';
    subEl.style.display = 'block';
    titleEl.style.display = 'block';
    successView.classList.remove('show');
    render();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeQuiz(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-quiz]').forEach(function(btn){
    btn.addEventListener('click', openQuiz);
  });
  closeBtn.addEventListener('click', closeQuiz);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeQuiz(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('open')) closeQuiz();
  });

  // ---------- Success screen follow-up ----------
  var moreYes = document.getElementById('quizMoreYes');
  var moreNo  = document.getElementById('quizMoreNo');
  if(moreYes){
    moreYes.addEventListener('click', function(){
      closeQuiz();
      var fab = document.getElementById('bookFab');
      if(fab) setTimeout(function(){ fab.click(); }, 300);
    });
  }
  if(moreNo){
    moreNo.addEventListener('click', closeQuiz);
  }
})();

// ==========================================================
// PROJECT DETAIL MODAL — full case study viewer with carousel
// ==========================================================
(function(){
  var overlay = document.getElementById('projectOverlay');
  if(!overlay) return; // modal markup not present on this page

  var modal      = overlay.querySelector('.project-modal');
  var closeBtn   = document.getElementById('projectClose');
  var slidesWrap = document.getElementById('projSlides');
  var dotsWrap   = document.getElementById('projDots');
  var prevBtn    = document.getElementById('projPrev');
  var nextBtn    = document.getElementById('projNext');

  var tagEl      = document.getElementById('projTag');
  var titleEl    = document.getElementById('projTitle');
  var clientEl   = document.getElementById('projClient');
  var durationEl = document.getElementById('projDuration');
  var overviewEl = document.getElementById('projOverview');
  var requestEl  = document.getElementById('projRequest');
  var challengeEl= document.getElementById('projChallenge');
  var solutionEl = document.getElementById('projSolution');
  var resultsEl  = document.getElementById('projResults');
  var toolsEl    = document.getElementById('projTools');
  var ctaBtn     = document.getElementById('projCTA');

  var THUMB_CLASSES = ['thumb-1','thumb-2','thumb-3'];

  var PROJECTS_DATA = {
    'northstar-dashboard': {
      tag:'Data Analytics', title:'Northstar Sales Dashboard',
      client:'Northstar Distribution (40-person sales team)', duration:'6 weeks',
      overview:'A Power BI + SQL reporting layer that replaced five conflicting spreadsheets with one trusted, role-based dashboard.',
      request:"Leadership wanted a single source of truth for weekly sales numbers instead of five spreadsheets that never quite agreed with each other.",
      challenge:"Sales data lived across three disconnected systems with no consistent definition of a \u2018closed deal,\u2019 so every report told a different story.",
      solution:"Built a SQL data warehouse layer to normalize the three sources, then designed a Power BI dashboard with role-based views for reps, managers, and leadership.",
      results:"Weekly reporting time dropped from a full day to under two hours, and the sales team now works from one trusted number instead of five.",
      tools:['Power BI','SQL Server','Python (ETL)','DAX'],
      images:[{icon:'\ud83d\udcca', cap:'Executive summary view'},{icon:'\ud83d\udcc8', cap:'Rep-level drill-down'},{icon:'\ud83d\udcf1', cap:'Mobile dashboard view'}]
    },
    'fieldnote-analytics': {
      tag:'Data Analytics', title:'Fieldnote Ops Analytics',
      client:'Fieldnote Field Services', duration:'5 weeks',
      overview:'A real-time operations dashboard that surfaced crew bottlenecks the same day instead of a week later.',
      request:"Ops managers wanted to see crew utilization and job bottlenecks in real time instead of finding out about problems a week later.",
      challenge:"Field data was logged on paper and entered into spreadsheets days after each job, so problems surfaced far too late to act on.",
      solution:"Introduced a lightweight digital intake form feeding a live ops dashboard with utilization, delay, and completion-rate tracking.",
      results:"Bottlenecks are now caught same-day instead of a week later, and average job turnaround improved by 18%.",
      tools:['Looker Studio','Google Sheets API','Zapier'],
      images:[{icon:'\ud83e\udd67', cap:'Live utilization view'},{icon:'\u23f1\ufe0f', cap:'Delay tracking panel'},{icon:'\u2705', cap:'Completion-rate summary'}]
    },
    'loomwell-storefront': {
      tag:'Web Development', title:'Loomwell Storefront Rebuild',
      client:'Loomwell (DTC home goods brand)', duration:'8 weeks',
      overview:'A headless storefront migration that made the site fast and let the marketing team edit it without a developer.',
      request:"Replace a slow, template-locked storefront with something fast, and something the marketing team could update themselves.",
      challenge:"The old site took six-plus seconds to load on mobile, and every content change required a developer to ship it.",
      solution:"Rebuilt on a headless commerce stack with a visual page builder for the marketing team and an aggressive performance budget baked into every template.",
      results:"Mobile load time dropped to under 2 seconds and conversion rate rose 34% in the first full month post-launch.",
      tools:['Next.js','Shopify Headless','Tailwind CSS','Vercel'],
      images:[{icon:'\ud83d\uded2', cap:'Homepage redesign'},{icon:'\u26a1', cap:'Performance before/after'},{icon:'\ud83d\udcf1', cap:'Mobile checkout flow'}]
    },
    'harborline-app': {
      tag:'App Development', title:'Harborline Booking App',
      client:'Harborline Marina Services', duration:'10 weeks',
      overview:'A cross-platform booking app that replaced three disconnected spreadsheets with one live, shared calendar.',
      request:"Replace three separate booking spreadsheets with one system that both staff and customers could use.",
      challenge:"Double-bookings were common because staff worked from different spreadsheets that were never kept in sync.",
      solution:"Built a cross-platform booking app with a shared live calendar, automated conflict checks, and customer self-service booking.",
      results:"Double-bookings dropped to zero within the first three months, and staff save roughly 6 hours a week on manual coordination.",
      tools:['React Native','Firebase','Stripe'],
      images:[{icon:'\ud83d\udcc5', cap:'Shared calendar view'},{icon:'\u26f5', cap:'Customer booking flow'},{icon:'\ud83d\udd14', cap:'Conflict alert screen'}]
    },
    'nimbus-app-ux': {
      tag:'UI/UX Design', title:'Nimbus Mobile App UX',
      client:'Nimbus (seed-stage fintech app)', duration:'4 weeks',
      overview:'An onboarding-flow redesign, backed by user testing, that nearly halved first-week drop-off.',
      request:"First-week user drop-off was high and the founders couldn\u2019t pinpoint exactly where people were getting stuck.",
      challenge:"The onboarding flow asked for too much information too early, before users had seen any real value from the app.",
      solution:"Ran a short round of user testing, then redesigned onboarding to defer non-essential steps and front-load a quick, tangible win.",
      results:"First-week drop-off fell by nearly half after the redesigned flow shipped.",
      tools:['Figma','Maze (user testing)','FigJam'],
      images:[{icon:'\ud83d\udcf2', cap:'Original onboarding flow'},{icon:'\ud83e\uddea', cap:'Usability test session'},{icon:'\u2728', cap:'Redesigned flow'}]
    },
    'vantage-dashboard-ux': {
      tag:'UI/UX Design', title:'Vantage Dashboard UX',
      client:'Vantage Analytics (internal data team)', duration:'3 weeks',
      overview:'A wireframe-to-prototype redesign that made a years-old internal dashboard usable without training.',
      request:"The data team\u2019s internal dashboard had grown organically for years and nobody outside the team could use it without training.",
      challenge:"Years of ad-hoc additions meant no consistent layout, unclear hierarchy, and duplicate charts nobody fully trusted.",
      solution:"Ran quick stakeholder interviews, then wireframed and prototyped a simplified layout organized around the three decisions the dashboard actually needed to support.",
      results:"New starters can now use the dashboard without training, and two duplicate reporting tools were retired.",
      tools:['Figma','Miro'],
      images:[{icon:'\ud83d\udcdd', cap:'Stakeholder interview notes'},{icon:'\ud83e\uddf1', cap:'Low-fi wireframes'},{icon:'\ud83c\udfaf', cap:'Final prototype'}]
    },
    'aperture-brand-system': {
      tag:'Branding & UI', title:'Aperture Brand System',
      client:'Aperture (early-stage SaaS startup)', duration:'5 weeks',
      overview:'A full visual identity and component library built ahead of a seed fundraising round.',
      request:"Founders needed a professional brand identity ahead of a seed fundraising round.",
      challenge:"The existing logo was a placeholder from a freelancer marketplace with no supporting system \u2014 no defined colors, type, or usage rules.",
      solution:"Designed a full identity system: logo, color palette, typography, and a component library so the brand stayed consistent across the product and marketing site.",
      results:"The founders reported the new identity was referenced positively by two investors during fundraising conversations.",
      tools:['Illustrator','Figma','Brand guidelines doc'],
      images:[{icon:'\ud83c\udfa8', cap:'Logo exploration'},{icon:'\ud83c\udfa8', cap:'Color & type system'},{icon:'\ud83e\uddf1', cap:'Component library'}]
    },
    'orbitmark-identity': {
      tag:'Branding & Graphics', title:'Orbitmark Logo & Identity',
      client:'Orbitmark (pre-launch startup)', duration:'3 weeks',
      overview:'A logo, type system, and color palette delivered on a fixed, non-negotiable launch deadline.',
      request:"Needed a full visual identity built fast, ahead of a product launch event with a fixed date.",
      challenge:"The launch date was fixed and non-negotiable, leaving very little room for design revisions.",
      solution:"Ran a compressed identity sprint \u2014 logo concepts, palette, and type system finalized and delivered inside three weeks.",
      results:"Identity was ready two days ahead of the launch event with zero late-stage revisions needed.",
      tools:['Illustrator','Figma'],
      images:[{icon:'\ud83d\udd35', cap:'Logo concepts'},{icon:'\ud83c\udfa8', cap:'Color palette'},{icon:'\ud83d\udcc4', cap:'Brand guide spread'}]
    }
  };

  var current = null; // slug
  var slideIndex = 0;

  function renderSlides(images){
    slidesWrap.innerHTML = '';
    dotsWrap.innerHTML = '';
    images.forEach(function(img, i){
      var slide = document.createElement('div');
      slide.className = 'proj-slide ' + THUMB_CLASSES[i % THUMB_CLASSES.length] + (i === 0 ? ' active' : '');
      slide.innerHTML = '<span class="proj-icon">'+img.icon+'</span><span class="proj-cap">'+img.cap+'</span>';
      slidesWrap.appendChild(slide);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'proj-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('data-index', i);
      dotsWrap.appendChild(dot);
    });
  }

  function goToSlide(i){
    var slides = slidesWrap.querySelectorAll('.proj-slide');
    var dots = dotsWrap.querySelectorAll('.proj-dot');
    if(slides.length === 0) return;
    slideIndex = (i + slides.length) % slides.length;
    slides.forEach(function(s, idx){ s.classList.toggle('active', idx === slideIndex); });
    dots.forEach(function(d, idx){ d.classList.toggle('active', idx === slideIndex); });
  }

  function openProject(slug){
    var data = PROJECTS_DATA[slug];
    if(!data) return;
    current = slug;
    slideIndex = 0;

    tagEl.textContent = data.tag;
    titleEl.textContent = data.title;
    clientEl.textContent = data.client;
    durationEl.textContent = data.duration;
    overviewEl.textContent = data.overview;
    requestEl.textContent = data.request;
    challengeEl.textContent = data.challenge;
    solutionEl.textContent = data.solution;
    resultsEl.textContent = data.results;

    toolsEl.innerHTML = '';
    data.tools.forEach(function(t){
      var span = document.createElement('span');
      span.textContent = t;
      toolsEl.appendChild(span);
    });

    renderSlides(data.images);

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProject(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Trigger from any element with data-open-project (reads slug from closest .project-card id)
  document.querySelectorAll('[data-open-project]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      var card = el.closest('.project-card');
      var slug = card ? card.id : null;
      if(slug) openProject(slug);
    });
  });

  prevBtn.addEventListener('click', function(){ goToSlide(slideIndex - 1); });
  nextBtn.addEventListener('click', function(){ goToSlide(slideIndex + 1); });
  dotsWrap.addEventListener('click', function(e){
    var dot = e.target.closest('.proj-dot');
    if(dot) goToSlide(parseInt(dot.getAttribute('data-index'), 10));
  });

  closeBtn.addEventListener('click', closeProject);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeProject(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('open')) closeProject();
    if(overlay.classList.contains('open')){
      if(e.key === 'ArrowRight') goToSlide(slideIndex + 1);
      if(e.key === 'ArrowLeft') goToSlide(slideIndex - 1);
    }
  });
  if(ctaBtn){
    ctaBtn.addEventListener('click', closeProject);
  }
})();

// ==========================================================
// BIO CARD MODAL — full profile overview
// ==========================================================
(function(){
  var overlay = document.getElementById('bioOverlay');
  if(!overlay) return; // bio modal markup not present on this page

  var closeBtn = document.getElementById('bioClose');
  var bookBtn  = document.getElementById('bioBookBtn');

  function openBio(){
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeBio(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-bio]').forEach(function(btn){
    btn.addEventListener('click', openBio);
  });
  closeBtn.addEventListener('click', closeBio);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeBio(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('open')) closeBio();
  });

  if(bookBtn){
    bookBtn.addEventListener('click', function(){
      closeBio();
      var fab = document.getElementById('bookFab');
      if(fab) setTimeout(function(){ fab.click(); }, 300);
    });
  }
})();

// ==========================================================
// RATE US & TESTIMONIAL — interactive stars + mailto submission
// ==========================================================
(function(){
  var starsWrap = document.getElementById('rateStars');
  var form = document.getElementById('rateForm');
  if(!starsWrap || !form) return;

  var stars = starsWrap.querySelectorAll('.rate-star');
  var hint = document.getElementById('rateHint');
  var success = document.getElementById('rateSuccess');
  var selected = 0;

  function paint(value){
    stars.forEach(function(s){
      var v = parseInt(s.getAttribute('data-value'), 10);
      s.classList.toggle('filled', v <= value);
    });
  }

  stars.forEach(function(s){
    s.addEventListener('mouseenter', function(){
      paint(parseInt(s.getAttribute('data-value'), 10));
    });
    s.addEventListener('click', function(){
      selected = parseInt(s.getAttribute('data-value'), 10);
      paint(selected);
      hint.style.color = '';
      hint.textContent = selected + ' out of 5 stars selected.';
    });
  });
  starsWrap.addEventListener('mouseleave', function(){ paint(selected); });

  var submitBtn = form.querySelector('button[type="submit"]');
  var statusEl = document.getElementById('rateStatus');

  form.addEventListener('submit', function(e){
    e.preventDefault();

    if(selected === 0){
      hint.textContent = 'Please select a star rating before submitting.';
      hint.style.color = 'var(--magenta)';
      return;
    }

    var name = document.getElementById('rateName').value.trim();
    var role = document.getElementById('rateRole').value.trim();
    var msg  = document.getElementById('rateMsg').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    var subject = 'New ' + selected + '-star review from ' + name;
    var mailBody = 'Rating: ' + selected + '/5\nName: ' + name + '\nRole/Company: ' + (role || 'Not provided') + '\n\nTestimonial:\n' + msg;
    var payload = {
      _subject: subject, formType:'Review',
      name:name, role:role, rating:selected, message:msg
    };
    var record = { name:name, role:role, rating:selected, message:msg };

    Promise.all([
      sendEmail(payload),
      storeRecord('reviews', record)
    ]).then(function(results){
      var emailResult = results[0];

      // Optimistically show the new review at the top of the testimonials grid (persists for
      // everyone once Supabase is configured; otherwise this is local to this browser session)
      var grid = document.querySelector('.testi-grid');
      if(grid){
        var initials = name.split(' ').filter(Boolean).map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase() || '★';
        var card = document.createElement('div');
        card.className = 'testi-card';
        var safeMsg = msg.replace(/</g,'&lt;').replace(/>/g,'&gt;');
        var safeName = name.replace(/</g,'&lt;').replace(/>/g,'&gt;');
        var safeRole = (role || 'Client').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        var starsHtml = '<span class="filled">' + '★'.repeat(selected) + '</span>' +
                        (selected < 5 ? '<span class="empty">' + '★'.repeat(5 - selected) + '</span>' : '');
        card.innerHTML =
          '<div class="testi-stars">' + starsHtml + '</div>' +
          '<span class="quote-mark">"</span>' +
          '<p class="quote">' + safeMsg + '</p>' +
          '<div class="testi-person">' +
            '<div class="testi-avatar">' + initials + '</div>' +
            '<div><b>' + safeName + '</b><span>' + safeRole + '</span></div>' +
          '</div>';
        grid.insertBefore(card, grid.firstChild);
      }

      form.style.display = 'none';
      success.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit review';

      var mailto = 'mailto:info@cupidcreativex.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(mailBody);
      if(emailResult.ok){
        statusEl.textContent = '✓ Delivered — your review means a lot!';
      } else if(emailResult.skipped){
        statusEl.innerHTML = 'Shown above, but email delivery isn\'t connected yet. ' +
          '<a href="' + mailto + '" style="color:var(--teal);">Click here to send it by email instead →</a>';
      } else {
        statusEl.innerHTML = 'Shown above, but delivery couldn\'t be confirmed. ' +
          '<a href="' + mailto + '" style="color:var(--teal);">Click here to send it by email instead →</a>';
      }
    });
  });
})();

// ==========================================================
// LOAD PERSISTED REVIEWS — pulls stored reviews from Supabase so every
// visitor sees them, not just the browser that submitted them.
// ==========================================================
(function(){
  var grid = document.querySelector('.testi-grid');
  if(!grid || !SUPABASE_READY) return;

  fetchRecords('reviews', '?select=*&order=created_at.desc&limit=20').then(function(reviews){
    if(!reviews || reviews.length === 0) return;
    reviews.forEach(function(r){
      var rating = parseInt(r.rating, 10) || 5;
      var initials = (r.name || '').split(' ').filter(Boolean).map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase() || '★';
      var card = document.createElement('div');
      card.className = 'testi-card';
      var safeMsg = (r.message || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      var safeName = (r.name || 'Anonymous').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      var safeRole = (r.role || 'Client').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      var starsHtml = '<span class="filled">' + '★'.repeat(rating) + '</span>' +
                      (rating < 5 ? '<span class="empty">' + '★'.repeat(5 - rating) + '</span>' : '');
      card.innerHTML =
        '<div class="testi-stars">' + starsHtml + '</div>' +
        '<span class="quote-mark">"</span>' +
        '<p class="quote">' + safeMsg + '</p>' +
        '<div class="testi-person">' +
          '<div class="testi-avatar">' + initials + '</div>' +
          '<div><b>' + safeName + '</b><span>' + safeRole + '</span></div>' +
        '</div>';
      grid.insertBefore(card, grid.firstChild);
    });
  });
})();

// ==========================================================
// CONTACT FORM — sends via Formspree, stores in Supabase, real feedback
// ==========================================================
(function(){
  var form = document.getElementById('contactForm');
  if(!form) return;

  var submitBtn = document.getElementById('contactSubmitBtn');
  var statusEl = document.getElementById('contactStatus');

  form.addEventListener('submit', function(e){
    e.preventDefault();

    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var msg = document.getElementById('message').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    var subject = 'New message from ' + name + ' (site contact form)';
    var payload = { _subject: subject, formType:'Contact form', name:name, email:email, message:msg };
    var record = { name:name, email:email, message:msg };

    Promise.all([
      sendEmail(payload),
      storeRecord('contact_messages', record)
    ]).then(function(results){
      var emailResult = results[0];
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';

      var mailto = mailtoFallback(subject, 'Name: '+name+'\nEmail: '+email+'\n\n'+msg);
      if(emailResult.ok){
        statusEl.textContent = '✓ Delivered — thanks, I\'ll reply soon!';
        statusEl.style.color = 'var(--teal)';
        form.reset();
      } else if(emailResult.skipped){
        statusEl.innerHTML = 'Email delivery isn\'t connected yet. ' +
          '<a href="' + mailto + '" style="color:var(--teal);">Click here to send it by email instead →</a>';
      } else {
        statusEl.innerHTML = 'Couldn\'t confirm delivery. ' +
          '<a href="' + mailto + '" style="color:var(--teal);">Click here to send it by email instead →</a>';
      }
    });
  });
})();
