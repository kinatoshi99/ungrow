(() => {
  const somchaiConditions = [
    { min: 90, key: "healthy", title: "ยังปากดีอยู่", sub: "สุขภาพยังดี เลยยังมีแรงด่าเจ้าของ", color: "#2f6b45" },
    { min: 75, key: "tired", title: "เริ่มช้ำใจ", sub: "มีแผลนิดหน่อย แต่ยังมีแรงด่าเจ้าของ", color: "#6c8f49" },
    { min: 60, key: "bruised", title: "โทรมแต่ยังเถียงไหว", sub: "ขอบตาดำ ใบเริ่มตก และหมดศรัทธาในฝ่ายบริหาร", color: "#9a873c" },
    { min: 40, key: "sick", title: "ป่วยแต่ยังไม่ยอมไป", sub: "ติดปรอทกับใบแล้ว แต่ยังอยู่เพราะพันธุกรรมล้วน ๆ", color: "#c77935" },
    { min: 20, key: "critical", title: "เข้า ICU ต้นไม้", sub: "เฝือกมา กระถางร้าวแล้ว กรุณาหยุดดูแลเพิ่ม", color: "#c84b31" },
    { min: 1, key: "disaster", title: "ยับแบบมีตำนาน", sub: "แมลงวันเริ่มมา แต่เจ้าของยัง Confidence 97%", color: "#8f3f36" },
    { min: 0, key: "heaven", title: "ลาออกจากโลกพฤกษศาสตร์", sub: "RIP SOMCHAI — ผู้เสียหายจากการบริหาร", color: "#493551" }
  ];

  const ployConditions = [
    { min: 90, key: "healthy", title: "ยังพอไหวอยู่ค่ะ", sub: "ยังดูสงบอยู่ค่ะ โปรดอย่าทำให้เป็นเรื่อง", color: "#2f6b45" },
    { min: 75, key: "tired", title: "เริ่มน้อยใจ", sub: "ใบเริ่มตกนิดหนึ่ง และความไว้ใจก็ตกตาม", color: "#6c8f49" },
    { min: 60, key: "bruised", title: "ใจเริ่มบาง", sub: "ยังพยายามสวยอยู่ค่ะ แม้ฝ่ายดูแลจะไม่ช่วย", color: "#9a873c" },
    { min: 40, key: "sick", title: "อ่อนแออย่างมีมารยาท", sub: "ความสดชื่นลดลง แต่ความน้อยใจเพิ่มขึ้น", color: "#c77935" },
    { min: 20, key: "critical", title: "รับบทผู้เสียหาย", sub: "ตอนนี้ขอพื้นที่ปลอดภัยจากการดูแลเพิ่มเติม", color: "#c84b31" },
    { min: 1, key: "disaster", title: "ใกล้หมดศรัทธา", sub: "ใบแทบหมดแรงแล้ว แต่ยังรักษามารยาทอยู่ค่ะ", color: "#8f3f36" },
    { min: 0, key: "heaven", title: "ลาออกอย่างสง่างาม", sub: "PLOY ขอลาออกจากความสัมพันธ์นี้อย่างสง่างาม", color: "#493551" }
  ];

  window.UngrowCharacters = Object.freeze({
    somchai: Object.freeze({
      id: "somchai", name: "SOMCHAI", plant: "Snake Plant", subtitle: "Snake Plant · Stoic Introvert",
      personality: "stoic_introvert", archetype: "survivor", ownerSkill: 21, rendererId: "somchai",
      roasts: [
        "กูรอดเอง ไม่ต้องเคลมผลงาน", "เจ้าของ Skill 12% แต่ Confidence 97%",
        "ธรรมชาติสร้างกูมาแข็งแรง เผื่อเจอเจ้าของแบบมึง", "KPI วันนี้: เอาตัวรอดจากเจ้าของ",
        "วันนี้ยังไม่ตาย ผิดแผนนิดหน่อย", "กูเป็นต้นไม้ ไม่ใช่โปรเจกต์ทดลอง",
        "ไม่ต้องห่วงกู ห่วงต้นถัดไปก่อน", "ถ้าจะลืมกันขนาดนี้ ซื้อก้อนหินน่าจะเหมาะกว่า",
        "ผ่านมาเยอะ เจอฝ่ายบริหารแบบนี้ก็เพิ่งเคย", "รอดมาได้ไม่ใช่เพราะเจ้าของ แต่เพราะพันธุกรรม"
      ],
      conditions: somchaiConditions,
      awardLines: ["เจ้าของที่ต้นไม้ไม่เคยร้องขอ"],
      hashtags: ["#Ungrow", "#PlantRoast", "#SnakePlant"],
      exportLayout: { plantX: 330, plantY: 286, plantSize: 420 }
    }),
    ploy: Object.freeze({
      id: "ploy", name: "PLOY", plant: "Peace Lily", subtitle: "Peace Lily · Dramatic Softie",
      personality: "dramatic_softie", archetype: "passive_aggressive", ownerSkill: 18, rendererId: "ploy",
      roasts: [
        "ไม่ได้ตายค่ะ แค่อยู่แบบไม่มีความสุข", "ถ้าจะดูแลแบบนี้ ปล่อยฉันไปเถอะค่ะ",
        "ใบตกไม่ใช่แฟชั่นนะคะ มันคือสภาพจิตใจ", "ฉันไม่ได้อ่อนแอ เจ้าของต่างหากที่บริหารแย่",
        "ขอบคุณที่นึกถึงกัน... หลังจากฉันเกือบลาโลก", "ฉันไม่ต้องการคำขอโทษ ฉันต้องการความสม่ำเสมอ",
        "ฉันเหี่ยวได้ละเอียดมาก เพราะเจ้าของใส่ใจน้อยมาก", "อยู่กับคุณแล้วฉันเรียนรู้คำว่า survival",
        "ทุกใบที่ร่วง คือ feedback ที่คุณไม่เคยอ่าน", "ฉันยังสวยอยู่ค่ะ ถ้ามองข้าม trauma ไป"
      ],
      conditions: ployConditions,
      awardLines: [
        "เจ้าของที่ทำต้นไม้รู้สึกผิดได้เก่งมาก", "ความสัมพันธ์เป็นพิษ แต่ต้นไม้ยังอยู่",
        "ดูแลแบบงง ๆ แต่ทำต้นไม้เครียดจริง"
      ],
      hashtags: ["#Ungrow", "#PlantRoast", "#PeaceLily"],
      exportLayout: { plantX: 330, plantY: 286, plantSize: 420 }
    })
  });
})();
