const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard', (req, res) => {
    const rootPath = path.join(__dirname, 'proxy.html');
    if (fs.existsSync(rootPath)) {
        res.sendFile(rootPath);
    } else {
        res.status(404).send("proxy.html not found.");
    }
});

app.use('/service', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No URL provided.");

    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        followRedirects: true,
        autoRewrite: true,
        // This disguises the request so it looks like it's coming from a real PC
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
            proxyReq.setHeader('Referer', targetUrl);
            proxyReq.setHeader('Origin', targetUrl);
        },
        pathRewrite: { '^/service': '' },
        onProxyRes: function (proxyRes) {
            // Aggressively delete security headers that cause the "jumbled" look
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['x-content-type-options'];
            delete proxyRes.headers['strict-transport-security']; // Bypasses HSTS blocks
            
            // Fixes cookies so the site stays "logged in" or keeps settings
            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => 
                    cookie.replace(/Domain=[^;]+;?/, '').replace(/SameSite=(Lax|Strict)/g, 'SameSite=None') + '; Secure'
                );
            }
        },
        onError: (err, req, res) => {
            res.status(500).send("Proxy Error: The destination refused to connect.");
        }
    })(req, res, next);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Stealth System Active on ${PORT}`);
});
