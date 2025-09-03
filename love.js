function heartPoint(t) {
  // معادلة قلب كلاسيكية (مقاسة بوحدات افتراضية)
  // x = 16 sin^3 t
  // y = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t
  const sin = Math.sin(t);
  const cos = Math.cos(t);
  const x = 16 * Math.pow(sin, 3);
  const y =
    13 * cos - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const W = canvas.width,
  H = canvas.height;

let animRunning = true;

function drawHeartAsLines(segments = 600, animate = true) {
  // احسب نقاط القلب
  const pts = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const p = heartPoint(t);
    pts.push(p);
  }

  // وجد حدود النقاط لتحجيمها على الـ canvas
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

  // نحول النقاط (scale & translate)
  const padding = 40;
  const scaleX = (W - padding * 2) / (maxx - minx);
  const scaleY = (H - padding * 2) / (maxy - miny);
  // نأخذ أصغر مقياس للحفاظ على النسبة
  const scale = Math.min(scaleX, scaleY);
  const offsetX = W / 2;
  const offsetY = H / 2 + 20; // رفع بسيط لتمركز أفضل

  const screen = pts.map((p) => ({
    x: offsetX + p.x * scale,
    y: offsetY - p.y * scale, // نطرح لأن محاور canvas y متجهة لأسفل
  }));

  // نجهّز الخلفية الشبه شفافه لإعادة الرسم
  ctx.clearRect(0, 0, W, H);

  // إعدادات الخط
  ctx.lineCap = "round";

  // نرسم متسلسلًا — خطوط قصيرة بين النقاط
  if (!animate) {
    // رسم مباشر (بلا أنيميشن)
    for (let i = 0; i < screen.length; i++) {
      const a = screen[i];
      const b = screen[(i + 1) % screen.length];
      drawSegment(a, b, i, screen.length);
    }
    return;
  }

  // رسم متحرك باستخدام requestAnimationFrame
  let i = 0;
  function step() {
    if (!animRunning) return; // إذا أوقف المستخدم الحركة
    if (i >= screen.length) {
      celebrate(); // 🎉 تشغيل الاحتفال بعد اكتمال القلب
      return;
    }
    const a = screen[i];
    const b = screen[(i + 1) % screen.length];
    drawSegment(a, b, i, screen.length);
    i++;
    // يمكنك تغيير السرعة بتعديل هذه القيمة
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // دالة ترسم مقطع خط واحد مع تدرّج لوني
  function drawSegment(a, b, index, total) {
    // نحدد سمك الخط (يمكن تدرجه)
    const minW = 1.0,
      maxW = 3.8;
    const width =
      minW +
      (maxW - minW) * (0.5 + 0.5 * Math.sin((index / total) * Math.PI * 4)); // تغيّر طفيف
    ctx.lineWidth = width;

    // نركّب تدرّج لوني على طول مؤشّر index
    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    // ألوان متدرّجة أحمر فاتح -> أحمر غامق
    const t = index / total;
    grad.addColorStop(0, `rgba(255,77,77,${0.95})`);
    grad.addColorStop(0.5, `rgba(224,36,36,${0.95})`);
    grad.addColorStop(1, `rgba(179,0,0,${0.95})`);
    ctx.strokeStyle = grad;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

// عناصر التحكم
const segInput = document.getElementById("segments");
const restartBtn = document.getElementById("restart");
const toggleBtn = document.getElementById("toggleAnim");

function start() {
  animRunning = true;
  ctx.clearRect(0, 0, W, H);
  drawHeartAsLines(parseInt(segInput.value, 10), true);
}
start();

restartBtn.addEventListener("click", () => {
  animRunning = false;
  // بقلب لحظة صغيرة ثم نبدأ
  setTimeout(() => start(), 60);
});

toggleBtn.addEventListener("click", () => {
  animRunning = !animRunning;
  if (animRunning) {
    // إعادة تشغيل الرسم (بسيط)
    ctx.clearRect(0, 0, W, H);
    drawHeartAsLines(parseInt(segInput.value, 10), true);
  }
});

// إعادة رسم فور تغيير الكثافة
segInput.addEventListener("change", () => {
  animRunning = false;
  setTimeout(() => start(), 60);
});
function celebrate() {
  const confetti = [];
  const colors = ["#ff4d4d", "#ffd633", "#66ff66", "#3399ff", "#ff66cc"];

  // إنشاء قصاصات ورق عشوائية
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
    // إعادة رسم القلب حتى لا يختفي خلف الكونفيتي
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

      // إذا خرج من الشاشة يرجع للأعلى
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });

    requestAnimationFrame(drawConfetti);
  }

  drawConfetti();
}
