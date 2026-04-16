import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

export async function POST(req: NextRequest) {
  try {
    const { image, filename } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image data' }, { status: 400 });

    // 1. Determine persistent data path
    const configPath = process.env.HERMES_CONFIG_PATH || path.join(os.homedir(), '.hermes', 'config.yaml');
    const baseDir = path.dirname(configPath);
    const uploadDir = path.join(baseDir, 'uploads');

    // 2. Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    try { fs.chmodSync(uploadDir, 0o777); } catch(e) {}

    // 3. Save file
    let safeFilename = filename || `ui_upload_${Date.now()}.jpg`;
    if (!safeFilename.startsWith('ui_upload_')) {
      safeFilename = `ui_upload_${Date.now()}_${safeFilename}`;
    }
    
    const filePath = path.join(uploadDir, safeFilename);
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(filePath, buffer);
    try { fs.chmodSync(filePath, 0o666); } catch(e) {}

    // 4. Housekeeping (DYNAMIC LIMIT FROM CONFIG)
    try {
      let maxFiles = 100; // Default fallback
      
      try {
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf8');
          const config = yaml.load(configContent) as any;
          // Look for storage.image_retention_limit
          if (config?.storage?.image_retention_limit) {
            maxFiles = parseInt(config.storage.image_retention_limit);
          }
        }
      } catch (e) {
        console.warn('[UPLOAD] Failed to read config for maxFiles, using default 100');
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
        console.log(`[CLEANUP] Purged ${files.length - maxFiles} files. (Limit: ${maxFiles})`);
      }
    } catch (e) {}

    // 5. Smart Path Resolver (Host vs Container)
    let finalPath = '';
    if (process.env.HERMES_CONFIG_PATH && process.env.HERMES_CONFIG_PATH.startsWith('/data')) {
      finalPath = filePath.replace(baseDir, '/data');
    } else {
      finalPath = `~/.hermes/uploads/${safeFilename}`;
    }

    return NextResponse.json({ 
      success: true, 
      path: finalPath,
      filename: safeFilename 
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
