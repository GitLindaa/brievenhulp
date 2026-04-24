/* =========================================================
   Brievenhulp — script.js
   Vanilla JS. Geen frameworks, geen build.
   Bevat:
     1. Configuratie (placeholders — vervang door eigen waarden)
     2. Supabase-initialisatie (CDN)
     3. Header / mobiele navigatie
     4. Taalswitcher (NL/EN) met woordenboek
     5. Keuzehulp / calculator
     6. Klantportaal: inloggen, registreren, dashboard
     7. Abonnementskeuze (Mollie-redirect)
     8. Overige helpers
   ========================================================= */


/* ---------- 1. Configuratie (placeholders) ---------- */
/* Vervang deze drie waarden door uw eigen gegevens */
const SUPABASE_URL       = "YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY  = "YOUR_SUPABASE_ANON_KEY_HERE";
const CALENDLY_URL       = "https://calendly.com/lindadebre/20min";

/* Mollie-betaallinks per abonnement en voor een los extra gesprek.
   Vervang door uw eigen Mollie Payment Links. */
const MOLLIE_LINKS = {
  basic:       "https://pay.mollie.com/your-basic-link",
  standard:    "https://pay.mollie.com/your-standard-link",
  premium:     "https://pay.mollie.com/your-premium-link",
  extraCall:   "https://pay.mollie.com/your-extra-call-link"
};


/* ---------- 2. Supabase-initialisatie ---------- */
/* Supabase wordt in index.html via CDN geladen; we initialiseren
   alleen als er geldige placeholders zijn vervangen. Zo blijft de
   site gewoon werken vóórdat u uw eigen keys invult. */
let supabase = null;
(function initSupabase() {
  if (
    typeof window.supabase !== "undefined" &&
    SUPABASE_URL && !SUPABASE_URL.startsWith("YOUR_") &&
    SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith("YOUR_")
  ) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
})();


/* ---------- Wacht tot de HTML klaar is ----------
   Alles hieronder pakt DOM-elementen beet; we draaien het pas
   als de pagina geladen is. Dit voorkomt "doet niks"-problemen
   als het script om wat voor reden dan ook vroeg wordt geladen. */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function initApp() {

/* ---------- 3. Header / mobiele navigatie ---------- */
const header    = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");

/* Sticky-header schaduw bij scrollen */
const onScroll = () => {
  if (window.scrollY > 8) header.classList.add("is-scrolled");
  else header.classList.remove("is-scrolled");
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Mobiele menu open/dicht */
navToggle?.addEventListener("click", () => {
  const open = navToggle.classList.toggle("is-open");
  navMobile.classList.toggle("is-open", open);
  navMobile.setAttribute("aria-hidden", String(!open));
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
});

/* Sluit mobiel menu bij klik op link */
navMobile?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    navToggle.classList.remove("is-open");
    navMobile.classList.remove("is-open");
    navMobile.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});


/* ---------- 4. Taalswitcher (NL/EN) ---------- */
/* Simpel woordenboek. Teksten zonder key blijven in het HTML staan
   (Nederlands is de default). Voeg later meer EN-teksten toe. */
const I18N = {
  nl: {
    // Navigatie
    "nav.help": "Hulp", "nav.services": "Diensten", "nav.calculator": "Keuzehulp",
    "nav.pricing": "Tarieven", "nav.subscriptions": "Abonnementen", "nav.portal": "Klantportaal",
    "nav.cta": "Start",

    // Hero
    "hero.eyebrow": "Persoonlijke brievenhulp",
    "hero.title": "Een Nederlandse brief ontvangen <em>waar u niet uitkomt?</em>",
    "hero.sub": "Wij helpen met het begrijpen, beantwoorden en opstellen van Nederlandse brieven en e-mails — rustig, duidelijk en zonder juridisch jargon.",
    "hero.cta1": "Ik heb hulp nodig",
    "hero.cta2": "Bekijk prijzen",
    "hero.trust1": "Geen juridisch advies",
    "hero.trust2": "Wel duidelijke, professionele hulp",
    "hero.trust3": "Veilig account",
    "hero.trust4": "Persoonlijke ondersteuning",
    "hero.badge": "Reactie meestal binnen 1 werkdag",

    // Situaties
    "sit.eyebrow": "Herkenbare situaties",
    "sit.title": "Waarmee kunnen wij helpen?",
    "sit.sub": "Een greep uit de vragen die we het vaakst krijgen. Herkent u er een? Dan komt u bij ons goed terecht.",
    "sit.1.t": "Brief van de gemeente", "sit.1.d": "Een aanslag, vergunning of aanvraag die onduidelijk is? Wij leggen uit wat er staat en wat u moet doen.",
    "sit.2.t": "Belastingbrief",        "sit.2.d": "Aanslag, toeslag of herinnering? We helpen u de brief te begrijpen en, indien gewenst, te reageren.",
    "sit.3.t": "Werkgever of verhuurder","sit.3.d": "Een formele reactie nodig op een e-mail van uw werkgever, HR of verhuurder? Wij formuleren het helder en netjes.",
    "sit.4.t": "Klachtbrief sturen",     "sit.4.d": "Niet tevreden over een dienst, product of behandeling? We schrijven een nette, zakelijke klacht die serieus wordt genomen.",
    "sit.5.t": "Nederlandse brief beantwoorden","sit.5.d": "U weet wat er moet komen, maar niet hoe. Wij maken een formeel en correct Nederlands antwoord.",
    "sit.6.t": "Hulp voor expats",       "sit.6.d": "Dutch correspondence from the municipality, tax office or landlord — translated, explained and answered in clear terms.",

    // Diensten
    "srv.eyebrow": "Diensten", "srv.title": "Korte, heldere opties",
    "srv.sub": "Kies wat past bij uw vraag. Twijfelt u? Gebruik de keuzehulp hieronder.",
    "srv.1.t": "Brief uitleggen",        "srv.1.d": "U stuurt de brief, wij sturen een heldere uitleg in uw eigen woorden — plus wat er van u verwacht wordt.",
    "srv.2.t": "Brief beantwoorden",     "srv.2.d": "Wij schrijven namens u een passend, zakelijk antwoord in correct Nederlands.",
    "srv.3.t": "Formele brief schrijven","srv.3.d": "Van scratch een nette Nederlandse brief — voor gemeente, werkgever, school of instantie.",
    "srv.4.t": "Klachtbrief of bezwaar", "srv.4.d": "Een zakelijke, feitelijke klacht of bezwaar die serieus genomen wordt. Rustig en helder geformuleerd.",
    "srv.5.t": "Expat-hulp",             "srv.5.d": "English-speaking support for Dutch letters and emails — from the Belastingdienst, gemeente, UWV or your landlord.",
    "srv.6.t": "Complex dossier",        "srv.6.d": "Meerdere brieven, langere correspondentie of een ingewikkelde situatie? Wij pakken het dossier in één keer aan.",
    "srv.note": "Los telefoongesprek van 20 minuten: <strong>€35</strong>. Grote dossiers of langdurige ondersteuning: vanaf <strong>€850</strong>.",

    "common.from": "vanaf",

    // Calculator
    "calc.eyebrow": "Keuzehulp", "calc.title": "Welke hulp past bij u?",
    "calc.sub": "Drie korte vragen — daarna ziet u direct een indicatieve prijs.",
    "calc.step1": "Onderwerp", "calc.step2": "Omvang", "calc.step3": "Telefoon", "calc.step4": "Resultaat",
    "calc.q1": "Waar heeft u hulp bij nodig?",
    "calc.q1.a": "Brief begrijpen", "calc.q1.b": "Brief beantwoorden", "calc.q1.c": "Klachtbrief",
    "calc.q1.d": "Bezwaar", "calc.q1.e": "Expat-hulp", "calc.q1.f": "Complex dossier",
    "calc.q2": "Hoe uitgebreid is uw vraag?",
    "calc.q2.a": "Kort", "calc.q2.a.d": "Eén brief of e-mail",
    "calc.q2.b": "Normaal", "calc.q2.b.d": "Een paar documenten",
    "calc.q2.c": "Complex", "calc.q2.c.d": "Meerdere brieven of lastige inhoud",
    "calc.q3": "Wilt u telefonisch contact?",
    "calc.q3.a": "Ja, graag", "calc.q3.a.d": "Telefoongesprek van 20 minuten (+€35)",
    "calc.q3.b": "Nee, per e-mail is prima", "calc.q3.b.d": "Volledige afhandeling per e-mail",
    "calc.result.eyebrow": "Verwachte prijs",
    "calc.result.desc": "Een indicatieve prijs op basis van uw keuzes. De definitieve prijs stellen we vast na het lezen van uw vraag — altijd eerst met bevestiging.",
    "calc.result.cta1": "Account aanmaken en starten", "calc.result.cta2": "Opnieuw beginnen",
    "calc.back": "Terug",

    // Prijzen
    "price.eyebrow": "Tarieven", "price.title": "Rustige, heldere prijzen",
    "price.sub": "Vaste vanaf-prijzen, zonder verrassingen.",
    "price.1": "Brief uitleggen",
    "price.2": "Formele brief of klacht",
    "price.3": "Complex dossier",
    "price.4": "Grote dossiers / langdurige ondersteuning",
    "price.5": "Los telefoongesprek (20 minuten)",

    // Abonnementen
    "sub.eyebrow": "Abonnementen", "sub.title": "Heeft u vaker hulp nodig?",
    "sub.sub": "Dan zijn onze abonnementen een rustiger keuze. Maandelijks opzegbaar.",
    "sub.popular": "Populair", "sub.permonth": "per maand", "sub.choose": "Kies dit abonnement",
    "sub.basic.t": "Basic",
    "sub.basic.1": "Tot 2 documenten of vragen per maand",
    "sub.basic.2": "Ondersteuning alleen via e-mail",
    "sub.basic.3": "Reactie binnen 3 werkdagen",
    "sub.standard.t": "Standard",
    "sub.standard.1": "Tot 5 documenten of vragen per maand",
    "sub.standard.2": "1 telefoongesprek van 20 minuten per maand",
    "sub.standard.3": "Reactie binnen 2 werkdagen",
    "sub.premium.t": "Premium",
    "sub.premium.1": "Tot 10 documenten of vragen per maand",
    "sub.premium.2": "2 telefoongesprekken van 20 minuten per maand",
    "sub.premium.3": "Snellere service — voorrang in de planning",

    // Hoe het werkt
    "how.eyebrow": "Werkwijze", "how.title": "Hoe het werkt",
    "how.1.t": "Kies een dienst of abonnement", "how.1.d": "Via de keuzehulp of direct op deze pagina.",
    "how.2.t": "Maak een account aan",           "how.2.d": "Veilig met e-mail en wachtwoord. Niets meer dan dat.",
    "how.3.t": "Beschrijf uw vraag",             "how.3.d": "In uw eigen woorden — we stellen gerichte vragen als we meer willen weten.",
    "how.4.t": "Plan eventueel een gesprek",     "how.4.d": "20 minuten telefonisch — soms is dat prettiger dan schrijven.",
    "how.5.t": "Ontvang hulp per e-mail",        "how.5.d": "Een heldere uitleg of een kant-en-klare brief. Altijd persoonlijk.",

    // Portaal
    "portal.eyebrow": "Klantportaal", "portal.title": "Uw eigen rustige omgeving",
    "portal.sub": "Maak een account aan om uw vraag in te dienen, uw abonnementstatus te zien en telefoongesprekken in te plannen. Geen dashboard vol statistieken — alleen wat u nodig heeft.",
    "portal.tab.login": "Inloggen", "portal.tab.signup": "Account aanmaken",
    "portal.form.email": "E-mailadres", "portal.form.password": "Wachtwoord", "portal.form.name": "Naam",
    "portal.form.login": "Inloggen", "portal.form.signup": "Account aanmaken",
    "portal.dash.welcome": "Welkom",
    "portal.dash.status": "Abonnementstatus", "portal.dash.active": "Actief", "portal.dash.inactive": "Niet actief",
    "portal.dash.plan": "Abonnement",
    "portal.dash.calls": "Resterende gesprekken deze maand",
    "portal.dash.book": "Plan uw telefoongesprek",
    "portal.dash.empty": "Uw inbegrepen gesprekken voor deze maand zijn gebruikt.",
    "portal.dash.extra": "Boek een extra gesprek voor €35",
    "portal.dash.logout": "Uitloggen",

    // Disclaimer
    "disc.strong": "Let op:",
    "disc.text": "Wij geven geen juridisch advies en zijn geen advocaat of jurist. Voor juridische stappen verwijzen wij u graag door.",

    // Footer
    "footer.tag": "Rustige, menselijke hulp bij Nederlandse brieven en e-mails.",
    "footer.h.contact": "Contact", "footer.h.services": "Diensten",
    "footer.h.subs": "Abonnementen", "footer.h.legal": "Juridisch",
    "footer.portal": "Klantportaal",
    "footer.l.explain": "Brief uitleggen", "footer.l.reply": "Brief beantwoorden",
    "footer.l.complaint": "Klacht of bezwaar", "footer.l.expat": "Expat-hulp",
    "footer.l.disclaimer": "Disclaimer", "footer.l.privacy": "Privacy", "footer.l.terms": "Algemene voorwaarden"
  },

  en: {
    // Navigation
    "nav.help": "Help", "nav.services": "Services", "nav.calculator": "Guide",
    "nav.pricing": "Pricing", "nav.subscriptions": "Plans", "nav.portal": "Portal",
    "nav.cta": "Start",

    // Hero
    "hero.eyebrow": "Personal letter support",
    "hero.title": "Received a Dutch letter <em>you can't quite figure out?</em>",
    "hero.sub": "We help you understand, reply to and compose Dutch letters and emails — calmly, clearly, and without legal jargon.",
    "hero.cta1": "I need help", "hero.cta2": "See pricing",
    "hero.trust1": "No legal advice",
    "hero.trust2": "Clear, professional support",
    "hero.trust3": "Secure account",
    "hero.trust4": "Personal assistance",
    "hero.badge": "Usually a reply within 1 business day",

    // Situations
    "sit.eyebrow": "Familiar situations",
    "sit.title": "What can we help with?",
    "sit.sub": "A few of the questions we receive most often. Recognise any? Then you've come to the right place.",
    "sit.1.t": "Letter from the gemeente", "sit.1.d": "An unclear assessment, permit or request? We'll explain what it says and what you need to do.",
    "sit.2.t": "Tax letter",                "sit.2.d": "Assessment, allowance or reminder? We help you understand it and, if needed, respond.",
    "sit.3.t": "Employer or landlord",      "sit.3.d": "Need a formal reply to an email from HR, your employer or landlord? We phrase it clearly and politely.",
    "sit.4.t": "File a complaint",          "sit.4.d": "Unhappy with a service or product? We write a calm, factual complaint that gets taken seriously.",
    "sit.5.t": "Reply to a Dutch letter",   "sit.5.d": "You know what you want to say — we make sure it's said in correct, formal Dutch.",
    "sit.6.t": "Expat support",             "sit.6.d": "Dutch correspondence from the municipality, tax office or landlord — translated, explained and answered in clear terms.",

    // Services
    "srv.eyebrow": "Services", "srv.title": "Simple, clear options",
    "srv.sub": "Pick what fits. Not sure? Use the guide below.",
    "srv.1.t": "Explain a letter",       "srv.1.d": "Send us the letter — we send back a clear explanation in your own language, plus what's expected of you.",
    "srv.2.t": "Reply to a letter",      "srv.2.d": "We write a suitable, businesslike reply in correct Dutch on your behalf.",
    "srv.3.t": "Write a formal letter",  "srv.3.d": "A polished Dutch letter from scratch — for the gemeente, an employer, a school or any authority.",
    "srv.4.t": "Complaint or objection", "srv.4.d": "A factual, measured complaint or objection that gets taken seriously.",
    "srv.5.t": "Expat support",          "srv.5.d": "English-speaking support for Dutch letters and emails — from the Belastingdienst, gemeente, UWV or your landlord.",
    "srv.6.t": "Complex case",           "srv.6.d": "Several letters, a longer exchange, or a complicated situation? We'll handle the whole case in one go.",
    "srv.note": "Single 20-minute phone call: <strong>€35</strong>. Large cases or ongoing support: from <strong>€850</strong>.",

    "common.from": "from",

    // Calculator
    "calc.eyebrow": "Guide", "calc.title": "Which option suits you?",
    "calc.sub": "Three short questions — you'll see an indicative price straight after.",
    "calc.step1": "Subject", "calc.step2": "Scope", "calc.step3": "Phone", "calc.step4": "Result",
    "calc.q1": "What do you need help with?",
    "calc.q1.a": "Explain a letter", "calc.q1.b": "Reply to a letter", "calc.q1.c": "Complaint letter",
    "calc.q1.d": "Objection (bezwaar)", "calc.q1.e": "Expat support", "calc.q1.f": "Complex case",
    "calc.q2": "How extensive is your question?",
    "calc.q2.a": "Short", "calc.q2.a.d": "One letter or email",
    "calc.q2.b": "Normal", "calc.q2.b.d": "A few documents",
    "calc.q2.c": "Complex", "calc.q2.c.d": "Several letters or difficult content",
    "calc.q3": "Would you like a phone call?",
    "calc.q3.a": "Yes please", "calc.q3.a.d": "20-minute phone call (+€35)",
    "calc.q3.b": "No, email is fine", "calc.q3.b.d": "Everything handled by email",
    "calc.result.eyebrow": "Expected price",
    "calc.result.desc": "An indicative price based on your choices. We confirm the final price after reading your question — always with your approval first.",
    "calc.result.cta1": "Create an account and start", "calc.result.cta2": "Start over",
    "calc.back": "Back",

    // Pricing
    "price.eyebrow": "Pricing", "price.title": "Calm, transparent rates",
    "price.sub": "Fixed starting prices, no surprises.",
    "price.1": "Explain a letter",
    "price.2": "Formal letter or complaint",
    "price.3": "Complex case",
    "price.4": "Large cases / ongoing support",
    "price.5": "Single phone call (20 minutes)",

    // Subscriptions
    "sub.eyebrow": "Plans", "sub.title": "Need help more often?",
    "sub.sub": "Our plans are the calmer choice. Cancel any time.",
    "sub.popular": "Popular", "sub.permonth": "per month", "sub.choose": "Choose this plan",
    "sub.basic.t": "Basic",
    "sub.basic.1": "Up to 2 documents or questions per month",
    "sub.basic.2": "Email support only",
    "sub.basic.3": "Response within 3 business days",
    "sub.standard.t": "Standard",
    "sub.standard.1": "Up to 5 documents or questions per month",
    "sub.standard.2": "One 20-minute phone call per month",
    "sub.standard.3": "Response within 2 business days",
    "sub.premium.t": "Premium",
    "sub.premium.1": "Up to 10 documents or questions per month",
    "sub.premium.2": "Two 20-minute phone calls per month",
    "sub.premium.3": "Faster service — priority in scheduling",

    // How it works
    "how.eyebrow": "How it works", "how.title": "How it works",
    "how.1.t": "Choose a service or plan", "how.1.d": "Via the guide or directly on this page.",
    "how.2.t": "Create an account",        "how.2.d": "Secure, with email and password. Nothing more.",
    "how.3.t": "Describe your question",   "how.3.d": "In your own words — we'll ask if we need more.",
    "how.4.t": "Book a call if you like",  "how.4.d": "A 20-minute phone call — sometimes easier than writing.",
    "how.5.t": "Receive help by email",    "how.5.d": "A clear explanation or a ready-to-send letter. Always personal.",

    // Portal
    "portal.eyebrow": "Customer portal", "portal.title": "Your own calm space",
    "portal.sub": "Create an account to submit your question, see your subscription status, and book phone calls. No dashboard full of stats — just what you need.",
    "portal.tab.login": "Log in", "portal.tab.signup": "Create account",
    "portal.form.email": "Email address", "portal.form.password": "Password", "portal.form.name": "Name",
    "portal.form.login": "Log in", "portal.form.signup": "Create account",
    "portal.dash.welcome": "Welcome",
    "portal.dash.status": "Subscription status", "portal.dash.active": "Active", "portal.dash.inactive": "Inactive",
    "portal.dash.plan": "Plan",
    "portal.dash.calls": "Remaining calls this month",
    "portal.dash.book": "Book your phone call",
    "portal.dash.empty": "You've used the phone calls included this month.",
    "portal.dash.extra": "Book an extra call for €35",
    "portal.dash.logout": "Log out",

    // Disclaimer
    "disc.strong": "Please note:",
    "disc.text": "We do not provide legal advice and are not lawyers or legal professionals. For legal action, we'll gladly refer you on.",

    // Footer
    "footer.tag": "Calm, human help with Dutch letters and emails.",
    "footer.h.contact": "Contact", "footer.h.services": "Services",
    "footer.h.subs": "Plans", "footer.h.legal": "Legal",
    "footer.portal": "Customer portal",
    "footer.l.explain": "Explain a letter", "footer.l.reply": "Reply to a letter",
    "footer.l.complaint": "Complaint or objection", "footer.l.expat": "Expat support",
    "footer.l.disclaimer": "Disclaimer", "footer.l.privacy": "Privacy", "footer.l.terms": "Terms & conditions"
  }
};

/* Pas de geselecteerde taal toe op de hele pagina */
function applyLanguage(lang) {
  const dict = I18N[lang] || I18N.nl;
  document.documentElement.lang = lang;

  let updated = 0, missing = 0;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
      updated++;
    } else {
      missing++;
    }
  });
  /* Handig tijdens ontwikkeling: toon in console hoeveel er is vertaald */
  console.log(`[i18n] taal → ${lang} · ${updated} elementen vertaald, ${missing} zonder vertaling`);

  /* Markeer actieve knoppen (zowel header als footer) */
  document.querySelectorAll(".lang-btn").forEach(b => {
    const active = b.dataset.lang === lang;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", String(active));
  });

  /* Bewaar voorkeur */
  try { localStorage.setItem("bh_lang", lang); } catch (_) {}
}

/* Click-handler voor alle taalknoppen (header + footer) */
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const newLang = btn.dataset.lang;
    console.log(`[i18n] klik op taalknop → ${newLang}`);
    applyLanguage(newLang);
  });
});

/* Init taal: voorkeur > browser > nl */
(function initLang() {
  let lang = "nl";
  try { lang = localStorage.getItem("bh_lang") || lang; } catch (_) {}
  if (!["nl", "en"].includes(lang)) {
    lang = (navigator.language || "nl").toLowerCase().startsWith("en") ? "en" : "nl";
  }
  applyLanguage(lang);
})();


/* ---------- 5. Keuzehulp / calculator ---------- */
/* Simpele state-machine: drie vragen, daarna resultaat. */
const calcState = {
  step: 1,
  topic: null,     // object: {value, price, labelKey}
  size:  null,     // object: {value, mult}
  phone: null      // object: {value, add}
};

const calcCard       = document.getElementById("calcCard");
const calcStepLabel  = document.getElementById("calcStepLabel");
const calcBack       = document.getElementById("calcBack");
const resultPrice    = document.getElementById("resultPrice");
const calcRestart    = document.getElementById("calcRestart");

/* Toon een specifieke stap */
function showCalcStep(step) {
  calcState.step = step;

  /* Panels */
  calcCard.querySelectorAll(".calc-panel").forEach(p => {
    p.classList.toggle("is-active", Number(p.dataset.panel) === step);
  });

  /* Stappenbalk */
  calcCard.querySelectorAll(".calc-steps li").forEach(li => {
    const s = Number(li.dataset.step);
    li.classList.toggle("is-active", s === step);
    li.classList.toggle("is-done", s < step);
  });

  /* Label + back-button */
  if (step <= 3) {
    calcStepLabel.textContent = String(step);
    calcBack.disabled = step === 1;
    calcBack.style.visibility = "visible";
  } else {
    calcBack.style.visibility = "hidden";
  }
}

/* Keuzeknoppen binnen de calculator */
calcCard.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    const field = btn.dataset.field;

    /* Mark selection visually */
    calcCard
      .querySelectorAll(`.choice[data-field="${field}"]`)
      .forEach(b => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");

    /* Sla op */
    if (field === "topic") {
      calcState.topic = { value: btn.dataset.value, price: Number(btn.dataset.price) };
      setTimeout(() => showCalcStep(2), 220);
    } else if (field === "size") {
      calcState.size = { value: btn.dataset.value, mult: Number(btn.dataset.mult) };
      setTimeout(() => showCalcStep(3), 220);
    } else if (field === "phone") {
      calcState.phone = { value: btn.dataset.value, add: Number(btn.dataset.add) };
      setTimeout(computeResult, 220);
    }
  });
});

/* Terugknop */
calcBack.addEventListener("click", () => {
  if (calcState.step > 1) showCalcStep(calcState.step - 1);
});

/* Opnieuw */
calcRestart.addEventListener("click", () => {
  calcState.topic = calcState.size = calcState.phone = null;
  calcCard.querySelectorAll(".choice.is-selected").forEach(b => b.classList.remove("is-selected"));
  showCalcStep(1);
});

/* Reken het resultaat uit */
function computeResult() {
  const base = calcState.topic?.price ?? 95;
  const mult = calcState.size?.mult   ?? 1;
  const add  = calcState.phone?.add   ?? 0;

  /* Rond af op tientjes voor rustige prijs */
  let total = Math.ceil((base * mult + add) / 5) * 5;
  if (total < 45) total = 45;

  resultPrice.textContent = `€${total}`;
  showCalcStep(4);
}


/* ---------- 6. Klantportaal: auth + dashboard ---------- */
const portalAuth   = document.getElementById("portalAuth");
const portalDash   = document.getElementById("portalDash");
const tabs         = document.querySelectorAll(".tab");
const forms        = document.querySelectorAll(".portal-form");
const dashName     = document.getElementById("dashName");
const dashStatus   = document.getElementById("dashStatus");
const dashPlan     = document.getElementById("dashPlan");
const dashCalls    = document.getElementById("dashCalls");
const dashCta      = document.getElementById("dashCta");
const dashEmpty    = document.getElementById("dashEmpty");
const dashBookCall = document.getElementById("dashBookCall");
const dashExtraCall= document.getElementById("dashExtraCall");
const portalLogout = document.getElementById("portalLogout");

/* Tab-wissel login / registreren */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    forms.forEach(f => f.classList.toggle("is-active", f.dataset.form === tab.dataset.tab));
  });
});

/* Helper: toon bericht in een formulier */
function setMsg(form, text, type = "error") {
  const msg = form.querySelector("[data-msg]");
  if (!msg) return;
  msg.textContent = text;
  msg.classList.remove("is-error", "is-success");
  msg.classList.add(type === "success" ? "is-success" : "is-error");
}

/* Demo-profiel voor wanneer Supabase nog niet is geconfigureerd.
   Zodra u echte keys invult, gebruikt de site automatisch Supabase. */
let demoUser = null;
function loadDemoUser() {
  try { demoUser = JSON.parse(localStorage.getItem("bh_demo_user") || "null"); }
  catch (_) { demoUser = null; }
}
function saveDemoUser() {
  try { localStorage.setItem("bh_demo_user", JSON.stringify(demoUser)); } catch (_) {}
}
loadDemoUser();

/* Dashboard-weergave bijwerken met een profile-object */
function renderDashboard(profile) {
  dashName.textContent    = profile.name || "—";
  dashPlan.textContent    = profile.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "—";
  dashCalls.textContent   = String(profile.callsRemaining ?? 0);

  const lang = document.documentElement.lang || "nl";
  const t = I18N[lang];

  if (profile.active) {
    dashStatus.textContent = t["portal.dash.active"];
    dashStatus.classList.add("pill-ok"); dashStatus.classList.remove("pill-off");
  } else {
    dashStatus.textContent = t["portal.dash.inactive"];
    dashStatus.classList.add("pill-off"); dashStatus.classList.remove("pill-ok");
  }

  /* Toon boek-knop of "gesprekken op" */
  if ((profile.callsRemaining ?? 0) > 0) {
    dashCta.hidden = false;
    dashEmpty.hidden = true;
  } else {
    dashCta.hidden = true;
    dashEmpty.hidden = false;
  }

  portalAuth.hidden = true;
  portalDash.hidden = false;
}

function showAuth() {
  portalAuth.hidden = false;
  portalDash.hidden = true;
}

/* Supabase-gestuurd: haal profiel op voor ingelogde gebruiker */
async function fetchProfile(user) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("name, plan, active, calls_remaining")
    .eq("id", user.id)
    .single();
  if (error) return null;
  return {
    name: data.name,
    plan: data.plan,
    active: !!data.active,
    callsRemaining: data.calls_remaining ?? 0
  };
}

/* Registratieformulier */
document.querySelector('[data-form="signup"]').addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  if (password.length < 8) {
    setMsg(form, "Wachtwoord moet minimaal 8 tekens zijn.");
    return;
  }

  if (supabase) {
    /* Echte Supabase-registratie */
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } }
      });
      if (error) { setMsg(form, error.message); return; }

      /* Maak een profiel-record aan */
      if (data?.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          email,
          plan: null,
          active: false,
          calls_remaining: 0
        });
      }
      setMsg(form, "Account aangemaakt. Controleer uw e-mail om te bevestigen.", "success");
    } catch (err) {
      setMsg(form, "Er ging iets mis. Probeer het later opnieuw.");
    }
    return;
  }

  /* Fallback: demo-modus (localStorage) */
  demoUser = { name, email, plan: "standard", active: true, callsRemaining: 1 };
  saveDemoUser();
  renderDashboard(demoUser);
});

/* Loginformulier */
document.querySelector('[data-form="login"]').addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setMsg(form, "Inloggen mislukt. Controleer uw gegevens."); return; }
      const profile = await fetchProfile(data.user);
      if (profile) renderDashboard(profile);
      else {
        renderDashboard({ name: email, plan: null, active: false, callsRemaining: 0 });
      }
    } catch (err) {
      setMsg(form, "Er ging iets mis. Probeer het later opnieuw.");
    }
    return;
  }

  /* Fallback: demo */
  if (demoUser && demoUser.email === email) {
    renderDashboard(demoUser);
  } else {
    /* Accepteer een demo-login zodat de flow bekeken kan worden */
    demoUser = { name: email.split("@")[0], email, plan: "standard", active: true, callsRemaining: 1 };
    saveDemoUser();
    renderDashboard(demoUser);
  }
});

/* Uitloggen */
portalLogout.addEventListener("click", async () => {
  if (supabase) { try { await supabase.auth.signOut(); } catch (_) {} }
  showAuth();
});

/* Knop: telefoongesprek plannen (Calendly) */
dashBookCall.addEventListener("click", (e) => {
  e.preventDefault();
  if (demoUser && demoUser.callsRemaining > 0) {
    demoUser.callsRemaining -= 1;
    saveDemoUser();
    renderDashboard(demoUser);
  }
  window.open(CALENDLY_URL, "_blank", "noopener");
});

/* Knop: extra gesprek (Mollie) */
dashExtraCall.addEventListener("click", (e) => {
  e.preventDefault();
  window.open(MOLLIE_LINKS.extraCall, "_blank", "noopener");
});

/* Bij pagina-load: kijk of iemand al is ingelogd */
(async function checkSession() {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const profile = await fetchProfile(data.session.user);
        if (profile) renderDashboard(profile);
      }
    } catch (_) { /* stil falen */ }
    return;
  }
  /* Demo: laad opgeslagen demo-gebruiker */
  if (demoUser) renderDashboard(demoUser);
})();


/* ---------- 7. Abonnementskeuze ---------- */
document.querySelectorAll(".sub-card [data-plan]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const plan = btn.dataset.plan;
    const link = MOLLIE_LINKS[plan];

    /* Scroll naar portaal zodat de gebruiker kan inloggen/registreren */
    document.getElementById("portaal").scrollIntoView({ behavior: "smooth", block: "start" });

    /* Open betaallink in nieuw tabblad */
    if (link && !link.includes("your-")) {
      setTimeout(() => window.open(link, "_blank", "noopener"), 600);
    }
  });
});


/* ---------- 8. Overige helpers ---------- */
/* Automatisch het jaartal in de footer */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

} /* ---- einde initApp() ---- */

/* ============================================================
   Supabase-tabellen die u handmatig aanmaakt:

   -- profiles ----------------------------------------------
   create table public.profiles (
     id uuid primary key references auth.users on delete cascade,
     name text,
     email text,
     plan text,                      -- 'basic' | 'standard' | 'premium' | null
     active boolean default false,
     calls_remaining int default 0,
     created_at timestamp with time zone default now()
   );

   -- Row Level Security: gebruiker ziet alleen eigen profiel
   alter table public.profiles enable row level security;
   create policy "own profile" on public.profiles
     for all using (auth.uid() = id) with check (auth.uid() = id);

   ============================================================ */
