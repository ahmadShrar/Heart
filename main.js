const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const W = canvas.width,
  H = canvas.height;

let animRunning = true;

const yesBtn = document.querySelector(".yes");
const noBtn = document.querySelector(".no");
const loveBtns = document.querySelector(".love-buttons");
const controls = document.querySelector(".controls");

const loveImg = document.getElementById("loveImg");
const sadImg = document.getElementById("sadImg");

const segInput = document.getElementById("segments");
const restartBtn = document.getElementById("restart");
const toggleBtn = document.getElementById("toggleAnim");

const ha = document.getElementById("Ha");

// معادلة القلب
function heartPoint(t) {
  const sin = Math.sin(t),
    cos = Math.cos(t);
  const x = 16 * Math.pow(sin, 3);
  const y =
    13 * cos - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

// رسم القلب
function drawHeartAsLines(segments = 600, animate = true) {
  const pts = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push(heartPoint(t));
  }

  // تحويل إحداثيات الشاشة
  let minx = Infinity,
    maxx = -Infinity,
    miny = Infinity,
    maxy = -Infinity;
  pts.forEach((p) => {
    if (p.x < minx) minx = p.x;
    if (p.x > maxx) maxx = p.x;
    if (p.y < miny) miny = p.y;
    if (p.y > maxy) maxy = p.y;
  });

  const padding = 40;
  const scale = Math.min(
    (W - 2 * padding) / (maxx - minx),
    (H - 2 * padding) / (maxy - miny)
  );
  const offsetX = W / 2,
    offsetY = H / 2 + 20;

  const screen = pts.map((p) => ({
    x: offsetX + p.x * scale,
    y: offsetY - p.y * scale,
  }));

  ctx.clearRect(0, 0, W, H);

  if (!animate) {
    for (let i = 0; i < screen.length; i++) {
      drawSegment(screen[i], screen[(i + 1) % screen.length], i, screen.length);
    }
    return;
  }

  let i = 0;
  function step() {
    if (!animRunning) return;
    if (i >= screen.length) {
      celebrate();
      showLoveImage(screen);
      drawArrowsAndLetters(screen);

      // تشغيل الأغنية
      const song = document.getElementById("loveSong");
      song.play().catch((e) => {
        console.warn("Autoplay prevented:", e);
      });

      return;
    }
    drawSegment(screen[i], screen[(i + 1) % screen.length], i, screen.length);
    i++;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  function drawSegment(a, b, index, total) {
    const minW = 1.0,
      maxW = 3.8;
    ctx.lineWidth =
      minW +
      (maxW - minW) * (0.5 + 0.5 * Math.sin((index / total) * Math.PI * 4));
    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    grad.addColorStop(0, "rgba(255,77,77,0.95)");
    grad.addColorStop(0.5, "rgba(224,36,36,0.95)");
    grad.addColorStop(1, "rgba(179,0,0,0.95)");
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

// عرض صورة الحب
function showLoveImage(points) {
  loveImg.style.width = "320px";
  loveImg.classList.add("show");
}

// رسم الأسهم والحروف
function drawArrowsAndLetters(points) {
  let centerX = 0,
    centerY = 0;
  points.forEach((p) => {
    centerX += p.x;
    centerY += p.y;
  });
  centerX /= points.length;
  centerY /= points.length;

  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(centerX + 100, centerY - 120);
  ctx.quadraticCurveTo(centerX + 30, centerY, centerX + 50, centerY + 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + 50, centerY + 10);
  ctx.lineTo(centerX + 40, centerY);
  ctx.lineTo(centerX + 60, centerY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX - 100, centerY - 120);
  ctx.quadraticCurveTo(centerX - 30, centerY, centerX - 50, centerY + 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - 50, centerY + 10);
  ctx.lineTo(centerX - 60, centerY);
  ctx.lineTo(centerX - 40, centerY);
  ctx.closePath();
  ctx.fill();

  ctx.font = "bold 32px sans-serif";
  ctx.fillText("A", centerX + 105, centerY - 120);
  ctx.fillText("R", centerX - 130, centerY - 120);
}

// confetti
function celebrate() {
  const confetti = [];
  const colors = ["#ff4d4d", "#ffd633", "#66ff66", "#3399ff", "#ff66cc"];
  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 6,
      h: 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 3,
      angle: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    });
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, W, H);
    drawHeartAsLines(parseInt(segInput.value, 10), false);
    confetti.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.y += p.speed;
      p.angle += p.rotationSpeed;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(drawConfetti);
  }
  drawConfetti();
}

// التحكم
function start() {
  animRunning = true;
  ctx.clearRect(0, 0, W, H);
  drawHeartAsLines(parseInt(segInput.value, 10), true);
}

restartBtn.addEventListener("click", () => {
  animRunning = false;
  setTimeout(() => start(), 60);
});

toggleBtn.addEventListener("click", () => {
  animRunning = !animRunning;
  if (animRunning) {
    ctx.clearRect(0, 0, W, H);
    drawHeartAsLines(parseInt(segInput.value, 10), true);
  }
});

segInput.addEventListener("change", () => {
  animRunning = false;
  setTimeout(() => start(), 60);
});

// أزرار الحب
yesBtn.addEventListener("click", () => {
  loveBtns.style.display = "none";
  controls.style.display = "flex";
  sadImg.style.display = "none";
  start();
});

noBtn.addEventListener("click", () => {
  loveBtns.style.display = "none";
  controls.style.display = "none";
  ctx.clearRect(0, 0, W, H);
  sadImg.classList.add("show");
  ha.style.display = "none";
});
