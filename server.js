const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 10000;

// 1. Serve the "Tutoring" site from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// 2. Secret route to your proxy UI
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'proxy.html'));
});

// 3. The Proxy Engine (The Tunnel)
app.use('/service', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No URL provided.");

    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        followRedirects: true,
        pathRewrite: { '^/service': '' },
        onProxyRes: function (proxyRes) {
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['x-frame-options'];
        },
        onError: (err, req, res) => {
            res.status(500).send("Error: Link invalid or site blocked.");
        }
    })(req, res, next);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server live on port ${PORT}`);
});
