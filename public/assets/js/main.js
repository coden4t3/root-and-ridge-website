/* Root and Ridge Systems — site behavior (no dependencies) */
(function () {
  "use strict";

  var config = window.RR_CONFIG || {};
  var bookingUrl = (config.bookingUrl || "").trim();
  var formEndpoint = (config.formEndpoint || "").trim();
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

  /* Contact form */
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  var submit = form.querySelector('[type="submit"]');

  if (formEndpoint) form.setAttribute("action", formEndpoint);

  function showStatus(kind, message) {
    status.className = "form-status form-status--" + kind;
    status.textContent = message;
    status.hidden = false;
    status.focus();
  }

  function checkField(field) {
    var error = document.getElementById(field.id + "-error");
    var valid = field.checkValidity();
    field.setAttribute("aria-invalid", valid ? "false" : "true");
    if (error) {
      error.textContent = valid ? "" : field.dataset.error || "Please fill in this field.";
      error.hidden = valid;
    }
    return valid;
  }

  function validate() {
    var firstInvalid = null;
    form.querySelectorAll("[required]").forEach(function (field) {
      if (!checkField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  /* Once a field has been flagged, clear the message as soon as it's fixed */
  ["input", "change"].forEach(function (type) {
    form.addEventListener(type, function (e) {
      if (e.target.getAttribute("aria-invalid") === "true") checkField(e.target);
    });
  });

  form.setAttribute("novalidate", "");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    if (!formEndpoint) {
      showStatus("info", "Our online form isn't connected yet. Please email us at " + email + " and we'll reply within one business day.");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending…";
    fetch(formEndpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        showStatus("success", "Thanks — your message is on its way. We'll reply within one business day.");
      })
      .catch(function () {
        showStatus("error", "Something went wrong sending your message. Please try again, or email us at " + email + ".");
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = "Send message";
      });
  });
})();
