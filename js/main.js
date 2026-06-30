const langButtons = Array.from(document.querySelectorAll("[data-lang]"));

function readSavedLang() {
  try {
    return localStorage.getItem("lang");
  } catch (_error) {
    return null;
  }
}

function saveLang(lang) {
  try {
    localStorage.setItem("lang", lang);
  } catch (_error) {
    /* Storage can be unavailable in strict privacy modes. */
  }
}

function setLang(lang) {
  const nextLang = lang === "zh" ? "zh" : "en";

  document.body.classList.toggle("zh", nextLang === "zh");
  document.documentElement.lang = nextLang === "zh" ? "zh-CN" : "en";

  langButtons.forEach((button) => {
    const isActive = button.dataset.lang === nextLang;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  saveLang(nextLang);
}

window.setLang = setLang;

langButtons.forEach((button) => {
  button.addEventListener("click", () => setLang(button.dataset.lang));
});

setLang(readSavedLang() === "zh" ? "zh" : "en");

const screenFeature = document.querySelector(".screen-feature");
const screenFeatureImage = screenFeature?.querySelector("img");
const screenFeatureTitleEn = screenFeature?.querySelector("[data-screen-feature-title-en]");
const screenFeatureTitleZh = screenFeature?.querySelector("[data-screen-feature-title-zh]");
const screenFeatureCopyEn = screenFeature?.querySelector("[data-screen-feature-copy-en]");
const screenFeatureCopyZh = screenFeature?.querySelector("[data-screen-feature-copy-zh]");
const screenOptions = Array.from(document.querySelectorAll("[data-screen-option]"));
const screenTriggers = Array.from(document.querySelectorAll("[data-screen-trigger]"));

function writeText(node, value) {
  if (node && value) node.textContent = value;
}

function setFeatureImage(src, alt) {
  if (!screenFeature || !screenFeatureImage || !src) return;

  const nextSrc = new URL(src, window.location.href).href;
  const currentSrc = new URL(screenFeatureImage.getAttribute("src"), window.location.href).href;

  screenFeatureImage.alt = alt || "";

  if (nextSrc === currentSrc) return;

  screenFeature.classList.add("is-updating");

  const image = new Image();
  image.onload = () => {
    screenFeatureImage.src = src;
    requestAnimationFrame(() => screenFeature.classList.remove("is-updating"));
  };
  image.onerror = () => screenFeature.classList.remove("is-updating");
  image.src = src;
}

function selectScreen(key, sourceNode) {
  if (!key || !screenFeatureImage) return;

  const source = sourceNode?.dataset.screenImage
    ? sourceNode
    : screenOptions.find((option) => option.dataset.screenKey === key);

  if (!source) return;

  const activeOptionKey = source.dataset.screenActiveOption || source.dataset.screenKey || key;

  setFeatureImage(source.dataset.screenImage, source.dataset.screenAlt);
  writeText(screenFeatureTitleEn, source.dataset.screenTitleEn);
  writeText(screenFeatureTitleZh, source.dataset.screenTitleZh);
  writeText(screenFeatureCopyEn, source.dataset.screenCopyEn);
  writeText(screenFeatureCopyZh, source.dataset.screenCopyZh);

  screenOptions.forEach((option) => {
    const isActive = option.dataset.screenKey === activeOptionKey;
    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });

  screenTriggers.forEach((trigger) => {
    const isActive = trigger.dataset.screenTrigger === key;
    trigger.classList.toggle("is-active", isActive);
    trigger.setAttribute("aria-pressed", String(isActive));
  });
}

screenOptions.forEach((option) => {
  option.addEventListener("click", () => selectScreen(option.dataset.screenKey, option));
});

screenTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => selectScreen(trigger.dataset.screenTrigger, trigger));
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.getElementById(targetId.slice(1));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", targetId);
  });
});

const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

if ("IntersectionObserver" in window && revealItems.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("revealed"));
}

const trackedSections = Array.from(document.querySelectorAll("main section[id]"));
const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
const scheduleFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 16));

function markActiveNav(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let navTicking = false;

function updateActiveNav() {
  if (!trackedSections.length || !navLinks.length) return;

  const navHeight = Number(getComputedStyle(document.documentElement).getPropertyValue("--nav-h").trim().replace("px", "")) || 72;
  const guide = navHeight + 120;
  let currentId = trackedSections[0].id;

  trackedSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= guide && rect.bottom > guide) {
      currentId = section.id;
    }
  });

  markActiveNav(currentId);
}

function requestActiveNavUpdate() {
  if (navTicking) return;
  navTicking = true;
  scheduleFrame(() => {
    updateActiveNav();
    navTicking = false;
  });
}

window.addEventListener("scroll", requestActiveNavUpdate, { passive: true });
window.addEventListener("hashchange", updateActiveNav);

window.addEventListener("load", () => {
  const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;

  if (target) {
    target.scrollIntoView({ block: "start" });
  }

  scheduleFrame(updateActiveNav);
});

updateActiveNav();
