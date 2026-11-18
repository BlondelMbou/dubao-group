// DUBAO: motion and live details. Everything degrades to a readable static page.
(() => {
  const WA = "237679905230";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // WhatsApp links carry a message adapted to where the visitor clicked.
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Live Douala time: the 24h/24 promise, shown rather than told.
  const fmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Douala", hour: "2-digit", minute: "2-digit" });
  const hourFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Douala", hour: "numeric", hour12: false });
  const state = document.querySelector("[data-state]");
  const tick = () => {
    const now = new Date();
    document.querySelectorAll("[data-clock]").forEach((t) => { t.textContent = fmt.format(now); });
    if (state) {
      const h = Number(hourFmt.format(now));
      state.textContent = h >= 22 || h < 6 ? "Le centre est ouvert, même la nuit." : "Le centre est ouvert.";
    }
  };
  tick();
  setInterval(tick, 15000);

  // Rotating verb in the poster title.
  const verbs = [...document.querySelectorAll(".verb")];
  if (verbs.length > 1 && !reduce) {
    let i = 0;
    setInterval(() => {
      const cur = verbs[i];
      i = (i + 1) % verbs.length;
      const next = verbs[i];
      cur.classList.remove("is-on");
      cur.classList.add("is-out");
      next.classList.remove("is-out");
      next.style.transition = "none";
      next.style.transform = "translateY(120%)";
      void next.offsetWidth;
      next.style.transition = "";
      next.style.transform = "";
      next.classList.add("is-on");
      setTimeout(() => cur.classList.remove("is-out"), 800);
    }, 2400);
  }

  // Top bar turns to paper once the poster is gone.
  const bar = document.getElementById("bar");
  const poster = document.querySelector(".poster");
  const write = document.getElementById("ecrire");

  // Manifesto: words light up as the paragraph crosses the screen.
  const words = document.querySelector("[data-words]");
  let wordEls = [];
  if (words && !reduce) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    wordEls = [...words.querySelectorAll(".w")];
  }

  // Academy rail: vertical scroll drives a horizontal track (desktop only).
  const rail = document.querySelector("[data-rail]");
  const track = rail?.querySelector(".rail-track");
  const bar2 = rail?.querySelector(".rail-progress span");
  const wide = matchMedia("(min-width: 981px)");
  const sizeRail = () => {
    if (!rail || !track) return;
    if (!wide.matches || reduce) { rail.style.height = ""; track.style.transform = ""; return; }
    const extra = Math.max(0, track.scrollWidth - window.innerWidth);
    rail.style.height = `${window.innerHeight + extra}px`;
  };

  const onScroll = () => {
    const vh = window.innerHeight;
    // bar: transparent at the very top; then night over dark blocks, paper over light ones
    const scrolled = window.scrollY > 24;
    const overDark = poster.getBoundingClientRect().bottom > 68 || write.getBoundingClientRect().top <= 68;
    bar.classList.toggle("light", scrolled && !overDark);
    bar.classList.toggle("dark", scrolled && overDark);

    if (wordEls.length) {
      const r = words.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * wordEls.length);
      wordEls.forEach((w, k) => w.classList.toggle("lit", k < lit));
    }

    if (rail && track && wide.matches && !reduce) {
      const r = rail.getBoundingClientRect();
      const total = rail.offsetHeight - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      const extra = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translate3d(${-p * extra}px,0,0)`;
      if (bar2) bar2.style.width = `${p * 100}%`;
    }
  };

  let ticking = false;
  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  };
  sizeRail();
  onScroll();
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", () => { sizeRail(); request(); });
  wide.addEventListener?.("change", () => { sizeRail(); request(); });
  document.fonts?.ready.then(() => { sizeRail(); request(); });

  // WhatsApp dock: only when no other WhatsApp call is on screen.
  const dock = document.querySelector(".wa-dock");
  const watched = [document.querySelector(".poster .wa"), write].filter(Boolean);
  if ("IntersectionObserver" in window && dock) {
    const visible = new Set();
    dock.classList.add("hide");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
      dock.classList.toggle("hide", visible.size > 0);
    }, { threshold: 0.1 });
    watched.forEach((el) => io.observe(el));
  }

  document.getElementById("year").textContent = String(new Date().getFullYear());
})();
