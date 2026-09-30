# Laporan Harian Mesin CNC Router — PT Labtech Indonesia

Sistem digital manufaktur terintegrasi untuk pencatatan lembar kerja harian mesin CNC Router (**CNC Quick** & **CNC Tekma**), perawatan mesin & pelumasan oli, pemakaian material PP Flute Board, inspeksi toleransi dimensi, alur persetujuan bertingkat (**Operator ➔ Supervisor Mulyana ➔ General Manager Arifin**), pencadangan cloud Google Drive, serta ekspor format **Cetak PDF A4** & **Excel (.csv)**.

---

## 🛠️ Fitur Utama

1. **Digitalisasi Formulir Fisik Pabrik (A4 Replica)**:
   - Identitas dokumen presisi: No. Dokumen `LAB-FR-CNC-004`, No. SPK (Sosa No), Project, Operator, dan Shift.
   - **Bagian A**: Catatan volume pengisian oli (mL), ketinggian/level oli, pergantian mata pisau (V-Cut, End Mill 3mm, End Mill 6mm), dan kondisi tool.
   - **Bagian B**: Lembar kerja Mesin CNC Quick (Putih) Sheet 1 s/d 6 (Waktu proses, setup, inspeksi, delay & alasan, hasil potong, QC OK/NG).
   - **Bagian C**: Lembar kerja Mesin CNC Tekma (Biru) Sheet 1 s/d 6.
   - **Bagian D**: Rekap pemakaian lembar material PP Flute Board (G4mm, 8mm, F10mm, & material khusus).
   - **Bagian E**: Pengecekan dimensi toleransi (Panjang, Lebar, Tebal dalam mm).
   - **Bagian F**: Catatan pekerjaan lain, pesan antar-shift, dan kendala teknis mesin.

2. **Alur Persetujuan Bertingkat (Multi-Level Workflow)**:
   - **Operator**: Mengisi formulir dan mengajukan laporan (*Digitally Submitted*).
   - **Supervisor (Mulyana)**: Memeriksa fisik lembar kerja & kondisi pisau via deep link HP (`#/spv/[id]`). Dapat menyetujui (*Approve*) atau mengembalikan (*Reject* dengan catatan revisi).
   - **General Manager (Arifin)**: Mengesahkan dokumen final manufaktur via deep link HP (`#/gm/[id]`).

3. **Cetak PDF & Ekspor Excel (.csv)**:
   - Cetak langsung atau simpan ke file PDF format A4 lengkap dengan KOP Dokumen Resmi dan cap tanda tangan digital.
   - Ekspor data laporan ke format spreadsheet CSV Excel (Ringkasan 1 baris/laporan maupun Detail per Sheet Mesin 1–6).

4. **Integrasi Google Drive & Cloud Database**:
   - Pencadangan berkas langsung ke folder Google Drive (`Laporan CNC PT Labtech`).
   - Tersambung dengan database relational Cloud SQL (PostgreSQL via Drizzle ORM) dan Firebase Auth.

---

## 💻 Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat
- Node.js versi 18+ atau 20+
- NPM atau PNPM

### 2. Clone Repository
```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi database atau Firebase jika ingin menggunakan database sendiri (aplikasi juga otomatis fallback ke data store lokal jika database cloud tidak aktif).

### 5. Jalankan Aplikasi
```bash
# Mode Development (Vite + Express Server)
npm run dev

# Atau jalankan build produksi
npm run build
npm run preview
```
Buka browser di `http://localhost:3000`.

---

## 📁 Struktur Direktori
```text
├── src/
│   ├── components/         # Komponen UI (ApprovalView, PhysicalFormPrint, TrackingDashboard, dll.)
│   ├── db/                 # Skema Drizzle ORM PostgreSQL & repository database
│   ├── services/           # Logika penyimpanan, routing persetujuan, mock data, & export CSV
│   ├── types.ts            # Definisi TypeScript laporan CNC & status approval
│   ├── App.tsx             # Routing aplikasi utama
│   └── main.tsx            # Entry point React
├── server.ts               # Express backend dengan Vite middleware & API routes
├── drizzle.config.ts       # Konfigurasi Drizzle ORM
└── package.json            # Daftar dependensi dan scripts
```

---

## 📜 Lisensi
Dikembangkan untuk **PT Labtech Indonesia — Divisi Mesin CNC Router**.
