const levels = [
  { name: "동네 야구장", target: 3, pitchMs: 2000, window: .28, successChance: .9, hitFlightScale: 2.45, doublePlayChance: 0, foulChance: .06, type: "직선 공", background: "easy", color: "#7ec8ed" },
  { name: "바람 부는 경기장", target: 4, pitchMs: 1850, window: .25, successChance: .8, hitFlightScale: 2.39, doublePlayChance: .08, foulChance: .08, type: "높은 공", background: "easy", color: "#a9d6f2" },
  { name: "해 질 녘 경기장", target: 5, pitchMs: 1700, window: .22, successChance: .7, hitFlightScale: 2.33, doublePlayChance: .15, foulChance: .1, type: "빠른 공", background: "medium", color: "#f4b67c" },
  { name: "구불구불 경기장", target: 6, pitchMs: 1550, window: .2, successChance: .6, hitFlightScale: 2.27, doublePlayChance: .22, foulChance: .12, type: "휘는 공", background: "medium", color: "#cdb5ef" },
  { name: "풍선 경기장", target: 8, pitchMs: 1400, window: .18, successChance: .5, hitFlightScale: 2.21, doublePlayChance: .3, foulChance: .14, type: "장애물 등장", background: "hard", color: "#8bd7a1" },
  { name: "챔피언 경기장", target: 10, pitchMs: 1250, window: .16, successChance: .4, hitFlightScale: 2.15, doublePlayChance: .38, foulChance: .16, type: "빠른 공 + 장애물", background: "hard", color: "#f28b7a" }
];
const RUNNER_SPEED_MULTIPLIER = 1.05;

const characters = [
  { name: "정우", asset: "assets/02-character-minjun-power-glasses.png", motion: "minjun-glasses", role: "힘껏 치는 친구", detail: "홈런 타이밍이 조금 더 넓어요.", bonus: .025, runnerSpeed: 1, tag: "파워형" },
  { name: "세연", asset: "assets/03-character-yuna-focus.png", motion: "yuna", role: "침착한 타자", detail: "좋은 타격 구간이 조금 더 넓어요.", bonus: .045, runnerSpeed: 1, tag: "집중형" },
  { name: "토리", asset: "assets/04-character-tori-speed.png", motion: "toribat", role: "빠르게 달리는 친구", detail: "베이스 사이를 더 빠르게 달려요.", bonus: .01, runnerSpeed: .84, tag: "스피드형" }
];
const assets = {
  home: "assets/01-home-hero.png", easy: "assets/stadium-easy-v2.png", medium: "assets/stadium-medium-v2.png",
  hard: "assets/stadium-hard-v2.png", ballSheet: "assets/15-vfx-ball-hit.png",
  redFielder: "assets/opponents/red-fielder.png", animalFielder: "assets/opponents/animal-fox.png", devilFielder: "assets/opponents/cute-devil.png"
};
const images = {};
for (const [name, src] of Object.entries(assets)) { images[name] = new Image(); images[name].src = src; }
for (const name of ["minjun-glasses", "yuna", "tori", "toribat", "pitcher", "runner", "catcher"]) {
  for (let frame = 0; frame < 5; frame += 1) { images[`${name}-${frame}`] = new Image(); images[`${name}-${frame}`].src = `assets/frames/${name}-${frame}.png`; }
}
images.runnerStand = new Image(); images.runnerStand.src = "assets/frames/runner-stand.png";

const CONTACT = { x: 370, y: 430 };
// Batting contact and pitching strike-zone coordinates are intentionally separate.
const PITCH_ZONE = { x: 340, y: 353, width: 114, height: 102 };
const PITCH_AIM_LABELS = ["왼쪽 위", "가운데 위", "오른쪽 위", "왼쪽 가운데", "한가운데", "오른쪽 가운데", "왼쪽 아래", "가운데 아래", "오른쪽 아래"];
const PITCH_AIM_SYMBOLS = ["↖", "↑", "↗", "←", "●", "→", "↙", "↓", "↘"];
const FIELD_LAYOUTS = {
  easy: { first: [894, 286], second: [480, 217], third: [65, 286], home: [480, 478], mound: [480, 280], fenceY: 132 },
  medium: { first: [842, 307], second: [480, 239], third: [116, 307], home: [480, 474], mound: [480, 307], fenceY: 126 },
  hard: { first: [877, 290], second: [480, 225], third: [83, 290], home: [480, 480], mound: [480, 289], fenceY: 145 }
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
  message: "준비되면 공이 날아와요.", muted: false, token: 0, action: null, strikes: 0, balls: 0, mode: "batting", runsAllowed: 0, pitchAim: { row: 1, col: 1 }, pitchLanding: null, fieldAction: null, foul: null, runningPlay: null, celebration: null, effectToken: 0
};
const BGM_TRACKS = [
  "assets/music/level-1-sunny.mp3", "assets/music/level-2-sunny.mp3", "assets/music/level-3-sunset.mp3",
  "assets/music/level-4-sunset.mp3", "assets/music/level-5-balloon.mp3", "assets/music/level-6-devils.mp3"
];
const SFX_TRACKS = {
  bat: "assets/sfx/bat-hit.mp3", glove: "assets/sfx/glove-catch.mp3", throw: "assets/sfx/throw.mp3",
  safe: "assets/sfx/safe-slide.mp3", out: "assets/sfx/out.mp3", homerun: "assets/sfx/home-run.mp3"
};
const backgroundMusic = new Audio();
backgroundMusic.loop = true; backgroundMusic.volume = .24;
let backgroundLevel = null;

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
  if (name !== "game") stopBackgroundMusic();
  if (name !== "game") $("pitchGauge").hidden = true;
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.toggle("active", screen.id === `${name}Screen`));
  if (name === "character") renderCharacters();
  if (name === "level") renderLevels();
}

function renderCharacters() {
  $("characterTitle").textContent = state.mode === "pitching" ? "누가 투수로 설까요?" : "누가 타석에 설까요?";
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
      <div class="level-number">${String(index + 1).padStart(2, "0")}</div><h3>${level.name}</h3><p>${state.mode === "pitching" ? "3아웃 잡기" : `목표 ${level.target}점`} · ${level.type}</p>${locked ? '<span class="lock">🔒</span>' : '<small>도전 가능</small>'}
    </button>`;
  }).join("");
  document.querySelectorAll("[data-level]").forEach((button) => button.addEventListener("click", () => startGame(Number(button.dataset.level))));
}

function startGame(levelIndex) {
  Object.assign(state, { level: levelIndex, score: 0, outs: 0, strikes: 0, balls: 0, runsAllowed: 0, bases: [false, false, false], homeRuns: 0, phase: "between", pitch: null, flight: null, action: null, fieldAction: null, foul: null, runningPlay: null, celebration: null, paused: false });
  configureField(levels[levelIndex].background);
  state.token += 1; $("gameEyebrow").textContent = `LEVEL ${levelIndex + 1}`; $("gameTitle").textContent = levels[levelIndex].name;
  $("swingButton").textContent = state.mode === "pitching" ? "🥎 지금 던져요!" : "⚾ 지금 쳐요!";
  showScreen("game"); playBackgroundMusic(levelIndex); updateHud(); setMessage(state.mode === "pitching" ? "게이지 가운데에서 던져요!" : "공을 보고, 준비되면 눌러요!");
  const token = state.token; setTimeout(() => { if (state.screen === "game" && token === state.token) nextPitch(); }, 850);
}

function nextPitch() {
  if (state.screen !== "game" || state.paused) return;
  if (state.mode === "pitching") { startPitcherTurn(); return; }
  state.phase = "pitching"; state.pitch = { start: performance.now(), duration: levels[state.level].pitchMs, curve: Math.random() * 2 - 1, type: levels[state.level].type };
  state.action = { kind: "pitch", start: state.pitch.start }; state.fieldAction = null; state.foul = null; state.runningPlay = null; state.celebration = null;
  $("pitchHint").classList.remove("hide"); $("pitchHint").textContent = "공을 보고 눌러요!"; setMessage(`${levels[state.level].type}! 타이밍을 맞춰요.`); tone(250, .05);
}

function startPitcherTurn() {
  state.phase = "pitchReady"; state.pitch = { start: performance.now(), duration: 820, curve: 0, type: "직구" };
  state.pitchLanding = null;
  state.action = { kind: "pitchReady", start: state.pitch.start }; state.fieldAction = null; state.foul = null; state.runningPlay = null; state.celebration = null;
  $("pitchHint").classList.remove("hide"); $("pitchHint").textContent = "아홉 칸 중 목표를 고르세요!";
  $("pitchGauge").hidden = false; setMessage("위치를 고르고, 게이지가 가운데일 때 던져요!");
  updatePitchControls();
}

function swing() {
  if (state.mode === "pitching") { throwPitch(); return; }
  if (state.screen !== "game" || state.paused || state.phase !== "pitching") return;
  const now = performance.now(); const pitchTime = (now - state.pitch.start) / state.pitch.duration; const center = .88;
  const windowSize = levels[state.level].window + characters[state.character].bonus; const delta = pitchTime - center;
  state.phase = "swinging"; state.action = { kind: "swing", start: now, outcome: null }; $("pitchHint").classList.add("hide"); tone(180, .1);
  if (Math.abs(delta) > windowSize) resolveStrike(delta < 0 ? "조금 빨라요" : "조금 늦었어요");
  else if (Math.abs(delta) > windowSize * (1 - levels[state.level].foulChance * 2)) resolveFoul();
  else resolveHit(Math.abs(delta));
}

function pitchGaugePosition(now = performance.now()) { return 50 + Math.sin((now - state.pitch.start) / 420) * 44; }

function pitchAimPoint(row = state.pitchAim.row, col = state.pitchAim.col) {
  return { x: PITCH_ZONE.x + (col + .5) * PITCH_ZONE.width / 3, y: PITCH_ZONE.y + (row + .5) * PITCH_ZONE.height / 3 };
}

function isPitchInZone(point) {
  return point.x >= PITCH_ZONE.x && point.x <= PITCH_ZONE.x + PITCH_ZONE.width &&
    point.y >= PITCH_ZONE.y && point.y <= PITCH_ZONE.y + PITCH_ZONE.height;
}

function pitchLandingPoint(aim, signedGauge, random = Math.random) {
  const accuracy = Math.abs(signedGauge);
  return { x: aim.x + signedGauge * 82 + (random() - .5) * 4,
    y: aim.y + (random() - .5) * (5 + accuracy * 48) };
}

function updatePitchControls() {
  $("pitchTargets").querySelectorAll("[data-pitch-target]").forEach((button) => {
    const row = Number(button.dataset.row), col = Number(button.dataset.col);
    const selected = state.pitchAim.row === row && state.pitchAim.col === col;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.disabled = state.paused || state.phase !== "pitchReady" || state.mode !== "pitching";
  });
}

function throwPitch() {
  if (state.screen !== "game" || state.paused || state.mode !== "pitching" || state.phase !== "pitchReady") return;
  const now = performance.now(), signedGauge = (pitchGaugePosition(now) - 50) / 44;
  const accuracy = Math.abs(signedGauge), aim = pitchAimPoint(), landing = pitchLandingPoint(aim, signedGauge);
  state.phase = "pitching";
  state.pitch = { start: now, duration: Math.round(760 + accuracy * 180), curve: signedGauge,
    type: "직구", accuracy, aim, landing, resolved: false };
  state.pitchLanding = landing;
  state.action = { kind: "throw", start: now, outcome: null };
  $("pitchGauge").hidden = true; $("pitchHint").classList.add("hide");
  setMessage(`목표: ${PITCH_AIM_LABELS[state.pitchAim.row * 3 + state.pitchAim.col]}! 공이 날아가요.`);
  updatePitchControls(); tone(220, .08);
}

function finishPitch() {
  if (state.mode !== "pitching" || !state.pitch || state.pitch.resolved) return;
  state.pitch.resolved = true;
  const accuracy = state.pitch.accuracy, inZone = isPitchInZone(state.pitch.landing);
  if (!inZone) { resolvePitchBall(); return; }
  const roll = Math.random(), hitChance = Math.min(.5, .1 + state.level * .045 + accuracy * .12);
  if (roll < hitChance) { resolveCpuHit(accuracy); return; }
  if (roll < hitChance + .18) { resolvePitchFoul(); return; }
  resolvePitchStrike(accuracy < .16 ? "좋은 공이에요" : "스트라이크예요");
}

function resolvePitchStrike(reason) {
  state.phase = "resulting"; state.strikes += 1; const strikeOut = state.strikes >= 3;
  if (strikeOut) { state.outs += 1; state.strikes = 0; state.balls = 0; showEffect("삼진!", "strikeout"); playSound("strikeout"); playEffectSound("out"); }
  else playSound("strike");
  setMessage(strikeOut ? `${reason}! 삼진을 잡았어요.` : `${reason}! 스트라이크 ${state.strikes}/3.`); updateHud(); continuePlay(strikeOut ? 1150 : 720);
}

function resolvePitchBall() {
  state.phase = "resulting"; state.balls += 1;
  if (state.balls < 4) { setMessage(`볼이에요. ${state.balls}/4`); updateHud(); continuePlay(720); return; }
  const next = [...state.bases]; let runs = 0;
  if (next[0]) { if (next[1]) { if (next[2]) runs = 1; else next[2] = true; } next[1] = true; }
  next[0] = true; state.bases = next; state.balls = 0; state.strikes = 0; state.runsAllowed += runs;
  setMessage(runs ? "볼넷 밀어내기 실점!" : "볼넷! 타자가 1루로 나가요."); showEffect(runs ? "실점!" : "볼넷!", runs ? "out" : "runner"); updateHud(); continuePlay(1050);
}

function resolvePitchFoul() {
  if (state.action) { state.action.outcome = "foul"; state.action.hitAt = performance.now(); }
  state.phase = "foul"; state.foul = { start: performance.now(), side: Math.random() < .5 ? -1 : 1 }; const counted = state.strikes < 2; if (counted) state.strikes += 1;
  setMessage(counted ? `파울! 스트라이크 ${state.strikes}/3.` : "파울! 두 스트라이크에서는 카운트가 늘지 않아요."); playEffectSound("bat"); updateHud(); continuePlay(820);
}

function resolveCpuHit(accuracy) {
  const delta = Math.min(.11, .018 + accuracy * .16 + Math.random() * .025);
  resolveHit(delta, true);
}

function resolveStrike(reason) {
  if (state.action) state.action.outcome = "miss";
  state.phase = "resulting"; state.strikes += 1; const strikeOut = state.strikes >= 3;
  if (strikeOut) { state.outs += 1; state.strikes = 0; showEffect("삼진 아웃!", "strikeout"); playSound("strikeout"); playEffectSound("out"); }
  else playSound("strike");
  setMessage(strikeOut ? `${reason}! 삼진 아웃이에요.` : `${reason}! 스트라이크 ${state.strikes}/3.`); updateHud(); continuePlay(strikeOut ? 1250 : 750);
}

function resolveFoul() {
  if (state.action) state.action.outcome = "foul";
  state.phase = "foul"; state.foul = { start: performance.now(), side: Math.random() < .5 ? -1 : 1 };
  const counted = state.strikes < 2; if (counted) state.strikes += 1;
  setMessage(counted ? `파울! 스트라이크 ${state.strikes}/3, 다시 준비해요.` : "파울! 두 스트라이크에서는 카운트가 늘지 않아요.");
  playEffectSound("bat"); tone(150, .12); updateHud(); continuePlay(850);
}

function resolveHit(delta, cpuHit = false) {
  let type = "단타"; if (delta < .008) type = "홈런"; else if (delta < .017) type = "3루타"; else if (delta < .035) type = "2루타";
  const safeHit = cpuHit ? Math.random() < .28 + (state.pitch?.accuracy || 0) * .55 : battedBallSucceeded(state.level);
  if (!safeHit && type === "홈런") type = "단타";
  if (!safeHit && Math.random() < .55) type = "땅볼";
  const start = performance.now(), distance = hitDistance(type), duration = flightDuration(type, safeHit), target = chooseFlightTarget(type);
  state.flight = { start, duration, type, caught: false, target };
  const preview = buildRunningPlay(state.bases, distance, target, start + duration);
  state.strikes = 0; playEffectSound("bat");
  state.runningPlay = { start, duration: playDuration(preview.moves), moves: preview.moves, resultBases: preview.bases, runs: preview.runs, type, preview: true, committed: false };
  if (state.action) { state.action.outcome = type; if (cpuHit) state.action.hitAt = start; }
  const hitMessage = type === "단타" ? "짧은 외야 타구! 주자와 송구의 승부예요." : type === "2루타" ? "외야 깊은 타구! 2루까지 달려요." : "담장 쪽 깊은 타구! 3루에 도전해요.";
  state.phase = "flight"; updateHud(); setMessage(type === "홈런" ? "완벽해요! 담장 너머로 날아가요!" : type === "땅볼" ? "땅볼! 수비수가 달려와요!" : hitMessage); tone(type === "홈런" ? 700 : 520, .12);
}

function chooseFlightTarget(type) {
  const zones = type === "땅볼" ? [[1, 430, 336, 405, 328], [2, 585, 336, 590, 326], [0, 220, 350, 205, 342]] : type === "단타"
    ? [[4, 300, 250, 300, 250], [5, 480, 235, 480, 235], [6, 660, 250, 660, 250]]
    : type === "2루타" ? [[4, 180, 205, 205, 215], [6, 780, 205, 755, 215]]
      : type === "3루타" ? [[4, 120, 175, 145, 185], [6, 840, 175, 815, 185]]
        : [[5, 270, fieldLayout.fenceY - 58, 480, fieldLayout.fenceY], [6, 700, fieldLayout.fenceY - 52, 700, fieldLayout.fenceY]];
  const [fielderIndex, ballX, ballY, fieldX, fieldY] = zones[Math.floor(Math.random() * zones.length)];
  return { fielderIndex, ballX, ballY, fieldX, fieldY, label: type === "홈런" ? `${FIELDERS[fielderIndex].label} 뒤 담장` : FIELDERS[fielderIndex].label };
}

function hitDistance(type) { return type === "단타" || type === "땅볼" ? 1 : type === "2루타" ? 2 : type === "3루타" ? 3 : 4; }

function hitRelayNodes(type) { return Array.from({ length: hitDistance(type) }, (_, index) => index + 1); }

function battedBallSucceeded(levelIndex, random = Math.random) { return random() < levels[levelIndex].successChance; }

function flightDuration(type, safeHit) {
  const base = type === "땅볼" ? 520 : type === "단타" ? 680 : type === "2루타" ? 820 : type === "3루타" ? 940 : 1150;
  return Math.round(base * 1.1 * (safeHit ? levels[state.level].hitFlightScale : .9));
}

function buildRunningPlay(bases, distance, target = null, fieldedAt = 0) {
  const next = [false, false, false]; const moves = []; let runs = 0;
  for (let index = 2; index >= 0; index -= 1) {
    if (!bases[index]) continue;
    const startNode = index + 1, maxNode = Math.min(4, startNode + distance);
    let destination = maxNode;
    if (target) {
      destination = Math.min(4, startNode + 1);
      while (destination < maxNode && canAutoAdvance(startNode, destination + 1, null, target, fieldedAt)) destination += 1;
    }
    moves.push({ startNode, endNode: destination, character: null });
    if (destination >= 4) runs += 1; else next[destination - 1] = true;
  }
  const batterMax = distance;
  let batterDestination = batterMax;
  if (target && distance < 4) {
    batterDestination = 1;
    while (batterDestination < batterMax && canAutoAdvance(0, batterDestination + 1, state.character, target, fieldedAt)) batterDestination += 1;
  }
  moves.push({ startNode: 0, endNode: batterDestination, character: state.character });
  if (batterDestination >= 4) runs += 1; else next[batterDestination - 1] = true;
  prepareMoves(moves); return { bases: next, runs, moves };
}

function canAutoAdvance(startNode, destination, character, target, fieldedAt) {
  const runnerAtBase = state.flight.start + runningDuration(destination - startNode, startNode, character);
  const defenseAtBase = fieldedAt + fieldingReleaseDelay() + defensiveThrowDuration({ x: target.fieldX, y: target.fieldY }, BASE_PATH[destination]);
  return runnerAtBase + 350 < defenseAtBase;
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
  prepareMoves(moves); return { bases: next, runs, moves };
}

function pathLength(startNode, endNode) {
  let total = 0;
  for (let node = startNode; node < endNode; node += 1) total += Math.hypot(BASE_PATH[node + 1].x - BASE_PATH[node].x, BASE_PATH[node + 1].y - BASE_PATH[node].y);
  return total;
}

function prepareMoves(moves) {
  for (const move of moves) move.duration = runningDuration(move.endNode - move.startNode, move.startNode, move.character);
}

function playDuration(moves) { return Math.max(0, ...moves.map((move) => move.duration)); }

function buildGroundRace(now, target) {
  let forcedCount = 0;
  while (forcedCount < 3 && state.bases[forcedCount]) forcedCount += 1;
  const targetNode = forcedCount + 1, destination = BASE_PATH[targetNode];
  const fieldingDelay = 360 - state.level * 28;
  const firstThrowStart = now + fieldingDelay, firstReceive = firstThrowStart + defensiveThrowDuration({ x: target.fieldX, y: target.fieldY }, destination);
  const runnerArrival = state.flight.start + runningDuration(1), leadOut = firstReceive < runnerArrival;
  const relay = targetNode > 1 && leadOut && state.outs + 1 < 3 && Math.random() < levels[state.level].doublePlayChance;
  const secondThrowStart = firstReceive + 150, secondReceive = relay ? secondThrowStart + defensiveThrowDuration(destination, BASE_PATH[1]) : null;
  const batterOut = targetNode === 1 ? leadOut : relay && secondReceive < runnerArrival;
  const result = buildGroundResult(state.bases, targetNode, leadOut, batterOut, state.character);
  const firstLabel = BASE_PATH[targetNode].label, stages = [{ at: firstReceive, out: leadOut, text: leadOut ? `${firstLabel} 포스 아웃!` : `${firstLabel} 세이프!`, fired: false }];
  if (relay) stages.push({ at: secondReceive, out: batterOut, text: batterOut ? "1루도 아웃!" : "1루 세이프!", fired: false });
  result.moves.forEach((move) => { if (move.out) move.outAt = move.role === "batter" && relay ? secondReceive : firstReceive; });
  return { result, action: { kind: "groundRace", start: now, target, targetNode, firstThrowStart, firstReceive, secondThrowStart, secondReceive, relay, firstThrowPlayed: false, secondThrowPlayed: false, stages }, runnerArrival };
}

function defensiveThrowDuration(from, to) {
  const throwFactor = Math.max(.2, .32 - state.level * .024);
  return Math.round((340 + Math.hypot(to.x - from.x, to.y - from.y) * throwFactor) * 1.1);
}

function fieldingReleaseDelay(level = state.level) { return Math.max(150, 260 - level * 18); }

function buildHitRace(now, type, target) {
  const planned = state.runningPlay;
  const result = { bases: [...planned.resultBases], runs: planned.runs, moves: planned.moves.map((move) => ({ ...move })) };
  const candidate = chooseThrowTarget(result.moves, target, now);
  const node = candidate.endNode, from = { x: target.fieldX, y: target.fieldY }, throwStart = now + fieldingReleaseDelay();
  const receive = throwStart + defensiveThrowDuration(from, BASE_PATH[node]);
  const runnerArrival = state.flight.start + runningDuration(node - candidate.startNode, candidate.startNode, candidate.character);
  const out = receive < runnerArrival;
  const text = out ? (node === 1 ? "공이 먼저! 1루 아웃!" : `공이 먼저! ${BASE_PATH[node].label} 태그 아웃!`) : `주자가 먼저! ${BASE_PATH[node].label} 세이프!`;
  const leg = { node, from, throwStart, receive, throwPlayed: false };
  if (out) { candidate.out = true; candidate.outAt = receive; result.bases[node - 1] = false; if (state.outs === 2) result.runs = 0; }
  const finalAt = Math.max(receive, state.flight.start + playDuration(result.moves));
  return { result, finalAt, action: { kind: "hitRace", start: now, target, legs: [leg], stages: [{ at: receive, out, text, fired: false }] } };
}

function chooseThrowTarget(moves, target, now) {
  const candidates = moves.filter((move) => move.endNode > move.startNode && move.endNode < 4).map((move) => {
    const receive = now + fieldingReleaseDelay() + defensiveThrowDuration({ x: target.fieldX, y: target.fieldY }, BASE_PATH[move.endNode]);
    const arrival = state.flight.start + runningDuration(move.endNode - move.startNode, move.startNode, move.character);
    return { move, margin: receive - arrival };
  });
  const outCandidate = candidates.filter((candidate) => candidate.margin < 0).sort((a, b) => a.margin - b.margin)[0];
  return (outCandidate || candidates.sort((a, b) => b.move.endNode - a.move.endNode)[0]).move;
}

function runningDuration(distance, startNode = 0, character = state.character) {
  if (distance <= 0) return 0;
  const speedFactor = character === null ? 1 : characters[character].runnerSpeed;
  return pathLength(startNode, Math.min(4, startNode + distance)) / .25 * speedFactor / RUNNER_SPEED_MULTIPLIER;
}

function finishFlight() {
  if (state.phase !== "flight") return;
  const now = performance.now(); const { type, target, caught } = state.flight; state.phase = "resulting";
  if (type === "땅볼") {
    const race = buildGroundRace(now, target), duration = playDuration(race.result.moves), finalAt = Math.max(race.runnerArrival, race.action.secondReceive || race.action.firstReceive);
    state.runningPlay = { start: state.flight.start, duration, moves: race.result.moves, resultBases: race.result.bases, runs: race.result.runs, type: "땅볼", resultMessage: race.action.relay ? "병살 플레이가 끝났어요." : "땅볼 승부가 끝났어요.", committed: false };
    state.fieldAction = race.action; playEffectSound("glove"); setMessage(`${BASE_PATH[race.action.targetNode].label}에서 승부해요!`); tone(120, .16); continuePlay(finalAt - now + 850); return;
  }
  if (caught) {
    state.runningPlay = null; state.fieldAction = { kind: "catch", start: now, target }; state.outs += 1; setMessage(`${target.label}가 잡았어요! 플라이 아웃!`); showEffect("플라이 아웃!", "out"); playEffectSound("glove"); setTimeout(() => playEffectSound("out"), 120); updateHud(); continuePlay(1450); return;
  }
  const distance = hitDistance(type);
  if (type === "홈런") {
    const result = buildRunningPlay(state.bases, distance), duration = playDuration(result.moves);
    state.runningPlay = { start: state.flight.start, duration, moves: result.moves, resultBases: result.bases, runs: result.runs, type, committed: false };
    state.fieldAction = null; state.celebration = { start: now }; setMessage("홈런! 공이 외야 담장을 넘어갔어요!"); showEffect("홈런!", "homerun"); playEffectSound("homerun"); continuePlay(Math.max(0, state.flight.start + duration - now) + 450); return;
  }
  const race = buildHitRace(now, type, target), finalAt = race.finalAt;
  state.runningPlay = { start: state.flight.start, duration: playDuration(race.result.moves), moves: race.result.moves, resultBases: race.result.bases, runs: race.result.runs, type, resultMessage: race.action.stages[0].text, committed: false };
  state.runningPlay.resultMessage = race.action.stages[race.action.stages.length - 1].text;
  state.fieldAction = race.action; playEffectSound("glove"); setMessage(`${target.label}가 잡아 ${BASE_PATH[race.action.legs[0].node].label}로 송구해요!`); tone(620, .12); continuePlay(finalAt - now + 850);
}

function commitRunningPlay() {
  const play = state.runningPlay;
  if (!play || play.committed) return;
  const basesChanged = state.bases.some((base, index) => base !== play.resultBases[index]);
  play.committed = true; state.bases = play.resultBases;
  if (state.mode === "pitching") state.runsAllowed += play.runs; else state.score += play.runs;
  if (play.type === "홈런") state.homeRuns += 1;
  updateHud(); setMessage(play.resultMessage || (play.runs ? `${play.type}! ${play.runs}점 들어왔어요!` : `${play.type}! 주자가 베이스에 도착했어요!`));
  if (basesChanged || play.runs) { showEffect(play.runs ? `${play.runs}점!` : "주자 이동!", "runner"); playSound("runner"); }
}

function continuePlay(delay) {
  const token = state.token, scheduledAt = performance.now();
  const next = () => {
    if (token !== state.token || state.screen !== "game") return;
    updatePlayEvents(performance.now()); commitRunningPlay();
    if (state.mode === "pitching") { if (state.outs >= 3) endGame(true); else nextPitch(); return; }
    if (state.score >= levels[state.level].target) endGame(true); else if (state.outs >= 3) endGame(false); else nextPitch();
  };
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
  const pitching = state.mode === "pitching";
  $("resultCopy").textContent = pitching ? `3아웃을 잡았어요. 실점은 ${state.runsAllowed}점이에요.` : won ? `${levels[state.level].target}점 목표를 달성했어요.` : "아웃 3번이 되었어요. 다음에는 더 늦게 눌러 보세요.";
  $("resultScoreLabel").textContent = pitching ? "실점" : "점수"; $("resultHomeRunsLabel").textContent = pitching ? "아웃" : "홈런";
  $("resultScore").textContent = pitching ? state.runsAllowed : state.score; $("resultHomeRuns").textContent = pitching ? state.outs : state.homeRuns;
  $("resultPrimary").textContent = won && state.level + 1 < levels.length ? "다음 경기  →" : "처음으로  →"; showScreen("result");
}

function updateHud() {
  const pitching = state.mode === "pitching";
  $("scoreboard").classList.toggle("pitching", pitching);
  $("scoreLabel").textContent = pitching ? "실점" : "내 점수"; $("targetLabel").textContent = pitching ? "목표" : "목표";
  $("scoreValue").textContent = pitching ? state.runsAllowed : state.score; $("targetValue").textContent = pitching ? "3아웃" : levels[state.level].target;
  $("strikeValue").textContent = `${state.strikes} / 3`; $("ballBoard").hidden = !pitching; $("ballValue").textContent = `${state.balls} / 4`; $("outValue").textContent = `${state.outs} / 3`;
  ["base1", "base2", "base3"].forEach((id, index) => $(id).classList.toggle("on", state.bases[index]));
}

function setMessage(message) { state.message = message; $("gameMessage").textContent = message; }

function playBackgroundMusic(levelIndex) {
  if (state.muted) return;
  if (backgroundLevel !== levelIndex) {
    backgroundMusic.pause(); backgroundMusic.src = BGM_TRACKS[levelIndex]; backgroundMusic.currentTime = 0; backgroundLevel = levelIndex;
  }
  backgroundMusic.play().catch(() => { /* autoplay can be blocked until a level card is clicked */ });
}

function stopBackgroundMusic() { backgroundMusic.pause(); backgroundMusic.currentTime = 0; backgroundLevel = null; }

function togglePause(paused) {
  if (paused === state.paused) return;
  if (paused) { state.paused = true; state.pauseStarted = performance.now(); backgroundMusic.pause(); setMessage("잠시 쉬는 중이에요."); }
  else {
    const elapsed = state.pauseStarted ? performance.now() - state.pauseStarted : 0;
    for (const timed of [state.pitch, state.flight, state.foul, state.action, state.fieldAction, state.runningPlay, state.celebration]) if (timed?.start) timed.start += elapsed;
    state.paused = false; state.pauseStarted = null; const action = state.resumeAction; state.resumeAction = null;
    playBackgroundMusic(state.level);
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
    safe: [[430, .07, 0], [650, .12, 75]], runner: [[420, .06, 0], [560, .07, 70], [720, .12, 145]],
    homerun: [[523, .1, 0], [659, .1, 110], [784, .12, 220], [1047, .28, 350]]
  };
  for (const [frequency, seconds, delay] of patterns[kind] || []) setTimeout(() => tone(frequency, seconds), delay);
}

function playEffectSound(kind) {
  if (state.muted || !SFX_TRACKS[kind]) return;
  const audio = new Audio(SFX_TRACKS[kind]); audio.volume = kind === "homerun" ? .55 : .46;
  audio.play().catch(() => { /* sound is optional */ });
}

function showEffect(text, kind) {
  const effect = $("playEffect"), wrap = $("gameWrap"), board = $("scoreboard"), token = ++state.effectToken;
  effect.className = "play-effect"; wrap.classList.remove("fx-out", "fx-runner"); board.classList.remove("fx-update"); void effect.offsetWidth;
  effect.textContent = text; effect.className = `play-effect ${kind} show`; wrap.classList.add(kind === "runner" || kind === "safe" || kind === "homerun" ? "fx-runner" : "fx-out"); board.classList.add("fx-update");
  setTimeout(() => { if (token !== state.effectToken) return; effect.className = "play-effect"; effect.textContent = ""; wrap.classList.remove("fx-out", "fx-runner"); board.classList.remove("fx-update"); }, 950);
}

function updatePlayEvents(now) {
  const action = state.fieldAction;
  if (!action || (action.kind !== "groundRace" && action.kind !== "hitRace")) return;
  if (action.kind === "groundRace") {
    if (!action.firstThrowPlayed && now >= action.firstThrowStart) { action.firstThrowPlayed = true; playEffectSound("throw"); }
    if (action.relay && !action.secondThrowPlayed && now >= action.secondThrowStart) { action.secondThrowPlayed = true; playEffectSound("throw"); }
  } else for (const leg of action.legs) if (!leg.throwPlayed && now >= leg.throwStart) { leg.throwPlayed = true; playEffectSound("throw"); }
  for (const stage of action.stages) {
    if (stage.fired || now < stage.at) continue;
    stage.fired = true;
    if (stage.out) state.outs = Math.min(3, state.outs + 1);
    setMessage(stage.text); updateHud(); showEffect(stage.text, stage.out ? "out" : "safe");
    if (stage.out) playEffectSound("out"); else if (stage === action.stages[action.stages.length - 1]) playEffectSound("safe");
  }
}

function draw() {
  const now = state.paused && state.pauseStarted ? state.pauseStarted : performance.now(); const level = levels[state.level] || levels[0];
  if (!state.paused) updatePlayEvents(now);
  if (state.mode === "pitching" && state.phase === "pitchReady") $("pitchNeedle").style.left = `${pitchGaugePosition(now)}%`;
  ctx.clearRect(0, 0, canvas.width, canvas.height); drawBackground(level); drawBases(); drawFielders(now); drawPitcher(now); drawBaseRunners(now);
  const flightProgress = state.phase === "flight" && state.flight ? Math.min(1, (now - state.flight.start) / state.flight.duration) : null;
  if (flightProgress !== null) { drawTrajectory(); drawFieldingAction(flightProgress); }
  else if (state.phase === "resulting" && state.fieldAction) drawFieldingResult(now);
  drawCatcher(); drawBatter(now); drawCelebration(now);
  if (state.phase === "pitching" && state.pitch) {
    const progress = Math.min(1, (now - state.pitch.start) / state.pitch.duration);
    const pitchX = fieldLayout.mound[0], pitchY = fieldLayout.mound[1] + 10;
    drawBall(pitchX + (CONTACT.x - pitchX) * progress + Math.sin(progress * Math.PI) * state.pitch.curve * 75, pitchY + (CONTACT.y - pitchY) * progress, 7 + progress * 5);
    if (progress >= 1 && !state.paused) { if (state.mode === "pitching") finishPitch(); else resolveStrike("조금 늦었어요"); }
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

function drawFrame(name, frame, x, y, maxWidth, maxHeight, flip = false, filter = "none") {
  const safeFrame = Math.max(0, Math.min(4, Math.floor(frame))); const image = images[`${name}-${safeFrame}`]; if (!image?.complete || !image.naturalWidth) return;
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight); const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
  ctx.save(); ctx.filter = filter; ctx.translate(x, 0); if (flip) ctx.scale(-1, 1); ctx.drawImage(image, -width / 2, y - height, width, height); ctx.restore();
}

function drawStandalone(name, x, y, maxWidth, maxHeight, flip = false) {
  const image = images[name]; if (!image?.complete || !image.naturalWidth) return;
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight); const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
  ctx.save(); ctx.translate(x, 0); if (flip) ctx.scale(-1, 1); ctx.drawImage(image, -width / 2, y - height, width, height); ctx.restore();
}

function drawOpponentFrame(frame, x, y, maxWidth, maxHeight, flip = false) {
  if (state.level >= 4) { drawStandalone("devilFielder", x, y, maxWidth, maxHeight, flip); return; }
  if (state.level >= 2) { drawStandalone("animalFielder", x, y, maxWidth, maxHeight, flip); return; }
  if (state.level === 1) { drawStandalone("redFielder", x, y, maxWidth, maxHeight, flip); return; }
  drawFrame("pitcher", frame, x, y, maxWidth, maxHeight, flip);
}

function drawPitcher(now) {
  let frame = 0;
  if (state.phase === "pitching" && state.pitch) {
    const progress = Math.min(1, (now - state.pitch.start) / state.pitch.duration); frame = progress < .3 ? 1 : progress < .82 ? 4 : 0;
  }
  const x = fieldLayout.mound[0], y = fieldLayout.mound[1] + 72;
  drawGroundShadow(x, y, 33, .18);
  if (state.mode === "pitching") drawFrame("pitcher", frame, x, y, 94, 112, false, state.character === 1 ? "hue-rotate(24deg)" : state.character === 2 ? "hue-rotate(55deg)" : "none");
  else drawOpponentFrame(frame, x, y, 78, 92);
}

function drawBatter(now) {
  if (state.runningPlay) return;
  if (state.mode === "pitching") { drawGroundShadow(264, 509, 48, .18); drawOpponentFrame(0, 264, 509, 116, 138, true); return; }
  const action = state.action; let frame = 0;
  if (action?.kind === "swing") { const elapsed = now - action.start; frame = elapsed < 110 ? 1 : action.outcome === "홈런" && elapsed > 420 ? 4 : action.outcome === "miss" ? 1 : 2; }
  drawGroundShadow(264, 509, 74, .22); drawFrame(characters[state.character].motion, frame, 264, 509, 218, 238);
}

function drawCatcher() {
  drawGroundShadow(112, 516, 50, .2);
  if (state.level >= 1) drawOpponentFrame(0, 112, 516, 110, 128); else drawFrame("catcher", 0, 112, 516, 132, 154);
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
    } else if (state.fieldAction.kind === "hitRace") {
      for (const leg of state.fieldAction.legs) { const receiver = { 1: 3, 2: 2, 3: 0 }[leg.node]; if (receiver !== undefined) active.add(receiver); }
    }
  }
  return active;
}

function drawFielders(now) {
  const active = activeFielderIndices();
  [...FIELDERS].sort((a, b) => a.y - b.y).forEach((fielder) => {
    const index = FIELDERS.indexOf(fielder); if (active.has(index)) return;
    drawGroundShadow(fielder.x, fielder.y, fielder.height * .3, .15); drawOpponentFrame(0, fielder.x, fielder.y, fielder.height * .72, fielder.height, index === 0 || index === 4);
  });
}

function drawBaseRunners(now) {
  if (!state.runningPlay) {
    state.bases.forEach((occupied, index) => {
      if (!occupied) return; const base = BASE_PATH[index + 1], height = index === 1 ? 54 : 64;
      drawGroundShadow(base.x, base.y - 5, height * .32, .16); drawStandalone("runnerStand", base.x, base.y - 5, height * .86, height, index === 2);
    }); return;
  }
  for (const move of state.runningPlay.moves) {
    if (move.outAt && now > move.outAt + 220) continue;
    const moveProgress = move.duration ? Math.min(1, (now - state.runningPlay.start) / move.duration) : 1;
    const elapsed = now - state.runningPlay.start, point = runningPoint(move, moveProgress), name = move.character === 2 ? "tori" : "runner", frame = runnerFrame(name, moveProgress, elapsed, move.endNode > move.startNode);
    const bob = frame === 3 ? 0 : Math.abs(Math.sin(elapsed / 115 * Math.PI)) * 3;
    drawGroundShadow(point.x, point.y, 27, .18); drawFrame(name, frame, point.x, point.y - bob, 70, 78, point.flip);
  }
}

function runnerFrame(name, progress, elapsed, moving) {
  if (!moving) return 0;
  if (progress >= .94) return 3;
  return name === "tori" ? 2 : 1;
}

function runningPoint(move, progress) {
  const span = move.endNode - move.startNode;
  if (span <= 0) { const point = BASE_PATH[move.startNode]; return { x: point.x, y: point.y, flip: false }; }
  const total = pathLength(move.startNode, move.endNode), travelled = Math.min(total - .001, progress * total); let covered = 0;
  for (let node = move.startNode; node < move.endNode; node += 1) {
    const from = BASE_PATH[node], to = BASE_PATH[node + 1], segment = Math.hypot(to.x - from.x, to.y - from.y);
    if (covered + segment > travelled || node + 1 === move.endNode) {
      const local = Math.max(0, Math.min(1, (travelled - covered) / segment));
      return { x: from.x + (to.x - from.x) * local, y: from.y + (to.y - from.y) * local, flip: to.x < from.x };
    }
    covered += segment;
  }
  return { x: BASE_PATH[move.endNode].x, y: BASE_PATH[move.endNode].y, flip: false };
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
  const start = CONTACT, target = state.flight.target, grounder = state.flight.type === "땅볼", homer = state.flight.type === "홈런";
  const control = { x: (start.x + target.ballX) / 2, y: grounder ? Math.max(target.ballY, start.y - 28) : homer ? Math.max(18, target.ballY - 92) : Math.min(start.y, target.ballY) - 115 }, inverse = 1 - progress;
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
  const start = CONTACT, target = state.flight.target, grounder = state.flight.type === "땅볼", homer = state.flight.type === "홈런";
  const control = { x: (start.x + target.ballX) / 2, y: grounder ? Math.max(target.ballY, start.y - 28) : homer ? Math.max(18, target.ballY - 92) : Math.min(start.y, target.ballY) - 115 };
  drawDashedPath(start, control, target, "rgba(255,247,136,.7)");
  if (!homer) {
    ctx.save(); ctx.fillStyle = "rgba(255,201,74,.3)"; ctx.strokeStyle = "rgba(242,106,61,.75)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(target.fieldX, target.fieldY, 24, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    drawTag(target.label, target.fieldX, target.fieldY - 18, "#10233f");
  } else drawTag("담장 밖!", target.ballX, target.ballY + 32, "#d34d2a");
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
  drawGroundShadow(x, y, 24, .18); drawOpponentFrame(progress < .72 ? 4 : 0, x, y, 62, 78, target.fieldX < home.x);
}

function drawFieldingResult(now) {
  const action = state.fieldAction, elapsed = now - action.start, target = action.target, fielder = FIELDERS[target.fielderIndex], at = { x: target.fieldX, y: target.fieldY };
  if (action.kind === "groundRace") {
    const firstBase = BASE_PATH[action.targetNode], firstGlove = { x: firstBase.x, y: firstBase.y - 42 };
    drawGroundShadow(at.x, at.y, 25, .18); drawOpponentFrame(now < action.firstThrowStart ? 0 : 4, at.x, at.y, 66, 82, target.fieldX < fielder.x);
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
  if (action.kind === "hitRace") {
    const firstLeg = action.legs[0];
    drawGroundShadow(at.x, at.y, 25, .18); drawOpponentFrame(now < firstLeg.throwStart ? 0 : 4, at.x, at.y, 66, 82, target.fieldX < fielder.x);
    if (now < firstLeg.throwStart) { drawReceiver(firstLeg.node); drawTag(`${target.label} 포구!`, at.x, at.y + 18, "#10233f"); return; }
    const leg = action.legs.find((item) => now < item.receive) || action.legs[action.legs.length - 1];
    const legIndex = action.legs.indexOf(leg), glove = { x: BASE_PATH[leg.node].x, y: BASE_PATH[leg.node].y - 42 };
    drawReceiver(leg.node);
    if (now >= leg.throwStart && now < leg.receive) {
      const from = legIndex === 0 ? { x: at.x, y: at.y - 52 } : leg.from;
      drawThrowBall(from, glove, (now - leg.throwStart) / (leg.receive - leg.throwStart));
      drawTag(`${BASE_PATH[leg.node].label}로 송구!`, (from.x + glove.x) / 2, (from.y + glove.y) / 2 - 24, "#10233f");
    }
    return;
  }
  if (action.kind === "catch") {
    drawGroundShadow(at.x, at.y, 25, .18); drawOpponentFrame(elapsed < 520 ? 0 : 4, at.x, at.y, 66, 82, target.fieldX < fielder.x); drawTag(elapsed < 520 ? "포구!" : "내야로 송구!", at.x, at.y + 18, "#10233f");
    if (elapsed > 520 && elapsed < 1050) drawThrowBall({ x: at.x, y: at.y - 52 }, { x: 480, y: 322 }, (elapsed - 520) / 530); return;
  }
}

function drawReceiver(node) {
  const base = BASE_PATH[node], x = base.x + (node === 1 ? -10 : node === 3 ? 10 : 0), y = base.y + 8;
  drawGroundShadow(x, y, 23, .17); drawOpponentFrame(4, x, y, 58, 74, node === 3);
}

function drawThrowBall(from, to, progress) {
  ctx.save(); ctx.strokeStyle = "rgba(255,255,255,.65)"; ctx.lineWidth = 2; ctx.setLineDash([7, 9]); ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke(); ctx.restore();
  drawBall(from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress - Math.sin(progress * Math.PI) * 34, 7);
}

function drawCelebration(now) {
  if (!state.celebration) return;
  const elapsed = now - state.celebration.start;
  if (elapsed > 2600) { state.celebration = null; return; }
  const colors = ["#ffc94a", "#f26a3d", "#45b77a", "#55aee8", "#ffffff", "#e06bc3"];
  ctx.save();
  for (let index = 0; index < 72; index += 1) {
    const delay = index % 9 * 55, time = Math.max(0, elapsed - delay) / 1000;
    if (!time) continue;
    const speed = 95 + index % 7 * 18, x = (index * 137 + Math.sin(time * 2 + index) * 34) % canvas.width, y = -18 + speed * time;
    if (y > canvas.height + 20) continue;
    ctx.translate(x, y); ctx.rotate(time * (2 + index % 5)); ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(-5, -3, 10, 6); ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.restore();
}

document.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.screen)));
function chooseMode(mode) { state.mode = mode; tone(440, .08); showScreen("character"); }
$("startButton").addEventListener("click", () => chooseMode("batting"));
$("pitcherStart").addEventListener("click", () => chooseMode("pitching"));
$("characterNext").addEventListener("click", () => { tone(440, .08); showScreen("level"); });
$("swingButton").addEventListener("click", swing); canvas.addEventListener("click", swing);
$("pauseButton").addEventListener("click", () => togglePause(true)); $("closePause").addEventListener("click", () => togglePause(false)); $("resumeButton").addEventListener("click", () => togglePause(false));
$("quitButton").addEventListener("click", () => { state.token += 1; state.phase = "idle"; togglePause(false); showScreen("level"); });
$("resultRetry").addEventListener("click", () => startGame(state.level));
$("resultPrimary").addEventListener("click", () => state.level + 1 < levels.length && state.level + 1 < state.unlocked ? startGame(state.level + 1) : showScreen("home"));
$("soundToggle").addEventListener("click", () => { state.muted = !state.muted; if (state.muted) backgroundMusic.pause(); else if (state.screen === "game" && !state.paused) playBackgroundMusic(state.level); $("soundToggle").textContent = state.muted ? "🔇" : "🔊"; $("soundToggle").setAttribute("aria-label", state.muted ? "소리 켜기" : "소리 끄기"); });
document.addEventListener("keydown", (event) => { if ((event.code === "Space" || event.code === "Enter") && state.screen === "game") { event.preventDefault(); swing(); } if (event.code === "Escape" && state.screen === "game") togglePause(!state.paused); });

function runSelfCheck() {
  let result = buildRunningPlay([true, true, true], 1); console.assert(result.runs === 1 && result.bases.every(Boolean), "만루 단타는 1점과 만루를 유지해야 합니다.");
  result = buildRunningPlay([true, false, true], 2); console.assert(result.runs === 1 && result.bases[1] && result.bases[2], "1·3루 2루타는 1점, 2·3루 주자여야 합니다.");
  result = buildRunningPlay([false, false, false], 4); console.assert(result.runs === 1 && result.bases.every((base) => !base), "주자 없는 홈런은 1점이어야 합니다.");
  result = buildGroundResult([false, false, false], 1, true, true, 0); console.assert(result.bases.every((base) => !base) && result.moves[0].out, "1루 송구가 빠르면 타자주자는 아웃이어야 합니다.");
  result = buildGroundResult([true, false, false], 2, true, true, 0); console.assert(result.bases.every((base) => !base) && result.moves.filter((move) => move.out).length === 2, "2루 포스아웃 뒤 1루 송구가 빠르면 병살이어야 합니다.");
  result = buildGroundResult([true, true, false], 3, true, false, 0); console.assert(result.bases[0] && result.bases[1] && !result.bases[2], "3루 포스아웃 뒤 타자와 1루 주자는 살아야 합니다.");
  result = buildGroundResult([true, true, true], 4, false, false, 0); console.assert(result.runs === 1 && result.bases.every(Boolean), "만루에서 홈 세이프면 1점과 만루가 유지되어야 합니다.");
  console.assert(runnerFrame("runner", .5, 520, true) === 1 && runnerFrame("runner", .95, 900, true) === 3, "달리는 중에는 배트 없는 러닝 프레임, 마지막에만 슬라이딩 프레임이어야 합니다.");
  const savedFlight = state.flight; state.flight = { start: 0 };
  const directTarget = chooseThrowTarget([{ startNode: 1, endNode: 2, character: null }], { fieldX: 705, fieldY: 212 }, 2000);
  state.flight = savedFlight;
  console.assert(directTarget.endNode === 2, "1루 주자가 이미 2루로 향했으면 외야수는 2루에 직접 송구해야 합니다.");
  console.assert(fieldingReleaseDelay(0) === 260 && fieldingReleaseDelay(5) === 170, "외야수는 포구 뒤 짧은 동작만 하고 곧바로 판단한 베이스에 송구해야 합니다.");
  result = buildRunningPlay([false, false, false], 1); console.assert(result.bases[0] && !result.bases[1] && !result.bases[2], "일반 단타의 타자주자는 1루에서 멈춰야 합니다.");
  console.assert(flightDuration("단타", true) === 1833 && flightDuration("단타", false) === 673, "타구 체공 시간은 세이프·아웃 난이도에 맞아야 합니다.");
  console.assert(RUNNER_SPEED_MULTIPLIER === 1.05, "주자 속도 보정값이 맞아야 합니다.");
  console.assert(levels.map((level) => level.successChance * 10).join(",") === "9,8,7,6,5,4", "타구 성공 목표는 레벨마다 열 번 중 9~4번이어야 합니다.");
  console.assert(battedBallSucceeded(0, () => .89) && !battedBallSucceeded(5, () => .41), "레벨별 타구 성공 판정이 맞아야 합니다.");
  console.assert(BGM_TRACKS.length === levels.length && BGM_TRACKS.every((track) => track.endsWith(".mp3")), "각 레벨에는 한 개의 배경음이 배정되어야 합니다.");
  console.assert(Object.keys(SFX_TRACKS).length === 6 && Object.values(SFX_TRACKS).every((track) => track.endsWith(".mp3")), "여섯 가지 플레이 효과음이 있어야 합니다.");
  console.assert(images["minjun-glasses-0"].src.endsWith("minjun-glasses-0.png"), "정우 안경 동작 이미지가 있어야 합니다.");
  const homeRunTarget = chooseFlightTarget("홈런"); console.assert(homeRunTarget.ballY < fieldLayout.fenceY, "홈런 종점은 외야 펜스 너머여야 합니다.");
  console.assert(levels.length === 6, "여섯 레벨이 있어야 합니다.");
}

loadProgress(); renderCharacters(); renderLevels(); runSelfCheck(); updateHud(); requestAnimationFrame(draw);
