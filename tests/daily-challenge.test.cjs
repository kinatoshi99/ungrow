const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));

// Minimal UI test double: load the real markup/scripts and exercise their
// event handlers. These tests cover state and URLs, not browser layout or PNGs.
function loadApp(search = "", mobile = false) {
  const elements = [...html.matchAll(/<(\w+)\b([^>]*)>/g)].map(([, tag, source]) => {
    const attributes = Object.fromEntries([...source.matchAll(/([\w-]+)(?:="([^"]*)")?/g)]
      .map(([, key, value]) => [key, value ?? ""]));
    const handlers = {};
    return {
      tag, attributes, style: {}, textContent: "", innerHTML: "",
      hidden: "hidden" in attributes, value: attributes.value, checked: false,
      dataset: Object.fromEntries(Object.entries(attributes)
        .filter(([key]) => key.startsWith("data-"))
        .map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), value])),
      setAttribute(key, value) { attributes[key] = value; },
      removeAttribute(key) { delete attributes[key]; },
      addEventListener(type, handler) { (handlers[type] ||= []).push(handler); },
      fire(type) { (handlers[type] || []).forEach(handler => handler({ target: this, preventDefault() {} })); },
      showModal() { this.open = true; },
      close() { this.open = false; }
    };
  });
  const select = selector => elements.filter(element => {
    if (selector.startsWith("#")) return element.attributes.id === selector.slice(1);
    const match = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    return match && match[1] in element.attributes
      && (match[2] === undefined || element.attributes[match[1]] === match[2]);
  });
  const storage = new Map();
  const window = {
    location: new URL(`https://kinatoshi99.github.io/ungrow/${search}`),
    history: { replaceState(_state, _title, url) { window.location = new URL(url); } },
    matchMedia: () => ({ matches: mobile, addEventListener() {} }),
    sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    setTimeout
  };
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ["2026-09-02T18:00:00Z"])); }
    static now() { return Date.parse("2026-09-02T18:00:00Z"); }
  }
  const context = vm.createContext({
    window, URL, URLSearchParams, Date: FixedDate, Intl, Blob, navigator: {},
    setTimeout, clearTimeout, requestAnimationFrame: callback => callback(),
    document: { querySelectorAll: select, querySelector: selector => select(selector)[0] || null }
  });
  for (const [, script] of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)) {
    vm.runInContext(fs.readFileSync(path.join(root, script), "utf8"), context, { filename: script });
  }
  return {
    context, window, select,
    state: () => plain(vm.runInContext("state", context)),
    run: code => vm.runInContext(code, context)
  };
}

test("old Daily seeds retain their exact character and challenge", () => {
  const { window } = loadApp();
  const daily = window.UngrowDailyChallenge;
  const base = { number: 1, roastEngine: 2 };
  assert.deepEqual(plain(daily.generate("2026-09-02")), {
    ...base, key: "2026-09-02", characterId: "ploy", health: 97, roastMode: 2, roastIndex: 0
  });
  assert.deepEqual(plain(daily.generate("2026-09-03")), {
    ...base, key: "2026-09-03", characterId: "somchai", health: 33, roastMode: 3, roastIndex: 2
  });
});

test("each character has a stable Daily and invalid selections preserve legacy results", () => {
  const { window } = loadApp();
  const daily = window.UngrowDailyChallenge;
  for (const key of ["2026-09-02", "2026-09-03", "2026-09-04", "2027-01-01"]) {
    const original = plain(daily.generate(key));
    for (const characterId of ["somchai", "ploy"]) {
      const expected = plain(daily.generate(key, characterId));
      assert.deepEqual(plain(daily.generate(key, characterId)), expected);
      assert.equal(expected.characterId, characterId);
      assert.equal(expected.key, key);
      assert.ok(expected.roastMode >= 1 && expected.roastMode <= 3);
      if (characterId === original.characterId) assert.deepEqual(expected, original);
    }
    assert.deepEqual(plain(daily.generate(key, "unknown")), original);
  }
  assert.deepEqual(plain(daily.generate("2026-09-03", "ploy")), {
    key: "2026-09-03", number: 1, characterId: "ploy", health: 6,
    roastMode: 2, roastIndex: 2, roastEngine: 2
  });
});

test("Daily dates still roll over at Bangkok midnight", () => {
  const daily = loadApp().window.UngrowDailyChallenge;
  assert.equal(daily.dateKey(new Date("2026-09-02T16:59:59Z")), "2026-09-02");
  assert.equal(daily.dateKey(new Date("2026-09-02T17:00:00Z")), "2026-09-03");
});

for (const [viewIndex, view] of ["desktop", "mobile"].entries()) {
  for (const characterId of ["ploy", "somchai"]) {
    test(`${view}: ${characterId} activates Daily, keeps its roast/renderer, and survives sharing`, () => {
      const app = loadApp("?c=somchai&h=89&m=2&r=0&e=2", view === "mobile");
      app.select(`[data-character-id="${characterId}"]`)[viewIndex].fire("click");
      for (const summary of app.select("[data-daily-summary]")) {
        assert.ok(summary.textContent.startsWith(characterId.toUpperCase()));
      }
      app.select('[data-action="daily-challenge"]')[viewIndex].fire("click");
      assert.equal(app.state().characterId, characterId);
      assert.equal(app.state().dailyKey, "2026-09-03");
      const expected = characterId === "ploy"
        ? { health: 6, mode: 2, intent: "disaster" }
        : { health: 33, mode: 3, intent: "hard" };
      assert.equal(app.state().health, expected.health);
      assert.equal(app.state().roastMode, expected.mode);
      for (const button of app.select('[data-action="daily-challenge"]')) {
        assert.equal(button.attributes["aria-pressed"], "true");
      }
      for (const button of app.select(`[data-character-id="${characterId}"]`)) {
        assert.equal(button.attributes["aria-pressed"], "true");
      }
      const expectedRoast = app.window.UngrowRoastMatrix.for(characterId, expected.intent, expected.mode)[2];
      assert.equal(app.run("currentRoast()"), expectedRoast);
      assert.equal(app.run("currentDailyChallenge().characterId"), characterId);
      assert.ok(app.run("currentPlantRenderer().buildStandalone(state.health)").includes(characterId.toUpperCase()));

      const shareUrl = new URL(app.run("buildShareUrl()"));
      assert.equal(shareUrl.searchParams.get("c"), characterId);
      assert.equal(shareUrl.searchParams.get("d"), "2026-09-03");
      assert.equal(shareUrl.searchParams.has("h"), false);
      assert.equal(shareUrl.searchParams.has("m"), false);
      const restored = loadApp(shareUrl.search, view === "mobile");
      assert.deepEqual(restored.state(), app.state());
      assert.equal(restored.run("currentRoast()"), expectedRoast);
    });
  }
}

test("archived Daily URLs without c preserve the original result when reshared", () => {
  for (const [date, characterId, health, roastMode] of [
    ["2026-09-02", "ploy", 97, 2], ["2026-09-03", "somchai", 33, 3]
  ]) {
    const app = loadApp(`?d=${date}&r=1&e=2`);
    assert.deepEqual(app.state(), { characterId, health, roastMode, roastIndex: 1, roastEngine: 2, dailyKey: date });
    const restored = loadApp(new URL(app.run("buildShareUrl()")).search);
    assert.deepEqual(restored.state(), app.state());
    assert.equal(restored.run("currentRoast()"), app.run("currentRoast()"));
  }
});

test("invalid Daily characters use the original daily selection", () => {
  const app = loadApp("?d=2026-09-03&c=missing&r=0&e=2");
  assert.equal(app.state().characterId, "somchai");
  assert.equal(app.state().dailyKey, "2026-09-03");
});

test("rerolling a roast keeps PLOY Daily active; manual edits exit it", () => {
  const app = loadApp("?d=2026-09-03&c=ploy&r=0&e=2");
  app.select('[data-action="roast"]')[0].fire("click");
  assert.equal(app.state().characterId, "ploy");
  assert.equal(app.state().dailyKey, "2026-09-03");
  assert.notEqual(app.state().roastIndex, 0);
  for (const action of ["setCharacter('somchai')", "setHealth(65)", "requestRoastMode(1)"]) {
    const changed = loadApp("?d=2026-09-03&c=ploy&r=0&e=2");
    changed.run(action);
    assert.equal(changed.state().dailyKey, null);
    assert.equal(changed.window.location.searchParams.has("d"), false);
    for (const button of changed.select('[data-action="daily-challenge"]')) {
      assert.equal(button.attributes["aria-pressed"], "false");
    }
  }
});
