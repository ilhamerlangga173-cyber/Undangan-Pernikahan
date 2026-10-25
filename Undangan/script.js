// ====== PENGATURAN: ubah sesuai acara Anda ======
const TANGGAL_ACARA = new Date('2026-12-20T08:00:00+07:00');
const $ = id => document.getElementById(id);
const toast = new bootstrap.Toast($('toast'), { delay: 2200 });
const info = teks => { $('toastIsi').textContent = teks; toast.show(); };

// Nama tamu dari URL: undangan.html?to=Budi+Santoso
const tamu = new URLSearchParams(location.search).get('to');
if (tamu) $('namaTamu').textContent = tamu;


// Buka undangan + langsung putar musik
$('btnBuka').addEventListener('click', () => {
  $('sampul').classList.add('buka');
  document.body.classList.remove('terkunci');
  setTimeout(() => $('sampul').style.display = 'none', 1000);
  window.scrollTo(0, 0);
  putarMusik(); // dipanggil dari klik pengguna, jadi tidak diblokir browser
});

// Hitung mundur
function hitungMundur() {
  let selisih = Math.max(0, TANGGAL_ACARA - new Date());
  const hari = Math.floor(selisih / 864e5); selisih %= 864e5;
  const jam = Math.floor(selisih / 36e5); selisih %= 36e5;
  const menit = Math.floor(selisih / 6e4);
  const detik = Math.floor((selisih % 6e4) / 1000);
  $('cHari').textContent = hari; $('cJam').textContent = jam;
  $('cMenit').textContent = menit; $('cDetik').textContent = detik;
}
hitungMundur(); setInterval(hitungMundur, 1000);


// ====== AUDIO ======
const bgMusic = $('bg-music');
const audioControl = $('audioControl');
bgMusic.volume = 0.6;

function setAudioUI(menyala) {
  audioControl.classList.toggle('playing', menyala);
  audioControl.textContent = menyala ? '🔊' : '🔇';
  audioControl.title = menyala ? 'Matikan musik' : 'Nyalakan musik';
}

function putarMusik() {
  bgMusic.play()
    .then(() => setAudioUI(true))
    .catch(err => { console.log('Audio gagal diputar:', err); setAudioUI(false); });
}

function toggleAudio() {
  if (bgMusic.paused) {
    putarMusik();
  } else {
    bgMusic.pause();
    setAudioUI(false);
  }
}

audioControl.addEventListener('click', toggleAudio);
setAudioUI(false);


// Salin nomor rekening
document.querySelectorAll('[data-salin]').forEach(tombol => {
  tombol.addEventListener('click', async () => {
    const nomor = $(tombol.dataset.salin).textContent.trim();
    try { await navigator.clipboard.writeText(nomor); info('Nomor rekening disalin'); }
    catch { info('Salin manual: ' + nomor); }
  });
});

// Simpan ke kalender (.ics)
$('btnKalender').addEventListener('click', () => {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
    'SUMMARY:Pernikahan Raka & Anindya', 'DTSTART:20261220T010000Z', 'DTEND:20261220T070000Z',
    'LOCATION:Masjid Al-Akbar dan Graha Pena, Surabaya', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'pernikahan-raka-anindya.ics';
  a.click(); URL.revokeObjectURL(a.href);
  info('Acara disimpan ke kalender');
});

// Ucapan (disimpan di browser; ganti dengan backend/Firebase agar dibaca semua tamu)
const KUNCI = 'ucapan-undangan';
const muat = () => { try { return JSON.parse(localStorage.getItem(KUNCI)) || []; } catch { return []; } };
const simpan = data => { try { localStorage.setItem(KUNCI, JSON.stringify(data)); } catch { } };
let ucapan = muat();

function tampil() {
  const wadah = $('daftarUcapan');
  wadah.innerHTML = '';
  $('jumlah').textContent = ucapan.length ? '(' + ucapan.length + ')' : '';
  if (!ucapan.length) {
    wadah.innerHTML = '<p class="text-secondary">Belum ada ucapan. Jadilah yang pertama.</p>';
    return;
  }
  ucapan.slice().reverse().forEach(u => {
    const d = document.createElement('div'); d.className = 'ucapan';
    const n = document.createElement('b'); n.textContent = u.nama;
    const s = document.createElement('span'); s.className = 'status ms-2'; s.textContent = u.status;
    const p = document.createElement('p'); p.className = 'mb-0'; p.textContent = u.pesan;
    d.append(n, s, p); wadah.appendChild(d);
  });
}
tampil();

$('formUcapan').addEventListener('submit', e => {
  e.preventDefault();
  const nama = $('nama'), pesan = $('pesan');
  nama.classList.toggle('is-invalid', !nama.value.trim());
  pesan.classList.toggle('is-invalid', !pesan.value.trim());
  if (!nama.value.trim() || !pesan.value.trim()) return;
  ucapan.push({ nama: nama.value.trim(), status: $('status').value, pesan: pesan.value.trim() });
  simpan(ucapan); tampil();
  e.target.reset(); info('Ucapan terkirim. Terima kasih!');
});