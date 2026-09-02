const roasts = [
  "กูรอดเอง ไม่ต้องเคลมผลงาน",
  "เจ้าของ Skill 12% แต่ Confidence 97%",
  "ธรรมชาติสร้างกูมาแข็งแรง เผื่อเจอเจ้าของแบบมึง",
  "KPI วันนี้: เอาตัวรอดจากเจ้าของ",
  "วันนี้ยังไม่ตาย ผิดแผนนิดหน่อย",
  "กูเป็นต้นไม้ ไม่ใช่โปรเจกต์ทดลอง",
  "ไม่ต้องห่วงกู ห่วงต้นถัดไปก่อน",
  "ถ้าจะลืมกันขนาดนี้ ซื้อก้อนหินน่าจะเหมาะกว่า",
  "ผ่านมาเยอะ เจอฝ่ายบริหารแบบนี้ก็เพิ่งเคย",
  "รอดมาได้ไม่ใช่เพราะเจ้าของ แต่เพราะพันธุกรรม"
];

const roastEl = document.querySelector("#roast");
const roastButton = document.querySelector("#roastButton");
const shameButton = document.querySelector("#shameButton");
const sharePanel = document.querySelector("#sharePanel");
const shareCanvas = document.querySelector("#shareCanvas");
const downloadButton = document.querySelector("#downloadButton");
const healthSlider = document.querySelector("#healthSlider");
const healthReadout = document.querySelector("#healthReadout");
const damageCaption = document.querySelector("#damageCaption");
const shamePlant = document.querySelector("#shamePlant");
const conditionTitle = document.querySelector("#conditionTitle");
const conditionSub = document.querySelector("#conditionSub");
const mainHealthValue = document.querySelector("#mainHealthValue");
const mainHealthBar = document.querySelector("#mainHealthBar");
const cardHealthValue = document.querySelector("#cardHealthValue");
const cardHealthBar = document.querySelector("#cardHealthBar");
const cardRoast = document.querySelector("#cardRoast");

let lastIndex = roasts.length - 1;
let currentRoast = roasts[lastIndex];
let plantHealth = 89;

const conditions = [
  { min: 90, className: "healthy", title: "ยังปากดีอยู่", sub: "สุขภาพยังดี เลยยังมีแรงด่าเจ้าของ", color: "#2f6b45" },
  { min: 75, className: "tired", title: "เริ่มช้ำใจ", sub: "มีแผลนิดหน่อย แต่ยังมีแรงด่าเจ้าของ", color: "#6c8f49" },
  { min: 60, className: "bruised", title: "โทรมแต่ยังเถียงไหว", sub: "ขอบตาดำ ใบเริ่มตก และหมดศรัทธาในฝ่ายบริหาร", color: "#9a873c" },
  { min: 40, className: "sick", title: "ป่วยแต่ยังไม่ยอมไป", sub: "อมปรอทแล้ว แต่ยังอยู่เพราะพันธุกรรมล้วน ๆ", color: "#c77935" },
  { min: 20, className: "critical", title: "เข้า ICU ต้นไม้", sub: "เฝือกมา กระถางร้าวแล้ว กรุณาหยุดดูแลเพิ่ม", color: "#c84b31" },
  { min: 1, className: "disaster", title: "ยับแบบมีตำนาน", sub: "แมลงวันเริ่มมา แต่เจ้าของยัง Confidence 97%", color: "#8f3f36" },
  { min: 0, className: "heaven", title: "ลาออกจากโลกพฤกษศาสตร์", sub: "RIP SOMCHAI — ผู้เสียหายจากการบริหาร", color: "#493551" }
];

function getCondition(health) {
  return conditions.find(item => health >= item.min) || conditions[conditions.length - 1];
}

function nextRoast() {
  let index = lastIndex;
  while (index === lastIndex && roasts.length > 1) index = Math.floor(Math.random() * roasts.length);
  lastIndex = index;
  currentRoast = roasts[index];
  roastEl.textContent = `“${currentRoast}”`;
  cardRoast.textContent = `“${currentRoast}”`;
  if (!sharePanel.hidden) renderShareCard();
}

function updateHealth(nextHealth) {
  plantHealth = Math.max(0, Math.min(100, Number(nextHealth)));
  const condition = getCondition(plantHealth);
  const value = `${plantHealth}%`;
  healthReadout.textContent = value;
  mainHealthValue.textContent = value;
  cardHealthValue.textContent = value;
  mainHealthBar.style.width = value;
  cardHealthBar.style.width = value;
  mainHealthBar.style.background = condition.color;
  cardHealthBar.style.background = condition.color;
  shamePlant.className = `shame-plant ${condition.className}`;
  conditionTitle.textContent = condition.title;
  conditionSub.textContent = condition.sub;
  damageCaption.textContent = `${condition.title} — ${condition.sub}`;
  if (!sharePanel.hidden) renderShareCard();
}

function roundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lineWidth; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function wrappedLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawLeaf(ctx, x, y, height, angle, health) {
  const fade = health <= 19 ? "#526247" : health <= 39 ? "#58744d" : health <= 59 ? "#668653" : "#3e7a50";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle * Math.PI / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-28, -height * .28, -21, -height * .76, 0, -height);
  ctx.bezierCurveTo(25, -height * .73, 27, -height * .28, 0, 0);
  ctx.closePath();
  ctx.fillStyle = fade;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#173b2a";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(0, -height + 18);
  ctx.lineWidth = 6;
  ctx.strokeStyle = health <= 39 ? "#8c9b58" : "#b7d874";
  ctx.stroke();
  for (let i = 1; i < 6; i++) {
    const yy = -height * (i / 7);
    ctx.beginPath();
    ctx.moveTo(-16, yy);
    ctx.lineTo(16, yy - 7);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(23,59,42,.55)";
    ctx.stroke();
  }
  ctx.restore();
}

function drawAfflictedPlant(ctx, cx, baseY, health) {
  const condition = getCondition(health);
  let droop = 0;
  if (health < 75) droop = 8;
  if (health < 60) droop = 16;
  if (health < 40) droop = 27;
  if (health < 20) droop = 38;
  if (health === 0) droop = 44;
  const leaves = [
    { h: 150, a: -30 - droop * .65, x: -16 },
    { h: 205, a: -12 - droop * .38, x: -8 },
    { h: 235 - droop, a: 2 - droop * .1, x: 0 },
    { h: 192, a: 16 + droop * .42, x: 8 },
    { h: 150, a: 31 + droop * .68, x: 16 }
  ];
  leaves.forEach(leaf => drawLeaf(ctx, cx + leaf.x, baseY - 72, leaf.h, leaf.a, health));
  roundRect(ctx, cx - 92, baseY - 82, 184, 110, 20, "#d9c7a9", "#173b2a", 6);
  ctx.fillStyle = "#173b2a";
  ctx.textAlign = "center";
  ctx.font = '950 22px system-ui, -apple-system, sans-serif';
  ctx.fillText("SOMCHAI", cx, baseY - 36);
  ctx.font = '800 10px system-ui, -apple-system, sans-serif';
  ctx.fillText(health <= 39 ? "STILL ALIVE. SOMEHOW." : "STILL JUDGING.", cx, baseY - 16);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#173b2a";
  ctx.beginPath(); ctx.arc(cx - 22, baseY - 116, 10, .15 * Math.PI, .85 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 22, baseY - 116, 10, .15 * Math.PI, .85 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 13, baseY - 89); ctx.lineTo(cx + 13, baseY - 89); ctx.stroke();
  if (health < 75) {
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = "left";
    ctx.fillText("🩹", cx - 95, baseY - 154);
    ctx.fillText("💧", cx + 69, baseY - 151);
  }
  if (health < 60) {
    ctx.fillStyle = "rgba(73,53,81,.38)";
    ctx.beginPath(); ctx.ellipse(cx - 22, baseY - 105, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 22, baseY - 105, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (health < 40) {
    ctx.font = '38px system-ui, -apple-system, sans-serif';
    ctx.fillText("🌡️", cx + 16, baseY - 108);
    ctx.save();
    ctx.translate(cx + 58, baseY - 180);
    ctx.rotate(.45);
    roundRect(ctx, -16, -38, 32, 76, 8, "#f7f2e8", "#173b2a", 4);
    for (let y = -27; y <= 27; y += 16) { ctx.beginPath(); ctx.moveTo(-13, y); ctx.lineTo(13, y); ctx.stroke(); }
    ctx.restore();
  }
  if (health < 20) {
    ctx.font = '30px system-ui, -apple-system, sans-serif';
    ctx.fillText("💫", cx + 80, baseY - 220);
    ctx.fillText("🪰", cx - 115, baseY - 205);
    ctx.fillText("🪰", cx + 105, baseY - 245);
    ctx.strokeStyle = "#173b2a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx + 52, baseY - 60); ctx.lineTo(cx + 42, baseY - 40); ctx.lineTo(cx + 58, baseY - 25); ctx.lineTo(cx + 45, baseY - 5); ctx.stroke();
  }
  if (health === 0) {
    ctx.font = '46px system-ui, -apple-system, sans-serif';
    ctx.fillText("😇", cx - 25, baseY - 275);
    ctx.fillText("☠️", cx + 75, baseY - 100);
  }
  ctx.textAlign = "left";
  return condition;
}

function renderShareCard() {
  const ctx = shareCanvas.getContext("2d");
  const W = shareCanvas.width;
  const H = shareCanvas.height;
  const condition = getCondition(plantHealth);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#efe9dc";
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 54, 54, W - 108, H - 108, 46, "#fffaf0", "#173b2a", 7);
  ctx.font = '900 30px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#2f6b45";
  ctx.fillText("🌱💀 UNGROW v0.0.1", 105, 125);
  ctx.font = '950 76px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#173b2a";
  ctx.fillText("SOMCHAI", 105, 218);
  ctx.font = '700 29px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#64806e";
  ctx.fillText("Snake Plant · Stoic Introvert", 108, 264);
  drawAfflictedPlant(ctx, 540, 600, plantHealth);
  roundRect(ctx, 710, 350, 275, 170, 26, "#f4efe4", "#d7cfbf", 3);
  ctx.fillStyle = condition.color;
  ctx.font = '950 28px system-ui, -apple-system, sans-serif';
  const titleLines = wrappedLines(ctx, condition.title, 230);
  titleLines.forEach((line, i) => ctx.fillText(line, 735, 402 + i * 36));
  ctx.fillStyle = "#64806e";
  ctx.font = '700 18px system-ui, -apple-system, sans-serif';
  const subLines = wrappedLines(ctx, condition.sub, 230);
  subLines.slice(0, 3).forEach((line, i) => ctx.fillText(line, 735, 458 + i * 25));
  roundRect(ctx, 105, 670, 870, 160, 28, "#f4efe4", "#d7cfbf", 3);
  ctx.font = '800 28px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#173b2a";
  ctx.fillText("Plant Health", 145, 720);
  ctx.textAlign = "right"; ctx.fillText(`${plantHealth}%`, 925, 720); ctx.textAlign = "left";
  roundRect(ctx, 145, 742, 780, 16, 8, "#ded7c9");
  if (plantHealth > 0) roundRect(ctx, 145, 742, 780 * (plantHealth / 100), 16, 8, condition.color);
  ctx.fillText("Owner Skill", 145, 790);
  ctx.textAlign = "right"; ctx.fillText("21%", 925, 790); ctx.textAlign = "left";
  roundRect(ctx, 145, 806, 780, 16, 8, "#ded7c9");
  roundRect(ctx, 145, 806, 164, 16, 8, "#c84b31");
  roundRect(ctx, 105, 865, 870, 260, 34, "#173b2a");
  ctx.fillStyle = "#fffaf0";
  ctx.font = '950 46px system-ui, -apple-system, sans-serif';
  const lines = wrappedLines(ctx, `“${currentRoast}”`, 760);
  const lineHeight = 64;
  const total = lines.length * lineHeight;
  let y = 865 + (260 - total) / 2 + 42;
  lines.forEach(line => { ctx.fillText(line, 155, y); y += lineHeight; });
  ctx.font = '900 29px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#2f6b45";
  ctx.fillText("🏆 เจ้าของที่ต้นไม้ไม่เคยร้องขอ", 105, 1190);
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#718174";
  ctx.fillText("#Ungrow   #PlantRoast   #SnakePlant", 105, 1240);
  ctx.fillText("Open Source · github.com/kinatoshi99/ungrow", 105, 1280);
  ctx.font = '950 72px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "rgba(23,59,42,.08)";
  ctx.textAlign = "right"; ctx.fillText("555", 950, 1290); ctx.textAlign = "left";
}

function showShame() {
  cardRoast.textContent = `“${currentRoast}”`;
  updateHealth(plantHealth);
  renderShareCard();
  sharePanel.hidden = false;
  sharePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function downloadCard() {
  renderShareCard();
  const link = document.createElement("a");
  link.download = `ungrow-somchai-health-${plantHealth}.png`;
  link.href = shareCanvas.toDataURL("image/png");
  link.click();
}

roastButton.addEventListener("click", nextRoast);
shameButton.addEventListener("click", showShame);
downloadButton.addEventListener("click", downloadCard);
healthSlider.addEventListener("input", event => updateHealth(event.target.value));
updateHealth(plantHealth);
