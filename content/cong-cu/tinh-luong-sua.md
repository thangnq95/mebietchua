---
title: "Tính lượng sữa cho bé"
description: "Nhập tuổi và cân nặng của bé để biết bé cần bao nhiêu ml sữa mỗi cữ và bao nhiêu cữ mỗi ngày — áp dụng cho sữa mẹ và sữa công thức."
tags: ["cong-cu", "sua-me", "sua-cong-thuc", "cho-be-bu"]
---

<div id="milk-app">
<style>
#milk-app{font-family:inherit;max-width:680px;margin:0 auto}
.mk-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1.5rem;margin-bottom:1rem}
.mk-label{font-size:.8rem;font-weight:600;color:#374151;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em;display:block}
.mk-input{width:100%;padding:.6rem .8rem;border:1.5px solid #d1d5db;border-radius:8px;font-size:1rem;box-sizing:border-box;outline:none;transition:border .15s}
.mk-input:focus{border-color:#0ea5e9}
.mk-btn{width:100%;padding:.75rem;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:12px}
.mk-btn:hover{opacity:.9}
.result-hidden{display:none}
.mk-big{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:1rem}
.mk-stat{background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:.9rem;text-align:center}
.mk-val{font-size:1.5rem;font-weight:700;color:#0369a1;margin:0}
.mk-unit{font-size:.75rem;color:#6b7280;margin:3px 0 0}
.mk-schedule{margin-top:1rem}
.mk-slot{display:flex;align-items:center;gap:10px;padding:.55rem .75rem;border-radius:6px;margin-bottom:4px;font-size:.875rem;background:#f9fafb;border:1px solid #f3f4f6}
.mk-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.radio-group{display:flex;gap:16px;flex-wrap:wrap}
.radio-opt{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.9rem}
.radio-opt input{accent-color:#0ea5e9;width:16px;height:16px}
.mk-tip{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.75rem 1rem;font-size:.875rem;color:#166534;margin-top:.75rem}
.slider-wrap{display:flex;align-items:center;gap:10px}
.slider-wrap input[type=range]{flex:1;accent-color:#0ea5e9}
.slider-val{font-size:1rem;font-weight:600;color:#0369a1;min-width:50px;text-align:right}
</style>

<div class="mk-card">
  <h2 style="margin:0 0 1rem;font-size:1.1rem;color:#111">Thông tin bé</h2>

  <div style="margin-bottom:1rem">
    <label class="mk-label">Loại sữa</label>
    <div class="radio-group">
      <label class="radio-opt"><input type="radio" name="milktype" value="breast" checked> Sữa mẹ</label>
      <label class="radio-opt"><input type="radio" name="milktype" value="formula"> Sữa công thức</label>
      <label class="radio-opt"><input type="radio" name="milktype" value="mixed"> Kết hợp</label>
    </div>
  </div>

  <div style="margin-bottom:1rem">
    <label class="mk-label">Tuổi bé: <span id="age-display">3 tháng</span></label>
    <div class="slider-wrap">
      <input type="range" min="0" max="12" value="3" id="age-slider" oninput="updateAge(this.value)">
      <span class="slider-val" id="age-val">3th</span>
    </div>
  </div>

  <div style="margin-bottom:1rem">
    <label class="mk-label">Cân nặng bé (kg)</label>
    <input class="mk-input" type="number" step="0.1" id="baby-weight" placeholder="VD: 5.5" />
  </div>

  <button class="mk-btn" onclick="calcMilk()">Tính lượng sữa</button>
</div>

<div id="milk-result" class="result-hidden">
<div class="mk-card">
  <div class="mk-big" id="mk-stats"></div>

  <div id="mk-note" style="font-size:.875rem;color:#374151;margin-bottom:.75rem"></div>

  <h3 style="font-size:.9rem;color:#111;margin:0 0 .5rem">Gợi ý lịch cho bú trong ngày</h3>
  <div class="mk-schedule" id="mk-schedule"></div>

  <div class="mk-tip" id="mk-tip"></div>
</div>
</div>
</div>

<script>
function updateAge(v) {
  document.getElementById('age-val').textContent = v + 'th';
  document.getElementById('age-display').textContent = v + ' tháng';
}

function calcMilk() {
  const age = parseInt(document.getElementById('age-slider').value);
  const weight = parseFloat(document.getElementById('baby-weight').value);
  const type = document.querySelector('input[name="milktype"]:checked').value;

  if (isNaN(weight) || weight <= 0) { alert('Mẹ nhập cân nặng của bé nhé!'); return; }

  // WHO/AAP formula: 150-200ml/kg/day for formula; breast milk ~750-800ml/day total
  let totalMl, feeds, mlPerFeed, note, tip;

  if (age === 0) {
    feeds = 8; totalMl = Math.round(weight * 60); // very newborn
    note = 'Bé sơ sinh: dạ dày bé bằng viên bi — mỗi cữ chỉ cần 30–60ml. Cho bú theo nhu cầu, không theo giờ.';
  } else if (age <= 1) {
    feeds = 8; totalMl = Math.round(weight * 120);
    note = 'Bé 1 tháng: dạ dày đã lớn hơn. Vẫn nên cho bú theo nhu cầu 8–12 lần/ngày.';
  } else if (age <= 3) {
    feeds = 7; totalMl = Math.round(weight * 150);
    note = 'Bé 2–3 tháng: bắt đầu có nhịp sinh hoạt. Có thể kéo dài khoảng cách giữa các cữ.';
  } else if (age <= 6) {
    feeds = 6; totalMl = Math.round(weight * 160);
    note = 'Bé 4–6 tháng: đây là giai đoạn vàng bú sữa. Chưa cần ăn thêm gì trước 6 tháng.';
  } else if (age <= 9) {
    feeds = 5; totalMl = Math.round(weight * 150);
    note = 'Bé 6–9 tháng: đã bắt đầu ăn dặm. Sữa vẫn là nguồn dinh dưỡng chính, 500–600ml/ngày.';
  } else {
    feeds = 4; totalMl = Math.round(weight * 120);
    note = 'Bé 9–12 tháng: ăn dặm đa dạng hơn, lượng sữa giảm dần nhưng vẫn quan trọng.';
  }

  // Cap total
  if (type === 'formula') totalMl = Math.min(totalMl, 1000);
  else totalMl = Math.min(totalMl, 800);

  mlPerFeed = Math.round(totalMl / feeds);

  if (type === 'breast') {
    tip = '🤱 Sữa mẹ: không cần đo ml — cho bú theo nhu cầu (on-demand). Bé bú đủ khi tăng cân đều, tiểu 6–8 lần/ngày, và vẻ mặt thoải mái sau bú. Bảng ml này chỉ dùng khi mẹ vắt sữa và cho bú bình.';
  } else if (type === 'formula') {
    tip = '🍼 Sữa công thức: pha theo đúng hướng dẫn trên hộp. Không pha đặc hơn để "bé no lâu hơn" — dễ gây quá tải thận cho bé. Hâm ấm ở 37°C trước khi cho bú.';
  } else {
    tip = '🤱🍼 Kết hợp: ưu tiên cho bú mẹ trước, sữa công thức bù thêm sau nếu bé vẫn còn đói. Dùng bình có núm ti chảy chậm để tránh "confusion nipple".';
  }

  // Render stats
  document.getElementById('mk-stats').innerHTML = `
    <div class="mk-stat">
      <p class="mk-val">${totalMl}</p>
      <p class="mk-unit">ml/ngày</p>
    </div>
    <div class="mk-stat">
      <p class="mk-val">${mlPerFeed}</p>
      <p class="mk-unit">ml/cữ</p>
    </div>
    <div class="mk-stat">
      <p class="mk-val">${feeds}</p>
      <p class="mk-unit">cữ/ngày</p>
    </div>`;

  document.getElementById('mk-note').innerHTML = `<b>Lưu ý:</b> ${note}`;

  // Generate schedule
  const interval = Math.round(24 / feeds);
  const startHour = 6;
  const colors = ['#0ea5e9','#6366f1','#ec4899','#10b981','#f59e0b','#8b5cf6'];
  let scheduleHtml = '';
  for (let i = 0; i < feeds; i++) {
    const h = (startHour + i * interval) % 24;
    const label = h < 12 ? `${h}:00 sáng` : (h === 12 ? '12:00 trưa' : `${h-12}:00 chiều${h>=18?' / tối':''}`);
    scheduleHtml += `<div class="mk-slot">
      <div class="mk-dot" style="background:${colors[i%colors.length]}"></div>
      <span style="min-width:90px;font-weight:500">${label}</span>
      <span style="color:#6b7280">Cữ ${i+1} — khoảng ${mlPerFeed} ml</span>
    </div>`;
  }
  document.getElementById('mk-schedule').innerHTML = scheduleHtml;
  document.getElementById('mk-tip').innerHTML = tip;
  document.getElementById('milk-result').style.display = 'block';
  document.getElementById('milk-result').scrollIntoView({behavior:'smooth',block:'nearest'});
}
</script>

---
*Lượng sữa tham khảo theo công thức WHO/AAP. Mỗi bé có nhu cầu khác nhau — theo dõi tăng cân và tiểu tiện là cách đáng tin cậy nhất để biết bé bú đủ. Tham khảo chuyên gia tư vấn cho con bú (IBCLC) nếu có khó khăn.*
