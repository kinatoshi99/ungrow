const characters = window.UngrowCharacters;
const roastModes = window.UngrowRoastModes;
const roastMatrix = window.UngrowRoastMatrix;
const dailyChallenge = window.UngrowDailyChallenge;
const plantRenderers = {
  somchai: window.UngrowPlantSvg,
  ploy: window.UngrowPloySvg
};

const DEFAULT_STATE = { characterId: "somchai", health: 89, roastMode: 2, roastEngine: 2 };
let pendingExplicitFromUrl = false;
let pendingExplicitRoastIndex = 0;

function has18Confirmation() {
  try { return window.sessionStorage.getItem("ungrow18Confirmed") === "1"; }
  catch (_) { return false; }
}

function confirm18Session() {
  try { window.sessionStorage.setItem("ungrow18Confirmed", "1"); }
  catch (_) {}
}

function legacyRoastsForCharacter(character, level) {
  const slangRoasts = roastModes.examplesFor(character.id, level);
  return level === 2 ? [...character.roasts, ...slangRoasts] : slangRoasts;
}

function getRoastIntent(health = state?.health ?? DEFAULT_STATE.health) {
  const value = Math.max(0, Math.min(100, Number(health)));
  if (value >= 80) return "praise";
  if (value >= 60) return "sideEye";
  if (value >= 40) return "concerned";
  if (value >= 20) return "hard";
  return "disaster";
}

function healthAwareRoasts(character, level, health) {
  return roastMatrix.for(character.id, getRoastIntent(health), level);
}

function roastsForState(character, { level, health, engine }) {
  return engine === 1
    ? legacyRoastsForCharacter(character, level)
    : healthAwareRoasts(character, level, health);
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requestedDailyKey = params.get("d");
  const requestedDailyCharacter = params.get("c");
  const daily = dailyChallenge.validDateKey(requestedDailyKey)
    ? dailyChallenge.generate(requestedDailyKey, characters[requestedDailyCharacter] ? requestedDailyCharacter : null)
    : null;
  const requestedCharacter = daily?.characterId || requestedDailyCharacter;
  const characterId = characters[requestedCharacter] ? requestedCharacter : DEFAULT_STATE.characterId;
  const character = characters[characterId];
  const requestedHealth = daily?.health ?? Number.parseInt(params.get("h"), 10);
  const health = Number.isFinite(requestedHealth)
    ? Math.max(0, Math.min(100, requestedHealth))
    : DEFAULT_STATE.health;
  const parsedMode = daily?.roastMode ?? Number.parseInt(params.get("m"), 10);
  const requestedMode = [1, 2, 3, 4].includes(parsedMode) ? parsedMode : DEFAULT_STATE.roastMode;
  const requestedRoast = Number.parseInt(params.get("r"), 10);
  const parsedEngine = Number.parseInt(params.get("e"), 10);
  const legacySharedUrl = !daily && !params.has("e") && params.has("r");
  const roastEngine = daily ? 2 : parsedEngine === 1 ? 1 : parsedEngine === 2 ? 2 : legacySharedUrl ? 1 : DEFAULT_STATE.roastEngine;
  let roastMode = requestedMode;

  if (requestedMode === 4 && !has18Confirmation()) {
    pendingExplicitFromUrl = true;
    pendingExplicitRoastIndex = Number.isInteger(requestedRoast) ? requestedRoast : 0;
    roastMode = DEFAULT_STATE.roastMode;
  }

  const pool = roastsForState(character, { level: roastMode, health, engine: roastEngine });
  const defaultRoastIndex = daily
    ? Math.min(daily.roastIndex, pool.length - 1)
    : roastEngine === 1 && roastMode === DEFAULT_STATE.roastMode
      ? Math.min(character.roasts.length - 1, pool.length - 1)
      : 0;
  const roastIndex = Number.isInteger(requestedRoast) && requestedRoast >= 0 && requestedRoast < pool.length
    ? requestedRoast
    : defaultRoastIndex;
  return { characterId, health, roastMode, roastIndex, roastEngine, dailyKey: daily?.key || null };
}

const state = readStateFromUrl();
const desktopExportLab = document.querySelector("#desktopExportLab");
const mobileExportLab = document.querySelector("#mobileExportLab");
const exportCanvas = document.querySelector("#exportCanvas");
const exportCanvasParking = document.querySelector("#exportCanvasParking");
const desktopExportPreviewSlot = document.querySelector("#desktopExportPreviewSlot");
const mobileExportPreviewSlot = document.querySelector("#mobileExportPreviewSlot");
const mobileViewport = window.matchMedia("(max-width: 767px)");
let activeExportLab = null;
let latestExportBlob = null;
let exportRenderToken = 0;
let exportTimer = null;

function currentCharacter() { return characters[state.characterId] || characters.somchai; }
function currentDailyChallenge() {
  return state.dailyKey ? dailyChallenge.generate(state.dailyKey, state.characterId) : null;
}
function todayDailyChallenge() { return dailyChallenge.generate(undefined, state.characterId); }
function clearDailyContext() { state.dailyKey = null; }
function currentRoasts() {
  return roastsForState(currentCharacter(), {
    level: state.roastMode,
    health: state.health,
    engine: state.roastEngine
  });
}
function currentRoast() {
  const roasts = currentRoasts();
  return roasts[state.roastIndex % roasts.length];
}
function currentAward() {
  const awards = currentCharacter().awardLines;
  return awards[state.roastIndex % awards.length];
}
function currentMeme() {
  return window.UngrowMemes.select({
    health: state.health,
    character: currentCharacter(),
    roastMode: state.roastMode,
    roastIndex: state.roastIndex,
    daily: currentDailyChallenge()
  });
}
function currentPlantRenderer() { return plantRenderers[currentCharacter().rendererId] || plantRenderers.somchai; }
function getCondition(health = state.health) {
  const conditions = currentCharacter().conditions;
  return conditions.find(item => health >= item.min) || conditions[conditions.length - 1];
}
function qsa(selector) { return [...document.querySelectorAll(selector)]; }

const roastSpeech = window.UngrowSpeech.create({
  onChange({ supported, status, message }) {
    const active = status === "loading" || status === "speaking";
    qsa('[data-action="speak-roast"]').forEach(button => {
      button.disabled = !supported;
      button.setAttribute("aria-pressed", String(active));
      button.textContent = active ? "⏹ หยุดเสียง" : "🔊 ฟังต้นไม้เมาท์";
    });
    qsa("[data-speech-status]").forEach(element => { element.textContent = message; });
  }
});

function buildShareUrl({ preserveOtherParams = false } = {}) {
  const url = new URL(window.location.href);
  if (!preserveOtherParams) url.search = "";
  if (state.dailyKey) {
    url.searchParams.set("c", state.characterId);
    url.searchParams.delete("h");
    url.searchParams.delete("m");
    url.searchParams.set("d", state.dailyKey);
    url.searchParams.set("r", String(state.roastIndex));
    url.searchParams.set("e", "2");
  } else {
    url.searchParams.delete("d");
    url.searchParams.set("c", state.characterId);
    url.searchParams.set("h", String(state.health));
    url.searchParams.set("m", String(state.roastMode));
    url.searchParams.set("r", String(state.roastIndex));
    url.searchParams.set("e", String(state.roastEngine));
  }
  url.hash = "";
  return url.toString();
}

function syncStateToUrl() {
  const url = buildShareUrl({ preserveOtherParams: true });
  window.history.replaceState(null, "", url);
}

function renderUI() {
  const character = currentCharacter();
  const condition = getCondition();
  const renderer = currentPlantRenderer();
  const healthText = `${state.health}%`;
  const ownerSkillText = `${character.ownerSkill}%`;

  qsa("[data-character-name]").forEach(el => { el.textContent = character.name; });
  qsa("[data-character-subtitle]").forEach(el => { el.textContent = character.subtitle; });
  qsa("[data-character-plant-label]").forEach(el => { el.setAttribute("aria-label", `${character.name} ${character.plant} health illustration`); });
  qsa("[data-character-section-label]").forEach(el => { el.setAttribute("aria-label", `${character.name} roast controls`); });
  qsa("[data-character-id]").forEach(button => {
    const selected = button.dataset.characterId === character.id;
    button.setAttribute("aria-pressed", String(selected));
  });
  qsa("[data-roast-mode]").forEach(button => {
    const selected = Number(button.dataset.roastMode) === state.roastMode;
    button.setAttribute("aria-pressed", String(selected));
  });
  const modeMeta = roastModes.modes[String(state.roastMode)];
  qsa("[data-roast-mode-description]").forEach(el => { el.textContent = modeMeta.description; });
  const today = todayDailyChallenge();
  const activeDaily = currentDailyChallenge();
  const shownDaily = activeDaily || today;
  const dailyCharacter = characters[shownDaily.characterId];
  const dailyMode = roastModes.modes[String(shownDaily.roastMode)];
  qsa("[data-daily-label]").forEach(el => {
    el.textContent = `🔥 ${activeDaily ? "DAILY DISASTER" : "PLAY DAILY DISASTER"} #${String(shownDaily.number).padStart(3, "0")}${activeDaily ? " · ACTIVE" : ""}`;
  });
  qsa("[data-daily-summary]").forEach(el => {
    el.textContent = `${dailyCharacter.name} · Health ${shownDaily.health}% · ${dailyMode.shortLabel}`;
  });
  qsa('[data-action="daily-challenge"]').forEach(button => {
    button.setAttribute("aria-pressed", String(Boolean(activeDaily)));
  });
  qsa("[data-owner-skill-value]").forEach(el => { el.textContent = ownerSkillText; });
  qsa("[data-owner-skill-bar]").forEach(el => { el.style.width = ownerSkillText; });
  qsa("[data-health-value]").forEach(el => { el.textContent = healthText; });
  qsa("[data-health-slider]").forEach(el => { if (Number(el.value) !== state.health) el.value = state.health; });
  qsa("[data-health-bar]").forEach(el => { el.style.width = healthText; el.style.background = condition.color; });
  qsa("[data-condition-title]").forEach(el => { el.textContent = condition.title; el.style.color = condition.color; });
  qsa("[data-condition-sub]").forEach(el => { el.textContent = condition.sub; });
  qsa("[data-roast]").forEach(el => { el.textContent = `“${currentRoast()}”`; });
  qsa("[data-plant-svg]").forEach(svg => renderer.render(svg, state.health));
  const meme = currentMeme();
  qsa("[data-meme-preview]").forEach(img => {
    img.hidden = !meme;
    if (!meme) return;
    if (img.src !== meme.src) img.src = meme.src;
    img.alt = meme.alt;
    img.dataset.memeId = meme.id;
    img.dataset.memeIntent = meme.intent;
  });

  qsa("[data-export-summary]").forEach(el => {
    const daily = currentDailyChallenge();
    const prefix = daily ? `Daily #${String(daily.number).padStart(3, "0")} · ` : "";
    el.textContent = `${prefix}${character.name} · Health ${healthText} · ${condition.title}`;
  });
  if (activeExportLab && !activeExportLab.hidden) scheduleExportRender();
}

function adoptHealthAwareEngine(preferredIndex = state.roastIndex) {
  if (state.roastEngine === 2) return;
  state.roastEngine = 2;
  const roasts = currentRoasts();
  state.roastIndex = Math.max(0, Math.min(preferredIndex, roasts.length - 1));
}

function setHealth(value) {
  roastSpeech.stop();
  clearDailyContext();
  state.health = Math.max(0, Math.min(100, Number(value)));
  adoptHealthAwareEngine();
  state.roastIndex = Math.min(state.roastIndex, currentRoasts().length - 1);
  syncStateToUrl();
  renderUI();
}

function setCharacter(characterId) {
  if (!characters[characterId] || characterId === state.characterId) return;
  roastSpeech.stop();
  clearDailyContext();
  state.characterId = characterId;
  adoptHealthAwareEngine();
  state.roastIndex = Math.min(state.roastIndex, currentRoasts().length - 1);
  latestExportBlob = null;
  syncStateToUrl();
  renderUI();
}

function applyRoastMode(level, preferredIndex = state.roastIndex, { preserveEngine = false, preserveDaily = false } = {}) {
  roastSpeech.stop();
  if (!preserveDaily) clearDailyContext();
  if (!preserveEngine) state.roastEngine = 2;
  state.roastMode = level;
  const roasts = currentRoasts();
  state.roastIndex = Math.max(0, Math.min(preferredIndex, roasts.length - 1));
  latestExportBlob = null;
  syncStateToUrl();
  renderUI();
}

function requestRoastMode(level) {
  if (![1, 2, 3, 4].includes(level) || level === state.roastMode) return;
  if (level === 4 && !has18Confirmation()) {
    pendingExplicitFromUrl = false;
    pendingExplicitRoastIndex = state.roastIndex;
    showAgeGate();
    return;
  }
  applyRoastMode(level);
}

function applyDailyChallenge(key = dailyChallenge.dateKey()) {
  roastSpeech.stop();
  const daily = dailyChallenge.generate(key, state.characterId);
  state.dailyKey = daily.key;
  state.characterId = daily.characterId;
  state.health = daily.health;
  state.roastMode = daily.roastMode;
  state.roastEngine = 2;
  const pool = currentRoasts();
  state.roastIndex = Math.min(daily.roastIndex, pool.length - 1);
  latestExportBlob = null;
  syncStateToUrl();
  renderUI();
}

function nextRoast() {
  roastSpeech.stop();
  adoptHealthAwareEngine();
  const roasts = currentRoasts();
  let next = state.roastIndex;
  while (next === state.roastIndex && roasts.length > 1) next = Math.floor(Math.random() * roasts.length);
  state.roastIndex = next;
  syncStateToUrl();
  renderUI();
}

function mountExportCanvas() {
  const slot = mobileViewport.matches ? mobileExportPreviewSlot : desktopExportPreviewSlot;
  if (slot && exportCanvas.parentElement !== slot) slot.appendChild(exportCanvas);
}

function syncExportContext({ scroll = false } = {}) {
  const target = mobileViewport.matches ? mobileExportLab : desktopExportLab;
  const other = mobileViewport.matches ? desktopExportLab : mobileExportLab;
  other.hidden = true;
  target.hidden = false;
  activeExportLab = target;
  mountExportCanvas();
  renderUI();
  scheduleExportRender(true);
  if (scroll) requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function showExportLab() { syncExportContext({ scroll: true }); }

function closeExportLab() {
  desktopExportLab.hidden = true;
  mobileExportLab.hidden = true;
  activeExportLab = null;
  exportCanvasParking.appendChild(exportCanvas);
}

function setExportButtons(disabled, label) {
  qsa('[data-action="save-export"]').forEach(button => {
    button.disabled = disabled;
    button.textContent = label;
  });
}

function setExportStatus(message) {
  qsa("[data-export-status]").forEach(el => { el.textContent = message; });
}

function svgToImage(markup) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = err => { URL.revokeObjectURL(url); reject(err); };
    image.src = url;
  });
}

function canvasBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, "image/png", 1));
}

const loadMemeImage = window.UngrowMemes.createImageLoader();

async function renderExportCard() {
  const token = ++exportRenderToken;
  const character = currentCharacter();
  const renderer = currentPlantRenderer();
  const health = state.health;
  const card = {
    character, health, condition: getCondition(), roast: currentRoast(),
    award: currentAward(), daily: currentDailyChallenge(),
    roastMode: state.roastMode, roastIndex: state.roastIndex
  };
  const meme = currentMeme();
  latestExportBlob = null;
  setExportButtons(true, "⏳ กำลังทำการ์ด...");
  setExportStatus("กำลังเตรียมการ์ดประจาน...");

  try {
    const [plantImage, memeImage] = await Promise.all([
      svgToImage(renderer.buildStandalone(health)),
      loadMemeImage(meme),
      document.fonts?.ready || Promise.resolve()
    ]);
    if (token !== exportRenderToken) return;
    window.UngrowSocialCard.render(exportCanvas.getContext("2d"), { ...card, plantImage, meme, memeImage });
    exportCanvas.setAttribute("aria-label", `การ์ด ${character.name} · Health ${health}% · ${card.roast} · มีม ${meme.name}`);
    const blob = await canvasBlob(exportCanvas);
    if (token !== exportRenderToken) return;
    if (!blob) throw new Error("PNG encoding failed");
    latestExportBlob = blob;
    setExportButtons(false, supportsFileShare() ? "📤 SAVE / SHARE PNG" : "⬇️ DOWNLOAD PNG");
    setExportStatus(`การ์ด ${character.name} พร้อมแล้ว · Health ${health}% · ${meme.name}`);
  } catch (_) {
    if (token !== exportRenderToken) return;
    latestExportBlob = null;
    setExportButtons(false, "↻ ลองทำการ์ดอีกครั้ง");
    setExportStatus("สร้างการ์ดไม่สำเร็จ กดปุ่มเพื่อลองอีกครั้ง");
  }
}

function scheduleExportRender(immediate = false) {
  clearTimeout(exportTimer);
  // Invalidate the previous PNG as soon as Health/character changes, including
  // during the debounce, so a saved card cannot carry stale artwork or text.
  exportRenderToken += 1;
  latestExportBlob = null;
  setExportButtons(true, "⏳ กำลังทำการ์ด...");
  if (immediate) renderExportCard();
  else exportTimer = setTimeout(renderExportCard, 80);
}

function supportsFileShare() {
  if (!navigator.share || !navigator.canShare || typeof File === "undefined" || !latestExportBlob) return false;
  try {
    const test = new File([latestExportBlob], "ungrow.png", { type: "image/png" });
    return navigator.canShare({ files: [test] });
  } catch (_) { return false; }
}

async function saveExport() {
  if (!latestExportBlob) {
    setExportStatus("PNG ยังไม่พร้อม รอสักครู่…");
    scheduleExportRender(true);
    return;
  }
  const character = currentCharacter();
  const daily = currentDailyChallenge();
  const filename = daily
    ? `ungrow-daily-${String(daily.number).padStart(3, "0")}-${character.id}.png`
    : `ungrow-${character.id}-health-${state.health}.png`;
  const file = new File([latestExportBlob], filename, { type: "image/png" });

  if (supportsFileShare()) {
    try {
      await navigator.share({ files: [file], title: `Ungrow — ${character.name}`, text: `${character.name} · Plant Health ${state.health}%` });
      setExportStatus("เปิด Share Sheet แล้ว — เลือก Save Image หรือ Save to Files ได้เลย");
      return;
    } catch (err) {
      if (err?.name === "AbortError") { setExportStatus("ยกเลิกการแชร์แล้ว"); return; }
    }
  }

  const url = URL.createObjectURL(latestExportBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  setExportStatus("ส่งไฟล์ให้เบราว์เซอร์ดาวน์โหลดแล้ว");
}


function setShareButtonLabel(label) {
  qsa('[data-action="share-link"]').forEach(button => {
    if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent;
    button.textContent = label || button.dataset.defaultLabel;
  });
}

async function copyShareUrl(url) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const input = document.createElement("textarea");
  input.value = url;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

async function shareStateLink() {
  syncStateToUrl();
  const character = currentCharacter();
  const url = buildShareUrl();
  const daily = currentDailyChallenge();
  const title = daily
    ? `Ungrow Daily Disaster #${String(daily.number).padStart(3, "0")}`
    : `Ungrow — ${character.name}`;
  const text = daily
    ? `${character.name} · Health ${state.health}% · ${currentRoast()}`
    : `${character.name} · Plant Health ${state.health}% · ${currentRoast()}`;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
  }

  try {
    await copyShareUrl(url);
    setShareButtonLabel("✅ COPIED!");
    window.setTimeout(() => setShareButtonLabel(), 1400);
  } catch (_) {
    setShareButtonLabel("⚠️ COPY FAILED");
    window.setTimeout(() => setShareButtonLabel(), 1400);
  }
}

function ageGateElements() {
  return {
    dialog: document.querySelector("#ageGateDialog"),
    check: document.querySelector("#ageGateCheck"),
    confirm: document.querySelector('[data-action="age-confirm"]')
  };
}

function showAgeGate() {
  roastSpeech.stop();
  const { dialog, check, confirm } = ageGateElements();
  if (!dialog) return;
  if (check) check.checked = false;
  if (confirm) confirm.disabled = true;
  if (typeof dialog.showModal === "function") {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeAgeGate() {
  const { dialog } = ageGateElements();
  if (!dialog) return;
  if (typeof dialog.close === "function" && dialog.open) dialog.close();
  else dialog.removeAttribute("open");
}

function cancelAgeGate() {
  closeAgeGate();
  if (pendingExplicitFromUrl) {
    pendingExplicitFromUrl = false;
    syncStateToUrl();
  }
}

function confirmAgeGate() {
  const { check } = ageGateElements();
  if (!check?.checked) return;
  confirm18Session();
  const fromSharedUrl = pendingExplicitFromUrl;
  const preferredIndex = fromSharedUrl ? pendingExplicitRoastIndex : state.roastIndex;
  pendingExplicitFromUrl = false;
  closeAgeGate();
  applyRoastMode(4, preferredIndex, { preserveEngine: fromSharedUrl });
}

qsa("[data-character-id]").forEach(button => button.addEventListener("click", () => setCharacter(button.dataset.characterId)));
qsa("[data-roast-mode]").forEach(button => button.addEventListener("click", () => requestRoastMode(Number(button.dataset.roastMode))));
qsa("[data-health-slider]").forEach(slider => slider.addEventListener("input", e => setHealth(e.target.value)));
qsa('[data-action="roast"]').forEach(button => button.addEventListener("click", nextRoast));
qsa('[data-action="speak-roast"]').forEach(button => button.addEventListener("click", () => roastSpeech.toggle(currentRoast(), state.characterId)));
qsa('[data-action="shame"]').forEach(button => button.addEventListener("click", showExportLab));
qsa('[data-action="save-export"]').forEach(button => button.addEventListener("click", saveExport));
qsa('[data-action="share-link"]').forEach(button => button.addEventListener("click", shareStateLink));
qsa('[data-action="daily-challenge"]').forEach(button => button.addEventListener("click", () => applyDailyChallenge()));
qsa('[data-action="age-cancel"]').forEach(button => button.addEventListener("click", cancelAgeGate));
qsa('[data-action="age-confirm"]').forEach(button => button.addEventListener("click", confirmAgeGate));
document.querySelector("#ageGateCheck")?.addEventListener("change", event => {
  const button = document.querySelector('[data-action="age-confirm"]');
  if (button) button.disabled = !event.target.checked;
});
document.querySelector("#ageGateDialog")?.addEventListener("cancel", event => {
  event.preventDefault();
  cancelAgeGate();
});
qsa('[data-action="close-export"]').forEach(button => button.addEventListener("click", closeExportLab));
mobileViewport.addEventListener?.("change", () => {
  if (activeExportLab) syncExportContext({ scroll: false });
});

renderUI();
if (pendingExplicitFromUrl) requestAnimationFrame(showAgeGate);
