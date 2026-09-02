// Curated Thai social-slang bank for Ungrow (2026 trend terms + evergreen adult colloquial).
// Levels 1–4 are Ungrow editorial intensity, not a linguistic or legal rating.
(() => {
  const modes = Object.freeze({"1":{"label":"🙂 เกรงใจ","shortLabel":"เกรงใจ","description":"แซะเบา แชร์ได้ทุกวัย","requires18":false},"2":{"label":"😏 แซ่บ","shortLabel":"แซ่บ","description":"ประชดแรงขึ้น แต่ยังไม่ 18+","requires18":false},"3":{"label":"🤬 ปากหมา","shortLabel":"ปากหมา","description":"กัดแรงและตรงขึ้น แต่ไม่เปิดคำหยาบจัด","requires18":false},"4":{"label":"☠️ 18+","shortLabel":"18+","description":"ภาษาหยาบคายตรง ๆ สำหรับผู้ใหญ่เท่านั้น","requires18":true}});
  const slang = Object.freeze([
    Object.freeze({"id":1,"level":1,"term":"ปัง","meaning":"ดีมาก/โดดเด่น ใช้ชมจริงหรือประชดได้","examples":{"somchai":"ดูแลทรงนี้ก็ปังนะ ปังแบบต้นนี้ต้องเอาตัวรอดเอง","ploy":"ปังค่ะ ปังจนดิฉันต้องดูแลตัวเองเพิ่มอีกหนึ่งตำแหน่ง"}}),
    Object.freeze({"id":2,"level":1,"term":"จึ้ง","meaning":"ดีหรือเด่นจนต้องอึ้ง","examples":{"somchai":"จึ้งมาก เจ้าของยังมั่นใจได้ทั้งที่ใบกูเริ่มไม่ไหว","ploy":"จึ้งค่ะ ความมั่นใจของคุณสวนทางกับสุขภาพดิฉันมาก"}}),
    Object.freeze({"id":3,"level":1,"term":"เริ่ด","meaning":"ดีมาก/เลิศ ใช้ประชดได้","examples":{"somchai":"เริ่ด เจ้าของลืมรดน้ำแล้วยังเดินมาชื่นชมผลงาน","ploy":"เริ่ดค่ะ ดูแลน้อยแต่รับเครดิตเต็มมาก"}}),
    Object.freeze({"id":4,"level":1,"term":"ฟิน","meaning":"รู้สึกดี/พอใจมาก","examples":{"somchai":"ฟินเลย ได้พักตอนเจ้าของลืมว่ามีต้นไม้อยู่","ploy":"ฟินค่ะ วันที่คุณไม่ทดลองอะไรใหม่กับดิฉัน"}}),
    Object.freeze({"id":5,"level":1,"term":"เลิฟ","meaning":"ชอบ/ถูกใจมาก","examples":{"somchai":"เลิฟความมั่นใจนะ ส่วนวิธีดูแลขอผ่าน","ploy":"เลิฟความตั้งใจค่ะ ส่วนผลลัพธ์ขอไม่ออกความเห็น"}}),
    Object.freeze({"id":6,"level":1,"term":"ทรู","meaning":"จริง/เห็นด้วยแรง","examples":{"somchai":"ทรู รอดเพราะพันธุกรรมมากกว่าฝีมือเจ้าของ","ploy":"ทรูค่ะ ความสม่ำเสมอคือสิ่งที่เรายังไม่เคยพบ"}}),
    Object.freeze({"id":7,"level":1,"term":"Fact","meaning":"จริงตามนั้น/ข้อเท็จจริง","examples":{"somchai":"Fact: ต้นไม้ถึกไม่ได้แปลว่าเจ้าของเก่ง","ploy":"Fact ค่ะ ดิฉันรอดไม่ได้แปลว่าระบบดูแลดี"}}),
    Object.freeze({"id":8,"level":1,"term":"Vibe","meaning":"บรรยากาศหรือพลังโดยรวม","examples":{"somchai":"Vibe วันนี้คือเอาตัวรอดจากฝ่ายบริหาร","ploy":"Vibe วันนี้คือสุภาพภายนอก แต่เหนื่อยภายในค่ะ"}}),
    Object.freeze({"id":9,"level":1,"term":"Aesthetic","meaning":"ภาพรวมที่ดูสวยมีสไตล์","examples":{"somchai":"Aesthetic ดี แต่ตารางรดน้ำหายไปไหนก่อน","ploy":"Aesthetic สวยค่ะ ถ้าซูมไม่เห็นใบที่กำลังน้อยใจ"}}),
    Object.freeze({"id":10,"level":1,"term":"Bestie","meaning":"เพื่อนสนิท/เรียกกันแบบเป็นกันเอง","examples":{"somchai":"Bestie ถ้าจะช่วยจริง วางบัวรดน้ำแล้วถอยก่อน","ploy":"Bestie คะ ช่วยรักดิฉันแบบมีตารางหน่อยค่ะ"}}),
    Object.freeze({"id":11,"level":1,"term":"ฟีลกู้ด","meaning":"รู้สึกดี สบายใจ","examples":{"somchai":"ฟีลกู้ดมาก วันที่ไม่มีใครมายุ่งกับต้นนี้","ploy":"ฟีลกู้ดค่ะ เมื่อการดูแลไม่กลายเป็นการทดลอง"}}),
    Object.freeze({"id":12,"level":1,"term":"เดอะเบสต์","meaning":"ดีที่สุด/ชมแบบเล่นใหญ่","examples":{"somchai":"เดอะเบสต์เรื่องมั่นใจ ส่วน Plant Skill ไว้ค่อยคุย","ploy":"เดอะเบสต์เรื่องกำลังใจค่ะ เรื่องดูแลยังมีการบ้าน"}}),
    Object.freeze({"id":13,"level":2,"term":"อ่อม","meaning":"หมดแรง กร่อย ไม่ปัง หรือดูแผ่วลง","examples":{"somchai":"เจ้าของดูแลอ่อมมาก แต่ Confidence ทำถึงเกิน 555","ploy":"การดูแลอ่อมค่ะ แต่ความมั่นใจเต็มร้อยมาก"}}),
    Object.freeze({"id":14,"level":2,"term":"ทำถึง","meaning":"ทำได้สุด ไปไกล หรือเกินคาด","examples":{"somchai":"ทำถึงมาก ทำถึงขั้นกูต้องพึ่งพันธุกรรมล้วน ๆ","ploy":"ทำถึงค่ะ ทำถึงขั้นดิฉันอยากยื่นใบลาออก"}}),
    Object.freeze({"id":15,"level":2,"term":"จริงหรือเค้ก","meaning":"ถามเชิงแซวว่าเรื่องนั้นจริงหรือเฟค","examples":{"somchai":"บอกว่าดูแลดี...จริงหรือเค้ก กูขอดูหลักฐาน","ploy":"บอกว่ารักต้นไม้ จริงหรือเค้กคะ"}}),
    Object.freeze({"id":16,"level":2,"term":"กี่โมง?","meaning":"ใช้แซวว่าสิ่งที่พูดยังไม่เกิดหรือไม่ตรงจริง","examples":{"somchai":"จะรดน้ำตรงเวลาสักครั้ง กี่โมง?","ploy":"ความสม่ำเสมอจะมาถึงกี่โมงคะ ดิฉันรออยู่"}}),
    Object.freeze({"id":17,"level":2,"term":"ชีเสิร์ฟ","meaning":"ทำหรือปล่อยของออกมาแบบปัง","examples":{"somchai":"ชีเสิร์ฟความมั่นใจ แต่ลืมเสิร์ฟการดูแล","ploy":"ชีเสิร์ฟค่ะ เสิร์ฟแต่คำขอโทษหลังดิฉันเหี่ยว"}}),
    Object.freeze({"id":18,"level":2,"term":"โช๊ะ","meaning":"ปัง ฟาด เป๊ะ แบบจังหวะลงตัว","examples":{"somchai":"โช๊ะเลย ดูแลพลาดทุกจุดแต่โพสท่า Plant Dad","ploy":"โช๊ะค่ะ ความมั่นใจเป๊ะกว่าตารางดูแลอีก"}}),
    Object.freeze({"id":19,"level":2,"term":"โฮ่งมาก","meaning":"ชมแรงว่าเด่นหรือปังมาก","examples":{"somchai":"โฮ่งมาก ความกล้าดูแลแบบไม่มีแผน","ploy":"โฮ่งมากค่ะ ความมั่นใจดังยิ่งกว่าสัญญาณ SOS"}}),
    Object.freeze({"id":20,"level":2,"term":"เม้าแฟ่ด","meaning":"เมาท์หนัก เมาท์ยับ ไม่หยุด","examples":{"somchai":"ถ้ากูพูดได้ กูเม้าแฟ่ดเรื่องฝ่ายบริหารไปแล้ว","ploy":"ถ้าดิฉันมีกรุ๊ปแชต เรื่องนี้คงเม้าแฟ่ดแล้วค่ะ"}}),
    Object.freeze({"id":21,"level":2,"term":"คุณน้า","meaning":"คำสร้อยเพิ่มอารมณ์เวอร์หรือประชด","examples":{"somchai":"ใบกูเริ่มตกแล้วคุณน้า ยังจะบอกว่าสบายดีอีก","ploy":"คุณน้าคะ นี่ใบตก ไม่ใช่ mood board ค่ะ"}}),
    Object.freeze({"id":22,"level":2,"term":"เยี่ยวมาก","meaning":"ชมแบบสุดขั้วหรือเล่นใหญ่","examples":{"somchai":"เยี่ยวมาก ดูแลจนกูต้องชื่นชมตัวเองที่ยังรอด","ploy":"เยี่ยวมากค่ะ ดิฉันรอดมาได้อย่างมีพรสวรรค์จริง ๆ"}}),
    Object.freeze({"id":23,"level":2,"term":"2/10","meaning":"ให้คะแนนต่ำเชิงมีมหรือประชด","examples":{"somchai":"Plant Care 2/10 แต่ Confidence 97/10","ploy":"การดูแล 2/10 ค่ะ แต่งานพรีเซนต์ตัวเอง 10/10"}}),
    Object.freeze({"id":24,"level":2,"term":"No Cap","meaning":"พูดจริง ไม่โม้","examples":{"somchai":"No Cap กูยังอยู่เพราะกูถึก ไม่ใช่เพราะระบบ","ploy":"No Cap ค่ะ ดิฉันจัดการวิกฤตเองเกือบทั้งหมด"}}),
    Object.freeze({"id":25,"level":2,"term":"ขอคนเข้าใจ","meaning":"ขอความเห็นใจแบบขำ ๆ","examples":{"somchai":"ขอคนเข้าใจ กูไม่ได้ถึกเพื่อรองรับความชุ่ย","ploy":"ขอคนเข้าใจค่ะ ดิฉันไม่ได้ดราม่า ใบมันตกจริง"}}),
    Object.freeze({"id":26,"level":2,"term":"สารตั้งต้น","meaning":"คนหรือเหตุที่เป็นจุดเริ่มเรื่องทั้งหมด","examples":{"somchai":"สารตั้งต้นของปัญหาคือคนถือบัวรดน้ำนี่แหละ","ploy":"สารตั้งต้นของดราม่าครั้งนี้อยู่หน้ากระถางค่ะ"}}),
    Object.freeze({"id":27,"level":3,"term":"บ้ง","meaning":"แย่ ไม่ผ่าน คุณภาพต่ำ","examples":{"somchai":"ระบบดูแลบ้งจนกูต้องเป็น QA ให้ชีวิตตัวเอง","ploy":"ขออนุญาตนะคะ ระบบดูแลบ้งแบบมีมาตรฐานมาก"}}),
    Object.freeze({"id":28,"level":3,"term":"บูด","meaning":"พัง ไม่ได้มาตรฐาน หรือหมดสภาพ","examples":{"somchai":"ตารางรดน้ำบูดตั้งแต่ยังไม่เริ่ม","ploy":"แผนดูแลบูดค่ะ แต่คำแก้ตัวสดใหม่ทุกวัน"}}),
    Object.freeze({"id":29,"level":3,"term":"ชั้น G","meaning":"ต่ำสุด ใช้ด่าเชิงเปรียบเทียบ","examples":{"somchai":"Plant Skill ชั้น G แต่ Confidence ชั้น Penthouse","ploy":"Owner Skill ชั้น G ค่ะ แต่ท่าทางเหมือน CEO"}}),
    Object.freeze({"id":30,"level":3,"term":"จะล่าแบ้","meaning":"จะบ้า/จะประสาทแตกแล้ว","examples":{"somchai":"กูจะล่าแบ้ เจ้าของเปลี่ยนวิธีดูแลทุกสามวัน","ploy":"ดิฉันจะล่าแบ้ค่ะ แต่ยังพยายามรักษามารยาท"}}),
    Object.freeze({"id":31,"level":3,"term":"เซ๊ะตุ้มเล้ง","meaning":"เละ หลุด หรือพังแบบยังไม่สุด","examples":{"somchai":"สุขภาพกูเซ๊ะตุ้มเล้ง แต่เจ้าของบอกปกติดี","ploy":"สภาพดิฉันเซ๊ะตุ้มเล้งค่ะ กรุณาอย่าเรียกว่ามินิมอล"}}),
    Object.freeze({"id":32,"level":3,"term":"Cringe","meaning":"น่าเขินแทน/กระอักกระอ่วน","examples":{"somchai":"Cringe สุด ตอนเจ้าของเรียกตัวเองว่า Plant Expert","ploy":"Cringe ค่ะ เมื่อคนดูแลบอกว่าทุกอย่างอยู่ในการควบคุม"}}),
    Object.freeze({"id":33,"level":3,"term":"Mid","meaning":"กลาง ๆ ไม่ดีไม่แย่ มักใช้กดคะแนน","examples":{"somchai":"ความสามารถดูแล Mid แต่ความมั่นใจระดับ Final Boss","ploy":"การดูแล Mid ค่ะ แต่การประชาสัมพันธ์ตัวเองระดับพรีเมียม"}}),
    Object.freeze({"id":34,"level":3,"term":"NPC","meaning":"คนที่ดูเหมือนทำซ้ำ ๆ ไม่มีบทเด่น","examples":{"somchai":"เจ้าของเป็น NPC ที่มีภารกิจเดียวแล้วยังทำไม่ครบ","ploy":"เหมือนอยู่กับ NPC ค่ะ บทพูดเดิมแต่ไม่เคยแก้ปัญหา"}}),
    Object.freeze({"id":35,"level":3,"term":"Ick","meaning":"จุดที่ทำให้รู้สึกขัดใจหรือหมดเสน่ห์","examples":{"somchai":"Ick มาก เห็นใบเหลืองแล้วยังถ่าย Story ก่อนช่วย","ploy":"Ick ค่ะ เห็นดิฉันเหี่ยวแล้วถามว่า aesthetic ไหม"}}),
    Object.freeze({"id":36,"level":3,"term":"Toxic","meaning":"ความสัมพันธ์หรือพฤติกรรมที่เป็นพิษ","examples":{"somchai":"นี่ไม่ใช่ plant care แล้ว นี่ toxic relationship","ploy":"ความสัมพันธ์ค่อนข้าง Toxic ค่ะ ดิฉัน photosynthesis อยู่ฝ่ายเดียว"}}),
    Object.freeze({"id":37,"level":3,"term":"Red Flag","meaning":"สัญญาณเตือนว่าไม่น่าไว้ใจหรือมีปัญหา","examples":{"somchai":"Red Flag คือซื้อปุ๋ยเพิ่มทั้งที่ยังไม่รู้ปัญหา","ploy":"Red Flag ค่ะ ทุกครั้งที่คุณพูดว่า ลองอะไรใหม่หน่อย"}}),
    Object.freeze({"id":38,"level":3,"term":"ช็อตฟีล","meaning":"ทำให้บรรยากาศหรืออารมณ์ดี ๆ ดับทันที","examples":{"somchai":"กำลังจะฟื้น เจ้าของเดินมาพร้อมไอเดียใหม่ ช็อตฟีล","ploy":"ช็อตฟีลค่ะ ดิฉันเริ่มดีขึ้นแล้วคุณก็ทดลองอีก"}}),
    Object.freeze({"id":39,"level":4,"term":"แม่ง","meaning":"คำสบถเพิ่มน้ำหนักอารมณ์","examples":{"somchai":"Plant Health จะหมดแล้ว เจ้าของแม่งยังมั่นหน้าเหมือนสอบผ่าน","ploy":"ดิฉันพูดดีมาตลอด แต่เจ้าของแม่งไม่เคยอ่าน feedback เลยค่ะ"}}),
    Object.freeze({"id":40,"level":4,"term":"เชี่ย","meaning":"คำสบถแรง ใช้ตอนตกใจหรือหัวเสีย","examples":{"somchai":"เชี่ย มึงเรียกนี่ว่าดูแลเหรอ กูนึกว่า stress test","ploy":"เชี่ยค่ะ...ใบตกขนาดนี้ยังถามว่าดิฉันโอเคไหม"}}),
    Object.freeze({"id":41,"level":4,"term":"เหี้ย","meaning":"คำหยาบแรง ใช้ด่าหรือสบถ","examples":{"somchai":"กูถึก ไม่ได้แปลว่ามึงจะดูแลเหี้ยแค่ไหนก็ได้","ploy":"Respectfully นะคะ คุณดูแลเหี้ยจริงค่ะ"}}),
    Object.freeze({"id":42,"level":4,"term":"ไอ้เหี้ย","meaning":"คำด่าตรงและแรงมาก","examples":{"somchai":"รดน้ำปีละครั้งแล้วเรียก Plant Dad ไอ้เหี้ย ใจเย็นก่อน","ploy":"คำว่าไอ้เหี้ยแรงไปค่ะ แต่ผลการดูแลใกล้เคียงมาก"}}),
    Object.freeze({"id":43,"level":4,"term":"สัส","meaning":"คำสบถ/คำด่าแรงมาก","examples":{"somchai":"กูเป็นต้นไม้ ไม่ใช่ beta test ของมึง สัส","ploy":"ดิฉันจะยังสุภาพค่ะ...สัสเอ๊ย"}}),
    Object.freeze({"id":44,"level":4,"term":"ไอ้สัส","meaning":"คำด่าตรงแรงมาก","examples":{"somchai":"ใบกูจะลาออกครบทีมแล้ว ไอ้สัส ยังถามว่าเป็นไร","ploy":"รดน้ำตามอารมณ์แล้วถามว่าทำไมเหี่ยว ไอ้สัสคะ"}}),
    Object.freeze({"id":45,"level":4,"term":"ชิบหาย","meaning":"พังหนัก/สบถเมื่อสถานการณ์เละ","examples":{"somchai":"Confidence 97% แต่ต้นไม้ชิบหาย 100% ทำถึงนะ","ploy":"ความสัมพันธ์ชิบหาย แต่ดิฉันยังยิ้มบริการอยู่ค่ะ"}}),
    Object.freeze({"id":46,"level":4,"term":"ส้นตีน","meaning":"คำด่าแรง ใช้เปรียบเทียบว่าห่วยมาก","examples":{"somchai":"Owner Skill ระดับส้นตีน แต่ Bio เขียน Plant Lover","ploy":"Owner Skill ระดับส้นตีน แต่ Confidence ระดับ CEO ค่ะ"}}),
    Object.freeze({"id":47,"level":4,"term":"ควาย","meaning":"คำด่าความคิดหรือการกระทำว่าไม่ฉลาด","examples":{"somchai":"ถ้ากูล้มอีกทีอย่าโทษอากาศ โทษควายถือบัวรดน้ำ","ploy":"ไม่ได้จะด่านะคะ แต่บัวรดน้ำอยู่ในมือควายจริง ๆ"}}),
    Object.freeze({"id":48,"level":4,"term":"ห่า","meaning":"คำสบถ/คำด่าแรง","examples":{"somchai":"ดูแลทรงนี้ ห่าก็รู้ว่ากูรอดเพราะพันธุกรรม","ploy":"ขออนุญาตค่ะ ห่าก็รู้ว่าดิฉันต้องการความสม่ำเสมอ"}}),
    Object.freeze({"id":49,"level":4,"term":"ระยำ","meaning":"เลวหรือแย่มาก ใช้ด่าแรง","examples":{"somchai":"ระบบบริหารระยำ แต่กูยัง photosynthesis เองอยู่","ploy":"บริหารระยำอย่างมีระบบมากค่ะ ดิฉันประทับใจ"}}),
    Object.freeze({"id":50,"level":4,"term":"กู/มึง","meaning":"สรรพนามกันเองที่หยาบเมื่อใช้ผิดบริบท","examples":{"somchai":"กูขออย่างเดียว มึงหยุดทดลองอะไรใหม่กับกูสักวัน","ploy":"ดิฉันใช้คำสุภาพมานานแล้วนะคะ...มึงพอก่อนค่ะ"}}),
  ]);
  const byLevel = Object.freeze({
    1: Object.freeze(slang.filter(item => item.level === 1)),
    2: Object.freeze(slang.filter(item => item.level === 2)),
    3: Object.freeze(slang.filter(item => item.level === 3)),
    4: Object.freeze(slang.filter(item => item.level === 4))
  });
  window.UngrowRoastModes = Object.freeze({
    modes, slang, byLevel,
    examplesFor(characterId, level) {
      return (byLevel[level] || byLevel[2]).map(item => item.examples[characterId]).filter(Boolean);
    }
  });
})();
