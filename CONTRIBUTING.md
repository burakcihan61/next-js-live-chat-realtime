# Katkıda Bulunma Rehberi

Bu projeye katkıda bulunmak istediğiniz için teşekkürler! Aşağıdaki adımları takip ederek sürece dahil olabilirsiniz.

## 🚀 Başlarken

1. **Projeyi Fork'layın**: Sağ üst köşedeki "Fork" butonuna tıklayarak projeyi kendi hesabınıza kopyalayın.
2. **Klonlayın**: Fork'ladığınız projeyi yerel ortamınıza indirin.
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/next-js-live.git
   cd next-js-live
   ```
3. **Bağımlılıkları Yükleyin**:
   ```bash
   npm install
   ```

## 🌿 Geliştirme Süreci

1. **Branch Oluşturun**: Her yeni özellik veya düzeltme için yeni bir dal (branch) açın.
   ```bash
   git checkout -b feature/yeni-ozellik
   # veya
   git checkout -b fix/hata-duzeltmesi
   ```
2. **Kodlama Standartları**:
   - `eslint` ve `prettier` kurallarına uyun.
   - Commit mesajlarınızı açıklayıcı yazın (örn: "feat: yeni mesajlaşma bileşeni eklendi").
3. **Test Edin**: Yaptığınız değişikliklerin çalıştığından emin olun.

## 📮 Pull Request (PR) Gönderme

1. Değişikliklerinizi commit edin ve push'layın.
2. GitHub üzerinde orijinal repoya giderek "New Pull Request" butonuna tıklayın.
3. PR açıklamasında yaptığınız değişiklikleri net bir şekilde ifade edin.

## 📝 Kod Düzeni

Projede `prettier` kullanılmaktadır. Kodunuzu göndermeden önce formatlamayı unutmayın:

```bash
npm run format
```

## 🐞 Hata Bildirimi

Bir hata bulursanız veya öneriniz varsa, lütfen [Issues](https://github.com/KULLANICI/next-js-live/issues) sayfasını kullanarak bildirin.

Teşekkürler! 🎉
