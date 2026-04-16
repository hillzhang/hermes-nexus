import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CONFIG_PATH = process.env.HERMES_CONFIG_PATH || path.join(os.homedir(), '.hermes', 'config.yaml');

export async function GET() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return NextResponse.json({ content: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read config.yaml' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) throw new Error('No content provided');
    
    // Backup before saving
    await fs.copyFile(CONFIG_PATH, `${CONFIG_PATH}.bak`);
    
    await fs.writeFile(CONFIG_PATH, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config.yaml' }, { status: 500 });
  }
}
