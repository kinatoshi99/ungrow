(() => {
  const INK = "#173b2a";
  const GREEN = "#3f7a50";
  const LIME = "#b7d874";
  const POT = "#d9c7a9";

  const leaves = [
    { id: 1, x: 112, y: 239, w: 50, h: 132, r: -28 },
    { id: 2, x: 138, y: 238, w: 53, h: 177, r: -11 },
    { id: 3, x: 160, y: 238, w: 56, h: 198, r: 1 },
    { id: 4, x: 188, y: 239, w: 52, h: 165, r: 17 },
    { id: 5, x: 214, y: 239, w: 48, h: 128, r: 31 }
  ];

  function stateFor(health) {
    if (health >= 90) return { key: "healthy", droop: 0, sat: 1, bright: 1 };
    if (health >= 75) return { key: "tired", droop: 5, sat: .95, bright: 1 };
    if (health >= 60) return { key: "bruised", droop: 11, sat: .82, bright: .98 };
    if (health >= 40) return { key: "sick", droop: 18, sat: .64, bright: .94 };
    if (health >= 20) return { key: "critical", droop: 28, sat: .48, bright: .9 };
    if (health >= 1) return { key: "disaster", droop: 38, sat: .30, bright: .82 };
    return { key: "heaven", droop: 45, sat: .14, bright: .84 };
  }

  function leafPath(w, h) {
    return `M ${w/2} ${h} C ${w*.08} ${h*.78}, ${w*.04} ${h*.28}, ${w*.43} 0 C ${w*.78} ${h*.08}, ${w*.98} ${h*.34}, ${w*.73} ${h*.82} C ${w*.64} ${h*.95}, ${w*.56} ${h}, ${w/2} ${h} Z`;
  }

  function bandage(w, h, rotate = -14) {
    const x = w*.52, y = h*.43;
    return `<g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#propShadow)">
      <rect x="-19" y="-8" width="38" height="16" rx="8" fill="#efe6d9" stroke="#c9bba9" stroke-width="1.7"/>
      <rect x="-8" y="-6" width="16" height="12" rx="4" fill="#ddd0bd"/>
      <g fill="#bfae99" opacity=".7"><circle cx="-13" cy="-3" r="1"/><circle cx="-13" cy="3" r="1"/><circle cx="13" cy="-3" r="1"/><circle cx="13" cy="3" r="1"/></g>
    </g>`;
  }

  function cast(w, h) {
    const x = w*.5, y = h*.48;
    return `<g transform="translate(${x} ${y}) rotate(2)" filter="url(#propShadow)">
      <rect x="-15" y="-34" width="30" height="68" rx="10" fill="#f4efe6" stroke="#c4b8a9" stroke-width="2"/>
      <path d="M-14 -18 H14 M-14 0 H14 M-14 18 H14" stroke="#d8ccbc" stroke-width="5"/>
      <path d="M-11 -28 C-3 -24 4 -25 11 -28 M-11 28 C-3 24 4 25 11 28" fill="none" stroke="#fffaf0" stroke-width="2" opacity=".8"/>
    </g>`;
  }

  function thermometer(x, y, rotate = 14) {
    return `<g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#propShadow)">
      <rect x="-5" y="-28" width="10" height="39" rx="5" fill="#fbf8f2" stroke="#bdb5aa" stroke-width="1.8"/>
      <rect x="-1.6" y="-14" width="3.2" height="25" rx="2" fill="#cf4d3d"/>
      <circle cx="0" cy="16" r="8" fill="#cf4d3d" stroke="#bdb5aa" stroke-width="1.8"/>
      <path d="M7 -12 Q16 -8 14 1" fill="none" stroke="#a99a86" stroke-width="2" stroke-linecap="round"/>
    </g>`;
  }

  function fly(x, y, rotate = 0) {
    return `<g transform="translate(${x} ${y}) rotate(${rotate})" opacity=".85">
      <ellipse cx="0" cy="0" rx="4" ry="6" fill="#594f42"/>
      <ellipse cx="-5" cy="-4" rx="5" ry="3" fill="#e8eee8" stroke="#9aa79d" stroke-width=".8"/>
      <ellipse cx="5" cy="-4" rx="5" ry="3" fill="#e8eee8" stroke="#9aa79d" stroke-width=".8"/>
      <path d="M-2 5 L-7 10 M2 5 L7 10" stroke="#594f42" stroke-width="1.2"/>
    </g>`;
  }

  function leafMarkup(leaf, state, propType = null) {
    const offsets = [-.62, -.34, -.08, .38, .66];
    const r = leaf.r + state.droop * offsets[leaf.id - 1];
    const h = state.key === "disaster" || state.key === "heaven" ? leaf.h * (leaf.id === 3 ? .84 : .92) : leaf.h;
    const d = leafPath(leaf.w, h);
    const prop = propType === "bandage" ? bandage(leaf.w, h) : propType === "cast" ? cast(leaf.w, h) : "";
    return `<g transform="translate(${leaf.x} ${leaf.y}) rotate(${r}) translate(${-leaf.w/2} ${-h})" style="filter:saturate(${state.sat}) brightness(${state.bright})">
      <defs><clipPath id="leafClip${leaf.id}"><path d="${d}"/></clipPath></defs>
      <path d="${d}" fill="url(#leafGradient)" stroke="${INK}" stroke-width="3.2"/>
      <g clip-path="url(#leafClip${leaf.id})">${prop}</g>
      <path d="M${leaf.w*.5} ${h-7} C${leaf.w*.48} ${h*.62}, ${leaf.w*.46} ${h*.28}, ${leaf.w*.47} 12" fill="none" stroke="${LIME}" stroke-width="5" opacity=".82"/>
      <g opacity=".42" stroke="${INK}" stroke-width="2.3">${[.25,.38,.51,.64,.77].map((p,i)=>`<path d="M${leaf.w*.2} ${h*p} L${leaf.w*.78} ${h*p-7}"/>`).join("")}</g>
      <path d="${d}" fill="none" stroke="${INK}" stroke-width="3.2"/>
    </g>`;
  }

  function face(state) {
    const bruised = ["bruised","sick","critical","disaster"].includes(state.key);
    const dead = state.key === "heaven";
    return `<g transform="translate(160 150)">
      ${bruised ? `<ellipse cx="-18" cy="12" rx="13" ry="6" fill="#493551" opacity=".25"/><ellipse cx="18" cy="12" rx="13" ry="6" fill="#493551" opacity=".25"/>` : ""}
      ${dead ? `<path d="M-28 -2 l12 12 m0 -12 l-12 12 M16 -2 l12 12 m0 -12 l-12 12" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` : `<path d="M-30 3 Q-20 10 -10 3 M10 3 Q20 10 30 3" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`}
      <path d="M-12 28 Q0 ${state.key === "healthy" ? 35 : 21} 14 27" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    </g>`;
  }

  function pot(state) {
    const cracked = ["critical","disaster","heaven"].includes(state.key);
    return `<g transform="translate(160 236)">
      <path d="M-76 -8 H76 V42 C76 69 52 82 0 82 C-52 82 -76 69 -76 42 Z" fill="${POT}" stroke="${INK}" stroke-width="4"/>
      <text x="0" y="32" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="900" letter-spacing="1.2" fill="${INK}">SOMCHAI</text>
      <text x="0" y="50" text-anchor="middle" font-family="system-ui,sans-serif" font-size="7" font-weight="800" letter-spacing="1.1" fill="#2f6b45">${state.key === "healthy" ? "NOT IMPRESSED." : "STILL JUDGING."}</text>
      ${cracked ? `<path d="M34 16 L22 31 L31 45 L17 61 L25 77" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
    </g>`;
  }

  function buildInner(health) {
    const state = stateFor(Number(health));
    let leafProps = {};
    if (state.key === "tired") leafProps = { 1: "bandage" };
    if (state.key === "bruised") leafProps = { 1: "bandage" };
    if (state.key === "sick") leafProps = { 1: "bandage" };
    if (state.key === "critical") leafProps = { 4: "cast" };
    if (state.key === "disaster") leafProps = { 1: "bandage", 4: "cast" };

    const order = [leaves[0], leaves[4], leaves[1], leaves[3], leaves[2]];
    const leafHtml = order.map(l => leafMarkup(l, state, leafProps[l.id])).join("");
    const thermo = state.key === "sick" ? thermometer(182, 156, 16) : state.key === "critical" ? thermometer(182, 158, 16) : "";
    const flies = state.key === "disaster" ? `${fly(88,83,-14)}${fly(232,64,18)}` : "";
    const halo = state.key === "heaven" ? `<ellipse cx="160" cy="42" rx="42" ry="11" fill="none" stroke="#e2bd45" stroke-width="5" opacity=".9"/>` : "";

    return `<defs>
      <linearGradient id="leafGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b8a5b"/><stop offset="1" stop-color="#315f43"/></linearGradient>
      <filter id="propShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#173b2a" flood-opacity=".18"/></filter>
    </defs>
    ${halo}${leafHtml}${face(state)}${thermo}${pot(state)}${flies}`;
  }

  function buildStandalone(health) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">${buildInner(health)}</svg>`;
  }

  function render(svgEl, health) {
    if (!svgEl) return;
    svgEl.innerHTML = buildInner(health);
  }

  window.UngrowPlantSvg = { render, buildStandalone, stateFor };
})();