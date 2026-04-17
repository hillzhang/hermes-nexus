import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function GET() {
  try {
    const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
    const skillsPath = path.join(hermesHome, 'skills');
    const level1Entries = await fs.readdir(skillsPath, { withFileTypes: true });

    const skillsList: any[] = [];

    for (const e1 of level1Entries) {
      if (!e1.isDirectory() || e1.name.startsWith('.')) continue;

      const p1 = path.join(skillsPath, e1.name);
      const level2Entries = await fs.readdir(p1, { withFileTypes: true });

      const subDirs = level2Entries.filter(e2 => e2.isDirectory() && !e2.name.startsWith('.'));

      const parseSkill = async (name: string, dir: string, category: string) => {
        let description = 'Hermes localized capability module.';
        try {
          // Check README.md or SKILL.md
          const files = await fs.readdir(dir);
          const metaFile = files.find(f => f.toLowerCase() === 'readme.md' || f.toLowerCase() === 'skill.md');
          if (metaFile) {
            const content = await fs.readFile(path.join(dir, metaFile), 'utf-8');
            description = content.split('\n').find(line => line.trim().length > 0 && !line.startsWith('#')) || description;
          }
        } catch (e) { }

        return {
          name: name, // Preserve original kebab-case
          rawName: name,
          active: true,
          category: category.toUpperCase(),
          description: description.length > 120 ? description.substring(0, 120) + '...' : description.trim(),
        };
      };

      if (subDirs.length === 0) {
        // This is a direct skill in the root
        skillsList.push(await parseSkill(e1.name, p1, 'GENERAL'));
      } else {
        // Subdirectories are the actual skills, e1 is the category
        for (const e2 of subDirs) {
          skillsList.push(await parseSkill(e2.name, path.join(p1, e2.name), e1.name));
        }
      }
    }

    return NextResponse.json(skillsList);
  } catch (error) {
    console.error('Failed to read skills:', error);
    return NextResponse.json({ error: 'Failed to read local skills' }, { status: 500 });
  }
}
