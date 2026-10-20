(function () {
  var CALL = "tel:+491785316551";
  var WA = "https://wa.me/491709573007?text=" + encodeURIComponent("Hallo Koback Umzüge & Transport, ich möchte ein Angebot anfragen.");

  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav-menu");
  var shell = document.createElement("div");
  shell.className = "nav-shell";
  var mobileNav = window.matchMedia("(max-width: 980px)");
  function placeMenu() {
    if (!menu) return;
    if (mobileNav.matches) {
      if (!shell.isConnected) document.body.appendChild(shell);
      if (menu.parentNode !== shell) shell.appendChild(menu);
    } else if (menu.parentNode === shell) {
      var call = document.querySelector(".nav-call");
      if (call && call.parentNode) call.parentNode.insertBefore(menu, call);
      shell.remove();
    }
  }
  placeMenu();
  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        window.setTimeout(function () { setMenu(false); }, 0);
      });
    });
    document.addEventListener("click", function (event) {
      if (!menu.classList.contains("is-open")) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (!mobileNav.matches) setMenu(false);
      placeMenu();
    });
    if (mobileNav.addEventListener) {
      mobileNav.addEventListener("change", function () {
        if (!mobileNav.matches) setMenu(false);
        placeMenu();
      });
    }
  }

  var video = document.getElementById("hero-video");
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.addEventListener("volumechange", function () {
      if (!video.muted) video.muted = true;
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
      video.pause();
    }
  }

  var fab = document.getElementById("fab");
  function syncFab() {
    if (!fab) return;
    var hero = document.querySelector(".hero");
    var overHero = hero && hero.getBoundingClientRect().bottom > window.innerHeight - 24;
    fab.classList.toggle("is-hidden", overHero);
    var scrolled = window.scrollY > 140;
    fab.classList.toggle("is-wa", scrolled);
    fab.href = scrolled ? WA : CALL;
    if (scrolled) {
      fab.target = "_blank";
      fab.rel = "noopener noreferrer";
      fab.setAttribute("aria-label", "Per WhatsApp schreiben");
    } else {
      fab.removeAttribute("target");
      fab.removeAttribute("rel");
      fab.setAttribute("aria-label", "Jetzt anrufen");
    }
  }
  syncFab();
  window.addEventListener("scroll", syncFab, { passive: true });

  document.querySelectorAll('a[href="#kontakt"]').forEach(function (link) {
    link.addEventListener("click", function () {
      window.setTimeout(function () {
        var name = document.querySelector('#kontakt [name="vorname"]');
        if (name) name.focus({ preventScroll: true });
      }, 450);
    });
  });

  document.querySelectorAll("[data-map]").forEach(function (button) {
    button.addEventListener("click", function () {
      var frame = button.closest(".map-frame");
      if (!frame) return;
      frame.innerHTML = '<iframe title="Karte: Am kleinen Rahm 76, 40878 Ratingen" src="https://maps.google.com/maps?q=Am+kleinen+Rahm+76,+40878+Ratingen&z=15&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
    });
  });

  var form = document.getElementById("anfrage");
  if (!form) return;

  var dateInput = form.querySelector('[name="datum"]');
  if (dateInput) {
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");
    dateInput.min = today.getFullYear() + "-" + month + "-" + day;
  }

  var error = document.getElementById("form-error");
  var success = document.getElementById("form-success");
  var params = new URLSearchParams(window.location.search);
  if (params.get("gesendet") === "1" && success) {
    form.hidden = true;
    success.classList.add("is-on");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var first = String(data.get("vorname") || "").trim();
    var last = String(data.get("nachname") || "").trim();
    var email = String(data.get("email") || "").trim();
    var phone = String(data.get("telefon") || "").trim();
    var address = String(data.get("adresse") || "").trim();
    var pickup = String(data.get("abholung") || "").trim();
    var when = String(data.get("datum") || "").trim();
    var clock = String(data.get("uhrzeit") || "").trim();
    var consent = data.get("einwilligung");
    if (error) error.textContent = "";
    if (!first || !last || !phone || !address || !pickup || !when || !clock || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || consent !== "ja") {
      if (error) error.textContent = "Bitte Vorname, Nachname, E-Mail, Telefon, Adresse, Abholort, Datum, Uhrzeit und die Einwilligung ausfüllen.";
      return;
    }

    var button = form.querySelector('[type="submit"]');
    if (button) button.disabled = true;

    fetch("kontakt.php", {
      method: "POST",
      body: data,
      headers: { "X-Requested-With": "fetch", Accept: "application/json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("send");
        return res.json();
      })
      .then(function (payload) {
        if (!payload || !payload.ok) throw new Error("send");
        form.hidden = true;
        if (success) success.classList.add("is-on");
      })
      .catch(function () {
        var body = [
          "Vorname: " + first,
          "Nachname: " + last,
          "E-Mail: " + email,
          "Telefon: " + phone,
          "Adresse: " + address,
          "Abholort: " + pickup,
          "Zieladresse: " + String(data.get("ziel") || ""),
          "Datum: " + when,
          "Uhrzeit: " + clock,
          "Leistung: " + String(data.get("leistung") || ""),
          "",
          String(data.get("nachricht") || "")
        ].join("\n");
        window.location.href = "mailto:info@kobacktransporte.com?subject=" + encodeURIComponent("Anfrage über die Website") + "&body=" + encodeURIComponent(body);
        form.hidden = true;
        if (success) success.classList.add("is-on");
      })
      .finally(function () {
        if (button) button.disabled = false;
      });
  });
})();
