const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const context = vm.createContext({ window: {}, setTimeout, clearTimeout });
vm.runInContext(fs.readFileSync(path.join(root, "memes.js"), "utf8"), context);
const memes = context.window.UngrowMemes;

test("reactions follow the punchline, including sarcasm and negation, at the same Health", () => {
  const cases = [
    ["วันนี้มึงทำดีนะ กูเขียวจนหาเรื่องด่าไม่ลง", "success-kid"],
    ["ทำถึงเรื่องพังแล้ว ช่วยทำถึงเรื่องแก้บ้าง", "disaster-girl"],
    ["จริงหรือเค้กคะที่บอกว่าดิฉันยังโอเค", "this-is-fine"],
    ["ดิฉันแทบลาโลกแล้วค่ะ ยังจะเรียกว่าปกติอีกเหรอคะ", "this-is-fine"],
    ["สุขภาพต่ำแล้วครับ กรุณาหยุดเดาและเริ่มแก้ปัญหา", "math-lady"],
    ["คุณน้าคะ ยังสวยอยู่ แต่ดิฉันเริ่มมี side-eye แล้ว", "fry"],
    ["Owner Skill มีของนะคะ รอบนี้ไม่บ้งสักนิด", "success-kid"],
    ["ทำถึงค่ะ ดิฉันเตรียม side-eye ไว้แล้วแต่ไม่ได้ใช้", "success-kid"],
    ["จึ้งอยู่ รอบนี้เจ้าของมีของจริงไม่ใช่แค่ Confidence", "success-kid"],
    ["ยังไม่ชิบหายครับ แต่แม่งเริ่มเสียวแล้วนะ", "fry"]
  ];
  for (const [roast, expected] of cases) assert.equal(memes.select({ roast, health: 65 }).id, expected, roast);
});

test("unmatched wording uses tone; every selected asset is bundled under the app", () => {
  for (const [health, id] of [[100,"success-kid"],[65,"fry"],[50,"math-lady"],[30,"this-is-fine"],[0,"disaster-girl"]]) {
    assert.equal(memes.select({ roast: "", health }).id, id);
  }
  for (const meme of Object.values(memes.catalog)) {
    assert.match(meme.src, /^assets\/memes\/[\w-]+\.(jpg|webp)$/);
    assert.ok(fs.statSync(path.join(root, meme.src)).size > 1000, meme.src);
  }
});

test("all current and legacy roasts select reproducibly without randomness", () => {
  for (const file of ["characters.js", "roast-matrix.js", "roast-modes.js"]) vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
  for (const [id, character] of Object.entries(context.window.UngrowCharacters)) {
    const quotes = [...Object.values(context.window.UngrowRoastMatrix.matrix[id]).flatMap(m => Object.values(m).flat()), ...character.roasts, ...[1,2,3,4].flatMap(l => context.window.UngrowRoastModes.examplesFor(id,l))];
    for (const roast of quotes) {
      const state = { roast, health: 50 };
      assert.equal(memes.select(state), memes.select(JSON.parse(JSON.stringify(state))));
      assert.ok(memes.select(state).name);
    }
  }
});

test("image loading deduplicates work, times out, and allows retry after failure", async () => {
  const images = [], timers = new Map();
  let nextTimer = 0;
  const load = memes.createImageLoader({
    makeImage: () => { const image = { naturalWidth: 500 }; images.push(image); return image; },
    setTimer: fn => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimer: id => timers.delete(id)
  });
  const meme = memes.catalog.fry;
  const first = load(meme);
  assert.equal(load(meme), first);
  assert.equal(images[0].src, meme.src);
  images[0].onerror();
  await assert.rejects(first, /failed to load/);
  const retry = load(meme);
  assert.notEqual(retry, first);
  [...timers.values()][0]();
  await assert.rejects(retry, /timed out/);
  const success = load(meme);
  images[2].onload();
  assert.equal(await success, images[2]);
  assert.equal(load(meme), success);
  assert.equal(timers.size, 0);
});
