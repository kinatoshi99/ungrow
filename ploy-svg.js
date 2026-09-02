(() => {
  const INK = "#173b2a", LEAF1 = "#4f8a59", LEAF2 = "#2f6844", VEIN = "#9ac377", POT = "#d9c7a9";
  let uid = 0;
  const safePrefix = value => String(value || `p${++uid}`).replace(/[^a-zA-Z0-9_-]/g, "");

  function stateFor(health) {
    if (health >= 90) return { key: "healthy", droop: 0, sat: 1, bright: 1, flower: 1 };
    if (health >= 75) return { key: "tired", droop: 8, sat: .94, bright: .99, flower: .98 };
    if (health >= 60) return { key: "bruised", droop: 14, sat: .84, bright: .97, flower: .93 };
    if (health >= 40) return { key: "sick", droop: 22, sat: .68, bright: .94, flower: .86 };
    if (health >= 20) return { key: "critical", droop: 31, sat: .52, bright: .9, flower: .75 };
    if (health >= 1) return { key: "disaster", droop: 42, sat: .34, bright: .84, flower: .58 };
    return { key: "heaven", droop: 48, sat: .16, bright: .86, flower: .42 };
  }

  function leaf(cx, cy, rx, ry, rotation, state, extra = "") {
    const r = rotation + state.droop * (cx < 160 ? -0.35 : 0.35);
    return `<g transform="translate(${cx} ${cy}) rotate(${r})" style="filter:saturate(${state.sat}) brightness(${state.bright})">
      <path d="M0 ${-ry} C${rx*.92} ${-ry*.56},${rx*.96} ${ry*.42},0 ${ry} C${-rx*.96} ${ry*.42},${-rx*.92} ${-ry*.56},0 ${-ry}Z" fill="${LEAF1}" stroke="${INK}" stroke-width="3.2"/>
      <path d="M0 ${-ry+8} C2 ${-ry*.3},1 ${ry*.3},0 ${ry-7}" fill="none" stroke="${VEIN}" stroke-width="4" opacity=".85"/>
      <g stroke="${INK}" stroke-width="1.7" opacity=".28">
        <path d="M0 ${-ry*.48} L${rx*.55} ${-ry*.25}"/><path d="M0 ${-ry*.18} L${rx*.62} ${ry*.02}"/>
        <path d="M0 ${ry*.14} L${rx*.56} ${ry*.34}"/><path d="M0 ${-ry*.48} L${-rx*.55} ${-ry*.25}"/>
        <path d="M0 ${-ry*.18} L${-rx*.62} ${ry*.02}"/><path d="M0 ${ry*.14} L${-rx*.56} ${ry*.34}"/>
      </g>${extra}</g>`;
  }

  function flower(x, y, scale, state, prefix) {
    const shadow = `${prefix}-shadow`;
    return `<g transform="translate(${x} ${y}) scale(${scale})" opacity="${state.flower}" filter="url(#${shadow})">
      <path d="M0 36 C-5 12,-4 -18,0 -50" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M0 -52 C29 -48,36 -17,7 5 C-4 13,-14 4,-11 -9 C-7 -28,-1 -42,0 -52Z" fill="#f8f4e8" stroke="#c8c0b3" stroke-width="2"/>
      <path d="M1 -43 C7 -31,8 -16,5 -3" fill="none" stroke="#d7c96a" stroke-width="4" stroke-linecap="round"/>
    </g>`;
  }

  function bandage(x, y, rotation, prefix) {
    return `<g transform="translate(${x} ${y}) rotate(${rotation})" filter="url(#${prefix}-shadow)">
      <rect x="-20" y="-8" width="40" height="16" rx="8" fill="#efe6d9" stroke="#c9bba9" stroke-width="1.6"/>
      <rect x="-8" y="-6" width="16" height="12" rx="4" fill="#ddd0bd"/>
    </g>`;
  }

  function thermometer(x, y, prefix) {
    return `<g transform="translate(${x} ${y}) rotate(12)" filter="url(#${prefix}-shadow)">
      <rect x="-5" y="-27" width="10" height="38" rx="5" fill="#fbf8f2" stroke="#bdb5aa" stroke-width="1.8"/>
      <rect x="-1.6" y="-13" width="3.2" height="24" rx="2" fill="#cf4d3d"/>
      <circle cx="0" cy="16" r="8" fill="#cf4d3d" stroke="#bdb5aa" stroke-width="1.8"/>
    </g>`;
  }

  function fly(x, y, r = 0) {
    return `<g transform="translate(${x} ${y}) rotate(${r})" opacity=".82"><ellipse rx="4" ry="6" fill="#594f42"/>
      <ellipse cx="-5" cy="-4" rx="5" ry="3" fill="#e8eee8" stroke="#9aa79d" stroke-width=".8"/>
      <ellipse cx="5" cy="-4" rx="5" ry="3" fill="#e8eee8" stroke="#9aa79d" stroke-width=".8"/></g>`;
  }

  function pot(state) {
    const tired = ["bruised", "sick", "critical", "disaster"].includes(state.key);
    const dead = state.key === "heaven";
    return `<g transform="translate(160 236)">
      <path d="M-76 -8 H76 V42 C76 69 52 82 0 82 C-52 82 -76 69 -76 42 Z" fill="${POT}" stroke="${INK}" stroke-width="4"/>
      <text x="0" y="31" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="900" letter-spacing="1.2" fill="${INK}">PLOY</text>
      <text x="0" y="49" text-anchor="middle" font-family="system-ui,sans-serif" font-size="7" font-weight="800" letter-spacing="1.1" fill="#2f6b45">${dead ? "SIGNED OFF." : "STILL POLITE."}</text>
      ${tired ? `<ellipse cx="-20" cy="8" rx="11" ry="5" fill="#493551" opacity=".2"/><ellipse cx="20" cy="8" rx="11" ry="5" fill="#493551" opacity=".2"/>` : ""}
      ${dead ? `<path d="M-26 -2 l10 10 m0 -10 l-10 10 M16 -2 l10 10 m0 -10 l-10 10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` : `<path d="M-28 1 Q-20 7 -12 1 M12 1 Q20 7 28 1" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`}
      <path d="M-12 66 Q0 ${state.key === "healthy" ? 72 : 58} 14 65" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    </g>`;
  }

  function buildInner(health, prefixValue) {
    const prefix = safePrefix(prefixValue), state = stateFor(Number(health));
    const critical = ["critical", "disaster"].includes(state.key);
    const disaster = state.key === "disaster";
    const halo = state.key === "heaven" ? `<ellipse cx="160" cy="35" rx="42" ry="11" fill="none" stroke="#e2bd45" stroke-width="5" opacity=".9"/>` : "";
    return `<defs><filter id="${prefix}-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#173b2a" flood-opacity=".18"/></filter></defs>
      ${halo}
      ${leaf(91,188,32,82,-54,state, state.key === "bruised" ? bandage(0,4,-8,prefix) : "")}
      ${leaf(118,176,35,99,-28,state)}
      ${leaf(153,168,38,112,-6,state)}
      ${leaf(191,177,35,100,27,state)}
      ${leaf(226,190,31,80,52,state)}
      ${flower(130,132,.78,state,prefix)}${state.key !== "disaster" ? flower(202,143,.6,state,prefix) : ""}
      ${critical ? thermometer(183,159,prefix) : ""}${disaster ? `${fly(87,80,-12)}${fly(235,68,16)}` : ""}
      ${pot(state)}`;
  }

  function buildStandalone(health) {
    const prefix = `ploy-export-${++uid}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">${buildInner(health, prefix)}</svg>`;
  }

  function render(svgEl, health) {
    if (!svgEl) return;
    if (!svgEl.dataset.svgPrefix) svgEl.dataset.svgPrefix = `ploy-inline-${++uid}`;
    svgEl.innerHTML = buildInner(health, svgEl.dataset.svgPrefix);
  }

  window.UngrowPloySvg = { render, buildStandalone, stateFor };
})();
