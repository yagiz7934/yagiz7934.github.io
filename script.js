/* =========================
   Minimal • Applevari deneyim — Hearts Edition
   ========================= */

// ——— Kişiselleştirme
const herName = "Betül";          // sevgilinin adı
const firstDayISO = "2025-03-17"; // tanıştığınız/başlangıç tarihi (YYYY-MM-DD)

document.getElementById("herName").textContent = herName;

// ——— Tarih bilgileri
const today = new Date();
const todayStr = today.toLocaleDateString("tr-TR", { day:"2-digit", month:"long", year:"numeric" });
document.getElementById("todayStr").textContent = todayStr;
document.getElementById("yearNow").textContent = today.getFullYear();
document.getElementById("todayTime").textContent = todayStr;

// ——— Birlikte gün sayacı
(function calcDays(){
  if(!firstDayISO) return;
  const first = new Date(firstDayISO);
  const diff = Math.round((today - first) / (1000*60*60*24));
  document.getElementById("daysTogether").textContent = diff.toLocaleString("tr-TR");
})();

// ——— Intersection Observer: reveal
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    }
  });
},{threshold:0.15});

document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

// ——— Prefers-reduced-motion
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ——— Müzik kontrolü (kullanıcı eylemi ile oynatma)
const music = document.getElementById("bgm");
const musicToggle = document.getElementById("musicToggle");
let musicOn = false;

musicToggle.addEventListener("click", async ()=>{
  try{
    if(!musicOn){ await music.play(); musicOn = true; musicToggle.setAttribute("aria-pressed","true"); }
    else{ music.pause(); music.currentTime = 0; musicOn = false; musicToggle.setAttribute("aria-pressed","false"); }
  }catch(e){
    console.warn("Müzik başlatılamadı:", e);
  }
});

/* ————————————————————————————————
   Konfeti yerine: yavaşça süzülen kalpler
   — Ultra hafif parçacık sistemi (canvas)
———————————————————————————————— */
const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d",{ alpha:true });
let W,H; function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
window.addEventListener("resize", resize, {passive:true}); resize();

const HEART_COLORS = ["#ff2d55","#ff375f","#ff6b81","#ff9fb2","#ffd1dc"];
const hearts = [];
let targetCount = 60;          // ekranda aynı anda bulunacak kalp sayısı (yaklaşık)
let heartTimer = 0;
let rafId = null;

// Kalp çizimi (bezier curve)
function drawHeartPath(ctx, s){
  ctx.beginPath();
  ctx.moveTo(0, -s*0.25);
  ctx.bezierCurveTo(s*0.5, -s,  s*1.4, -s*0.1,  0,  s);
  ctx.bezierCurveTo(-s*1.4, -s*0.1, -s*0.5, -s,  0, -s*0.25);
  ctx.closePath();
}

function spawnHeart(x = Math.random()*W, size = 10 + Math.random()*18){
  const swayAmp = 10 + Math.random()*26;   // yatay salınım genliği
  hearts.push({
    x,
    y: -30,
    size,
    color: HEART_COLORS[(Math.random()*HEART_COLORS.length)|0],
    alpha: 0.8 + Math.random()*0.2,
    vy: 0.35 + Math.random()*0.6,          // düşüş hızı
    swayAmp,
    swayFreq: 0.0025 + Math.random()*0.0025,
    phase: Math.random()*Math.PI*2,
    rot: Math.random()*Math.PI,
    vr: (Math.random()-.5)*0.01
  });
}

function tick(){
  ctx.clearRect(0,0,W,H);

  // yeni kalpler ekle
  if(hearts.length < targetCount && heartTimer <= 0){
    spawnHeart();
    heartTimer = 4; // her 4 ms adımda yaklaşık bir kalp; animasyon hızına göre dengeli
  }
  heartTimer--;

  for(let i=hearts.length-1;i>=0;i--){
    const h = hearts[i];
    h.phase += h.swayFreq * 16;
    h.x += Math.sin(h.phase) * 0.6;
    h.y += h.vy * 2;
    h.rot += h.vr;

    // çiz
    ctx.save();
    ctx.translate(h.x + Math.sin(h.phase)*h.swayAmp*0.06, h.y);
    ctx.rotate(h.rot);
    ctx.globalAlpha = h.alpha;
    ctx.fillStyle = h.color;
    drawHeartPath(ctx, h.size);
    ctx.fill();
    ctx.restore();

    if(h.y - h.size > H + 40) hearts.splice(i,1);
  }

  rafId = requestAnimationFrame(tick);
}

function startHearts(){
  if(reduceMotion) return; // hareketi azalt tercihi
  if(rafId) cancelAnimationFrame(rafId);
  // Başlangıçta birkaç kalp oluştur
  for(let i=0;i<30;i++) spawnHeart(Math.random()*W, 8 + Math.random()*16);
  tick();
}

function boostHearts(durationMs = 4000, extra = 80){
  // kısa bir süre için yoğunluğu artır
  const original = targetCount;
  targetCount = original + extra;
  setTimeout(()=>{ targetCount = original; }, durationMs);
}

// ——— Buton davranışı: "Kutla" kalp yoğunluğunu artırır
document.getElementById("confettiBtn").addEventListener("click", ()=>boostHearts());
document.getElementById("finalConfetti").addEventListener("click", ()=>boostHearts(6000, 140));

// Başlat
startHearts();

// ——— Küçük mikro-animasyon: hero gradient parallax
if(!reduceMotion){
  const hero = document.querySelector(".hero-gradient");
  window.addEventListener("scroll", ()=>{
    const y = window.scrollY || 0;
    hero.style.transform = `translateY(${y * -0.06}px)`;
  },{passive:true});
}

// ——— Galeriye klasörden yeni görsel ekleme kolaylığı için hata yakalama
document.querySelectorAll("#masonry img").forEach(img=>{
  img.addEventListener("error", ()=>{ img.style.display="none"; });
});
