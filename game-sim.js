// ============================================================
//  FOURTH & FOREVER — game-sim.js  v3
//  startGameSim(opponent, winProb, teamColor, abbr, oppAbbr, callback)
// ============================================================
(function(){

const DEF_LOOKS=[
  {id:'cover0',  label:'Cover 0 Blitz',    desc:'Zero coverage, everyone blitzes',        type:'blitz',   zones:[]},
  {id:'cover1',  label:'Cover 1 Man',      desc:'One deep safety, press man under',       type:'man',     zones:[]},
  {id:'cover2',  label:'Cover 2 Zone',     desc:'Two deep safeties, flat zones',          type:'zone',    zones:['flat-L','flat-R','hook','deep-L','deep-R']},
  {id:'cover3',  label:'Cover 3 Sky',      desc:'Three deep zones, curl-flat under',      type:'zone',    zones:['deep-L','deep-M','deep-R','curl-L','curl-R']},
  {id:'cover4',  label:'Quarters',         desc:'Four deep, soft underneath',             type:'zone',    zones:['deep-L','deep-ML','deep-MR','deep-R','flat-L','flat-R']},
  {id:'tampa2',  label:'Tampa 2',          desc:'MLB seam drop, two-deep',                type:'zone',    zones:['deep-L','deep-M','deep-R','flat-L','flat-R']},
  {id:'nickblitz',label:'Nickel Blitz',    desc:'Five-man pressure with zone behind',     type:'blitz',   zones:['deep-L','deep-R','hook']},
  {id:'bear',    label:'Bear Front',       desc:'Six in the box, stops inside run',       type:'run',     zones:[]},
  {id:'dime',    label:'Dime Prevent',     desc:'Six DBs, bend-don\'t-break',             type:'prevent', zones:['flat-L','flat-R','deep-L','deep-ML','deep-MR','deep-R']},
  {id:'zonedog', label:'Zone Dog',         desc:'Delayed blitz, zone drops behind',       type:'blitz',   zones:['deep-L','deep-R']},
];

const OFF_FORMS=[
  {id:'spread',  label:'Shotgun Spread',   personnel:'4 WR, 1 RB'},
  {id:'trips',   label:'Trips Right',      personnel:'3 WR Trips, 1 TE, 1 RB'},
  {id:'airraid', label:'Air Raid',         personnel:'4 WR no-huddle, 1 RB'},
  {id:'pro',     label:'Pro I-Formation',  personnel:'2 TE, 1 FB, 1 RB, 1 WR'},
  {id:'pistol',  label:'Pistol Wing',      personnel:'1 TE, 2 WR, 1 RB, 1 FB'},
  {id:'power',   label:'Power I',          personnel:'FB, RB, 2 TE, 1 WR'},
  {id:'twoback', label:'Twin TE Two-Back', personnel:'2 RB, 2 TE, 1 WR'},
];

const OFF_PLAYS=[
  {id:'ycross',   name:'Y-Cross',          concept:'Crossing',    type:'pass', desc:'TE drags across, WR digs over the top', counters:['cover2','cover1','tampa2'],      weak:['cover3','cover4']},
  {id:'stick',    name:'Stick Concept',    concept:'Quick Game',  type:'pass', desc:'TE sticks flat side, RB to opposite flat', counters:['cover1','cover0','nickblitz'], weak:['cover2','tampa2']},
  {id:'4verts',   name:'Four Verticals',   concept:'Vertical',    type:'pass', desc:'Stress all four zones simultaneously', counters:['cover1','cover0','bear'],          weak:['cover2','cover4','tampa2','dime']},
  {id:'rpo',      name:'RPO Bubble',       concept:'RPO',         type:'pass', desc:'Read the edge defender, bubble or hand off', counters:['cover0','cover1','bear','nickblitz'], weak:['cover2','cover3','cover4']},
  {id:'sluggo',   name:'Sluggo Go',        concept:'Shot Play',   type:'pass', desc:'Fake the slant, release vertical over top', counters:['cover1','cover0','cover3'],   weak:['cover2','cover4','tampa2','dime']},
  {id:'mesh',     name:'Mesh Concept',     concept:'Crossers',    type:'pass', desc:'Two shallow crosses, natural pick play', counters:['cover1','cover0','zonedog'],      weak:['cover3','cover4','tampa2']},
  {id:'curlflat', name:'Curl-Flat',        concept:'West Coast',  type:'pass', desc:'Outside curl holds LB, RB to flat', counters:['cover2','cover3','bear'],             weak:['cover1','cover0','nickblitz']},
  {id:'comeback', name:'Comeback Route',   concept:'Ball Control',type:'pass', desc:'WR runs 12 yards, plants, comes back', counters:['cover0','cover1','zonedog'],        weak:['cover2','cover3','dime']},
  {id:'splitzone',name:'Split Zone',       concept:'Inside Zone', type:'run',  desc:'Backside TE kick out, zone run inside', counters:['cover2','cover3','cover4','tampa2','dime'], weak:['bear','nickblitz']},
  {id:'outzone',  name:'Outside Zone',     concept:'Outside Zone',type:'run',  desc:'Stretch the edge, cut back if sealed', counters:['cover0','cover1','cover2','cover3'], weak:['bear','nickblitz','zonedog']},
  {id:'power',    name:'Power Off Tackle', concept:'Gap Scheme',  type:'run',  desc:'FB leads through the C-gap', counters:['cover2','cover3','cover4','dime'],            weak:['bear','cover0']},
  {id:'qbdraw',   name:'QB Draw',          concept:'Deception',   type:'run',  desc:'Sell pass action, QB keeps up the seam', counters:['cover0','nickblitz','zonedog'],   weak:['bear','cover1']},
  {id:'counter',  name:'Counter Trey',     concept:'Counter',     type:'run',  desc:'Fake one way, pull guards, hit counter', counters:['cover1','cover0','cover3'],        weak:['bear','nickblitz']},
  {id:'screen',   name:'WR Screen',        concept:'Screen',      type:'pass', desc:'Throw quick, let blockers lead the way', counters:['cover0','nickblitz','zonedog','bear'], weak:['cover2','cover3','cover4']},
];

const DEF_PLAYS=[
  {id:'c2',  name:'Cover 2',       concept:'Zone',     type:'zone',  desc:'Two safeties, four underneath zones',      counters:['spread','trips','airraid'], weak:['pro','power','twoback']},
  {id:'c3',  name:'Cover 3',       concept:'Zone',     type:'zone',  desc:'Three deep zones, easy run fill',          counters:['pro','power','twoback','pistol'], weak:['spread','trips','airraid']},
  {id:'c4',  name:'Cover 4 Qrts',  concept:'Prevent',  type:'zone',  desc:'Four deep, extreme prevent',               counters:['airraid','spread','trips'], weak:['power','twoback','pro']},
  {id:'t2',  name:'Tampa 2',       concept:'Specialty',type:'zone',  desc:'MLB drops seam, hard to beat middle',      counters:['pro','pistol','twoback'], weak:['spread','trips','airraid']},
  {id:'c1p', name:'Cover 1 Press', concept:'Man',      type:'man',   desc:'Press coverage, single high safety',       counters:['power','pistol','twoback','pro'], weak:['spread','trips','airraid']},
  {id:'c0',  name:'Cover 0 Blitz', concept:'All-Out',  type:'blitz', desc:'Zero help, everyone rushes',               counters:['power','twoback','pro'], weak:['spread','airraid','trips']},
  {id:'zd',  name:'Zone Dog',      concept:'Pressure', type:'blitz', desc:'Five-man pressure with zone behind',       counters:['pro','power','pistol'], weak:['spread','airraid','trips']},
  {id:'nick',name:'Nickel Zone',   concept:'Pass Down',type:'zone',  desc:'Extra DB, zone coverage',                  counters:['spread','airraid','trips'], weak:['power','twoback','pistol']},
  {id:'bear',name:'Bear Front',    concept:'Run Stop', type:'run',   desc:'Six in the box, crush the run',            counters:['power','twoback','pistol','pro'], weak:['spread','airraid','trips']},
  {id:'c2m', name:'Cover 2 Man',   concept:'Hybrid',   type:'man',   desc:'Two deep, man underneath',                 counters:['pro','power','pistol'], weak:['spread','trips','airraid']},
];

const NAR={
  great_off:['PERFECT READ. Defense had nothing for that.','MONEY PLAY. Exactly what they were giving.','DIALED IN. QB saw it before the snap.','SCHEME WIN. You attacked the exact weakness.','THAT\'S COACHING. Nobody saw that coming.','THE OFFENSE IS ROLLING. Sideline electric.'],
  good_off: ['Good gain. You moved the chains.','Solid call. Right concept, solid execution.','Smart football. Take what they give.','Positive yards. Drive stays alive.'],
  bad_off:  ['WRONG READ. They were sitting on that.','STUFFED. They knew it was coming.','NEGATIVE YARDS. No answer against this look.','SACK. Terrible call against this coverage.','THEY BAITED YOU. Film room is going to hurt.','BRUTAL. Coordinator on other side just fist-pumped.'],
  great_def:['PERFECT CALL. They had nowhere to go.','STOP! You read that offense cold.','SHUTDOWN. Gained nothing on that drive.','FORCED PUNT. Exactly what you drew up.','THAT\'S DEFENSE. Stadium is going wild.'],
  good_def: ['Solid stop. Minimal yards allowed.','Good coverage. Holding them to a field goal try.','Bend but don\'t break. Still in this.'],
  bad_def:  ['WRONG COVERAGE. They exploited every gap.','GASHED. Formation ate your defense alive.','SIX POINTS if they execute. Wrong call.','SCHEMED OUT. Study that film tonight.','BUSTED COVERAGE. That formation had you from the snap.'],
};
function pn(a){return a[Math.floor(Math.random()*a.length)];}
function rng(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}

// ── SVG: full defensive look (11 defenders) ─────────────────
function svgDef(def, W, H){
  const Z={
    'flat-L':`<rect x="0" y="${.44*H}" width="${.22*W}" height="${.24*H}" fill="rgba(74,143,212,.14)" rx="6"/>`,
    'flat-R':`<rect x="${.78*W}" y="${.44*H}" width="${.22*W}" height="${.24*H}" fill="rgba(74,143,212,.14)" rx="6"/>`,
    'hook':  `<rect x="${.22*W}" y="${.37*H}" width="${.56*W}" height="${.18*H}" fill="rgba(74,143,212,.10)" rx="6"/>`,
    'curl-L':`<rect x="0" y="${.25*H}" width="${.30*W}" height="${.18*H}" fill="rgba(139,111,212,.14)" rx="6"/>`,
    'curl-R':`<rect x="${.70*W}" y="${.25*H}" width="${.30*W}" height="${.18*H}" fill="rgba(139,111,212,.14)" rx="6"/>`,
    'deep-L':`<rect x="0" y="${.05*H}" width="${.30*W}" height="${.22*H}" fill="rgba(139,111,212,.16)" rx="6"/>`,
    'deep-M':`<rect x="${.30*W}" y="${.05*H}" width="${.40*W}" height="${.22*H}" fill="rgba(139,111,212,.13)" rx="6"/>`,
    'deep-ML':`<rect x="${.06*W}" y="${.05*H}" width="${.38*W}" height="${.20*H}" fill="rgba(139,111,212,.12)" rx="6"/>`,
    'deep-MR':`<rect x="${.56*W}" y="${.05*H}" width="${.38*W}" height="${.20*H}" fill="rgba(139,111,212,.12)" rx="6"/>`,
    'deep-R':`<rect x="${.70*W}" y="${.05*H}" width="${.30*W}" height="${.22*H}" fill="rgba(139,111,212,.16)" rx="6"/>`,
  };
  const cfg={
    blitz:  {DL:[.26,.36,.50,.64,.74],LB:[.36,.50,.64],CB:[.12,.88],S:[.32,.68]},
    man:    {DL:[.30,.42,.50,.58,.70],LB:[.26,.50,.74],CB:[.10,.90],S:[.36,.64]},
    zone:   {DL:[.32,.43,.57,.68],   LB:[.24,.50,.76],CB:[.10,.90],S:[.28,.72]},
    run:    {DL:[.19,.30,.40,.50,.60,.70,.81],LB:[.30,.50,.70],CB:[.13,.87],S:[.42,.58]},
    prevent:{DL:[.36,.50,.64],       LB:[.25,.50,.75],CB:[.08,.28,.72,.92],S:[.20,.80]},
  };
  const f=cfg[def.type]||cfg.zone;
  const blitzArr=def.type==='blitz'?f.DL.slice(0,2).map(x=>`<path d="M${x*W} ${.67*H} L${x*W} ${.78*H}" stroke="#ff4444" stroke-width="3" marker-end="url(#aR)"/>`).join(''):'';
  const pl=(arr,cy,r,fill,stroke,lbl)=>arr.map(x=>`
    <circle cx="${x*W}" cy="${cy*H}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
    <text x="${x*W}" y="${cy*H+4}" text-anchor="middle" fill="rgba(255,255,255,.9)" font-size="9" font-family="'Contrail One',sans-serif">${lbl}</text>`).join('');
  const dlSq=f.DL.map(x=>`
    <rect x="${x*W-10}" y="${.70*H-10}" width="20" height="20" fill="rgba(224,82,82,.3)" stroke="#e05252" stroke-width="1.8" rx="4"/>
    <text x="${x*W}" y="${.70*H+4}" text-anchor="middle" fill="rgba(255,255,255,.9)" font-size="8" font-family="'Contrail One',sans-serif">DL</text>`).join('');
  return`<defs><marker id="aR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 2L8 5L2 8" fill="none" stroke="#ff4444" stroke-width="1.8"/></marker></defs>
    <rect width="${W}" height="${H}" fill="#10152a" rx="12"/>
    ${[.2,.4,.6,.8].map(x=>`<line x1="${x*W}" y1="0" x2="${x*W}" y2="${H}" stroke="rgba(255,255,255,.04)" stroke-width="1"/>`).join('')}
    ${[.33,.66].map(y=>`<line x1="0" y1="${y*H}" x2="${W}" y2="${y*H}" stroke="rgba(255,255,255,.04)" stroke-width="1"/>`).join('')}
    <line x1="0" y1="${.78*H}" x2="${W}" y2="${.78*H}" stroke="rgba(255,255,255,.25)" stroke-width="1.5" stroke-dasharray="8,5"/>
    ${def.zones.map(z=>Z[z]||'').join('')}
    ${blitzArr}
    ${dlSq}
    ${pl(f.LB,.51,10,'rgba(224,82,82,.22)','#e05252','LB')}
    ${pl(f.CB,.30,10,'rgba(139,111,212,.25)','#8B6FD4','CB')}
    ${pl(f.S,.12,11,'rgba(74,143,212,.25)','#4A8FD4','S')}
    <text x="${W/2}" y="${H-8}" text-anchor="middle" fill="rgba(255,255,255,.5)" font-size="13" font-family="'Contrail One',sans-serif">${def.label}</text>
    <text x="${W/2}" y="${H+6}" text-anchor="middle" fill="rgba(255,255,255,.3)" font-size="11" font-family="'Contrail One',sans-serif">${def.desc}</text>`;
}

// ── SVG: full offensive play (all 11 players + routes) ──────
function svgOff(play, def, TC, W, H){
  const isGood=def&&play.counters.includes(def.id);
  const isBad=def&&play.weak.includes(def.id);
  const lc=isGood?'#4fce8a':isBad?'#e07070':'rgba(255,255,255,.5)';
  // 11 players: OL x5, TE, QB, RB, WR x3
  const P={
    C:  {x:.500,y:.80,sq:true}, LG:{x:.437,y:.80,sq:true}, RG:{x:.563,y:.80,sq:true},
    LT: {x:.365,y:.80,sq:true}, RT:{x:.635,y:.80,sq:true},
    TE: {x:.72, y:.80,sq:true},
    QB: {x:.500,y:.88,qb:true},
    RB: {x:.500,y:.96},
    WR1:{x:.10, y:.65},
    WR2:{x:.85, y:.65},
    WR3:{x:.22, y:.57},
  };
  // Routes per play — [player, endX, endY, ctrlX, ctrlY, color]
  const routes={
    'Y-Cross':       [[P.TE,.70,.40,.58,.40,'#4fce8a'],[P.WR1,.88,.48,.50,.55,'#aaa'],[P.WR3,.28,.38,.25,.50,'#aaa']],
    'Stick Concept': [[P.TE,.72,.62,.71,.70,'#4fce8a'],[P.RB,.62,.74,.60,.82,'#60d0ff']],
    'Four Verticals':[[P.WR1,.10,.14,.10,.40,'#ffd700'],[P.WR3,.22,.12,.22,.36,'#ffd700'],[P.WR2,.85,.14,.85,.40,'#ffd700'],[P.TE,.72,.20,.72,.50,'#ffd700']],
    'RPO Bubble':    [[P.WR2,.88,.50,.90,.58,'#4fce8a'],[P.WR3,.24,.52,.20,.60,'#aaa']],
    'Sluggo Go':     [[P.WR1,.09,.12,.10,.40,'#ffd700'],[P.WR3,.20,.14,.21,.36,'#ffd700']],
    'Mesh Concept':  [[P.WR1,.86,.58,.50,.68,'#4fce8a'],[P.WR3,.70,.58,.50,.68,'#4fce8a']],
    'Curl-Flat':     [[P.WR1,.10,.42,.10,.55,'#4fce8a'],[P.RB,.40,.70,.38,.80,'#60d0ff']],
    'Comeback Route':[[P.WR1,.10,.32,.10,.50,'#ffd700'],[P.WR2,.85,.32,.85,.50,'#ffd700']],
    'WR Screen':     [[P.WR2,.88,.56,.90,.64,'#4fce8a'],[P.WR1,.12,.56,.10,.64,'#aaa']],
  };
  const runArrows={
    'Split Zone':      `<path d="M${P.RB.x*W} ${P.RB.y*H} L${.50*W} ${.60*H}" stroke="#4fce8a" stroke-width="3.5" stroke-dasharray="7,3" marker-end="url(#aG)"/>`,
    'Outside Zone':    `<path d="M${P.RB.x*W} ${P.RB.y*H} Q${.68*W} ${.80*H} ${.82*W} ${.62*H}" fill="none" stroke="#4fce8a" stroke-width="3.5" stroke-dasharray="7,3" marker-end="url(#aG)"/>`,
    'Power Off Tackle':`<path d="M${P.RB.x*W} ${P.RB.y*H} Q${.42*W} ${.82*H} ${.38*W} ${.64*H}" fill="none" stroke="#4fce8a" stroke-width="3.5" stroke-dasharray="7,3" marker-end="url(#aG)"/>`,
    'QB Draw':         `<path d="M${P.QB.x*W} ${P.QB.y*H} L${.50*W} ${.52*H}" stroke="#ffd700" stroke-width="3.5" stroke-dasharray="7,3" marker-end="url(#aY)"/>`,
    'Counter Trey':    `<path d="M${P.RB.x*W} ${P.RB.y*H} Q${.33*W} ${.82*H} ${.24*W} ${.64*H}" fill="none" stroke="#4fce8a" stroke-width="3.5" stroke-dasharray="7,3" marker-end="url(#aG)"/>`,
  };
  const routeSVG=(routes[play.name]||[]).map(([p,ex,ey,cx,cy,col])=>{
    const mk=col==='#ffd700'?'aY':col==='#4fce8a'?'aG':'aW';
    return`<path d="M${p.x*W} ${p.y*H} Q${cx*W} ${cy*H} ${ex*W} ${ey*H}" fill="none" stroke="${col}" stroke-width="2.8" marker-end="url(#${mk})"/>`;
  }).join('');
  const runSVG=runArrows[play.name]||'';
  const plSVG=Object.entries(P).map(([k,p])=>{
    const cx=p.x*W,cy=p.y*H;
    if(p.sq) return`<rect x="${cx-10}" y="${cy-10}" width="20" height="20" fill="${TC}22" stroke="${TC}" stroke-width="1.8" rx="4"/>
      <text x="${cx}" y="${cy+4}" text-anchor="middle" fill="${TC}" font-size="8" font-family="'Contrail One',sans-serif">${k.replace(/[0-9]/g,'')}</text>`;
    if(p.qb) return`<circle cx="${cx}" cy="${cy}" r="12" fill="${TC}" stroke="${TC}" stroke-width="2"/>
      <text x="${cx}" y="${cy+4}" text-anchor="middle" fill="#000" font-size="9" font-family="'Contrail One',sans-serif">QB</text>`;
    return`<circle cx="${cx}" cy="${cy}" r="9" fill="${TC}77" stroke="${TC}" stroke-width="1.8"/>
      <text x="${cx}" y="${cy+4}" text-anchor="middle" fill="rgba(255,255,255,.9)" font-size="8" font-family="'Contrail One',sans-serif">${k.replace(/[0-9]/g,'')}</text>`;
  }).join('');
  return`<defs>
    <marker id="aG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 2L8 5L2 8" fill="none" stroke="#4fce8a" stroke-width="1.8"/></marker>
    <marker id="aY" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 2L8 5L2 8" fill="none" stroke="#ffd700" stroke-width="1.8"/></marker>
    <marker id="aW" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 2L8 5L2 8" fill="none" stroke="#aaa" stroke-width="1.8"/></marker>
  </defs>
  <rect width="${W}" height="${H}" fill="#152215" rx="12"/>
  ${[.2,.4,.6,.8].map(x=>`<line x1="${x*W}" y1="0" x2="${x*W}" y2="${H}" stroke="rgba(255,255,255,.04)" stroke-width="1"/>`).join('')}
  ${[.33,.66].map(y=>`<line x1="0" y1="${y*H}" x2="${W}" y2="${y*H}" stroke="rgba(255,255,255,.04)" stroke-width="1"/>`).join('')}
  <line x1="0" y1="${.77*H}" x2="${W}" y2="${.77*H}" stroke="rgba(255,255,255,.25)" stroke-width="1.5" stroke-dasharray="8,5"/>
  <text x="8" y="${.77*H-6}" fill="rgba(255,255,255,.3)" font-size="10" font-family="'Contrail One',sans-serif">LOS</text>
  ${routeSVG}${runSVG}${plSVG}
  <text x="${W/2}" y="${H-8}" text-anchor="middle" fill="${lc}" font-size="13" font-family="'Contrail One',sans-serif">${play.name} — ${play.concept}</text>`;
}

// ── MAIN ────────────────────────────────────────────────────
window.startGameSim=function(opponent,baseWinProb,teamColor,abbr,oppAbbr,callback){
  const TC=teamColor||'#E8A020';
  const numEach=baseWinProb<35?7:baseWinProb<50?6:5;
  const poss=[];
  for(let i=0;i<numEach;i++) poss.push('offense','defense');
  for(let i=poss.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[poss[i],poss[j]]=[poss[j],poss[i]];}

  let momentum=baseWinProb,score=[0,0],possIdx=0,busy=false;

  // Full-screen overlay
  const OV=document.createElement('div');
  OV.id='gameSim';
  OV.style.cssText='position:fixed;inset:0;z-index:500;background:#080e09;display:flex;flex-direction:column;opacity:0;transition:opacity .3s;font-family:\'DM Sans\',sans-serif;overflow:hidden;';
  document.body.appendChild(OV);
  requestAnimationFrame(()=>{OV.style.opacity='1';});

  OV.innerHTML=`
    <div id="gs-top" style="flex-shrink:0;padding:14px 26px;background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.08);"></div>
    <div id="gs-main" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;"></div>
    <div id="gs-result" style="display:none;position:absolute;inset:0;z-index:20;flex-direction:column;align-items:center;justify-content:center;overflow:auto;padding:20px;"></div>
    <div id="gs-final" style="display:none;position:absolute;inset:0;z-index:30;flex-direction:column;align-items:center;justify-content:center;overflow:auto;padding:40px;text-align:center;background:#080e09;"></div>`;

  function topbar(){
    const mp=Math.max(5,Math.min(95,momentum));
    const bc=mp>60?'#4fce8a':mp>40?'#E8A020':'#e07070';
    document.getElementById('gs-top').innerHTML=`
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-family:'Contrail One',sans-serif;font-size:18px;color:#fff;">${abbr}</div>
          <div style="font-family:'Contrail One',sans-serif;font-size:40px;color:#4fce8a;line-height:1;">${score[0]}</div>
          <div style="font-size:16px;color:rgba(255,255,255,.2);">—</div>
          <div style="font-family:'Contrail One',sans-serif;font-size:40px;color:#e07070;line-height:1;">${score[1]}</div>
          <div style="font-family:'Contrail One',sans-serif;font-size:18px;color:rgba(255,255,255,.35);">${oppAbbr||'OPP'}</div>
        </div>
        <div style="flex:1;min-width:200px;max-width:440px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.4);margin-bottom:5px;font-family:'Contrail One',sans-serif;">
            <span>Win Probability</span><span>${Math.round(mp)}%</span>
          </div>
          <div style="height:10px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;">
            <div style="height:100%;width:${mp}%;background:${bc};border-radius:999px;transition:width .7s cubic-bezier(.34,1.56,.64,1);box-shadow:${mp>60?'0 0 12px rgba(79,206,138,.5)':mp>40?'0 0 12px rgba(232,160,32,.5)':'0 0 12px rgba(224,82,82,.5)'};"></div>
          </div>
        </div>
        <div style="font-family:'Contrail One',sans-serif;font-size:12px;color:rgba(255,255,255,.3);">Possession ${possIdx+1} / ${poss.length}</div>
      </div>`;
  }

  function renderPoss(){
    if(possIdx>=poss.length){showFinal();return;}
    const side=poss[possIdx];
    const defLook=pick(DEF_LOOKS);
    const offForm=pick(OFF_FORMS);
    const pool=side==='offense'?OFF_PLAYS:DEF_PLAYS;
    const opts=[...pool].sort(()=>Math.random()-.5).slice(0,4);
    busy=false;
    topbar();

    const main=document.getElementById('gs-main');
    main.style.display='flex';
    main.style.flexDirection='column';
    main.innerHTML=`
      <!-- Context strip -->
      <div style="padding:14px 26px 10px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;">
        <div style="font-family:'Contrail One',sans-serif;font-size:12px;color:rgba(255,255,255,.3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;">${side==='offense'?'🔴 Defensive Look':'🔵 Offensive Formation'}</div>
        <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
          <div style="font-family:'Contrail One',sans-serif;font-size:22px;color:#fff;">${side==='offense'?defLook.label:offForm.label}</div>
          <div style="font-size:13px;color:rgba(255,255,255,.45);">${side==='offense'?defLook.desc:offForm.personnel}</div>
        </div>
        ${side==='offense'&&(window._qbIQ||0)>=85?`<div style="margin-top:8px;font-size:12px;color:rgba(232,160,32,.8);font-style:italic;">🧠 High-IQ QB: one of these plays is the clear right read.</div>`:''}
      </div>
      <!-- Two-panel: formation + cards -->
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;min-height:0;overflow:hidden;">
        <!-- Formation -->
        <div style="padding:16px 12px 16px 20px;border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;overflow:hidden;">
          <div style="font-family:'Contrail One',sans-serif;font-size:11px;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${side==='offense'?'Their Defense':'Their Offense'}</div>
          <div id="gs-fsvg" style="flex:1;min-height:0;border-radius:12px;overflow:hidden;"></div>
        </div>
        <!-- Play choices -->
        <div style="padding:16px 20px 16px 12px;display:flex;flex-direction:column;overflow:hidden;">
          <div style="font-family:'Contrail One',sans-serif;font-size:11px;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${side==='offense'?'Call Your Play':'Call Your Defense'}</div>
          <div id="gs-cards" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;min-height:0;overflow:auto;"></div>
        </div>
      </div>`;

    // Pick the offensive play the opponent is running (when on defense)
    const oppOffPlay = side==='defense' ? pick(OFF_PLAYS) : null;

    // Draw formation SVG
    setTimeout(()=>{
      const fsvg=document.getElementById('gs-fsvg');
      if(!fsvg) return;
      const W=380, H=260;
      let inner;
      if(side==='offense'){
        inner = svgDef(defLook,W,H);
      } else {
        // Show the actual offensive play they're running against you
        inner = svgOff(oppOffPlay, null, '#e05252', W, H);
      }
      fsvg.innerHTML=`<svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;">${inner}</svg>`;

      // If on defense, add play callout label
      if(side==='defense' && oppOffPlay){
        const callout=document.createElement('div');
        callout.style.cssText='margin-top:8px;font-size:12px;color:rgba(224,82,82,.85);font-style:italic;font-family:\'DM Sans\',sans-serif;';
        callout.textContent=`They're running: ${oppOffPlay.name} — ${oppOffPlay.desc}`;
        fsvg.parentElement.appendChild(callout);
      }

      // Build play choice cards
      const cards=document.getElementById('gs-cards');
      if(!cards) return;
      opts.forEach((play,i)=>{
        const ctx=side==='offense'?defLook:offForm;
        const card=document.createElement('div');
        card.id=`gsc${i}`;
        card.style.cssText=`background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.10);
          border-radius:14px;padding:10px;cursor:pointer;transition:all .18s;
          display:flex;flex-direction:column;gap:6px;overflow:hidden;`;
        card.innerHTML=`
          <div id="gsmi${i}" style="border-radius:10px;overflow:hidden;flex-shrink:0;height:130px;"></div>
          <div style="font-family:'Contrail One',sans-serif;font-size:13px;color:#fff;line-height:1.1;">${play.name}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.4);font-family:'Contrail One',sans-serif;">${play.concept||play.type}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.5);line-height:1.4;flex:1;">${play.desc}</div>`;
        card.addEventListener('mouseenter',()=>{if(!busy)card.style.background='rgba(255,255,255,.10)';});
        card.addEventListener('mouseleave',()=>{if(!busy)card.style.background='rgba(255,255,255,.055)';});
        card.addEventListener('click',()=>{if(!busy){if(window.FFF)FFF.sound.play('playCall');choosePlay(i,play,side,defLook,offForm,oppOffPlay);}});
        cards.appendChild(card);

        // Draw mini SVG into card — fixed size, no clientWidth dependency
        setTimeout(()=>{
          const miEl=document.getElementById(`gsmi${i}`);
          if(!miEl) return;
          const mW=240, mH=130;
          let mInner;
          if(side==='offense'){
            mInner=svgOff(play,ctx,TC,mW,mH);
          } else {
            // Defense cards show coverage diagrams
            mInner=svgDef({id:play.id,label:play.name,desc:play.desc,zones:[],type:play.type},mW,mH);
          }
          miEl.innerHTML=`<svg width="100%" height="100%" viewBox="0 0 ${mW} ${mH}" xmlns="http://www.w3.org/2000/svg" style="display:block;">${mInner}</svg>`;
        },60+(i*25));
      });
    },50);
  }

  // ── 8-BIT PLAY ANIMATOR ──────────────────────────────────────
  // Takes over the ENTIRE gs-main area. Full screen, fully zoomed in.
  function play8bit(grade, side, play, onDone){
    const isGreat = grade==='great', isBad = grade==='bad', isGood = grade==='good';
    const isRun = play && play.type==='run';

    // Pick scene based on outcome
    let scene;
    if(isGreat && side==='offense'){
      scene = Math.random()<.5 ? 'touchdown' : (isRun ? 'big_run' : 'deep_catch');
    } else if(isGreat && side==='defense'){
      scene = Math.random()<.5 ? 'interception' : 'defensive_stop';
    } else if(isBad && side==='offense'){
      scene = isRun ? 'stuffed' : (Math.random()<.55 ? 'sack' : 'incomplete');
    } else if(isBad && side==='defense'){
      scene = Math.random()<.5 ? 'touchdown' : 'big_run';
    } else if(isGood && side==='offense'){
      scene = isRun ? 'short_gain' : 'completion';
    } else {
      scene = 'tackle';
    }

    // ── Take over gs-main completely ──
    const main = document.getElementById('gs-main');
    main.innerHTML = '';
    main.style.background = '#0a0a0a';
    main.style.position = 'relative';
    main.style.overflow = 'hidden';

    // Canvas fills the entire main area
    const canvas = document.createElement('canvas');
    // Use actual pixel dimensions of the container
    const CW = Math.min(window.innerWidth, 1200);
    const CH = Math.max(window.innerHeight - 120, 400);
    canvas.width  = CW;
    canvas.height = CH;
    canvas.style.cssText = `width:100%;height:100%;display:block;image-rendering:pixelated;image-rendering:crisp-edges;`;
    main.appendChild(canvas);
    const C = canvas.getContext('2d');
    C.imageSmoothingEnabled = false;

    // CRT effect overlay
    const crt = document.createElement('div');
    crt.style.cssText = `position:absolute;inset:0;pointer-events:none;
      background:repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0px,rgba(0,0,0,.12) 1px,transparent 1px,transparent 4px);
      mix-blend-mode:multiply;`;
    main.appendChild(crt);

    // Vignette
    const vig = document.createElement('div');
    vig.style.cssText = `position:absolute;inset:0;pointer-events:none;
      background:radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.7) 100%);`;
    main.appendChild(vig);

    // Big play label — slides in from top
    const labelWrap = document.createElement('div');
    labelWrap.style.cssText = `position:absolute;top:0;left:0;right:0;display:flex;justify-content:center;
      padding:14px 0;z-index:10;pointer-events:none;`;
    const sceneLabels = {
      touchdown:'🏆  T O U C H D O W N !',
      big_run:'🏃  B I G  G A I N !',
      deep_catch:'🎯  S T R I K E  D O W N F I E L D',
      interception:'💎  I N T E R C E P T I O N !',
      defensive_stop:'🛡️  S T O P P E D  C O L D',
      sack:'💥  S A C K ! ! !',
      stuffed:'🛑  S T U F F E D  A T  T H E  L I N E',
      incomplete:'❌  I N C O M P L E T E',
      short_gain:'✅  G A I N S  T H E  F I R S T',
      completion:'📬  C O M P L E T I O N',
      tackle:'🤝  T A C K L E D  F O R  L O S S',
    };
    const ac = isGreat?'#4fce8a':isBad?'#e05252':'#E8A020';
    labelWrap.innerHTML = `<div style="font-family:'Contrail One',sans-serif;font-size:clamp(13px,2vw,20px);
      letter-spacing:2px;color:${ac};
      text-shadow:0 0 20px ${ac}88, 0 0 40px ${ac}44;
      animation:labelSlide .4s cubic-bezier(.34,1.56,.64,1) both;
      background:rgba(0,0,0,.7);padding:8px 28px;border-radius:999px;border:1px solid ${ac}44;">
      ${sceneLabels[scene]||'▶ PLAY'}
    </div>
    <style>@keyframes labelSlide{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}</style>`;
    main.appendChild(labelWrap);

    // ── Pixel scale — everything is MUCH bigger ──
    // Field coordinate space: 320×180 virtual pixels, scaled to canvas
    const VW = 320, VH = 180;
    const scaleX = CW / VW;
    const scaleY = CH / VH;

    // Virtual-to-canvas
    function v2c(x, y){ return [x * scaleX, y * scaleY]; }

    // Draw a rectangle in virtual coords
    function vRect(vx, vy, vw, vh, col, alpha=1){
      C.globalAlpha = alpha;
      C.fillStyle = col;
      const [cx,cy] = v2c(vx,vy);
      C.fillRect(Math.round(cx), Math.round(cy), Math.max(1,Math.round(vw*scaleX)), Math.max(1,Math.round(vh*scaleY)));
      C.globalAlpha = 1;
    }

    // Draw pixel text in virtual coords
    function vText(vx, vy, txt, col, size=6, alpha=1){
      C.globalAlpha = alpha;
      C.fillStyle = col;
      C.font = `bold ${Math.round(size*Math.min(scaleX,scaleY))}px 'Courier New',monospace`;
      C.textAlign = 'center';
      C.textBaseline = 'middle';
      const [cx,cy] = v2c(vx,vy);
      C.fillText(txt, cx, cy);
      C.globalAlpha = 1;
    }

    // ── Better pixel player ──
    // Player: 10×18 virtual pixels. Has head, body, legs, arms.
    function drawPlayer(vx, vy, jerseyCol, helmetCol, num, facing='right', fallen=false){
      const flip = facing==='left';
      const x = vx, y = vy;

      if(fallen){
        // Horizontal sprawl
        vRect(x-3, y+4, 18, 6, jerseyCol);  // body
        vRect(x-1, y+2, 14, 4, helmetCol);  // helmet
        vRect(x-3, y+8, 6, 3, '#1a1a1a');   // pants L
        vRect(x+9,  y+8, 6, 3, '#1a1a1a');  // pants R
        return;
      }

      // Helmet
      vRect(x+1, y,   8, 5, helmetCol);
      vRect(x+2, y+5, 6, 2, helmetCol);     // facemask
      vRect(x+2, y+5, 6, 2, '#888', .4);
      // Neck
      vRect(x+3, y+7, 4, 2, '#d4955a');
      // Body / jersey
      vRect(x,   y+9, 10, 7, jerseyCol);
      // Jersey number (tiny)
      vText(x+5, y+13, String(num||''), 'rgba(255,255,255,.8)', 4);
      // Arms
      const armX = flip ? x+7 : x-2;
      vRect(armX, y+9, 3, 5, jerseyCol);
      const arm2X = flip ? x-2 : x+7;
      vRect(arm2X, y+9, 3, 5, jerseyCol);
      // Pants
      vRect(x+1, y+16, 3, 4, '#1a1a1a');   // left leg
      vRect(x+6, y+16, 3, 4, '#1a1a1a');   // right leg
      // Cleats
      vRect(x+1, y+20, 3, 2, '#333');
      vRect(x+6, y+20, 3, 2, '#333');
    }

    // ── Football ──
    function drawBall(vx, vy, rot=0){
      C.save();
      const [cx,cy] = v2c(vx,vy);
      C.translate(cx, cy);
      C.rotate(rot);
      C.fillStyle = '#7B3F00';
      C.fillRect(-Math.round(4*scaleX), -Math.round(2.5*scaleY), Math.round(8*scaleX), Math.round(5*scaleY));
      C.fillStyle = '#fff';
      C.fillRect(-Math.round(2*scaleX), -Math.round(1*scaleY), Math.round(4*scaleX), Math.round(1*scaleY));
      C.restore();
    }

    // ── Field ──
    function drawField(camX=0){
      // Sky / crowd top strip
      vRect(0, 0, VW, 12, '#1a0a00');
      // Crowd silhouettes (chunky blocks)
      for(let i=0;i<VW;i+=6){
        const h = 4 + (Math.sin(i*.7+camX*.02)*2)|0;
        const shade = i%12<6 ? '#2a1500':'#1f1000';
        vRect(i, 6-h, 5, h+6, shade);
      }
      // Crowd color flashes
      [20,60,110,160,210,260,290].forEach(xi=>{
        vRect(xi-camX%VW, 2, 4, 4, isGreat?TC:'#880000', .6);
      });

      // Field surface — alternating dark/light bands
      for(let bx=0;bx<VW+20;bx+=20){
        const col = ((bx/20|0)%2===0) ? '#1a4a10' : '#1c5211';
        vRect(bx - (camX%20), 12, 20, VH-12, col);
      }

      // Yard lines
      for(let yx=0;yx<VW+30;yx+=25){
        const lx = yx - (camX%25);
        vRect(lx, 12, 1, VH-12, 'rgba(255,255,255,.18)');
        // Hash marks
        vRect(lx, VH/2-4, 1, 3, 'rgba(255,255,255,.22)');
        vRect(lx, VH/2+2, 1, 3, 'rgba(255,255,255,.22)');
      }

      // End zone (right side) — colored fill
      vRect(VW-20, 12, 20, VH-12, '#1a3060', .8);
      vRect(VW-20, 12, 1, VH-12, '#fff', .6);

      // LOS glow line
      vRect(80, 12, 1, VH-12, '#ffdd00', .55);

      // Ground shadow under players
    }

    // ── Particles (virtual coords) ──
    let particles = [];
    function addParticles(vx, vy, type, count=14){
      for(let i=0;i<count;i++){
        const angle = (Math.PI*2/count)*i + Math.random()*.4;
        const spd = type==='stars'?rng(2,4):type==='sparks'?rng(3,6):type==='confetti'?rng(2,5):rng(1,3);
        const confettiCols = [TC,'#ffd700','#ffffff','#ff4040','#40ffaa'];
        particles.push({
          vx: vx + (Math.random()-0.5)*2,
          vy: vy,
          dvx: Math.cos(angle)*spd,
          dvy: Math.sin(angle)*spd - 1.5,
          life: 1,
          decay: type==='stars'?0.025:0.032,
          type,
          col: type==='confetti' ? confettiCols[i%confettiCols.length] :
               type==='stars'   ? '#ffd700' :
               type==='sparks'  ? (i%2===0?'#ff6020':'#ffaa00') :
               type==='x'       ? '#e05252' : '#4fce8a',
          size: type==='stars'?3:type==='sparks'?2:type==='confetti'?3:2,
          rot: Math.random()*Math.PI*2,
          rotV: (Math.random()-.5)*.3,
        });
      }
    }
    function stepParticles(){
      particles.forEach(p=>{
        p.vx+=p.dvx*.9; p.vy+=p.dvy;
        p.dvx*=.9; p.dvy+=.18;
        p.life-=p.decay;
        p.rot+=p.rotV;
        if(p.life<=0) return;
        if(p.type==='stars'||p.type==='x'){
          vText(p.vx,p.vy, p.type==='stars'?'★':'✕', p.col, p.size+1, p.life);
        } else if(p.type==='confetti'){
          C.save();
          const [cx,cy]=v2c(p.vx,p.vy);
          C.globalAlpha=p.life;
          C.translate(cx,cy); C.rotate(p.rot);
          C.fillStyle=p.col;
          C.fillRect(-Math.round(p.size*scaleX/2),-Math.round(p.size*scaleY/2),
            Math.round(p.size*scaleX),Math.round(p.size*scaleY*.5));
          C.restore();
        } else {
          vRect(p.vx,p.vy,p.size,p.size,p.col,p.life);
        }
      });
      particles=particles.filter(p=>p.life>0);
    }

    // ── Floating text ──
    let popTexts=[];
    function addPop(vx,vy,txt,col,size=7){
      popTexts.push({vx,vy,dvy:-0.6,txt,col,size,life:1});
    }
    function stepPops(){
      popTexts.forEach(p=>{
        p.vy=(p.vy||p.dvy)+p.dvy; p.vx+=0; p.vy+=p.dvy; p.life-=0.018;
        if(p.life<=0) return;
        // Shadow
        vText(p.vx+.5, p.vy+.5, p.txt, 'rgba(0,0,0,.6)', p.size, p.life);
        vText(p.vx, p.vy, p.txt, p.col, p.size, p.life);
      });
      popTexts=popTexts.filter(p=>p.life>0);
    }

    // ── Shake ──
    let shakeAmt=0;
    function shake(amt){ shakeAmt=Math.max(shakeAmt,amt); }
    function applyShake(){
      if(shakeAmt>0.2){
        C.save();
        C.translate((Math.random()-.5)*shakeAmt*scaleX*1.5,(Math.random()-.5)*shakeAmt*scaleY*1.5);
      }
    }
    function endShake(){ if(shakeAmt>0.2){ C.restore(); } shakeAmt*=.78; }

    // ── Score flash ──
    let scoreFlash=0, scoreFlashCol='#4fce8a';
    function flashScore(col){ scoreFlash=1; scoreFlashCol=col; }
    function drawHUD(){
      // Score bar along bottom
      vRect(0, VH-10, VW, 10, 'rgba(0,0,0,.85)');
      vText(VW/2, VH-5, `${abbr} ${score[0]}  —  ${score[1]} ${oppAbbr||'OPP'}`, '#fff', 5);
      if(scoreFlash>0){
        vRect(0,VH-10,VW,10,scoreFlashCol,scoreFlash*.5);
        scoreFlash-=0.06;
      }
    }

    // ── Camera: pan to follow action ──
    let camX = 0;

    // ── Scene state ──
    let frame=0, sceneOver=false;
    const TC = teamColor||'#E8A020';
    const OPP_COL = '#cc2020';  // opponent always red/dark
    const OPP_HELM = '#880000';

    // ── Scene definitions ── (virtual 320×180 space, players ~10×22)
    const SCENES = {

      touchdown(){
        const runner = {vx:70, vy:VH/2-11};
        const defs = [{vx:90,vy:VH/2+12},{vx:105,vy:VH/2-18},{vx:130,vy:VH/2+4}];
        const blocker = {vx:65, vy:VH/2+4};
        let scored=false, scoredFrame=0;
        return ()=>{
          const t=frame;
          camX = Math.max(0, runner.vx - 90);
          C.clearRect(0,0,CW,CH);
          applyShake();
          drawField(camX);

          // Move everyone
          runner.vx = Math.min(VW-15, 70 + t*1.4);
          runner.vy = VH/2-11 + Math.sin(t*.35)*3;
          blocker.vx = runner.vx - 12;
          blocker.vy = runner.vy + 10;
          defs.forEach((d,i)=>{ d.vx=Math.min(runner.vx-14,d.vx+0.9+i*.1); d.vy+=(runner.vy-d.vy)*.05; });

          // Trail
          for(let i=4;i>=1;i--){
            drawPlayer(runner.vx-i*13, runner.vy, TC, TC, '', 'right');
            C.globalAlpha=0.06*(5-i); C.fillStyle=TC;
            const [cx,cy]=v2c(runner.vx-i*13, runner.vy);
            C.fillRect(cx,cy,Math.round(10*scaleX),Math.round(22*scaleY));
            C.globalAlpha=1;
          }

          drawPlayer(blocker.vx, blocker.vy, TC, TC, 71, 'right');
          defs.forEach((d,i)=>drawPlayer(d.vx-camX, d.vy, OPP_COL, OPP_HELM, 50+i));
          drawPlayer(runner.vx-camX, runner.vy, TC, TC, 32, 'right');

          if(runner.vx>=VW-22 && !scored){
            scored=true; scoredFrame=t;
            addParticles(VW-camX-10, VH/2, 'confetti', 40);
            addParticles(VW-camX-10, VH/2, 'stars', 20);
            addParticles(VW-camX-10, VH/2, 'sparks', 16);
            addPop(VW/2-camX, VH/2-30, 'TOUCHDOWN!', '#ffd700', 10);
            shake(14); flashScore('#4fce8a');
          }
          if(scored && t-scoredFrame<8){ shake(12-(t-scoredFrame)*1.2); }

          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>90) sceneOver=true;
        };
      },

      big_run(){
        const runner={vx:75, vy:VH/2-5};
        const def={vx:100, vy:VH/2+8};
        let juked=false, running=false;
        return ()=>{
          const t=frame;
          camX = Math.max(0, runner.vx-80);
          C.clearRect(0,0,CW,CH);
          applyShake();
          drawField(camX);

          if(t<20){ // defender closes
            def.vx -= 0.5;
            def.vy += (runner.vy-def.vy)*.12;
            runner.vx += 1.5;
          }
          if(t===20 && !juked){ // JUKE
            juked=true;
            addParticles(runner.vx-camX, runner.vy, 'sparks', 10);
            addPop(runner.vx-camX, runner.vy-20, 'JUKE!', TC, 7);
            shake(6);
          }
          if(t>20 && t<26){ def.vy+=5; def.vx+=2; } // defender stumbles
          if(t>=22){ runner.vx=Math.min(VW-15, runner.vx+1.6); running=true; }
          if(t===38) addPop(runner.vx-camX, runner.vy-22, '+15 YDS', '#4fce8a', 8);

          drawPlayer(def.vx-camX, def.vy, OPP_COL, OPP_HELM, 55, juked&&t>20?'left':'right', t>26&&t<32);
          drawPlayer(runner.vx-camX, runner.vy, TC, TC, 22, 'right');

          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>80) sceneOver=true;
        };
      },

      deep_catch(){
        const qb={vx:80,vy:VH*.60};
        const wr1={vx:102,vy:VH*.22};
        const wr2={vx:106,vy:VH*.78};
        const def1={vx:106,vy:VH*.19};
        const ol=[{vx:88,vy:VH*.54},{vx:88,vy:VH*.60},{vx:88,vy:VH*.66},{vx:88,vy:VH*.70}];
        camX=58;
        let ball=null,ballTrail=[],snapped=false,thrown=false,caught=false,throwFrame=0;
        return ()=>{
          const t=frame;
          C.clearRect(0,0,CW,CH); applyShake(); drawField(camX);
          if(t===8) snapped=true;
          if(snapped&&!thrown) qb.vx=Math.max(72,qb.vx-0.5);
          if(t===20&&!thrown){
            thrown=true; throwFrame=t;
            ball={vx:qb.vx+2,vy:qb.vy-3,dvx:2.2,dvy:-3.0};
            addPop(qb.vx-camX,qb.vy-18,'LAUNCH!',TC,6);
          }
          if(ball&&!caught){
            ballTrail.push({vx:ball.vx,vy:ball.vy,life:0.5});
            ball.vx+=ball.dvx; ball.vy+=ball.dvy; ball.dvy+=0.11;
            wr1.vx=Math.min(180,wr1.vx+1.0);
            wr1.vy+=(VH*.26-wr1.vy)*0.07;
            def1.vx=wr1.vx-4; def1.vy+=(wr1.vy-def1.vy)*.09;
          }
          if(ball&&!caught&&thrown&&Math.abs(ball.vx-wr1.vx)<16&&Math.abs(ball.vy-wr1.vy)<16){
            caught=true;
            addParticles(wr1.vx-camX,wr1.vy,'stars',20);
            addParticles(wr1.vx-camX,wr1.vy,'confetti',24);
            addPop(wr1.vx-camX,wr1.vy-30,'CAUGHT!!','#4fce8a',10);
            shake(10); flashScore('#4fce8a');
          }
          if(caught) wr1.vx=Math.min(VW-10,wr1.vx+2.0);
          ballTrail=ballTrail.filter(b=>{b.life-=0.07;return b.life>0;});
          ballTrail.forEach(b=>vRect(b.vx-camX-1,b.vy-1,3,3,'#8B4513',b.life*0.4));
          ol.forEach((o,i)=>drawPlayer(o.vx-camX,o.vy,TC,TC,60+i));
          drawPlayer(def1.vx-camX,def1.vy,OPP_COL,OPP_HELM,21);
          drawPlayer(wr2.vx-camX,wr2.vy,TC,TC,11,'right');
          drawPlayer(wr1.vx-camX,wr1.vy,TC,TC,88,'right');
          drawPlayer(qb.vx-camX,qb.vy,TC,TC,12,'right');
          if(thrown&&!caught&&t-throwFrame<7) vRect(qb.vx-camX+8,qb.vy-5,3,8,TC);
          if(ball) drawBall(ball.vx-camX,ball.vy,Math.atan2(ball.dvy,ball.dvx));
          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>90) sceneOver=true;
        };
      },

      sack(){
        const qb={vx:120,vy:VH/2};
        const rushers=[{vx:90,vy:VH/2-18,spd:2.2},{vx:88,vy:VH/2+16,spd:1.9}];
        const linemen=[{vx:100,vy:VH/2-8},{vx:100,vy:VH/2+8}];
        let hit=false, hitFrame=0;
        return ()=>{
          const t=frame;
          camX=90;
          C.clearRect(0,0,CW,CH);
          applyShake();
          drawField(camX);

          rushers.forEach((r,i)=>{
            if(!hit){ r.vx+=r.spd*0.55; r.vy+=(qb.vy-r.vy)*.1; }
          });
          linemen.forEach((l,i)=>{
            l.vx=Math.min(qb.vx-10, l.vx+.5);
          });

          const closest=rushers[0];
          if(!hit && closest.vx>=qb.vx-12){
            hit=true; hitFrame=t;
            addParticles(qb.vx-camX, qb.vy, 'sparks', 22);
            addParticles(qb.vx-camX, qb.vy, 'x', 14);
            addPop(qb.vx-camX, qb.vy-28, 'SACK!!!', '#e05252', 11);
            addPop(qb.vx-camX+20, qb.vy-10, '-8 YDS', '#e05252', 7);
            shake(18); flashScore(OPP_COL);
          }

          const qbFallen = hit && t-hitFrame>5;
          linemen.forEach((l,i)=>drawPlayer(l.vx-camX, l.vy, OPP_COL, OPP_HELM, 90+i));
          rushers.forEach((r,i)=>drawPlayer(r.vx-camX, r.vy, OPP_COL, OPP_HELM, 44+i*10, 'right'));
          drawPlayer(qb.vx-camX, qb.vy, TC, TC, 12, 'right', qbFallen);

          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>80) sceneOver=true;
        };
      },

      stuffed(){
        const runner={vx:72,vy:VH/2};
        const wall=[
          {vx:95,vy:VH/2-18},{vx:98,vy:VH/2-6},
          {vx:97,vy:VH/2+6},{vx:94,vy:VH/2+18},
        ];
        let hit=false, hitFrame=0;
        return ()=>{
          const t=frame;
          camX=60;
          C.clearRect(0,0,CW,CH);
          applyShake();
          drawField(camX);

          if(!hit){ runner.vx=Math.min(93,72+t*1.2); }
          if(!hit && runner.vx>=89){
            hit=true; hitFrame=t;
            addParticles(runner.vx-camX, runner.vy, 'sparks', 24);
            addParticles(runner.vx-camX, runner.vy, 'x', 18);
            addPop(runner.vx-camX, runner.vy-30, 'STUFFED!', '#e05252', 11);
            addPop(runner.vx-camX+30, runner.vy-12, 'NO GAIN', '#e05252', 7);
            shake(20); flashScore(OPP_COL);
          }
          if(hit){ runner.vx=Math.max(72,runner.vx-1.1); } // bounced back

          wall.forEach((d,i)=>drawPlayer(d.vx-camX, d.vy, OPP_COL, OPP_HELM, 50+i*10));
          const fallen = hit && t-hitFrame>6;
          drawPlayer(runner.vx-camX, runner.vy, TC, TC, 22, hit?'left':'right', fallen);

          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>76) sceneOver=true;
        };
      },

      interception(){
        const qb={vx:75,vy:VH*.65};
        const wr={vx:108,vy:VH*.30};
        const db={vx:112,vy:VH*.22};
        const ol=[{vx:82,vy:VH*.58},{vx:82,vy:VH*.64},{vx:82,vy:VH*.70}];
        camX=52;
        let ball=null,ballTrail=[],thrown=false,picked=false;
        return ()=>{
          const t=frame;
          C.clearRect(0,0,CW,CH); applyShake(); drawField(camX);
          if(t===12&&!thrown){
            thrown=true;
            ball={vx:qb.vx+2,vy:qb.vy-2,dvx:2.3,dvy:-2.9};
            addPop(qb.vx-camX,qb.vy-16,'THROW!','#e05252',6);
          }
          if(ball&&!picked){
            ballTrail.push({vx:ball.vx,vy:ball.vy,life:0.55});
            ball.vx+=ball.dvx; ball.vy+=ball.dvy; ball.dvy+=0.11;
            wr.vx=Math.min(160,wr.vx+0.9);
            if(t>12){db.vx+=0.55;} db.vy+=(ball.vy-db.vy)*0.08;
          }
          if(ball&&!picked&&thrown&&t>16&&Math.abs(ball.vx-db.vx)<18&&Math.abs(ball.vy-db.vy)<18){
            picked=true;
            addParticles(db.vx-camX,db.vy,'stars',24);
            addParticles(db.vx-camX,db.vy,'confetti',20);
            addParticles(db.vx-camX,db.vy,'sparks',12);
            addPop(db.vx-camX,db.vy-32,'INTERCEPTION!','#ffd700',11);
            addPop(db.vx-camX+10,db.vy-14,'PICK!',TC,7);
            shake(14); flashScore('#4fce8a');
          }
          if(picked) db.vx=Math.max(30,db.vx-1.8);
          ballTrail=ballTrail.filter(b=>{b.life-=0.07;return b.life>0;});
          ballTrail.forEach(b=>vRect(b.vx-camX-1,b.vy-1,3,3,'#8B4513',b.life*0.35));
          ol.forEach((o,i)=>drawPlayer(o.vx-camX,o.vy,OPP_COL,OPP_HELM,60+i));
          drawPlayer(wr.vx-camX,wr.vy,OPP_COL,OPP_HELM,88,'right');
          drawPlayer(qb.vx-camX,qb.vy,OPP_COL,OPP_HELM,12,'right');
          drawPlayer(db.vx-camX,db.vy,TC,TC,21,picked?'left':'right');
          if(ball&&!picked) drawBall(ball.vx-camX,ball.vy,Math.atan2(ball.dvy,ball.dvx));
          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>90) sceneOver=true;
        };
      },

      defensive_stop(){
        const runner={vx:160,vy:VH/2};
        const tacklers=[{vx:130,vy:VH/2-15},{vx:135,vy:VH/2+12}];
        let stopped=false;
        return ()=>{
          const t=frame;
          camX=110;
          C.clearRect(0,0,CW,CH);
          applyShake();
          drawField(camX);
          runner.vx=Math.max(120,160-t*1.8);
          tacklers.forEach((tk,i)=>{ tk.vx+=(runner.vx-tk.vx)*.15; tk.vy+=(runner.vy-tk.vy)*.12; });
          if(!stopped&&tacklers[0].vx>=runner.vx-10){
            stopped=true;
            addParticles(runner.vx-camX,runner.vy,'sparks',14);
            addPop(runner.vx-camX,runner.vy-25,'STOPPED!','#4fce8a',9);
            shake(8);
          }
          tacklers.forEach((tk,i)=>drawPlayer(tk.vx-camX,tk.vy,TC,TC,55+i*10,'right'));
          drawPlayer(runner.vx-camX,runner.vy,OPP_COL,OPP_HELM,22,'left');
          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>72) sceneOver=true;
        };
      },

      incomplete(){
        const qb={vx:78,vy:VH*.62};
        const wr={vx:105,vy:VH*.32};
        const db={vx:108,vy:VH*.28};
        const ol=[{vx:84,vy:VH*.56},{vx:84,vy:VH*.62},{vx:84,vy:VH*.68}];
        camX=55;
        let ball=null,ballTrail=[],thrown=false,batted=false;
        return ()=>{
          const t=frame;
          C.clearRect(0,0,CW,CH); applyShake(); drawField(camX);
          if(t===14&&!thrown){
            thrown=true;
            ball={vx:qb.vx+2,vy:qb.vy-2,dvx:2.2,dvy:-2.6};
            addPop(qb.vx-camX,qb.vy-16,'THROW!',TC,6);
          }
          if(ball&&!batted){
            ballTrail.push({vx:ball.vx,vy:ball.vy,life:0.5});
            ball.vx+=ball.dvx; ball.vy+=ball.dvy; ball.dvy+=0.12;
            wr.vx=Math.min(160,wr.vx+1.0);
            db.vx=wr.vx-3; db.vy+=(wr.vy-db.vy)*0.1;
          }
          if(ball&&!batted&&thrown&&t>22&&ball.vx>db.vx-12&&ball.vy<db.vy+18){
            batted=true;
            ball.dvx=-2.5; ball.dvy=4.0;
            addParticles(db.vx-camX,db.vy,'x',14);
            addParticles(db.vx-camX,db.vy,'sparks',8);
            addPop(db.vx-camX,db.vy-28,'BROKEN UP!','#e05252',9);
            addPop(db.vx-camX+20,db.vy-10,'INCOMPLETE','#e05252',6);
            shake(7); flashScore(OPP_COL);
          }
          ballTrail=ballTrail.filter(b=>{b.life-=0.07;return b.life>0;});
          ballTrail.forEach(b=>vRect(b.vx-camX-1,b.vy-1,3,3,'#8B4513',b.life*0.35));
          ol.forEach((o,i)=>drawPlayer(o.vx-camX,o.vy,TC,TC,65+i));
          drawPlayer(db.vx-camX,db.vy,OPP_COL,OPP_HELM,21);
          drawPlayer(wr.vx-camX,wr.vy,TC,TC,88,'right');
          drawPlayer(qb.vx-camX,qb.vy,TC,TC,12,'right');
          if(ball) drawBall(ball.vx-camX,ball.vy,Math.atan2(ball.dvy,ball.dvx));
          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>78) sceneOver=true;
        };
      },

      short_gain(){
        const runner={vx:75,vy:VH/2};
        const def={vx:105,vy:VH/2+8};
        let done=false;
        return ()=>{
          const t=frame;
          camX=60;
          C.clearRect(0,0,CW,CH);
          applyShake();
          drawField(camX);
          runner.vx=Math.min(105,75+t*1.1);
          def.vx-=.3; def.vy+=(runner.vy-def.vy)*.08;
          if(!done&&Math.abs(runner.vx-def.vx)<12){
            done=true;
            addParticles(runner.vx-camX,runner.vy,'sparks',8);
            addPop(runner.vx-camX,runner.vy-22,'+8 YDS','#4fce8a',7);
            shake(4);
          }
          drawPlayer(def.vx-camX,def.vy,OPP_COL,OPP_HELM,55);
          drawPlayer(runner.vx-camX,runner.vy,TC,TC,22,'right');
          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>68) sceneOver=true;
        };
      },

      completion(){
        const qb={vx:78,vy:VH*.60};
        const wr={vx:102,vy:VH*.38};
        const def={vx:106,vy:VH*.34};
        const ol=[{vx:85,vy:VH*.54},{vx:85,vy:VH*.60},{vx:85,vy:VH*.66}];
        camX=55;
        let ball=null,ballTrail=[],thrown=false,caught=false;
        return ()=>{
          const t=frame;
          C.clearRect(0,0,CW,CH); applyShake(); drawField(camX);
          if(t===6) {/* snap */}
          if(t<14&&!thrown) qb.vx=Math.max(70,qb.vx-0.4);
          if(t===16&&!thrown){
            thrown=true;
            ball={vx:qb.vx+2,vy:qb.vy-2,dvx:2.1,dvy:-2.0};
            addPop(qb.vx-camX,qb.vy-16,'FIRE!',TC,6);
          }
          if(ball&&!caught){
            ballTrail.push({vx:ball.vx,vy:ball.vy,life:0.45});
            ball.vx+=ball.dvx; ball.vy+=ball.dvy; ball.dvy+=0.13;
            wr.vx=Math.min(145,wr.vx+0.9);
            wr.vy+=(VH*.42-wr.vy)*0.1;
            def.vx=wr.vx-4; def.vy+=(wr.vy-def.vy)*0.09;
          }
          if(ball&&!caught&&thrown&&Math.abs(ball.vx-wr.vx)<15&&Math.abs(ball.vy-wr.vy)<15){
            caught=true;
            addParticles(wr.vx-camX,wr.vy,'stars',12);
            addPop(wr.vx-camX,wr.vy-22,'COMPLETE!','#4fce8a',8);
            shake(5);
          }
          if(caught) wr.vx=Math.min(VW-10,wr.vx+2.2);
          ballTrail=ballTrail.filter(b=>{b.life-=0.09;return b.life>0;});
          ballTrail.forEach(b=>vRect(b.vx-camX-1,b.vy-1,3,3,'#8B4513',b.life*0.35));
          ol.forEach((o,i)=>drawPlayer(o.vx-camX,o.vy,TC,TC,65+i));
          drawPlayer(def.vx-camX,def.vy,OPP_COL,OPP_HELM,21);
          drawPlayer(wr.vx-camX,wr.vy,TC,TC,88,'right');
          drawPlayer(qb.vx-camX,qb.vy,TC,TC,12,'right');
          if(ball) drawBall(ball.vx-camX,ball.vy,Math.atan2(ball.dvy,ball.dvx));
          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>72) sceneOver=true;
        };
      },

      tackle(){
        const runner={vx:80,vy:VH/2};
        const tackler={vx:110,vy:VH/2-12};
        let hit=false;
        return ()=>{
          const t=frame;
          camX=65;
          C.clearRect(0,0,CW,CH);
          applyShake();
          drawField(camX);
          runner.vx=Math.min(108,80+t*1.0);
          tackler.vx-=.5; tackler.vy+=(runner.vy-tackler.vy)*.14;
          if(!hit&&Math.abs(runner.vx-tackler.vx)<12){
            hit=true;
            addParticles(runner.vx-camX,runner.vy,'sparks',10);
            addPop(runner.vx-camX,runner.vy-22,'TACKLE!','#E8A020',7);
            shake(6);
          }
          drawPlayer(tackler.vx-camX,tackler.vy,OPP_COL,OPP_HELM,55,'right');
          drawPlayer(runner.vx-camX,runner.vy,TC,TC,32,'right',hit&&tackler.vx>=runner.vx-8);
          stepParticles(); stepPops(); drawHUD(); endShake();
          if(t>70) sceneOver=true;
        };
      },
    };

    // ── Animation loop — locked to 24fps so 8-bit feels chunky and deliberate ──
    const TARGET_FPS = 24;
    const FRAME_MS = 1000 / TARGET_FPS;
    const sceneFn = (SCENES[scene]||SCENES.tackle)();
    let raf, lastTime = 0;
    function loop(ts){
      if(ts - lastTime < FRAME_MS){ raf=requestAnimationFrame(loop); return; }
      lastTime = ts;
      sceneFn();
      frame++;
      if(sceneOver){
        cancelAnimationFrame(raf);
        main.style.transition='opacity .45s ease';
        main.style.opacity='0';
        setTimeout(()=>{ main.style.opacity='1'; main.style.transition=''; onDone(); }, 480);
        return;
      }
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
  }

  function choosePlay(idx,play,side,defLook,offForm,oppOffPlay){
    if(busy) return;
    busy=true;
    const ctx=side==='offense'?defLook:offForm;
    const offCtx=side==='defense'?oppOffPlay:null;

    const isGood=play.counters.includes(ctx.id)||(offCtx&&play.counters.includes(offCtx.id));
    const isBad=play.weak.includes(ctx.id)||(offCtx&&play.weak.includes(offCtx.id));

    const rand=Math.random();
    let grade,delta;

    if(isGood && !isBad && rand<.82){
      grade='great'; delta=rng(14,24);
      if(side==='offense'){ score[0]+=(rand<.45?7:rand<.72?3:0); }
    } else if(isBad && !isGood && rand<.85){
      grade='bad'; delta=-rng(12,22);
      if(side==='offense'){ score[1]+=(rand<.55?7:rand<.80?3:0); }
      else { score[1]+=(rand<.60?7:3); }
    } else if(rand<.60){
      grade='good'; delta=rng(3,8);
      if(side==='offense'&&rand<.35) score[0]+=3;
    } else {
      grade='neutral'; delta=rng(-3,2);
    }

    const qbIQ = window._qbIQ||75;
    if(qbIQ>=88){ if(grade==='great') delta=Math.min(28,delta+rng(2,5)); if(grade==='bad') delta=Math.max(-16,delta+rng(3,6)); }
    else if(qbIQ<72){ if(grade==='bad') delta-=rng(2,5); }

    momentum=Math.max(5,Math.min(95,momentum+delta));

    // Highlight selected card briefly
    const card=document.getElementById(`gsc${idx}`);
    if(card){
      const bc=grade==='great'?'rgba(79,206,138,.35)':grade==='bad'?'rgba(224,82,82,.35)':'rgba(232,160,32,.22)';
      const bord=grade==='great'?'#4fce8a':grade==='bad'?'#e05252':'#E8A020';
      card.style.background=bc; card.style.border=`2px solid ${bord}`;
      card.style.transform='scale(1.04)';
    }

    const nar=side==='offense'
      ?(grade==='great'?pn(NAR.great_off):grade==='bad'?pn(NAR.bad_off):grade==='good'?pn(NAR.good_off):pn(NAR.good_off))
      :(grade==='great'?pn(NAR.great_def):grade==='bad'?pn(NAR.bad_def):grade==='good'?pn(NAR.good_def):'Held. Minimal gain allowed.');

    // Short pause to show the highlight, then launch 8-bit
    setTimeout(()=>{
      play8bit(grade, side, play, ()=>{
        showResult(grade,nar,delta,isGood,isBad);
      });
    }, 160);
  }

  function showResult(grade,nar,delta,isGood,isBad){
    const isGreat=grade==='great',isBadG=grade==='bad';
    const ac=isGreat?'#4fce8a':isBadG?'#e05252':'#E8A020';
    const bg=isGreat?'rgba(0,18,8,.97)':isBadG?'rgba(22,0,0,.97)':'rgba(8,12,8,.97)';
    const emoji=isGreat?'🔥':isBadG?'💀':grade==='good'?'✅':'😐';
    const sign=delta>=0?'+':'';
    const mp=Math.max(5,Math.min(95,momentum));
    const bc=mp>60?'#4fce8a':mp>40?'#E8A020':'#e07070';
    const glow=isGreat?'rgba(79,206,138,.45)':isBadG?'rgba(224,82,82,.45)':'rgba(232,160,32,.3)';

    const res=document.getElementById('gs-result');
    res.style.display='flex';
    res.style.background=bg;
    // sounds
    if(window.FFF){
      if(isGreat) FFF.sound.play('jackpot');
      else if(isBadG) FFF.sound.play('bust');
      else if(grade==='good') FFF.sound.play('coin');
      else FFF.sound.play('clickSoft');
    }
    res.innerHTML=`
      <style>
        @keyframes popIn{from{opacity:0;transform:scale(.4) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(0deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes countUp{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
        @keyframes barGrow{from{width:0}to{width:${mp}%}}
        @keyframes screenFlash{0%{background:${bg}}15%{background:${isGreat?'rgba(79,206,138,.25)':isBadG?'rgba(224,82,82,.25)':'rgba(232,160,32,.15)'}}100%{background:${bg}}}
        @keyframes badShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes pulseRed{0%,100%{box-shadow:0 0 0 0 rgba(224,82,82,0)}50%{box-shadow:0 0 40px 8px rgba(224,82,82,.3)}}
      </style>
      <div style="text-align:center;max-width:520px;width:100%;animation:screenFlash .5s ease;${isBadG?'animation:screenFlash .5s ease,pulseRed .6s ease .1s':''}">
        <div style="font-size:88px;line-height:1;margin-bottom:14px;animation:popIn .4s cubic-bezier(.34,1.56,.64,1) both;filter:drop-shadow(0 0 24px ${glow});">${emoji}</div>
        <div style="font-family:'Contrail One',sans-serif;font-size:11px;letter-spacing:2.5px;color:${ac}77;margin-bottom:8px;animation:slideUp .3s ease .1s both;text-transform:uppercase;">${isGreat?'PERFECT READ':isBadG?'WRONG CALL':grade==='good'?'SOLID CALL':'NEUTRAL'}</div>
        <div style="font-family:'Contrail One',sans-serif;font-size:${nar.length>40?'22px':'26px'};color:#fff;line-height:1.2;margin-bottom:14px;animation:slideUp .3s ease .15s both;">${nar}</div>
        <div style="font-family:'Contrail One',sans-serif;font-size:${Math.abs(delta)>=18?'78px':'62px'};color:${ac};line-height:1;margin-bottom:6px;
          animation:countUp .35s cubic-bezier(.34,1.56,.64,1) .2s both;
          text-shadow:0 0 40px ${glow},0 0 80px ${isGreat?'rgba(79,206,138,.2)':isBadG?'rgba(224,82,82,.2)':'rgba(232,160,32,.2)'};">
          ${sign}${delta}%
        </div>
        <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:${isGood||isBad?'6px':'14px'};animation:slideUp .3s ease .25s both;">
          Win probability now ${Math.round(mp)}%
        </div>
        ${isGood&&!isGreat?`<div style="font-size:12px;color:#4fce8a66;margin-bottom:10px;animation:slideUp .3s ease .3s both;">✓ Right concept — tough execution</div>`:''}
        ${isBad?`<div style="font-size:12px;color:#e0525277;margin-bottom:10px;animation:slideUp .3s ease .3s both;">✗ That coverage eats that play alive</div>`:''}
        <div style="height:10px;background:rgba(255,255,255,.07);border-radius:999px;overflow:hidden;margin:16px 0;animation:slideUp .3s ease .28s both;">
          <div style="height:100%;width:${mp}%;background:${bc};border-radius:999px;
            box-shadow:0 0 16px ${glow};
            animation:barGrow .8s cubic-bezier(.34,1.56,.64,1) .3s both;"></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-bottom:22px;animation:slideUp .3s ease .32s both;">
          <div style="font-family:'Contrail One',sans-serif;font-size:32px;color:#4fce8a;">${score[0]}</div>
          <div style="font-size:16px;color:rgba(255,255,255,.25);">—</div>
          <div style="font-family:'Contrail One',sans-serif;font-size:32px;color:#e07070;">${score[1]}</div>
        </div>
        <button id="gsNxt" style="font-family:'Contrail One',sans-serif;font-size:16px;
          background:${ac};color:#000;border:none;padding:15px 56px;border-radius:999px;cursor:pointer;
          box-shadow:0 0 32px ${glow};animation:slideUp .3s ease .38s both;
          transition:transform .2s,box-shadow .2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          ${possIdx<poss.length-1?'Next Possession →':'Final Whistle →'}
        </button>
      </div>`;
    document.getElementById('gsNxt').addEventListener('click',()=>{
      res.style.display='none';
      possIdx++;
      renderPoss();
    });
  }

  function showFinal(){
    const mp=Math.max(5,Math.min(95,momentum));
    const win=Math.random()*100<mp;
    if(win&&score[0]<=score[1]) score[0]=score[1]+rng(1,13);
    if(!win&&score[1]<=score[0]) score[1]=score[0]+rng(1,10);
    const fs=`${score[0]}–${score[1]}`;
    const ac=win?'#4fce8a':'#e07070';
    const glow=win?'rgba(79,206,138,.5)':'rgba(224,82,82,.5)';
    const fin=document.getElementById('gs-final');
    fin.style.display='flex';
    fin.innerHTML=`
      <style>
        @keyframes trophy{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.15) rotate(5deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes scoreReveal{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
        @keyframes glowPulse{0%,100%{text-shadow:0 0 40px ${glow}}50%{text-shadow:0 0 80px ${glow},0 0 120px ${glow}}}
      </style>
      <div style="font-size:104px;line-height:1;margin-bottom:18px;animation:trophy .5s cubic-bezier(.34,1.56,.64,1) both;filter:drop-shadow(0 0 32px ${glow});">${win?'🏆':'💔'}</div>
      <div style="font-family:'Contrail One',sans-serif;font-size:12px;letter-spacing:3px;color:${ac}77;margin-bottom:10px;text-transform:uppercase;">FINAL SCORE</div>
      <div style="font-family:'Contrail One',sans-serif;font-size:82px;color:${ac};line-height:1;margin-bottom:10px;
        animation:scoreReveal .4s cubic-bezier(.34,1.56,.64,1) .2s both,glowPulse 2s ease 1s infinite;">${fs}</div>
      <div style="font-family:'Contrail One',sans-serif;font-size:34px;color:#fff;margin-bottom:18px;">${win?'Victory!':'Defeat.'}</div>
      <div style="font-size:15px;color:rgba(255,255,255,.5);max-width:420px;line-height:1.7;margin-bottom:26px;">
        ${win?'Locker room is electric. Your play calls made the difference tonight. Recruits are texting.':'Silence in the building. Film review at 7am. Learn from every wrong read.'}
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:14px 30px;margin-bottom:28px;">
        <div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:4px;font-family:'Contrail One',sans-serif;letter-spacing:1px;text-transform:uppercase;">Final Win Probability</div>
        <div style="font-family:'Contrail One',sans-serif;font-size:38px;color:${ac};">${Math.round(mp)}%</div>
      </div>
      <button id="gsCls" style="font-family:'Contrail One',sans-serif;font-size:16px;background:${ac};color:#000;
        border:none;padding:16px 60px;border-radius:999px;cursor:pointer;
        box-shadow:0 0 40px ${glow};transition:transform .2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        Back to Dashboard
      </button>`;
    if(window.FFF){ setTimeout(()=>{ FFF.sound.play(win?'win':'loss'); }, 300); }
    document.getElementById('gsCls').addEventListener('click',()=>{
      OV.style.opacity='0';
      setTimeout(()=>{OV.remove();if(callback)callback({win,finalScore:fs,momentum:mp});},350);
    });
  }

  renderPoss();
};

})();
