// DUBAO Group: small progressive enhancements. The page works without JavaScript.
(() => {
  const WA = "237679905230";

  // WhatsApp links carry a message adapted to where the visitor clicked.
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Header border once the page scrolls.
  const top = document.getElementById("top");
  const onScroll = () => top.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu.
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.classList.toggle("open", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Training tabs (keyboard: arrows, Home, End).
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t, false));
    t.addEventListener("keydown", (e) => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      select(tabs[(n + tabs.length) % tabs.length], true);
    });
  });

  // Gentle reveal of blocks as they enter the screen.
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const els = document.querySelectorAll(".head, .entity, .svc, .cta-line, .tabs, .panel:not([hidden]), .place, .contact-text");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }

  // The floating WhatsApp button only shows when no other WhatsApp button is in view:
  // hidden while the hero buttons or the contact block are on screen.
  const float = document.querySelector(".wa-float");
  const watched = [document.querySelector(".hero-cta"), document.getElementById("contact")].filter(Boolean);
  if ("IntersectionObserver" in window && float && watched.length) {
    const visible = new Set();
    float.classList.add("hide");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
      float.classList.toggle("hide", visible.size > 0);
    }, { threshold: 0.15 });
    watched.forEach((el) => io.observe(el));
  }

  document.getElementById("year").textContent = String(new Date().getFullYear());
})();
