const DARK_THEME = "night";
const LIGHT_THEME = "winter";
const THEME_KEY = "theme";

const themeToggle = document.getElementById("themeToggle");
const mouseGlow = document.getElementById("mouseGlow");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: light)");

function systemTheme() {
  return systemThemeQuery.matches ? LIGHT_THEME : DARK_THEME;
}

function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === DARK_THEME || saved === LIGHT_THEME ? saved : null;
}

function applyTheme(theme, { persist = false } = {}) {
  const next = theme === LIGHT_THEME ? LIGHT_THEME : DARK_THEME;
  document.documentElement.setAttribute("data-theme", next);
  if (themeToggle) themeToggle.checked = next === LIGHT_THEME;
  if (persist) localStorage.setItem(THEME_KEY, next);
}

function initTheme() {
  const saved = getSavedTheme();
  applyTheme(saved ?? systemTheme(), { persist: false });

  systemThemeQuery.addEventListener("change", () => {
    if (!getSavedTheme()) applyTheme(systemTheme(), { persist: false });
  });
}

if (themeToggle) {
  initTheme();
  themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? LIGHT_THEME : DARK_THEME, {
      persist: true,
    });
  });
}

if (mouseGlow) {
  const IDLE_MS = 1800;
  const AMBIENT_SPEED = 0.018;
  const FOLLOW_SPEED = 0.14;
  const TOUCH_SPEED = 0.28;
  const ARRIVE_DIST = 24;

  let x = window.innerWidth * 0.5;
  let y = window.innerHeight * 0.4;
  let targetX = x;
  let targetY = y;
  let ambientX = x;
  let ambientY = y;
  let followSpeed = FOLLOW_SPEED;
  let lastPointerAt = 0;
  let following = false;

  function halfSize() {
    return mouseGlow.offsetWidth / 2;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pickAmbientTarget() {
    const pad = halfSize() * 0.35;
    ambientX = pad + Math.random() * Math.max(0, window.innerWidth - pad * 2);
    ambientY = pad + Math.random() * Math.max(0, window.innerHeight - pad * 2);
  }

  function setPointerTarget(clientX, clientY, speed) {
    targetX = clientX;
    targetY = clientY;
    followSpeed = speed;
    lastPointerAt = performance.now();
    following = true;
  }

  function render() {
    const offset = halfSize();
    mouseGlow.style.transform = `translate(${x - offset}px, ${y - offset}px)`;
  }

  function tick(now) {
    if (following && now - lastPointerAt > IDLE_MS) {
      following = false;
      ambientX = x;
      ambientY = y;
      pickAmbientTarget();
    }

    if (following) {
      targetX = clamp(targetX, 0, window.innerWidth);
      targetY = clamp(targetY, 0, window.innerHeight);
      x += (targetX - x) * followSpeed;
      y += (targetY - y) * followSpeed;
    } else {
      const dx = ambientX - x;
      const dy = ambientY - y;
      if (dx * dx + dy * dy < ARRIVE_DIST * ARRIVE_DIST) {
        pickAmbientTarget();
      }
      x += (ambientX - x) * AMBIENT_SPEED;
      y += (ambientY - y) * AMBIENT_SPEED;
    }

    render();
    requestAnimationFrame(tick);
  }

  document.addEventListener(
    "mousemove",
    (e) => setPointerTarget(e.clientX, e.clientY, FOLLOW_SPEED),
    { passive: true }
  );

  document.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (touch) setPointerTarget(touch.clientX, touch.clientY, TOUCH_SPEED);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (touch) setPointerTarget(touch.clientX, touch.clientY, TOUCH_SPEED);
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      x = clamp(x, 0, window.innerWidth);
      y = clamp(y, 0, window.innerHeight);
      pickAmbientTarget();
    },
    { passive: true }
  );

  pickAmbientTarget();
  render();
  requestAnimationFrame(tick);
}
