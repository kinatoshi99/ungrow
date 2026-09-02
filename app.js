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
const button = document.querySelector("#roastButton");
let lastIndex = roasts.length - 1;

function nextRoast() {
  let index = lastIndex;
  while (index === lastIndex && roasts.length > 1) {
    index = Math.floor(Math.random() * roasts.length);
  }
  lastIndex = index;
  roastEl.textContent = `“${roasts[index]}”`;
}

button.addEventListener("click", nextRoast);
