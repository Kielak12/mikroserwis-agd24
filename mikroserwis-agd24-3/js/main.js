// === KONFIG ===
const API_BASE = "https://mikroserwis-db.business-kielak.workers.dev"; // <<— Twój Worker

// === MENU (zostawiamy jak było) ===
window.toggleNav = function () {
  const nav = document.getElementById('nav');
  const btn = document.querySelector('.nav-toggle');
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
};

// === WYSYŁKA FORMULARZA DO BAZY D1 PRZEZ WORKERA ===
// Wymagane pola w formularzu: name, phone, device, date
// Dodatkowe (opcjonalne): email, brand, model, issue
window.handleFormSubmit = async function (e) {
  e.preventDefault();
  const form = e.target;

  // sprawdź HTML5 required
  if (!form.checkValidity()) { form.reportValidity(); return false; }

  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  // minimalna walidacja po naszej stronie (żeby zgadzało się z Workerem)
  if (!data.name || !data.phone || !data.device || !data.date) {
    alert("Uzupełnij wymagane pola: imię i nazwisko, telefon, urządzenie, data.");
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/api/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        device: data.device || "",
        brand: data.brand || "",
        model: data.model || "",
        issue: data.issue || "",
        date: data.date || ""
      })
    });
    if (!res.ok) throw new Error("API error");
    await res.json();

    // komunikat na stronie
    const el = document.getElementById('formStatus');
    if (el) el.textContent = "Dziękujemy! Zgłoszenie zapisane. Skontaktujemy się, aby potwierdzić termin.";
    form.reset();
  } catch (err) {
    console.error(err);
    alert("Nie udało się zapisać zgłoszenia. Spróbuj ponownie.");
  }
  return false;
};

// === (OPCJONALNIE) ADMIN – pobranie listy z bazy i wstawienie do tabeli ===
// W admin.html dodaj tbody z id="adminBookings"
window.renderAdminBookings = async function () {
  const tbody = document.getElementById('adminBookings');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/api/bookings`);
    if (!res.ok) throw new Error("API error");
    const items = await res.json();

    tbody.innerHTML = items.map((b, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${b.name || ''}</strong><br><span class="small">${b.email || ''}</span></td>
        <td>${b.phone || ''}</td>
        <td>${b.device || ''}<br><span class="small">${b.brand || ''} ${b.model || ''}</span></td>
        <td>${b.date || ''}</td>
        <td class="small">${b.issue || ''}</td>
        <td class="small">${new Date(b.createdAt).toLocaleString()}</td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7">Błąd ładowania rezerwacji.</td></tr>`;
  }
};

// automatycznie uruchom admin render po załadowaniu strony admina
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('adminBookings')) {
    window.renderAdminBookings();
  }
});


