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

let lastIndex = roasts.length - 1;
let currentRoast = roasts[lastIndex];

function nextRoast() {
  let index = lastIndex;
  while (index === lastIndex && roasts.length > 1) {
    index = Math.floor(Math.random() * roasts.length);
  }
  lastIndex = index;
  currentRoast = roasts[index];
  roastEl.textContent = `“${currentRoast}”`;
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
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function renderShareCard() {
  const ctx = shareCanvas.getContext("2d");
  const W = shareCanvas.width;
  const H = shareCanvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#efe9dc";
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 54, 54, W - 108, H - 108, 46, "#fffaf0", "#173b2a", 7);

  ctx.font = '900 30px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#2f6b45";
  ctx.fillText("🌱💀 UNGROW v0.0.1", 105, 135);

  ctx.font = '950 78px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#173b2a";
  ctx.fillText("SOMCHAI", 105, 245);
  ctx.font = '700 32px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#64806e";
  ctx.fillText("Snake Plant · Stoic Introvert", 108, 298);

  roundRect(ctx, 105, 350, 870, 190, 28, "#f4efe4", "#d7cfbf", 3);
  ctx.font = '800 31px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#173b2a";
  ctx.fillText("Plant Health", 145, 410);
  ctx.textAlign = "right";
  ctx.fillText("89%", 925, 410);
  ctx.textAlign = "left";
  roundRect(ctx, 145, 435, 780, 18, 9, "#ded7c9");
  roundRect(ctx, 145, 435, 694, 18, 9, "#2f6b45");
  ctx.fillText("Owner Skill", 145, 495);
  ctx.textAlign = "right";
  ctx.fillText("21%", 925, 495);
  ctx.textAlign = "left";
  roundRect(ctx, 145, 515, 780, 18, 9, "#ded7c9");
  roundRect(ctx, 145, 515, 164, 18, 9, "#c84b31");

  roundRect(ctx, 105, 600, 870, 390, 34, "#173b2a");
  ctx.fillStyle = "#fffaf0";
  ctx.font = '950 52px system-ui, -apple-system, sans-serif';
  const lines = wrappedLines(ctx, `“${currentRoast}”`, 760);
  const lineHeight = 78;
  const total = lines.length * lineHeight;
  let y = 600 + (390 - total) / 2 + 54;
  lines.forEach(line => { ctx.fillText(line, 155, y); y += lineHeight; });

  ctx.font = '900 32px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#2f6b45";
  ctx.fillText("🏆 เจ้าของที่ต้นไม้ไม่เคยร้องขอ", 105, 1080);
  ctx.font = '700 25px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#718174";
  ctx.fillText("#Ungrow   #PlantRoast   #SnakePlant", 105, 1140);
  ctx.fillText("Open Source · github.com/kinatoshi99/ungrow", 105, 1190);

  ctx.font = '950 80px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "rgba(23,59,42,.08)";
  ctx.textAlign = "right";
  ctx.fillText("555", 950, 1280);
  ctx.textAlign = "left";
}

function showShame() {
  renderShareCard();
  sharePanel.hidden = false;
  sharePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function downloadCard() {
  renderShareCard();
  const link = document.createElement("a");
  link.download = "ungrow-somchai-shame-card.png";
  link.href = shareCanvas.toDataURL("image/png");
  link.click();
}

roastButton.addEventListener("click", nextRoast);
shameButton.addEventListener("click", showShame);
downloadButton.addEventListener("click", downloadCard);
