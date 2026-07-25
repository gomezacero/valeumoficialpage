/* ============================================================
   VALEUM — INTERACCIONES DE UI
   Nav, menú móvil, anclas, reveals, contadores, odómetros,
   storytelling sticky, FAQ, marquee, parallax y botones magnéticos.
   ============================================================ */
import { $, $$, isTouch, reduceMotion } from "./dom";

/* --- Nav: compactar al hacer scroll --- */
function initNav(): void {
  const nav = $("#nav");
  if (!nav) return;
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.classList.toggle("scrolled", window.scrollY > 24);
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* --- Menú móvil --- */
function initMobileMenu(): void {
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");
  if (!burger || !mobileMenu) return;

  const toggleMenu = (force?: boolean): void => {
    const open = typeof force === "boolean" ? force : !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger.addEventListener("click", () => toggleMenu());
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
}

/* --- Anclas internas: scroll garantizado (funciona incluso en previews embebidos) --- */
function initAnchors(): void {
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  });
}

/* --- Reveals on scroll --- */
function initReveals(): void {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("inview");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".rv,.b-ui,.hero-mock").forEach((el) => io.observe(el));
}

/* --- Contadores del mockup del hero --- */
function animateCount(el: HTMLElement): void {
  const target = parseFloat(el.dataset.count || "0");
  const dec = parseInt(el.dataset.decimals || "0", 10);
  const pre = el.dataset.prefix || "";
  const suf = el.dataset.suffix || "";
  const sep = el.dataset.sep || "";
  const fmt = (v: number): string => {
    let s = v.toFixed(dec);
    if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return pre + s + suf;
  };
  if (reduceMotion) {
    el.textContent = fmt(target);
    return;
  }
  const dur = 1500;
  const t0 = performance.now();
  (function frame(now: number) {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * eased);
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}

function initHeroCounters(): HTMLElement | null {
  const heroMock = $("#heroMock");
  if (!heroMock) return null;
  const ioCount = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          $$("[data-count]", heroMock).forEach(animateCount);
          ioCount.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  ioCount.observe(heroMock);
  return heroMock;
}

/* --- Odómetros de la franja de stats --- */
function buildOdometer(el: HTMLElement): void {
  const target = parseFloat(el.dataset.odo || "0");
  const pre = el.dataset.prefix || "";
  const suf = el.dataset.suffix || "";
  const sep = el.dataset.sep || "";
  let numStr = String(target);
  if (sep) numStr = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const full = pre + numStr + suf;
  if (reduceMotion) {
    el.textContent = full;
    return;
  }
  el.textContent = "";
  el.setAttribute("aria-label", full);
  let reelIndex = 0;
  for (const ch of full) {
    if (/\d/.test(ch)) {
      const reel = document.createElement("span");
      reel.className = "reel";
      reel.setAttribute("aria-hidden", "true");
      const strip = document.createElement("span");
      strip.className = "reel-strip";
      for (let d = 0; d <= 9; d++) {
        const s = document.createElement("span");
        s.textContent = String(d);
        strip.appendChild(s);
      }
      strip.style.transitionDelay = reelIndex * 0.09 + "s";
      reel.appendChild(strip);
      el.appendChild(reel);
      const digit = parseInt(ch, 10);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          strip.style.transform = "translateY(-" + digit + "em)";
        })
      );
      reelIndex++;
    } else {
      const s = document.createElement("span");
      s.textContent = ch;
      s.setAttribute("aria-hidden", "true");
      el.appendChild(s);
    }
  }
}

function initStats(): void {
  const statsSec = $("#statsGrid");
  if (!statsSec) return;
  const ioStats = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          $$("[data-odo]", statsSec).forEach(buildOdometer);
          ioStats.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );
  ioStats.observe(statsSec);
}

/* --- Storytelling sticky 01/02/03 (Marketing Performance) --- */
function initStickyStory(): void {
  const mpSteps = $$(".mp-step");
  if (!mpSteps.length) return;
  const setActive = (idx: number): void => {
    mpSteps.forEach((s) => s.classList.toggle("active", parseInt(s.dataset.step || "0", 10) === idx));
    $$(".mp-kpi").forEach((k) => k.classList.toggle("lit", parseInt(k.dataset.step || "0", 10) === idx));
  };
  const ioMp = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) setActive(parseInt((e.target as HTMLElement).dataset.step || "0", 10));
      });
    },
    { rootMargin: "-38% 0px -48% 0px", threshold: 0 }
  );
  mpSteps.forEach((s) => ioMp.observe(s));
  setActive(0);
}

/* --- FAQ acordeón --- */
function initFaq(): void {
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-q", item);
    const a = $(".faq-a", item);
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq-item.open").forEach((o) => {
        o.classList.remove("open");
        $(".faq-q", o)?.setAttribute("aria-expanded", "false");
        const oa = $(".faq-a", o);
        if (oa) oa.style.maxHeight = "0px";
      });
      if (!open) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
}

/* --- Botones magnéticos --- */
function initMagnetic(): void {
  if (reduceMotion || isTouch) return;
  $$(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const ev = e as PointerEvent;
      const r = btn.getBoundingClientRect();
      const x = (ev.clientX - r.left - r.width / 2) / r.width;
      const y = (ev.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = "translate(" + x * 8 + "px," + (y * 8 - 2) + "px)";
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

/* --- Parallax sutil del mockup del hero --- */
function initParallax(heroMock: HTMLElement | null): void {
  if (reduceMotion || window.innerWidth <= 768 || !heroMock) return;
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const r = heroMock.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
          heroMock.style.transform = "translateY(" + (p - 0.5) * -22 + "px)";
        }
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* --- Marquee sin costuras (duplicar contenido) --- */
function initMarquee(): void {
  const track = $("#marqueeTrack");
  if (track) track.innerHTML += track.innerHTML;
}

/** Arranca todas las interacciones de la página. */
export function initUI(): void {
  initNav();
  initMobileMenu();
  initAnchors();
  initReveals();
  const heroMock = initHeroCounters();
  initStats();
  initStickyStory();
  initFaq();
  initMagnetic();
  initParallax(heroMock);
  initMarquee();
}
