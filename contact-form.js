/*
 * Contact form → Formspree
 * ------------------------------------------------------------
 * Uses Formspree's official vanilla JS library (@formspree/ajax),
 * which is loaded from unpkg right after this file on the Contact page.
 * The form ID below is a public value, not a secret.
 *
 * Flow: our own checks run first (required fields, email format).
 * Only a valid form reaches Formspree. The visitor stays on this site,
 * sees a confirmation on success, and keeps everything they typed if
 * sending fails.
 */

/* Queue stub: lets us call formspree() before the library has loaded. */
window.formspree = window.formspree || function () {
  (window.formspree.q = window.formspree.q || []).push(arguments);
};

(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var config = window.RR_CONFIG || {};
  var email = config.contactEmail || "hello@rootandridgesystems.com";
  var button = form.querySelector("[data-fs-submit-btn]");
  var errorBox = document.getElementById("form-error");
  var successBox = document.getElementById("form-success");
  var buttonLabel = button.textContent;
  var submitting = false;

  var SUCCESS_MESSAGE = "Thanks — your message is on its way. We'll be in touch soon.";
  var FAILURE_MESSAGE = "Sorry, your message didn't go through. Please try again in a moment, or email us at " + email + ".";
  var CHECK_FIELDS_MESSAGE = "Please check the highlighted fields and try again.";
  var FIELDS = ["name", "email", "company", "message"];

  /* ---------- helpers ---------- */
  function showBox(box, text) {
    box.textContent = text;
    box.hidden = false;
    box.setAttribute("data-fs-active", "");
    box.focus();
  }

  function hideBox(box) {
    box.hidden = true;
    box.removeAttribute("data-fs-active");
    box.textContent = "";
  }

  function setFieldError(field, message) {
    var error = document.getElementById(field.id + "-error");
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (!error) return;
    error.textContent = message || "";
    error.hidden = !message;
    if (message) error.setAttribute("data-fs-active", "");
    else error.removeAttribute("data-fs-active");
  }

  function checkField(field) {
    var valid = field.checkValidity();
    setFieldError(field, valid ? "" : field.dataset.error || "Please check this field.");
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

  function clearFieldErrors() {
    form.querySelectorAll("[data-fs-field]").forEach(function (field) { setFieldError(field, ""); });
  }

  /* ---------- our checks run before Formspree sees the submit ---------- */
  form.setAttribute("novalidate", "");

  // Capture phase on document fires before any listener on the form itself,
  // so an invalid or duplicate submit never reaches the Formspree library.
  document.addEventListener("submit", function (e) {
    if (e.target !== form) return;
    hideBox(successBox);
    hideBox(errorBox);
    if (submitting || !validate()) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  // Once a field has been flagged, clear its message as soon as it's fixed.
  ["input", "change"].forEach(function (type) {
    form.addEventListener(type, function (e) {
      if (e.target.getAttribute && e.target.getAttribute("aria-invalid") === "true") checkField(e.target);
    });
  });

  /* ---------- Formspree ---------- */
  formspree("initForm", {
    formElement: "#contact-form",
    formId: "myezrvvw",
    useDefaultStyles: false, // keep the site's own styles (and its security policy)

    // Submitting state: one click, one submission.
    disable: function () {
      submitting = true;
      form.setAttribute("aria-busy", "true");
      button.disabled = true;
      button.textContent = "Sending…";
    },
    enable: function () {
      submitting = false;
      form.removeAttribute("aria-busy");
      button.disabled = false;
      button.textContent = buttonLabel;
    },

    // Server-side field problems: show our plain-English message on that field.
    renderFieldErrors: function (context, error) {
      clearFieldErrors();
      if (!error || typeof error.getFieldErrors !== "function") return;
      FIELDS.forEach(function (name) {
        var problems = error.getFieldErrors(name);
        var field = form.elements[name];
        if (field && problems && problems.length) {
          setFieldError(field, field.dataset.error || "Please check this field.");
        }
      });
    },

    renderFormError: function (context, message) {
      if (message === null) hideBox(errorBox);
      else showBox(errorBox, FAILURE_MESSAGE);
    },

    renderSuccess: function (context, message) {
      if (message === null) hideBox(successBox);
      else showBox(successBox, SUCCESS_MESSAGE);
    },

    onSuccess: function () {
      form.reset();
      clearFieldErrors();
      hideBox(errorBox);
      showBox(successBox, SUCCESS_MESSAGE);
    },

    // Formspree rejected the submission (e.g. a field it considers invalid).
    // Everything the visitor typed stays in place.
    onError: function (context, error) {
      var fieldProblem = form.querySelector('[data-fs-field][aria-invalid="true"]');
      showBox(errorBox, fieldProblem ? CHECK_FIELDS_MESSAGE : FAILURE_MESSAGE);
    },

    // Network or unexpected failure. Everything the visitor typed stays in place.
    onFailure: function () {
      showBox(errorBox, FAILURE_MESSAGE);
    }
  });
})();
