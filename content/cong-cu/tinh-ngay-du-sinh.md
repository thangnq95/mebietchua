---
title: "Tính ngày dự sinh"
description: "Tính ngày dự sinh từ ngày kinh cuối, xem tuần thai hiện tại và các mốc khám thai quan trọng trong suốt thai kỳ."
faq:
  - question: "Công cụ này tính ngày dự sinh bằng cách nào?"
    answer: "Trang đang dùng công thức Naegele: lấy ngày đầu tiên của kỳ kinh cuối cộng thêm 280 ngày."
  - question: "Nếu chu kỳ kinh không đều thì có chính xác không?"
    answer: "Vẫn là ước tính tham khảo. Khi chu kỳ không đều, mẹ nên đối chiếu thêm với siêu âm sớm và hỏi bác sĩ sản khoa."
  - question: "Có thể dùng trang này để xem tuần thai hiện tại không?"
    answer: "Có. Sau khi nhập ngày kinh cuối, trang sẽ hiển thị tuần thai hiện tại, tiến trình thai kỳ và các mốc quan trọng."
tags: ["cong-cu", "ngay-du-sinh", "tuan-thai", "me-bau"]
---

<div id="duedate-app">
<style>
#duedate-app{font-family:inherit;max-width:680px;margin:0 auto}
.dd-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1.5rem;margin-bottom:1rem}
.dd-label{font-size:.8rem;font-weight:600;color:#374151;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em;display:block}
.dd-input{width:100%;padding:.6rem .8rem;border:1.5px solid #d1d5db;border-radius:8px;font-size:1rem;box-sizing:border-box;outline:none;transition:border .15s}
.dd-input:focus{border-color:#8b5cf6}
.dd-btn{width:100%;padding:.75rem;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:12px;transition:opacity .2s}
.dd-btn:hover{opacity:.9}
.result-hidden{display:none}
.big-date{font-size:2rem;font-weight:700;color:#8b5cf6;text-align:center;padding:1rem 0 .5rem}
.big-sub{text-align:center;color:#6b7280;font-size:.9rem;margin-bottom:1rem}
.week-bar-wrap{background:#f3f4f6;border-radius:8px;height:14px;overflow:hidden;margin:.75rem 0}
.week-bar{height:100%;background:linear-gradient(90deg,#8b5cf6,#ec4899);border-radius:8px;transition:width .5s}
.milestone-list{display:flex;flex-direction:column;gap:8px;margin-top:1rem}
.milestone{display:flex;align-items:center;gap:12px;padding:.6rem .9rem;border-radius:8px;font-size:.875rem}
.ms-past{background:#f3f4f6;color:#9ca3af}
.ms-now{background:#fdf4ff;border:2px solid #c084fc;color:#6b21a8;font-weight:600}
.ms-future{background:#fff;border:1px solid #e5e7eb;color:#374151}
.ms-icon{font-size:1.1rem;flex-shrink:0}
.ms-week{font-size:.75rem;font-weight:600;min-width:60px;color:inherit}
.trimester-badge{display:inline-block;padding:.25rem .7rem;border-radius:20px;font-size:.75rem;font-weight:600;margin-left:.5rem}
.t1{background:#fce7f3;color:#9d174d}
.t2{background:#eff6ff;color:#1d4ed8}
.t3{background:#ecfdf5;color:#065f46}
</style>

<div class="dd-card">
  <h2 style="margin:0 0 1rem;font-size:1.1rem;color:#111">Nhập ngày kinh cuối cùng</h2>
  <label class="dd-label">Ngày đầu tiên của kỳ kinh cuối</label>
  <input class="dd-input" type="date" id="lmp" />
  <button class="dd-btn" onclick="calcDueDate()">Tính ngày dự sinh</button>
</div>

<div id="dd-result" class="result-hidden">

<div class="dd-card">
  <div id="big-due" class="big-date"></div>
  <div id="big-sub" class="big-sub"></div>
  <div id="week-label" style="text-align:center;font-size:.875rem;color:#374151;margin-bottom:.25rem"></div>
  <div class="week-bar-wrap"><div id="week-bar" class="week-bar" style="width:0%"></div></div>
  <div style="display:flex;justify-content:space-between;font-size:.75rem;color:#9ca3af">
    <span>Tuần 1</span><span>Tuần 40</span>
  </div>
</div>

<div class="dd-card">
  <h3 style="margin:0 0 .75rem;font-size:.95rem;color:#111">Các mốc quan trọng trong thai kỳ</h3>
  <div class="milestone-list" id="milestones"></div>
</div>

</div>
</div>

<div class="dd-card">
  <h3 style="margin:0 0 .75rem;font-size:.95rem;color:#111">Mẹ nên mở tiếp</h3>
  <ul style="margin:0;padding-left:1.2rem;color:#374151;line-height:1.7">
    <li><a href="/posts/pregnancy-month-3-body-changes/">Mẹ bầu tháng 3</a> để hiểu các mốc sàng lọc đầu thai kỳ.</li>
    <li><a href="/posts/pregnancy-month-8-hospital-bag/">Mẹ bầu tháng 8</a> để chuẩn bị túi đi sinh đúng thời điểm.</li>
    <li><a href="/cong-cu/tinh-can-nang-thai-nhi/">Tính cân nặng thai nhi theo tuần</a> để theo dõi bé theo từng lần siêu âm.</li>
  </ul>
</div>

<script>
function calcDueDate() {
  const lmp = document.getElementById('lmp').value;
  if (!lmp) { alert('Mẹ chưa chọn ngày kinh cuối nhé!'); return; }

  const lmpDate = new Date(lmp);
  const dueDate = new Date(lmpDate);
  dueDate.setDate(dueDate.getDate() + 280);

  const today = new Date();
  today.setHours(0,0,0,0);
  const daysPreg = Math.floor((today - lmpDate) / 86400000);
  const weeksPreg = Math.floor(daysPreg / 7);
  const dayRem = daysPreg % 7;
  const pct = Math.min(Math.max((daysPreg/280)*100, 0), 100);
  const daysLeft = Math.max(0, Math.floor((dueDate - today) / 86400000));

  const fmt = d => d.toLocaleDateString('vi-VN', {day:'2-digit',month:'2-digit',year:'numeric'});
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r; };
  const addWeeks = (d, w) => addDays(d, w*7);

  document.getElementById('big-due').textContent = fmt(dueDate);

  let trimStr = '';
  if (weeksPreg < 14) trimStr = '<span class="trimester-badge t1">Tam cá nguyệt 1</span>';
  else if (weeksPreg < 28) trimStr = '<span class="trimester-badge t2">Tam cá nguyệt 2</span>';
  else trimStr = '<span class="trimester-badge t3">Tam cá nguyệt 3</span>';

  document.getElementById('big-sub').innerHTML = (daysPreg >= 0 && weeksPreg <= 42)
    ? `Hiện tại: <b>Tuần ${weeksPreg} ngày ${dayRem}</b>${trimStr} — còn <b>${daysLeft} ngày</b>`
    : `Ngày dự sinh đã qua hoặc chưa đến`;

  document.getElementById('week-label').textContent = `Tiến trình thai kỳ: ${Math.round(pct)}%`;
  document.getElementById('week-bar').style.width = pct + '%';

  const milestones = [
    {week: 6,  icon:'🩺', label:'Siêu âm lần đầu — xác nhận tim thai'},
    {week: 12, icon:'🧬', label:'Đo độ mờ da gáy (NT) + Double test — sàng lọc dị tật'},
    {week: 16, icon:'💞', label:'Siêu âm hình thái học sớm — có thể biết giới tính'},
    {week: 20, icon:'🔬', label:'Triple test — sàng lọc hội chứng Down, dị tật ống thần kinh'},
    {week: 22, icon:'🏥', label:'Siêu âm hình thái học chi tiết — kiểm tra toàn diện'},
    {week: 28, icon:'🍬', label:'Xét nghiệm tiểu đường thai kỳ (OGTT)'},
    {week: 32, icon:'📏', label:'Siêu âm đánh giá tăng trưởng thai nhi'},
    {week: 36, icon:'🎒', label:'Chuẩn bị túi đi sinh — kiểm tra ngôi thai'},
    {week: 38, icon:'⏰', label:'Siêu âm đánh giá nước ối, ngôi thai cuối cùng'},
    {week: 40, icon:'👶', label:'Ngày dự sinh!'},
  ];

  const msHtml = milestones.map(m => {
    const msDate = addWeeks(lmpDate, m.week);
    const isPast = msDate < today;
    const isCurrent = weeksPreg >= m.week - 1 && weeksPreg < m.week + 1 && !isPast;
    const cls = isPast ? 'ms-past' : (isCurrent ? 'ms-now' : 'ms-future');
    return `<div class="milestone ${cls}">
      <span class="ms-icon">${isPast ? '✓' : m.icon}</span>
      <span class="ms-week">Tuần ${m.week}</span>
      <span style="flex:1">${m.label}</span>
      <span style="font-size:.75rem;color:inherit;white-space:nowrap">${fmt(msDate)}</span>
    </div>`;
  }).join('');

  document.getElementById('milestones').innerHTML = msHtml;
  document.getElementById('dd-result').style.display = 'block';
  document.getElementById('dd-result').scrollIntoView({behavior:'smooth',block:'nearest'});
}
</script>

{{< faq title="Câu hỏi thường gặp về tính ngày dự sinh" >}}

---
*Tính theo công thức Naegele (LMP + 280 ngày). Ngày dự sinh chỉ mang tính ước tính — chỉ khoảng 5% bé sinh đúng ngày dự sinh. Luôn theo dõi theo chỉ dẫn của bác sĩ.*
