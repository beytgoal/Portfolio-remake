import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const FETCH_PATCH_SCRIPT = `<script>
(function() {
  var props = ['fetch', 'Request', 'Response', 'Headers'];
  for (var i = 0; i < props.length; i++) {
    (function(p) {
      try {
        var val = window[p];
        Object.defineProperty(window, p, {
          get: function() { return val; },
          set: function(v) { val = v; },
          configurable: true,
          enumerable: true
        });
      } catch (e1) {
        try {
          var proto = Object.getPrototypeOf(window);
          if (proto) {
            Object.defineProperty(proto, p, {
              get: function() { return val; },
              set: function(v) { val = v; },
              configurable: true,
              enumerable: true
            });
          }
        } catch (e2) {}
      }
    })(props[i]);
  }
})();
</script>`;

// Serve static assets first from public and root
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Serve HTML pages with injected scripts if needed
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    let reqPath = req.path;
    if (reqPath === '/') reqPath = '/index.html';
    if (!path.extname(reqPath)) reqPath += '.html';

    const filePath = path.join(__dirname, reqPath);
    if (filePath.endsWith('.html') && fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replaceAll('opacity:0', 'opacity:1').replaceAll('translateY(16px)', 'translateY(0px)');
      if (!content.includes('props=')) {
        content = content.replace('<head>', '<head>' + FETCH_PATCH_SCRIPT);
      }
      if (!content.includes('liquid-glass.js')) {
        content = content.replace('</head>', '<script src="/liquid-glass.js" defer></script></head>');
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(content);
    }
  }
  next();
});

// Fallback route: Return index.html ONLY for page requests, 404 for assets
app.use((req, res) => {
  const ext = path.extname(req.path);
  // If requesting a static file extension or _next chunk that does not exist, return 404
  if (ext && ext !== '.html') {
    return res.status(404).send('Not Found');
  }
  if (req.path.startsWith('/_next/')) {
    return res.status(404).send('Not Found');
  }

  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    content = content.replaceAll('opacity:0', 'opacity:1').replaceAll('translateY(16px)', 'translateY(0px)');
    if (!content.includes('props=')) {
      content = content.replace('<head>', '<head>' + FETCH_PATCH_SCRIPT);
    }
    if (!content.includes('liquid-glass.js')) {
      content = content.replace('</head>', '<script src="/liquid-glass.js" defer></script></head>');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(content);
  }
  res.status(404).send('Not Found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
