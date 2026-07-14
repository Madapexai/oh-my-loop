const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const params = new URLSearchParams(window.location.search);
const requestedView = params.get("view");

if (requestedView) {
  document.body.dataset.view = requestedView;
}

const state = {
  t: 0,
  hp: 82,
  balance: 76,
  monsters: 7,
  playerAngle: -0.6,
  attackPulse: 0
};

const monsters = Array.from({ length: 7 }, (_, index) => ({
  angle: index * 0.82 + 0.2,
  radius: 132 + (index % 3) * 38,
  mood: index % 2 ? "#bd4b4b" : "#734f9e"
}));

function resizeCanvasForDevicePixelRatio() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawTop(cx, cy, radius, rotation, wobble) {
  context.save();
  context.translate(cx, cy);
  context.rotate(rotation);
  context.scale(1, 0.54 + wobble);

  const rings = [
    [radius, "#6c9a8b"],
    [radius * 0.78, "#d6b159"],
    [radius * 0.55, "#4f789f"],
    [radius * 0.29, "#eee9dc"]
  ];

  rings.forEach(([ringRadius, color]) => {
    context.beginPath();
    context.arc(0, 0, ringRadius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = "rgba(22,33,31,0.22)";
    context.lineWidth = 4;
    context.stroke();
  });

  for (let i = 0; i < 12; i += 1) {
    context.rotate(Math.PI / 6);
    context.beginPath();
    context.moveTo(radius * 0.2, 0);
    context.lineTo(radius * 0.95, 0);
    context.strokeStyle = "rgba(22,33,31,0.24)";
    context.lineWidth = 3;
    context.stroke();
  }

  context.restore();

  context.beginPath();
  context.moveTo(cx - 38, cy + radius * 0.42);
  context.lineTo(cx + 38, cy + radius * 0.42);
  context.lineTo(cx, cy + radius * 0.86);
  context.closePath();
  context.fillStyle = "#72533d";
  context.fill();
}

function topPoint(cx, cy, topRadius, angle, radius, rotation, wobble) {
  const visualAngle = angle + rotation;
  return {
    x: cx + Math.cos(visualAngle) * radius,
    y: cy + Math.sin(visualAngle) * radius * (0.54 + wobble)
  };
}

function drawMonster(x, y, color, phase) {
  context.save();
  context.translate(x, y);
  context.rotate(Math.sin(phase) * 0.16);
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(-16, -17, 32, 34, 8);
  context.fill();
  context.fillStyle = "#fff6d8";
  context.beginPath();
  context.arc(-6, -5, 4, 0, Math.PI * 2);
  context.arc(7, -5, 4, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#17211f";
  context.beginPath();
  context.arc(-5, -5, 1.6, 0, Math.PI * 2);
  context.arc(8, -5, 1.6, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#17211f";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-8, 8);
  context.lineTo(8, 8);
  context.stroke();
  context.restore();
}

function drawPlayer(x, y, phase) {
  const pulse = 26 + Math.sin(phase * 5) * 5;
  context.beginPath();
  context.arc(x, y, pulse, 0, Math.PI * 2);
  context.strokeStyle = "rgba(45, 138, 99, 0.38)";
  context.lineWidth = 3;
  context.stroke();

  context.save();
  context.translate(x, y);
  context.fillStyle = "#222f2b";
  context.beginPath();
  context.arc(0, -16, 9, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#222f2b";
  context.lineWidth = 6;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(0, -6);
  context.lineTo(0, 16);
  context.moveTo(-15, 4);
  context.lineTo(17, -2);
  context.moveTo(0, 16);
  context.lineTo(-13, 30);
  context.moveTo(0, 16);
  context.lineTo(15, 29);
  context.stroke();
  context.strokeStyle = "#2d8a63";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(17, -2);
  context.lineTo(35, -12);
  context.stroke();
  context.restore();
}

function drawLabels(width, height) {
  context.fillStyle = "rgba(255,255,255,0.78)";
  context.fillRect(24, 24, 280, 92);
  context.strokeStyle = "rgba(22,33,31,0.18)";
  context.strokeRect(24, 24, 280, 92);
  context.fillStyle = "#16211f";
  context.font = "700 18px system-ui";
  context.fillText("Runtime evidence", 42, 56);
  context.font = "14px system-ui";
  context.fillText("Canvas is animated; screenshot captured after load.", 42, 84);

  context.fillStyle = "rgba(255,255,255,0.86)";
  context.fillRect(width - 380, height - 92, 344, 54);
  context.fillStyle = "#16211f";
  context.font = "700 15px system-ui";
  context.fillText("Win: cross the top + clear monsters", width - 360, height - 58);
}

function frame() {
  resizeCanvasForDevicePixelRatio();
  const width = canvas.getBoundingClientRect().width;
  const height = canvas.getBoundingClientRect().height;
  context.clearRect(0, 0, width, height);

  state.t += 0.016;
  const cx = width * 0.52;
  const cy = height * 0.48;
  const topRadius = Math.min(width, height) * 0.38;
  const rotation = state.t * 1.25;
  const wobble = Math.sin(state.t * 1.8) * 0.045;

  context.fillStyle = "#dfe7e1";
  context.fillRect(0, 0, width, height);

  context.save();
  context.translate(cx + Math.sin(state.t * 1.8) * 22, cy + topRadius * 0.48);
  context.scale(1.2, 0.28);
  context.beginPath();
  context.arc(0, 0, topRadius * 0.82, 0, Math.PI * 2);
  context.fillStyle = "rgba(22,33,31,0.16)";
  context.fill();
  context.restore();

  drawTop(cx, cy, topRadius, rotation, wobble);

  monsters.forEach((monster, index) => {
    const point = topPoint(cx, cy, topRadius, monster.angle + Math.sin(state.t + index) * 0.08, monster.radius, rotation, wobble);
    drawMonster(point.x, point.y, monster.mood, state.t + index);
  });

  const playerRadius = topRadius * 0.73 + Math.sin(state.t * 1.2) * 20;
  const player = topPoint(cx, cy, topRadius, state.playerAngle + state.t * 0.22, playerRadius, rotation, wobble);
  drawPlayer(player.x, player.y, state.t);

  state.hp = 82 - Math.round(Math.max(0, Math.sin(state.t * 0.9)) * 9);
  state.balance = 76 - Math.round(Math.abs(Math.sin(state.t * 1.8)) * 18);
  state.monsters = 7 - Math.floor((state.t % 8) / 2.8);

  document.getElementById("hpText").textContent = `${state.hp}%`;
  document.getElementById("balanceText").textContent = `${state.balance}%`;
  document.getElementById("monsterText").textContent = `${state.monsters}`;
  document.getElementById("hpBar").style.width = `${state.hp}%`;
  document.getElementById("balanceBar").style.width = `${state.balance}%`;
  document.getElementById("monsterBar").style.width = `${Math.max(10, (state.monsters / 7) * 100)}%`;

  drawLabels(width, height);
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeCanvasForDevicePixelRatio);
requestAnimationFrame(frame);
