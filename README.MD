# Food Rescue Backend 🚀

## 📖 Deskripsi Proyek
**Food Rescue Backend** adalah inti sistem (API) untuk aplikasi Food Rescue, sebuah platform yang menjembatani restoran (Merchant) dengan pelanggan (Customer) untuk membeli dan menyelamatkan makanan berlebih dengan harga yang lebih terjangkau guna mencegah pemborosan makanan (*Food Waste*). Backend ini dibangun menggunakan arsitektur RESTful API modern berbasis Node.js yang modular dan efisien.

---

## 🛠 Teknologi Utama
- **Node.js & Express.js**: Framework utama backend.
- **PostgreSQL Supabase**: Database relasional yang tangguh.
- **Prisma ORM**: *Object-Relational Mapper* untuk interaksi yang mulus dan *type-safe* dengan database.
- **Socket.io**: Implementasi WebSocket untuk memberikan notifikasi pesanan masuk (*real-time*) ke sisi restoran/merchant tanpa jeda.
- **Cloudinary & Multer**: Solusi pengunggahan (*upload*) dan penyimpanan gambar makanan yang teroptimasi di komputasi awan.
- **JSON Web Token (JWT) & bcrypt**: Sistem autentikasi, enkripsi password, dan manajemen hak akses.

---

## 🏗 Arsitektur & Alur Kerja (*Workflow*)
Aplikasi ini menggunakan pola struktural **Route - Controller - Middleware - Database** untuk memastikan pemisahan *concern* (tanggung jawab) yang jelas antar komponen.

### 1. Sistem Autentikasi & *Role-Based Access*
Sistem kami menerapkan dua lapis pengguna utama:
- **CUSTOMER**: Pengguna biasa yang bisa mengeksplorasi makanan, melihat profil restoran, melakukan _checkout_ pesanan (Order), serta meninggalkan ulasan (Review).
- **MERCHANT**: Pemilik restoran. Ketika seorang pengguna mendaftar sebagai Merchant, sistem akan otomatis mendaftarkan profil restorannya. Merchant memiliki hak istimewa untuk mengunggah produk, memulai *Flash Sale*, dan memperbarui status pesanan pelanggannya.

> **Keamanan**: Akses API diamankan menggunakan _Middleware_ JWT fleksibel yang mendeteksi token baik melalui `Authorization Header` maupun `HTTP-Cookie`. Endpoint spesifik milik restoran diamankan lebih lanjut oleh _Role Middleware_ (`isMerchant`).

### 2. Alur Pembelian (*Order Flow*) & Transaksi Database
Akurasi data adalah hal mutlak dalam pesanan makanan. Ketika seorang pelanggan mengeklik pesan:
1. **Pengecekan Stok**: Sistem memvalidasi ketersediaan stok produk (menghindari fenomena *overselling*).
2. **Kalkulasi Biaya Cerdas**:
   - Sistem akan mengecek apakah total pendapatan (*totalRevenue*) restoran sudah lebih dari Rp 500.000. Jika iya, sistem mulai menerapkan biaya platform kepada pembeli dan memotong pajak komisi penjualan (5%) secara dinamis.
3. **Database Transaction (ACID)**:
   - Pengurangan stok dan pencatatan riwayat pesanan (`Order`) dibungkus dalam satu blok transaksi Prisma (`prisma.$transaction`). Jika ada satu langkah yang gagal, maka seluruh proses akan digagalkan (_rollback_) agar data tetap akurat dan konsisten.
4. **Real-time Broadcast**: Menggunakan `Socket.io`, notifikasi `"pesanan_baru"` langsung dipancarkan (_emit_) kepada Merchant yang sedang online untuk langsung menyiapkan makanan.

### 3. Siklus Hidup Pesanan (*Order Status Lifecycle*)
Pesanan memiliki status berurutan yang dapat diatur oleh Merchant:
`WAITING_PAYMENT` ➔ `PREPARING` ➔ `READY_FOR_PICKUP` / `ON_THE_WAY` ➔ `COMPLETED`
* Jika pesanan **dibatalkan (`CANCELLED`)**, sistem di backend akan secara otomatis **merestorasi (mengembalikan) stok makanan** ke sistem agar bisa dibeli orang lain.
* Jika pesanan **selesai (`COMPLETED`)**, **total pendapatan restoran akan ditambahkan** sesuai dengan keuntungan bersih yang didapat dari pesanan tersebut.

### 4. Alur *Review* & Rating Terkontrol
Customer wajib menyelesaikan pesanan (`COMPLETED`) sebelum dapat memberikan *rating* atau ulasan. Untuk menghindari spam dan ulasan palsu:
- Hanya diizinkan memberikan **satu ulasan per pesanan**.
- Pelanggan diberikan batas edit ulasan sebanyak **1 kali** saja.
- Mengedit ulasan tidak diizinkan setelah **30 hari** pesanan berlalu.

---

## 📂 Struktur Direktori Backend
```text
food-rescue-be/
│
├── prisma/               # Konfigurasi ORM Prisma dan Schema Database
│   └── schema.prisma     # Definisi pemodelan database relasional (User, Restaurant, Order, Review, dll)
│
├── src/                  # Kode Sumber Utama
│   ├── config/           # Konfigurasi Database Adapter & Cloudinary
│   ├── controllers/      # Logika Bisnis Utama (Auth, Order, Product, Review, dll)
│   ├── middlewares/      # Penengah Request (JWT Auth, Role Guard, Multer Upload Parser)
│   ├── routes/           # Definisi Endpoint API (Routing)
│   ├── utils/            # Fungsi Bantuan (seperti JWT Generator)
│   └── app.js            # Entry point Express, CORS, dan Setup Socket.io Server
│
├── .env                  # Environment Variables (Konfigurasi lokal, Rahasia, Port)
└── package.json          # Dependency & Script Command
```

---

## 🚀 Panduan Instalasi (Local Setup)

1. **Kloning Repositori & Instal Dependencies**
   ```bash
   git clone https://github.com/galihpikun/food-rescue-be.git
   cd food-rescue-be
   npm install
   ```

2. **Atur Environment Variables**
   Buat file bernama `.env` di *root folder* proyek dan isi parameter berikut:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/dbname"
   JWT_SECRET="your_secure_secret_key"
   JWT_EXPIRES_IN="7d"
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

3. **Inisialisasi Database**
   Lakukan *push* skema Prisma untuk men-generate struktur tabel ke PostgreSQL lokal Anda:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Menyalakan Server**
   Gunakan script bawaan untuk menjalankan mode *development*:
   ```bash
   npx nodemon src/app.js
   ```
   _Server akan berjalan dan mendengarkan port 8000 secara default._

---

## 🌐 Dokumentasi Singkat API (Highlight)

*   **Autentikasi:**
    *   `POST /api/auth/register` - Pendaftaran user / merchant
    *   `POST /api/auth/login` - Menghasilkan token JWT
*   **Makanan (Products):**
    *   `GET /api/products` - Fitur pencarian produk beserta pagination (Paging)
    *   `POST /api/products` - Penambahan makanan berlebih beserta unggah gambar (Merchant Only)
*   **Pesanan (Orders):**
    *   `POST /api/orders` - Membuat transaksi pembelian (Customer)
    *   `PUT /api/orders/:id/status` - Merubah jalur hidup pesanan (Merchant Only)
*   **Ulasan (Reviews):**
    *   `POST /api/reviews/create` - Memberi rating
    *   `GET /api/reviews/restaurant/:restaurantId` - Analitik ulasan untuk suatu restoran
