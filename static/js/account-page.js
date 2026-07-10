(function () {
  var PRODUCTION_SITE_URL = "https://mebietchua.com";
  var SUPABASE_CONFIG = window.MBC_SUPABASE_CONFIG || {};
  var client = null;
  var state = {
    ready: false,
    user: null
  };
  var ui = {};

  function cleanConfigValue(value) {
    var str = String(value || "").trim();
    if (!str || str === '""' || str === "''") return "";
    if ((str[0] === '"' && str[str.length - 1] === '"') || (str[0] === "'" && str[str.length - 1] === "'")) {
      str = str.slice(1, -1).trim();
    }
    return str;
  }

  function getConfig() {
    return {
      url: cleanConfigValue(SUPABASE_CONFIG.url),
      anonKey: cleanConfigValue(SUPABASE_CONFIG.anonKey)
    };
  }

  function isOAuthHash() {
    var hash = window.location.hash || "";
    return hash.indexOf("access_token=") !== -1 || hash.indexOf("refresh_token=") !== -1 || hash.indexOf("error=") !== -1;
  }

  function clearOAuthHashFromUrl() {
    if (!window.history || !isOAuthHash()) return;
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  }

  function getSafeReturnTo() {
    var params = new URLSearchParams(window.location.search || "");
    var value = params.get("returnTo") || "";
    if (value && value.charAt(0) === "/" && value.indexOf("//") !== 0) return value;
    return "";
  }

  function updateReturnLink() {
    var returnTo = getSafeReturnTo();
    if (!ui.returnLink) return;
    if (!returnTo || returnTo === "/tai-khoan/") {
      ui.returnLink.hidden = true;
      return;
    }
    ui.returnLink.hidden = false;
    ui.returnLink.setAttribute("href", returnTo);
    ui.returnLink.textContent = returnTo.indexOf("/cong-cu/tang-truong-who/") === 0
      ? "Quay lại công cụ WHO"
      : "Quay lại trang vừa mở";
  }

  function getDisplayName(user) {
    if (!user) return "Mẹ";
    var meta = user.user_metadata || {};
    return meta.full_name || meta.name || user.email || "Mẹ";
  }

  function getAvatar(user) {
    var meta = user && user.user_metadata ? user.user_metadata : {};
    return meta.avatar_url || meta.picture || "";
  }

  function getInitial(user) {
    var name = getDisplayName(user).trim();
    return name ? name.charAt(0).toUpperCase() : "M";
  }

  function cacheDom() {
    ui.root = document.getElementById("account-app");
    ui.status = document.getElementById("account-status");
    ui.body = document.getElementById("account-body");
    ui.login = document.getElementById("account-login");
    ui.logout = document.getElementById("account-logout");
    ui.profile = document.getElementById("account-profile-link");
    ui.returnLink = document.getElementById("account-return-link");
  }

  function renderConfigMissing() {
    if (ui.status) {
      ui.status.className = "account-status warning";
      ui.status.textContent = "Chưa bật đăng nhập";
    }
    if (ui.body) {
      ui.body.innerHTML = [
        '<div class="account-empty">',
        '<h2>Đăng nhập chưa sẵn sàng</h2>',
        '<p>Supabase chưa được cấu hình nên website chỉ lưu dữ liệu trên trình duyệt hiện tại.</p>',
        '</div>'
      ].join("");
    }
    if (ui.login) ui.login.hidden = true;
    if (ui.logout) ui.logout.hidden = true;
    if (ui.profile) ui.profile.hidden = false;
    updateReturnLink();
  }

  function renderLoading() {
    if (ui.status) {
      ui.status.className = "account-status loading";
      ui.status.textContent = "Đang kiểm tra tài khoản";
    }
    if (ui.body) {
      ui.body.innerHTML = [
        '<div class="account-empty">',
        '<h2>Đang đồng bộ...</h2>',
        '<p>Mẹ chờ vài giây để hệ thống kiểm tra phiên đăng nhập hiện tại.</p>',
        '</div>'
      ].join("");
    }
    if (ui.login) ui.login.hidden = true;
    if (ui.logout) ui.logout.hidden = true;
    updateReturnLink();
  }

  function renderGuest() {
    if (ui.status) {
      ui.status.className = "account-status guest";
      ui.status.textContent = "Chưa đăng nhập";
    }
    if (ui.body) {
      ui.body.innerHTML = [
        '<div class="account-empty">',
        '<h2>Đăng nhập để đồng bộ hồ sơ bé</h2>',
        '<p>Mẹ vẫn dùng được các công cụ ở chế độ khách. Khi đăng nhập, hồ sơ bé sẽ được lưu an toàn hơn và có thể mở lại trên thiết bị khác.</p>',
        '<ul class="account-checklist">',
        '<li>Không bắt buộc đăng nhập mới dùng được công cụ.</li>',
        '<li>Chỉ lưu tên bé, ngày sinh và giới tính để tự tính tuổi.</li>',
        '<li>Có thể đăng xuất bất cứ lúc nào.</li>',
        '</ul>',
        '</div>'
      ].join("");
    }
    if (ui.login) ui.login.hidden = false;
    if (ui.logout) ui.logout.hidden = true;
    if (ui.profile) ui.profile.hidden = false;
    updateReturnLink();
  }

  function renderUser() {
    var user = state.user;
    var avatar = getAvatar(user);
    var avatarHtml = avatar
      ? '<img class="account-avatar" src="' + avatar.replace(/"/g, "&quot;") + '" alt="">'
      : '<span class="account-avatar-fallback">' + getInitial(user) + '</span>';

    if (ui.status) {
      ui.status.className = "account-status synced";
      ui.status.textContent = "Đã đăng nhập";
    }
    if (ui.body) {
      ui.body.innerHTML = [
        '<div class="account-user-card">',
        avatarHtml,
        '<div>',
        '<h2>' + getDisplayName(user) + '</h2>',
        '<p>' + (user.email || "Tài khoản Google") + '</p>',
        '</div>',
        '</div>',
        '<div class="account-next-box">',
        '<strong>Gợi ý tiếp theo</strong>',
        '<p>Mẹ có thể mở trang hồ sơ bé để thêm ngày sinh, sau đó công cụ WHO sẽ tự tính tháng tuổi mỗi lần quay lại.</p>',
        '</div>'
      ].join("");
    }
    if (ui.login) ui.login.hidden = true;
    if (ui.logout) ui.logout.hidden = false;
    if (ui.profile) ui.profile.hidden = false;
    updateReturnLink();
  }

  function render() {
    var config = getConfig();
    if (!config.url || !config.anonKey) {
      renderConfigMissing();
      return;
    }
    if (!state.ready) {
      renderLoading();
      return;
    }
    if (state.user) renderUser();
    else renderGuest();
  }

  async function signIn() {
    if (!client) return;
    try {
      window.sessionStorage.setItem("mbc.auth.returnTo", "/tai-khoan/");
    } catch (err) {}
    await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: PRODUCTION_SITE_URL
      }
    });
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    state.user = null;
    state.ready = true;
    render();
    window.location.reload();
  }

  function bindEvents() {
    if (ui.login) ui.login.addEventListener("click", signIn);
    if (ui.logout) ui.logout.addEventListener("click", signOut);
  }

  async function initAuth() {
    var config = getConfig();
    if (!config.url || !config.anonKey) {
      render();
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
      clearOAuthHashFromUrl();
      state.user = sessionResult.data && sessionResult.data.session ? sessionResult.data.session.user : null;
      state.ready = true;
      render();

      client.auth.onAuthStateChange(function (_event, session) {
        state.user = session ? session.user : null;
        state.ready = true;
        clearOAuthHashFromUrl();
        render();
      });
    } catch (err) {
      console.error("Account auth init failed", err);
      state.ready = true;
      render();
    }
  }

  function init() {
    cacheDom();
    bindEvents();
    render();
    initAuth();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
