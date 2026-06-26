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
.result-box{display:none;background:#fdf2f8;border:1px solid #f9a8d4;border-radius:12px;padding:1.25rem;margin-top:1rem}
.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:1rem}
.stat-card{background:#fff;border-radius:8px;padding:.9rem;text-align:center;border:1px solid #e5e7eb}
.stat-val{font-size:1.6rem;font-weight:700;margin:0}
.stat-label{font-size:.75rem;color:#6b7280;margin:4px 0 0}
.status-badge{display:inline-block;padding:.3rem .9rem;border-radius:20px;font-size:.8rem;font-weight:600;margin-bottom:.75rem}
.st-normal{background:#dcfce7;color:#166534}
.st-watch{background:#fef9c3;color:#854d0e}
.st-low{background:#fee2e2;color:#991b1b}
.st-high{background:#fce7f3;color:#9d174d}
.chart-wrap{position:relative;height:220px;margin:1rem 0}
.advice{font-size:.875rem;color:#374151;line-height:1.6;margin:.75rem 0 0}
.radio-group{display:flex;gap:12px}
.radio-opt{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.9rem}
.radio-opt input{accent-color:#ec4899;width:16px;height:16px}
.section-sep{border:none;border-top:1px solid #e5e7eb;margin:1rem 0}
.next-month{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.75rem 1rem;margin-top:.75rem;font-size:.875rem;color:#1e40af}
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
  <div id="result-inner"></div>
</div>

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
const WHO = {
  boy: {
    w: {0:[2.5,3.3,4.4],1:[3.4,4.5,5.8],2:[4.3,5.6,7.1],3:[5.0,6.4,8.0],4:[5.6,7.0,8.7],5:[6.0,7.5,9.3],6:[6.4,7.9,9.8],7:[6.7,8.3,10.3],8:[6.9,8.6,10.7],9:[7.1,8.9,11.0],10:[7.4,9.2,11.4],11:[7.6,9.4,11.7],12:[7.7,9.6,12.0],15:[8.3,10.3,12.8],18:[8.8,10.9,13.7],21:[9.2,11.5,14.5],24:[9.7,12.2,15.3]},
    h: {0:[46.1,49.9,53.7],1:[50.8,54.7,58.6],2:[54.4,58.4,62.4],3:[57.3,61.4,65.5],4:[59.7,63.9,68.0],5:[61.7,65.9,70.1],6:[63.3,67.6,71.9],7:[64.8,69.2,73.5],8:[66.2,70.6,75.0],9:[67.5,72.0,76.5],10:[68.7,73.3,77.9],11:[69.9,74.5,79.2],12:[71.0,75.7,80.5],15:[74.1,79.1,84.2],18:[76.9,82.3,87.7],21:[79.4,85.1,90.0],24:[81.0,87.1,93.2]}
  },
  girl: {
    w: {0:[2.4,3.2,4.2],1:[3.2,4.2,5.5],2:[3.9,5.1,6.6],3:[4.5,5.8,7.5],4:[5.0,6.4,8.2],5:[5.4,6.9,8.8],6:[5.7,7.3,9.3],7:[6.0,7.6,9.8],8:[6.3,7.9,10.2],9:[6.5,8.2,10.5],10:[6.7,8.5,10.9],11:[6.9,8.7,11.2],12:[6.9,8.7,11.2],15:[7.6,9.6,12.4],18:[8.1,10.2,13.2],21:[8.6,10.9,14.0],24:[9.0,11.5,14.8]},
    h: {0:[45.4,49.1,52.9],1:[49.8,53.7,57.6],2:[53.0,57.1,61.1],3:[55.6,59.8,64.0],4:[57.8,62.1,66.4],5:[59.6,64.0,68.5],6:[61.2,65.7,70.3],7:[62.7,67.3,71.9],8:[64.0,68.7,73.5],9:[65.3,70.1,75.0],10:[66.5,71.5,76.4],11:[67.7,72.8,77.8],12:[68.9,74.0,79.2],15:[72.0,77.5,83.0],18:[74.9,80.7,86.5],21:[77.5,83.7,89.8],24:[80.0,86.4,92.9]}
  }
};

let chartInst = null;

function getClosestAge(age) {
  const keys = [0,1,2,3,4,5,6,7,8,9,10,11,12,15,18,21,24];
  return keys.reduce((a,b) => Math.abs(b-age)<Math.abs(a-age)?b:a);
}

function interpolate(data, age) {
  const keys = [0,1,2,3,4,5,6,7,8,9,10,11,12,15,18,21,24];
  const idx = keys.findIndex(k => k >= age);
  if (idx === 0) return data[keys[0]];
  if (idx === -1) return data[keys[keys.length-1]];
  const k0 = keys[idx-1], k1 = keys[idx];
  const t = (age - k0) / (k1 - k0);
  const d0 = data[k0], d1 = data[k1];
  return [d0[0]+(d1[0]-d0[0])*t, d0[1]+(d1[1]-d0[1])*t, d0[2]+(d1[2]-d0[2])*t];
}

function getStatus(val, ref) {
  if (val < ref[0]) return {label:'Dưới -2SD (nhẹ cân/thấp)', cls:'st-low', advice:'Bé đang dưới ngưỡng -2SD. Mẹ nên đưa bé đi khám dinh dưỡng để được tư vấn kịp thời.'};
  if (val < ref[1]) return {label:'Trong khoảng bình thường (dưới trung bình)', cls:'st-watch', advice:'Bé đang trong vùng bình thường nhưng dưới mức trung bình. Tiếp tục theo dõi và đảm bảo dinh dưỡng đầy đủ.'};
  if (val <= ref[2]) return {label:'Bình thường ✓', cls:'st-normal', advice:'Tuyệt vời! Bé đang phát triển trong vùng bình thường theo chuẩn WHO. Tiếp tục duy trì chế độ dinh dưỡng hiện tại.'};
  return {label:'Trên +2SD (thừa cân/cao)', cls:'st-high', advice:'Bé đang trên ngưỡng +2SD. Với cân nặng, mẹ nên kiểm soát chế độ ăn. Tham khảo bác sĩ nếu lo lắng.'};
}

function calcWHO() {
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const age = parseInt(document.getElementById('age').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const heightVal = parseFloat(document.getElementById('height').value);

  if (isNaN(age) || isNaN(weight) || age < 0 || age > 24) {
    alert('Mẹ vui lòng nhập tuổi (0–24 tháng) và cân nặng hợp lệ nhé!');
    return;
  }

  const data = WHO[gender];
  const wRef = interpolate(data.w, age);
  const hRef = data.h[getClosestAge(age)];
  const wStatus = getStatus(weight, wRef);
  const nextAge = Math.min(age + 1, 24);
  const wNext = interpolate(data.w, nextAge);
  const diff = (wNext[1] - wRef[1]).toFixed(2);

  let html = `
    <div style="margin-bottom:.75rem">
      <span class="status-badge ${wStatus.cls}">${wStatus.label}</span>
    </div>
    <div class="result-grid">
      <div class="stat-card">
        <div class="stat-val" style="color:#ec4899">${weight} kg</div>
        <div class="stat-label">Cân nặng hiện tại</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color:#8b5cf6">${wRef[1].toFixed(1)} kg</div>
        <div class="stat-label">Trung bình WHO (${age} tháng)</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color:#6b7280;font-size:1.1rem">${wRef[0].toFixed(1)}–${wRef[2].toFixed(1)}</div>
        <div class="stat-label">Vùng bình thường (kg)</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color:#059669;font-size:1.1rem">${((weight/wRef[1])*100).toFixed(0)}%</div>
        <div class="stat-label">So với trung bình</div>
      </div>
    </div>`;

  if (!isNaN(heightVal)) {
    const hStatus = getStatus(heightVal, hRef);
    html += `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.75rem;margin-bottom:.75rem;font-size:.875rem">
      <b>Chiều cao ${heightVal} cm:</b> ${hStatus.label} (chuẩn: ${hRef[0]}–${hRef[2]} cm, TB: ${hRef[1]} cm)
    </div>`;
  }

  html += `<p class="advice">💡 ${wStatus.advice}</p>`;
  html += `<div class="next-month">📅 <b>Tháng sau (${nextAge} tháng):</b> Bé cần đạt khoảng <b>${wNext[1].toFixed(1)} kg</b> (+${diff} kg so với hiện tại theo chuẩn WHO)</div>`;

  // Chart
  html += `<div class="chart-wrap"><canvas id="whoChart" role="img" aria-label="Biểu đồ tăng trưởng WHO">Biểu đồ cân nặng theo chuẩn WHO</canvas></div>`;

  document.getElementById('result-inner').innerHTML = html;
  document.getElementById('result').style.display = 'block';

  const ages = [0,1,2,3,4,5,6,7,8,9,10,11,12];
  const medians = ages.map(a => interpolate(data.w, a)[1]);
  const low = ages.map(a => interpolate(data.w, a)[0]);
  const high = ages.map(a => interpolate(data.w, a)[2]);

  if (chartInst) chartInst.destroy();
  chartInst = new Chart(document.getElementById('whoChart'), {
    type: 'line',
    data: {
      labels: ages.map(a => a + 'th'),
      datasets: [
        {label:'+2SD',data:high,borderColor:'#fca5a5',borderWidth:1,borderDash:[4,3],pointRadius:0,fill:false},
        {label:'Trung bình',data:medians,borderColor:'#10b981',borderWidth:2,pointRadius:0,fill:false},
        {label:'-2SD',data:low,borderColor:'#fca5a5',borderWidth:1,borderDash:[4,3],pointRadius:0,fill:false},
        {label:'Bé của mẹ',data:ages.map(a=>a===age?weight:null),borderColor:'#ec4899',borderWidth:0,
          pointRadius:ages.map(a=>a===age?8:0),pointBackgroundColor:'#ec4899',showLine:false}
      ]
    },
    options: {
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{font:{size:11}},grid:{color:'#f3f4f6'}},
        y:{ticks:{font:{size:11}},grid:{color:'#f3f4f6'},title:{display:true,text:'kg',font:{size:11}}}
      }
    }
  });

  document.getElementById('result').scrollIntoView({behavior:'smooth',block:'nearest'});
}
</script>

---
*Số liệu dựa trên Bảng chuẩn tăng trưởng WHO 2006. Công cụ chỉ mang tính tham khảo, không thay thế khám dinh dưỡng chuyên nghiệp.*
