const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const context = vm.createContext({ window: {}, setTimeout, clearTimeout });
vm.runInContext(fs.readFileSync(path.join(root, "memes.js"), "utf8"), context);
const memes = context.window.UngrowMemes;

test("health bands select the matching meme intent", () => {
  const cases = [[89,"praise"],[70,"sideEye"],[50,"concerned"],[30,"hard"],[10,"disaster"]];
  for (const [health, intent] of cases) {
    const meme = memes.select({ health, characterId: "somchai", roastMode: 2, roastIndex: 1 });
    assert.equal(memes.intentFor(health), intent);
    assert.equal(meme.intent, intent);
    assert.ok(memes.pools[intent].some(item => item.id === meme.id));
  }
});
test("catalog contains 15 bundled original SVG stickers, three per intent", () => {
  assert.equal(memes.count, 15);
  for (const intent of ["praise","sideEye","concerned","hard","disaster"]) {
    assert.equal(memes.pools[intent].length, 3, intent);
  }
  for (const meme of Object.values(memes.catalog)) {
    assert.match(meme.src, /^assets\/memes\/(praise|sideEye|concerned|hard|disaster)\/[\w-]+\.svg$/);
    assert.ok(fs.statSync(path.join(root, meme.src)).size > 300, meme.src);
    assert.match(meme.alt, /^Original /);
  }
});

test("selection is deterministic for shared and Daily state", () => {
  const states = [
    { health: 89, characterId: "somchai", roastMode: 2, roastIndex: 0 },
    { health: 70, characterId: "ploy", roastMode: 3, roastIndex: 2 },
    { health: 30, characterId: "somchai", roastMode: 1, roastIndex: 1, dailyKey: "2026-09-03" },
    { health: 10, character: { id: "ploy" }, roastMode: 2, roastIndex: 2, daily: { key: "2026-09-04" } }
  ];
  for (const state of states) {
    assert.equal(memes.select(state).id, memes.select(JSON.parse(JSON.stringify(state))).id);
  }
});
test("image loading deduplicates work, times out, and allows retry after failure", async () => {
  const images = [], timers = new Map();
  let nextTimer = 0;
  const load = memes.createImageLoader({
    makeImage: () => { const image = { naturalWidth: 200 }; images.push(image); return image; },
    setTimer: fn => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimer: id => timers.delete(id)
  });
  const meme = memes.catalog["side-eye"];
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
