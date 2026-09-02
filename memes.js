// Original local meme-style reaction stickers, selected by roast intent.
(() => {
  const entries = [
    ["praise", "slay", "Slay", "Original slay diva reaction sticker"],
    ["praise", "slow-clap", "Slow Clap", "Original reluctant slow clap reaction sticker"],
    ["praise", "shocked-praise", "Shocked Praise", "Original surprised praise reaction sticker"],
    ["sideEye", "side-eye", "Side Eye", "Original suspicious side-eye reaction sticker"],
    ["sideEye", "caught-you", "Caught You", "Original caught-you reaction sticker"],
    ["sideEye", "fake-smile", "Fake Smile", "Original polite fake-smile reaction sticker"],
    ["concerned", "headache", "Headache", "Original headache reaction sticker"],
    ["concerned", "nervous-sweat", "Nervous Sweat", "Original nervous-sweat reaction sticker"],
    ["concerned", "emergency-meeting", "Emergency Meeting", "Original emergency-meeting reaction sticker"],
    ["hard", "im-done", "I'm Done", "Original done-with-management reaction sticker"],
    ["hard", "management-rant", "Management Rant", "Original angry management-rant reaction sticker"],
    ["hard", "resignation", "Resignation", "Original resignation-letter reaction sticker"],
    ["disaster", "funeral", "Funeral", "Original comedic memorial reaction sticker"],
    ["disaster", "chaos", "Chaos", "Original everything-is-chaos reaction sticker"],
    ["disaster", "final-boss", "Final Boss", "Original final-boss disaster reaction sticker"]
  ];
  const catalog = Object.freeze(Object.fromEntries(entries.map(([intent,id,name,alt]) => [id, Object.freeze({
    id, intent, name, alt, src: `assets/memes/${intent}/${id}.svg`
  })])));
  const pools = Object.freeze(Object.fromEntries(["praise","sideEye","concerned","hard","disaster"].map(intent => [
    intent, Object.freeze(Object.values(catalog).filter(meme => meme.intent === intent))
  ])));

  function intentFor(health = 50) {
    const value = Math.max(0, Math.min(100, Number(health)));
    if (value >= 80) return "praise";
    if (value >= 60) return "sideEye";
    if (value >= 40) return "concerned";
    if (value >= 20) return "hard";
    return "disaster";
  }

  function hash(text) {
    let value = 2166136261;
    for (const ch of String(text)) {
      value ^= ch.codePointAt(0);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }
  function select({ health = 50, character, characterId, roastMode = 2, roastIndex = 0, daily, dailyKey } = {}) {
    const intent = intentFor(health);
    const pool = pools[intent];
    const id = character?.id || characterId || "somchai";
    const day = daily?.key || dailyKey || "";
    const seed = [intent, id, roastMode, roastIndex, day].join("|");
    return pool[hash(seed) % pool.length];
  }

  function createImageLoader({ makeImage = () => new Image(), setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
    const cache = new Map();
    return function load(meme) {
      if (cache.has(meme.id)) return cache.get(meme.id);
      const pending = new Promise((resolve, reject) => {
        const image = makeImage();
        let timer;
        const finish = error => {
          clearTimer(timer);
          image.onload = image.onerror = null;
          if (error) reject(error); else resolve(image);
        };
        image.onload = () => finish(image.naturalWidth ? null : new Error("Empty meme image"));
        image.onerror = () => finish(new Error("Meme image failed to load"));
        timer = setTimer(() => finish(new Error("Meme image timed out")), 10000);
        image.src = meme.src;
      });
      cache.set(meme.id, pending);
      pending.catch(() => { if (cache.get(meme.id) === pending) cache.delete(meme.id); });
      return pending;
    };
  }

  window.UngrowMemes = Object.freeze({
    catalog,
    pools,
    count: entries.length,
    intentFor,
    select,
    createImageLoader
  });
})();
