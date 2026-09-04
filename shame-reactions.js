(() => {
  "use strict";

  const catalog = Object.freeze({
    mugshot: Object.freeze({ id:"mugshot", name:"Mugshot Leaf", hook:"OWNER FOUND GUILTY", min:21, max:30, tone:"shame" }),
    judging: Object.freeze({ id:"judging", name:"Judging Leaf", hook:"JUDGING MODE: ACTIVE", min:61, max:100, tone:"judge" }),
    slowclap: Object.freeze({ id:"slowclap", name:"Slow Clap Leaf", hook:"CONGRATULATIONS, YOU FAILED", min:41, max:70, tone:"sarcasm" }),
    teasip: Object.freeze({ id:"teasip", name:"Tea Sip Leaf", hook:"NOT MY BUSINESS", min:71, max:100, tone:"sarcasm" }),
    confused: Object.freeze({ id:"confused", name:"Confused Sprout", hook:"CARE PLAN: ERROR", min:46, max:70, tone:"confused" }),
    whisper: Object.freeze({ id:"whisper", name:"Whisper Leaf Duo", hook:"PLANT HR: LEAKED GOSSIP", min:31, max:60, tone:"gossip" }),
    chaos: Object.freeze({ id:"chaos", name:"Chaos Leaf", hook:"ABSOLUTE CHAOS", min:11, max:25, tone:"panic" }),
    megaphone: Object.freeze({ id:"megaphone", name:"Megaphone Leaf", hook:"UNFAIR LABOR PRACTICES", min:16, max:40, tone:"protest" }),
    thisisfine: Object.freeze({ id:"thisisfine", name:"This Is Fine Leaf", hook:"EVERYTHING IS FINE (IT'S NOT)", min:5, max:20, tone:"denial" }),
    deadinside: Object.freeze({ id:"deadinside", name:"Dead Inside Leaf", hook:"EMOTIONALLY DETACHED", min:0, max:15, tone:"critical" }),
    resignation: Object.freeze({ id:"resignation", name:"Resignation Leaf", hook:"I QUIT.", min:0, max:10, tone:"resign" }),
    survivor: Object.freeze({ id:"survivor", name:"Survivor Leaf", hook:"BARELY SURVIVED YOUR CARE", min:21, max:45, tone:"survivor" })
  });

  const pools = Object.freeze({
    excellent: Object.freeze([catalog.judging, catalog.teasip, catalog.slowclap]),
    good: Object.freeze([catalog.judging, catalog.teasip, catalog.confused]),
    warning: Object.freeze([catalog.confused, catalog.slowclap, catalog.whisper]),
    bad: Object.freeze([catalog.mugshot, catalog.survivor, catalog.megaphone, catalog.whisper]),
    emergency: Object.freeze([catalog.chaos, catalog.megaphone, catalog.thisisfine, catalog.survivor]),
    critical: Object.freeze([catalog.deadinside, catalog.resignation, catalog.thisisfine, catalog.chaos])
  });

  function bandFor(health = 50) {
    const value = Math.max(0, Math.min(100, Number(health)));
    if (value >= 86) return "excellent";
    if (value >= 61) return "good";
    if (value >= 41) return "warning";
    if (value >= 21) return "bad";
    if (value >= 11) return "emergency";
    return "critical";
  }

  function hash(text) {
    let value = 2166136261;
    for (const ch of String(text)) {
      value ^= ch.codePointAt(0);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function select({ health=50, character, characterId, roastMode=2, roastIndex=0, daily, dailyKey }={}) {
    const band = bandFor(health);
    const pool = pools[band];
    const id = character?.id || characterId || "somchai";
    const day = daily?.key || dailyKey || "";
    const seed = [band,id,roastMode,roastIndex,day].join("|");
    let reaction = pool[hash(seed) % pool.length];

    if (health <= 10 && roastMode >= 3) reaction = catalog.resignation;
    else if (health === 0) reaction = catalog.deadinside;
    return reaction;
  }

  function rounded(ctx,x,y,w,h,r=18) {
    ctx.beginPath();
    ctx.roundRect(x,y,w,h,r);
  }
  function paper(ctx, fill, stroke="#173b2a") {
    ctx.fillStyle=fill; ctx.fill();
    ctx.strokeStyle=stroke; ctx.lineWidth=4; ctx.stroke();
  }
  function leafPath(ctx,cx,cy,w,h,tilt=0) {
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(tilt);
    ctx.beginPath();
    ctx.moveTo(0,-h/2);
    ctx.bezierCurveTo(w*.52,-h*.28,w*.5,h*.24,0,h/2);
    ctx.bezierCurveTo(-w*.5,h*.24,-w*.52,-h*.28,0,-h/2);
    ctx.closePath();
    ctx.restore();
  }
  function face(ctx,cx,cy,emotion="flat",scale=1) {
    const ink="#142e22", cream="#fff5df";
    ctx.fillStyle=cream;
    const eyeY=cy-10*scale;
    const eyeDx=30*scale;
    for(const side of [-1,1]){
      ctx.beginPath(); ctx.ellipse(cx+side*eyeDx,eyeY,20*scale,14*scale,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=ink;
      let pupilX=cx+side*eyeDx;
      if(emotion==="side") pupilX+=12*scale;
      ctx.beginPath(); ctx.arc(pupilX,eyeY,6*scale,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=cream;
    }
    ctx.strokeStyle=ink; ctx.lineWidth=5*scale; ctx.lineCap="round";
    ctx.beginPath();
    if(emotion==="panic"){ ctx.arc(cx,cy+28*scale,18*scale,0,Math.PI*2); }
    else if(emotion==="smirk"){ ctx.arc(cx,cy+16*scale,18*scale,.1*Math.PI,.9*Math.PI); }
    else { ctx.moveTo(cx-15*scale,cy+22*scale); ctx.lineTo(cx+15*scale,cy+22*scale); }
    ctx.stroke();
  }
  function arm(ctx,x1,y1,x2,y2) {
    ctx.strokeStyle="#294d34"; ctx.lineWidth=14; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo((x1+x2)/2,y1-18,x2,y2); ctx.stroke();
  }
  function note(ctx,text,x,y,w,fill="#f2c14e",ink="#173b2a",angle=0) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    rounded(ctx,-w/2,-32,w,64,8); paper(ctx,fill,ink);
    ctx.fillStyle=ink; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.font='900 19px system-ui,sans-serif';
    ctx.fillText(text,0,2,w-18);
    ctx.restore();
  }
  function baseLeaf(ctx,x,y,s,{emotion="flat",color="#5e8541",tilt=0}={}) {
    ctx.save();
    ctx.shadowColor="rgba(23,59,42,.22)"; ctx.shadowBlur=12; ctx.shadowOffsetY=8;
    leafPath(ctx,x,y,s*.62,s*.8,tilt); paper(ctx,color);
    ctx.shadowColor="transparent";
    ctx.strokeStyle="#36562e"; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(x,y-s*.32); ctx.lineTo(x,y+s*.3); ctx.stroke();
    face(ctx,x,y-s*.01,emotion,s/260);
    ctx.restore();
  }
  function tape(ctx,x,y,angle=0) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    ctx.fillStyle="rgba(218,190,137,.82)"; ctx.fillRect(-34,-12,68,24); ctx.restore();
  }

  function draw(ctx,reaction,{x=540,y=540,size=470}={}) {
    const id=reaction?.id || "judging";
    ctx.save();
    ctx.translate(x,y);
    const s=size;
    ctx.translate(-x,-y);

    if(id==="whisper"){
      baseLeaf(ctx,x-s*.18,y,s*.58,{emotion:"side",color:"#416f49",tilt:-.12});
      baseLeaf(ctx,x+s*.18,y+s*.02,s*.55,{emotion:"side",color:"#829d4d",tilt:.12});
      arm(ctx,x-s*.05,y+s*.08,x+s*.05,y-s*.05);
      note(ctx,"DID YOU SEE THAT?",x,y-s*.42,s*.58,"#f6ead0","#173b2a",-.03);
    } else {
      const emotion = ["chaos"].includes(id) ? "panic" : ["judging","teasip","slowclap","mugshot"].includes(id) ? "side" : "flat";
      const color = id==="deadinside" ? "#7a8454" : id==="thisisfine" ? "#697d38" : "#668d43";
      baseLeaf(ctx,x,y,s*.78,{emotion,color,tilt:id==="chaos"?.03:0});

      if(id==="mugshot"){
        ctx.strokeStyle="#7e8c79"; ctx.lineWidth=3;
        for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x-s*.47,y+i*58);ctx.lineTo(x+s*.47,y+i*58);ctx.stroke();}
        note(ctx,"OWNER ISSUE.",x,y+s*.28,s*.55,"#172f25","#fff5df",0);
        tape(ctx,x-s*.3,y-s*.29,-.15);
      }
      if(id==="judging"){
        arm(ctx,x-s*.17,y+s*.12,x+s*.06,y+s*.19);
        arm(ctx,x+s*.17,y+s*.12,x-s*.06,y+s*.19);
        note(ctx,"BE SO FR.",x+s*.3,y-s*.28,s*.32,"#d9c59d","#173b2a",.05);
      }
      if(id==="slowclap"){
        arm(ctx,x-s*.12,y+s*.06,x-s*.01,y+s*.16);
        arm(ctx,x+s*.12,y+s*.06,x+s*.01,y+s*.16);
        note(ctx,"*CLAP* ... *CLAP*",x,y-s*.36,s*.55,"#f2c14e","#173b2a",-.03);
      }
      if(id==="teasip"){
        rounded(ctx,x+s*.07,y+s*.08,s*.28,s*.18,16); paper(ctx,"#f7ead0");
        ctx.strokeStyle="#173b2a";ctx.lineWidth=5;ctx.beginPath();ctx.arc(x+s*.22,y+s*.17,s*.09,-Math.PI/2,Math.PI/2);ctx.stroke();
        note(ctx,"NOT MY BUSINESS",x+s*.18,y-s*.35,s*.5,"#f6ead0","#173b2a",.03);
      }
      if(id==="confused"){
        note(ctx,"?",x-s*.33,y-s*.25,s*.18,"#f2c14e","#173b2a",-.12);
        note(ctx,"H₂O?",x+s*.31,y-s*.2,s*.28,"#7fb3cf","#173b2a",.08);
        note(ctx,"CARE PLAN: ERROR",x,y+s*.34,s*.58,"#f6ead0","#173b2a",-.02);
      }
      if(id==="chaos"){
        ctx.fillStyle="#d34f35";
        for(let i=0;i<8;i++){const a=Math.PI*2*i/8;ctx.save();ctx.translate(x+Math.cos(a)*s*.42,y+Math.sin(a)*s*.38);ctx.rotate(a);ctx.fillRect(-4,-20,8,40);ctx.restore();}
        note(ctx,"WATER. NOW.",x,y+s*.37,s*.5,"#d34f35","#fff5df",0);
      }
      if(id==="megaphone"){
        ctx.save();ctx.translate(x+s*.25,y+s*.05);ctx.rotate(-.14);
        ctx.fillStyle="#d34f35";ctx.beginPath();ctx.moveTo(-30,-35);ctx.lineTo(80,-70);ctx.lineTo(80,70);ctx.lineTo(-30,35);ctx.closePath();ctx.fill();
        ctx.fillStyle="#fff5df";ctx.fillRect(-55,-25,35,50);ctx.restore();
        note(ctx,"PLANTS HAVE RIGHTS!",x,y+s*.36,s*.62,"#9eb95d","#173b2a",.02);
      }
      if(id==="thisisfine"){
        ctx.fillStyle="#e45b32";
        for(const dx of [-.3,-.15,.2,.34]){
          ctx.beginPath();ctx.moveTo(x+s*dx,y+s*.38);ctx.quadraticCurveTo(x+s*(dx+.05),y+s*.2,x+s*(dx+.12),y+s*.38);ctx.fill();
        }
        note(ctx,"THIS IS FINE.",x,y+s*.34,s*.48,"#f6ead0","#173b2a",0);
      }
      if(id==="deadinside"){
        ctx.fillStyle="#173b2a";
        ctx.font='900 46px system-ui';ctx.textAlign="center";
        ctx.fillText("×   ×",x,y-s*.04);
        note(ctx,"EMOTIONALLY DETACHED",x,y+s*.34,s*.68,"#171717","#fff5df",0);
      }
      if(id==="resignation"){
        ctx.fillStyle="#d34f35";ctx.beginPath();ctx.moveTo(x,y-s*.16);ctx.lineTo(x-18,y-s*.01);ctx.lineTo(x+18,y-s*.01);ctx.closePath();ctx.fill();
        rounded(ctx,x+s*.08,y+s*.03,s*.35,s*.27,4);paper(ctx,"#fff5df");
        ctx.fillStyle="#173b2a";ctx.textAlign="center";ctx.font='900 28px system-ui';ctx.fillText("I QUIT.",x+s*.255,y+s*.18);
      }
      if(id==="survivor"){
        tape(ctx,x-s*.13,y-s*.22,-.18); tape(ctx,x+s*.17,y+s*.15,.18);
        ctx.strokeStyle="#b58c50";ctx.lineWidth=8;
        for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x-s*.32+i*18,y-s*.36);ctx.lineTo(x-s*.29+i*18,y-s*.4);ctx.stroke();}
        note(ctx,"STILL STANDING. BARELY.",x,y+s*.37,s*.72,"#d34f35","#fff5df",0);
      }
    }

    ctx.restore();
  }

  window.UngrowShameReactions = Object.freeze({
    catalog, pools, count:Object.keys(catalog).length, bandFor, select, draw
  });
})();