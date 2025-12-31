# Yardımcın - Canlı Destek Sistemi (Live Chat)

Bu proje, web siteleri için modern, hızlı ve özellik açısından zengin bir canlı destek (live chat) uygulamasıdır. Next.js 15, Drizzle ORM ve Pusher kullanılarak geliştirilmiştir.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Özellikler

### Ziyaretçi Widget'ı (Chat Widget)
- **Gerçek Zamanlı Sohbet**: Ziyaretçiler ve temsilciler arasında anlık mesajlaşma.
- **Departman Seçimi**: Ziyaretçiler sohbete başlamadan önce ilgili departmanı (Satış, Teknik Destek vb.) seçebilir.
- **Çevrimdışı Mod (Offline Form)**: Temsilciler çevrimdışı olduğunda ziyaretçiler mesaj bırakabilir.
- **Dosya Gönderimi**: Görsel ve dosya paylaşımı desteği.
- **Puanlama ve Geri Bildirim**: Sohbet sonunda ziyaretçiler deneyimlerini puanlayabilir.
- **Ziyaretçi Tanıma**: LocalStorage ile ziyaretçi oturumu ve bilgileri korunur.

### Yönetim Paneli (Dashboard)
- **Konuşma Yönetimi**: Aktif, bekleyen ve kapanmış konuşmaları listeleme ve yönetme.
- **Detaylı Sohbet Ekranı**: Mesajlaşma, dosya görüntüleme ve ziyaretçi bilgileri.
- **Sahiplenme (Claim)**: Temsilciler gelen konuşmaları sahiplenebilir.
- **Geçmiş ve Arama**: Eski konuşmalar arasında arama yapma ve detaylarını inceleme.
- **İstatistikler**: Toplam konuşma, ortalama yanıt süresi, memnuniyet oranı gibi metrikler.
- **İçerik Yönetimi**: Hazır cevaplar (Canned Responses) ve diğer ayarlar.

## 🛠 Teknolojiler

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Dil**: [TypeScript](https://www.typescriptlang.org/)
- **Veritabanı**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Realtime**: [Pusher](https://pusher.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (v5)

## ⚙️ Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
- Node.js 18+
- PostgreSQL veritabanı (Neon önerilir)

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/kullanici/proje-adi.git
cd proje-adi
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevresel Değişkenleri Ayarlayın
Ana dizinde `.env` dosyası oluşturun ve aşağıdaki değerleri girin:

```env
# Veritabanı (Neon/Postgres)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
AUTH_SECRET="your-super-secret-key" # `openssl rand -base64 32` ile oluşturabilirsiniz
AUTH_URL="http://localhost:3000"

# Pusher (Realtime)
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-app-key"
PUSHER_SECRET="your-app-secret"
PUSHER_CLUSTER="eu"

# Public (Frontend için)
NEXT_PUBLIC_PUSHER_KEY="your-app-key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Veritabanını Hazırlayın
Drizzle kullanarak şemayı veritabanına gönderin:

```bash
npm run db:push
```

Varsayılan admin kullanıcısını oluşturmak için (opsiyonel seed scripti varsa):
```bash
npm run seed:admin
```

### 5. Uygulamayı Başlatın
Geliştirme sunucusunu çalıştırın:
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.
- **Widget Test**: Ana sayfayı ziyaret edin.
- **Dashboard**: `/dashboard` adresine gidin (Giriş yapmanız gerekecektir).

## 📂 Proje Yapısı

```
├── app/                  # Next.js App Router sayfaları ve API rotaları
│   ├── api/             # Backend API endpointleri
│   ├── dashboard/       # Yönetim paneli sayfaları
│   └── page.tsx         # Widget demo sayfası
├── components/           # React bileşenleri
│   ├── dashboard/       # Panel bileşenleri (Chat window, list, vb.)
│   ├── widget/          # Widget bileşenleri (Chat box, input, messages)
│   └── ...
├── drizzle/              # Veritabanı şeması ve migrasyonlar
├── hooks/                # Custom React hooks (useMessages, useRealtime vb.)
├── lib/                  # Yardımcı fonksiyonlar ve konfigürasyonlar (db, auth, pusher)
├── stores/               # Zustand state mağazaları
└── public/               # Statik dosyalar
```

## 🤝 Katkıda Bulunma

1. Forklayın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Pushlayın (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.
