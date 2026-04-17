import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
const CONFIG_PATH = process.env.HERMES_CONFIG_PATH || path.join(hermesHome, 'config.yaml');

function manualParse(yaml: string) {
  const lines = yaml.split('\n');
  const models: any[] = [];

  let currentSection: string | null = null;
  let primaryModel: any = {};
  let inCustomProviders = false;
  let currentProvider: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.search(/\S/);

    // Detect Top Level Sections (Indent 0)
    if (indent === 0 && trimmed.endsWith(':')) {
      const section = trimmed.replace(':', '');
      currentSection = section;
      inCustomProviders = section === 'custom_providers';
      continue;
    }

    // Parse 'model:' section (Primary)
    if (currentSection === 'model') {
      const [key, ...val] = trimmed.split(':');
      if (key && val.length > 0) {
        const k = key.trim();
        const v = val.join(':').trim();
        primaryModel[k] = v;
      }
    }

    // Parse 'custom_providers:' list
    if (inCustomProviders) {
      if (trimmed.startsWith('-')) {
        if (currentProvider) models.push(currentProvider);
        currentProvider = { type: 'CUSTOM' };

        const content = trimmed.substring(1).trim();
        if (content.includes(':')) {
          const [key, ...val] = content.split(':');
          const k = key.trim();
          const v = val.join(':').trim();
          currentProvider[k] = v;
          if (k === 'model') currentProvider.model_name = v;
        }
      } else if (currentProvider && trimmed.includes(':')) {
        const [key, ...val] = trimmed.split(':');
        const k = key.trim();
        const v = val.join(':').trim();
        currentProvider[k] = v;
        if (k === 'model') currentProvider.model_name = v;
      }
    }
  }

  if (currentProvider) models.push(currentProvider);

  const results = [...models];

  // Always ensure the primary system model is visible, even if not in custom_providers
  if (primaryModel.default || primaryModel.model) {
    const pUrl = primaryModel.base_url || 'N/A';
    const pName = primaryModel.default || primaryModel.model;

    // Only add it if it's not already in the custom list to prevent duplicates
    const exists = models.some(m => m.base_url === pUrl && m.model_name === pName);
    if (!exists && pName) {
      results.push({
        name: 'System Default',
        model_name: pName,
        provider: primaryModel.provider || 'custom',
        base_url: pUrl,
        type: 'CUSTOM' // Treat it as custom to keep grouping logic simple
      });
    }
  }

  return results;
}

export async function GET() {
  try {
    const hasAccess = await fs.access(CONFIG_PATH).then(() => true).catch(() => false);
    if (!hasAccess) {
      return NextResponse.json({ models: [], activeModel: 'hermes-agent' });
    }

    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    const baseModels = manualParse(data);

    // Discovery: Probe custom providers for additional models
    const discoveredModels = [...baseModels];
    const customProviders = baseModels.filter(m => m.type === 'CUSTOM');

    // We'll try to fetch all models from unique base_urls
    const uniqueUrls = Array.from(new Set(customProviders.map(p => p.base_url).filter(url => url && url !== 'N/A')));

    const probeResults = await Promise.all(
      uniqueUrls.map(async (url) => {
        try {
          // Standard OpenAI-compatible models endpoint
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for discovery

          const response = await fetch(`${url}/models`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const body = await response.json();
            const models = body.data || body.models || [];
            return { url, models: Array.isArray(models) ? models : [] };
          }
        } catch (e) {
          // Log or ignore probe failures
        }
        return { url, models: [] };
      })
    );

    // Merge discovered models into the list
    probeResults.forEach(({ url, models }) => {
      models.forEach((rm: any) => {
        const modelId = rm.id || rm.name;
        // Check if this specific model-url combo is already in our list
        const exists = discoveredModels.find(dm => dm.base_url === url && dm.model_name === modelId);

        if (!exists && modelId) {
          // Find the original provider info to keep the "friendly name"
          const original = customProviders.find(p => p.base_url === url);
          discoveredModels.push({
            name: original?.name || url.split('//')[1]?.split('/')[0] || 'Discovered Provider',
            model_name: modelId,
            provider: original?.provider || 'custom',
            base_url: url,
            type: 'CUSTOM'
          });
        }
      });
    });

    // 2. Identify current active model and URL from file
    let activeModel = 'hermes-agent';
    let activeBaseUrl = '';

    // Find model: block
    const modelLineIdx = data.split('\n').findIndex(l => l.trim() === 'model:');
    if (modelLineIdx !== -1) {
      const lines = data.split('\n');
      for (let i = modelLineIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const indent = line.search(/\S/);
        if (trimmed === '' || indent === 0) break;
        if (trimmed.includes(':')) {
          const colonIdx = trimmed.indexOf(':');
          const k = trimmed.substring(0, colonIdx).trim();
          const v = trimmed.substring(colonIdx + 1).trim();
          if (k === 'default' || k === 'model') activeModel = v;
          if (k === 'base_url') activeBaseUrl = v;
        }
      }
    }

    // Double check with active_model marker at bottom
    const activeMarkerLine = data.split('\n').find(l => l.trim().startsWith('active_model:'));
    if (activeMarkerLine) {
      const parts = activeMarkerLine.split(':');
      activeModel = parts.slice(1).join(':').trim();
    }

    return NextResponse.json({
      models: discoveredModels,
      activeModel,
      activeBaseUrl
    });
  } catch (error) {
    console.error('Discovery Error:', error);
    return NextResponse.json({ models: [], activeModel: 'hermes-agent', activeBaseUrl: '' });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, model_name, name, provider, base_url, api_key } = body;
    let data = '';
    try {
      data = await fs.readFile(CONFIG_PATH, 'utf-8');
    } catch (e) {
      data = 'model:\n  default: hermes-agent\n  provider: openai\nactive_model: hermes-agent\ncustom_providers:\n';
    }

    if (action === 'scan') {
      try {
        const headers: any = {};
        if (api_key) headers['Authorization'] = `Bearer ${api_key}`;

        const scanUrl = base_url.endsWith('/') ? `${base_url}models` : `${base_url}/models`;
        const res = await fetch(scanUrl, {
          headers,
          signal: AbortSignal.timeout(5000)
        });

        const scanData = await res.json();
        let models: string[] = [];

        if (scanData && Array.isArray(scanData.data)) {
          models = scanData.data.map((m: any) => m.id || m.name);
        } else if (scanData && Array.isArray(scanData)) {
          models = scanData.map((m: any) => m.name || m.id);
        } else if (scanData && scanData.models && Array.isArray(scanData.models)) {
          // Ollama native API format
          models = scanData.models.map((m: any) => m.name);
        }

        return NextResponse.json({ success: true, models });
      } catch (err) {
        console.error('Scan Error:', err);
        return NextResponse.json({ success: false, error: 'Failed to reach endpoint' }, { status: 500 });
      }
    }

    if (action === 'register_batch') {
      const { models } = body;
      if (!Array.isArray(models)) return NextResponse.json({ error: 'Models must be an array' }, { status: 400 });

      let lines = data.split('\n');
      let customIdx = lines.findIndex(l => l.trim().startsWith('custom_providers:'));

      if (customIdx === -1) {
        lines.push('custom_providers:');
        customIdx = lines.length - 1;
      }

      for (const mName of models) {
        const entryName = models.length > 1 ? `${name} (${mName})` : name;
        const newEntry = [
          `  - name: ${entryName}`,
          `    model_name: ${mName}`,
          `    provider: ${provider}`,
          base_url ? `    base_url: ${base_url}` : null,
          api_key ? `    api_key: ${api_key}` : null
        ].filter(Boolean) as string[];

        // Add to lines
        lines.splice(customIdx + 1, 0, ...newEntry);
      }

      await fs.writeFile(CONFIG_PATH, lines.join('\n'));
      return NextResponse.json({ success: true });
    }

    if (action === 'switch') {
      let content = data;
      const modelName = model_name;
      const baseUrl = base_url;

      // Split into lines for controlled processing
      let lines = content.split('\n');
      let currentSection = '';
      let inSpecificProvider = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const indent = line.search(/\S/);

        // Section Detection (Top-level keys like model:, custom_providers:)
        if (indent === 0 && trimmed.endsWith(':')) {
          currentSection = trimmed.replace(':', '');
          inSpecificProvider = false;
        }

        // 1. Handle "active_model:" (Global marker, usually at bottom)
        if (trimmed.startsWith('active_model:')) {
          lines[i] = line.replace(/(active_model:\s*).*$/, `$1${modelName}`);
        }

        // 2. Handle "model:" block (Top-level default)
        if (currentSection === 'model' && indent > 0) {
          if (trimmed.startsWith('default:')) {
            lines[i] = line.replace(/(default:\s*).*$/, `$1${modelName}`);
          }
          if (trimmed.startsWith('base_url:')) {
            lines[i] = line.replace(/(base_url:\s*).*$/, `$1${baseUrl}`);
          }
        }

        // 3. Handle "custom_providers:" block
        if (currentSection === 'custom_providers') {
          if (trimmed.startsWith('- name:')) {
            inSpecificProvider = false;
            // Look ahead to check base_url for this specific provider entry
            let j = i + 1;
            while (j < lines.length && (lines[j].search(/\S/) > indent || lines[j].trim() === '')) {
              if (baseUrl && lines[j].includes(`base_url: ${baseUrl}`)) {
                inSpecificProvider = true;
                break;
              }
              if (lines[j].trim().startsWith('-')) break;
              j++;
            }
          }
          if (inSpecificProvider && trimmed.startsWith('model:') && indent > 0) {
            lines[i] = line.replace(/(model:\s*).*$/, `$1${modelName}`);
          }
        }
      }

      await fs.writeFile(CONFIG_PATH, lines.join('\n'));

      // 4. Force Gateway Restart (Hot-Reload)
      try {
        const { exec } = require('child_process');
        const hermesPath = process.env.HERMES_BIN_PATH || 'hermes';
        const pythonPath = process.env.PYTHON_BIN_PATH || 'python3';

        exec(`${pythonPath} -m hermes gateway run --replace`, (error: any) => {
          if (error) console.error('Gateway restart failed:', error);
        });
      } catch (e) {
        console.error('Failed to initiate gateway restart:', e);
      }

      return NextResponse.json({ success: true, activeModel: model_name, gatewayRestarted: true });
    }

    if (action === 'register') {
      let lines = data.split('\n');
      let customIdx = lines.findIndex(l => l.trim().startsWith('custom_providers:'));

      const newEntry = [
        `  - name: ${name}`,
        `    model_name: ${model_name}`,
        `    provider: ${provider}`,
        base_url ? `    base_url: ${base_url}` : null,
        api_key ? `    api_key: ${api_key}` : null
      ].filter(Boolean) as string[];

      if (customIdx !== -1) {
        // Find existing provider with SAME base_url and name to avoid duplicates
        let existingProviderIdx = -1;
        for (let i = customIdx + 1; i < lines.length; i++) {
          if (lines[i].trim().startsWith('- name: ' + name)) {
            // Optional: check base_url too?
            existingProviderIdx = i;
            break;
          }
          if (lines[i].trim() !== '' && lines[i].search(/\S/) === 0) break; // Reached next section
        }

        if (existingProviderIdx !== -1) {
          // Replace existing block
          let j = existingProviderIdx + 1;
          while (j < lines.length && (lines[j].search(/\S/) > lines[existingProviderIdx].search(/\S/) || lines[j].trim() === '')) {
            j++;
          }
          lines.splice(existingProviderIdx, j - existingProviderIdx, ...newEntry);
        } else {
          lines.splice(customIdx + 1, 0, ...newEntry);
        }
      } else {
        lines.push('', 'custom_providers:', ...newEntry);
      }

      await fs.writeFile(CONFIG_PATH, lines.join('\n'));
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_provider') {
      let lines = data.split('\n');

      // 1. Precise or Batch deletion from custom_providers
      let customIdx = lines.findIndex(l => l.trim().startsWith('custom_providers:'));
      if (customIdx !== -1) {
        let rangesToDelete: { start: number, end: number }[] = [];
        
        for (let i = customIdx + 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim().startsWith('- name:')) {
            let entryMatchesBaseUrl = false;
            let entryMatchesName = false;
            let entryMatchesModel = false;
            
            const targetUrl = base_url ? base_url.replace(/\/$/, '').trim() : '';
            if (name && line.includes(`name: ${name}`)) entryMatchesName = true;

            let k = i + 1;
            let blockEnd = i + 1;
            while (k < lines.length && !lines[k].trim().startsWith('-') && (lines[k].search(/\S/) > line.search(/\S/) || lines[k].trim() === '')) {
              const trimmedK = lines[k].trim();
              if (targetUrl && (trimmedK.startsWith('base_url:'))) {
                const lineUrl = trimmedK.split(':').slice(1).join(':').replace(/\/$/, '').trim();
                if (lineUrl === targetUrl) entryMatchesBaseUrl = true;
              }
              if (model_name && (trimmedK.startsWith('model_name:') || trimmedK.startsWith('model:'))) {
                const modelVal = trimmedK.split(':').slice(1).join(':').trim();
                if (modelVal === model_name) entryMatchesModel = true;
              }
              k++;
              blockEnd = k;
            }

            let shouldDelete = false;
            if (model_name) {
              if (entryMatchesModel && (entryMatchesBaseUrl || entryMatchesName)) shouldDelete = true;
            } else {
              if (entryMatchesBaseUrl || entryMatchesName) shouldDelete = true;
            }

            if (shouldDelete) {
              rangesToDelete.push({ start: i, end: blockEnd });
            }
            i = k - 1;
          }
          if (line.trim() !== '' && line.search(/\S/) === 0 && !line.trim().startsWith('custom_providers:')) break;
        }

        for (let j = rangesToDelete.length - 1; j >= 0; j--) {
          const { start, end } = rangesToDelete[j];
          lines.splice(start, end - start);
        }
      }

      // 2. Handle Primary Source Reset (If it matches our target)
      const modelLineIdx = lines.findIndex(l => l.trim() === 'model:');
      if (modelLineIdx !== -1) {
        let isMatch = false;
        const targetBaseUrl = base_url ? base_url.replace(/\/$/, '').trim() : '';
        for (let i = modelLineIdx + 1; i < lines.length; i++) {
          if (lines[i].trim() === '' || lines[i].search(/\S/) === 0) break;
          const lineBaseUrl = lines[i].includes('base_url:') ? lines[i].split('base_url:')[1].trim().replace(/\/$/, '') : '';
          if (base_url && (lines[i].includes(base_url) || (lineBaseUrl && lineBaseUrl === targetBaseUrl))) isMatch = true;
          if (model_name && lines[i].includes(model_name)) isMatch = true;
        }

        if (isMatch || base_url === 'PRIMARY-SOURCE') {
          for (let i = modelLineIdx + 1; i < lines.length; i++) {
            if (lines[i].trim() === '' || lines[i].search(/\S/) === 0) break;
            if (lines[i].trim().startsWith('default:')) lines[i] = lines[i].replace(/(default:\s*).*$/, '$1hermes-agent');
            if (lines[i].trim().startsWith('base_url:')) lines[i] = lines[i].replace(/(base_url:\s*).*$/, '$1');
            if (lines[i].trim().startsWith('api_key:')) lines[i] = lines[i].replace(/(api_key:\s*).*$/, '$1');
          }
        }
      }

      // 3. Final Safety check: ensure active_model marker at bottom matches the model.default at top
      const defaultModelLine = lines.find(l => l.trim().startsWith('default:'));
      const defaultModel = defaultModelLine ? defaultModelLine.split('default:')[1].trim() : 'hermes-agent';

      let markerUpdated = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('active_model:')) {
          lines[i] = `active_model: ${defaultModel}`;
          markerUpdated = true;
        }
      }
      if (!markerUpdated) {
        lines.push(`active_model: ${defaultModel}`);
      }

      await fs.writeFile(CONFIG_PATH, lines.join('\n'));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
