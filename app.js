const STATUS = {baru:"Baru", ditangani:"Sedang ditangani", selesai:"Selesai"};
const COLOR = {baru:"#c9302c", ditangani:"#d98e04", selesai:"#2e7d32"};

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = d => new Date(d).toLocaleString("id-ID", {dateStyle:"medium", timeStyle:"short"});

let sb = null;
try { if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY); } catch (e) { console.error(e); }
$("mode").textContent = sb ? "Terhubung ke database" : "Mode demo";

/* ===== Penyimpanan ===== */
let mem = null;
function seed() {
  const t = Date.now();
  return [
    {id:"s1", created_at:new Date(t-36e5*5).toISOString(), name:"Contoh", category:"Kebakaran lahan", description:"Lahan kosong terbakar dekat jalan lintas, asap mulai menyebar.", lat:-2.9455, lng:104.7132, photo:"", status:"ditangani"},
    {id:"s2", created_at:new Date(t-36e5*30).toISOString(), name:"Contoh", category:"Asap tebal", description:"Asap tebal mengganggu jarak pandang di pagi hari.", lat:-3.0102, lng:104.7691, photo:"", status:"baru"},
    {id:"s3", created_at:new Date(t-36e5*60).toISOString(), name:"Contoh", category:"Kebakaran hutan", description:"Api sudah padam, tersisa area hangus.", lat:-2.9031, lng:104.8210, photo:"", status:"selesai"}
  ];
}

function localRead() {
  if (mem) return mem;
  try { const v = JSON.parse(localStorage.getItem("hsr_reports")); if (Array.isArray(v)) return (mem = v); } catch (e) {}
  mem = seed(); localWrite(); return mem;
}

function localWrite() { try { localStorage.setItem("hsr_reports", JSON.stringify(mem)); } catch (e) {} }

async function loadReports() {
  if (sb) { const {data, error} = await sb.from("reports").select("*").order("created_at", {ascending:false}); if (error) throw error; return data; }
  return [...localRead()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function addReport(r) {
  if (sb) { const {error} = await sb.from("reports").insert(r); if (error) throw error; return; }
  localRead().push({...r, id:"r" + Date.now(), created_at:new Date().toISOString(), status:"baru"}); localWrite();
}

async function setStatus(id, status) {
  if (sb) { const {error} = await sb.from("reports").update({status}).eq("id", id); if (error) throw error; return; }
  const r = localRead().find(x => String(x.id) === String(id)); if (r) { r.status = status; localWrite(); }
}

/* ===== Tab ===== */
let unlocked = false;
document.querySelectorAll("nav button").forEach(b => b.onclick = () => {
  const tab = b.dataset.tab;
  if (tab === "admin" && !unlocked) {
    const pin = prompt("Masukkan PIN petugas:");
    if (pin !== CONFIG.ADMIN_PIN) { if (pin !== null) alert("PIN salah."); return; }
    unlocked = true;
  }
  
  document.querySelectorAll("nav button").forEach(x => x.setAttribute("aria-selected", x === b));
  ["lapor", "peta", "admin"].forEach(id => $(id).hidden = id !== tab);
  if (tab === "lapor") setTimeout(() => pickMap.invalidateSize(), 50);
  if (tab === "peta") { setTimeout(() => map.invalidateSize(), 50); renderMap(); }
  if (tab === "admin") renderAdmin();
});

/* ===== Peta pilih lokasi ===== */
const tiles = () => L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {maxZoom:18, attribution:"Tiles &copy; Esri, HERE, Garmin, OpenStreetMap contributors"});
const pickMap = L.map("pick").setView(CONFIG.CENTER, 12); tiles().addTo(pickMap);
let pickMarker = null, picked = null;
function setPoint(lat, lng, fly) {
  picked = {lat, lng};
  if (!pickMarker) pickMarker = L.marker([lat, lng]).addTo(pickMap); else pickMarker.setLatLng([lat, lng]);
  if (fly) pickMap.setView([lat, lng], 16);
  $("lokasi").textContent = `Dipilih: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

pickMap.on("click", e => setPoint(e.latlng.lat, e.latlng.lng, false));
$("gps").onclick = () => {
  if (!navigator.geolocation) return show("Browser tidak mendukung GPS. Pilih lokasi dengan klik peta.", "err");
  $("lokasi").textContent = "Mencari lokasi…";
  navigator.geolocation.getCurrentPosition(
    p => setPoint(p.coords.latitude, p.coords.longitude, true),
    () => { $("lokasi").textContent = "Lokasi tidak bisa dibaca. Pilih dengan klik peta."; },
    {enableHighAccuracy:true, timeout:10000});
};
if (navigator.geolocation) $("gps").click();


/* ===== Kirim laporan ===== */
function show(text, type) { const m = $("msg"); m.textContent = text; m.className = type; }
function resize(file) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, 800 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", .65));
    };
    img.onerror = () => rej(new Error("Foto tidak bisa dibaca."));
    img.src = url;
  });
}

$("kirim").onclick = async () => {
  const desc = $("deskripsi").value.trim();
  if (!desc) return show("Isi deskripsi kejadian dulu.", "err");
  if (!picked) return show("Pilih lokasi dulu: tekan “Gunakan lokasi saya” atau klik peta.", "err");
  const btn = $("kirim"); btn.disabled = true; show("Mengirim laporan…", "ok");
  try {
    const f = $("foto").files[0];
    const photo = f ? await resize(f) : "";
    await addReport({name:$("nama").value.trim() || "Anonim", category:$("kategori").value, description:desc, lat:picked.lat, lng:picked.lng, photo});
    show("Laporan terkirim. Terima kasih, petugas akan memeriksanya.", "ok");
    $("deskripsi").value = ""; $("foto").value = "";
  } catch (e) { show("Laporan gagal dikirim: " + e.message, "err"); }
  btn.disabled = false;
};

/* ===== Peta pemantauan ===== */
const map = L.map("map").setView(CONFIG.CENTER, 11); tiles().addTo(map);
const layer = L.layerGroup().addTo(map);
async function renderMap() {
  let data = [];
  try { data = await loadReports(); } catch (e) { $("stats").innerHTML = `<p class="hint">Data gagal dimuat: ${esc(e.message)}</p>`; return; }
  layer.clearLayers();
  const count = {baru:0, ditangani:0, selesai:0};
  data.forEach(r => {
    count[r.status] = (count[r.status] || 0) + 1;
    const icon = L.divIcon({className:"", html:`<div class="pin" style="background:${COLOR[r.status] || "#555"}"></div>`, iconSize:[16, 16]});
    L.marker([r.lat, r.lng], {icon}).addTo(layer).bindPopup(
      `<div class="pop"><b>${esc(r.category)}</b><br><span class="tag" style="background:${COLOR[r.status]}">${STATUS[r.status] || esc(r.status)}</span><br>${esc(r.description)}<br><small>${fmt(r.created_at)} · ${esc(r.name)}</small>${r.photo ? `<br><img src="${r.photo}" alt="Foto laporan">` : ""}</div>`);
  });
  $("stats").innerHTML = Object.keys(STATUS).map(k =>
    `<div class="stat" style="border-left-color:${COLOR[k]}"><b>${count[k] || 0}</b><span>${STATUS[k]}</span></div>`).join("");
}

/* ===== Petugas ===== */
async function renderAdmin() {
  let data = [];
  try { data = await loadReports(); } catch (e) { $("rows").innerHTML = `<tr><td colspan="4">Data gagal dimuat: ${esc(e.message)}</td></tr>`; return; }
  $("rows").innerHTML = data.length ? data.map(r => `
    <tr>
      <td>${fmt(r.created_at)}</td>
      <td><b>${esc(r.category)}</b><br>${esc(r.description)}<br><small>${esc(r.name)} · ${(+r.lat).toFixed(4)}, ${(+r.lng).toFixed(4)}</small></td>
      <td>${r.photo ? `<img src="${r.photo}" alt="Foto laporan">` : "–"}</td>
      <td><select data-id="${esc(r.id)}" aria-label="Ubah status">
        ${Object.keys(STATUS).map(k => `<option value="${k}" ${k === r.status ? "selected" : ""}>${STATUS[k]}</option>`).join("")}
      </select></td>
    </tr>`).join("") : `<tr><td colspan="4">Belum ada laporan masuk.</td></tr>`;
  $("rows").querySelectorAll("select").forEach(s => s.onchange = async () => {
    try { await setStatus(s.dataset.id, s.value); } catch (e) { alert("Status gagal diubah: " + e.message); renderAdmin(); }
  });
}


renderMap();