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
  const daily = dailyChallenge.validDateKey(requestedDailyKey)
    ? dailyChallenge.generate(requestedDailyKey)
    : null;
  const requestedCharacter = daily?.characterId || params.get("c");
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
  return state.dailyKey ? dailyChallenge.generate(state.dailyKey) : null;
}
function todayDailyChallenge() { return dailyChallenge.generate(); }
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
function currentPlantRenderer() { return plantRenderers[currentCharacter().rendererId] || plantRenderers.somchai; }
function getCondition(health = state.health) {
  const conditions = currentCharacter().conditions;
  return conditions.find(item => health >= item.min) || conditions[conditions.length - 1];
}
function qsa(selector) { return [...document.querySelectorAll(selector)]; }

function buildShareUrl({ preserveOtherParams = false } = {}) {
  const url = new URL(window.location.href);
  if (!preserveOtherParams) url.search = "";
  if (state.dailyKey) {
    url.searchParams.delete("c");
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
  clearDailyContext();
  state.health = Math.max(0, Math.min(100, Number(value)));
  adoptHealthAwareEngine();
  state.roastIndex = Math.min(state.roastIndex, currentRoasts().length - 1);
  syncStateToUrl();
  renderUI();
}

function setCharacter(characterId) {
  if (!characters[characterId] || characterId === state.characterId) return;
  clearDailyContext();
  state.characterId = characterId;
  adoptHealthAwareEngine();
  state.roastIndex = Math.min(state.roastIndex, currentRoasts().length - 1);
  latestExportBlob = null;
  syncStateToUrl();
  renderUI();
}

function applyRoastMode(level, preferredIndex = state.roastIndex, { preserveEngine = false, preserveDaily = false } = {}) {
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
  const daily = dailyChallenge.generate(key);
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

function roundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth = 1) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lineWidth; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function textSegments(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return [...new Intl.Segmenter("th", { granularity: "word" }).segment(text)].map(x => x.segment);
  }
  return text.split(/(\s+)/).filter(Boolean);
}

function graphemeSegments(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return [...new Intl.Segmenter("th", { granularity: "grapheme" }).segment(text)].map(x => x.segment);
  }
  return Array.from(text);
}

function wrapLines(ctx, text, maxWidth) {
  const parts = textSegments(text);
  const lines = [];
  let line = "";

  const pushLine = value => {
    const clean = value.trim();
    if (clean) lines.push(clean);
  };

  for (const rawPart of parts) {
    let part = rawPart;

    // Thai/URL-like segments can occasionally be wider than the safe width.
    // Break those segments by grapheme so no rendered line can overflow.
    if (ctx.measureText(part).width > maxWidth) {
      pushLine(line);
      line = "";
      let chunk = "";
      for (const grapheme of graphemeSegments(part)) {
        const test = chunk + grapheme;
        if (chunk && ctx.measureText(test).width > maxWidth) {
          pushLine(chunk);
          chunk = grapheme;
        } else {
          chunk = test;
        }
      }
      line = chunk;
      continue;
    }

    const test = line + part;
    if (line && ctx.measureText(test).width > maxWidth) {
      pushLine(line);
      line = part.trimStart();
    } else {
      line = test;
    }
  }

  pushLine(line);
  return lines;
}

function drawCenteredLines(ctx, text, { centerX, firstBaselineY, maxWidth, lineHeight, maxLines }) {
  const lines = wrapLines(ctx, text, maxWidth);
  const visible = lines.slice(0, maxLines);

  // Do not rely on Canvas textAlign="center" for production Thai text.
  // iOS Safari can place the center anchor like a start/left origin in this flow.
  // Measure each rendered line and position its left edge explicitly instead.
  ctx.save();
  ctx.textAlign = "left";
  ctx.direction = "ltr";
  visible.forEach((line, index) => {
    const width = ctx.measureText(line).width;
    const x = centerX - width / 2;
    ctx.fillText(line, x, firstBaselineY + index * lineHeight);
  });
  ctx.restore();
  return visible;
}

function textVerticalMetrics(ctx, text, fallbackSize) {
  const metrics = ctx.measureText(text || "Mgก");
  return {
    ascent: metrics.actualBoundingBoxAscent || fallbackSize * 0.8,
    descent: metrics.actualBoundingBoxDescent || fallbackSize * 0.2
  };
}

function drawConditionBlock(ctx, condition, { centerX, plantBottomY, statsTopY }) {
  const regionTop = plantBottomY + 14;
  const regionBottom = statsTopY - 16;
  const titleToSubtitleGap = 10;
  const subtitleLineHeight = 30;

  ctx.font = '950 36px system-ui,-apple-system,"Segoe UI",sans-serif';
  const titleLines = wrapLines(ctx, condition.title, 700).slice(0, 1);
  const titleMetrics = textVerticalMetrics(ctx, titleLines[0], 36);

  ctx.font = '700 22px system-ui,-apple-system,"Segoe UI",sans-serif';
  const subtitleLines = wrapLines(ctx, condition.sub, 660).slice(0, 2);
  const subtitleMetrics = textVerticalMetrics(ctx, subtitleLines[0], 22);
  const subtitleHeight = subtitleMetrics.ascent + subtitleMetrics.descent
    + Math.max(0, subtitleLines.length - 1) * subtitleLineHeight;
  const blockHeight = titleMetrics.ascent + titleMetrics.descent
    + titleToSubtitleGap + subtitleHeight;
  const availableHeight = Math.max(0, regionBottom - regionTop);
  const blockTop = regionTop + Math.max(0, (availableHeight - blockHeight) / 2);
  const titleBaselineY = blockTop + titleMetrics.ascent;
  const subtitleBaselineY = titleBaselineY + titleMetrics.descent
    + titleToSubtitleGap + subtitleMetrics.ascent;

  ctx.fillStyle = condition.color;
  ctx.font = '950 36px system-ui,-apple-system,"Segoe UI",sans-serif';
  drawCenteredLines(ctx, condition.title, {
    centerX, firstBaselineY: titleBaselineY, maxWidth: 700, lineHeight: 42, maxLines: 1
  });

  ctx.fillStyle = "#64806e";
  ctx.font = '700 22px system-ui,-apple-system,"Segoe UI",sans-serif';
  drawCenteredLines(ctx, condition.sub, {
    centerX, firstBaselineY: subtitleBaselineY, maxWidth: 660, lineHeight: subtitleLineHeight, maxLines: 2
  });
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

async function drawSvgPlant(ctx, x, y, width, height, health, renderer = currentPlantRenderer()) {
  const image = await svgToImage(renderer.buildStandalone(health));
  ctx.drawImage(image, x, y, width, height);
}

function canvasBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, "image/png", 1));
}

async function renderExportCard() {
  const token = ++exportRenderToken;
  const ctx = exportCanvas.getContext("2d");
  const W = 1080, H = 1350;
  const character = currentCharacter();
  const renderer = currentPlantRenderer();
  const condition = getCondition();
  const health = state.health;
  const roast = currentRoast();

  setExportButtons(true, "⏳ PREPARING PNG...");
  setExportStatus("กำลัง render Social Card 1080×1350…");

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#efe9dc";
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 54, 54, 972, 1242, 48, "#fffaf0", "#173b2a", 7);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#2f6b45";
  ctx.font = '900 30px system-ui,-apple-system,"Segoe UI",sans-serif';
  ctx.fillText("🌱💀 UNGROW v0.0.1", 104, 122);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(23,59,42,.09)";
  ctx.font = '950 72px system-ui,-apple-system,sans-serif';
  ctx.fillText("555", 966, 128);
  const daily = currentDailyChallenge();
  if (daily) {
    ctx.fillStyle = "#c84b31";
    ctx.font = '900 22px system-ui,-apple-system,"Segoe UI",sans-serif';
    ctx.fillText(`🔥 DAILY #${String(daily.number).padStart(3, "0")}`, 966, 174);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#173b2a";
  ctx.font = '950 78px system-ui,-apple-system,"Segoe UI",sans-serif';
  ctx.fillText(character.name, 104, 218);
  ctx.fillStyle = "#64806e";
  ctx.font = '700 28px system-ui,-apple-system,"Segoe UI",sans-serif';
  ctx.fillText(character.subtitle, 108, 263);

  const cardCenterX = W / 2;
  const { plantX, plantY, plantSize } = character.exportLayout;
  const plantBottomY = plantY + plantSize;
  const statsBoxY = 835;
  await drawSvgPlant(ctx, plantX, plantY, plantSize, plantSize, health, renderer);
  if (token !== exportRenderToken) return;

  // Keep condition copy in the safe vertical region between the artwork and stats.
  drawConditionBlock(ctx, condition, {
    centerX: cardCenterX, plantBottomY, statsTopY: statsBoxY
  });

  roundRect(ctx, 104, statsBoxY, 872, 148, 28, "#f4efe4", "#d7cfbf", 3);
  ctx.textAlign = "left";
  ctx.fillStyle = "#173b2a";
  ctx.font = '850 26px system-ui,-apple-system,"Segoe UI",sans-serif';
  ctx.fillText("Plant Health", 144, 881);
  ctx.textAlign = "right";
  ctx.fillText(`${health}%`, 930, 881);
  ctx.textAlign = "left";
  roundRect(ctx, 144, 898, 786, 14, 7, "#ded7c9");
  if (health > 0) roundRect(ctx, 144, 898, 786 * health / 100, 14, 7, condition.color);
  ctx.fillText("Owner Skill", 144, 946);
  ctx.textAlign = "right";
  ctx.fillText(`${character.ownerSkill}%`, 930, 946);
  ctx.textAlign = "left";
  roundRect(ctx, 144, 960, 786, 14, 7, "#ded7c9");
  roundRect(ctx, 144, 960, 786 * character.ownerSkill / 100, 14, 7, "#c84b31");

  const roastBoxX = 104;
  const roastBoxY = 1018;
  const roastBoxW = 872;
  const roastBoxH = 190;
  const roastCenterX = roastBoxX + roastBoxW / 2;
  roundRect(ctx, roastBoxX, roastBoxY, roastBoxW, roastBoxH, 32, "#173b2a");
  ctx.fillStyle = "#fffaf0";
  ctx.font = '950 42px system-ui,-apple-system,"Segoe UI",sans-serif';
  const roastLines = wrapLines(ctx, `“${roast}”`, 700).slice(0, 3);
  const roastLineHeight = 55;
  const roastFirstBaseline = 1117 - ((roastLines.length - 1) * roastLineHeight / 2);
  drawCenteredLines(ctx, `“${roast}”`, {
    centerX: roastCenterX,
    firstBaselineY: roastFirstBaseline,
    maxWidth: 700,
    lineHeight: roastLineHeight,
    maxLines: 3
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "#2f6b45";
  ctx.font = '900 25px system-ui,-apple-system,"Segoe UI",sans-serif';
  ctx.fillText(`🏆 ${currentAward()}`, 104, 1250);
  ctx.fillStyle = "#718174";
  ctx.font = '700 18px system-ui,-apple-system,"Segoe UI",sans-serif';
  ctx.fillText(character.hashtags.join("   "), 104, 1282);

  const blob = await canvasBlob(exportCanvas);
  if (token !== exportRenderToken || !blob) return;
  latestExportBlob = blob;
  setExportButtons(false, supportsFileShare() ? "📤 SAVE / SHARE PNG" : "⬇️ DOWNLOAD PNG");
  setExportStatus(`พร้อมแล้ว · PNG 1080×1350 · Health ${health}%`);
}

function scheduleExportRender(immediate = false) {
  clearTimeout(exportTimer);
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
