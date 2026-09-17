const levels = [
  { name: "동네 야구장", target: 3, pitchMs: 1900, window: .24, catchChance: .03, groundOutChance: .06, doublePlayChance: .25, foulChance: .08, type: "직선 공", background: "easy", color: "#7ec8ed" },
  { name: "바람 부는 경기장", target: 4, pitchMs: 1700, window: .21, catchChance: .05, groundOutChance: .09, doublePlayChance: .3, foulChance: .11, type: "높은 공", background: "easy", color: "#a9d6f2" },
  { name: "해 질 녘 경기장", target: 5, pitchMs: 1500, window: .18, catchChance: .08, groundOutChance: .12, doublePlayChance: .36, foulChance: .14, type: "빠른 공", background: "medium", color: "#f4b67c" },
  { name: "구불구불 경기장", target: 6, pitchMs: 1350, window: .16, catchChance: .11, groundOutChance: .16, doublePlayChance: .42, foulChance: .17, type: "휘는 공", background: "medium", color: "#cdb5ef" },
  { name: "풍선 경기장", target: 8, pitchMs: 1200, window: .14, catchChance: .15, groundOutChance: .2, doublePlayChance: .48, foulChance: .2, type: "장애물 등장", background: "hard", color: "#8bd7a1" },
  { name: "챔피언 경기장", target: 10, pitchMs: 1080, window: .12, catchChance: .19, groundOutChance: .24, doublePlayChance: .55, foulChance: .23, type: "빠른 공 + 장애물", background: "hard", color: "#f28b7a" }
];

const characters = [
  { name: "정우", asset: "assets/02-character-minjun-power.png", motion: "minjun", role: "힘껏 치는 친구", detail: "홈런 타이밍이 조금 더 넓어요.", bonus: .025, runnerSpeed: 1, tag: "파워형" },
  { name: "세연", asset: "assets/03-character-yuna-focus.png", motion: "yuna", role: "침착한 타자", detail: "좋은 타격 구간이 조금 더 넓어요.", bonus: .045, runnerSpeed: 1, tag: "집중형" },
  { name: "토리", asset: "assets/04-character-tori-speed.png", motion: "toribat", role: "빠르게 달리는 친구", detail: "베이스 사이를 더 빠르게 달려요.", bonus: .01, runnerSpeed: .84, tag: "스피드형" }
];

const assets = {
  home: "assets/01-home-hero.png", easy: "assets/stadium-easy-v2.png", medium: "assets/stadium-medium-v2.png",
  hard: "assets/stadium-hard-v2.png", ballSheet: "assets/15-vfx-ball-hit.png"
};
const images = {};
for (const [name, src] of Object.entries(assets)) { images[name] = new Image(); images[name].src = src; }
for (const name of ["minjun", "yuna", "tori", "toribat", "pitcher", "runner", "catcher"]) {
  for (let frame = 0; frame < 5; frame += 1) { images[`${name}-${frame}`] = new Image(); images[`${name}-${frame}`].src = `assets/frames/${name}-${frame}.png`; }
}
images.runnerStand = new Image(); images.runnerStand.src = "assets/frames/runner-stand.png";

const CONTACT = { x: 370, y: 430 };
const FIELD_LAYOUTS = {
  easy: { first: [894, 286], second: [480, 217], third: [65, 286], home: [480, 478], mound: [480, 280] },
  medium: { first: [842, 307], second: [480, 239], third: [116, 307], home: [480, 474], mound: [480, 307] },
  hard: { first: [877, 290], second: [480, 225], third: [83, 290], home: [480, 480], mound: [480, 289] }
};
let fieldLayout = FIELD_LAYOUTS.easy;
let BASE_PATH = [];
let FIELDERS = [];

function configureField(background) {
  fieldLayout = FIELD_LAYOUTS[background] || FIELD_LAYOUTS.easy;
  const point = (key, label) => ({ x: fieldLayout[key][0], y: fieldLayout[key][1], label });
  BASE_PATH = [{ x: 350, y: 500, label: "타석" }, point("first", "1루"), point("second", "2루"), point("third", "3루"), point("home", "홈")];
  const second = BASE_PATH[2], first = BASE_PATH[1], third = BASE_PATH[3];
  FIELDERS = [
    { label: "3루수", x: third.x + 105, y: third.y + 24, height: 70 }, { label: "유격수", x: 365, y: second.y + 58, height: 64 },
    { label: "2루수", x: 595, y: second.y + 58, height: 64 }, { label: "1루수", x: first.x - 105, y: first.y + 24, height: 70 },
    { label: "좌익수", x: 255, y: second.y - 5, height: 50 }, { label: "중견수", x: 480, y: second.y - 35, height: 48 },
    { label: "우익수", x: 705, y: second.y - 5, height: 50 }
  ];
}
configureField("easy");

const state = {
  screen: "home", character: 0, level: 0, unlocked: 1, score: 0, outs: 0, bases: [false, false, false],
  homeRuns: 0, phase: "idle", pitch: null, flight: null, paused: false, pauseStarted: null, resumeAction: null,
  message: "준비되면 공이 날아와요.", muted: false, token: 0, action: null, strikes: 0, fieldAction: null, foul: null, runningPlay: null, effectToken: 0
};

const $ = (id) => document.getElementById(id);
const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");

function loadProgress() {
  try { state.unlocked = Math.max(1, Math.min(levels.length, Number(localStorage.getItem("mini-baseball-unlocked")) || 1)); } catch { state.unlocked = 1; }
}

function saveProgress() {
  try { localStorage.setItem("mini-baseball-unlocked", String(state.unlocked)); } catch { /* private browsing can reject storage */ }
}

function showScreen(name) {
  state.screen = name;
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.toggle("active", screen.id === `${name}Screen`));
  if (name === "character") renderCharacters();
  if (name === "level") renderLevels();
}

function renderCharacters() {
  $("characterCards").innerHTML = characters.map((character, index) => `
    <button class="character-card ${index === state.character ? "selected" : ""}" data-character="${index}" type="button" aria-pressed="${index === state.character}">
      <span class="character-icon"><img src="${character.asset}" alt="${character.name} 캐릭터"></span>
      <h3>${character.name}</h3><p>${character.role}<br>${character.detail}</p><span class="tag">${character.tag}</span>
    </button>`).join("");
  document.querySelectorAll("[data-character]").forEach((button) => button.addEventListener("click", () => { state.character = Number(button.dataset.character); renderCharacters(); tone(420, .05); }));
}

function renderLevels() {
  $("levelCards").innerHTML = levels.map((level, index) => {
    const locked = index + 1 > state.unlocked;
    return `<button class="level-card ${locked ? "locked" : ""}" data-level="${index}" type="button" ${locked ? "disabled" : ""}>
      <div class="level-number">${String(index + 1).padStart(2, "0")}</div><h3>${level.name}</h3><p>목표 ${level.target}점 · ${level.type}</p>${locked ? '<span class="lock">🔒</span>' : '<small>도전 가능</small>'}
    </button>`;
  }).join("");
  document.querySelectorAll("[data-level]").forEach((button) => button.addEventListener("click", () => startGame(Number(button.dataset.level))));
}

function startGame(levelIndex) {
  Object.assign(state, { level: levelIndex, score: 0, outs: 0, strikes: 0, bases: [false, false, false], homeRuns: 0, phase: "between", pitch: null, flight: null, action: null, fieldAction: null, foul: null, runningPlay: null, paused: false });
  configureField(levels[levelIndex].background);
  state.token += 1; $("gameEyebrow").textContent = `LEVEL ${levelIndex + 1}`; $("gameTitle").textContent = levels[levelIndex].name;
  showScreen("game"); updateHud(); setMessage("공을 보고, 준비되면 눌러요!");
  const token = state.token; setTimeout(() => { if (state.screen === "game" && token === state.token) nextPitch(); }, 850);
}

function nextPitch() {
  if (state.screen !== "game" || state.paused) return;
  state.phase = "pitching"; state.pitch = { start: performance.now(), duration: levels[state.level].pitchMs, curve: Math.random() * 2 - 1, type: levels[state.level].type };
  state.action = { kind: "pitch", start: state.pitch.start }; state.fieldAction = null; state.foul = null; state.runningPlay = null;
  $("pitchHint").classList.remove("hide"); setMessage(`${levels[state.level].type}! 타이밍을 맞춰요.`); tone(250, .05);
}

function swing() {
  if (state.screen !== "game" || state.paused || state.phase !== "pitching") return;
  const now = performance.now(); const pitchTime = (now - state.pitch.start) / state.pitch.duration; const center = .88;
  const windowSize = levels[state.level].window + characters[state.character].bonus; const delta = pitchTime - center;
  state.phase = "swinging"; state.action = { kind: "swing", start: now, outcome: null }; $("pitchHint").classList.add("hide"); tone(180, .1);
  if (Math.abs(delta) > windowSize) resolveStrike(delta < 0 ? "조금 빨라요" : "조금 늦었어요");
  else if (Math.abs(delta) > windowSize * (1 - levels[state.level].foulChance * 2)) resolveFoul();
  else resolveHit(Math.abs(delta));
}

function resolveStrike(reason) {
  if (state.action) state.action.outcome = "miss";
  state.phase = "resulting"; state.strikes += 1; const strikeOut = state.strikes >= 3;
  if (strikeOut) { state.outs += 1; state.strikes = 0; showEffect("삼진 아웃!", "strikeout"); playSound("strikeout"); }
  else playSound("strike");
  setMessage(strikeOut ? `${reason}! 삼진 아웃이에요.` : `${reason}! 스트라이크 ${state.strikes}/3.`); updateHud(); continuePlay(strikeOut ? 1250 : 750);
}

function resolveFoul() {
  if (state.action) state.action.outcome = "foul";
  state.phase = "foul"; state.foul = { start: performance.now(), side: Math.random() < .5 ? -1 : 1 };
  const counted = state.strikes < 2; if (counted) state.strikes += 1;
  setMessage(counted ? `파울! 스트라이크 ${state.strikes}/3, 다시 준비해요.` : "파울! 두 스트라이크에서는 카운트가 늘지 않아요.");
  tone(150, .12); updateHud(); continuePlay(850);
}

function resolveHit(delta) {
  let type = "단타"; if (delta < .025) type = "홈런"; else if (delta < .055) type = "3루타"; else if (delta < .09) type = "2루타";
  if (type === "단타" && Math.random() < levels[state.level].groundOutChance) type = "땅볼";
  state.strikes = 0; state.flight = { start: performance.now(), type, caught: type !== "땅볼" && Math.random() < levels[state.level].catchChance && type !== "홈런", target: chooseFlightTarget(type) };
  if (state.action) state.action.outcome = type;
  state.phase = "flight"; updateHud(); setMessage(type === "홈런" ? "완벽해요! 담장 너머로 날아가요!" : type === "땅볼" ? "땅볼! 수비수가 달려와요!" : `좋아요! ${type} 타구예요.`); tone(type === "홈런" ? 700 : 520, .12);
}

function chooseFlightTarget(type) {
  const zones = type === "땅볼" ? [[1, 430, 336, 405, 328], [2, 585, 336, 590, 326], [0, 220, 350, 205, 342]] : type === "단타"
    ? [[2, 610, 306, 620, 320], [0, 190, 342, 185, 340]]
    : type === "2루타" ? [[6, 735, 245, 710, 260], [5, 535, 230, 525, 248]]
      : type === "3루타" ? [[4, 220, 238, 245, 260], [6, 760, 238, 715, 260]]
        : [[5, 480, 155, 480, 236], [6, 760, 168, 690, 252]];
  const [fielderIndex, ballX, ballY, fieldX, fieldY] = zones[Math.floor(Math.random() * zones.length)];
  return { fielderIndex, ballX, ballY, fieldX, fieldY, label: type === "홈런" ? `${FIELDERS[fielderIndex].label} 뒤 담장` : FIELDERS[fielderIndex].label };
}

function buildRunningPlay(bases, distance) {
  const next = [false, false, false]; const moves = []; let runs = 0;
  for (let index = 2; index >= 0; index -= 1) {
    if (!bases[index]) continue;
    const startNode = index + 1; const destination = startNode + distance; moves.push({ startNode, endNode: Math.min(4, destination), character: null });
    if (destination >= 4) runs += 1; else next[destination - 1] = true;
  }
  moves.push({ startNode: 0, endNode: distance, character: state.character });
  if (distance >= 4) runs += 1; else next[distance - 1] = true;
  return { bases: next, runs, moves };
}

function buildGroundResult(bases, targetNode, leadOut, batterOut, character) {
  const forcedCount = targetNode - 1, next = [...bases], moves = []; let runs = 0;
  for (let index = 0; index < forcedCount; index += 1) next[index] = false;
  for (let index = 0; index < forcedCount; index += 1) {
    const destination = index + 2, isLead = destination === targetNode, out = isLead && leadOut;
    moves.push({ startNode: index + 1, endNode: destination, character: null, role: isLead ? "lead" : "runner", out });
    if (!out) { if (destination >= 4) runs += 1; else next[destination - 1] = true; }
  }
  for (let index = forcedCount; index < 3; index += 1) if (bases[index]) moves.push({ startNode: index + 1, endNode: index + 1, character: null, role: "runner", out: false });
  moves.push({ startNode: 0, endNode: 1, character, role: "batter", out: batterOut });
  if (!batterOut) next[0] = true;
  return { bases: next, runs, moves };
}

function buildGroundRace(now, target) {
  let forcedCount = 0;
  while (forcedCount < 3 && state.bases[forcedCount]) forcedCount += 1;
  const targetNode = forcedCount + 1, destination = BASE_PATH[targetNode];
  const fieldingDelay = 360 - state.level * 28, throwFactor = Math.max(.2, .32 - state.level * .024);
  const throwDuration = (from, to) => 340 + Math.hypot(to.x - from.x, to.y - from.y) * throwFactor;
  const firstThrowStart = now + fieldingDelay, firstReceive = firstThrowStart + throwDuration({ x: target.fieldX, y: target.fieldY }, destination);
  const runnerArrival = state.flight.start + runningDuration(1), leadOut = firstReceive < runnerArrival;
  const relay = targetNode > 1 && leadOut && state.outs + 1 < 3 && Math.random() < levels[state.level].doublePlayChance;
  const secondThrowStart = firstReceive + 150, secondReceive = relay ? secondThrowStart + throwDuration(destination, BASE_PATH[1]) : null;
  const batterOut = targetNode === 1 ? leadOut : relay && secondReceive < runnerArrival;
  const result = buildGroundResult(state.bases, targetNode, leadOut, batterOut, state.character);
  const firstLabel = BASE_PATH[targetNode].label, stages = [{ at: firstReceive, out: leadOut, text: leadOut ? `${firstLabel} 포스 아웃!` : `${firstLabel} 세이프!`, fired: false }];
  if (relay) stages.push({ at: secondReceive, out: batterOut, text: batterOut ? "1루도 아웃!" : "1루 세이프!", fired: false });
  result.moves.forEach((move) => { if (move.out) move.outAt = move.role === "batter" && relay ? secondReceive : firstReceive; });
  return { result, action: { kind: "groundRace", start: now, target, targetNode, firstThrowStart, firstReceive, secondThrowStart, secondReceive, relay, stages }, runnerArrival };
}

function runningDuration(distance) {
  return (2400 + Math.max(0, distance - 1) * 1300) * characters[state.character].runnerSpeed;
}

function finishFlight() {
  if (state.phase !== "flight") return;
  const now = performance.now(); const { type, target, caught } = state.flight; state.phase = "resulting";
  if (type === "땅볼") {
    const race = buildGroundRace(now, target), duration = runningDuration(1), finalAt = Math.max(race.runnerArrival, race.action.secondReceive || race.action.firstReceive);
    state.runningPlay = { start: state.flight.start, duration, moves: race.result.moves, resultBases: race.result.bases, runs: race.result.runs, type: "땅볼", resultMessage: race.action.relay ? "병살 플레이가 끝났어요." : "땅볼 승부가 끝났어요.", committed: false };
    state.fieldAction = race.action; setMessage(`${BASE_PATH[race.action.targetNode].label}에서 승부해요!`); tone(120, .16); continuePlay(finalAt - now + 850); return;
  }
  if (caught) {
    state.fieldAction = { kind: "catch", start: now, target }; state.outs += 1; setMessage(`${target.label}가 잡았어요! 플라이 아웃!`); showEffect("플라이 아웃!", "out"); playSound("out"); updateHud(); continuePlay(1450); return;
  }
  const distance = type === "단타" ? 1 : type === "2루타" ? 2 : type === "3루타" ? 3 : 4;
  const result = buildRunningPlay(state.bases, distance); const duration = runningDuration(distance);
  state.runningPlay = { start: state.flight.start, duration, moves: result.moves, resultBases: result.bases, runs: result.runs, type, committed: false };
  state.fieldAction = type === "홈런" ? null : { kind: "throw", start: now, target };
  setMessage(type === "홈런" ? "홈런! 주자들이 홈까지 달려요!" : `${type}! 타자가 ${BASE_PATH[distance].label}까지 달려요!`);
  tone(620, .12); continuePlay(duration + 450);
}

function commitRunningPlay() {
  const play = state.runningPlay;
  if (!play || play.committed) return;
  const basesChanged = state.bases.some((base, index) => base !== play.resultBases[index]);
  play.committed = true; state.bases = play.resultBases; state.score += play.runs; if (play.type === "홈런") state.homeRuns += 1;
  updateHud(); setMessage(play.resultMessage || (play.runs ? `${play.type}! ${play.runs}점 들어왔어요!` : `${play.type}! 주자가 베이스에 도착했어요!`));
  if (basesChanged || play.runs) { showEffect(play.runs ? `${play.runs}점!` : "주자 이동!", "runner"); playSound("runner"); }
}

function continuePlay(delay) {
  const token = state.token, scheduledAt = performance.now();
  const next = () => { if (token !== state.token || state.screen !== "game") return; updatePlayEvents(performance.now()); commitRunningPlay(); if (state.score >= levels[state.level].target) endGame(true); else if (state.outs >= 3) endGame(false); else nextPitch(); };
  setTimeout(() => {
    if (state.paused) { const elapsedBeforePause = Math.max(0, state.pauseStarted - scheduledAt); state.resumeAction = () => continuePlay(Math.max(0, delay - elapsedBeforePause)); }
    else next();
  }, delay);
}

function endGame(won) {
  state.phase = "idle"; state.token += 1;
  if (won) { state.unlocked = Math.max(state.unlocked, Math.min(levels.length, state.level + 2)); saveProgress(); }
  $("resultBadge").textContent = won ? "★" : "↻"; $("resultTitle").textContent = won ? "참 잘했어요!" : "다시 해볼까요?";
  $("resultArt").src = won ? "assets/09-result-win.png" : "assets/10-result-encouragement.png";
  $("resultCopy").textContent = won ? `${levels[state.level].target}점 목표를 달성했어요.` : "아웃 3번이 되었어요. 다음에는 더 늦게 눌러 보세요.";
  $("resultScore").textContent = state.score; $("resultHomeRuns").textContent = state.homeRuns;
  $("resultPrimary").textContent = won && state.level + 1 < levels.length ? "다음 경기  →" : "처음으로  →"; showScreen("result");
}

function updateHud() {
  $("scoreValue").textContent = state.score; $("targetValue").textContent = levels[state.level].target; $("strikeValue").textContent = `${state.strikes} / 3`; $("outValue").textContent = `${state.outs} / 3`;
  ["base1", "base2", "base3"].forEach((id, index) => $(id).classList.toggle("on", state.bases[index]));
}

function setMessage(message) { state.message = message; $("gameMessage").textContent = message; }

function togglePause(paused) {
  if (paused === state.paused) return;
  if (paused) { state.paused = true; state.pauseStarted = performance.now(); setMessage("잠시 쉬는 중이에요."); }
  else {
    const elapsed = state.pauseStarted ? performance.now() - state.pauseStarted : 0;
    for (const timed of [state.pitch, state.flight, state.foul, state.action, state.fieldAction, state.runningPlay]) if (timed?.start) timed.start += elapsed;
    state.paused = false; state.pauseStarted = null; const action = state.resumeAction; state.resumeAction = null;
    if (action) action(); else if (state.phase === "between" && !state.pitch) setTimeout(nextPitch, 180);
  }
  $("pausePanel").hidden = !paused;
}

function tone(frequency, seconds) {
  if (state.muted) return;
  try { const audio = window.__miniBaseballAudio || (window.__miniBaseballAudio = new AudioContext()); const oscillator = audio.createOscillator(); const gain = audio.createGain(); oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.035, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + seconds); oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + seconds); } catch { /* sound is optional */ }
}

function playSound(kind) {
  const patterns = {
    strike: [[180, .09, 0]], strikeout: [[190, .11, 0], [135, .2, 130]], out: [[165, .08, 0], [105, .16, 95]],
    safe: [[430, .07, 0], [650, .12, 75]], runner: [[420, .06, 0], [560, .07, 70], [720, .12, 145]]
  };
  for (const [frequency, seconds, delay] of patterns[kind] || []) setTimeout(() => tone(frequency, seconds), delay);
}

function showEffect(text, kind) {
  const effect = $("playEffect"), wrap = $("gameWrap"), board = $("scoreboard"), token = ++state.effectToken;
  effect.className = "play-effect"; wrap.classList.remove("fx-out", "fx-runner"); board.classList.remove("fx-update"); void effect.offsetWidth;
  effect.textContent = text; effect.className = `play-effect ${kind} show`; wrap.classList.add(kind === "runner" || kind === "safe" ? "fx-runner" : "fx-out"); board.classList.add("fx-update");
  setTimeout(() => { if (token !== state.effectToken) return; effect.className = "play-effect"; effect.textContent = ""; wrap.classList.remove("fx-out", "fx-runner"); board.classList.remove("fx-update"); }, 950);
}

function updatePlayEvents(now) {
  const action = state.fieldAction;
  if (action?.kind !== "groundRace") return;
  for (const stage of action.stages) {
    if (stage.fired || now < stage.at) continue;
    stage.fired = true;
    if (stage.out) state.outs = Math.min(3, state.outs + 1);
    setMessage(stage.text); updateHud(); showEffect(stage.text, stage.out ? "out" : "safe"); playSound(stage.out ? "out" : "safe");
  }
}

function draw() {
  const now = state.paused && state.pauseStarted ? state.pauseStarted : performance.now(); const level = levels[state.level] || levels[0];
  if (!state.paused) updatePlayEvents(now);
  ctx.clearRect(0, 0, canvas.width, canvas.height); drawBackground(level); drawBases(); drawFielders(now); drawPitcher(now); drawBaseRunners(now);
  const flightProgress = state.phase === "flight" && state.flight ? Math.min(1, (now - state.flight.start) / 900) : null;
  if (flightProgress !== null) { drawTrajectory(); drawFieldingAction(flightProgress); }
  else if (state.phase === "resulting" && state.fieldAction) drawFieldingResult(now);
  drawCatcher(); drawBatter(now);
  if (state.phase === "pitching" && state.pitch) {
    const progress = Math.min(1, (now - state.pitch.start) / state.pitch.duration);
    const pitchX = fieldLayout.mound[0], pitchY = fieldLayout.mound[1] + 10;
    drawBall(pitchX + (CONTACT.x - pitchX) * progress + Math.sin(progress * Math.PI) * state.pitch.curve * 75, pitchY + (CONTACT.y - pitchY) * progress, 7 + progress * 5);
    if (progress >= 1 && !state.paused) resolveStrike("조금 늦었어요");
  } else if (state.phase === "flight" && state.flight) {
    const point = flightPoint(flightProgress); drawBall(point.x, point.y, Math.max(6, 11 - flightProgress * 4)); if (flightProgress >= 1 && !state.paused) finishFlight();
  } else if (state.phase === "foul" && state.foul) {
    const progress = Math.min(1, (now - state.foul.start) / 520); drawFoulTrajectory(); const point = foulPoint(progress); drawBall(point.x, point.y, 8);
  }
  requestAnimationFrame(draw);
}

function drawBackground(level) {
  const image = images[level.background]; if (image.complete && image.naturalWidth) ctx.drawImage(image, 0, 0, canvas.width, canvas.height); else { ctx.fillStyle = level.color; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.fillStyle = "rgba(16,35,63,.07)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFrame(name, frame, x, y, maxWidth, maxHeight, flip = false) {
  const safeFrame = Math.max(0, Math.min(4, Math.floor(frame))); const image = images[`${name}-${safeFrame}`]; if (!image?.complete || !image.naturalWidth) return;
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight); const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
  ctx.save(); ctx.translate(x, 0); if (flip) ctx.scale(-1, 1); ctx.drawImage(image, -width / 2, y - height, width, height); ctx.restore();
}

function drawStandalone(name, x, y, maxWidth, maxHeight, flip = false) {
  const image = images[name]; if (!image?.complete || !image.naturalWidth) return;
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight); const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
  ctx.save(); ctx.translate(x, 0); if (flip) ctx.scale(-1, 1); ctx.drawImage(image, -width / 2, y - height, width, height); ctx.restore();
}

function drawPitcher(now) {
  let frame = 0;
  if (state.phase === "pitching" && state.pitch) {
    const progress = Math.min(1, (now - state.pitch.start) / state.pitch.duration); frame = progress < .3 ? 1 : progress < .82 ? 4 : 0;
  }
  const x = fieldLayout.mound[0], y = fieldLayout.mound[1] + 72;
  drawGroundShadow(x, y, 33, .18); drawFrame("pitcher", frame, x, y, 78, 92);
}

function drawBatter(now) {
  if (state.runningPlay) return;
  const action = state.action; let frame = 0;
  if (action?.kind === "swing") { const elapsed = now - action.start; frame = elapsed < 110 ? 1 : action.outcome === "홈런" && elapsed > 420 ? 4 : action.outcome === "miss" ? 1 : 2; }
  drawGroundShadow(264, 509, 74, .22); drawFrame(characters[state.character].motion, frame, 264, 509, 218, 238);
}

function drawCatcher() {
  drawGroundShadow(112, 516, 50, .2); drawFrame("catcher", 0, 112, 516, 132, 154);
}

function drawBaseLines() {
  ctx.save(); ctx.strokeStyle = "rgba(255,255,255,.58)"; ctx.lineWidth = 4; ctx.setLineDash([9, 9]); ctx.beginPath(); ctx.moveTo(BASE_PATH[0].x, BASE_PATH[0].y); for (let i = 1; i < BASE_PATH.length; i += 1) ctx.lineTo(BASE_PATH[i].x, BASE_PATH[i].y); ctx.stroke(); ctx.restore();
}

function drawBases() {
  BASE_PATH.slice(1, 4).forEach(({ x, y }, index) => {
    if (!state.bases[index] || state.runningPlay) return;
    ctx.save(); ctx.fillStyle = "rgba(255,201,74,.42)"; ctx.strokeStyle = "rgba(242,106,61,.85)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y + 1, 28, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
  });
}

function activeFielderIndices() {
  const active = new Set();
  if (state.phase === "flight" && state.flight?.type !== "홈런") active.add(state.flight.target.fielderIndex);
  if (state.phase === "resulting" && state.fieldAction) {
    active.add(state.fieldAction.target.fielderIndex);
    if (state.fieldAction.kind === "groundRace") {
      const receiver = { 1: 3, 2: 2, 3: 0 }[state.fieldAction.targetNode]; if (receiver !== undefined) active.add(receiver);
      if (state.fieldAction.relay) active.add(3);
    }
  }
  return active;
}

function drawFielders(now) {
  const active = activeFielderIndices();
  [...FIELDERS].sort((a, b) => a.y - b.y).forEach((fielder) => {
    const index = FIELDERS.indexOf(fielder); if (active.has(index)) return;
    drawGroundShadow(fielder.x, fielder.y, fielder.height * .3, .15); drawFrame("pitcher", 0, fielder.x, fielder.y, fielder.height * .72, fielder.height, index === 0 || index === 4);
  });
}

function drawBaseRunners(now) {
  if (!state.runningPlay) {
    state.bases.forEach((occupied, index) => {
      if (!occupied) return; const base = BASE_PATH[index + 1], height = index === 1 ? 54 : 64;
      drawGroundShadow(base.x, base.y - 5, height * .32, .16); drawStandalone("runnerStand", base.x, base.y - 5, height * .86, height, index === 2);
    }); return;
  }
  const progress = Math.min(1, (now - state.runningPlay.start) / state.runningPlay.duration);
  for (const move of state.runningPlay.moves) {
    if (move.outAt && now > move.outAt + 220) continue;
    const point = runningPoint(move, progress), name = move.character === 2 ? "tori" : "runner", frame = Math.floor((now - state.runningPlay.start) / 95) % 5;
    drawGroundShadow(point.x, point.y, 27, .18); drawFrame(name, frame, point.x, point.y, 70, 78, point.flip);
  }
}

function runningPoint(move, progress) {
  const span = move.endNode - move.startNode;
  if (span <= 0) { const point = BASE_PATH[move.startNode]; return { x: point.x, y: point.y, flip: false }; }
  const travelled = Math.min(span - .0001, progress * span); const segment = Math.floor(travelled); const local = travelled - segment;
  const from = BASE_PATH[move.startNode + segment], to = BASE_PATH[move.startNode + segment + 1], eased = local * local * (3 - 2 * local);
  return { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased, flip: to.x < from.x };
}

function drawBall(x, y, radius) {
  const image = images.ballSheet;
  ctx.save(); ctx.shadowColor = "rgba(16,35,63,.32)"; ctx.shadowBlur = 5; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.clip();
  if (image?.complete && image.naturalWidth) ctx.drawImage(image, 185, 245, 165, 165, x - radius, y - radius, radius * 2, radius * 2);
  else { ctx.fillStyle = "#fffdf8"; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); }
  ctx.restore();
}

function drawGroundShadow(x, y, radius, opacity) {
  ctx.save(); ctx.fillStyle = `rgba(16,35,63,${opacity})`; ctx.beginPath(); ctx.ellipse(x, y, radius, Math.max(3, radius * .24), 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function flightPoint(progress) {
  const start = CONTACT, target = state.flight.target, grounder = state.flight.type === "땅볼", control = { x: (start.x + target.ballX) / 2, y: grounder ? Math.max(target.ballY, start.y - 28) : Math.min(start.y, target.ballY) - (state.flight.type === "홈런" ? 210 : 115) }, inverse = 1 - progress;
  return { x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * target.ballX, y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * target.ballY };
}

function foulPoint(progress) {
  const start = CONTACT, end = { x: state.foul.side < 0 ? 105 : 855, y: 285 }, control = { x: (start.x + end.x) / 2, y: 250 }, inverse = 1 - progress;
  return { x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x, y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y };
}

function drawFoulTrajectory() {
  const start = CONTACT, end = { x: state.foul.side < 0 ? 105 : 855, y: 285 }, control = { x: (start.x + end.x) / 2, y: 250 }; drawDashedPath(start, control, end, "#f26a3d"); drawTag("파울!", end.x, end.y - 38, "#d34d2a");
}

function drawTrajectory() {
  const start = CONTACT, target = state.flight.target, grounder = state.flight.type === "땅볼", control = { x: (start.x + target.ballX) / 2, y: grounder ? Math.max(target.ballY, start.y - 28) : Math.min(start.y, target.ballY) - (state.flight.type === "홈런" ? 210 : 115) };
  drawDashedPath(start, control, target, "rgba(255,247,136,.7)");
  if (state.flight.type !== "홈런") {
    ctx.save(); ctx.fillStyle = "rgba(255,201,74,.3)"; ctx.strokeStyle = "rgba(242,106,61,.75)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(target.fieldX, target.fieldY, 24, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    drawTag(target.label, target.fieldX, target.fieldY - 18, "#10233f");
  }
}

function drawDashedPath(start, control, end, color) {
  ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = color; ctx.shadowColor = "rgba(16,35,63,.42)"; ctx.shadowBlur = 7; ctx.setLineDash([15, 11]); ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.quadraticCurveTo(control.x, control.y, end.ballX ?? end.x, end.ballY ?? end.y); ctx.stroke(); ctx.restore();
}

function drawTag(text, x, y, color) {
  ctx.save(); ctx.font = "900 15px sans-serif"; ctx.textAlign = "center"; const width = ctx.measureText(text).width + 20; ctx.fillStyle = "rgba(255,255,255,.94)"; ctx.beginPath(); ctx.roundRect(x - width / 2, y - 18, width, 26, 13); ctx.fill(); ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore();
}

function drawFieldingAction(progress) {
  if (state.flight.type === "홈런") return;
  const target = state.flight.target, home = FIELDERS[target.fielderIndex], approach = Math.min(1, progress / .78);
  const x = home.x + (target.fieldX - home.x) * approach, y = home.y + (target.fieldY - home.y) * approach;
  drawGroundShadow(x, y, 24, .18); drawFrame("pitcher", progress < .72 ? 4 : 0, x, y, 62, 78, target.fieldX < home.x);
}

function drawFieldingResult(now) {
  const action = state.fieldAction, elapsed = now - action.start, target = action.target, fielder = FIELDERS[target.fielderIndex], at = { x: target.fieldX, y: target.fieldY };
  if (action.kind === "groundRace") {
    const firstBase = BASE_PATH[action.targetNode], firstGlove = { x: firstBase.x, y: firstBase.y - 42 };
    drawGroundShadow(at.x, at.y, 25, .18); drawFrame("pitcher", now < action.firstThrowStart ? 0 : 4, at.x, at.y, 66, 82, target.fieldX < fielder.x);
    if (now < action.firstThrowStart) { drawTag("땅볼 포구!", at.x, at.y + 18, "#10233f"); return; }
    drawReceiver(action.targetNode);
    if (now < action.firstReceive) {
      drawThrowBall({ x: at.x, y: at.y - 52 }, firstGlove, (now - action.firstThrowStart) / (action.firstReceive - action.firstThrowStart)); return;
    }
    if (action.relay) {
      drawReceiver(1);
      if (now >= action.secondThrowStart && now < action.secondReceive) drawThrowBall(firstGlove, { x: BASE_PATH[1].x, y: BASE_PATH[1].y - 42 }, (now - action.secondThrowStart) / (action.secondReceive - action.secondThrowStart));
    }
    return;
  }
  if (action.kind === "catch") {
    drawGroundShadow(at.x, at.y, 25, .18); drawFrame("pitcher", elapsed < 520 ? 0 : 4, at.x, at.y, 66, 82, target.fieldX < fielder.x); drawTag(elapsed < 520 ? "포구!" : "내야로 송구!", at.x, at.y + 18, "#10233f");
    if (elapsed > 520 && elapsed < 1050) drawThrowBall({ x: at.x, y: at.y - 52 }, { x: 480, y: 322 }, (elapsed - 520) / 530); return;
  }
  drawGroundShadow(at.x, at.y, 25, .18); drawFrame("pitcher", elapsed < 370 ? 0 : 4, at.x, at.y, 66, 82, target.fieldX < fielder.x); drawTag(elapsed < 370 ? `${target.label} 포구` : "1루로 송구!", at.x, at.y + 18, "#10233f");
  if (elapsed > 370) {
    const progress = Math.min(1, (elapsed - 370) / 650), first = FIELDERS[3];
    drawThrowBall({ x: at.x, y: at.y - 52 }, { x: first.x - 9, y: first.y - 50 }, progress);
    if (progress >= .8) drawTag("1루수 포구", first.x, first.y + 18, "#10233f");
  }
}

function drawReceiver(node) {
  const base = BASE_PATH[node], x = base.x + (node === 1 ? -10 : node === 3 ? 10 : 0), y = base.y + 8;
  drawGroundShadow(x, y, 23, .17); drawFrame("pitcher", 4, x, y, 58, 74, node === 3);
}

function drawThrowBall(from, to, progress) {
  ctx.save(); ctx.strokeStyle = "rgba(255,255,255,.65)"; ctx.lineWidth = 2; ctx.setLineDash([7, 9]); ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke(); ctx.restore();
  drawBall(from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress - Math.sin(progress * Math.PI) * 34, 7);
}

document.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.screen)));
$("startButton").addEventListener("click", () => { tone(440, .08); showScreen("character"); });
$("characterNext").addEventListener("click", () => { tone(440, .08); showScreen("level"); });
$("swingButton").addEventListener("click", swing); canvas.addEventListener("click", swing);
$("pauseButton").addEventListener("click", () => togglePause(true)); $("closePause").addEventListener("click", () => togglePause(false)); $("resumeButton").addEventListener("click", () => togglePause(false));
$("quitButton").addEventListener("click", () => { state.token += 1; state.phase = "idle"; togglePause(false); showScreen("level"); });
$("resultRetry").addEventListener("click", () => startGame(state.level));
$("resultPrimary").addEventListener("click", () => state.level + 1 < levels.length && state.level + 1 < state.unlocked ? startGame(state.level + 1) : showScreen("home"));
$("soundToggle").addEventListener("click", () => { state.muted = !state.muted; $("soundToggle").textContent = state.muted ? "🔇" : "🔊"; $("soundToggle").setAttribute("aria-label", state.muted ? "소리 켜기" : "소리 끄기"); });
document.addEventListener("keydown", (event) => { if ((event.code === "Space" || event.code === "Enter") && state.screen === "game") { event.preventDefault(); swing(); } if (event.code === "Escape" && state.screen === "game") togglePause(!state.paused); });

function runSelfCheck() {
  let result = buildRunningPlay([true, true, true], 1); console.assert(result.runs === 1 && result.bases.every(Boolean), "만루 단타는 1점과 만루를 유지해야 합니다.");
  result = buildRunningPlay([true, false, true], 2); console.assert(result.runs === 1 && result.bases[1] && result.bases[2], "1·3루 2루타는 1점, 2·3루 주자여야 합니다.");
  result = buildRunningPlay([false, false, false], 4); console.assert(result.runs === 1 && result.bases.every((base) => !base), "주자 없는 홈런은 1점이어야 합니다.");
  result = buildGroundResult([false, false, false], 1, true, true, 0); console.assert(result.bases.every((base) => !base) && result.moves[0].out, "1루 송구가 빠르면 타자주자는 아웃이어야 합니다.");
  result = buildGroundResult([true, false, false], 2, true, true, 0); console.assert(result.bases.every((base) => !base) && result.moves.filter((move) => move.out).length === 2, "2루 포스아웃 뒤 1루 송구가 빠르면 병살이어야 합니다.");
  result = buildGroundResult([true, true, false], 3, true, false, 0); console.assert(result.bases[0] && result.bases[1] && !result.bases[2], "3루 포스아웃 뒤 타자와 1루 주자는 살아야 합니다.");
  result = buildGroundResult([true, true, true], 4, false, false, 0); console.assert(result.runs === 1 && result.bases.every(Boolean), "만루에서 홈 세이프면 1점과 만루가 유지되어야 합니다.");
  console.assert(levels.length === 6, "여섯 레벨이 있어야 합니다.");
}

loadProgress(); renderCharacters(); renderLevels(); runSelfCheck(); updateHud(); requestAnimationFrame(draw);
