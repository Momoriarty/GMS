const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

// Initialize WhatsApp Web Client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

// QR Code generation for terminal
client.on('qr', (qr) => {
    console.clear();
    console.log('--- SCAN QR CODE DI BAWAH DENGAN WHATSAPP ANDA ---');
    qrcode.generate(qr, { small: true });
    console.log('--------------------------------------------------');
    console.log('Buka WhatsApp -> Perangkat Tertaut -> Tautkan Perangkat');
});

client.on('ready', () => {
    console.clear();
    console.log('==================================================');
    console.log('🟢 WhatsApp Gateway Lokal Berhasil Terkoneksi!');
    console.log('==================================================');
});

client.on('auth_failure', (msg) => {
    console.error('🔴 Gagal melakukan autentikasi:', msg);
});

client.on('disconnected', (reason) => {
    console.log('🔴 WhatsApp terputus:', reason);
});

// API Endpoint to send message
app.post('/send', async (req, res) => {
    const { target, message } = req.body;

    if (!target || !message) {
        return res.status(400).json({ status: false, error: 'Target dan message wajib diisi.' });
    }

    try {
        // Format target number to 62...
        let number = target.replace(/[^0-9]/g, "");
        if (number.startsWith("0")) {
            number = "62" + number.slice(1);
        }
        
        const chatId = number + "@c.us";
        
        // Send message
        await client.sendMessage(chatId, message);
        
        console.log(`[Sent] Pesan terkirim ke: ${number}`);
        res.json({ status: true, message: 'Pesan berhasil terkirim.' });
    } catch (err) {
        console.error(`[Error] Gagal mengirim ke ${target}:`, err.message);
        res.status(500).json({ status: false, error: err.message });
    }
});

// Initialize client
console.log('⏳ Menyiapkan browser WhatsApp Web...');
client.initialize();

// Start HTTP server on port 5000
app.listen(5000, () => {
    console.log('🚀 WhatsApp Gateway API berjalan di http://localhost:5000');
});
