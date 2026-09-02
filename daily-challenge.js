// Deterministic Daily Disaster generator. No backend, no persisted user data.
(() => {
  const TZ = "Asia/Bangkok";
  const EPOCH = "2026-09-03";
  const characters = ["somchai", "ploy"];
  const intentBands = [
    [80, 100], [60, 79], [40, 59], [20, 39], [0, 19]
  ];

  function dateKey(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(date);
    const get = type => parts.find(part => part.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  }

  function validDateKey(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }
  function hash(text) {
    let value = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      value ^= text.charCodeAt(i);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function challengeNumber(key) {
    const start = Date.parse(`${EPOCH}T00:00:00Z`);
    const current = Date.parse(`${key}T00:00:00Z`);
    return Math.max(1, Math.floor((current - start) / 86400000) + 1);
  }

  function generate(key = dateKey()) {
    const safeKey = validDateKey(key) ? key : dateKey();
    let seed = hash(`ungrow-daily:${safeKey}`);
    const next = max => {
      seed = (Math.imul(seed ^ (seed >>> 15), 2246822519) + 3266489917) >>> 0;
      return seed % max;
    };
    const characterId = characters[next(characters.length)];
    const band = intentBands[next(intentBands.length)];
    const health = band[0] + next(band[1] - band[0] + 1);
    const roastMode = 1 + next(3); // Daily is frictionless: never auto-select 18+.
    const roastIndex = next(3);
    return Object.freeze({
      key: safeKey,
      number: challengeNumber(safeKey),
      characterId,
      health,
      roastMode,
      roastIndex,
      roastEngine: 2
    });
  }

  window.UngrowDailyChallenge = Object.freeze({
    timeZone: TZ,
    epoch: EPOCH,
    dateKey,
    validDateKey,
    generate
  });
})();
