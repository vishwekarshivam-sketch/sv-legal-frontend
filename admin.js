// admin.js — shared by all admin pages
const API_BASE = "https://sv-legal-backend-production.up.railway.app/admin"; // deployed admin API
const ADMIN_PWD = "sunil@svlegal"; // change if needed

/* ========== Authentication ========== */
function checkAuthOrRedirect() {
  if (localStorage.getItem("sv_admin") === "1") return true;
  // if on a login page, do nothing
  if (document.body.dataset.nologin === "1") return true;
  // otherwise redirect to login.html (we'll include simple login modal)
  window.location.href = "/admin-login.html";
  return false;
}

/* ========== Fetch helpers ========== */
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error("API request failed");
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("API request failed");
  return res.json();
}

/* ========== Small UI helpers ========== */
function showModal(htmlContent) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const m = document.createElement("div");
  m.className = "modal";
  m.innerHTML = htmlContent;
  backdrop.appendChild(m);
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  document.body.appendChild(backdrop);
  return { backdrop, modal: m };
}

function closeAllModals() {
  document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
}

/* ========== Common actions ========== */
async function updateStatus(id, status) {
  try {
    await apiPost("/update-status", { id, status });
    alert("Status updated");
    window.location.reload();
  } catch (e) {
    alert("Failed to update status");
  }
}

/* ========== Logging a phone call (used by multiple pages) ========== */
function openLogCallModal(prefill = {}) {
  const html = `
    <h3>Log Phone Call</h3>
    <div class="row">
      <input id="call_name" placeholder="Name" value="${prefill.name || ''}">
      <input id="call_phone" placeholder="Phone" value="${prefill.phone || ''}">
    </div>
    <div class="row">
      <select id="call_type">
        <option value="incoming">Incoming</option>
        <option value="outgoing">Outgoing</option>
        <option value="missed">Missed</option>
      </select>
      <input id="call_time" type="datetime-local" value="">
    </div>
    <textarea id="call_notes" rows="3" placeholder="Notes..."></textarea>
    <div class="actions">
      <button id="call_save">Save</button>
      <button id="call_cancel">Cancel</button>
    </div>
  `;
  const { backdrop, modal } = showModal(html);
  modal.querySelector("#call_cancel").onclick = () => backdrop.remove();
  modal.querySelector("#call_save").onclick = async () => {
    const payload = {
      phone: modal.querySelector("#call_phone").value,
      name: modal.querySelector("#call_name").value,
      callType: modal.querySelector("#call_type").value,
      notes: modal.querySelector("#call_notes").value || ""
    };
    try {
      await apiPost("/log-call", payload);
      alert("Call logged");
      backdrop.remove();
      window.location.reload();
    } catch (e) {
      alert("Failed to log call");
    }
  };
}

/* ========== Open timeline modal for phone ========= */
async function openTimeline(phone) {
  try {
    const data = await apiGet(`/timeline/${encodeURIComponent(phone)}`);
    let html = `<h3>Timeline — ${phone}</h3>`;
    html += `<div style="max-height:400px;overflow:auto">`;
    html += `<h4>Requests</h4>`;
    if (data.requests.length === 0) html += `<div class="small">No requests</div>`;
    data.requests.forEach(r => {
      html += `<div class="card" style="margin:8px;padding:8px">
                <div><b>${r.name}</b> — ${r.formType} <span class="small">(${new Date(r.createdAt).toLocaleString()})</span></div>
                <div class="small">${r.notes || ""}</div>
               </div>`;
    });
    html += `<h4>Calls</h4>`;
    if (data.calls.length === 0) html += `<div class="small">No calls</div>`;
    data.calls.forEach(c => {
      html += `<div class="card" style="margin:8px;padding:8px">
                <div><b>${c.name || "—"}</b> — ${c.callType} <span class="small">(${new Date(c.timestamp).toLocaleString()})</span></div>
                <div class="small">${c.notes || ""}</div>
               </div>`;
    });
    html += `<h4>Appointments</h4>`;
    if (data.appointments.length === 0) html += `<div class="small">No appointments</div>`;
    data.appointments.forEach(a => {
      html += `<div class="card" style="margin:8px;padding:8px">
                <div><b>${a.name}</b> — ${a.date} ${a.time} (${a.mode})</div>
                <div class="small">${a.notes || ""}</div>
               </div>`;
    });
    html += `</div>`;
    const { backdrop } = showModal(html);
    backdrop.querySelector(".modal").innerHTML += `<div class="actions"><button onclick="closeAllModals()">Close</button></div>`;
  } catch (e) {
    alert("Failed to load timeline");
  }
}

/* ========== Add appointment modal ========== */
function openAddAppointment(prefill = {}) {
  const html = `
    <h3>Add Appointment</h3>
    <div class="row">
      <input id="apt_name" placeholder="Name" value="${prefill.name || ''}">
      <input id="apt_phone" placeholder="Phone" value="${prefill.phone || ''}">
    </div>
    <div class="row">
      <input id="apt_date" type="date" value="${prefill.date || ''}">
      <input id="apt_time" type="time" value="${prefill.time || ''}">
    </div>
    <div class="row">
      <select id="apt_mode">
        <option value="office">Office</option>
        <option value="call">Call</option>
        <option value="zoom">Zoom</option>
      </select>
      <input id="apt_notes" placeholder="Notes">
    </div>
    <div class="actions">
      <button id="apt_save">Save</button>
      <button id="apt_cancel">Cancel</button>
    </div>
  `;
  const { backdrop, modal } = showModal(html);
  modal.querySelector("#apt_cancel").onclick = () => backdrop.remove();
  modal.querySelector("#apt_save").onclick = async () => {
    const payload = {
      name: modal.querySelector("#apt_name").value,
      phone: modal.querySelector("#apt_phone").value,
      date: modal.querySelector("#apt_date").value,
      time: modal.querySelector("#apt_time").value,
      mode: modal.querySelector("#apt_mode").value,
      notes: modal.querySelector("#apt_notes").value || ""
    };
    try {
      await apiPost("/add-appointment", payload);
      alert("Appointment added");
      backdrop.remove();
      window.location.reload();
    } catch (e) {
      alert("Failed to add appointment");
    }
  };
}
