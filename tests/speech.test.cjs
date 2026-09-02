const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "..", "speech.js"), "utf8");

function setup({ supported = true, voices = [] } = {}) {
  const reports = [], calls = [], timers = new Map(), events = {}, documentEvents = {};
  let nextTimer = 0, cancels = 0;
  const synth = {
    getVoices: () => voices,
    speak: utterance => calls.push(utterance),
    cancel: () => { cancels++; },
    addEventListener: (name, fn) => { events[name] = fn; }
  };
  const window = { addEventListener: (name, fn) => { events[name] = fn; } };
  if (supported) Object.assign(window, { speechSynthesis: synth, SpeechSynthesisUtterance: function (text) { this.text = text; } });
  const document = { hidden: false, addEventListener: (name, fn) => { documentEvents[name] = fn; } };
  const context = vm.createContext({
    window, document,
    setTimeout: (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => timers.delete(id)
  });
  vm.runInContext(source, context);
  const speech = window.UngrowSpeech.create({ onChange: value => reports.push(value) });
  return { speech, calls, timers, events, document, documentEvents, synth,
    last: () => reports.at(-1), cancels: () => cancels, setVoices: value => { voices = value; } };
}

test("unsupported browsers report unavailable without throwing", () => {
  const t = setup({ supported: false });
  t.speech.toggle("สวัสดี", "ploy");
  assert.equal(t.last().supported, false);
  assert.equal(t.last().status, "unavailable");
  assert.equal(t.calls.length, 0);
});

test("speech stays synchronous with the tap and uses an available Thai voice", () => {
  const thai = { name: "Thai device voice", lang: "th-TH", localService: true };
  const t = setup({ voices: [{ name: "English Siri", lang: "en-US" }, thai] });
  t.speech.toggle("วันนี้ยังไม่ตาย ผิดแผนนิดหน่อย", "somchai");
  assert.equal(t.calls.length, 1);
  assert.equal(t.calls[0].text, "วันนี้ยังไม่ตาย ผิดแผนนิดหน่อย");
  assert.equal(t.calls[0].voice, thai);
  assert.equal(t.calls[0].lang, "th-TH");
  assert.equal(t.last().status, "loading");
  t.calls[0].onstart();
  assert.equal(t.last().status, "speaking");
  t.calls[0].onend();
  assert.equal(t.last().status, "idle");
  assert.equal(t.timers.size, 0);
});

test("delayed voices are refreshed; Siri is selected only when exposed in Thai", () => {
  const t = setup();
  t.speech.toggle("ฉันยังสวยอยู่ค่ะ", "ploy");
  assert.equal(t.calls[0].voice, undefined);
  assert.equal(t.calls[0].lang, "th-TH");
  t.speech.stop();
  const siri = { name: "Siri Thai", lang: "th_TH" };
  t.setVoices([{ name: "Thai default", lang: "th-TH", default: true }, siri]);
  t.events.voiceschanged();
  t.speech.toggle("ฉันยังสวยอยู่ค่ะ", "ploy");
  assert.equal(t.calls[1].voice, siri);
  assert.ok(t.calls[1].pitch > 1);
});

test("known non-Thai voices produce a recoverable message instead of reading with an English voice", () => {
  const t = setup({ voices: [{ lang: "en-US" }] });
  t.speech.toggle("ใบตกแล้วค่ะ", "ploy");
  assert.equal(t.calls.length, 0);
  assert.equal(t.last().status, "error");
  assert.match(t.last().message, /เสียงภาษาไทย/);
  t.setVoices([{ lang: "th-TH" }]);
  t.speech.toggle("ใบตกแล้วค่ะ", "ploy");
  assert.equal(t.calls.length, 1);
});

test("second tap cancels queued speech; stale callbacks cannot stop its replacement", () => {
  const t = setup();
  t.speech.toggle("หนึ่ง", "somchai");
  const old = t.calls[0];
  t.speech.toggle("หนึ่ง", "somchai");
  assert.equal(t.last().status, "idle");
  assert.equal(t.timers.size, 0);
  assert.equal(t.cancels(), 2); // Cancel old queue before speaking, then stop the tap.
  t.speech.toggle("สอง", "ploy");
  old.onend();
  old.onerror({ error: "interrupted" });
  assert.equal(t.last().status, "loading");
  t.calls[1].onstart();
  assert.equal(t.last().status, "speaking");
});

test("errors and a missing start event release the stop button for retry", () => {
  const t = setup();
  t.speech.toggle("หนึ่ง", "somchai");
  t.calls[0].onerror({ error: "not-allowed" });
  assert.equal(t.last().status, "error");
  assert.equal(t.timers.size, 0);
  t.speech.toggle("สอง", "ploy");
  [...t.timers.values()].find(timer => timer.delay === 12000).fn();
  assert.equal(t.last().status, "error");
  assert.equal(t.timers.size, 0);
  t.speech.toggle("สาม", "ploy");
  assert.equal(t.calls.length, 3);
});

test("hiding or leaving the page stops speech", () => {
  const t = setup();
  t.speech.toggle("หนึ่ง", "somchai");
  t.document.hidden = true;
  t.documentEvents.visibilitychange();
  assert.equal(t.last().status, "idle");
  t.speech.toggle("สอง", "ploy");
  t.events.pagehide();
  assert.equal(t.last().status, "idle");
  assert.equal(t.timers.size, 0);
});
