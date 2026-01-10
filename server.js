const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Waizender Proxy</title>
            <style>
                body {
                    background-color: #121212;
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                h1 {
                    color: #00ff88;
                    font-size: 3rem;
                    margin-bottom: 10px;
                    text-shadow: 0 0 10px rgba(0,255,136,0.3);
                }
                p { color: #888; margin-bottom: 30px; }
                .search-box {
                    background: #1e1e1e;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                input {
                    padding: 15px;
                    width: 400px;
                    border-radius: 8px;
                    border: 1px solid #333;
                    background: #2a2a2a;
                    color: white;
                    outline: none;
                }
                button {
                    padding: 15px 25px;
                    border-radius: 8px;
                    border: none;
                    background: #00ff88;
                    color: #121212;
                    font-weight: bold;
                    cursor: pointer;
                    transition: 0.3s;
                }
                button:hover {
                    background: #00cc6e;
                    transform: scale(1.05);
                }
            </style>
        </head>
        <body>
            <h1>Waizender Proxy</h1>
            <p>Enter a URL below to start browsing securely.</p>
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

        // Fix images and styles
        const baseUrl = new URL(targetUrl).origin;
        html = html.replace('<head>', `<head><base href="${baseUrl}">`);

        res.send(html);
    } catch (err) {
        res.status(500).send("<h1>Error</h1><p>Failed to load the site. Make sure the URL starts with https://</p><a href='/'>Go Back</a>");
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Waizender Proxy is live!`);
});
