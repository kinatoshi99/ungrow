const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const context = vm.createContext({ window: {}, Math, Number, Object, String });
vm.runInContext(fs.readFileSync(path.join(root, "shame-reactions.js"), "utf8"), context);
const reactions = context.window.UngrowShameReactions;

test("core shame pack contains the 12 paper-cut concepts", () => {
  assert.equal(reactions.count, 12);
  for (const id of [
    "mugshot","judging","slowclap","teasip","confused","whisper",
    "chaos","megaphone","thisisfine","deadinside","resignation","survivor"
  ]) {
    assert.ok(reactions.catalog[id], id);
    assert.ok(reactions.catalog[id].name);
    assert.ok(reactions.catalog[id].hook);
  }
});

test("health bands move from judgment into critical reactions", () => {
  assert.equal(reactions.bandFor(95), "excellent");
  assert.equal(reactions.bandFor(75), "good");
  assert.equal(reactions.bandFor(50), "warning");
  assert.equal(reactions.bandFor(30), "bad");
  assert.equal(reactions.bandFor(15), "emergency");
  assert.equal(reactions.bandFor(5), "critical");
});

test("reaction selection is deterministic for shareable state", () => {
  const state = { health: 36, characterId: "somchai", roastMode: 3, roastIndex: 2, dailyKey: "2026-09-04" };
  assert.equal(reactions.select(state).id, reactions.select({ ...state }).id);
});

test("critical shame states get appropriately severe art", () => {
  assert.equal(reactions.select({ health: 0, characterId: "somchai", roastMode: 2 }).id, "deadinside");
  assert.equal(reactions.select({ health: 8, characterId: "somchai", roastMode: 3 }).id, "resignation");
});

test("social card and app are wired to the shame reaction engine", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const card = fs.readFileSync(path.join(root, "social-card.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(app, /currentShameReaction/);
  assert.match(app, /UngrowShameReactions\.select/);
  assert.match(card, /UngrowShameReactions\.draw/);
  assert.match(html, /shame-reactions\.js\?v=shame1/);
});
