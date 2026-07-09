(function () {
  var PRODUCTION_SITE_URL = "https://mebietchua.com";
  var SUPABASE_CONFIG = window.MBC_SUPABASE_CONFIG || {};
  var client = null;
  var state = {
    user: null,
    ready: false,
    open: false
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

  function getReturnPath() {
    var path = window.location.pathname + window.location.search;
    if (!path || path === "/") return "/cong-cu/tang-truong-who/";
    return path;
  }

  function getDisplayName(user) {
    if (!user) return "Tài khoản";
    var meta = user.user_metadata || {};
    return meta.full_name || meta.name || user.email || "Tài khoản";
  }

  function getInitial(user) {
    var name = getDisplayName(user).trim();
    return name ? name.charAt(0).toUpperCase() : "M";
  }

  function cacheDom() {
    ui.menu = document.getElementById("site-auth-menu");
    ui.login = document.getElementById("site-auth-login");
    ui.user = document.getElementById("site-auth-user");
    ui.userButton = document.getElementById("site-auth-user-button");
    ui.dropdown = document.getElementById("site-auth-dropdown");
    ui.logout = document.getElementById("site-auth-logout");
    ui.name = document.getElementById("site-auth-name");
    ui.email = document.getElementById("site-auth-email");
    ui.avatar = document.getElementById("site-auth-avatar");
  }

  function setDropdown(open) {
    state.open = !!open;
    if (ui.dropdown) ui.dropdown.hidden = !state.open;
    if (ui.userButton) ui.userButton.setAttribute("aria-expanded", state.open ? "true" : "false");
  }

  function render() {
    if (!ui.menu) return;
    var config = getConfig();
    if (!config.url || !config.anonKey) {
      ui.menu.hidden = true;
      return;
    }

    ui.menu.hidden = false;
    if (!state.user) {
      if (ui.login) ui.login.hidden = false;
      if (ui.user) ui.user.hidden = true;
      setDropdown(false);
      return;
    }

    if (ui.login) ui.login.hidden = true;
    if (ui.user) ui.user.hidden = false;
    if (ui.name) ui.name.textContent = getDisplayName(state.user);
    if (ui.email) ui.email.textContent = state.user.email || "Đã đăng nhập";
    if (ui.avatar) ui.avatar.textContent = getInitial(state.user);
  }

  async function signIn() {
    if (!client) return;
    try {
      window.sessionStorage.setItem("mbc.auth.returnTo", getReturnPath());
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
    render();
    window.location.reload();
  }

  function bindEvents() {
    if (ui.login) ui.login.addEventListener("click", signIn);
    if (ui.logout) ui.logout.addEventListener("click", signOut);
    if (ui.userButton) {
      ui.userButton.addEventListener("click", function () {
        setDropdown(!state.open);
      });
    }
    document.addEventListener("click", function (event) {
      if (!ui.menu || ui.menu.contains(event.target)) return;
      setDropdown(false);
    });
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
        clearOAuthHashFromUrl();
        render();
      });
    } catch (err) {
      console.error("Site auth init failed", err);
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
