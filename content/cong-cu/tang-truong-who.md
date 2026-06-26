---
title: "Kiểm tra tăng trưởng chuẩn WHO"
description: "Nhập cân nặng, chiều cao và tuổi của bé để xem bé đang ở percentile nào so với chuẩn WHO. Công cụ miễn phí cho mẹ Việt."
tags: ["cong-cu", "tang-truong", "can-nang", "who"]
---

<div id="who-app">
<style>
#who-app{font-family:inherit;max-width:680px;margin:0 auto}
.tool-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1.5rem;margin-bottom:1rem}
.tool-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:500px){.tool-row{grid-template-columns:1fr}}
.tool-label{font-size:.8rem;font-weight:600;color:#374151;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
.tool-input{width:100%;padding:.6rem .8rem;border:1.5px solid #d1d5db;border-radius:8px;font-size:1rem;box-sizing:border-box;outline:none;transition:border .15s}
.tool-input:focus{border-color:#ec4899}
.btn-calc{width:100%;padding:.75rem;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:4px;transition:opacity .2s}
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
.chart-wrap{position:relative;height:280px;margin:1rem 0}
.advice{font-size:.875rem;color:#374151;line-height:1.6;margin:.75rem 0 0;background:#f9fafb;border-radius:8px;padding:.75rem 1rem}
.radio-group{display:flex;gap:12px}
.radio-opt{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.9rem}
.radio-opt input{accent-color:#ec4899;width:16px;height:16px}
.next-month{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.75rem 1rem;margin-top:.75rem;font-size:.875rem;color:#1e40af}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:.5rem}
.legend-item{display:flex;align-items:center;gap:5px;font-size:.75rem;color:#374151}
.legend-dot{width:24px;height:3px;border-radius:2px}
.legend-dot.dashed{background:repeating-linear-gradient(90deg,currentColor 0,currentColor 4px,transparent 4px,transparent 8px)}
.section-tab{display:flex;gap:6px;margin-bottom:1rem}
.tab-btn{padding:.4rem 1rem;border:1.5px solid #e5e7eb;border-radius:20px;font-size:.8rem;cursor:pointer;background:#fff;font-weight:500;transition:all .15s}
.tab-btn.active{background:#ec4899;border-color:#ec4899;color:#fff}
.who-table{width:100%;border-collapse:collapse;font-size:.8rem;margin-top:.5rem}
.who-table th{background:#fdf2f8;padding:.5rem .6rem;text-align:center;border:1px solid #f9a8d4;font-weight:600;color:#9d174d;font-size:.75rem}
.who-table td{padding:.45rem .6rem;text-align:center;border:1px solid #e5e7eb;color:#374151}
.who-table tr:hover td{background:#fdf2f8}
.who-table td.highlight{background:#fce7f3;font-weight:700;color:#9d174d}
.who-table td.baby-row{background:#fdf4ff;font-weight:700;color:#7c3aed}
.table-wrap{overflow-x:auto;border-radius:8px;border:1px solid #e5e7eb}
</style>

<div class="tool-card">
  <h2 style="margin:0 0 1rem;font-size:1.1rem;color:#111">Thông tin của bé</h2>
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
      <input class="tool-input" id="age" type="number" min="0" max="24" placeholder="VD: 5" />
    </div>
    <div>
      <div class="tool-label">Cân nặng (kg)</div>
      <input class="tool-input" id="weight" type="number" step="0.1" placeholder="VD: 6.8" />
    </div>
  </div>
  <div style="margin-top:12px">
    <div class="tool-label">Chiều cao (cm) — không bắt buộc</div>
    <input class="tool-input" id="height" type="number" step="0.1" placeholder="VD: 65.5" />
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
  </div>

  <div class="tool-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;flex-wrap:wrap;gap:8px">
      <h3 style="margin:0;font-size:.95rem;color:#111">Biểu đồ tăng trưởng WHO</h3>
      <div class="section-tab">
        <button class="tab-btn active" id="tab-w" onclick="switchChart('w')">Cân nặng</button>
        <button class="tab-btn" id="tab-h" onclick="switchChart('h')">Chiều cao</button>
      </div>
    </div>
    <div class="legend">
      <span class="legend-item"><span class="legend-dot" style="background:#e34948;height:2px;border-top:2px dashed #e34948;background:none;width:24px"></span>+2SD (trên)</span>
      <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Trung bình</span>
      <span class="legend-item"><span class="legend-dot" style="background:#3b82f6;height:2px;border-top:2px dashed #3b82f6;background:none;width:24px"></span>-2SD (dưới)</span>
      <span class="legend-item"><span style="width:10px;height:10px;border-radius:50%;background:#ec4899;display:inline-block"></span>Con bé</span>
    </div>
    <div class="chart-wrap"><canvas id="whoChart" role="img" aria-label="Biểu đồ tăng trưởng WHO">Biểu đồ cân nặng chuẩn WHO 0-24 tháng</canvas></div>
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
    <p style="font-size:.75rem;color:#9ca3af;margin:.5rem 0 0">* Hàng tím = tuổi hiện tại của bé</p>
  </div>

</div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
const WHO = {
  boy: {
    w: [[0,2.5,3.3,4.4],[1,3.4,4.5,5.8],[2,4.3,5.6,7.1],[3,5.0,6.4,8.0],[4,5.6,7.0,8.7],[5,6.0,7.5,9.3],[6,6.4,7.9,9.8],[7,6.7,8.3,10.3],[8,6.9,8.6,10.7],[9,7.1,8.9,11.0],[10,7.4,9.2,11.4],[11,7.6,9.4,11.7],[12,7.7,9.6,12.0],[15,8.3,10.3,12.8],[18,8.8,10.9,13.7],[21,9.2,11.5,14.5],[24,9.7,12.2,15.3]],
    h: [[0,46.1,49.9,53.7],[1,50.8,54.7,58.6],[2,54.4,58.4,62.4],[3,57.3,61.4,65.5],[4,59.7,63.9,68.0],[5,61.7,65.9,70.1],[6,63.3,67.6,71.9],[7,64.8,69.2,73.5],[8,66.2,70.6,75.0],[9,67.5,72.0,76.5],[10,68.7,73.3,77.9],[11,69.9,74.5,79.2],[12,71.0,75.7,80.5],[15,74.1,79.1,84.2],[18,76.9,82.3,87.7],[21,79.4,85.1,90.0],[24,81.0,87.1,93.2]]
  },
  girl: {
    w: [[0,2.4,3.2,4.2],[1,3.2,4.2,5.5],[2,3.9,5.1,6.6],[3,4.5,5.8,7.5],[4,5.0,6.4,8.2],[5,5.4,6.9,8.8],[6,5.7,7.3,9.3],[7,6.0,7.6,9.8],[8,6.3,7.9,10.2],[9,6.5,8.2,10.5],[10,6.7,8.5,10.9],[11,6.9,8.7,11.2],[12,6.9,8.7,11.2],[15,7.6,9.6,12.4],[18,8.1,10.2,13.2],[21,8.6,10.9,14.0],[24,9.0,11.5,14.8]],
    h: [[0,45.4,49.1,52.9],[1,49.8,53.7,57.6],[2,53.0,57.1,61.1],[3,55.6,59.8,64.0],[4,57.8,62.1,66.4],[5,59.6,64.0,68.5],[6,61.2,65.7,70.3],[7,62.7,67.3,71.9],[8,64.0,68.7,73.5],[9,65.3,70.1,75.0],[10,66.5,71.5,76.4],[11,67.7,72.8,77.8],[12,68.9,74.0,79.2],[15,72.0,77.5,83.0],[18,74.9,80.7,86.5],[21,77.5,83.7,89.8],[24,80.0,86.4,92.9]]
  }
};

const LABELS = ['0th','1th','2th','3th','4th','5th','6th','7th','8th','9th','10th','11th','12th','15th','18th','21th','24th'];
const AGES = [0,1,2,3,4,5,6,7,8,9,10,11,12,15,18,21,24];

let chartInst = null;
let currentChartType = 'w';
let currentTableType = 'w';
let lastAge = null;
let lastGender = 'boy';
let lastWeight = null;
let lastHeight = null;

function interp(data, age) {
  const idx = AGES.findIndex(k => k >= age);
  if (idx === 0) return data[0];
  if (idx === -1) return data[data.length-1];
  const k0 = AGES[idx-1], k1 = AGES[idx];
  const t = (age - k0) / (k1 - k0);
  const d0 = data[idx-1], d1 = data[idx];
  return [null, d0[1]+(d1[1]-d0[1])*t, d0[2]+(d1[2]-d0[2])*t, d0[3]+(d1[3]-d0[3])*t];
}

function getStatus(val, ref) {
  if (val < ref[1]) return {label:'Dưới -2SD ⚠️', cls:'st-low', adv:'Bé đang dưới ngưỡng -2SD. Mẹ nên đưa bé đi khám dinh dưỡng để được tư vấn kịp thời.'};
  if (val < ref[2]) return {label:'Dưới trung bình (bình thường)', cls:'st-watch', adv:'Bé trong vùng bình thường nhưng dưới mức trung bình. Tiếp tục theo dõi và đảm bảo dinh dưỡng đầy đủ.'};
  if (val <= ref[3]) return {label:'Bình thường ✓', cls:'st-normal', adv:'Tuyệt vời! Bé đang phát triển trong vùng bình thường theo chuẩn WHO. Tiếp tục duy trì chế độ dinh dưỡng hiện tại.'};
  return {label:'Trên +2SD', cls:'st-high', adv:'Bé đang trên +2SD. Với cân nặng, mẹ nên kiểm soát khẩu phần. Tham khảo bác sĩ nếu lo lắng.'};
}

function calcWHO() {
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const age = parseInt(document.getElementById('age').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const heightVal = parseFloat(document.getElementById('height').value);

  if (isNaN(age) || isNaN(weight) || age < 0 || age > 24) {
    alert('Mẹ vui lòng nhập tuổi (0–24 tháng) và cân nặng hợp lệ nhé!'); return;
  }

  lastAge = age; lastGender = gender; lastWeight = weight;
  lastHeight = isNaN(heightVal) ? null : heightVal;

  const data = WHO[gender];
  const wRef = interp(data.w, age);
  const wStatus = getStatus(weight, wRef);
  const nextAge = Math.min(age + 1, 24);
  const wNext = interp(data.w, nextAge);

  document.getElementById('status-row').innerHTML = `<span class="status-badge ${wStatus.cls}">${wStatus.label}</span>`;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><p class="stat-val" style="color:#ec4899">${weight} kg</p><p class="stat-label">Cân nặng hiện tại</p></div>
    <div class="stat-card"><p class="stat-val" style="color:#10b981">${wRef[2].toFixed(1)} kg</p><p class="stat-label">Trung bình WHO (${age} tháng)</p></div>
    <div class="stat-card"><p class="stat-val" style="color:#6b7280;font-size:1.1rem">${wRef[1].toFixed(1)}–${wRef[3].toFixed(1)}</p><p class="stat-label">Vùng bình thường (kg)</p></div>
    <div class="stat-card"><p class="stat-val" style="color:#8b5cf6;font-size:1.1rem">${((weight/wRef[2])*100).toFixed(0)}%</p><p class="stat-label">So với trung bình</p></div>`;

  let hHtml = '';
  if (lastHeight) {
    const hRef = interp(data.h, age);
    const hStatus = getStatus(lastHeight, hRef);
    hHtml = `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.7rem 1rem;margin:.75rem 0;font-size:.875rem">
      <b>Chiều cao ${lastHeight} cm:</b> <span class="status-badge ${hStatus.cls}" style="font-size:.75rem;padding:.15rem .6rem">${hStatus.label}</span>
      &nbsp;Chuẩn: ${hRef[1].toFixed(1)}–${hRef[3].toFixed(1)} cm, TB: ${hRef[2].toFixed(1)} cm
    </div>`;
  }
  document.getElementById('height-result').innerHTML = hHtml;
  document.getElementById('advice-box').innerHTML = `<div class="advice">💡 ${wStatus.adv}</div>`;
  document.getElementById('next-box').innerHTML = `<div class="next-month">📅 <b>Tháng ${nextAge}:</b> Chuẩn TB <b>${wNext[2].toFixed(1)} kg</b> — bé cần tăng thêm <b>${(wNext[2]-wRef[2]).toFixed(2)} kg</b></div>`;

  document.getElementById('result').style.display = 'block';
  renderChart('w');
  renderTable('w');
  document.getElementById('result').scrollIntoView({behavior:'smooth', block:'nearest'});
}

function renderChart(type) {
  currentChartType = type;
  const data = WHO[lastGender][type];
  const babyVal = type === 'w' ? lastWeight : lastHeight;

  const low = data.map(r => r[1]);
  const med = data.map(r => r[2]);
  const high = data.map(r => r[3]);
  const babyPoints = AGES.map(a => a === lastAge ? babyVal : null);

  if (chartInst) chartInst.destroy();
  chartInst = new Chart(document.getElementById('whoChart'), {
    type: 'line',
    data: {
      labels: LABELS,
      datasets: [
        {
          label: '+2SD',
          data: high,
          borderColor: '#e34948',
          borderWidth: 1.5,
          borderDash: [5,4],
          pointRadius: 0,
          fill: false,
          tension: 0.3
        },
        {
          label: 'Trung bình',
          data: med,
          borderColor: '#10b981',
          borderWidth: 2.5,
          pointRadius: 0,
          fill: false,
          tension: 0.3
        },
        {
          label: '-2SD',
          data: low,
          borderColor: '#3b82f6',
          borderWidth: 1.5,
          borderDash: [5,4],
          pointRadius: 0,
          fill: false,
          tension: 0.3
        },
        {
          label: 'Con bé',
          data: babyPoints,
          borderColor: '#ec4899',
          borderWidth: 0,
          pointRadius: AGES.map(a => a === lastAge ? 10 : 0),
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          showLine: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.dataset.label === 'Con bé') return `Con bé: ${ctx.raw} ${type==='w'?'kg':'cm'}`;
              return `${ctx.dataset.label}: ${ctx.raw?.toFixed(1)} ${type==='w'?'kg':'cm'}`;
            }
          }
        }
      },
      scales: {
        x: {ticks:{font:{size:11}}, grid:{color:'#f3f4f6'}},
        y: {
          ticks:{font:{size:11}},
          grid:{color:'#f3f4f6'},
          title:{display:true, text: type==='w'?'kg':'cm', font:{size:11}}
        }
      }
    }
  });
}

function renderTable(type) {
  currentTableType = type;
  const gender = lastGender;
  const data = WHO[gender][type];
  const unit = type === 'w' ? 'kg' : 'cm';
  const babyVal = type === 'w' ? lastWeight : lastHeight;

  let html = `<thead><tr>
    <th>Tháng tuổi</th>
    <th>-2SD (${unit})</th>
    <th>Trung bình (${unit})</th>
    <th>+2SD (${unit})</th>
    ${babyVal ? '<th>Con bé ('+unit+')</th>' : ''}
  </tr></thead><tbody>`;

  data.forEach(row => {
    const isCurrentAge = row[0] === lastAge;
    const rowCls = isCurrentAge ? 'baby-row' : '';
    let babyCell = '';
    if (babyVal) {
      if (isCurrentAge) {
        const status = babyVal < row[1] ? '⚠️' : (babyVal > row[3] ? '↑' : '✓');
        babyCell = `<td class="highlight">${babyVal} ${status}</td>`;
      } else {
        babyCell = '<td style="color:#d1d5db">—</td>';
      }
    }
    html += `<tr>
      <td class="${rowCls}" style="font-weight:${isCurrentAge?700:400}">${row[0] === 0 ? 'Sơ sinh' : row[0] + ' tháng'}</td>
      <td class="${rowCls}">${row[1].toFixed(1)}</td>
      <td class="${rowCls}" style="font-weight:600;color:#059669">${row[2].toFixed(1)}</td>
      <td class="${rowCls}">${row[3].toFixed(1)}</td>
      ${babyCell}
    </tr>`;
  });

  html += '</tbody>';
  document.getElementById('who-ref-table').innerHTML = html;
}

function switchChart(type) {
  if (!lastAge && lastAge !== 0) return;
  document.getElementById('tab-w').classList.toggle('active', type==='w');
  document.getElementById('tab-h').classList.toggle('active', type==='h');
  if (type === 'h' && !lastHeight) { alert('Mẹ chưa nhập chiều cao của bé!'); return; }
  renderChart(type);
}

function switchTable(type) {
  if (!lastAge && lastAge !== 0) return;
  document.getElementById('ttab-w').classList.toggle('active', type==='w');
  document.getElementById('ttab-h').classList.toggle('active', type==='h');
  if (type === 'h' && !lastHeight) { alert('Mẹ chưa nhập chiều cao của bé!'); return; }
  renderTable(type);
}
</script>

---
*Số liệu dựa trên Bảng chuẩn tăng trưởng WHO Child Growth Standards 2006. Công cụ chỉ mang tính tham khảo, không thay thế khám dinh dưỡng chuyên nghiệp.*
