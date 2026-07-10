const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = $(".site-header");
const progress = $(".progress");
const menu = $(".menu-toggle");
const nav = $("#site-nav");
const locale = navigator.languages?.length ? navigator.languages : navigator.language;
const numberFormatter = new Intl.NumberFormat(locale);

$$('time[datetime]').forEach((element) => {
  const [year, month, day] = element.dateTime.split("-").map(Number);
  const value = new Date(year, month - 1, day, 12);
  const options = element.dataset.dateStyle === "long"
    ? { year: "numeric", month: "long", day: "numeric" }
    : { year: "numeric", month: "short", day: "2-digit" };
  element.textContent = new Intl.DateTimeFormat(locale, options).format(value);
});
$$('[data-number]').forEach((element) => {
  element.textContent = numberFormatter.format(Number(element.dataset.number));
});

function finishLoading() {
  $(".loader")?.classList.add("done");
}
if (document.readyState === "complete") finishLoading();
else window.addEventListener("load", () => setTimeout(finishLoading, reducedMotion ? 0 : 260), { once: true });

function onScroll() {
  const y = scrollY;
  const height = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle("scrolled", y > 30);
  progress.style.transform = `scaleX(${height ? Math.min(y / height, 1) : 0})`;
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setMenu(open, restoreFocus = false) {
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("open", open);
  nav.setAttribute("aria-hidden", String(!open));
  nav.toggleAttribute("inert", !open);
  document.body.classList.toggle("menu-open", open);
  if (open) nav.querySelector("a")?.focus();
  else if (restoreFocus) menu.focus();
}

menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
$$('#site-nav a').forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") setMenu(false, true);
  if (event.key !== "Tab" || menu.getAttribute("aria-expanded") !== "true") return;
  const focusable = [menu, ...$$('a', nav)];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
matchMedia("(min-width: 1000px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
  nav.toggleAttribute("inert", !event.matches);
  nav.setAttribute("aria-hidden", String(!event.matches));
});
if (matchMedia("(min-width: 1000px)").matches) {
  nav.removeAttribute("inert");
  nav.setAttribute("aria-hidden", "false");
}

if (reducedMotion || !("IntersectionObserver" in window)) {
  $$(".reveal").forEach((element) => element.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  }), { threshold: .12, rootMargin: "0px 0px -24px" });
  $$(".reveal").forEach((element) => revealObserver.observe(element));
}

function animateCount(element) {
  const end = Number(element.dataset.count);
  if (reducedMotion) { element.textContent = numberFormatter.format(end); return; }
  const start = performance.now();
  function tick(now) {
    const progressValue = Math.min((now - start) / 1300, 1);
    element.textContent = numberFormatter.format(Math.floor(end * (1 - Math.pow(1 - progressValue, 3))));
    if (progressValue < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const stats = $(".stat-grid");
if (stats && "IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    $$('[data-count]').forEach(animateCount);
    countObserver.disconnect();
  }, { threshold: .45 });
  countObserver.observe(stats);
} else {
  $$('[data-count]').forEach(animateCount);
}

const track = $("#mission-track");
$$('[data-scroll]').forEach((control) => control.addEventListener("click", () => {
  const card = $(".mission-card", track);
  const distance = card ? card.getBoundingClientRect().width + 14 : track.clientWidth * .8;
  track.scrollBy({ left: control.dataset.scroll === "next" ? distance : -distance, behavior: reducedMotion ? "auto" : "smooth" });
}));

if (!reducedMotion && matchMedia("(pointer: fine)").matches) {
  const glow = $(".cursor-glow");
  let pointerX = -400;
  let pointerY = -400;
  let pointerFrame = 0;
  addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      glow.style.transform = `translate3d(${pointerX - 160}px, ${pointerY - 160}px, 0)`;
      pointerFrame = 0;
    });
  }, { passive: true });
}

$$('details').forEach((item) => item.addEventListener("toggle", () => {
  if (item.open) $$('details').filter((detail) => detail !== item).forEach((detail) => { detail.open = false; });
}));
