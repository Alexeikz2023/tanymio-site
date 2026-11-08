/* Voice picker: stores the chosen narrator per language on this device. */
(function () {
  "use strict";

  var T = window.TANYMIO;
  if (!T) return;

  var cards = T.qsa("[data-voice-card]");
  if (!cards.length) return;

  function current(lang) {
    return lang === "kk" ? T.settings.voiceKk : T.settings.voiceRu;
  }

  function render() {
    cards.forEach(function (card) {
      var lang = card.dataset.lang;
      var on = card.dataset.voicePack === current(lang);
      card.classList.toggle("is-selected", on);
      var state = card.querySelector("[data-voice-state]");
      if (state) {
        state.textContent = on
          ? (lang === "kk" ? "Таңдалған" : "Выбран")
          : (lang === "kk" ? "Таңдау" : "Выбрать");
      }
      var btn = card.querySelector("[data-voice-pick]");
      if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  T.qsa("[data-voice-pick]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.dataset.lang === "kk" ? "kk" : "ru";
      var value = btn.dataset.voicePick === "male" ? "male" : "female";
      T.settings[lang === "kk" ? "voiceKk" : "voiceRu"] = value;
      T.settings.voice = true;
      T.saveSettings();
      T.stopSpeech();
      T.qsa("audio").forEach(function (audio) { audio.pause(); });
      render();
      T.toast(lang === "kk" ? "Дауыс таңдалды, дыбыстау қосылды" : "Голос выбран, озвучка включена");
    });
  });

  render();
})();