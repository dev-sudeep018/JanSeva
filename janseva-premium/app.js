import { normalizeSavedReferences, suggestCategory } from "./features.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const REFERENCE_STORE = "janseva_reference_ids_v2";
const categories = [
  {
    name: "Roads & Infrastructure",
    icon: "road",
    desc: "Potholes, damaged roads, footpaths, drainage and public infrastructure.",
    hint: "Mention the road name, nearest landmark and approximate location.",
  },
  {
    name: "Water Supply",
    icon: "water",
    desc: "Water interruptions, leaking pipes, low pressure and supply concerns.",
    hint: "Include the affected street, timing and type of water issue.",
  },
  {
    name: "Sanitation & Waste",
    icon: "waste",
    desc: "Garbage collection, overflowing bins, public cleanliness and waste disposal.",
    hint: "Share the location and how long the issue has continued.",
  },
  {
    name: "Street Lighting",
    icon: "light",
    desc: "Non-working streetlights, dark public areas and damaged lighting.",
    hint: "Add a pole number or nearby landmark if available.",
  },
  {
    name: "Public Health",
    icon: "plus",
    desc: "Public hygiene concerns, stagnant water and environmental health risks.",
    hint: "Describe the concern and public area affected; avoid sensitive personal data.",
  },
  {
    name: "Other Public Services",
    icon: "grid",
    desc: "Other civic issues that do not fit the listed categories.",
    hint: "Describe the service and responsible public location as clearly as possible.",
  },
];

let trackedCases = [];
let adminCases = [];
let adminAuthenticated = false;

function esc(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function toast(message) {
  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  $("#toastRegion").append(element);
  setTimeout(() => element.remove(), 3600);
}

function statusClass(status) {
  if (status === "Resolved") return "status-resolved";
  if (status === "In Progress" || status === "Awaiting Information")
    return "status-progress";
  if (status === "Closed") return "status-closed";
  return "";
}

function statusPill(status) {
  return `<span class="status-pill ${statusClass(status)}">${esc(status)}</span>`;
}

function iconMarkup(name) {
  return `<svg class="ui-icon" aria-hidden="true"><use href="#icon-${esc(name)}"></use></svg>`;
}

function shortDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function storedReferences() {
  try {
    const value = JSON.parse(localStorage.getItem(REFERENCE_STORE) || "[]");
    return normalizeSavedReferences(value);
  } catch {
    return [];
  }
}

function rememberReference(id) {
  const references = normalizeSavedReferences([
    id,
    ...storedReferences().filter((value) => value !== id),
  ]);
  localStorage.setItem(REFERENCE_STORE, JSON.stringify(references));
}

let suggestedCategory = null;

function updateCategorySuggestion() {
  const text = `${$("#subject")?.value || ""} ${$("#description")?.value || ""}`;
  const suggestion = suggestCategory(text);
  const panel = $("#categorySuggestion");
  if (!panel) return;

  suggestedCategory = suggestion?.category || null;
  const alreadySelected = $("#category")?.value === suggestedCategory;
  panel.classList.toggle("hidden", !suggestion || alreadySelected);
  if (!suggestion || alreadySelected) return;

  $("#suggestionTitle").textContent = `Suggested: ${suggestion.category}`;
  $("#suggestionReason").textContent =
    `${suggestion.reason} You can keep your own selection.`;
}

$("#subject")?.addEventListener("input", updateCategorySuggestion);
$("#description")?.addEventListener("input", updateCategorySuggestion);
$("#category")?.addEventListener("change", updateCategorySuggestion);
$("#applySuggestion")?.addEventListener("click", () => {
  if (!suggestedCategory) return;
  $("#category").value = suggestedCategory;
  updateCategorySuggestion();
  toast(`Service category set to ${suggestedCategory}.`);
});

async function api(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(path, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error(
        "The service took too long to respond. Please try again.",
      );
    throw new Error(
      "Unable to reach JanSeva. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timeout);
  }
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (!response.ok) {
    const error = new Error(
      payload.error || "The service could not complete that request.",
    );
    error.status = response.status;
    throw error;
  }
  return payload;
}

function navigate(view) {
  $$(".view").forEach((element) =>
    element.classList.toggle("active", element.id === `view-${view}`),
  );
  $$("[data-view]").forEach((button) =>
    button.classList.toggle(
      "active",
      button.dataset.view === view && button.classList.contains("nav-item"),
    ),
  );
  const names = {
    home: "Overview",
    submit: "Submit a grievance",
    track: "Track a grievance",
    directory: "Service directory",
    admin: "Staff console",
  };
  $("#crumbCurrent").textContent = names[view] || "Overview";
  $("#sidebar").classList.remove("open");
  $("#sidebarBackdrop").classList.remove("active");
  $("#mobileMenu").setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "admin") prepareAdmin();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (button) {
    event.preventDefault();
    navigate(button.dataset.view);
  }
});

function setNavigation(open) {
  $("#sidebar").classList.toggle("open", open);
  $("#sidebarBackdrop").classList.toggle("active", open);
  $("#mobileMenu").setAttribute("aria-expanded", String(open));
}
$("#mobileMenu")?.addEventListener("click", () =>
  setNavigation(!$("#sidebar").classList.contains("open")),
);
$("#sidebarBackdrop")?.addEventListener("click", () => setNavigation(false));
$("#helpButton")?.addEventListener("click", () =>
  toast(
    "Submit a grievance, keep its reference ID, and use it to track updates.",
  ),
);
$("#description")?.addEventListener(
  "input",
  (event) =>
    ($("#charCount").textContent = `${event.target.value.length} / 1200`),
);
$("#grievanceForm")?.addEventListener("reset", () =>
  setTimeout(() => {
    $("#charCount").textContent = "0 / 1200";
    updateCategorySuggestion();
  }, 0),
);

$("#grievanceForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');
  const errorRegion = $("#grievanceError");
  errorRegion.textContent = "";
  if (!form.checkValidity()) {
    errorRegion.textContent =
      "Please complete the required fields and correct any invalid values.";
    form.querySelector(":invalid")?.focus();
    form.reportValidity();
    return;
  }
  const data = new FormData(form);
  submit.disabled = true;
  form.setAttribute("aria-busy", "true");
  submit.textContent = "Submitting…";
  try {
    const result = await api("/api/grievances", {
      method: "POST",
      body: JSON.stringify({
        subject: data.get("subject"),
        category: data.get("category"),
        area: data.get("area"),
        description: data.get("description"),
        name: data.get("citizenName"),
        contact: data.get("contact"),
        website: data.get("website"),
      }),
    });
    rememberReference(result.referenceId);
    $("#successRef").textContent = result.referenceId;
    openSuccessModal();
    form.reset();
    await Promise.all([loadTrackedCases(), loadStats()]);
  } catch (error) {
    errorRegion.textContent = error.message;
    errorRegion.focus?.();
  } finally {
    submit.disabled = false;
    form.removeAttribute("aria-busy");
    submit.innerHTML = `Submit grievance ${iconMarkup("arrow")}`;
  }
});

let modalReturnFocus = null;
function openSuccessModal() {
  modalReturnFocus = document.activeElement;
  $("#successModal").classList.remove("hidden");
  $("#closeModal").focus();
}
function closeSuccessModal() {
  $("#successModal").classList.add("hidden");
  modalReturnFocus?.focus?.();
}
$("#closeModal")?.addEventListener("click", closeSuccessModal);
$("#modalHome")?.addEventListener("click", () => {
  closeSuccessModal();
  navigate("home");
});
$("#modalTrack")?.addEventListener("click", () => {
  $("#trackId").value = $("#successRef").textContent;
  closeSuccessModal();
  navigate("track");
  $("#trackForm").requestSubmit();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!$("#successModal").classList.contains("hidden")) closeSuccessModal();
    setNavigation(false);
  }
});
$("#copyRef")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#successRef").textContent);
    toast("Reference ID copied.");
  } catch {
    toast("Please copy the reference ID manually.");
  }
});

function renderTrackingResult(grievance) {
  return `<div class="panel-heading"><div><h3>${esc(grievance.subject)}</h3><span class="case-ref">${esc(grievance.id)}</span></div>${statusPill(grievance.status)}</div>
    <div class="track-help-grid"><div><small class="muted">REFERENCE ID</small><p><b>${esc(grievance.id)}</b></p></div><div><small class="muted">CATEGORY</small><p><b>${esc(grievance.category)}</b></p></div><div><small class="muted">LOCATION</small><p><b>${esc(grievance.area)}</b></p></div><div><small class="muted">SUBMITTED</small><p><b>${shortDate(grievance.createdAt)}</b></p></div></div>
    <div class="status-history"><h4>Status history</h4>${(grievance.history || []).map((history, index) => `<div class="history-item ${index === 0 ? "latest" : ""}"><span></span><div><b>${esc(history.status)}</b><p>${shortDate(history.date)} · ${esc(history.note || "Status updated.")}</p></div></div>`).join("")}</div>`;
}

$("#trackForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("#trackId").value.trim().toUpperCase();
  const output = $("#trackResult");
  output.classList.remove("hidden");
  output.innerHTML =
    '<div class="empty-state"><span class="loading-dot">●</span><strong>Checking your reference…</strong></div>';
  try {
    const { grievance } = await api(
      `/api/grievances/${encodeURIComponent(id)}`,
    );
    rememberReference(grievance.id);
    output.innerHTML = renderTrackingResult(grievance);
    await loadTrackedCases();
  } catch (error) {
    output.innerHTML = `<div class="empty-state">${iconMarkup("search")}<strong>No grievance found</strong><p>${esc(error.message)}</p></div>`;
  }
});

function renderRecent() {
  const list = trackedCases.slice(0, 5);
  $("#recentRows").innerHTML = list
    .map(
      (grievance) =>
        `<tr><td><b>${esc(grievance.id)}</b><span class="case-ref">${shortDate(grievance.createdAt)}</span></td><td class="case-title">${esc(grievance.subject)}</td><td>${esc(grievance.category)}</td><td>${statusPill(grievance.status)}</td></tr>`,
    )
    .join("");
  $("#recentEmpty").classList.toggle("hidden", list.length > 0);
  renderSavedCases();
}

function renderSavedCases() {
  const container = $("#savedCaseRows");
  const empty = $("#savedCaseEmpty");
  if (!container || !empty) return;

  container.innerHTML = trackedCases
    .map(
      (grievance) =>
        `<button class="saved-case" type="button" data-track-reference="${esc(grievance.id)}"><span class="saved-reference"><b>${esc(grievance.id)}</b><small>${shortDate(grievance.createdAt)}</small></span><span class="saved-subject">${esc(grievance.subject)}</span>${statusPill(grievance.status)}<svg class="ui-icon" aria-hidden="true"><use href="#icon-arrow"></use></svg></button>`,
    )
    .join("");
  empty.classList.toggle("hidden", trackedCases.length > 0);
  if ($("#savedCaseCount")) {
    $("#savedCaseCount").textContent = trackedCases.length
      ? `${trackedCases.length} saved`
      : "None yet";
  }
}

$("#savedCasesShortcut")?.addEventListener("click", () => {
  navigate("home");
  $("#savedCasesPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#savedCaseRows")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-track-reference]");
  if (!button) return;
  $("#trackId").value = button.dataset.trackReference;
  navigate("track");
  $("#trackForm").requestSubmit();
});

$("#refreshSavedCases")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  try {
    await loadTrackedCases();
    toast("Saved case statuses refreshed.");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
});

async function loadTrackedCases() {
  const results = await Promise.all(
    storedReferences()
      .slice(0, 10)
      .map(async (id) => {
        try {
          return (await api(`/api/grievances/${encodeURIComponent(id)}`))
            .grievance;
        } catch {
          return null;
        }
      }),
  );
  trackedCases = results.filter(Boolean);
  renderRecent();
}

async function loadStats() {
  try {
    const stats = await api("/api/stats");
    $("#statTotal").textContent = stats.total;
    $("#statPending").textContent = stats.open;
    $("#statResolved").textContent = stats.resolved;
  } catch {
    $("#statTotal").textContent = "—";
    $("#statPending").textContent = "—";
    $("#statResolved").textContent = "—";
  }
}

function renderAdminStats() {
  const total = adminCases.length;
  const resolved = adminCases.filter((item) =>
    ["Resolved", "Closed"].includes(item.status),
  ).length;
  const open = total - resolved;
  $("#adminTotal").textContent = total;
  $("#adminOpen").textContent = open;
  $("#adminResolved").textContent = resolved;
  $("#adminHigh").textContent = adminCases.filter(
    (item) =>
      item.priority === "High" && !["Resolved", "Closed"].includes(item.status),
  ).length;
  $("#navOpenCount").textContent = adminAuthenticated ? open : "•";
}

function renderCases() {
  $("#caseRows").innerHTML = adminCases
    .map(
      (item) =>
        `<tr><td class="case-title">${esc(item.subject)}<span class="case-ref">${esc(item.id)}</span></td><td>${esc(item.category)}</td><td>${esc(item.area)}</td><td>${shortDate(item.createdAt)}</td><td><span class="priority-pill ${item.priority === "High" ? "" : "priority-low"}">${esc(item.priority || "Normal")}</span></td><td>${statusPill(item.status)}</td><td><div class="case-actions"><select data-status-id="${esc(item.id)}" aria-label="Update status for ${esc(item.id)}">${["Submitted", "In Progress", "Awaiting Information", "Resolved", "Closed"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}</select><button class="delete-case" data-delete-id="${esc(item.id)}" type="button">Remove</button></div></td></tr>`,
    )
    .join("");
  $("#caseEmpty").classList.toggle("hidden", adminCases.length > 0);
  renderAdminStats();
}

async function loadAdminCases() {
  const params = new URLSearchParams({
    q: $("#caseSearch")?.value || "",
    status: $("#statusFilter")?.value || "all",
    category: $("#categoryFilter")?.value || "all",
  });
  try {
    const result = await api(`/api/admin/grievances?${params}`);
    adminCases = result.grievances;
    renderCases();
  } catch (error) {
    if (error.status === 401) showAdminLogin();
    else toast(error.message);
  }
}

function showAdminLogin() {
  adminAuthenticated = false;
  adminCases = [];
  $("#adminLoginPanel").classList.remove("hidden");
  $("#adminContent").classList.add("hidden");
  $("#navOpenCount").textContent = "•";
}

function showAdminContent() {
  adminAuthenticated = true;
  $("#adminLoginPanel").classList.add("hidden");
  $("#adminContent").classList.remove("hidden");
}

async function prepareAdmin() {
  try {
    const session = await api("/api/admin/session");
    if (!session.authenticated) return showAdminLogin();
    showAdminContent();
    await loadAdminCases();
  } catch {
    showAdminLogin();
  }
}

$("#adminLoginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Signing in…";
  $("#adminLoginError").textContent = "";
  try {
    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password: new FormData(form).get("password") }),
    });
    form.reset();
    showAdminContent();
    await loadAdminCases();
    toast("Staff session started.");
  } catch (error) {
    $("#adminLoginError").textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Sign in securely";
  }
});

$("#adminLogout")?.addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST", body: "{}" }).catch(
    () => undefined,
  );
  showAdminLogin();
  toast("Staff session ended.");
});

let searchTimer;
$("#caseSearch")?.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadAdminCases, 250);
});
$("#statusFilter")?.addEventListener("change", loadAdminCases);
$("#categoryFilter")?.addEventListener("change", loadAdminCases);
$("#caseRows")?.addEventListener("change", async (event) => {
  const id = event.target.dataset.statusId;
  if (!id) return;
  const previous = adminCases.find((item) => item.id === id)?.status;
  event.target.disabled = true;
  try {
    await api(`/api/admin/grievances/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: event.target.value }),
    });
    await Promise.all([loadAdminCases(), loadStats(), loadTrackedCases()]);
    toast(`Status updated: ${id}`);
  } catch (error) {
    event.target.value = previous;
    toast(error.message);
  } finally {
    event.target.disabled = false;
  }
});
$("#caseRows")?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;
  const id = button.dataset.deleteId;
  if (!window.confirm(`Permanently remove ${id}? This cannot be undone.`))
    return;
  button.disabled = true;
  try {
    await api(`/api/admin/grievances/${encodeURIComponent(id)}`, {
      method: "DELETE",
      body: "{}",
    });
    await Promise.all([loadAdminCases(), loadStats(), loadTrackedCases()]);
    toast(`Removed ${id}.`);
  } catch (error) {
    toast(error.message);
    button.disabled = false;
  }
});

function renderDirectory() {
  const query = ($("#serviceSearch")?.value || "").toLowerCase();
  const list = categories.filter((category) =>
    `${category.name} ${category.desc} ${category.hint}`
      .toLowerCase()
      .includes(query),
  );
  $("#serviceCount").textContent =
    `${list.length} service area${list.length === 1 ? "" : "s"}`;
  $("#serviceGrid").innerHTML = list
    .map(
      (category) =>
        `<article class="service-card"><div class="service-icon">${iconMarkup(category.icon)}</div><h2>${category.name}</h2><p>${category.desc}</p><button class="link-button" data-service="${esc(category.name)}">Raise a request ${iconMarkup("arrow")}</button></article>`,
    )
    .join("");
  $("#serviceGrid")
    .querySelectorAll("[data-service]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        navigate("submit");
        $("#category").value = button.dataset.service;
        toast("Category selected. Add the location and details.");
      }),
    );
}

$("#serviceSearch")?.addEventListener("input", renderDirectory);
$("#exportCsv")?.addEventListener("click", () => {
  if (!adminCases.length) return toast("No cases to export.");
  const columns = [
    "id",
    "subject",
    "category",
    "area",
    "status",
    "priority",
    "createdAt",
    "description",
    "name",
    "contact",
  ];
  const csv = [
    columns.join(","),
    ...adminCases.map((item) =>
      columns
        .map((key) => `"${String(item[key] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `janseva-grievances-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast("CSV export downloaded.");
});

renderDirectory();
renderRecent();
renderAdminStats();
Promise.all([loadStats(), loadTrackedCases()]);

if (window.location.hash === "#staff") navigate("admin");
window.addEventListener("hashchange", () => {
  if (window.location.hash === "#staff") navigate("admin");
});
