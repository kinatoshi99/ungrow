// The shareable poster is drawn at its own 1080 × 1350 size, independent of UI CSS.
(() => {
  const INK = "#173b2a", PAPER = "#fffaf0", LIME = "#b7d874", GOLD = "#f2c14e", RED = "#c84b31";
  const FONT = 'system-ui,-apple-system,"Segoe UI",sans-serif';

  function themeFor(health) {
    const critical = health < 40;
    return {
      background: critical ? INK : health < 80 ? GOLD : LIME,
      foreground: critical ? PAPER : INK,
      accent: critical ? GOLD : INK,
      quoteBackground: critical ? GOLD : INK,
      quoteForeground: critical ? INK : PAPER,
      stamp: health === 0 ? "RIP" : health < 20 ? "ยับจัด!" : health < 40 ? "เข้า ICU" : health < 60 ? "ป่วยละ!" : health < 75 ? "โทรมแล้ว" : health < 90 ? "เริ่มช้ำ" : "ยังปากดี",
      critical
    };
  }

  function font(ctx, size, weight = 700) { ctx.font = `${weight} ${size}px ${FONT}`; }

  function segments(text, granularity) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      return [...new Intl.Segmenter("th", { granularity }).segment(text)].map(item => item.segment);
    }
    return granularity === "word" ? text.split(/(\s+)/).filter(Boolean) : Array.from(text);
  }

  function wrap(ctx, text, maxWidth) {
    const lines = [];
    let line = "";
    const push = () => { if (line.trim()) lines.push(line.trim()); line = ""; };
    for (const part of segments(text, "word")) {
      if (ctx.measureText(part).width > maxWidth) {
        push();
        for (const letter of segments(part, "grapheme")) {
          if (line && ctx.measureText(line + letter).width > maxWidth) push();
          line += letter;
        }
      } else if (line && ctx.measureText(line + part).width > maxWidth) {
        push();
        line = part.trimStart();
      } else {
        line += part;
      }
    }
    push();
    return lines;
  }

  // Fit the whole roast, including Thai marks; never silently slice away its punchline.
  function fitText(ctx, text, { x, y, width, height, size, minSize = 22, weight = 700, center = false }) {
    let lines, lineHeight, ascent, descent, blockHeight;
    do {
      font(ctx, size, weight);
      lines = wrap(ctx, text, width);
      const metrics = ctx.measureText(text);
      ascent = metrics.actualBoundingBoxAscent || size;
      descent = metrics.actualBoundingBoxDescent || size * .25;
      lineHeight = Math.max(size * 1.42, ascent + descent + 8);
      blockHeight = ascent + descent + (lines.length - 1) * lineHeight;
      const orphanPunctuation = lines.some(line => /^[“”"‘’'.,!?…]+$/.test(line));
      if ((blockHeight <= height && !orphanPunctuation) || size <= minSize) break;
      size -= 2;
    } while (true);
    const baseline = y + Math.max(0, (height - blockHeight) / 2) + ascent;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.direction = "ltr";
    lines.forEach((line, index) => {
      // Explicit positioning also keeps Thai centering stable in iOS Canvas.
      const left = center ? x + (width - ctx.measureText(line).width) / 2 : x;
      ctx.fillText(line, left, baseline + index * lineHeight);
    });
    return { size, lines, blockHeight };
  }

  function star(ctx, x, y, radius, color) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI * i / 4;
      const r = i % 2 ? radius * .24 : radius;
      const px = x + Math.cos(angle) * r, py = y + Math.sin(angle) * r;
      if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawStamp(ctx, label, theme) {
    ctx.save();
    ctx.translate(844, 327);
    ctx.rotate(6 * Math.PI / 180);
    ctx.fillStyle = theme.critical ? RED : INK;
    ctx.fillRect(-139, -40, 278, 80);
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 2;
    ctx.strokeRect(-131, -32, 262, 64);
    ctx.fillStyle = PAPER;
    fitText(ctx, label, { x: -121, y: -30, width: 242, height: 60, size: 38, weight: 900, center: true });
    ctx.restore();
  }

  function meter(ctx, value, x, y, width, theme) {
    const gap = 6, count = 12, barWidth = (width - gap * (count - 1)) / count;
    const fill = width * value / 100;
    for (let i = 0; i < count; i++) {
      const left = i * (barWidth + gap);
      ctx.globalAlpha = .18;
      ctx.fillStyle = theme.foreground;
      ctx.fillRect(x + left, y, barWidth, 19);
      ctx.globalAlpha = 1;
      const amount = Math.min(barWidth, Math.max(0, fill - left));
      if (amount) {
        ctx.fillStyle = theme.accent;
        ctx.fillRect(x + left, y, amount, 19);
      }
    }
  }

  function drawMeme(ctx, meme, image) {
    const size = 210;
    ctx.save();
    ctx.translate(825, 565);
    ctx.rotate(-3 * Math.PI / 180);
    ctx.shadowColor = "rgba(23,59,42,.18)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 10;
    ctx.drawImage(image, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function render(ctx, { character, health, condition, roast, award, daily, reaction }) {
    const theme = themeFor(health);
    ctx.save();
    ctx.clearRect(0, 0, 1080, 1350);
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, 1080, 1350);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.direction = "ltr";

    // Brand and challenge stay compact; the plant gets the poster's headline.
    ctx.fillStyle = theme.foreground;
    font(ctx, 34, 900);
    ctx.fillText("UNGROW", 60, 83);
    font(ctx, 25, 700);
    const edition = daily ? `DAILY #${String(daily.number).padStart(3, "0")}` : "SHAME ME";
    ctx.fillText(edition, 1020 - ctx.measureText(edition).width, 81);
    ctx.fillRect(60, 108, 960, 3);
    ctx.fillStyle = theme.accent;
    fitText(ctx, character.name, { x: 52, y: 128, width: 976, height: 117, size: 134, weight: 900 });
    ctx.fillStyle = theme.foreground;
    fitText(ctx, character.subtitle, { x: 60, y: 256, width: 940, height: 40, size: 28 });

    // SHAME ME now uses the paper-cut reaction system as the card hero.
    // The 12 reactions are native Canvas artwork, so exported PNGs stay crisp
    // without depending on the small meme stickers used in the Playground UI.
    ctx.save();
    ctx.shadowColor = "rgba(23,59,42,.24)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "#efe3c8";
    ctx.translate(54, 318);
    ctx.rotate(-1.3 * Math.PI / 180);
    ctx.fillRect(0, 0, 616, 492);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = PAPER;
    ctx.translate(64, 306);
    ctx.rotate(.8 * Math.PI / 180);
    ctx.fillRect(0, 0, 596, 488);
    ctx.restore();

    star(ctx, 675, 389, 22, theme.accent);
    star(ctx, 74, 770, 16, theme.accent);
    window.UngrowShameReactions.draw(ctx, reaction, { x: 360, y: 556, size: 540 });

    ctx.save();
    ctx.translate(825, 560);
    ctx.rotate(-3 * Math.PI / 180);
    ctx.fillStyle = theme.critical ? RED : theme.accent;
    ctx.fillRect(-155, -70, 310, 140);
    ctx.fillStyle = theme.critical ? PAPER : theme.background;
    fitText(ctx, reaction.hook, {
      x: -137, y: -55, width: 274, height: 110, size: 28, minSize: 19, weight: 900, center: true
    });
    ctx.restore();

    drawStamp(ctx, theme.stamp, theme);

    ctx.fillStyle = theme.foreground;
    ctx.fillRect(60, 830, 960, 2);
    font(ctx, 22, 900);
    ctx.fillText("PLANT HEALTH", 60, 865);
    const healthNumber = String(health);
    font(ctx, 76, 900);
    ctx.fillStyle = theme.accent;
    ctx.fillText(healthNumber, 55, 938);
    const numberWidth = ctx.measureText(healthNumber).width;
    font(ctx, 30, 900);
    ctx.fillText("%", 62 + numberWidth, 934);
    meter(ctx, health, 261, 898, 95, theme);

    ctx.fillStyle = theme.foreground;
    font(ctx, 22, 900);
    ctx.fillText("OWNER SKILL", 403, 865);
    font(ctx, 66, 900);
    ctx.fillText(`${character.ownerSkill}%`, 398, 938);
    font(ctx, 22, 900);
    ctx.fillText("สภาพล่าสุด", 699, 865);
    fitText(ctx, condition.title, { x: 699, y: 874, width: 321, height: 66, size: 28, minSize: 22, weight: 900 });

    ctx.fillStyle = theme.foreground;
    fitText(ctx, condition.sub, { x: 62, y: 950, width: 956, height: 28, size: 21, minSize: 18, center: true });

    // One large unbroken quote field replaces the small nested speech card.
    ctx.fillStyle = theme.quoteBackground;
    ctx.fillRect(0, 981, 1080, 231);
    ctx.fillStyle = theme.quoteForeground;
    const quoteLayout = fitText(ctx, `“${roast}”`, {
      x: 64, y: 1000, width: 952, height: 193, size: 56, minSize: 30, weight: 900, center: true
    });

    ctx.fillStyle = theme.foreground;
    fitText(ctx, award, { x: 60, y: 1236, width: 960, height: 44, size: 27, minSize: 24, weight: 900, center: true });
    font(ctx, 22, 700);
    const tags = character.hashtags.join("  ");
    ctx.fillText(tags, 60, 1311);
    const signature = "UNGROW / 555";
    ctx.fillText(signature, 1020 - ctx.measureText(signature).width, 1311);
    ctx.restore();
    return { theme, quoteLayout };
  }

  window.UngrowSocialCard = Object.freeze({ render, themeFor });
})();
