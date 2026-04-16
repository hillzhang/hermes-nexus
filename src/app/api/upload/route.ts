import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

export async function POST(req: NextRequest) {
  try {
    const { image, filename, type } = await req.json(); // 'image' is the generic data field here
    if (!image) return NextResponse.json({ error: 'No file data' }, { status: 400 });

    // 1. Determine persistent data path
    const configPath = process.env.HERMES_CONFIG_PATH || path.join(os.homedir(), '.hermes', 'config.yaml');
    const baseDir = path.dirname(configPath);
    const uploadDir = path.join(baseDir, 'uploads');

    // 2. Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    try { fs.chmodSync(uploadDir, 0o777); } catch(e) {}

    // 3. Save file with intelligent naming
    let safeFilename = filename || `upload_${Date.now()}.txt`;
    
    // Determine extension from original filename if possible
    const ext = path.extname(safeFilename);
    const base = path.basename(safeFilename, ext);
    
    // Ensure we have a hermes-ui prefix for tracking
    if (!safeFilename.startsWith('ui_upload_')) {
      safeFilename = `ui_upload_${Date.now()}_${base}${ext || '.txt'}`;
    }
    
    const filePath = path.join(uploadDir, safeFilename);
    
    // For non-images, data might come in as raw text or base64
    let buffer: Buffer;
    if (image.startsWith('data:')) {
      const base64Data = image.replace(/^data:.*?;base64,/, "");
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      buffer = Buffer.from(image, 'utf8');
    }

    fs.writeFileSync(filePath, buffer);
    try { fs.chmodSync(filePath, 0o666); } catch(e) {}

    // 4. Housekeeping (Dynamic limit from config)
    try {
      let maxFiles = 100;
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(configContent) as any;
        if (config?.storage?.upload_retention_limit) {
          maxFiles = parseInt(config.storage.upload_retention_limit);
        } else if (config?.storage?.image_retention_limit) {
          maxFiles = parseInt(config.storage.image_retention_limit);
        }
      }

      const files = fs.readdirSync(uploadDir)
        .map(file => ({
          name: file,
          time: fs.statSync(path.join(uploadDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length > maxFiles) {
        files.slice(maxFiles).forEach(f => {
          try { fs.unlinkSync(path.join(uploadDir, f.name)); } catch(e) {}
        });
      }
    } catch (e) {}

    // 5. Path Resolution
    let finalPath = '';
    if (process.env.HERMES_CONFIG_PATH && process.env.HERMES_CONFIG_PATH.startsWith('/data')) {
      finalPath = filePath.replace(baseDir, '/data');
    } else {
      finalPath = `~/.hermes/uploads/${safeFilename}`;
    }

    return NextResponse.json({ 
      success: true, 
      path: finalPath,
      filename: safeFilename,
      isImage: type?.startsWith('image/')
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
