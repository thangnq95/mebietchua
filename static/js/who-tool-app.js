(function () {
  var STORAGE_KEY = "mebietchua.who.profile.v1";
  var LEGACY_KEY = "who-profile-v1";
  var SUPABASE_CONFIG = window.MBC_SUPABASE_CONFIG || {};
  var SUPABASE_CLIENT = null;

  var WHO = {
    boy: {
      w: [[0, 2.5, 3.3, 4.4], [1, 3.4, 4.5, 5.8], [2, 4.3, 5.6, 7.1], [3, 5.0, 6.4, 8.0], [4, 5.6, 7.0, 8.7], [5, 6.0, 7.5, 9.3], [6, 6.4, 7.9, 9.8], [7, 6.7, 8.3, 10.3], [8, 6.9, 8.6, 10.7], [9, 7.1, 8.9, 11.0], [10, 7.4, 9.2, 11.4], [11, 7.6, 9.4, 11.7], [12, 7.7, 9.6, 12.0], [15, 8.3, 10.3, 12.8], [18, 8.8, 10.9, 13.7], [21, 9.2, 11.5, 14.5], [24, 9.7, 12.2, 15.3]],
      h: [[0, 46.1, 49.9, 53.7], [1, 50.8, 54.7, 58.6], [2, 54.4, 58.4, 62.4], [3, 57.3, 61.4, 65.5], [4, 59.7, 63.9, 68.0], [5, 61.7, 65.9, 70.1], [6, 63.3, 67.6, 71.9], [7, 64.8, 69.2, 73.5], [8, 66.2, 70.6, 75.0], [9, 67.5, 72.0, 76.5], [10, 68.7, 73.3, 77.9], [11, 69.9, 74.5, 79.2], [12, 71.0, 75.7, 80.5], [15, 74.1, 79.1, 84.2], [18, 76.9, 82.3, 87.7], [21, 79.4, 85.1, 90.0], [24, 81.0, 87.1, 93.2]]
    },
    girl: {
      w: [[0, 2.4, 3.2, 4.2], [1, 3.2, 4.2, 5.5], [2, 3.9, 5.1, 6.6], [3, 4.5, 5.8, 7.5], [4, 5.0, 6.4, 8.2], [5, 5.4, 6.9, 8.8], [6, 5.7, 7.3, 9.3], [7, 6.0, 7.6, 9.8], [8, 6.3, 7.9, 10.2], [9, 6.5, 8.2, 10.5], [10, 6.7, 8.5, 10.9], [11, 6.9, 8.7, 11.2], [12, 6.9, 8.7, 11.2], [15, 7.6, 9.6, 12.4], [18, 8.1, 10.2, 13.2], [21, 8.6, 10.9, 14.0], [24, 9.0, 11.5, 14.8]],
      h: [[0, 45.4, 49.1, 52.9], [1, 49.8, 53.7, 57.6], [2, 53.0, 57.1, 61.1], [3, 55.6, 59.8, 64.0], [4, 57.8, 62.1, 66.4], [5, 59.6, 64.0, 68.5], [6, 61.2, 65.7, 70.3], [7, 62.7, 67.3, 71.9], [8, 64.0, 68.7, 73.5], [9, 65.3, 70.1, 75.0], [10, 66.5, 71.5, 76.4], [11, 67.7, 72.8, 77.8], [12, 68.9, 74.0, 79.2], [15, 72.0, 77.5, 83.0], [18, 74.9, 80.7, 86.5], [21, 77.5, 83.7, 89.8], [24, 80.0, 86.4, 92.9]]
    }
  };

  var LABELS = ["Sơ sinh", "1th", "2th", "3th", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "15th", "18th", "21th", "24th"];
  var AGES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 21, 24];
  var DEFAULT_STATE = {
    profileName: "",
    email: "",
    children: [],
    activeChildId: "",
    editingChildId: "",
    draft: {
      age: "",
      weight: "",
      height: "",
      gender: "boy",
      chartType: "",
      tableType: ""
    }
  };

  var state = {
    profile: clone(DEFAULT_STATE),
    source: "guest",
    session: null,
    user: null,
    children: [],
    activeChildId: "",
    editingChildId: "",
    currentDraft: clone(DEFAULT_STATE.draft),
    hasRemote: false,
    syncing: false,
    chartInst: null,
    lastAge: null,
    lastGender: "boy",
    lastWeight: null,
    lastHeight: null
  };

  var ui = {};

  function cleanConfigValue(value) {
    var str = String(value || "").trim();
    if (!str || str === '""' || str === "''") return "";
    if ((str[0] === '"' && str[str.length - 1] === '"') || (str[0] === "'" && str[str.length - 1] === "'")) {
      str = str.slice(1, -1).trim();
    }
    if (!str || str === '""' || str === "''") return "";
    return str;
  }

  function getSupabaseConfig() {
    return {
      url: cleanConfigValue(SUPABASE_CONFIG.url),
      anonKey: cleanConfigValue(SUPABASE_CONFIG.anonKey)
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "mbc-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function safeParse(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function startOfDay(value) {
    var date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function formatDateVN(date) {
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function formatAgeText(info) {
    if (!info) return "";
    return info.totalMonths + " tháng " + info.days + " ngày";
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getAgeFromDob(dobValue, todayValue) {
    if (!dobValue) return null;
    var birth = startOfDay(dobValue);
    var today = todayValue ? startOfDay(todayValue) : startOfDay(new Date());
    if (today < birth) return null;

    var years = today.getFullYear() - birth.getFullYear();
    var months = today.getMonth() - birth.getMonth();
    var days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      var prevMonth = today.getMonth() - 1;
      var prevYear = today.getFullYear();
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear -= 1;
      }
      days += daysInMonth(prevYear, prevMonth);
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return {
      years: years,
      months: months,
      days: days,
      totalMonths: years * 12 + months,
      totalDays: Math.floor((today - birth) / 86400000),
      label: formatAgeText({
        totalMonths: years * 12 + months,
        days: days
      }),
      birthDate: birth
    };
  }

  function interp(data, age) {
    var idx = AGES.findIndex(function (k) { return k >= age; });
    if (idx <= 0) return data[0];
    if (idx === -1) return data[data.length - 1];
    var t = (age - AGES[idx - 1]) / (AGES[idx] - AGES[idx - 1]);
    return data[idx - 1].map(function (v, i) {
      return i === 0 ? null : v + (data[idx][i] - v) * t;
    });
  }

  function getStatus(val, ref) {
    if (val < ref[1]) {
      return { label: "Dưới −2SD ⚠️", cls: "st-low", adv: "Bé đang dưới ngưỡng −2SD. Mẹ nên đưa bé đi khám dinh dưỡng để được tư vấn kịp thời." };
    }
    if (val < ref[2]) {
      return { label: "Dưới trung bình (bình thường)", cls: "st-watch", adv: "Bé trong vùng bình thường nhưng dưới mức trung bình. Tiếp tục theo dõi và đảm bảo dinh dưỡng đầy đủ." };
    }
    if (val <= ref[3]) {
      return { label: "Bình thường ✓", cls: "st-normal", adv: "Tuyệt vời! Bé đang phát triển trong vùng bình thường theo chuẩn WHO. Tiếp tục duy trì chế độ dinh dưỡng hiện tại." };
    }
    return { label: "Trên +2SD", cls: "st-high", adv: "Bé đang trên +2SD. Với cân nặng mẹ nên kiểm soát khẩu phần ăn. Tham khảo bác sĩ nếu lo lắng." };
  }

  function calcPercentileT(val, ref) {
    var range = ref[3] - ref[1];
    if (range === 0) return 0.5;
    return (val - ref[1]) / range;
  }

  function buildPrediction(data, age, babyVal) {
    var ref = interp(data, age);
    var t = calcPercentileT(babyVal, ref);
    return AGES.map(function (a) {
      if (a < age) return null;
      var r = interp(data, a);
      return parseFloat((r[1] + t * (r[3] - r[1])).toFixed(2));
    });
  }

  function getGuestState() {
    var raw = safeParse(localStorage.getItem(STORAGE_KEY), null);
    if (raw) return raw;
    var legacy = safeParse(localStorage.getItem(LEGACY_KEY), null);
    if (legacy) return legacy;
    return clone(DEFAULT_STATE);
  }

  function normalizeState(raw) {
    var next = clone(DEFAULT_STATE);
    if (!raw || typeof raw !== "object") return next;

    if (raw.profileName) next.profileName = String(raw.profileName);
    if (raw.email) next.email = String(raw.email);
    if (Array.isArray(raw.children)) {
      next.children = raw.children.map(function (child) {
        return {
          id: child.id || uid(),
          name: child.name ? String(child.name) : "",
          dob: child.dob ? String(child.dob) : "",
          gender: child.gender === "girl" ? "girl" : "boy",
          active: Boolean(child.active)
        };
      }).filter(function (child) {
        return child.name && child.dob;
      });
    }
    if (raw.activeChildId) next.activeChildId = String(raw.activeChildId);
    if (raw.editingChildId) next.editingChildId = String(raw.editingChildId);
    if (raw.draft && typeof raw.draft === "object") {
      next.draft = {
        age: raw.draft.age || "",
        weight: raw.draft.weight || "",
        height: raw.draft.height || "",
        gender: raw.draft.gender === "girl" ? "girl" : "boy",
        chartType: raw.draft.chartType || "",
        tableType: raw.draft.tableType || ""
      };
    }
    if (!next.children.length) {
      next.activeChildId = "";
    } else if (!next.activeChildId || !next.children.some(function (child) { return child.id === next.activeChildId; })) {
      next.activeChildId = next.children.find(function (child) { return child.active; })?.id || next.children[0].id;
    }
    next.children = next.children.map(function (child) {
      return {
        id: child.id,
        name: child.name,
        dob: child.dob,
        gender: child.gender,
        active: child.id === next.activeChildId
      };
    });
    return next;
  }

  function saveGuestState() {
    var payload = {
      profileName: state.profile.profileName || "",
      email: state.profile.email || "",
      children: state.children.map(function (child) {
        return {
          id: child.id,
          name: child.name,
          dob: child.dob,
          gender: child.gender,
          active: child.id === state.activeChildId
        };
      }),
      activeChildId: state.activeChildId || "",
      editingChildId: state.editingChildId || "",
      draft: clone(state.currentDraft)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function setStateFromPayload(payload, source) {
    var normalized = normalizeState(payload);
    state.profile = normalized;
    state.children = normalized.children;
    state.activeChildId = normalized.activeChildId;
    state.editingChildId = normalized.editingChildId;
    state.currentDraft = normalized.draft;
    state.source = source || "guest";
    syncMainDraftToForm();
    renderAll();
  }

  function getActiveChild() {
    if (!state.children.length) return null;
    var active = state.children.find(function (child) { return child.id === state.activeChildId; });
    if (active) return active;
    active = state.children.find(function (child) { return child.active; });
    if (active) return active;
    return state.children[0];
  }

  function renderAuthState() {
    if (!ui.authNote) return;
    var config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      ui.authNote.textContent = "Supabase chưa được cấu hình. Hiện tại hồ sơ chỉ lưu trên trình duyệt này.";
      if (ui.googleBtn) ui.googleBtn.style.display = "none";
      if (ui.logoutBtn) ui.logoutBtn.style.display = "none";
      if (ui.remoteHint) ui.remoteHint.textContent = "Chế độ khách";
      return;
    }

    if (!state.user) {
      ui.authNote.textContent = "Chưa đăng nhập. Dữ liệu sẽ lưu trên trình duyệt hiện tại cho đến khi mẹ đăng nhập Google.";
      if (ui.googleBtn) ui.googleBtn.style.display = "inline-flex";
      if (ui.logoutBtn) ui.logoutBtn.style.display = "none";
      if (ui.remoteHint) ui.remoteHint.textContent = "Chế độ khách";
      return;
    }

    ui.authNote.textContent = "Đã đăng nhập bằng Google. Hồ sơ sẽ đồng bộ giữa các thiết bị.";
    if (ui.googleBtn) ui.googleBtn.style.display = "none";
    if (ui.logoutBtn) ui.logoutBtn.style.display = "inline-flex";
    if (ui.remoteHint) ui.remoteHint.textContent = state.user.email || "Đã đăng nhập";
  }

  function renderChildList() {
    if (!ui.childList) return;
    if (!state.children.length) {
      ui.childList.innerHTML = '<div class="who-empty">Chưa có hồ sơ bé nào. Mẹ nhập tên và ngày sinh ở bên dưới để tạo hồ sơ đầu tiên.</div>';
      return;
    }

    var html = state.children.map(function (child) {
      var age = getAgeFromDob(child.dob);
      var activeClass = child.id === state.activeChildId ? "who-child-item active" : "who-child-item";
      var summary = age ? formatAgeText(age) + " · sinh " + formatDateVN(age.birthDate) : "Chưa có ngày sinh";
      return [
        '<div class="' + activeClass + '" data-child-id="' + child.id + '">',
        '  <div class="who-child-main">',
        '    <div class="who-child-name">' + escapeHtml(child.name) + '</div>',
        '    <div class="who-child-meta">' + escapeHtml(summary) + '</div>',
        '  </div>',
        '  <div class="who-child-actions">',
        '    <button type="button" class="who-mini-btn" data-child-action="select" data-child-id="' + child.id + '">Dùng</button>',
        '    <button type="button" class="who-mini-btn" data-child-action="edit" data-child-id="' + child.id + '">Sửa</button>',
        '    <button type="button" class="who-mini-btn who-danger" data-child-action="delete" data-child-id="' + child.id + '">Xóa</button>',
        '  </div>',
        child.id === state.activeChildId ? '  <span class="who-active-badge">Đang dùng</span>' : '',
        '</div>'
      ].join("");
    }).join("");

    ui.childList.innerHTML = html;
  }

  function renderProfileForm() {
    if (!ui.childForm) return;
    var child = state.editingChildId
      ? state.children.find(function (item) { return item.id === state.editingChildId; })
      : getActiveChild();

    if (child) {
      ui.childName.value = child.name || "";
      ui.childDob.value = child.dob || "";
      setGenderValue(child.gender || "boy");
      ui.formTitle.textContent = state.editingChildId ? "Sửa hồ sơ bé" : "Thêm bé khác";
      ui.formHint.textContent = child.id === state.activeChildId ? "Đây là bé đang được chọn. Lưu xong hệ thống sẽ cập nhật tuổi tự động." : "Mẹ có thể lưu một bé khác rồi chuyển bé đang dùng sau.";
      ui.saveChild.textContent = state.editingChildId ? "Cập nhật hồ sơ" : "Lưu hồ sơ bé";
    } else {
      ui.childName.value = "";
      ui.childDob.value = "";
      setGenderValue("boy");
      ui.formTitle.textContent = "Thêm bé mới";
      ui.formHint.textContent = "Tạo hồ sơ riêng cho từng bé để dễ chuyển đổi.";
      ui.saveChild.textContent = "Lưu hồ sơ bé";
    }

    var age = child ? getAgeFromDob(child.dob) : null;
    if (ui.childAgePreview) {
      if (age) {
        ui.childAgePreview.innerHTML = "Bé này hiện <b>" + escapeHtml(formatAgeText(age)) + "</b> (" + escapeHtml(formatDateVN(age.birthDate)) + ").";
      } else {
        ui.childAgePreview.textContent = "Nhập ngày sinh để hệ thống tự tính tháng tuổi.";
      }
    }
  }

  function renderMainForm() {
    var activeChild = getActiveChild();
    if (ui.genderInputs && ui.genderInputs.length) {
      var gender = activeChild ? activeChild.gender : state.currentDraft.gender;
      setGenderValue(gender || "boy");
    }

    if (ui.ageInput) {
      if (activeChild && activeChild.dob) {
        var age = getAgeFromDob(activeChild.dob);
        if (age) {
          ui.ageInput.value = age.totalMonths;
          ui.ageInput.readOnly = true;
          ui.ageInput.setAttribute("aria-readonly", "true");
          ui.ageInput.title = "Tự tính từ ngày sinh của hồ sơ bé đang được chọn";
          if (ui.ageHelper) {
            ui.ageHelper.innerHTML = "Đang dùng hồ sơ <b>" + escapeHtml(activeChild.name) + "</b> - " + escapeHtml(formatAgeText(age)) + ". Mẹ có thể đổi bé ở khung hồ sơ phía trên.";
          }
        }
      } else {
        if (!ui.ageInput.value) {
          ui.ageInput.value = state.currentDraft.age || "";
        }
        ui.ageInput.readOnly = false;
        ui.ageInput.removeAttribute("aria-readonly");
        ui.ageInput.title = "Nhập tay nếu chưa lưu hồ sơ bé";
        if (ui.ageHelper) {
          ui.ageHelper.textContent = "Chưa có bé đang dùng. Mẹ nhập tuổi thủ công hoặc thêm bé mới ở khung hồ sơ phía trên.";
        }
      }
    }

    if (ui.weightInput && !ui.weightInput.value && state.currentDraft.weight) {
      ui.weightInput.value = state.currentDraft.weight;
    }
    if (ui.heightInput && !ui.heightInput.value && state.currentDraft.height) {
      ui.heightInput.value = state.currentDraft.height;
    }
  }

  function renderSessionBar() {
    if (!ui.sessionBar) return;
    var config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      ui.sessionBar.innerHTML = '<span class="who-session-pill">Chế độ khách</span><span class="who-session-text">Chưa có Supabase config nên dữ liệu chỉ lưu trên thiết bị này.</span>';
      return;
    }
    if (!state.user) {
      ui.sessionBar.innerHTML = '<span class="who-session-pill guest">Chỉ lưu trên máy này</span><span class="who-session-text">Đăng nhập Google để đồng bộ hồ sơ bé giữa các máy.</span>';
      return;
    }
    var avatar = state.user.user_metadata && state.user.user_metadata.avatar_url ? '<img class="who-avatar" src="' + escapeAttr(state.user.user_metadata.avatar_url) + '" alt="avatar">' : '<span class="who-avatar-fallback">' + escapeHtml((state.user.email || "MB").slice(0, 2).toUpperCase()) + '</span>';
    ui.sessionBar.innerHTML = [
      '<div class="who-session-user">',
      avatar,
      '<div>',
      '<div class="who-session-name">' + escapeHtml(state.user.user_metadata && state.user.user_metadata.full_name ? state.user.user_metadata.full_name : (state.user.email || "Đã đăng nhập")) + '</div>',
      '<div class="who-session-email">' + escapeHtml(state.user.email || "") + '</div>',
      '</div>',
      '</div>',
      '<span class="who-session-pill remote">Đồng bộ đám mây</span>'
    ].join("");
  }

  function renderAll() {
    renderAuthState();
    renderSessionBar();
    renderChildList();
    renderProfileForm();
    renderMainForm();
    syncDraftInputs();
  }

  function syncDraftInputs() {
    if (ui.ageInput && !ui.ageInput.readOnly && state.currentDraft.age && !ui.ageInput.value) {
      ui.ageInput.value = state.currentDraft.age;
    }
    if (ui.weightInput && state.currentDraft.weight && !ui.weightInput.value) {
      ui.weightInput.value = state.currentDraft.weight;
    }
    if (ui.heightInput && state.currentDraft.height && !ui.heightInput.value) {
      ui.heightInput.value = state.currentDraft.height;
    }
  }

  function setGenderValue(value) {
    var gender = value === "girl" ? "girl" : "boy";
    if (ui.genderInputs && ui.genderInputs.length) {
      ui.genderInputs.forEach(function (input) {
        input.checked = input.value === gender;
      });
    }
    state.currentDraft.gender = gender;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[ch];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function openEditChild(childId) {
    var child = state.children.find(function (item) { return item.id === childId; });
    if (!child) return;
    state.editingChildId = child.id;
    renderProfileForm();
  }

  function resetProfileForm() {
    state.editingChildId = "";
    if (ui.childForm) ui.childForm.reset();
    setGenderValue("boy");
    renderProfileForm();
  }

  function removeChild(childId) {
    var child = state.children.find(function (item) { return item.id === childId; });
    if (!child) return;
    if (!window.confirm("Xóa hồ sơ của " + child.name + " khỏi danh sách?")) return;
    state.children = state.children.filter(function (item) { return item.id !== childId; });
    if (state.activeChildId === childId) {
      state.activeChildId = state.children.length ? state.children[0].id : "";
      state.children = state.children.map(function (item, index) {
        return {
          id: item.id,
          name: item.name,
          dob: item.dob,
          gender: item.gender,
          active: index === 0
        };
      });
    }
    if (state.editingChildId === childId) state.editingChildId = "";
    persistAll();
    renderAll();
    queueRemoteSync();
  }

  function selectChild(childId) {
    var child = state.children.find(function (item) { return item.id === childId; });
    if (!child) return;
    state.activeChildId = childId;
    state.children = state.children.map(function (item) {
      return {
        id: item.id,
        name: item.name,
        dob: item.dob,
        gender: item.gender,
        active: item.id === childId
      };
    });
    if (state.editingChildId === childId) state.editingChildId = "";
    persistAll();
    renderAll();
    queueRemoteSync();
  }

  function onChildFormSubmit(event) {
    event.preventDefault();
    var name = ui.childName.value.trim();
    var dob = ui.childDob.value;
    var gender = getGenderValue();
    if (!name || !dob) {
      alert("Mẹ vui lòng nhập tên và ngày sinh của bé nhé!");
      return;
    }

    var existing = state.editingChildId ? state.children.find(function (item) { return item.id === state.editingChildId; }) : null;
    var child = existing ? {
      id: existing.id,
      name: name,
      dob: dob,
      gender: gender,
      active: true
    } : {
      id: uid(),
      name: name,
      dob: dob,
      gender: gender,
      active: true
    };

    if (existing) {
      state.children = state.children.map(function (item) {
        if (item.id !== existing.id) return { id: item.id, name: item.name, dob: item.dob, gender: item.gender, active: false };
        return child;
      });
    } else {
      state.children = state.children.map(function (item) {
        return { id: item.id, name: item.name, dob: item.dob, gender: item.gender, active: false };
      });
      state.children.push(child);
    }

    state.activeChildId = child.id;
    state.editingChildId = "";
    persistAll();
    renderAll();
    queueRemoteSync();
    ui.childForm.reset();
    setGenderValue(gender);
  }

  function getGenderValue() {
    if (!ui.genderInputs) return "boy";
    var selected = ui.genderInputs.find(function (input) { return input.checked; });
    return selected ? selected.value : "boy";
  }

  function persistAll() {
    state.profile.profileName = state.profile.profileName || "";
    state.profile.email = state.profile.email || "";
    state.profile.children = state.children;
    state.profile.activeChildId = state.activeChildId;
    state.profile.editingChildId = state.editingChildId;
    state.profile.draft = clone(state.currentDraft);
    saveGuestState();
  }

  function updateDraftFromInputs() {
    state.currentDraft.age = ui.ageInput ? String(ui.ageInput.value || "") : "";
    state.currentDraft.weight = ui.weightInput ? String(ui.weightInput.value || "") : "";
    state.currentDraft.height = ui.heightInput ? String(ui.heightInput.value || "") : "";
    state.currentDraft.gender = getGenderValue();
    persistAll();
  }

  function calcWHO() {
    var gender = getGenderValue();
    var age = parseInt(ui.ageInput.value, 10);
    var weight = parseFloat(ui.weightInput.value);
    var hv = parseFloat(ui.heightInput.value);

    if (isNaN(age) || isNaN(weight) || age < 0 || age > 24) {
      alert("Mẹ vui lòng nhập tuổi (0–24 tháng) và cân nặng hợp lệ nhé!");
      return;
    }

    state.lastAge = age;
    state.lastGender = gender;
    state.lastWeight = weight;
    state.lastHeight = isNaN(hv) ? null : hv;
    state.currentDraft.age = String(age);
    state.currentDraft.weight = String(weight);
    state.currentDraft.height = isNaN(hv) ? "" : String(hv);
    state.currentDraft.gender = gender;
    persistAll();

    var data = WHO[gender];
    var wRef = interp(data.w, age);
    var wStat = getStatus(weight, wRef);
    var wNext = interp(data.w, Math.min(age + 1, 24));
    var predAt24 = buildPrediction(data.w, age, weight).slice(-1)[0];

    ui.statusRow.innerHTML = '<span class="status-badge ' + wStat.cls + '">' + wStat.label + "</span>";
    ui.statsGrid.innerHTML = [
      '<div class="stat-card"><p class="stat-val" style="color:#ec4899">' + weight + ' kg</p><p class="stat-label">Cân nặng hiện tại</p></div>',
      '<div class="stat-card"><p class="stat-val" style="color:#10b981">' + wRef[2].toFixed(1) + ' kg</p><p class="stat-label">Trung bình WHO (' + age + 'th)</p></div>',
      '<div class="stat-card"><p class="stat-val" style="color:#6b7280;font-size:1.1rem">' + wRef[1].toFixed(1) + "–" + wRef[3].toFixed(1) + '</p><p class="stat-label">Vùng bình thường (kg)</p></div>',
      '<div class="stat-card"><p class="stat-val" style="color:#8b5cf6;font-size:1.1rem">' + ((weight / wRef[2]) * 100).toFixed(0) + '%</p><p class="stat-label">So với trung bình</p></div>'
    ].join("");

    var hHtml = "";
    if (state.lastHeight) {
      var hRef = interp(data.h, age);
      var hStat = getStatus(state.lastHeight, hRef);
      var hVsMedian = ((state.lastHeight / hRef[2]) * 100).toFixed(0);
      hHtml = [
        '<div style="margin-top:.75rem">',
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:.5rem">',
        '<h3 style="margin:0;font-size:.95rem;color:#111">Tiêu chuẩn chiều cao theo tuổi (WHO)</h3>',
        '<span class="status-badge ' + hStat.cls + '" style="margin-bottom:0">' + hStat.label + '</span>',
        '</div>',
        '<div class="result-grid">',
        '<div class="stat-card"><p class="stat-val" style="color:#0ea5e9">' + state.lastHeight + ' cm</p><p class="stat-label">Chiều cao hiện tại</p></div>',
        '<div class="stat-card"><p class="stat-val" style="color:#10b981">' + hRef[2].toFixed(1) + ' cm</p><p class="stat-label">Trung bình WHO (' + age + 'th)</p></div>',
        '<div class="stat-card"><p class="stat-val" style="color:#6b7280;font-size:1.1rem">' + hRef[1].toFixed(1) + "–" + hRef[3].toFixed(1) + '</p><p class="stat-label">Vùng tham khảo (cm)</p></div>',
        '<div class="stat-card"><p class="stat-val" style="color:#8b5cf6;font-size:1.1rem">' + hVsMedian + '%</p><p class="stat-label">So với trung bình</p></div>',
        '</div>',
        '<div class="advice" style="background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a">WHO dùng chuẩn chiều dài/chiều cao theo tuổi: dưới −2SD là thấp hơn chuẩn, từ −2SD đến +2SD là vùng tham khảo bình thường, trên +2SD là cao hơn trung bình.</div>',
        '</div>'
      ].join("");
    }

    ui.heightResult.innerHTML = hHtml;
    ui.adviceBox.innerHTML = '<div class="advice">💡 ' + wStat.adv + "</div>";
    ui.nextBox.innerHTML = '<div class="next-month">📅 <b>Tháng ' + Math.min(age + 1, 24) + ':</b> Chuẩn TB <b>' + wNext[2].toFixed(1) + ' kg</b> — bé cần tăng thêm <b>' + (wNext[2] - wRef[2]).toFixed(2) + ' kg</b></div>';
    ui.predBox.innerHTML = '<div class="prediction-box">🔮 <b>Dự đoán đến 24 tháng:</b> Nếu bé giữ nguyên vị trí phân vị hiện tại, đến 24 tháng bé sẽ đạt khoảng <b>' + predAt24 + ' kg</b> (chuẩn TB 24 tháng: ' + WHO[gender].w[16][2] + " kg)</div>";

    ui.result.style.display = "block";
    var defaultChartType = state.lastHeight ? "h" : "w";
    renderChart(defaultChartType);
    renderTable(defaultChartType);
    ui.result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  var lineLabelsPlugin = {
    id: "lineLabels",
    afterDraw: function (chart) {
      var ctx = chart.ctx;
      var meta0 = chart.getDatasetMeta(0);
      var meta1 = chart.getDatasetMeta(1);
      var meta2 = chart.getDatasetMeta(2);
      var pairs = [
        { meta: meta0, color: "#e34948", text: "+2SD" },
        { meta: meta1, color: "#10b981", text: "TB" },
        { meta: meta2, color: "#3b82f6", text: "−2SD" }
      ];
      ctx.save();
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      pairs.forEach(function (pair) {
        var pts = pair.meta.data;
        if (!pts || pts.length === 0) return;
        var last = pts[pts.length - 1];
        ctx.fillStyle = pair.color;
        ctx.fillText(pair.text, last.x + 4, last.y);
      });
      ctx.restore();
    }
  };

  function renderChart(type) {
    if (state.lastAge === null || state.lastAge === undefined) return;
    var data = WHO[state.lastGender][type];
    var babyVal = type === "w" ? state.lastWeight : state.lastHeight;
    if (!babyVal && babyVal !== 0) return;
    var isMobile = window.innerWidth < 640;

    var low = data.map(function (r) { return r[1]; });
    var med = data.map(function (r) { return r[2]; });
    var high = data.map(function (r) { return r[3]; });
    var babyPoint = AGES.map(function (a) { return a === state.lastAge ? babyVal : null; });
    var pred = buildPrediction(data, state.lastAge, babyVal);

    if (state.chartInst) state.chartInst.destroy();

    state.chartInst = new Chart(document.getElementById("whoChart"), {
      type: "line",
      plugins: [lineLabelsPlugin],
      data: {
        labels: LABELS,
        datasets: [
          { label: "+2SD", data: high, borderColor: "#e34948", borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false, tension: 0.3 },
          { label: "TB", data: med, borderColor: "#10b981", borderWidth: 2.5, pointRadius: 0, fill: false, tension: 0.3 },
          { label: "−2SD", data: low, borderColor: "#3b82f6", borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false, tension: 0.3 },
          { label: "Dự đoán", data: pred, borderColor: "#a855f7", borderWidth: 2, borderDash: [6, 3], pointRadius: AGES.map(function (a) { return a === state.lastAge ? 0 : 3; }), pointBackgroundColor: "#a855f7", fill: false, tension: 0.3, spanGaps: false },
          { label: "Con bé", data: babyPoint, borderColor: "#ec4899", borderWidth: 0, pointRadius: AGES.map(function (a) { return a === state.lastAge ? 10 : 0; }), pointBackgroundColor: "#ec4899", pointBorderColor: "#fff", pointBorderWidth: 2, showLine: false }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: isMobile ? 18 : 36 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                var unit = type === "w" ? "kg" : "cm";
                if (ctx.raw === null) return null;
                return ctx.dataset.label + ": " + Number(ctx.raw).toFixed(1) + " " + unit;
              }
            }
          }
        },
        scales: {
          x: { ticks: { font: { size: isMobile ? 9 : 10 } }, grid: { color: "#f3f4f6" } },
          y: { ticks: { font: { size: isMobile ? 9 : 10 } }, grid: { color: "#f3f4f6" }, title: { display: true, text: type === "w" ? "kg" : "cm", font: { size: isMobile ? 10 : 11 } } }
        }
      }
    });

    ui.chartTitle.textContent = type === "h" ? "Biểu đồ tăng trưởng WHO - Chiều cao" : "Biểu đồ tăng trưởng WHO - Cân nặng";
    document.getElementById("whoChart").setAttribute("aria-label", type === "h" ? "Biểu đồ chiều cao WHO 0-24 tháng" : "Biểu đồ cân nặng WHO 0-24 tháng");
    ui.tabW.classList.toggle("active", type === "w");
    ui.tabH.classList.toggle("active", type === "h");
    state.currentDraft.chartType = type;
    persistAll();
  }

  function renderTable(type) {
    var data = WHO[state.lastGender][type];
    var babyVal = type === "w" ? state.lastWeight : state.lastHeight;
    var pred = babyVal ? buildPrediction(data, state.lastAge, babyVal) : null;

    var html = '<thead><tr><th>Tháng tuổi</th><th style="color:#3b82f6">−2SD</th><th style="color:#059669">Trung bình</th><th style="color:#e34948">+2SD</th>' + (babyVal ? '<th style="color:#7c3aed">Con bé / Dự đoán</th>' : "") + '</tr></thead><tbody>';

    data.forEach(function (row, i) {
      var a = row[0];
      var isCurrent = a === state.lastAge;
      var isFuture = pred && a > state.lastAge;
      var tdCls = isCurrent ? "baby-now" : (isFuture ? "baby-pred" : "");

      var babyCell = "";
      if (babyVal || babyVal === 0) {
        if (isCurrent) {
          var st = babyVal < row[1] ? "⚠️" : (babyVal > row[3] ? "↑" : "✓");
          babyCell = '<td class="highlight">' + babyVal + " " + st + "</td>";
        } else if (isFuture && pred[i] !== null) {
          babyCell = '<td class="baby-pred">~' + pred[i] + "</td>";
        } else {
          babyCell = '<td style="color:#d1d5db">—</td>';
        }
      }

      html += '<tr><td class="' + tdCls + '" style="font-weight:' + (isCurrent ? 700 : 400) + '">' + (a === 0 ? "Sơ sinh" : a + " tháng") + '</td><td class="' + tdCls + '">' + row[1].toFixed(1) + '</td><td class="' + tdCls + '" style="font-weight:600;color:#059669">' + row[2].toFixed(1) + '</td><td class="' + tdCls + '">' + row[3].toFixed(1) + "</td>" + babyCell + "</tr>";
    });

    html += "</tbody>";
    ui.refTable.innerHTML = html;
    ui.tabTableW.classList.toggle("active", type === "w");
    ui.tabTableH.classList.toggle("active", type === "h");
    state.currentDraft.tableType = type;
    persistAll();
  }

  function switchChart(type) {
    if (state.lastAge === null || state.lastAge === undefined) {
      alert("Mẹ hãy bấm kiểm tra trước đã nhé!");
      return;
    }
    if (type === "h" && !state.lastHeight) {
      alert("Mẹ chưa nhập chiều cao của bé!");
      return;
    }
    renderChart(type);
  }

  function switchTable(type) {
    if (state.lastAge === null || state.lastAge === undefined) {
      alert("Mẹ hãy bấm kiểm tra trước đã nhé!");
      return;
    }
    if (type === "h" && !state.lastHeight) {
      alert("Mẹ chưa nhập chiều cao của bé!");
      return;
    }
    renderTable(type);
  }

  function syncMainDraftToForm() {
    if (!ui.ageInput || !ui.weightInput || !ui.heightInput) return;
    if (!ui.ageInput.readOnly && state.currentDraft.age) ui.ageInput.value = state.currentDraft.age;
    if (state.currentDraft.weight) ui.weightInput.value = state.currentDraft.weight;
    if (state.currentDraft.height) ui.heightInput.value = state.currentDraft.height;
    setGenderValue(state.currentDraft.gender || "boy");
  }

  function persistAndRenderAfterMutation() {
    persistAll();
    renderAll();
    queueRemoteSync();
  }

  function attachChildListEvents() {
    if (!ui.childList) return;
    ui.childList.addEventListener("click", function (event) {
      var target = event.target.closest("[data-child-action], [data-child-id]");
      if (!target) return;
      var action = target.getAttribute("data-child-action");
      var childId = target.getAttribute("data-child-id") || target.closest("[data-child-id]")?.getAttribute("data-child-id");
      if (!childId) return;
      if (action === "select") {
        selectChild(childId);
        return;
      }
      if (action === "edit") {
        openEditChild(childId);
        return;
      }
      if (action === "delete") {
        removeChild(childId);
        return;
      }
      if (target.classList.contains("who-child-item")) {
        selectChild(childId);
      }
    });
  }

  function attachMainFormEvents() {
    if (ui.ageInput) {
      ui.ageInput.addEventListener("input", function () {
        if (!ui.ageInput.readOnly) {
          state.currentDraft.age = String(ui.ageInput.value || "");
          persistAll();
        }
      });
    }
    if (ui.weightInput) {
      ui.weightInput.addEventListener("input", function () {
        state.currentDraft.weight = String(ui.weightInput.value || "");
        persistAll();
      });
    }
    if (ui.heightInput) {
      ui.heightInput.addEventListener("input", function () {
        state.currentDraft.height = String(ui.heightInput.value || "");
        persistAll();
      });
    }
    if (ui.genderInputs) {
      ui.genderInputs.forEach(function (input) {
        input.addEventListener("change", function () {
          state.currentDraft.gender = getGenderValue();
          persistAll();
        });
      });
    }
  }

  function mountProfilePanel() {
    var host = document.getElementById("who-profile");
    if (!host) return;

    host.innerHTML = [
      '<div class="tool-card who-profile-card">',
      '  <div class="who-profile-head">',
      '    <div>',
      '      <h2 style="margin:0 0 .25rem;font-size:1.05rem;color:#111">Hồ sơ bé & đăng nhập</h2>',
      '      <p class="who-muted" id="who-auth-note" style="margin:0">Đang khởi tạo...</p>',
      '    </div>',
      '    <div class="who-auth-actions">',
      '      <button type="button" class="who-mini-btn who-primary" id="who-google-btn">Đăng nhập bằng Google</button>',
      '      <button type="button" class="who-mini-btn" id="who-logout-btn" style="display:none">Đăng xuất</button>',
      '    </div>',
      '  </div>',
      '  <div class="who-session-bar" id="who-session-bar"></div>',
      '  <div class="who-subhead">',
      '    <div>',
      '      <div class="tool-label">Danh sách bé</div>',
      '      <p class="who-muted" style="margin:.15rem 0 0">Chọn bé đang dùng để WHO tự lấy tuổi theo ngày sinh.</p>',
      '    </div>',
      '    <span class="who-mini-badge" id="who-remote-hint">Chế độ khách</span>',
      '  </div>',
      '  <div id="who-child-list" class="who-child-list"></div>',
      '  <form id="who-child-form" class="who-child-form">',
      '    <div class="who-form-top">',
      '      <h3 id="who-form-title" style="margin:0;font-size:.95rem;color:#111">Thêm bé mới</h3>',
      '      <p id="who-form-hint" class="who-muted" style="margin:.2rem 0 0">Tạo hồ sơ riêng cho từng bé để dễ chuyển đổi.</p>',
      '    </div>',
      '    <div class="tool-row">',
      '      <div>',
      '        <div class="tool-label">Tên bé</div>',
      '        <input class="tool-input" id="child-name" type="text" placeholder="VD: Kem" />',
      '      </div>',
      '      <div>',
      '        <div class="tool-label">Ngày sinh</div>',
      '        <input class="tool-input" id="child-dob" type="date" />',
      '      </div>',
      '    </div>',
      '    <div style="margin-top:12px">',
      '      <div class="tool-label">Giới tính</div>',
      '      <div class="radio-group">',
      '        <label class="radio-opt"><input type="radio" name="child-gender" value="boy" checked> Bé trai</label>',
      '        <label class="radio-opt"><input type="radio" name="child-gender" value="girl"> Bé gái</label>',
      '      </div>',
      '    </div>',
      '    <div id="who-child-age-preview" class="who-age-preview"></div>',
      '    <div class="who-form-actions">',
      '      <button type="submit" class="who-mini-btn who-primary" id="who-save-child">Lưu hồ sơ bé</button>',
      '      <button type="button" class="who-mini-btn" id="who-reset-child">Thêm bé mới</button>',
      '    </div>',
      '  </form>',
      '</div>'
    ].join("");

    ui.authNote = document.getElementById("who-auth-note");
    ui.googleBtn = document.getElementById("who-google-btn");
    ui.logoutBtn = document.getElementById("who-logout-btn");
    ui.sessionBar = document.getElementById("who-session-bar");
    ui.remoteHint = document.getElementById("who-remote-hint");
    ui.childList = document.getElementById("who-child-list");
    ui.childForm = document.getElementById("who-child-form");
    ui.childName = document.getElementById("child-name");
    ui.childDob = document.getElementById("child-dob");
    ui.childAgePreview = document.getElementById("who-child-age-preview");
    ui.formTitle = document.getElementById("who-form-title");
    ui.formHint = document.getElementById("who-form-hint");
    ui.saveChild = document.getElementById("who-save-child");
    ui.resetChild = document.getElementById("who-reset-child");
  }

  function cacheMainDom() {
    ui.result = document.getElementById("result");
    ui.statusRow = document.getElementById("status-row");
    ui.statsGrid = document.getElementById("stats-grid");
    ui.heightResult = document.getElementById("height-result");
    ui.adviceBox = document.getElementById("advice-box");
    ui.nextBox = document.getElementById("next-box");
    ui.predBox = document.getElementById("pred-box");
    ui.chartTitle = document.getElementById("chart-title");
    ui.tabW = document.getElementById("tab-w");
    ui.tabH = document.getElementById("tab-h");
    ui.tabTableW = document.getElementById("ttab-w");
    ui.tabTableH = document.getElementById("ttab-h");
    ui.refTable = document.getElementById("who-ref-table");
    ui.ageInput = document.getElementById("age");
    ui.weightInput = document.getElementById("weight");
    ui.heightInput = document.getElementById("height");
    ui.genderInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="gender"]'));
    ui.ageHelper = document.getElementById("who-age-helper");
  }

  function setupMainButtons() {
    if (ui.childForm) {
      ui.childForm.addEventListener("submit", onChildFormSubmit);
    }
    if (ui.resetChild) {
      ui.resetChild.addEventListener("click", function () {
        resetProfileForm();
      });
    }
    if (ui.googleBtn) {
      ui.googleBtn.addEventListener("click", signInWithGoogle);
    }
    if (ui.logoutBtn) {
      ui.logoutBtn.addEventListener("click", signOut);
    }
  }

  function setupAutoSave() {
    [ui.ageInput, ui.weightInput, ui.heightInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () {
        updateDraftFromInputs();
      });
    });
    ui.genderInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        updateDraftFromInputs();
      });
    });
    if (ui.childName) {
      ui.childName.addEventListener("input", function () {
        if (ui.childName.value.trim()) {
          ui.formHint.textContent = "Mẹ có thể lưu ngay khi nhập đủ tên và ngày sinh.";
        }
      });
    }
    if (ui.childDob) {
      ui.childDob.addEventListener("input", function () {
        var preview = getAgeFromDob(ui.childDob.value);
        if (preview) {
          ui.childAgePreview.innerHTML = "Bé này hiện <b>" + escapeHtml(formatAgeText(preview)) + "</b> (" + escapeHtml(formatDateVN(preview.birthDate)) + ").";
        } else {
          ui.childAgePreview.textContent = "Nhập ngày sinh để hệ thống tự tính tháng tuổi.";
        }
      });
    }
  }

  function loadLocalBootstrap() {
    var raw = getGuestState();
    setStateFromPayload(raw, "guest");
    if (!state.children.length) {
      state.children = [];
      state.activeChildId = "";
    }
  }

  async function setupSupabase() {
    var config = getSupabaseConfig();
    var url = config.url;
    var anonKey = config.anonKey;
    if (!url || !anonKey) {
      renderAll();
      return;
    }

    try {
      var mod = await import("https://esm.sh/@supabase/supabase-js@2");
      SUPABASE_CLIENT = mod.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      var sessionResult = await SUPABASE_CLIENT.auth.getSession();
      state.session = sessionResult.data && sessionResult.data.session ? sessionResult.data.session : null;
      state.user = state.session ? state.session.user : null;

      SUPABASE_CLIENT.auth.onAuthStateChange(async function (_event, session) {
        state.session = session;
        state.user = session ? session.user : null;
        if (state.user) {
          await loadRemoteState();
        } else {
          state.hasRemote = false;
          state.source = "guest";
          loadLocalBootstrap();
        }
        renderAll();
      });

      if (state.user) {
        await loadRemoteState();
      }
    } catch (err) {
      console.error("Supabase init failed", err);
    }

    renderAll();
  }

  async function signInWithGoogle() {
    if (!SUPABASE_CLIENT) return;
    try {
      await SUPABASE_CLIENT.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href
        }
      });
    } catch (err) {
      console.error(err);
      alert("Không thể mở đăng nhập Google. Mẹ kiểm tra Supabase config giúp mình nhé.");
    }
  }

  async function signOut() {
    if (!SUPABASE_CLIENT) return;
    try {
      await SUPABASE_CLIENT.auth.signOut();
      state.session = null;
      state.user = null;
      state.source = "guest";
      loadLocalBootstrap();
      renderAll();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadRemoteState() {
    if (!SUPABASE_CLIENT || !state.user) return;
    var userId = state.user.id;
    try {
      var profileResp = await SUPABASE_CLIENT.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      var childrenResp = await SUPABASE_CLIENT.from("children").select("id,user_id,name,dob,gender,active,created_at,updated_at").eq("user_id", userId).order("active", { ascending: false }).order("updated_at", { ascending: true });
      var profileRow = profileResp.data || null;
      var childRows = Array.isArray(childrenResp.data) ? childrenResp.data : [];

      if (!profileRow) {
        await SUPABASE_CLIENT.from("profiles").upsert({
          user_id: userId,
          display_name: state.user.user_metadata && state.user.user_metadata.full_name ? state.user.user_metadata.full_name : (state.user.email || "Mẹ Biết Chưa"),
          email: state.user.email || null,
          avatar_url: state.user.user_metadata && state.user.user_metadata.avatar_url ? state.user.user_metadata.avatar_url : null
        }, { onConflict: "user_id" });
      }

      if (childRows.length) {
        state.children = childRows.map(function (row) {
          return {
            id: row.id,
            name: row.name,
            dob: row.dob,
            gender: row.gender === "girl" ? "girl" : "boy",
            active: Boolean(row.active)
          };
        });
        state.activeChildId = state.children.find(function (item) { return item.active; })?.id || state.children[0].id;
        state.source = "remote";
        state.hasRemote = true;
        state.profile.email = state.user.email || "";
        state.profile.profileName = profileRow && profileRow.display_name ? profileRow.display_name : (state.user.user_metadata && state.user.user_metadata.full_name ? state.user.user_metadata.full_name : (state.user.email || ""));
        state.profile.children = state.children;
        state.profile.activeChildId = state.activeChildId;
        state.profile.draft = clone(state.currentDraft);
        persistAll();
        return;
      }

      if (state.children.length) {
        await syncGuestStateToRemote();
      }
      state.source = "remote";
      state.hasRemote = true;
      state.profile.email = state.user.email || "";
      state.profile.profileName = profileRow && profileRow.display_name ? profileRow.display_name : (state.user.user_metadata && state.user.user_metadata.full_name ? state.user.user_metadata.full_name : (state.user.email || ""));
      persistAll();
    } catch (err) {
      console.error("Remote state load failed", err);
    }
    renderAll();
  }

  async function syncGuestStateToRemote() {
    if (!SUPABASE_CLIENT || !state.user) return;
    if (!state.children.length) return;
    if (state.syncing) return;
    state.syncing = true;
    try {
      await SUPABASE_CLIENT.from("profiles").upsert({
        user_id: state.user.id,
        display_name: state.profile.profileName || (state.user.user_metadata && state.user.user_metadata.full_name ? state.user.user_metadata.full_name : (state.user.email || "Mẹ Biết Chưa")),
        email: state.user.email || null,
        avatar_url: state.user.user_metadata && state.user.user_metadata.avatar_url ? state.user.user_metadata.avatar_url : null,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

      var remoteIdsResp = await SUPABASE_CLIENT.from("children").select("id").eq("user_id", state.user.id);
      var remoteIds = new Set((remoteIdsResp.data || []).map(function (row) { return row.id; }));
      var localIds = new Set(state.children.map(function (child) { return child.id; }));

      var rows = state.children.map(function (child) {
        return {
          id: child.id,
          user_id: state.user.id,
          name: child.name,
          dob: child.dob,
          gender: child.gender,
          active: child.id === state.activeChildId,
          updated_at: new Date().toISOString()
        };
      });

      if (rows.length) {
        await SUPABASE_CLIENT.from("children").upsert(rows, { onConflict: "id" });
      }

      var deleteIds = [];
      remoteIds.forEach(function (id) {
        if (!localIds.has(id)) deleteIds.push(id);
      });

      if (deleteIds.length) {
        await SUPABASE_CLIENT.from("children").delete().in("id", deleteIds);
      }

      state.hasRemote = true;
      state.source = "remote";
      persistAll();
    } catch (err) {
      console.error("Remote sync failed", err);
    } finally {
      state.syncing = false;
    }
  }

  var remoteSyncTimer = null;
  function queueRemoteSync() {
    if (!SUPABASE_CLIENT || !state.user) return;
    if (remoteSyncTimer) clearTimeout(remoteSyncTimer);
    remoteSyncTimer = setTimeout(function () {
      syncGuestStateToRemote();
    }, 350);
  }

  function bindPage() {
    mountProfilePanel();
    cacheMainDom();
    setupMainButtons();
    attachChildListEvents();
    attachMainFormEvents();
    setupAutoSave();
    loadLocalBootstrap();
    renderAll();
    setupSupabase();
  }

  window.calcWHO = calcWHO;
  window.switchChart = switchChart;
  window.switchTable = switchTable;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindPage);
  } else {
    bindPage();
  }
})();
