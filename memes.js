// Curated reactions: match the punchline first, then its health-aware tone.
(() => {
  const catalog = Object.freeze(Object.fromEntries([
    { id: "success-kid", name: "Success Kid", file: "success-kid.jpg", caption: "ให้ผ่านหนึ่งวัน", crop: [145, 150, 315, 315] },
    { id: "fry", name: "Futurama Fry", file: "fry.jpg", caption: "ขอมองแรงแป๊บ", crop: [0, 177, 1000, 766] },
    { id: "math-lady", name: "Math Lady", file: "math-lady.jpg", caption: "กำลังประมวลผล…" },
    { id: "this-is-fine", name: "This Is Fine", file: "this-is-fine.webp", caption: "ทุกอย่างโอเคแหละ…" },
    { id: "disaster-girl", name: "Disaster Girl", file: "disaster-girl.jpg", caption: "ผลงานใครก่อน" }
  ].map(meme => [meme.id, Object.freeze({ ...meme, crop: meme.crop && Object.freeze(meme.crop), src: `assets/memes/${meme.file}` })])));

  function select({ roast = "", health = 50 } = {}) {
    const text = String(roast).toLowerCase();
    let id;
    // Whole phrases take priority: negated praise/criticism is not literal.
    if (/จริงหรือเค้ก|ที่บอกว่า.*(?:ปกติ|โอเค)|ยังจะ.*(?:ปกติ|สบายดี)|ยัง(?:ถาม|เรียก).*?(?:โอเค|ปกติ|สบายดี)/.test(text)) id = "this-is-fine";
    else if (/ทำถึงเรื่องพัง|พินาศ|ระยำ|บูดทั้งชุด|บูดมาก|เซ๊ะตุ้มเล้ง|final boss|ยับ|ลาโลก|จะตาย|วิกฤต/.test(text)) id = "disaster-girl";
    else if (/ดูแลดี|ทำดีนะ|รอบนี้เก่ง|เก่งจริง|วันนี้เก่ง|ด่าไม่ลง|เตรียมด่าไว้เก้อ|ไม่มี(?:ใบคำ|เรื่อง)ร้องเรียน|ขอชม|มอบดาว|รอบนี้.*ดีจริง|ไม่บ้งสักนิด|ไม่ใช่แค่ confidence|side-eye ไว้แล้วแต่ไม่ได้ใช้/.test(text)) id = "success-kid";
    else if (/เดา|ทดลอง|beta test|สูตร|คำนวณ|คณิต|งง|แผน/.test(text)) id = "math-lady";
    else if (/side-eye|มองแรง|red flag|ไม่ไว้ใจ|confidence|อย่าเพิ่ง|หยุดมั่น|npc|mid|เครดิตเต็ม/.test(text)) id = "fry";
    else if (/ยังไม่(?:ชิบหาย|พัง|บ้ง)|ยังพอรอด|ยังพอไหว|ยังรอด|ยังไหว/.test(text)) id = health < 40 ? "this-is-fine" : "fry";
    else if (/ชิบหาย|พัง|บ้ง|หมดหลอด|ลาออก|icu|บูด|อ่อมหนัก/.test(text)) id = "disaster-girl";
    else id = health >= 80 ? "success-kid" : health >= 60 ? "fry" : health >= 40 ? "math-lady" : health >= 20 ? "this-is-fine" : "disaster-girl";
    return catalog[id];
  }

  // Same-origin assets keep the exported canvas readable, even if a source
  // website changes its CORS headers. Only the selected reaction is loaded.
  function createImageLoader({ makeImage = () => new Image(), setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
    const cache = new Map();
    return function load(meme) {
      if (cache.has(meme.id)) return cache.get(meme.id);
      const pending = new Promise((resolve, reject) => {
        const image = makeImage();
        let timer;
        const finish = error => {
          clearTimer(timer);
          image.onload = image.onerror = null;
          if (error) reject(error); else resolve(image);
        };
        image.onload = () => finish(image.naturalWidth ? null : new Error("Empty meme image"));
        image.onerror = () => finish(new Error("Meme image failed to load"));
        timer = setTimer(() => finish(new Error("Meme image timed out")), 10000);
        image.src = meme.src;
      });
      cache.set(meme.id, pending);
      pending.catch(() => { if (cache.get(meme.id) === pending) cache.delete(meme.id); });
      return pending;
    };
  }

  window.UngrowMemes = Object.freeze({ catalog, select, createImageLoader });
})();
