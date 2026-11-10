/* Tanymio demo account: phone login, local progress, demo plan. */
(function () {
  "use strict";
  var PROFILE = "tanymio.profile.v1";

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE) || "null"); } catch (e) { return null; }
  }
  function saveProfile(profile) {
    localStorage.setItem(PROFILE, JSON.stringify(profile));
  }
  function formatPhone(value) {
    var d = String(value || "").replace(/\D/g, "");
    if (d.length === 11 && d[0] === "8") d = "7" + d.slice(1);
    if (d.length === 11 && d[0] === "7") return "+7 " + d.slice(1, 4) + " " + d.slice(4, 7) + " " + d.slice(7, 9) + " " + d.slice(9, 11);
    return value;
  }
  function planLabel(access) {
    if (!access || !access.unlocked) return "Нет доступа";
    var names = { month: "Месяц", family: "Семья", sixmonths: "6 месяцев", course: "Курс", code: "Демо-код" };
    return names[access.plan] || "Открыт";
  }

  var login = document.getElementById("accountLogin");
  var profile = document.getElementById("accountProfile");
  var loginForm = document.getElementById("loginForm");
  var codeForm = document.getElementById("codeForm");
  var error = document.getElementById("loginError");
  var payNote = document.getElementById("payNote");
  var pendingPhone = "";

  function render() {
    var data = readProfile();
    if (!data) {
      login.hidden = false;
      profile.hidden = true;
      return;
    }
    login.hidden = true;
    profile.hidden = false;
    document.getElementById("profileName").textContent = data.name || "Друг";
    document.getElementById("profilePhone").textContent = formatPhone(data.phone);
    var progress = window.TANYMIO && TANYMIO.getProgress ? TANYMIO.getProgress() : {};
    var done = Object.keys(progress).filter(function (id) { return progress[id] && progress[id].completedAt; }).length;
    document.getElementById("profileDone").textContent = done;
    document.getElementById("profileTotal").textContent = (window.TANYMIO_LESSONS || []).length || 66;
    document.getElementById("profilePlan").textContent = planLabel(window.TANYMIO && TANYMIO.getAccess ? TANYMIO.getAccess() : null);
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var phone = document.getElementById("loginPhone").value;
    var digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      error.textContent = "Введите номер телефона полностью.";
      return;
    }
    pendingPhone = phone;
    error.textContent = "";
    codeForm.hidden = false;
    document.getElementById("loginCode").focus();
  });

  codeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var code = document.getElementById("loginCode").value.trim();
    if (code !== "4821") {
      error.textContent = "Демо-код: 4821.";
      return;
    }
    saveProfile({ phone: pendingPhone, name: "Аслан", plan: null, createdAt: new Date().toISOString() });
    error.textContent = "";
    render();
  });

  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem(PROFILE);
    codeForm.hidden = true;
    document.getElementById("loginCode").value = "";
    document.getElementById("loginPhone").value = "";
    render();
  });

  document.querySelectorAll("[data-plan]").forEach(function (button) {
    button.addEventListener("click", function () {
      var plan = button.dataset.plan;
      if (window.TANYMIO && TANYMIO.unlock) TANYMIO.unlock(plan);
      var data = readProfile() || { phone: "", name: "Аслан" };
      data.plan = plan;
      saveProfile(data);
      if (payNote) payNote.textContent = "Демо-оплата прошла. Доступ открыт до перезагрузки данных браузера.";
      render();
    });
  });

  document.addEventListener("tanymio:progress", render);
  render();
})();