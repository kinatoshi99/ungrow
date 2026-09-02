const characters = window.UngrowCharacters;
const plantRenderers = {
  somchai: window.UngrowPlantSvg,
  ploy: window.UngrowPloySvg
};

const state = {
  characterId: "somchai",
  health: 89,
  roastIndex: characters.somchai.roasts.length - 1
};
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
function currentRoast() {
  const roasts = currentCharacter().roasts;
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
  qsa("[data-owner-skill-value]").forEach(el => { el.textContent = ownerSkillText; });
  qsa("[data-owner-skill-bar]").forEach(el => { el.style.width = ownerSkillText; });
  qsa("[data-health-value]").forEach(el => { el.textContent = healthText; });
  qsa("[data-health-slider]").forEach(el => { if (Number(el.value) !== state.health) el.value = state.health; });
  qsa("[data-health-bar]").forEach(el => { el.style.width = healthText; el.style.background = condition.color; });
  qsa("[data-condition-title]").forEach(el => { el.textContent = condition.title; el.style.color = condition.color; });
  qsa("[data-condition-sub]").forEach(el => { el.textContent = condition.sub; });
  qsa("[data-roast]").forEach(el => { el.textContent = `“${currentRoast()}”`; });
  qsa("[data-plant-svg]").forEach(svg => renderer.render(svg, state.health));

  qsa("[data-export-summary]").forEach(el => { el.textContent = `${character.name} · Health ${healthText} · ${condition.title}`; });
  if (activeExportLab && !activeExportLab.hidden) scheduleExportRender();
}

function setHealth(value) {
  state.health = Math.max(0, Math.min(100, Number(value)));
  renderUI();
}

function setCharacter(characterId) {
  if (!characters[characterId] || characterId === state.characterId) return;
  state.characterId = characterId;
  state.roastIndex = Math.min(state.roastIndex, currentCharacter().roasts.length - 1);
  latestExportBlob = null;
  renderUI();
}

function nextRoast() {
  const roasts = currentCharacter().roasts;
  let next = state.roastIndex;
  while (next === state.roastIndex && roasts.length > 1) next = Math.floor(Math.random() * roasts.length);
  state.roastIndex = next;
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
  const filename = `ungrow-${character.id}-health-${state.health}.png`;
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

qsa("[data-character-id]").forEach(button => button.addEventListener("click", () => setCharacter(button.dataset.characterId)));
qsa("[data-health-slider]").forEach(slider => slider.addEventListener("input", e => setHealth(e.target.value)));
qsa('[data-action="roast"]').forEach(button => button.addEventListener("click", nextRoast));
qsa('[data-action="shame"]').forEach(button => button.addEventListener("click", showExportLab));
qsa('[data-action="save-export"]').forEach(button => button.addEventListener("click", saveExport));
qsa('[data-action="close-export"]').forEach(button => button.addEventListener("click", closeExportLab));
mobileViewport.addEventListener?.("change", () => {
  if (activeExportLab) syncExportContext({ scroll: false });
});

renderUI();
