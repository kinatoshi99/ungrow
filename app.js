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

const conditions = [
  { min: 90, key: "healthy", title: "ยังปากดีอยู่", sub: "สุขภาพยังดี เลยยังมีแรงด่าเจ้าของ", color: "#2f6b45" },
  { min: 75, key: "tired", title: "เริ่มช้ำใจ", sub: "มีแผลนิดหน่อย แต่ยังมีแรงด่าเจ้าของ", color: "#6c8f49" },
  { min: 60, key: "bruised", title: "โทรมแต่ยังเถียงไหว", sub: "ขอบตาดำ ใบเริ่มตก และหมดศรัทธาในฝ่ายบริหาร", color: "#9a873c" },
  { min: 40, key: "sick", title: "ป่วยแต่ยังไม่ยอมไป", sub: "ติดปรอทกับใบแล้ว แต่ยังอยู่เพราะพันธุกรรมล้วน ๆ", color: "#c77935" },
  { min: 20, key: "critical", title: "เข้า ICU ต้นไม้", sub: "เฝือกมา กระถางร้าวแล้ว กรุณาหยุดดูแลเพิ่ม", color: "#c84b31" },
  { min: 1, key: "disaster", title: "ยับแบบมีตำนาน", sub: "แมลงวันเริ่มมา แต่เจ้าของยัง Confidence 97%", color: "#8f3f36" },
  { min: 0, key: "heaven", title: "ลาออกจากโลกพฤกษศาสตร์", sub: "RIP SOMCHAI — ผู้เสียหายจากการบริหาร", color: "#493551" }
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
const shameSvg = document.querySelector("#shameSvg");
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
  conditionTitle.textContent = condition.title;
  conditionTitle.style.color = condition.color;
  conditionSub.textContent = condition.sub;
  damageCaption.textContent = `${condition.title} — ${condition.sub}`;

  window.UngrowPlantSvg.render(shameSvg, plantHealth);
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

function svgToImage(svgMarkup) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = error => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    image.src = url;
  });
}

async function drawSvgPlant(ctx, x, y, width, height, health) {
  const markup = window.UngrowPlantSvg.buildStandalone(health);
  const image = await svgToImage(markup);
  ctx.drawImage(image, x, y, width, height);
}

async function renderShareCard() {
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

  await drawSvgPlant(ctx, 285, 270, 430, 430, plantHealth);

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
  ctx.textAlign = "right";
  ctx.fillText(`${plantHealth}%`, 925, 720);
  ctx.textAlign = "left";
  roundRect(ctx, 145, 742, 780, 16, 8, "#ded7c9");
  if (plantHealth > 0) roundRect(ctx, 145, 742, 780 * (plantHealth / 100), 16, 8, condition.color);

  ctx.fillText("Owner Skill", 145, 790);
  ctx.textAlign = "right";
  ctx.fillText("21%", 925, 790);
  ctx.textAlign = "left";
  roundRect(ctx, 145, 806, 780, 16, 8, "#ded7c9");
  roundRect(ctx, 145, 806, 164, 16, 8, "#c84b31");

  roundRect(ctx, 105, 865, 870, 260, 34, "#173b2a");
  ctx.fillStyle = "#fffaf0";
  ctx.font = '950 46px system-ui, -apple-system, sans-serif';
  const lines = wrappedLines(ctx, `“${currentRoast}”`, 760);
  const lineHeight = 64;
  const total = lines.length * lineHeight;
  let y = 865 + (260 - total) / 2 + 42;
  lines.forEach(line => {
    ctx.fillText(line, 155, y);
    y += lineHeight;
  });

  ctx.font = '900 29px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#2f6b45";
  ctx.fillText("🏆 เจ้าของที่ต้นไม้ไม่เคยร้องขอ", 105, 1190);
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "#718174";
  ctx.fillText("#Ungrow   #PlantRoast   #SnakePlant", 105, 1240);
  ctx.fillText("Open Source · github.com/kinatoshi99/ungrow", 105, 1280);
  ctx.font = '950 72px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = "rgba(23,59,42,.08)";
  ctx.textAlign = "right";
  ctx.fillText("555", 950, 1290);
  ctx.textAlign = "left";
}

function showShame() {
  cardRoast.textContent = `“${currentRoast}”`;
  updateHealth(plantHealth);
  sharePanel.hidden = false;
  sharePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("PNG export failed"));
    }, "image/png", 1);
  });
}

function canSharePngFile(file) {
  if (!navigator.share) return false;
  if (!navigator.canShare) return true;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function fallbackDownload(file, filename) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

async function downloadCard() {
  downloadButton.disabled = true;
  const originalText = downloadButton.textContent;
  downloadButton.textContent = "⏳ PREPARING PNG...";

  try {
    await renderShareCard();

    const filename = `ungrow-somchai-health-${plantHealth}.png`;
    const blob = await canvasToPngBlob(shareCanvas);
    const file = new File([blob], filename, { type: "image/png" });

    if (canSharePngFile(file)) {
      downloadButton.textContent = "📤 OPENING SHARE...";
      try {
        await navigator.share({
          files: [file],
          title: "Ungrow — SOMCHAI",
          text: `SOMCHAI Plant Health ${plantHealth}% 🌱💀`
        });
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    fallbackDownload(file, filename);
  } catch (error) {
    console.error("Could not save Ungrow PNG", error);
    alert("บันทึกรูปไม่สำเร็จ ลองเปิดใน Safari แล้วกดอีกครั้งครับ");
  } finally {
    downloadButton.disabled = false;
    downloadButton.textContent = originalText;
  }
}

roastButton.addEventListener("click", nextRoast);
shameButton.addEventListener("click", showShame);
downloadButton.addEventListener("click", downloadCard);
healthSlider.addEventListener("input", event => updateHealth(event.target.value));

if (navigator.share) {
  downloadButton.textContent = "📤 SAVE / SHARE PNG";
}

updateHealth(plantHealth);
