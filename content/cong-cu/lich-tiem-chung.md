---
title: "Lịch tiêm chủng Việt Nam"
description: "Nhập ngày sinh của bé để xem đầy đủ lịch tiêm chủng theo chương trình TCMR Việt Nam và vaccine dịch vụ khuyến cáo. Biết ngay mũi nào đã qua và mũi nào sắp tới."
faq:
  - question: "Trang này có bao gồm vaccine dịch vụ không?"
    answer: "Có. Mẹ có thể chuyển giữa lịch TCMR miễn phí và vaccine dịch vụ để xem theo nhu cầu."
  - question: "Có cần nhập ngày sinh chính xác không?"
    answer: "Có, vì lịch sẽ tự tính các mốc tiêm theo số ngày tuổi của bé."
  - question: "Nếu mũi đã qua thì còn tiêm được không?"
    answer: "Thường vẫn có thể tiêm bù, nhưng mẹ nên hỏi bác sĩ hoặc điểm tiêm chủng để được sắp lịch phù hợp."
tags: ["cong-cu", "tiem-chung", "vaccine", "be-so-sinh"]
---

<div id="vax-app">
<style>
#vax-app{font-family:inherit;max-width:680px;margin:0 auto}
.vax-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1.5rem;margin-bottom:1rem}
.vax-label{font-size:.8rem;font-weight:600;color:#374151;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em;display:block}
.vax-input{width:100%;padding:.6rem .8rem;border:1.5px solid #d1d5db;border-radius:8px;font-size:1rem;box-sizing:border-box;outline:none;transition:border .15s}
.vax-input:focus{border-color:#059669}
.vax-btn{width:100%;padding:.75rem;background:linear-gradient(135deg,#059669,#0ea5e9);color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:12px}
.vax-btn:hover{opacity:.9}
.result-hidden{display:none}
.vax-row{display:flex;align-items:flex-start;gap:12px;padding:.75rem;border-radius:8px;margin-bottom:6px;font-size:.875rem}
.vax-past{background:#f0fdf4;border:1px solid #bbf7d0}
.vax-soon{background:#fffbeb;border:2px solid #fbbf24}
.vax-future{background:#fff;border:1px solid #e5e7eb}
.vax-icon{font-size:1.1rem;flex-shrink:0;margin-top:1px}
.vax-name{font-weight:600;color:#111;margin:0 0 2px}
.vax-detail{color:#6b7280;font-size:.8rem;margin:0}
.vax-date{font-size:.75rem;font-weight:600;white-space:nowrap;margin-left:auto;padding-left:8px;text-align:right}
.vax-past .vax-date{color:#059669}
.vax-soon .vax-date{color:#d97706}
.vax-future .vax-date{color:#6b7280}
.tab-group{display:flex;gap:6px;margin-bottom:1rem}
.tab-btn{padding:.4rem 1rem;border:1.5px solid #e5e7eb;border-radius:20px;font-size:.8rem;cursor:pointer;background:#fff;transition:all .15s;font-weight:500}
.tab-btn.active{background:#059669;border-color:#059669;color:#fff}
.next-vax-highlight{background:#fffbeb;border:2px solid #fbbf24;border-radius:10px;padding:1rem;margin-bottom:1rem;font-size:.875rem}
.countdown-big{font-size:1.8rem;font-weight:700;color:#d97706}
</style>

<div class="vax-card">
  <h2 style="margin:0 0 1rem;font-size:1.1rem;color:#111">Ngày sinh của bé</h2>
  <label class="vax-label">Nhập ngày sinh</label>
  <input class="vax-input" type="date" id="dob" />
  <button class="vax-btn" onclick="calcVax()">Xem lịch tiêm</button>
</div>

<div id="vax-result" class="result-hidden">
  <div id="next-highlight"></div>
  <div class="vax-card">
    <div class="tab-group">
      <button class="tab-btn active" onclick="showTab('all',this)">Tất cả</button>
      <button class="tab-btn" onclick="showTab('tcmr',this)">TCMR (miễn phí)</button>
      <button class="tab-btn" onclick="showTab('dv',this)">Dịch vụ</button>
    </div>
    <div id="vax-list"></div>
  </div>
</div>
</div>

<script>
const VACCINES = [
  {id:'bcg',    label:'BCG — Lao',                  detail:'Tiêm trong da, vai trái',         days:0,   type:'tcmr'},
  {id:'hbv1',   label:'Viêm gan B mũi 1',           detail:'Tiêm bắp, đùi phải',             days:0,   type:'tcmr'},
  {id:'dpt1',   label:'5in1 mũi 1 (DTP-VGB-Hib)',   detail:'Bạch hầu, Ho gà, Uốn ván, VGB, Hib', days:60, type:'tcmr'},
  {id:'opv1',   label:'Uống Bại liệt mũi 1 (OPV)',  detail:'Uống, 2 giọt',                   days:60,  type:'tcmr'},
  {id:'rota1',  label:'Rotavirus mũi 1',             detail:'Uống — dịch vụ',                 days:60,  type:'dv'},
  {id:'pneu1',  label:'Phế cầu mũi 1 (PCV)',        detail:'Prevenar 13 — dịch vụ',          days:60,  type:'dv'},
  {id:'dpt2',   label:'5in1 mũi 2',                  detail:'',                               days:90,  type:'tcmr'},
  {id:'opv2',   label:'Uống Bại liệt mũi 2',        detail:'',                               days:90,  type:'tcmr'},
  {id:'rota2',  label:'Rotavirus mũi 2',             detail:'Uống — dịch vụ',                 days:90,  type:'dv'},
  {id:'pneu2',  label:'Phế cầu mũi 2',              detail:'Dịch vụ',                        days:90,  type:'dv'},
  {id:'dpt3',   label:'5in1 mũi 3',                  detail:'',                               days:120, type:'tcmr'},
  {id:'opv3',   label:'Uống Bại liệt mũi 3',        detail:'',                               days:120, type:'tcmr'},
  {id:'pneu3',  label:'Phế cầu mũi 3',              detail:'Dịch vụ',                        days:120, type:'dv'},
  {id:'flu1',   label:'Cúm mũi 1',                  detail:'Từ 6 tháng — dịch vụ',           days:180, type:'dv'},
  {id:'measles',label:'Sởi mũi 1',                  detail:'Tiêm dưới da',                   days:270, type:'tcmr'},
  {id:'mmr',    label:'Sởi-Quai bị-Rubella (MMR)',  detail:'Dịch vụ thay thế sởi đơn',       days:365, type:'dv'},
  {id:'cp',     label:'Thủy đậu',                    detail:'Dịch vụ — 1 mũi',               days:365, type:'dv'},
  {id:'je1',    label:'Viêm não Nhật Bản mũi 1',    detail:'Dịch vụ — 12–15 tháng',         days:365, type:'dv'},
  {id:'dpt4',   label:'DPT mũi 4 (nhắc lại)',       detail:'TCMR — 18 tháng',                days:540, type:'tcmr'},
  {id:'mmr2',   label:'Sởi-Rubella nhắc lại',       detail:'TCMR — 18 tháng',                days:540, type:'tcmr'},
  {id:'je2',    label:'Viêm não Nhật Bản mũi 2',    detail:'Dịch vụ — 1–2 tuần sau mũi 1',  days:379, type:'dv'},
  {id:'je3',    label:'Viêm não Nhật Bản mũi 3',    detail:'Dịch vụ — 1 năm sau mũi 2',     days:744, type:'dv'},
];

let allItems = [];
let currentFilter = 'all';

function calcVax() {
  const dob = document.getElementById('dob').value;
  if (!dob) { alert('Mẹ chưa nhập ngày sinh của bé!'); return; }
  const birth = new Date(dob);
  const today = new Date(); today.setHours(0,0,0,0);
  const fmt = d => d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});

  allItems = VACCINES.map(v => {
    const d = new Date(birth); d.setDate(d.getDate() + v.days);
    const isPast = d < today;
    const daysLeft = Math.ceil((d - today) / 86400000);
    const isSoon = !isPast && daysLeft <= 30;
    return {...v, date: d, isPast, isSoon, daysLeft};
  }).sort((a,b) => a.date - b.date);

  const nextVax = allItems.find(v => !v.isPast);
  if (nextVax) {
    document.getElementById('next-highlight').innerHTML = `
      <div class="next-vax-highlight">
        ⏰ <b>Mũi tiêm tiếp theo:</b> ${nextVax.label}<br>
        <span class="countdown-big">${nextVax.daysLeft > 0 ? nextVax.daysLeft + ' ngày nữa' : 'Hôm nay!'}</span>
        <span style="color:#6b7280;font-size:.8rem;margin-left:8px">(${nextVax.date.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'})})</span>
      </div>`;
  }

  renderList(currentFilter);
  document.getElementById('vax-result').style.display = 'block';
  document.getElementById('vax-result').scrollIntoView({behavior:'smooth',block:'nearest'});
}

function renderList(filter) {
  const items = allItems.filter(v => filter === 'all' || v.type === filter);
  const fmt = d => d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});
  document.getElementById('vax-list').innerHTML = items.map(v => {
    const cls = v.isPast ? 'vax-past' : (v.isSoon ? 'vax-soon' : 'vax-future');
    const icon = v.isPast ? '✅' : (v.isSoon ? '⚠️' : '💉');
    const dateLabel = v.isPast ? 'Đã qua' : (v.daysLeft === 0 ? 'Hôm nay!' : (v.daysLeft + ' ngày nữa'));
    return `<div class="vax-row ${cls}">
      <span class="vax-icon">${icon}</span>
      <div style="flex:1">
        <p class="vax-name">${v.label}</p>
        <p class="vax-detail">${v.detail}</p>
      </div>
      <div class="vax-date">${fmt(v.date)}<br>${dateLabel}</div>
    </div>`;
  }).join('');
}

function showTab(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderList(filter);
}
</script>

<div class="vax-card">
  <h3 style="margin:0 0 .75rem;font-size:.95rem;color:#111">Mẹ nên mở tiếp</h3>
  <ul style="margin:0;padding-left:1.2rem;color:#374151;line-height:1.7">
    <li><a href="/posts/newborn-month-1-first-weeks/">Bé sơ sinh tháng đầu</a> để nắm các dấu hiệu cần theo dõi sau sinh.</li>
    <li><a href="/posts/baby-month-2-3-milestones/">Bé 2-3 tháng</a> để biết mốc phát triển đầu tiên.</li>
    <li><a href="/cong-cu/tang-truong-who/">Kiểm tra tăng trưởng chuẩn WHO</a> để theo dõi chiều cao/cân nặng của bé.</li>
  </ul>
</div>

{{< faq title="Câu hỏi thường gặp về lịch tiêm chủng" >}}

---
*Lịch tiêm theo chương trình TCMR Bộ Y tế Việt Nam. Vaccine dịch vụ theo khuyến cáo của VNPCA. Mẹ nên mang sổ tiêm chủng khi đi tiêm để bác sĩ xác nhận chính xác nhất.*
