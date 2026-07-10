---
title: "Kiểm tra tăng trưởng chuẩn WHO"
description: "Nhập cân nặng và chiều cao để xem bé đang ở vị trí phân vị nào so với chuẩn WHO. Nếu mẹ đã lưu hồ sơ bé, công cụ sẽ tự điền tuổi."
faq:
  - question: "Có bắt buộc phải đăng nhập tài khoản mới dùng được không?"
    answer: "Không bắt buộc. Nếu chưa đăng nhập, mẹ nhập tuổi, giới tính, cân nặng và chiều cao trực tiếp trong công cụ. Nếu đã đăng nhập và có hồ sơ bé ở trang Hồ sơ bé, tuổi và giới tính sẽ tự điền."
  - question: "Vì sao nên lưu ngày sinh của bé?"
    answer: "Vì hệ thống sẽ tự tính tháng tuổi mỗi lần mẹ mở lại trang, đỡ phải nhập lại thủ công và tránh lệch tuổi."
  - question: "Trang này phù hợp với bé mấy tháng?"
    answer: "WHO ở đây đang theo chuẩn 0-24 tháng. Nếu bé lớn hơn, mẹ vẫn xem tham khảo nhưng nên ưu tiên tư vấn nhi khoa khi cần đánh giá chính xác hơn."
tags: ["cong-cu", "tang-truong", "can-nang", "who"]
---

<div id="who-app">
<style>
#who-app{font-family:inherit;max-width:680px;margin:0 auto}
.who-muted{font-size:.82rem;color:#6b7280}
.who-profile-hint{display:none;margin:-.25rem 0 1rem;padding:.8rem 1rem;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;color:#7c2d12;font-size:.86rem;line-height:1.55}
.who-profile-hint a{font-weight:700;color:#9d174d}
.tool-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:1.5rem;margin-bottom:1rem;box-shadow:0 12px 28px rgba(116,74,64,.04)}
.tool-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:500px){.tool-row{grid-template-columns:1fr}}
.tool-label{font-size:.8rem;font-weight:600;color:#374151;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
.tool-input{width:100%;min-height:48px;padding:.7rem .85rem;border:1.5px solid #d1d5db;border-radius:12px;font-size:1rem;box-sizing:border-box;outline:none;transition:border .15s;background:#fff}
.tool-input:focus{border-color:#ec4899}
.btn-calc{width:100%;min-height:52px;padding:.8rem 1rem;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border:none;border-radius:14px;font-size:1rem;font-weight:800;cursor:pointer;margin-top:8px;transition:opacity .2s;box-shadow:0 12px 26px rgba(236,72,153,.18)}
.btn-calc:hover{opacity:.9}
.result-box{display:none;margin-top:1rem}
.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:1rem}
@media(max-width:500px){.result-grid{grid-template-columns:1fr}}
.stat-card{background:#fff;border-radius:8px;padding:.9rem;text-align:center;border:1px solid #e5e7eb}
.stat-val{font-size:1.5rem;font-weight:700;margin:0}
.stat-label{font-size:.75rem;color:#6b7280;margin:4px 0 0}
.status-badge{display:inline-block;padding:.3rem .9rem;border-radius:20px;font-size:.85rem;font-weight:600;margin-bottom:.75rem}
.st-normal{background:#dcfce7;color:#166534}
.st-watch{background:#fef9c3;color:#854d0e}
.st-low{background:#fee2e2;color:#991b1b}
.st-high{background:#fce7f3;color:#9d174d}
.chart-wrap{position:relative;height:320px;margin:1rem 0}
.advice{font-size:.875rem;color:#374151;line-height:1.6;margin:.75rem 0 0;background:#f9fafb;border-radius:8px;padding:.75rem 1rem}
.radio-group{display:flex;gap:12px}
.radio-opt{display:flex;align-items:center;gap:8px;min-height:44px;padding:.55rem .75rem;border:1px solid #e5e7eb;border-radius:14px;background:#fff;cursor:pointer;font-size:.92rem;font-weight:700}
.radio-opt:has(input:checked){border-color:#f9a8d4;background:#fdf2f8;color:#9d174d}
.radio-opt input{accent-color:#ec4899;width:18px;height:18px}
.next-month{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.75rem 1rem;margin-top:.75rem;font-size:.875rem;color:#1e40af}
.section-tab{display:flex;gap:6px;margin-bottom:1rem}
.tab-btn{padding:.4rem 1rem;border:1.5px solid #e5e7eb;border-radius:20px;font-size:.8rem;cursor:pointer;background:#fff;font-weight:500;transition:all .15s}
.tab-btn.active{background:#ec4899;border-color:#ec4899;color:#fff}
.who-table{width:100%;border-collapse:collapse;font-size:.8rem;margin-top:.5rem}
.who-table th{background:#fdf2f8;padding:.5rem .6rem;text-align:center;border:1px solid #f9a8d4;font-weight:600;color:#9d174d;font-size:.75rem}
.who-table td{padding:.45rem .6rem;text-align:center;border:1px solid #e5e7eb;color:#374151}
.who-table tr:hover td{background:#fdf2f8}
.who-table td.highlight{background:#fce7f3;font-weight:700;color:#9d174d}
.who-table td.baby-now{background:#fdf4ff;font-weight:700;color:#7c3aed}
.who-table td.baby-pred{background:#f5f3ff;color:#7c3aed;font-style:italic}
.table-wrap{overflow-x:auto;border-radius:12px;border:1px solid #e5e7eb;-webkit-overflow-scrolling:touch;background:#fff}
.legend-row{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:.5rem;font-size:.75rem}
.leg{display:flex;align-items:center;gap:5px;color:#374151}
.leg-line{width:22px;height:3px;border-radius:2px}
.leg-dot{width:10px;height:10px;border-radius:50%}
.prediction-box{background:#fdf4ff;border:1px solid #e9d5ff;border-radius:8px;padding:.75rem 1rem;margin-top:.75rem;font-size:.875rem;color:#6b21a8}
.ref-note{font-size:.75rem;color:#6b7280;margin:.35rem 0 0;line-height:1.5}
@media(max-width:640px){
  #who-app{max-width:none}
  .tool-card{padding:1rem;border-radius:18px;margin-bottom:.85rem}
  .tool-label{font-size:.74rem}
  .radio-group{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .radio-opt{justify-content:center;width:100%;box-sizing:border-box}
  .chart-wrap{height:300px;margin:.85rem 0 .5rem}
  .section-tab{width:100%;gap:8px}
  .tab-btn{flex:1;min-height:44px;min-width:0;padding:.65rem .8rem;border-radius:999px;font-size:.86rem;font-weight:800}
  .legend-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px;margin-bottom:.4rem}
  .leg{font-size:.72rem;line-height:1.2;align-items:flex-start}
  .who-table{min-width:560px;font-size:.78rem}
  .who-table th:first-child,.who-table td:first-child{position:sticky;left:0;z-index:1;background:#fff7fb;box-shadow:1px 0 0 #f3d2df}
}
@media(max-width:420px){
  .legend-row{grid-template-columns:1fr}
  .chart-wrap{height:290px}
}
</style>

<div class="tool-card">
  <h2 style="margin:0 0 1rem;font-size:1.1rem;color:#111">Thông tin của bé</h2>
  <div id="who-profile-hint" class="who-profile-hint"></div>
  <div style="margin-bottom:1rem">
    <div class="tool-label">Giới tính</div>
    <div class="radio-group">
      <label class="radio-opt"><input type="radio" name="gender" value="boy" checked> Bé trai</label>
      <label class="radio-opt"><input type="radio" name="gender" value="girl"> Bé gái</label>
    </div>
  </div>
  <div class="tool-row">
    <div>
      <div class="tool-label">Tuổi bé (tháng)</div>
      <input class="tool-input" id="age" type="number" min="0" max="24" placeholder="VD: 6" />
    </div>
    <div>
      <div class="tool-label">Cân nặng (kg)</div>
      <input class="tool-input" id="weight" type="number" step="0.1" placeholder="VD: 6.8" />
    </div>
  </div>
  <div id="who-age-helper" class="who-muted" style="margin-top:8px">Nếu mẹ đã đăng nhập và có hồ sơ bé đang dùng, tuổi và giới tính sẽ tự điền. Nếu chưa, mẹ nhập tay tại đây.</div>
  <div style="margin-top:12px">
    <div class="tool-label">Chiều cao (cm) — không bắt buộc</div>
    <input class="tool-input" id="height" type="number" step="0.1" placeholder="VD: 65.5" />
    <p class="ref-note">Chuẩn tham khảo: WHO Child Growth Standards (chuẩn chiều dài/chiều cao theo tuổi) cho bé từ 0-24 tháng.</p>
  </div>
  <button class="btn-calc" onclick="calcWHO()">Kiểm tra ngay</button>
</div>

<div class="result-box" id="result">

  <div class="tool-card">
    <div id="status-row" style="margin-bottom:.75rem"></div>
    <div class="result-grid" id="stats-grid"></div>
    <div id="height-result"></div>
    <div id="advice-box"></div>
    <div id="next-box"></div>
    <div id="pred-box"></div>
  </div>

  <div class="tool-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.75rem;flex-wrap:wrap;gap:8px">
        <h3 id="chart-title" style="margin:0;font-size:.95rem;color:#111">Biểu đồ tăng trưởng WHO</h3>
        <p style="margin:.15rem 0 0;font-size:.74rem;color:#6b7280">Chạm để đổi giữa cân nặng và chiều cao</p>
      </div>
      <div class="section-tab" style="margin-bottom:.85rem">
        <button class="tab-btn active" id="tab-w" onclick="switchChart('w')">Cân nặng</button>
        <button class="tab-btn" id="tab-h" onclick="switchChart('h')">Chiều cao</button>
      </div>
    <div class="legend-row">
      <span class="leg"><span class="leg-line" style="background:#e34948;border-top:2px dashed #e34948;height:0;border-radius:0"></span>+2SD</span>
      <span class="leg"><span class="leg-line" style="background:#10b981"></span>Trung bình</span>
      <span class="leg"><span class="leg-line" style="background:#3b82f6;border-top:2px dashed #3b82f6;height:0;border-radius:0"></span>−2SD</span>
      <span class="leg"><span class="leg-dot" style="background:#ec4899"></span>Con bé (hiện tại)</span>
      <span class="leg"><span class="leg-line" style="background:#a855f7;border-top:2px dashed #a855f7;height:0;border-radius:0"></span>Dự đoán tương lai</span>
    </div>
    <div class="chart-wrap"><canvas id="whoChart" role="img" aria-label="Biểu đồ tăng trưởng WHO 0-24 tháng">Biểu đồ tăng trưởng WHO</canvas></div>
  </div>

<div class="tool-card">
  <h3 style="margin:0 0 .75rem;font-size:.95rem;color:#111">Bảng chuẩn WHO 0–24 tháng</h3>
    <div class="section-tab" style="margin-bottom:.75rem">
      <button class="tab-btn active" id="ttab-w" onclick="switchTable('w')">Cân nặng (kg)</button>
      <button class="tab-btn" id="ttab-h" onclick="switchTable('h')">Chiều cao (cm)</button>
    </div>
    <div class="table-wrap">
      <table class="who-table" id="who-ref-table"></table>
    </div>
    <p style="font-size:.75rem;color:#9ca3af;margin:.5rem 0 0">🟣 Tuổi hiện tại — <i>tím nhạt</i> = dự đoán tương lai (giữ nguyên vị trí phân vị)</p>
  </div>

</div>
</div>

<div class="tool-card">
  <h3 style="margin:0 0 .75rem;font-size:.95rem;color:#111">Mẹ nên mở tiếp</h3>
  <ul style="margin:0;padding-left:1.2rem;color:#374151;line-height:1.7">
    <li><a href="/cong-cu/tinh-ngay-du-sinh/">Tính ngày dự sinh</a> nếu mẹ muốn tự tính tuần thai từ ngày kinh cuối.</li>
    <li><a href="/cong-cu/tinh-can-nang-thai-nhi/">Tính cân nặng thai nhi theo tuần</a> nếu mẹ đang theo dõi bé trong bụng.</li>
    <li><a href="/cong-cu/lich-tiem-chung/">Lịch tiêm chủng Việt Nam</a> nếu bé đã sinh và mẹ muốn xem mốc tiêm tiếp theo.</li>
  </ul>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
  (function () {
    var script = document.createElement("script");
    script.defer = true;
    script.src = "/js/who-tool-app.js?v=20260710-child-profile-page";
    document.currentScript.after(script);
  })();
</script>
{{< faq title="Câu hỏi thường gặp về công cụ WHO" >}}

---
*Số liệu dựa trên WHO Child Growth Standards 2006. Dự đoán tương lai giả định bé duy trì vị trí phân vị hiện tại — thực tế có thể thay đổi tùy dinh dưỡng và sức khỏe. Công cụ chỉ mang tính tham khảo, không thay thế khám dinh dưỡng chuyên nghiệp.*
