---
title: "Tính cân nặng thai nhi theo tuần"
description: "Ước tính cân nặng thai nhi dựa trên tuần thai. So sánh với chuẩn WHO để biết bé đang phát triển thế nào."
faq:
  - question: "Công cụ này có thay thế siêu âm không?"
    answer: "Không. Đây chỉ là công cụ tham khảo để mẹ hình dung cân nặng ước tính, còn chẩn đoán thật vẫn cần bác sĩ và máy siêu âm."
  - question: "Nên dùng từ tuần bao nhiêu?"
    answer: "Trang phù hợp nhất từ tuần 14 đến 42, tức giai đoạn giữa và cuối thai kỳ."
  - question: "Nếu bé nhẹ cân hơn chuẩn thì sao?"
    answer: "Mẹ không nên tự lo quá sớm. Hãy theo dõi các lần siêu âm tiếp theo, ăn uống đúng hướng dẫn và hỏi bác sĩ nếu chỉ số vẫn thấp nhiều."
tags: ["cong-cu", "thai-nhi", "can-nang", "sieu-am"]
---

<div id="fetal-weight-app">
<style>
#fetal-weight-app{font-family:inherit;max-width:680px;margin:0 auto}
#fetal-weight-app .tool-card{background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:1.5rem;margin-bottom:1rem}
#fetal-weight-app .tool-label{font-size:.8rem;font-weight:600;color:#374151;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
#fetal-weight-app .tool-input{width:100%;padding:.6rem .8rem;border:1.5px solid #d1d5db;border-radius:8px;font-size:1rem;box-sizing:border-box;outline:none;transition:border .15s}
#fetal-weight-app .tool-input:focus{border-color:#ec4899}
#fetal-weight-app .btn-calc{width:100%;padding:.75rem;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:4px;transition:opacity .2s}
#fetal-weight-app .btn-calc:hover{opacity:.9}
#fetal-weight-app .result-box{display:none;margin-top:1rem}
#fetal-weight-app .stat-card{background:#fff;border-radius:8px;padding:.9rem;text-align:center;border:1px solid #e5e7eb}
#fetal-weight-app .stat-val{font-size:1.8rem;font-weight:700;margin:0}
#fetal-weight-app .stat-label{font-size:.75rem;color:#6b7280;margin:4px 0 0}
#fetal-weight-app .status-badge{display:inline-block;padding:.3rem .9rem;border-radius:20px;font-size:.85rem;font-weight:600;margin-bottom:.75rem}
#fetal-weight-app .st-normal{background:#dcfce7;color:#166534}
#fetal-weight-app .st-watch{background:#fef9c3;color:#854d0e}
#fetal-weight-app .st-low{background:#fee2e2;color:#991b1b}
#fetal-weight-app .advice{font-size:.875rem;color:#374151;line-height:1.6;margin:.75rem 0 0;background:#f9fafb;border-radius:8px;padding:.75rem 1rem}
#fetal-weight-app .range-bar{height:8px;border-radius:4px;background:#e5e7eb;margin:.5rem 0;position:relative}
#fetal-weight-app .range-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#fca5a5,#86efac,#86efac,#fca5a5);position:relative}
#fetal-weight-app .range-marker{position:absolute;top:-4px;width:14px;height:14px;border-radius:50%;background:#ec4899;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transform:translateX(-50%)}
</style>

<div class="tool-card">
  <label class="tool-label">Tuần thai</label>
  <input type="number" id="fetal-week" class="tool-input" min="14" max="42" value="28" placeholder="Nhập tuần thai (14-42)">
  <p style="font-size:.75rem;color:#6b7280;margin:4px 0 0">Nhập tuần thai từ 14 đến 42 tuần. Dành cho tam cá nguyệt 2 và 3.</p>
  <button class="btn-calc" onclick="calcFetalWeight()">Tính cân nặng ước tính</button>
</div>

<div id="fetal-result" class="result-box">
  <div class="stat-card">
    <p class="stat-val" id="fw-val">--</p>
    <p class="stat-label">Cân nặng ước tính</p>
  </div>
  <div class="range-bar">
    <div class="range-fill" id="fw-bar" style="width:100%"></div>
    <div class="range-marker" id="fw-marker" style="left:50%"></div>
  </div>
  <p style="font-size:.75rem;color:#6b7280;text-align:center;margin:4px 0">
    <span>Nhẹ cân</span>
    <span style="margin:0 20%">Bình thường</span>
    <span>Nặng cân</span>
  </p>
  <div class="advice" id="fw-advice"></div>
</div>
</div>

<script>
const WHO_FETAL_WEIGHT = {
  14: {p10:25,p50:45,p90:70},
  15: {p10:40,p50:70,p90:100},
  16: {p10:60,p50:100,p90:150},
  17: {p10:90,p50:140,p90:200},
  18: {p10:130,p50:190,p90:260},
  19: {p10:170,p50:240,p90:330},
  20: {p10:220,p50:300,p90:400},
  21: {p10:280,p50:360,p90:480},
  22: {p10:340,p50:430,p90:560},
  23: {p10:410,p50:500,p90:650},
  24: {p10:480,p50:600,p90:760},
  25: {p10:560,p50:680,p90:860},
  26: {p10:640,p50:760,p90:950},
  27: {p10:730,p50:870,p90:1080},
  28: {p10:820,p50:1000,p90:1250},
  29: {p10:940,p50:1150,p90:1400},
  30: {p10:1070,p50:1300,p90:1600},
  31: {p10:1200,p50:1500,p90:1800},
  32: {p10:1350,p50:1700,p90:2050},
  33: {p10:1520,p50:1900,p90:2300},
  34: {p10:1700,p50:2150,p90:2600},
  35: {p10:1900,p50:2400,p90:2850},
  36: {p10:2100,p50:2600,p90:3100},
  37: {p10:2300,p50:2800,p90:3350},
  38: {p10:2500,p50:3000,p90:3550},
  39: {p10:2650,p50:3150,p90:3750},
  40: {p10:2800,p50:3300,p90:3900},
  41: {p10:2950,p50:3450,p90:4050},
  42: {p10:3100,p50:3600,p90:4200}
};

function calcFetalWeight(){
  var w = parseInt(document.getElementById('fetal-week').value);
  if(w<14||w>42){alert('Vui lòng nhập tuần thai từ 14 đến 42');return;}
  var d = WHO_FETAL_WEIGHT[w];
  if(!d){alert('Không có dữ liệu cho tuần thai này');return;}
  
  var grams = d.p50;
  var kg = (grams/1000).toFixed(1);
  var display = kg + ' kg';
  if(grams>=1000) display = kg + ' kg (' + grams + 'g)';
  else display = grams + ' gram';
  
  document.getElementById('fw-val').innerText = display;
  
  var pct = ((grams - d.p10) / (d.p90 - d.p10) * 100);
  pct = Math.max(0, Math.min(100, pct));
  document.getElementById('fw-marker').style.left = pct + '%';
  
  var status,advice,color;
  if(grams < d.p10){
    status='<span class="status-badge st-low">Nhẹ cân</span>';
    advice='⚠️ Bé đang ở dưới percentile 10. Đừng quá lo lắng — nhiều bé sinh ra nhỏ nhưng hoàn toàn khỏe mạnh. Mẹ nên:<br>• Tăng cường dinh dưỡng: ăn thêm thịt, cá, trứng, sữa<br>• Nghỉ ngơi đầy đủ, tránh stress<br>• Hỏi bác sĩ về việc theo dõi thêm';
  }else if(grams > d.p90){
    status='<span class="status-badge st-watch">Trên trung bình</span>';
    advice='📊 Bé đang ở trên percentile 90. Bé có thể hơi lớn so với tuổi thai, nhưng đây không phải là vấn đề đáng lo nếu mẹ không bị tiểu đường thai kỳ. Mẹ nên:<br>• Kiểm tra đường huyết định kỳ<br>• Hạn chế đồ ngọt, tinh bột nhanh<br>• Tiếp tục vận động nhẹ nhàng<br>• Bác sĩ sẽ theo dõi thêm qua siêu âm';
  }else{
    status='<span class="status-badge st-normal">Bình thường</span>';
    advice='✅ Bé đang phát triển trong khoảng bình thường. Mẹ tiếp tục duy trì chế độ dinh dưỡng và nghỉ ngơi hợp lý. Siêu âm định kỳ sẽ giúp theo dõi sát hơn.';
  }
  
  document.getElementById('fw-advice').innerHTML = status + '<br>' + advice;
  document.getElementById('fetal-result').style.display = 'block';
  document.getElementById('fetal-result').scrollIntoView({behavior:'smooth'});
}
</script>

<div class="tool-card">
  <h3 style="margin:0 0 .75rem;font-size:.95rem;color:#111">Mẹ nên mở tiếp</h3>
  <ul style="margin:0;padding-left:1.2rem;color:#374151;line-height:1.7">
    <li><a href="/cong-cu/tinh-ngay-du-sinh/">Tính ngày dự sinh</a> để biết chính xác mốc tuần thai.</li>
    <li><a href="/posts/pregnancy-month-6-nutrition-exercise/">Mẹ bầu tháng 6</a> để xem dinh dưỡng và vận động phù hợp.</li>
    <li><a href="/cong-cu/tang-truong-who/">Kiểm tra tăng trưởng chuẩn WHO</a> nếu mẹ đã sinh và muốn theo dõi bé sau này.</li>
  </ul>
</div>

{{< faq title="Câu hỏi thường gặp về cân nặng thai nhi" >}}
