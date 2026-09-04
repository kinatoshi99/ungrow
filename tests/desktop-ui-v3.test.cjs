const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "desktop-ui.css"), "utf8");

function between(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(start >= 0, `missing start marker: ${startNeedle}`);
  assert.ok(end > start, `missing end marker: ${endNeedle}`);
  return source.slice(start, end);
}

function count(source, needle) {
  return source.split(needle).length - 1;
}

const desktop = between(
  html,
  '<section class="app-view desktop-view"',
  '<section class="app-view mobile-view"'
);
const mobile = html.slice(html.indexOf('<section class="app-view mobile-view"'));

test("desktop v3 has topbar, sidebar, canvas and bottom dock", () => {
  for (const className of [
    "desktop-v3-topbar",
    "desktop-v3-sidebar",
    "desktop-v3-canvas",
    "desktop-v3-dock"
  ]) {
    assert.match(desktop, new RegExp(className));
  }
  assert.equal(count(desktop, "desktop-hero"), 0);
  assert.equal(count(desktop, "desktop-panel"), 0);
});

test("desktop Plant Health has a single authoritative control", () => {
  assert.equal(count(desktop, "data-health-value"), 1);
  assert.equal(count(desktop, "data-health-slider"), 1);
  assert.equal(count(desktop, "data-health-bar"), 1);
  assert.equal(count(desktop, "data-owner-skill-value"), 1);
  assert.equal(count(desktop, "data-owner-skill-bar"), 1);
});

test("all desktop actions live in the bottom dock", () => {
  const dock = between(
    desktop,
    '<nav class="desktop-v3-dock"',
    '</nav>'
  );
  for (const action of ["roast", "shame", "resignation", "share-link", "speak-roast"]) {
    assert.match(dock, new RegExp(`data-action="${action}"`));
    assert.equal(count(desktop, `data-action="${action}"`), 1);
  }
});

test("Daily is compact in the topbar and old giant desktop banner is gone", () => {
  const topbar = between(
    desktop,
    '<header class="desktop-v3-topbar">',
    '</header>'
  );
  assert.match(topbar, /desktop-v3-daily/);
  assert.match(topbar, /data-action="daily-challenge"/);
  assert.equal(count(desktop, "data-action=\"daily-challenge\""), 1);
});

test("desktop stylesheet contains the v3 hierarchy and target breakpoints", () => {
  assert.match(css, /\.desktop-v3-workspace\s*\{/);
  assert.match(css, /grid-template-columns:280px minmax\(0,1fr\)/);
  assert.match(css, /\.desktop-v3-dock\s*\{/);
  assert.match(css, /@media\(min-width:1280px\)/);
  assert.match(css, /@media\(min-width:768px\) and \(max-width:1099px\)/);
});

test("mobile interface and its existing actions remain present", () => {
  assert.match(mobile, /mobile-shell/);
  assert.match(mobile, /mobile-health-panel/);
  assert.match(mobile, /data-action="roast"/);
  assert.match(mobile, /data-action="shame"/);
  assert.match(mobile, /data-action="resignation"/);
  assert.match(mobile, /data-action="share-link"/);
  assert.match(mobile, /data-action="speak-roast"/);
});
