(function () {
  "use strict";

  const engine = window.UngrowResignation;
  const view = document.querySelector("#resignationView");
  if (!engine || !view) return;

  const ROUTE_HUB = "#/resignation";
  const ROUTE_RE = /^#\/plants\/([a-z0-9_-]+)\/resignation$/i;
  let hubMode = false;
  let openedFromAction = false;
  let generation = 0;
  let contextKey = "";
  let currentLetter = null;
  let latestBlob = null;
  let renderToken = 0;

  view.innerHTML = `
    <div class="resignation-shell" role="region" aria-label="Plant Resignation Generator">
      <header class="resignation-head">
        <button class="resignation-back-app" type="button" data-resignation-action="close" aria-label="กลับไปหน้า Ungrow">← UNGROW</button>
        <div>
          <div class="resignation-kicker">🌱💀 UNGROW PLANT HR</div>
          <h2>Plant Resignation Generator</h2>
          <p>ต้นไม้ของคุณทนไม่ไหวแล้ว</p>
        </div>
        <button class="resignation-close" type="button" data-resignation-action="close" aria-label="ปิด Plant Resignation Generator">×</button>
      </header>

      <div class="resignation-hub-picker" data-resignation-hub hidden>
        <span>เลือกต้นไม้ที่จะยื่นใบลาออก</span>
        <div class="resignation-character-buttons" data-resignation-character-buttons></div>
      </div>

      <section class="resignation-generator" data-resignation-stage="generator">
        <div class="resignation-profile">
          <div class="resignation-plant-stage"><svg data-resignation-plant-svg viewBox="0 0 320 320" role="img"></svg></div>
          <div class="resignation-profile-copy">
            <span class="resignation-overline">CURRENT EMPLOYEE</span>
            <h3 data-resignation-name>SOMCHAI</h3>
            <p data-resignation-subtitle>Snake Plant</p>
            <div class="resignation-health-line"><span>Plant Health</span><strong data-resignation-health>89%</strong></div>
            <div class="resignation-health-meter"><i data-resignation-health-bar></i></div>
            <div class="resignation-status" data-resignation-status>COMPLAINT</div>
            <p class="resignation-mode-copy" data-resignation-mode-copy></p>
          </div>
        </div>
        <div class="resignation-generator-note">
          <strong>Health มาจากต้นไม้จริงใน Ungrow</strong>
          <span>Generator ไม่มีช่องกรอก Health ซ้ำ เพื่อไม่ให้ข้อมูลสองส่วนขัดกัน</span>
        </div>
        <button class="resignation-primary" type="button" data-resignation-action="generate">GENERATE RESIGNATION 💀</button>
      </section>

      <section class="resignation-result" data-resignation-stage="result" hidden>
        <div class="resignation-result-top">
          <button type="button" class="resignation-inline-back" data-resignation-action="back-generator">← กลับไป Generator</button>
          <span data-resignation-result-meta></span>
        </div>
        <div class="resignation-card-frame">
          <canvas id="resignationCanvas" width="1080" height="1350" aria-label="Plant resignation card preview"></canvas>
        </div>
        <p class="resignation-export-status" data-resignation-export-status role="status" aria-live="polite"></p>
        <div class="resignation-actions">
          <button type="button" class="resignation-primary" data-resignation-action="again">↻ GENERATE AGAIN</button>
          <button type="button" class="resignation-action" data-resignation-action="share">📤 SHARE</button>
          <button type="button" class="resignation-action" data-resignation-action="download">⬇️ PNG</button>
          <button type="button" class="resignation-action danger" data-resignation-action="shame">📸 SHAME ME</button>
        </div>
      </section>
    </div>`;

  const canvas = view.querySelector("#resignationCanvas");
  const exportStatus = view.querySelector("[data-resignation-export-status]");

  function routeForPlant(characterId = state.characterId) {
    return `#/plants/${characterId}/resignation`;
  }

  function parseRoute() {
    if (window.location.hash === ROUTE_HUB) return { type: "hub", characterId: null };
    const match = window.location.hash.match(ROUTE_RE);
    return match ? { type: "plant", characterId: match[1] } : null;
  }

  function currentContextKey() {
    return `${state.characterId}:${state.health}`;
  }

  function setRoute(hash, { push = true, generationIndex = null } = {}) {
    const url = new URL(window.location.href);
    url.hash = hash;
    if (Number.isInteger(generationIndex) && generationIndex >= 0) url.searchParams.set("ri", String(generationIndex));
    else url.searchParams.delete("ri");
    const method = push ? "pushState" : "replaceState";
    window.history[method]({ ungrowResignation: true }, "", url);
    syncFromRoute();
  }

  function clearRoute({ replace = true } = {}) {
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("ri");
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
  }

  function showStage(name) {
    view.querySelectorAll("[data-resignation-stage]").forEach(section => {
      section.hidden = section.dataset.resignationStage !== name;
    });
  }

  function buildCharacterButtons() {
    const holder = view.querySelector("[data-resignation-character-buttons]");
    holder.innerHTML = Object.values(characters).map(character => `
      <button type="button" data-resignation-character="${character.id}" aria-pressed="${character.id === state.characterId}">
        ${character.name}
      </button>`).join("");
  }

  function updateGenerator() {
    const character = currentCharacter();
    const mode = engine.getMode(state.health);
    const renderer = currentPlantRenderer();
    const svg = view.querySelector("[data-resignation-plant-svg]");
    renderer.render(svg, state.health);
    svg.setAttribute("aria-label", `${character.name} Plant Health ${state.health}%`);
    view.querySelector("[data-resignation-name]").textContent = character.name;
    view.querySelector("[data-resignation-subtitle]").textContent = character.plant || character.subtitle;
    view.querySelector("[data-resignation-health]").textContent = `${state.health}%`;
    view.querySelector("[data-resignation-health-bar]").style.width = `${state.health}%`;
    view.querySelector("[data-resignation-status]").textContent = mode.status;
    view.querySelector("[data-resignation-status]").dataset.mode = mode.id;
    view.querySelector("[data-resignation-mode-copy]").textContent = mode.effective;
    view.querySelector("[data-resignation-hub]").hidden = !hubMode;
    buildCharacterButtons();
  }

  function resetGenerationIfContextChanged() {
    const nextKey = currentContextKey();
    if (contextKey === nextKey) return;
    contextKey = nextKey;
    generation = 0;
    currentLetter = null;
    latestBlob = null;
    showStage("generator");
  }

  function openView({ isHub = false } = {}) {
    hubMode = isHub;
    resetGenerationIfContextChanged();
    updateGenerator();
    view.hidden = false;
    document.body.classList.add("resignation-open");
    if (!currentLetter) showStage("generator");
    requestAnimationFrame(() => view.querySelector("[data-resignation-action='generate']")?.focus());
  }

  function hideView() {
    view.hidden = true;
    document.body.classList.remove("resignation-open");
  }

  function syncFromRoute() {
    const route = parseRoute();
    if (!route) {
      hideView();
      return;
    }

    hubMode = route.type === "hub";
    if (route.characterId && characters[route.characterId] && route.characterId !== state.characterId) {
      const desiredHash = window.location.hash;
      const desiredIteration = new URL(window.location.href).searchParams.get("ri");
      setCharacter(route.characterId);
      const repaired = new URL(window.location.href);
      repaired.hash = desiredHash;
      if (desiredIteration !== null) repaired.searchParams.set("ri", desiredIteration);
      window.history.replaceState({ ungrowResignation: true }, "", repaired);
    }

    resetGenerationIfContextChanged();
    updateGenerator();
    view.hidden = false;
    document.body.classList.add("resignation-open");

    const requestedGeneration = Number.parseInt(new URL(window.location.href).searchParams.get("ri"), 10);
    if (Number.isInteger(requestedGeneration) && requestedGeneration >= 0) {
      generation = requestedGeneration;
      generateCurrent({ syncUrl: false });
    } else {
      currentLetter = null;
      latestBlob = null;
      showStage("generator");
    }
  }

  function openPrimary() {
    openedFromAction = true;
    setRoute(routeForPlant(), { push: true });
  }

  function openHub() {
    openedFromAction = true;
    setRoute(ROUTE_HUB, { push: true });
  }

  function closeView() {
    if (openedFromAction && parseRoute()) {
      openedFromAction = false;
      window.history.back();
      return;
    }
    clearRoute({ replace: true });
    hideView();
  }

  function svgToImage(markup) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = error => { URL.revokeObjectURL(url); reject(error); };
      image.src = url;
    });
  }

  function canvasBlob() {
    return new Promise(resolve => canvas.toBlob(resolve, "image/png", 1));
  }

  async function renderCurrentCard(letter) {
    const token = ++renderToken;
    latestBlob = null;
    exportStatus.textContent = "กำลังจัดหน้าใบลาออก...";
    try {
      const renderer = currentPlantRenderer();
      const [plantImage] = await Promise.all([
        svgToImage(renderer.buildStandalone(state.health)),
        document.fonts?.ready || Promise.resolve()
      ]);
      if (token !== renderToken || letter !== currentLetter) return;
      engine.renderCard(canvas.getContext("2d"), { letter, plantImage });
      canvas.setAttribute("aria-label", `${letter.mode.status} — ${letter.plantName} Plant Health ${letter.health}%`);
      const blob = await canvasBlob();
      if (token !== renderToken || letter !== currentLetter) return;
      if (!blob) throw new Error("PNG encoding failed");
      latestBlob = blob;
      exportStatus.textContent = "ใบลาออกพร้อมแชร์แล้ว · PNG 1080×1350";
    } catch (_) {
      if (token !== renderToken) return;
      latestBlob = null;
      exportStatus.textContent = "สร้าง PNG ไม่สำเร็จ แต่ยังแชร์ข้อความใบลาออกได้";
    }
  }

  function generateCurrent({ syncUrl = true } = {}) {
    const character = currentCharacter();
    currentLetter = engine.generate({ character, health: state.health, iteration: generation });
    view.querySelector("[data-resignation-result-meta]").textContent = `${character.name} · Health ${state.health}% · ${currentLetter.mode.status}`;
    showStage("result");
    renderCurrentCard(currentLetter);
    if (syncUrl) setRoute(routeForPlant(), { push: false, generationIndex: generation });
  }

  function generateAgain() {
    generation += 1;
    generateCurrent({ syncUrl: true });
  }

  function backToGenerator() {
    currentLetter = null;
    latestBlob = null;
    showStage("generator");
    updateGenerator();
    setRoute(hubMode ? ROUTE_HUB : routeForPlant(), { push: false });
  }

  function resignationShareUrl() {
    const url = new URL(buildShareUrl());
    url.searchParams.set("ri", String(generation));
    url.hash = routeForPlant();
    return url.toString();
  }

  function canShareFile(file) {
    if (!navigator.share || !navigator.canShare) return false;
    try { return navigator.canShare({ files: [file] }); }
    catch (_) { return false; }
  }

  async function shareResignation() {
    if (!currentLetter) return;
    const text = engine.shareText(currentLetter);
    const url = resignationShareUrl();
    const file = latestBlob && typeof File !== "undefined"
      ? new File([latestBlob], `ungrow-resignation-${state.characterId}-${state.health}.png`, { type: "image/png" })
      : null;

    if (file && canShareFile(file)) {
      try {
        await navigator.share({ files: [file], title: `${currentLetter.plantName} — ${currentLetter.mode.status}`, text });
        exportStatus.textContent = "เปิด Share Sheet แล้ว";
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: `${currentLetter.plantName} — ${currentLetter.mode.status}`, text, url });
        exportStatus.textContent = "เปิด Share Sheet แล้ว";
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await copyShareUrl(`${text}\n\n${url}`);
      exportStatus.textContent = "คัดลอกใบลาออกและลิงก์แล้ว ✅";
    } catch (_) {
      exportStatus.textContent = "คัดลอกไม่สำเร็จ — ใช้ปุ่ม PNG แทน";
    }
  }

  async function downloadPng() {
    if (!currentLetter) return;
    if (!latestBlob) {
      exportStatus.textContent = "PNG ยังไม่พร้อม กำลังสร้างใหม่...";
      await renderCurrentCard(currentLetter);
      if (!latestBlob) return;
    }
    const url = URL.createObjectURL(latestBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ungrow-resignation-${state.characterId}-health-${state.health}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    exportStatus.textContent = "ส่งไฟล์ PNG ให้เบราว์เซอร์แล้ว";
  }

  function leaveForShame() {
    openedFromAction = false;
    clearRoute({ replace: true });
    hideView();
    showExportLab();
  }

  document.querySelectorAll('[data-action="resignation"]').forEach(button => button.addEventListener("click", openPrimary));
  document.querySelectorAll('[data-action="resignation-hub"]').forEach(button => button.addEventListener("click", openHub));

  view.addEventListener("click", event => {
    const characterButton = event.target.closest("[data-resignation-character]");
    if (characterButton) {
      const id = characterButton.dataset.resignationCharacter;
      if (characters[id] && id !== state.characterId) setCharacter(id);
      contextKey = "";
      setRoute(routeForPlant(id), { push: false });
      return;
    }

    const button = event.target.closest("[data-resignation-action]");
    if (!button) return;
    const action = button.dataset.resignationAction;
    if (action === "close") closeView();
    else if (action === "generate") { generation = 0; generateCurrent({ syncUrl: true }); }
    else if (action === "again") generateAgain();
    else if (action === "back-generator") backToGenerator();
    else if (action === "share") shareResignation();
    else if (action === "download") downloadPng();
    else if (action === "shame") leaveForShame();
  });

  window.addEventListener("popstate", syncFromRoute);
  window.addEventListener("hashchange", syncFromRoute);
  syncFromRoute();
})();
