import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// SESSION_SYSTEM_V4_STABLE
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
    const sessionsDir = path.join(hermesHome, 'sessions');

    if (!fs.existsSync(sessionsDir)) {
      return NextResponse.json([]);
    }

    // LIST MODE
    if (!id) {
      const files = fs.readdirSync(sessionsDir);
      const sessions = files
        .filter(f => f.endsWith('.json') && f.startsWith('session_'))
        .map(f => {
          try {
            const fullPath = path.join(sessionsDir, f);
            const stats = fs.statSync(fullPath);
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            const mid = f.replace('.json', '').replace('session_', '');
            
            // Generate title from first message if missing
            let title = data.title;
            if (!title && data.messages && data.messages.length > 0) {
              const firstMsg = data.messages[0].content;
              title = firstMsg.substring(0, 40) + (firstMsg.length > 40 ? '...' : '');
            }

            return {
              id: mid,
              title: title || 'Untitled Session',
              preview: data.messages?.[data.messages.length - 1]?.content?.substring(0, 80) || 'No messages',
              lastActive: stats.mtime.toISOString()
            };
          } catch { return null; }
        })
        .filter((s): s is { id: string, title: string, preview: string, lastActive: string } => s !== null)
        .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
      
      return NextResponse.json(sessions);
    }

    // DETAIL MODE
    const decodedId = decodeURIComponent(id);
    const files = fs.readdirSync(sessionsDir);
    const targetFile = files.find(f => {
      const b = f.replace('.json', '');
      return b === decodedId || b === `session_${decodedId}` || b.includes(decodedId);
    });

    if (!targetFile) {
      return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    }

    const content = JSON.parse(fs.readFileSync(path.join(sessionsDir, targetFile), 'utf-8'));
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: 'Collapse' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');

    const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
    const sessionsDir = path.join(hermesHome, 'sessions');

    if (!fs.existsSync(sessionsDir)) {
      return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    }

    const files = fs.readdirSync(sessionsDir);
    const toDelete = ids ? ids.split(',') : (id ? [id] : []);

    if (toDelete.length === 0) {
      return NextResponse.json({ error: 'MissingID' }, { status: 400 });
    }

    let deletedCount = 0;
    for (const targetId of toDelete) {
      const decodedId = decodeURIComponent(targetId);
      const targetFile = files.find(f => {
        const b = f.replace('.json', '');
        return b === decodedId || b === `session_${decodedId}` || b === targetId || b.includes(targetId);
      });

      if (targetFile) {
        fs.unlinkSync(path.join(sessionsDir, targetFile));
        deletedCount++;
      }
    }

    return NextResponse.json({ success: true, deleted: deletedCount });
  } catch (error) {
    return NextResponse.json({ error: 'DeleteFailed' }, { status: 500 });
  }
}
