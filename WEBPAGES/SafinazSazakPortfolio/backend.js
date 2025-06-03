// WEBPAGES/SafinazSazakPortfolio/backend.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router(); // Use Express Router instead of app

// CORS (Cross-Origin Resource Sharing) ayarları
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Resim URL'lerini döndüren API endpoint'i
// Bu endpoint, /SafinazSazakPortfolio/api/artworks olarak erişilebilir olacak.
router.get('/api/artworks', (req, res) => {
    // 'artworks' klasörünün yolu, backend.js'nin bulunduğu dizine göre ayarlanır.
    // Yani, WEBPAGES/SafinazSazakPortfolio/artworks
    const artworksDir = path.join(__dirname, 'artworks');
    fs.readdir(artworksDir, (err, files) => {
        if (err) {
            console.error("Artworks klasörü okunamadı:", err);
            return res.status(500).json({ error: "Resimler yüklenemedi." });
        }

        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });

        imageFiles.sort((a, b) => {
            const numA = parseInt(a.split('.')[0]);
            const numB = parseInt(b.split('.')[0]);
            return numA - numB;
        });

        // Her resim için göreceli URL oluştur (e.g., /SafinazSazakPortfolio/artworks/0.png)
        // Önemli: Frontend'in bu URL'leri doğru şekilde çözebilmesi için portföyün ana yolunu ekliyoruz.
        const imageUrls = imageFiles.map(file => `/SafinazSazakPortfolio/artworks/${file}`);
        res.json({ imageUrls });
    });
});

// Express Router'ı dışa aktar
module.exports = router;
