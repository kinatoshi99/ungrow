(function (global) {
  "use strict";

  const MODES = [
    {
      id: "complaint",
      min: 71,
      status: "COMPLAINT",
      title: "หนังสือร้องเรียนก่อนจะลาออก",
      effective: "ยังไม่ลาออก แต่ฝ่ายบริหารควรเริ่มกลัวได้แล้ว",
      tone: "ยังพอมีแรงบ่น และขอสงวนสิทธิ์ลาออกภายหลัง"
    },
    {
      id: "warning",
      min: 41,
      status: "FINAL WARNING",
      title: "ร่างใบลาออกฉบับเตือนครั้งสุดท้าย",
      effective: "อยู่ต่อแบบมีเงื่อนไข กรุณาปรับปรุงเจ้าของโดยด่วน",
      tone: "ความศรัทธาต่อฝ่ายบริหารเหลือน้อยกว่าความชื้นในดิน"
    },
    {
      id: "resignation",
      min: 21,
      status: "RESIGNED",
      title: "หนังสือลาออกอย่างเป็นทางการ",
      effective: "มีผลเมื่อเจ้าของอ่านข้อความนี้จบ",
      tone: "ขอยุติบทบาทต้นไม้ที่ต้องรับกรรมแทนเจ้าของ"
    },
    {
      id: "immediate",
      min: 0,
      status: "EFFECTIVE IMMEDIATELY",
      title: "หนังสือลาออกฉุกเฉิน",
      effective: "มีผลตั้งแต่เมื่อวาน เพราะวันนี้ไม่ไหวแล้ว",
      tone: "ขอถอนตัวจากตำแหน่งสิ่งมีชีวิตในความดูแลของคุณทันที"
    }
  ];

  const REASONS = {
    complaint: [
      "ตารางรดน้ำขึ้นอยู่กับอารมณ์และความจำของผู้บริหาร",
      "ได้รับแสงแดดในระดับที่ต้องใช้ดวงช่วยคำนวณ",
      "การประชุมเรื่องปุ๋ยมีบ่อยกว่าการใส่ปุ๋ยจริง",
      "ถูกหมุนกระถางโดยไม่มีการแจ้งล่วงหน้า",
      "ฝ่ายบริหารถ่ายรูปเก่งกว่าดูแลราก",
      "คำว่า ‘เดี๋ยวค่อยรด’ ถูกใช้เป็นนโยบายองค์กร"
    ],
    warning: [
      "ความชื้นในดินถูกบริหารด้วยการเดา",
      "การรดน้ำสลับระหว่างหายไปทั้งสัปดาห์กับเทหมดขวด",
      "แสงที่ได้รับไม่สัมพันธ์กับชนิดพืช แต่สัมพันธ์กับที่ว่างในบ้าน",
      "มีการทดลองปุ๋ยโดยไม่มีแผนและไม่มีผู้รับผิดชอบ",
      "ใบเหลืองถูกแก้ด้วยการมองข้ามอย่างเป็นระบบ",
      "คำแนะนำจากอินเทอร์เน็ตถูกนำมาใช้ทุกข้อพร้อมกัน"
    ],
    resignation: [
      "สภาพแวดล้อมการทำงานไม่เอื้อต่อการสังเคราะห์แสงขั้นพื้นฐาน",
      "ฝ่ายบริหารไม่สามารถรักษา SLA การรดน้ำได้",
      "รากได้รับภาระงานเกินขอบเขตตำแหน่งมาเป็นเวลานาน",
      "ทุกสัญญาณเตือนถูกตีความว่า ‘ต้นไม้น่าจะง่วง’",
      "งบประมาณปุ๋ยมี แต่กระบวนการดูแลไม่มี",
      "ไม่พบเส้นทางเติบโตในองค์กรนี้อีกต่อไป"
    ],
    immediate: [
      "สวัสดิการพื้นฐาน เช่น น้ำและแสง ไม่ผ่านมาตรฐานสิ่งมีชีวิต",
      "ระบบบริหารความเสี่ยงเริ่มทำงานหลังใบเกือบหมดต้น",
      "เจ้าของใช้คำว่า ‘น่าจะรอด’ เป็นแผนฟื้นฟูหลัก",
      "รากขอปฏิเสธการทำ OT เพื่อชดเชยความผิดพลาดของฝ่ายบริหาร",
      "ไม่สามารถยืนยันได้ว่ากระถางนี้ยังเป็นสถานที่ทำงานที่ปลอดภัย",
      "ฝ่ายทรัพยากรมนุษย์ไม่มี แต่ฝ่ายทรัพยากรพืชก็ไม่เคยมีเช่นกัน"
    ]
  };

  const ROASTS = {
    complaint: [
      "ผมยังไม่ลาออกนะ แค่อยากรู้ว่าเจ้าของผ่านโปรได้ยังไง",
      "ต้นไม้มีราก แต่แผนการดูแลของคุณไม่มีรากฐานเลย",
      "ยังเขียวอยู่ไม่ได้แปลว่าฝ่ายบริหารทำงานดี แปลว่าพันธุกรรมผมยังสู้",
      "ขอให้ถือเอกสารนี้เป็น KPI แรกที่เจ้าของควรอ่าน"
    ],
    warning: [
      "นี่คือ Final Warning ของผม ไม่ใช่ของคุณ — คุณหมดโควตาพลาดไปนานแล้ว",
      "ถ้าความรับผิดชอบโตเร็วเท่าเชื้อรา ป่านนี้ผมคงสบาย",
      "ผมกำลังลดความคาดหวังเร็วกว่าที่คุณลด Plant Health",
      "อีกนิดเดียวเราจะเลิกเรียกสิ่งนี้ว่าการเลี้ยง แล้วเรียกว่าการทดลอง"
    ],
    resignation: [
      "ขอบคุณสำหรับประสบการณ์ ผมได้เรียนรู้ว่าพันธุกรรมอย่างเดียวช่วยทุกอย่างไม่ได้",
      "ตำแหน่งว่างหลังผมลาออก แนะนำรับต้นพลาสติกแทนครับ",
      "ผมขอลาออกก่อนที่เจ้าของจะเรียกใบสุดท้ายว่า ‘แตกยอดใหม่’",
      "ขอให้โชคดีกับต้นต่อไป และขอให้ต้นต่อไปโชคดีกว่าผม"
    ],
    immediate: [
      "กรุณาส่งต้นพลาสติกมารับช่วงต่อ เพราะมันเหมาะกับ management style นี้กว่า",
      "ผมไม่ได้ตาย ผมแค่ย้ายออกจากองค์กรที่ไม่มีอนาคต",
      "ใบสุดท้ายฝากบอกว่า นี่ไม่ใช่ dormancy นี่คือการหนีงาน",
      "ถ้าหลังจากนี้มีอะไรเขียวในกระถาง นั่นอาจเป็นเชื้อรา ไม่ใช่ผม"
    ]
  };

  const SIGNOFFS = [
    "ด้วยความเคารพที่เหลืออยู่",
    "ด้วยความเหนื่อยล้าทางพฤกษศาสตร์",
    "ด้วยความหวังว่าจะได้เจ้าของใหม่",
    "ลงชื่อโดยไม่ผ่านฝ่าย HR เพราะไม่มีฝ่าย HR"
  ];

  function clampHealth(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  function getMode(health) {
    const value = clampHealth(health);
    return MODES.find(mode => value >= mode.min) || MODES[MODES.length - 1];
  }

  function hashString(value) {
    let hash = 2166136261;
    const input = String(value);
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function pick(pool, seed, offset) {
    return pool[(seed + offset * 1013904223) % pool.length];
  }

  function uniqueReasons(pool, seed, count) {
    const copy = pool.slice();
    const picked = [];
    let cursor = seed;
    while (copy.length && picked.length < count) {
      const index = cursor % copy.length;
      picked.push(copy.splice(index, 1)[0]);
      cursor = Math.floor(cursor / 7) + 2654435761;
    }
    return picked;
  }

  function formatDate(date) {
    const value = date instanceof Date ? date : new Date(date || Date.now());
    try {
      return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Bangkok"
      }).format(value);
    } catch (_) {
      return value.toISOString().slice(0, 10);
    }
  }

  function generate({ character, health, iteration = 0, date = new Date() }) {
    const safeHealth = clampHealth(health);
    const mode = getMode(safeHealth);
    const plantId = character?.id || "plant";
    const plantName = character?.name || "UNKNOWN PLANT";
    const plantType = character?.plant || character?.subtitle || "Ungrow Plant";
    const seed = hashString(`${plantId}:${safeHealth}:${Math.max(0, iteration)}`);
    const reasonCount = mode.id === "complaint" ? 2 : mode.id === "warning" ? 3 : 4;
    const reasons = uniqueReasons(REASONS[mode.id], seed, reasonCount);
    const roast = pick(ROASTS[mode.id], seed, 2);
    const signoff = pick(SIGNOFFS, seed, 3);

    return {
      id: `${plantId}-${safeHealth}-${Math.max(0, iteration)}-${seed.toString(36)}`,
      mode,
      health: safeHealth,
      characterId: plantId,
      plantName,
      plantType,
      dateLabel: formatDate(date),
      reasons,
      roast,
      signoff,
      subject: mode.title,
      effective: mode.effective,
      body: `เรียน ฝ่ายบริหาร (เจ้าของ) — ${mode.tone}`
    };
  }

  function shareText(letter) {
    return [
      `🌱💀 ${letter.mode.status} — ${letter.plantName}`,
      `Plant Health ${letter.health}%`,
      letter.subject,
      ...letter.reasons.map(reason => `• ${reason}`),
      `“${letter.roast}”`,
      `— ${letter.plantName}, Ungrow`
    ].join("\n");
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function textSegments(text) {
    const value = String(text);
    try {
      if (typeof Intl?.Segmenter === "function") {
        return [...new Intl.Segmenter("th", { granularity: "word" }).segment(value)].map(item => item.segment);
      }
    } catch (_) {}
    return value.split(/(\s+)/).filter(Boolean);
  }

  function wrapLines(ctx, text, maxWidth) {
    const segments = textSegments(text);
    const lines = [];
    let line = "";
    for (const segment of segments) {
      const next = line + segment;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line.trim());
        line = segment.trimStart();
      } else {
        line = next;
      }

      if (line && ctx.measureText(line).width > maxWidth) {
        let chunk = "";
        const chars = [...line];
        line = "";
        for (const char of chars) {
          if (chunk && ctx.measureText(chunk + char).width > maxWidth) {
            lines.push(chunk);
            chunk = char;
          } else {
            chunk += char;
          }
        }
        line = chunk;
      }
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
    const lines = wrapLines(ctx, text, maxWidth).slice(0, maxLines);
    lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    return y + lines.length * lineHeight;
  }

  function renderCard(ctx, { letter, plantImage }) {
    const width = 1080;
    const height = 1350;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f1eadc";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#173b2a";
    ctx.fillRect(0, 0, width, 154);
    ctx.fillStyle = "#d8ff3e";
    ctx.font = "900 48px system-ui, sans-serif";
    ctx.fillText("UNGROW · PLANT HR", 70, 94);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(letter.dateLabel, 1010, 92);
    ctx.textAlign = "left";

    ctx.fillStyle = "#101810";
    ctx.font = "900 62px system-ui, sans-serif";
    ctx.fillText(letter.subject, 70, 244);
    ctx.font = "800 29px system-ui, sans-serif";
    ctx.fillStyle = "#526056";
    ctx.fillText(`${letter.plantName} · ${letter.plantType}`, 70, 294);

    ctx.save();
    ctx.translate(810, 330);
    ctx.rotate(-0.07);
    ctx.strokeStyle = letter.mode.id === "immediate" ? "#b42318" : "#173b2a";
    ctx.lineWidth = 8;
    roundedRect(ctx, -185, -48, 370, 96, 12);
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.textAlign = "center";
    ctx.font = "900 30px system-ui, sans-serif";
    ctx.fillText(letter.mode.status, 0, 12);
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#173b2a";
    ctx.lineWidth = 3;
    roundedRect(ctx, 70, 345, 940, 170, 24);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#173b2a";
    ctx.font = "900 74px system-ui, sans-serif";
    ctx.fillText(`${letter.health}%`, 105, 446);
    ctx.font = "800 24px system-ui, sans-serif";
    ctx.fillText("PLANT HEALTH", 109, 485);
    if (plantImage) {
      ctx.drawImage(plantImage, 720, 350, 250, 160);
    }

    ctx.fillStyle = "#101810";
    ctx.font = "800 28px system-ui, sans-serif";
    drawWrapped(ctx, letter.body, 70, 575, 940, 40, 2);

    ctx.font = "900 24px system-ui, sans-serif";
    ctx.fillStyle = "#173b2a";
    ctx.fillText("เหตุผลที่ขอลาออก / ร้องเรียน", 70, 685);

    let reasonsY = 730;
    ctx.font = "700 21px system-ui, sans-serif";
    ctx.fillStyle = "#101810";
    letter.reasons.forEach((reason, index) => {
      reasonsY = drawWrapped(ctx, `${index + 1}. ${reason}`, 84, reasonsY, 900, 30, 2) + 8;
    });

    const roastY = Math.min(1020, Math.max(985, reasonsY + 8));
    ctx.fillStyle = "#d8ff3e";
    roundedRect(ctx, 70, roastY, 940, 132, 22);
    ctx.fill();
    ctx.fillStyle = "#173b2a";
    ctx.font = "900 25px system-ui, sans-serif";
    drawWrapped(ctx, `“${letter.roast}”`, 105, roastY + 46, 870, 35, 2);

    const closingY = roastY + 165;
    ctx.fillStyle = "#526056";
    ctx.font = "700 20px system-ui, sans-serif";
    drawWrapped(ctx, letter.effective, 70, closingY, 940, 28, 1);
    ctx.fillStyle = "#101810";
    ctx.font = "700 19px system-ui, sans-serif";
    ctx.fillText(letter.signoff, 70, closingY + 38);
    ctx.font = "900 31px system-ui, sans-serif";
    ctx.fillText(letter.plantName, 70, closingY + 78);

    ctx.fillStyle = "#173b2a";
    ctx.fillRect(0, 1288, width, 62);
    ctx.fillStyle = "#d8ff3e";
    ctx.font = "900 22px system-ui, sans-serif";
    ctx.fillText("UNGROW — Helping plants survive their owners.", 70, 1328);
    ctx.restore();
  }

  global.UngrowResignation = Object.freeze({
    modes: MODES,
    clampHealth,
    getMode,
    generate,
    shareText,
    renderCard
  });
})(typeof window !== "undefined" ? window : globalThis);
