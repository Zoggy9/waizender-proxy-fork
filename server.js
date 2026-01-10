const express = require('express');
const axios = require('axios');
const app = express();

// RAILWAY FIX: This tells the app to use Railway's port OR 3000 if local
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Waizender Proxy</title>
            <style>
                body { background-color: #121212; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                h1 { color: #00ff88; }
                .search-box { background: #1e1e1e; padding: 30px; border-radius: 15px; }
                input { padding: 15px; width: 300px; border-radius: 8px; border: none; }
                button { padding: 15px; border-radius: 8px; border: none; background: #00ff88; cursor: pointer; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Waizender Proxy</h1>
            <div class="search-box">
                <form action="/proxy">
                    <input name="url" placeholder="https://example.com" required>
                    <button type="submit">Launch</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.redirect('/');
    try {
        const response = await axios.get(targetUrl);
        let html = response.data;
        const baseUrl = new URL(targetUrl).origin;
        html = html.replace('<head>', `<head><base href="${baseUrl}">`);
        res.send(html);
    } catch (err) {
        res.status(500).send("Error loading site. Use full https:// URL.");
    }
});

// RAILWAY FIX: Must listen on "0.0.0.0" to be visible to the internet
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
