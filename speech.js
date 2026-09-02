// Device/browser text-to-speech. No microphone, autoplay, or app TTS service.
(() => {
  function create({ onChange = () => {} } = {}) {
    const synth = window.speechSynthesis;
    const supported = Boolean(synth && typeof synth.speak === "function"
      && typeof synth.cancel === "function" && typeof window.SpeechSynthesisUtterance === "function");
    let voices = [];
    let current = null; // Keep the utterance alive until it finishes.
    let startTimer = null;
    let endTimer = null;

    function report(status, message = "") { onChange({ supported, status, message }); }
    function refreshVoices() {
      try { voices = synth?.getVoices?.() || []; }
      catch (_) { voices = []; }
    }
    function clearTimers() {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      startTimer = endTimer = null;
    }
    function stop() {
      const wasActive = current !== null;
      current = null;
      clearTimers();
      if (wasActive) {
        try { synth.cancel(); } catch (_) {}
      }
      report(supported ? "idle" : "unavailable", supported ? "" : "เบราว์เซอร์นี้ยังอ่านออกเสียงไม่ได้");
    }
    function fail(utterance, message) {
      if (current !== utterance) return;
      stop();
      report("error", message);
    }

    function toggle(text, characterId) {
      if (!supported) { stop(); return; }
      if (current) { stop(); return; }
      if (!String(text || "").trim()) return;
      refreshVoices();
      const thaiVoices = voices.filter(voice => /^th(?:[-_]|$)/i.test(voice.lang || ""));
      if (voices.length && !thaiVoices.length) {
        report("error", "ยังไม่พบเสียงภาษาไทยในเบราว์เซอร์นี้ ลองเปิดในเบราว์เซอร์อื่นหรือเพิ่มเสียงไทยในเครื่อง");
        return;
      }

      let utterance;
      try {
        utterance = new window.SpeechSynthesisUtterance(String(text));
        utterance.lang = "th-TH";
        // Prefer Siri only if this browser actually exposes a Thai Siri voice.
        const voice = thaiVoices.find(item => /siri/i.test(item.name))
          || thaiVoices.find(item => item.default)
          || thaiVoices.find(item => item.localService)
          || thaiVoices[0];
        if (voice) utterance.voice = voice;
        utterance.rate = characterId === "ploy" ? 1.02 : .94;
        utterance.pitch = characterId === "ploy" ? 1.12 : .92;
        utterance.volume = 1;
        current = utterance;
        utterance.onstart = () => {
          if (current !== utterance) return;
          clearTimeout(startTimer);
          report("speaking", "");
        };
        utterance.onend = () => {
          if (current !== utterance) return;
          current = null;
          clearTimers();
          report("idle");
        };
        utterance.onerror = event => {
          if (current !== utterance) return;
          if (["canceled", "interrupted"].includes(event.error)) { stop(); return; }
          fail(utterance, event.error === "not-allowed"
            ? "เสียงยังไม่เริ่ม ลองแตะปุ่มลำโพงอีกครั้ง"
            : "อ่านเสียงไม่สำเร็จ ลองกดอีกครั้งหรือตรวจเสียงภาษาไทยในเครื่อง");
        };
        report("loading");
        startTimer = setTimeout(() => fail(utterance, "เสียงยังไม่เริ่ม ลองกดอีกครั้งหรือลองเปิดใน Safari บน iPhone"), 12000);
        endTimer = setTimeout(() => fail(utterance, "การอ่านเสียงหยุดตอบสนอง กดเพื่อเริ่มใหม่ได้เลย"), 90000);
        // Stay inside the tap/click gesture for Safari. An initially empty voice
        // list can still use lang=th-TH; voiceschanged refreshes future taps.
        synth.cancel();
        synth.speak(utterance);
      } catch (_) {
        stop();
        report("error", "เปิดเสียงไม่ได้ ลองแตะปุ่มลำโพงอีกครั้ง");
      }
    }

    refreshVoices();
    synth?.addEventListener?.("voiceschanged", refreshVoices);
    window.addEventListener?.("pagehide", stop);
    document.addEventListener?.("visibilitychange", () => { if (document.hidden) stop(); });
    stop();
    return Object.freeze({ toggle, stop });
  }
  window.UngrowSpeech = Object.freeze({ create });
})();
