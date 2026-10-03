/* Root and Ridge Systems — site behavior (no dependencies) */
(function () {
  "use strict";

  var config = window.RR_CONFIG || {};
  var bookingUrl = (config.bookingUrl || "").trim();
  var email = (config.contactEmail || "").trim();

  /* Booking buttons: point every [data-cta="book"] link at the booking page */
  if (bookingUrl) {
    document.querySelectorAll('[data-cta="book"]').forEach(function (link) {
      link.setAttribute("href", bookingUrl);
      if (/^https?:\/\//.test(bookingUrl) && bookingUrl.indexOf(location.host) === -1) {
        link.setAttribute("rel", "noopener");
      }
    });
    document.querySelectorAll("[data-booking-only]").forEach(function (el) { el.hidden = false; });
    document.querySelectorAll("[data-no-booking-only]").forEach(function (el) { el.hidden = true; });
  }

  /* Contact email: keep every displayed address in sync with the config */
  if (email) {
    document.querySelectorAll("[data-contact-email]").forEach(function (el) {
      el.textContent = email;
      if (el.tagName === "A") el.setAttribute("href", "mailto:" + email);
    });
  }

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 56em)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* The contact form is handled by contact-form.js (Formspree). */
})();
