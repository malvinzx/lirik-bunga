/* ====== PENGATURAN UTAMA — ubah angka di sini ======
   Waktu dalam milidetik (1000 = 1 detik). Panel "Atur" di website mengubah nilai yang sama. */
window.CONFIG = {
  title: "",              // kosong = ambil judul dari file LRC
  audio: "musik.mp3",     // taruh file musikmu di folder ini dengan nama ini (atau ganti namanya di sini)
  syncOffset: 0,          // geser waktu lirik: + = lirik lebih lambat, - = lebih cepat

  wordDelay: 320,         // jeda maksimal antar kata (otomatis dipercepat jika barisnya pendek)
  wordDuration: 1100,     // lama animasi satu kata (blur, naik, putar)
  bloomEvery: 4,          // bunga mekar tiap n kata (0 = mati)
  flowerDensity: 0.6,     // kepadatan bunga latar (0 = tanpa bunga, maks 3)
  fontSize: 1             // ukuran teks (1 = normal)
};
