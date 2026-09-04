const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadEngine() {
  const sandbox = { window: {}, Intl, Date, Math, Object, Number, String };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "..", "resignation.js"), "utf8"),
    sandbox,
    { filename: "resignation.js" }
  );
  return sandbox.window.UngrowResignation;
}

const engine = loadEngine();
const character = { id: "somchai", name: "SOMCHAI", plant: "Snake Plant" };

test("health thresholds map to expected resignation modes", () => {
  assert.equal(engine.getMode(100).id, "complaint");
  assert.equal(engine.getMode(80).id, "complaint");
  assert.equal(engine.getMode(71).id, "complaint");
  assert.equal(engine.getMode(70).id, "warning");
  assert.equal(engine.getMode(41).id, "warning");
  assert.equal(engine.getMode(40).id, "resignation");
  assert.equal(engine.getMode(21).id, "resignation");
  assert.equal(engine.getMode(20).id, "immediate");
  assert.equal(engine.getMode(15).id, "immediate");
  assert.equal(engine.getMode(0).id, "immediate");
});

test("80, 40 and 15 health produce visibly different outputs", () => {
  const date = new Date("2026-09-04T05:00:00Z");
  const high = engine.generate({ character, health: 80, iteration: 0, date });
  const mid = engine.generate({ character, health: 40, iteration: 0, date });
  const low = engine.generate({ character, health: 15, iteration: 0, date });
  assert.equal(high.mode.status, "COMPLAINT");
  assert.equal(mid.mode.status, "RESIGNED");
  assert.equal(low.mode.status, "EFFECTIVE IMMEDIATELY");
  assert.notEqual(high.roast, mid.roast);
  assert.notEqual(mid.effective, low.effective);
});

test("generate again changes copy but is deterministic for the same iteration", () => {
  const date = new Date("2026-09-04T05:00:00Z");
  const first = engine.generate({ character, health: 40, iteration: 0, date });
  const again = engine.generate({ character, health: 40, iteration: 1, date });
  const replay = engine.generate({ character, health: 40, iteration: 1, date });
  assert.notEqual(first.id, again.id);
  assert.deepEqual(again, replay);
});

test("share text includes plant identity and health", () => {
  const letter = engine.generate({
    character,
    health: 15,
    iteration: 2,
    date: new Date("2026-09-04T05:00:00Z")
  });
  const text = engine.shareText(letter);
  assert.match(text, /SOMCHAI/);
  assert.match(text, /Plant Health 15%/);
  assert.match(text, /EFFECTIVE IMMEDIATELY/);
});
