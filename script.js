// Login
function login() {
  const nutzer = document.getElementById("benutzername").value;
  const pass = document.getElementById("passwort").value;

  if (nutzer === "Nadim" && pass === "Midanmirzazada1984@@") {
    sessionStorage.setItem("nutzer", "Nadim");
    window.location.href = "dashboard.html";
  } else {
    alert("Falscher Benutzername oder Passwort.");
  }
}

// Authentifizierung
function authCheck() {
  const user = sessionStorage.getItem("nutzer");
  if (!user) window.location.href = "index.html";
  if (user === "Nadim") document.getElementById("adminLink").innerHTML = '<a href="admin.html">👤 Admin</a>';
}

function logout() {
  sessionStorage.removeItem("nutzer");
  window.location.href = "index.html";
}

// Deutsch formatiertes Datum
function formatDatumDeutsch(datum) {
  const d = new Date(datum);
  return d.toLocaleDateString("de-DE");
}

// Gruppierung nach Monat
function gruppiereNachMonat(eintraege) {
  const gruppiert = {};
  eintraege.forEach(e => {
    const datum = e.datum || e.einkauf || e.verkauf;
    const monat = new Date(datum).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    if (!gruppiert[monat]) gruppiert[monat] = [];
    gruppiert[monat].push(e);
  });
  return gruppiert;
}

// Formular-Sichtbarkeit
function zeigeFormular(typ) {
  document.querySelector("section[data-form='kasse']").style.display = typ === 'kasse' ? 'block' : 'none';
  document.querySelector("section[data-form='handy']").style.display = typ === 'handy' ? 'block' : 'none';
  ladeEintraege();
}

// Kasse laden
function ladeEintraege() {
  const liste = document.getElementById("eintragsListe");
  if (!liste) return;
  liste.innerHTML = "";
  const daten = JSON.parse(localStorage.getItem("smarttecDaten")) || [];
  const gruppiert = gruppiereNachMonat(daten);

  for (const monat in gruppiert) {
    const header = document.createElement("h3");
    header.textContent = `📅 ${monat}`;
    liste.appendChild(header);
    gruppiert[monat].forEach(e => {
      const div = document.createElement("div");
      div.className = "form-group";
      div.innerHTML = `
        <strong>${formatDatumDeutsch(e.datum)}</strong><br>
        Kasse: ${e.kasse} | Guthaben: ${e.guthaben}€ | Ware: ${e.ware}<br>
        Produkt: ${e.produkt} | Auszahlung: ${e.auszahlung} | Rückgabe: ${e.rueckgabe}
      `;
      liste.appendChild(div);
    });
  }
}

// Handy laden
function ladeHandys() {
  const liste = document.getElementById("eintragsListe");
  if (!liste) return;
  liste.innerHTML = "";
  const handys = JSON.parse(localStorage.getItem("smarttecHandys")) || [];
  const gruppiert = gruppiereNachMonat(handys);

  for (const monat in gruppiert) {
    const header = document.createElement("h3");
    header.textContent = `📅 ${monat}`;
    liste.appendChild(header);
    gruppiert[monat].forEach(h => {
      const div = document.createElement("div");
      div.className = "form-group";
      const qrId = "qr_" + h.barcode;

      div.innerHTML = `
        <strong>${h.modell}</strong> (${h.marke})<br>
        Farbe: ${h.farbe} | ${h.gb}GB | Zustand: ${h.zustand}<br>
        SN: ${h.sn} | IMEI: ${h.imei}<br>
        Einkauf: ${formatDatumDeutsch(h.einkauf)} | Verkauf: ${formatDatumDeutsch(h.verkauf)}<br>
        Verpackung: ${h.verpackung}<br>
        <div id="${qrId}" class="qrcode"></div>
        <div style="text-align:center;">${h.barcode}</div>
      `;

      liste.appendChild(div);
      new QRCode(document.getElementById(qrId), `Wert: ${h.guthaben || "?"} €`);
    });
  }
}

// Kasse speichern
function eintragSpeichern() {
  const daten = JSON.parse(localStorage.getItem("smarttecDaten")) || [];
  daten.push({
    datum: document.getElementById("datum").value,
    kasse: document.getElementById("kasse").value,
    guthaben: document.getElementById("guthaben").value,
    ware: document.getElementById("ware").value,
    produkt: document.getElementById("produkt").value,
    auszahlung: document.getElementById("auszahlung").value,
    rueckgabe: document.getElementById("rueckgabe").value
  });
  localStorage.setItem("smarttecDaten", JSON.stringify(daten));
  ladeEintraege();
}

// Handy speichern
function handySpeichern() {
  const handys = JSON.parse(localStorage.getItem("smarttecHandys")) || [];
  const barcode = "HND" + Date.now();
  handys.push({
    modell: document.getElementById("handyModell").value,
    farbe: document.getElementById("handyFarbe").value,
    gb: document.getElementById("handyGB").value,
    sn: document.getElementById("handySN").value,
    imei: document.getElementById("handyIMEI").value,
    batterie: document.getElementById("handyBatterie").value,
    zustand: document.getElementById("handyZustand").value,
    einkauf: document.getElementById("handyEinkauf").value,
    verkauf: document.getElementById("handyVerkauf").value,
    verpackung: document.getElementById("handyVerpackung").value,
    marke: document.getElementById("handyMarke").value,
    guthaben: document.getElementById("handyGuthaben").value,
    barcode: barcode
  });
  localStorage.setItem("smarttecHandys", JSON.stringify(handys));
  ladeHandys();
}

// Suche mit Vorschlägen
function filterSuche() {
  const suchbegriff = document.getElementById("sucheInput").value.toLowerCase();
  const alle = document.querySelectorAll(".form-group");
  alle.forEach(div => {
    div.style.display = div.textContent.toLowerCase().includes(suchbegriff) ? "block" : "none";
  });
}

// Filter nach Marke
function filterMarke(marke) {
  const alle = JSON.parse(localStorage.getItem("smarttecHandys")) || [];
  const gefiltert = alle.filter(h => h.marke && h.marke.toLowerCase().includes(marke.toLowerCase()));
  const liste = document.getElementById("eintragsListe");
  if (!liste) return;
  liste.innerHTML = "";

  gefiltert.forEach(h => {
    const div = document.createElement("div");
    div.className = "form-group";
    const qrId = "qr_" + h.barcode;

    div.innerHTML = `
      <strong>${h.modell}</strong> (${h.marke})<br>
      Farbe: ${h.farbe} | ${h.gb}GB | Zustand: ${h.zustand}<br>
      SN: ${h.sn} | IMEI: ${h.imei}<br>
      Einkauf: ${formatDatumDeutsch(h.einkauf)} | Verkauf: ${formatDatumDeutsch(h.verkauf)}<br>
      Verpackung: ${h.verpackung}<br>
      <div id="${qrId}" class="qrcode"></div>
      <div style="text-align:center;">${h.barcode}</div>
    `;

    liste.appendChild(div);
    new QRCode(document.getElementById(qrId), `Wert: ${h.guthaben || "?"} €`);
  });
}

// PDF Export
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(14);
  doc.text("Kassen-Einträge", 10, y);
  y += 10;
  const kassen = JSON.parse(localStorage.getItem("smarttecDaten")) || [];
  kassen.forEach(e => {
    doc.text(`- ${e.datum}: ${e.kasse}, ${e.guthaben}€, ${e.produkt}`, 10, y);
    y += 7;
  });

  y += 10;
  doc.setFontSize(14);
  doc.text("Handy-Einträge", 10, y);
  y += 10;
  const handys = JSON.parse(localStorage.getItem("smarttecHandys")) || [];
  handys.forEach(h => {
    doc.text(`- ${h.modell} (${h.marke}), ${h.gb}GB, SN: ${h.sn}, Code: ${h.barcode}`, 10, y);
    y += 7;
  });

  doc.save("Smarttec-Daten.pdf");
}

// Excel Export
function exportExcel() {
  const wb = XLSX.utils.book_new();
  const kassen = JSON.parse(localStorage.getItem("smarttecDaten")) || [];
  const handys = JSON.parse(localStorage.getItem("smarttecHandys")) || [];

  const kassenSheet = XLSX.utils.json_to_sheet(kassen);
  const handySheet = XLSX.utils.json_to_sheet(handys);

  XLSX.utils.book_append_sheet(wb, kassenSheet, "Kasse");
  XLSX.utils.book_append_sheet(wb, handySheet, "Handys");

  XLSX.writeFile(wb, "Smarttec-Daten.xlsx");
}
