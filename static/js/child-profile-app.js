(function () {
  var STORAGE_KEY = "mebietchua.who.profile.v1";
  var LEGACY_KEY = "who-profile-v1";
  var SUPABASE_CONFIG = window.MBC_SUPABASE_CONFIG || {};
  var client = null;
  var syncTimer = null;
  var state = {
    user: null,
    children: [],
    activeChildId: "",
    editingChildId: "",
    profileName: "",
    email: "",
    syncing: false
  };
  var ui = {};

  function cleanConfigValue(value) {
    var str = String(value || "").trim();
    if (!str || str === '""' || str === "''") return "";
    if ((str[0] === '"' && str[str.length - 1] === '"') || (str[0] === "'" && str[str.length - 1] === "'")) str = str.slice(1, -1).trim();
    return str;
  }

  function getConfig() {
    return {
      url: cleanConfigValue(SUPABASE_CONFIG.url),
      anonKey: cleanConfigValue(SUPABASE_CONFIG.anonKey)
    };
  }

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
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

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getAgeFromDob(dobValue) {
    if (!dobValue) return null;
    var birth = startOfDay(dobValue);
    var today = startOfDay(new Date());
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
      totalMonths: years * 12 + months,
      days: days,
      birthDate: birth
    };
  }

  function formatDateVN(date) {
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function formatAgeText(info) {
    if (!info) return "";
    return info.totalMonths + " tháng " + info.days + " ngày";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function normalizeChildren(children, activeChildId) {
    var rows = Array.isArray(children) ? children : [];
    var normalized = rows.map(function (child) {
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
    var active = activeChildId || "";
    if (normalized.length && !normalized.some(function (child) { return child.id === active; })) {
      active = (normalized.find(function (child) { return child.active; }) || normalized[0]).id;
    }
    return normalized.map(function (child) {
      child.active = child.id === active;
      return child;
    });
  }

  function loadLocalState() {
    var raw = safeParse(localStorage.getItem(STORAGE_KEY), null) || safeParse(localStorage.getItem(LEGACY_KEY), null) || {};
    state.children = normalizeChildren(raw.children, raw.activeChildId);
    state.activeChildId = state.children.find(function (child) { return child.active; })?.id || "";
    state.profileName = raw.profileName || "";
    state.email = raw.email || "";
  }

  function saveLocalState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profileName: state.profileName || "",
      email: state.email || "",
      activeChildId: state.activeChildId || "",
      children: state.children.map(function (child) {
        return {
          id: child.id,
          name: child.name,
          dob: child.dob,
          gender: child.gender,
          active: child.id === state.activeChildId
        };
      }),
      draft: safeParse(localStorage.getItem(STORAGE_KEY), {}).draft || {}
    }));
  }

  function cacheDom() {
    ui.status = document.getElementById("child-status");
    ui.summary = document.getElementById("child-summary");
    ui.list = document.getElementById("child-list");
    ui.form = document.getElementById("child-form");
    ui.name = document.getElementById("child-name");
    ui.dob = document.getElementById("child-dob");
    ui.preview = document.getElementById("child-age-preview");
    ui.title = document.getElementById("child-form-title");
    ui.hint = document.getElementById("child-form-hint");
    ui.save = document.getElementById("child-save");
    ui.reset = document.getElementById("child-reset");
    ui.genderInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="child-gender"]'));
  }

  function getGenderValue() {
    var selected = ui.genderInputs.find(function (input) { return input.checked; });
    return selected ? selected.value : "boy";
  }

  function setGenderValue(value) {
    var gender = value === "girl" ? "girl" : "boy";
    ui.genderInputs.forEach(function (input) {
      input.checked = input.value === gender;
    });
  }

  function getActiveChild() {
    return state.children.find(function (child) { return child.id === state.activeChildId; }) || state.children.find(function (child) { return child.active; }) || state.children[0] || null;
  }

  function renderStatus() {
    if (!ui.status || !ui.summary) return;
    if (state.user) {
      ui.status.className = "child-status synced";
      ui.status.textContent = "Đồng bộ đám mây";
      ui.summary.textContent = state.children.length
        ? "Đang lưu " + state.children.length + " hồ sơ bé trong tài khoản " + (state.user.email || "Mẹ Biết Chưa") + "."
        : "Chưa có hồ sơ bé nào trong tài khoản. Mẹ thêm bé đầu tiên ở khung bên phải.";
      return;
    }
    ui.status.className = "child-status";
    ui.status.textContent = "Chỉ lưu trên máy này";
    ui.summary.textContent = state.children.length
      ? "Mẹ đang có " + state.children.length + " hồ sơ lưu trên trình duyệt hiện tại. Đăng nhập để đồng bộ giữa các thiết bị."
      : "Chưa có hồ sơ bé nào. Mẹ có thể thêm hồ sơ tạm trên trình duyệt này hoặc đăng nhập để đồng bộ.";
  }

  function renderList() {
    if (!ui.list) return;
    if (!state.children.length) {
      ui.list.innerHTML = '<div class="child-empty">Chưa có hồ sơ bé nào. Mẹ nhập tên, ngày sinh và giới tính ở khung bên phải để tạo hồ sơ đầu tiên.</div>';
      return;
    }
    ui.list.innerHTML = state.children.map(function (child) {
      var age = getAgeFromDob(child.dob);
      var meta = age ? formatAgeText(age) + " - sinh " + formatDateVN(age.birthDate) : "Chưa có ngày sinh";
      return [
        '<div class="child-item' + (child.id === state.activeChildId ? " active" : "") + '" data-child-id="' + child.id + '">',
        child.id === state.activeChildId ? '<span class="child-active-badge">Đang dùng</span>' : '',
        '<div>',
        '<div class="child-name">' + escapeHtml(child.name) + '</div>',
        '<div class="child-meta">' + escapeHtml(meta) + ' - ' + (child.gender === "girl" ? "Bé gái" : "Bé trai") + '</div>',
        '</div>',
        '<div class="child-actions">',
        '<button class="child-btn" type="button" data-action="select" data-child-id="' + child.id + '">Dùng</button>',
        '<button class="child-btn" type="button" data-action="edit" data-child-id="' + child.id + '">Sửa</button>',
        '<button class="child-btn danger" type="button" data-action="delete" data-child-id="' + child.id + '">Xóa</button>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderForm() {
    var editing = state.editingChildId ? state.children.find(function (child) { return child.id === state.editingChildId; }) : null;
    if (editing) {
      ui.title.textContent = "Sửa hồ sơ bé";
      ui.hint.textContent = "Cập nhật xong, hồ sơ này sẽ được chọn làm bé đang dùng.";
      ui.save.textContent = "Cập nhật hồ sơ";
      ui.name.value = editing.name || "";
      ui.dob.value = editing.dob || "";
      setGenderValue(editing.gender || "boy");
    } else {
      ui.title.textContent = "Thêm bé mới";
      ui.hint.textContent = "Tạo hồ sơ riêng cho từng bé để dễ chuyển đổi.";
      ui.save.textContent = "Lưu hồ sơ bé";
      if (!ui.name.value && !ui.dob.value) setGenderValue("boy");
    }
    updatePreview();
  }

  function renderAll() {
    renderStatus();
    renderList();
    renderForm();
  }

  function updatePreview() {
    var age = getAgeFromDob(ui.dob.value);
    ui.preview.innerHTML = age
      ? "Bé này hiện <b>" + escapeHtml(formatAgeText(age)) + "</b> (" + escapeHtml(formatDateVN(age.birthDate)) + ")."
      : "Nhập ngày sinh để hệ thống tự tính tháng tuổi.";
  }

  function resetForm() {
    state.editingChildId = "";
    ui.form.reset();
    setGenderValue("boy");
    updatePreview();
    renderForm();
  }

  function persistAndRender() {
    saveLocalState();
    renderAll();
    queueRemoteSync();
  }

  function selectChild(childId) {
    state.activeChildId = childId;
    state.children = state.children.map(function (child) {
      child.active = child.id === childId;
      return child;
    });
    state.editingChildId = "";
    persistAndRender();
  }

  function editChild(childId) {
    state.editingChildId = childId;
    renderForm();
  }

  function deleteChild(childId) {
    var child = state.children.find(function (item) { return item.id === childId; });
    if (!child) return;
    if (!window.confirm("Xóa hồ sơ của " + child.name + "?")) return;
    state.children = state.children.filter(function (item) { return item.id !== childId; });
    if (state.activeChildId === childId) state.activeChildId = state.children[0]?.id || "";
    state.children = state.children.map(function (item) {
      item.active = item.id === state.activeChildId;
      return item;
    });
    state.editingChildId = "";
    persistAndRender();
  }

  function onSubmit(event) {
    event.preventDefault();
    var name = ui.name.value.trim();
    var dob = ui.dob.value;
    if (!name || !dob) {
      alert("Mẹ vui lòng nhập tên và ngày sinh của bé nhé!");
      return;
    }
    var editing = state.editingChildId ? state.children.find(function (child) { return child.id === state.editingChildId; }) : null;
    var child = {
      id: editing ? editing.id : uid(),
      name: name,
      dob: dob,
      gender: getGenderValue(),
      active: true
    };
    state.children = state.children.map(function (item) {
      item.active = false;
      return item;
    });
    if (editing) {
      state.children = state.children.map(function (item) { return item.id === editing.id ? child : item; });
    } else {
      state.children.push(child);
    }
    state.activeChildId = child.id;
    state.editingChildId = "";
    ui.form.reset();
    setGenderValue(child.gender);
    persistAndRender();
  }

  function bindEvents() {
    ui.form.addEventListener("submit", onSubmit);
    ui.reset.addEventListener("click", resetForm);
    ui.dob.addEventListener("input", updatePreview);
    ui.list.addEventListener("click", function (event) {
      var target = event.target.closest("[data-action]");
      if (!target) return;
      var childId = target.getAttribute("data-child-id");
      var action = target.getAttribute("data-action");
      if (action === "select") selectChild(childId);
      if (action === "edit") editChild(childId);
      if (action === "delete") deleteChild(childId);
    });
  }

  async function setupSupabase() {
    var config = getConfig();
    if (!config.url || !config.anonKey) {
      renderAll();
      return;
    }
    try {
      var mod = await import("https://esm.sh/@supabase/supabase-js@2");
      client = mod.createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      var sessionResult = await client.auth.getSession();
      state.user = sessionResult.data && sessionResult.data.session ? sessionResult.data.session.user : null;
      client.auth.onAuthStateChange(async function (_event, session) {
        state.user = session ? session.user : null;
        if (state.user) await loadRemoteState();
        renderAll();
      });
      if (state.user) await loadRemoteState();
    } catch (err) {
      console.error("Child profile auth failed", err);
    }
    renderAll();
  }

  async function loadRemoteState() {
    if (!client || !state.user) return;
    var userId = state.user.id;
    var profileResp = await client.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    var childrenResp = await client.from("children").select("id,user_id,name,dob,gender,active,created_at,updated_at").eq("user_id", userId).order("active", { ascending: false }).order("updated_at", { ascending: true });
    var profile = profileResp.data || null;
    var rows = Array.isArray(childrenResp.data) ? childrenResp.data : [];
    state.profileName = profile && profile.display_name ? profile.display_name : (state.user.user_metadata && state.user.user_metadata.full_name ? state.user.user_metadata.full_name : (state.user.email || ""));
    state.email = state.user.email || "";
    if (!profile) {
      await client.from("profiles").upsert({
        user_id: userId,
        display_name: state.profileName || "Mẹ Biết Chưa",
        email: state.user.email || null,
        avatar_url: state.user.user_metadata && state.user.user_metadata.avatar_url ? state.user.user_metadata.avatar_url : null,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    }
    if (rows.length) {
      state.children = normalizeChildren(rows, (rows.find(function (row) { return row.active; }) || rows[0]).id);
      state.activeChildId = state.children.find(function (child) { return child.active; })?.id || "";
      saveLocalState();
      return;
    }
    if (state.children.length) await syncToRemote();
  }

  async function syncToRemote() {
    if (!client || !state.user || state.syncing) return;
    state.syncing = true;
    try {
      await client.from("profiles").upsert({
        user_id: state.user.id,
        display_name: state.profileName || (state.user.user_metadata && state.user.user_metadata.full_name ? state.user.user_metadata.full_name : (state.user.email || "Mẹ Biết Chưa")),
        email: state.user.email || null,
        avatar_url: state.user.user_metadata && state.user.user_metadata.avatar_url ? state.user.user_metadata.avatar_url : null,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

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
      if (rows.length) await client.from("children").upsert(rows, { onConflict: "id" });
      var remoteIdsResp = await client.from("children").select("id").eq("user_id", state.user.id);
      var localIds = new Set(state.children.map(function (child) { return child.id; }));
      var deleteIds = (remoteIdsResp.data || []).map(function (row) { return row.id; }).filter(function (id) { return !localIds.has(id); });
      if (deleteIds.length) await client.from("children").delete().in("id", deleteIds);
    } catch (err) {
      console.error("Child profile sync failed", err);
    } finally {
      state.syncing = false;
    }
  }

  function queueRemoteSync() {
    if (!client || !state.user) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(syncToRemote, 300);
  }

  function init() {
    cacheDom();
    bindEvents();
    loadLocalState();
    renderAll();
    setupSupabase();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
