// DUBAO: the live hour of Douala, the stage pictures and the entrances.
(() => {
  document.documentElement.classList.add("js");
  const WA = "237679905230";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // WhatsApp links carry a message adapted to where the visitor clicked.
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // The live thing: the real hour in Douala. The frontage turns to night after dark,
  // and the bar says what is true at this very minute: the centre is open.
  const time = new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Douala", hour: "2-digit", minute: "2-digit" });
  // A strict numeric hour ("20"), not the French display form ("20 h").
  const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Douala", hour: "2-digit", hourCycle: "h23" });
  const live = document.querySelector("[data-live]");
  const hourSlot = document.querySelector("[data-hour]");
  const stageA = document.querySelector(".split .stage");
  const show = (stage, key) => {
    stage.querySelectorAll(".stage-img").forEach((img) => img.classList.toggle("is-on", img.dataset.key === key));
  };
  const tick = () => {
    const now = new Date();
    const hhmm = time.format(now).replace(":", "h");
    const h = Number(hourFmt.format(now));
    const night = h >= 19 || h < 6;
    if (live) live.textContent = `Il est ${hhmm} à Douala. Le centre est ouvert.`;
    if (hourSlot) hourSlot.textContent = hhmm;
    if (stageA) show(stageA, night ? "night" : "day");
  };
  // First paint shows the right light at once; later changes crossfade.
  stageA?.classList.add("instant");
  tick();
  requestAnimationFrame(() => requestAnimationFrame(() => stageA?.classList.remove("instant")));
  setInterval(tick, 20000);

  // Second stage: the picture follows the section being read, with its caption.
  const captions = {
    formation: "Formation d'agents de santé au Cameroun (CC0). Ce n'est pas l'Academy.",
    douala: "Douala en fin de journée, par Bmnda (CC0).",
  };
  const stageB = document.querySelector(".split-b .stage");
  const cap = document.querySelector("[data-caption]");
  if (stageB && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const key = en.target.dataset.show;
        show(stageB, key);
        if (cap) cap.textContent = captions[key] || "";
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll("[data-show]").forEach((s) => io.observe(s));
  }

  // Entrances: heading, then text, then picture, staggered inside each section.
  const items = [...document.querySelectorAll(".reveal")];
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    const groups = new Map();
    items.forEach((el) => {
      const host = el.closest("section, footer") || document.body;
      const list = groups.get(host) || [];
      el.style.setProperty("--d", `${Math.min(list.length, 6) * 80}ms`);
      list.push(el);
      groups.set(host, list);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    items.forEach((el) => io.observe(el));
    // Never leave content hidden if something goes wrong.
    setTimeout(() => items.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); }), 1200);
  }

  document.getElementById("year").textContent = String(new Date().getFullYear());
})();
