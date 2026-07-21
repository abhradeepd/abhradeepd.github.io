/* Abhradeep Das — portfolio interactions (v2) */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  const loader = document.getElementById("loader");
  const hideLoader = () => loader && loader.classList.add("hidden");
  if (reduceMotion) {
    hideLoader();
  } else {
    window.addEventListener("load", () => setTimeout(hideLoader, 1000));
    setTimeout(hideLoader, 2200); // hard cap so it never traps anyone
  }

  /* ---------- Cursor glow (fine pointers only, eased follow) ---------- */
  const glow = document.getElementById("cursorGlow");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (glow && finePointer && !reduceMotion) {
    let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty, raf = null;
    const step = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.left = x + "px";
      glow.style.top = y + "px";
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) {
        raf = requestAnimationFrame(step);
      } else {
        raf = null;
      }
    };
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add("on");
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
    document.addEventListener("mouseleave", () => glow.classList.remove("on"));
  }

  /* ---------- Word-by-word text animation ---------- */
  // Wraps each word (or whole styled span, e.g. gradient words) in a .w span with
  // a stagger index. h1 words animate on load; h2 words animate when their
  // section reveals. Skipped entirely under reduced motion.
  function splitWords(el, startIndex) {
    let i = startIndex || 0;
    const nodes = [...el.childNodes];
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement("span");
            span.className = "w";
            span.style.setProperty("--wi", i++);
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
        // keep styled spans (e.g. .accent-grad) intact as one animated unit
        const wrap = document.createElement("span");
        wrap.className = "w";
        wrap.style.setProperty("--wi", i++);
        el.replaceChild(wrap, node);
        wrap.appendChild(node);
      }
    });
    return i;
  }
  if (!reduceMotion) {
    const h1 = document.querySelector(".hero h1");
    if (h1) {
      h1.classList.remove("rise"); // words carry the entrance now
      h1.style.opacity = "1";
      splitWords(h1, 0);
    }
    document.querySelectorAll(".section-head h2").forEach((h2) => splitWords(h2, 0));
  }

  /* ---------- Hero: after load entrance, replay on every return ---------- */
  const hero = document.querySelector(".hero");
  if (hero && !reduceMotion) {
    setTimeout(() => hero.classList.add("settled", "in"), 2400);
  }

  /* ---------- Nav state + scroll progress + tuck/reveal ---------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("scrollProgress");
  const spyLinks = [...document.querySelectorAll(".nav-links a")];
  const spySections = spyLinks
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
    // hero replay boundary with hysteresis: resets only once you're well past it,
    // replays only once you're genuinely back near the top — never mid-About
    if (hero && hero.classList.contains("settled")) {
      if (y > innerHeight * 1.15) hero.classList.remove("in");
      else if (y < innerHeight * 0.55) hero.classList.add("in");
    }
    // scrollspy by position: the active section is the last one whose top has
    // crossed a line 35% down the viewport — deterministic, nothing skipped
    const ref = y + innerHeight * 0.35;
    let current = "";
    spySections.forEach((s) => {
      if (s.getBoundingClientRect().top + y <= ref) current = s.id;
    });
    spyLinks.forEach((a) =>
      a.classList.toggle("active", current !== "" && a.getAttribute("href") === "#" + current)
    );
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  if (burger && links) {
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Scroll reveal: hysteresis engine ----------
     Two observers instead of one. The old single observer used a -18% bottom
     margin, which silently turned the bottom fifth of the screen into a dead
     zone: elements un-revealed there while still visible. Now:
     · ENTER fires once ~10% up from the bottom edge — early enough that
       nothing sits blank in view
     · EXIT fires only once the element is fully off-screen (+90px buffer) —
       so nothing disappears while you can still see it
     Between those lines, state holds. Replays in both directions intact. */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const show = (el) => {
      const siblings = el.parentElement
        ? [...el.parentElement.children].filter((c) => c.classList.contains("reveal"))
        : [el];
      const idx = Math.max(0, siblings.indexOf(el));
      el.style.setProperty("--stagger", `${Math.min(idx, 5) * 0.07}s`);
      el.classList.add("in");
      const num = el.querySelector(".metric-num");
      if (num) countUp(num);
    };
    const hide = (el) => {
      el.classList.remove("in");
      const num = el.querySelector(".metric-num");
      if (num) {
        if (num._raf) cancelAnimationFrame(num._raf);
        num._raf = null;
        num.textContent = "0" + (num.dataset.suffix || "");
      }
    };
    const enterIO = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) show(en.target); }),
      { threshold: 0.02, rootMargin: "0px 0px -4% 0px" }
    );
    const exitIO = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting && en.target.classList.contains("in")) hide(en.target);
      }),
      { threshold: 0, rootMargin: "90px 0px 90px 0px" }
    );
    // begin observing after the loader lifts so near-fold entrances play in sight
    setTimeout(() => revealEls.forEach((el) => { enterIO.observe(el); exitIO.observe(el); }), 1150);
  } else {
    revealEls.forEach((el) => {
      el.classList.add("in");
      const num = el.querySelector(".metric-num");
      if (num) num.textContent = num.dataset.count + (num.dataset.suffix || "");
    });
  }

  /* ---------- Metric count-up ---------- */
  function countUp(el) {
    if (el._raf) cancelAnimationFrame(el._raf);
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      el._raf = p < 1 ? requestAnimationFrame(tick) : null;
    };
    el._raf = requestAnimationFrame(tick);
  }

  /* ---------- Button click ripple ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const d = Math.max(rect.width, rect.height);
        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = d + "px";
        span.style.left = e.clientX - rect.left - d / 2 + "px";
        span.style.top = e.clientY - rect.top - d / 2 + "px";
        btn.appendChild(span);
        setTimeout(() => span.remove(), 600);
      });
    });
  }

  /* ---------- Pipeline "tests" badge flicker ---------- */
  const badge = document.getElementById("testsBadge");
  if (badge && !reduceMotion) {
    setInterval(() => {
      badge.textContent = "running…";
      badge.style.color = "#e67e22";
      setTimeout(() => {
        badge.textContent = "tests ✓";
        badge.style.color = "#3fb950";
      }, 900);
    }, 6000);
  }


  /* ---------- Optics engine v3 (liquid test only) ----------
     Local light per pane (specular follows the pointer inside the surface).
     Tilt: area-based inertia curve, calibrated to the hand-tuned feel —
     inverse-sqrt of area for the main response, with a damping term that
     kicks in for very large slabs (heavy panes on stiff mounts):
       tilt = (1170/√A) / (1 + A/900000), clamped [0.7°, 9.5°]
     ≈ 9° pipeline nodes · 4° metric tiles · ~2.2° story cards ·
       ~1.1° contact · ~0.85° toolbox — same feel, one physical law. */
  if (!reduceMotion) {
    const glassEls = document.querySelectorAll(
      ".tl-card, .proj-card, .about-card, .metric, .pipe-node, .contact-card, .skills-rows, .btn, .chips span"
    );
    glassEls.forEach((el) => {
      const isBtn = el.classList.contains("btn");
      const flat = isBtn || el.matches(".chips span"); // glare yes, tilt no
      if (!isBtn) el.classList.add("gi");
      const s = { rx: 0, ry: 0, trx: 0, trY: 0, lift: 0, tlift: 0, raf: null, hover: false };
      const step = () => {
        s.rx += (s.trx - s.rx) * 0.16;
        s.ry += (s.trY - s.ry) * 0.16;
        s.lift += (s.tlift - s.lift) * 0.16;
        if (!flat) {
          const scale = (1 + 0.012 * s.lift).toFixed(4);
          el.style.transform =
            "perspective(900px) rotateX(" + s.rx.toFixed(2) + "deg) rotateY(" +
            s.ry.toFixed(2) + "deg) translateY(" + (-3 * s.lift).toFixed(2) +
            "px) scale(" + scale + ")";
        }
        const settled =
          Math.abs(s.trx - s.rx) < 0.01 &&
          Math.abs(s.trY - s.ry) < 0.01 &&
          Math.abs(s.tlift - s.lift) < 0.01;
        if (settled) {
          s.raf = null;
          if (!s.hover && !flat) {
            el.style.transform = "";
            el.style.transition = "";
          }
        } else {
          s.raf = requestAnimationFrame(step);
        }
      };
      const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(step); };
      el.addEventListener("pointerenter", () => {
        s.hover = true;
        s.tlift = 1;
        if (!flat) {
          el.style.transition =
            "transform 0s, border-color 0.35s ease, background 0.3s ease, box-shadow 0.35s ease";
        }
        kick();
      });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        el.style.setProperty("--go", "1");
        if (flat) return;
        const a = r.width * r.height;
        const maxTilt = Math.min(9.5, Math.max(0.7, (1170 / Math.sqrt(a)) / (1 + a / 900000)));
        s.trx = (0.5 - py) * maxTilt;
        s.trY = (px - 0.5) * maxTilt;
        kick();
      });
      el.addEventListener("pointerleave", () => {
        s.hover = false;
        s.tlift = 0;
        s.trx = 0;
        s.trY = 0;
        el.style.setProperty("--go", "0");
        kick();
      });
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
