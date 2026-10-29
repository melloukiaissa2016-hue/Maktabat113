import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Ensure uploads directory exists in ES module scope
const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 100MB File upload endpoint with streaming to disk
app.post('/api/upload', (req, res) => {
  const rawFileName = (req.headers['x-filename'] as string) || 'upload_file';
  let decodedFileName = 'file';
  try {
    decodedFileName = decodeURIComponent(rawFileName);
  } catch {
    decodedFileName = rawFileName;
  }
  const safeName = decodedFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const savedName = `${timestamp}_${safeName}`;
  const filePath = path.join(UPLOADS_DIR, savedName);

  const fileStream = fs.createWriteStream(filePath);

  req.pipe(fileStream);

  fileStream.on('finish', () => {
    try {
      const stats = fs.statSync(filePath);
      const mimeType = (req.headers['content-type'] as string) || 'application/octet-stream';
      
      res.json({
        success: true,
        originalName: decodedFileName,
        savedName,
        size: stats.size,
        mimeType,
        downloadUrl: `/uploads/${savedName}`,
        uploadedAt: new Date().toISOString()
      });
    } catch (statErr) {
      console.error('Error stating file:', statErr);
      res.status(500).json({ error: 'Failed to inspect saved file' });
    }
  });

  fileStream.on('error', (err) => {
    console.error('File write error:', err);
    res.status(500).json({ error: 'Failed to write uploaded file' });
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

async function startServer() {
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve dist folder
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maktaba113 server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
