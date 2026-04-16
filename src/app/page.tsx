'use client';

import { useState, useEffect, useRef } from "react";
import {
  Bot, Database, Terminal, Search, Layers, Settings, Cpu, Network, Activity, History, FolderOpen, Plus, Send, User, Box, ShieldAlert, Shield, ShieldCheck, Lock, Server, Save, X, Globe, Zap, Sun, Moon, Copy, Check, ChevronDown, Trash2, Monitor, RefreshCw, HardDrive, FileText, Image as ImageIcon
} from "lucide-react";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ReactFlow, Background, Controls, Node, Edge, applyNodeChanges, applyEdgeChanges, OnNodesChange, OnEdgesChange, NodeChange, EdgeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  model?: string;
  image?: string | null;
  file?: string | null;
}

const FINAL_NODES: Node[] = [
  { id: 'f1', data: { label: 'USER INTENT' }, position: { x: 400, y: 0 }, style: { width: 160, height: 45, background: '#9b4dff', color: 'var(--foreground)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', fontSize: '13px', fontWeight: '900', letterSpacing: '0.05em' } },
  { id: 'f2', data: { label: 'REASONING CORE' }, position: { x: 200, y: 110 }, style: { width: 160, height: 45, background: '#1e1b2e', color: 'var(--foreground)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #9b4dff', fontSize: '12px', fontWeight: '600' } },
  { id: 'f3', data: { label: 'MEMORY VAULT' }, position: { x: 600, y: 110 }, style: { width: 160, height: 45, background: '#1e1b2e', color: 'var(--foreground)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #9b4dff', fontSize: '12px', fontWeight: '600' } },
  { id: 'f4', data: { label: 'SYNTHESIS' }, position: { x: 400, y: 220 }, style: { width: 160, height: 45, background: '#1e1b2e', color: 'var(--foreground)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #9b4dff', fontSize: '12px', fontWeight: '600' } },
  { id: 'f5', data: { label: 'AGENT RESPONSE' }, position: { x: 400, y: 330 }, style: { width: 160, height: 45, background: '#9b4dff', color: 'var(--foreground)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', fontSize: '13px', fontWeight: '900', letterSpacing: '0.05em' } },
];

const FINAL_EDGES: Edge[] = [
  { id: 'fe1-2', source: 'f1', target: 'f2', style: { stroke: '#9b4dff' } },
  { id: 'fe1-3', source: 'f1', target: 'f3', style: { stroke: '#9b4dff' } },
  { id: 'fe2-4', source: 'f2', target: 'f4', style: { stroke: '#9b4dff' } },
  { id: 'fe3-4', source: 'f3', target: 'f4', style: { stroke: '#9b4dff' } },
  { id: 'fe4-5', source: 'f4', target: 'f5', style: { stroke: '#9b4dff' } },
];

function FinalStableGraph({ isTyping, activeTab }: { isTyping: boolean, activeTab: string }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isTyping) return;
    const itv = setInterval(() => setPhase(p => (p + 1) % 4), 1500);
    return () => clearInterval(itv);
  }, [isTyping]);

  const nodes = FINAL_NODES.map(n => ({
    ...n,
    style: {
      ...n.style,
      boxShadow: (
        (phase === 0 && n.id === 'f1') ||
        (phase === 1 && (n.id === 'f2' || n.id === 'f3')) ||
        (phase === 2 && n.id === 'f4') ||
        (phase === 3 && n.id === 'f5')
      ) ? '0 0 25px #9b4dff' : 'none',
      border: (
        (phase === 0 && n.id === 'f1') ||
        (phase === 1 && (n.id === 'f2' || n.id === 'f3')) ||
        (phase === 2 && n.id === 'f4') ||
        (phase === 3 && n.id === 'f5')
      ) ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
      filter: (
        (phase === 0 && n.id === 'f1') ||
        (phase === 1 && (n.id === 'f2' || n.id === 'f3')) ||
        (phase === 2 && n.id === 'f4') ||
        (phase === 3 && n.id === 'f5')
      ) ? 'brightness(1.5)' : 'brightness(1)',
      transition: 'all 0.3s ease'
    }
  }));

  const edges = FINAL_EDGES.map(e => ({ ...e, animated: isTyping }));

  return (
    <div style={{ width: '100%', height: 'calc(100% - 64px)', position: 'relative' }}>
      <ReactFlow
        key={activeTab + (isTyping ? 'typing' : 'idle')}
        nodes={nodes}
        edges={edges}
        fitView
        style={{ background: '#0D0B14' }}
        colorMode="dark"
      >
        <Background color="#1e1b2e" gap={20} />
      </ReactFlow>
    </div>
  );
}

export default function Home() {
  const CodeBlock = ({ language, children }: { language: string, children: string }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div style={{ position: 'relative', marginTop: '12px' }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10
        }}>
          <div style={{
            fontSize: '9px',
            fontWeight: '800',
            color: 'var(--primary)',
            background: 'rgba(0,0,0,0.5)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(4px)',
            textTransform: 'uppercase'
          }}>
            {language}
          </div>
          <button
            onClick={copyToClipboard}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--glass-border)',
              borderRadius: '4px',
              padding: '4px',
              cursor: 'pointer',
              color: copied ? '#10B981' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            title="Copy to clipboard"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
        <SyntaxHighlighter
          style={atomDark}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '34px 20px 20px 20px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.4)',
            fontSize: '13px',
            lineHeight: '1.6',
            border: '1px solid var(--glass-border)',
            fontFamily: '"Fira Code", monospace'
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    );
  };

  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showConfig, setShowConfig] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadFileType, setUploadFileType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Helper to detect if a model name likely supports vision
  const checkIsVision = (name: string) => {
    const visionKeywords = ['vl', 'vision', 'llava', 'minicpm', 'moondream', 'gpt-4o', 'gpt-4-turbo', 'claude-3', 'gemini-1.5'];
    return visionKeywords.some(key => name.toLowerCase().includes(key));
  };
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCmds, setFilteredCmds] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [skillsSearch, setSkillsSearch] = useState('');
  const [configContent, setConfigContent] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [input, setInput] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('http://localhost:8642');
  const [sessionPersistence, setSessionPersistence] = useState(true);
  const [logFilter, setLogFilter] = useState('ALL');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | string[] | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, title: string, message: string, onConfirm?: () => void }>({ isOpen: false, title: '', message: '' });
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [securityPolicies, setSecurityPolicies] = useState({ p1: true, p2: true, p3: true, p4: true });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [showAddModel, setShowAddModel] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', model_name: '', provider: 'openai', base_url: '', api_key: '' });
  const commands = ['/chat', '/graph', '/skills', '/vault', '/models', '/config', '/security', '/audit', '/clear', '/reset', '/help'];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    if (val.startsWith('/')) {
      const search = val.toLowerCase();
      setFilteredCmds(commands.filter(c => c.startsWith(search)));
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const selectCommand = (cmd: string) => {
    setInput(cmd + ' ');
    setShowCommands(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setLogs([]);
        addLog('SYSTEM :: Console buffer cleared (CTRL+L)');
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setInput('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const mStates = useRef<Record<string, boolean>>({});
  const [generatedCode, setGeneratedCode] = useState<string>('// Neural code buffer empty.\n// Generating code in chat will manifest here.');
  const [codeLanguage, setCodeLanguage] = useState<string>('javascript');
  const [logs, setLogs] = useState<string[]>([
    '[14:32:01] AGENT_HERMES :: IDLE',
    '[14:32:05] VAULT_LINK :: OK',
    '[14:32:08] REASONING_CORE :: STANDBY'
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [gatewayStatus, setGatewayStatus] = useState<'online' | 'offline' | 'connecting'>('offline');
  const [skills, setSkills] = useState<any[]>([]);
  const [activeBaseUrl, setActiveBaseUrl] = useState('');
  const [activeModel, setActiveModel] = useState('');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
  const [isProbingModal, setIsProbingModal] = useState(false);
  const [discoveredModelsInModal, setDiscoveredModelsInModal] = useState<string[]>([]);
  const [batchRegister, setBatchRegister] = useState(false);
  const [modelSettings, setModelSettings] = useState({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 4096,
    contextWindow: 128000
  });

  const fetchSkills = async () => {
    try {
      const resp = await fetch('/api/skills', { cache: 'no-store' });
      const data = await resp.json();
      if (Array.isArray(data)) {
        const iconMap: any = {
          'Terminal': <Terminal size={14} />,
          'Github': <Terminal size={14} />,
          'Browser': <Search size={14} />,
          'Search': <Search size={14} />,
          'File': <FolderOpen size={14} />,
          'Mcp': <Layers size={14} />,
          'Software': <Cpu size={14} />,
          'Devops': <Activity size={14} />,
        };

        const enriched = data.map(s => ({
          ...s,
          icon: Object.keys(iconMap).find(k => s.name.includes(k)) ? iconMap[Object.keys(iconMap).find(k => s.name.includes(k))!] : <Layers size={14} />
        }));
        setSkills(enriched);
      }
    } catch (e) {
      console.error('Failed to fetch skills');
    }
  };

  const fetchConfig = async () => {
    try {
      const resp = await fetch('/api/config', { cache: 'no-store' });
      const data = await resp.json();
      if (data.content) setConfigContent(data.content);
    } catch (e) {
      addLog('ERROR :: Failed to load local config.yaml');
    }
  };

  const saveConfig = async () => {
    setIsSavingConfig(true);
    addLog('SYSTEM :: Synchronizing configuration to disk...');
    try {
      const resp = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: configContent })
      });
      if (resp.ok) {
        addLog('SYSTEM :: config.yaml saved successfully. Backup created.');
      } else {
        throw new Error();
      }
    } catch (e) {
      addLog('ERROR :: Failed to save configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const fetchModels = async (forceInit = false) => {
    try {
      addLog(`SYSTEM :: Synchronizing model registry...`);
      // Also sync the raw config to keep Config Center updated
      fetchConfig();

      const resp = await fetch(`/api/models?t=${Date.now()}`, { cache: 'no-store' });
      const data = await resp.json();
      if (data.models) setAvailableModels(data.models);

      // Only update from backend if we are NOT in the middle of a switch lock
      if (!isSwitching) {
        if (data.activeModel) setActiveModel(data.activeModel.trim());
        if (data.activeBaseUrl) setActiveBaseUrl(data.activeBaseUrl.trim());
      }

      if (forceInit && data.activeModel) addLog(`SYSTEM :: Active node established: ${data.activeModel}`);
    } catch (e) {
      addLog('ERROR :: Failed to fetch dynamic models from config');
    }
  };

  // Add a lock to prevent fetchModels from overwriting the optimistic state too quickly
  const [isSwitching, setIsSwitching] = useState(false);

  const switchModel = async (modelName: string, baseUrl?: string) => {
    try {
      addLog(`SYSTEM :: Initiating brain swap to ${modelName}...`);
      setIsSwitching(true);

      // Optimistic update
      setActiveModel(modelName);
      if (baseUrl) setActiveBaseUrl(baseUrl);

      const resp = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'switch',
          model_name: modelName,
          base_url: baseUrl
        })
      });

      if (resp.ok) {
        addLog(`SUCCESS :: Neural pathway rewired to ${modelName}.`);

        // Wait for persistence and then re-sync
        setTimeout(async () => {
          await fetchModels();
          setIsSwitching(false);
          addLog(`SYSTEM :: Active state verified and locked.`);
        }, 500);
      } else {
        throw new Error('Switch request failed');
      }
    } catch (e) {
      setIsSwitching(false);
      addLog('ERROR :: Brain swap sequence interrupted.');
      fetchModels(); // Revert to actual state
    }
  };

  const removeProvider = async (url: string, name: string, modelName?: string) => {
    const isBatch = !modelName;
    const targetDesc = modelName ? `the [${modelName}] node` : `ALL registered neural nodes under this [${name}] provider group`;

    setConfirmConfig({
      isOpen: true,
      title: isBatch ? 'PURGE PROVIDER GROUP?' : 'PURGE NEURAL NODE?',
      message: `You are about to permanently remove ${targetDesc} from your neural vault. This action cannot be undone.`,
      onConfirm: async () => {
        addLog(`SYSTEM :: Purging ${modelName ? 'node' : 'full provider group'}: ${modelName || name}...`);
        try {
          const cleanUrl = (url === 'INTERNAL' ? 'PRIMARY-SOURCE' : url).replace(/\/$/, '').trim();
          const resp = await fetch('/api/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete_provider',
              base_url: cleanUrl,
              name: name,
              model_name: modelName
            })
          });
          if (resp.ok) {
            addLog(`SYSTEM :: ${modelName ? 'Node' : 'Provider'} successfully purged from the vault.`);
            fetchModels();
          } else {
            throw new Error();
          }
        } catch (e) {
          addLog(`ERROR :: Purge operation failed.`);
        }
      }
    });
  };

  const registerModel = async () => {
    setIsAddingModel(true);
    addLog(`SYSTEM :: Committing ${batchRegister ? 'batch registration' : 'manual endpoint'} to neural vault...`);
    try {
      const payload = batchRegister
        ? { action: 'register_batch', models: discoveredModelsInModal, ...newModel }
        : { action: 'register', ...newModel };

      const resp = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        addLog(`SUCCESS :: ${batchRegister ? discoveredModelsInModal.length : '1'} neural entities registered.`);
        setShowAddModel(false);
        setNewModel({ name: 'Custom Node', model_name: '', provider: 'custom', base_url: '', api_key: '' });
        setDiscoveredModelsInModal([]);
        setBatchRegister(false);
        fetchModels();
      }
    } catch (e) {
      addLog('CRITICAL :: Registration failed.');
    } finally {
      setIsAddingModel(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchModels();
  }, []);


  useEffect(() => {
    const savedUrl = localStorage.getItem('hermes-gateway-url');
    if (savedUrl) setGatewayUrl(savedUrl);
  }, []);

  const checkGateway = async () => {
    try {
      const resp = await fetch(`${gatewayUrl}/v1/models`);
      if (resp.ok) setGatewayStatus('online');
      else setGatewayStatus('offline');
    } catch {
      setGatewayStatus('offline');
    }
  };

  useEffect(() => {
    checkGateway();
    fetchSkills();
    const interval = setInterval(() => {
      checkGateway();
      fetchSkills();
    }, 10000);
    return () => clearInterval(interval);
  }, [gatewayUrl]);

  // Periodic System Log Heartbeat
  useEffect(() => {
    const logInterval = setInterval(() => {
      if (gatewayStatus === 'online') {
        const heartbeats = [
          'SYSTEM :: Telemetry heartbeat stable (Latency: 42ms)',
          'KERNEL :: Synchronizing neural weights...',
          'SHIELD :: Governance watch active - 0 violations',
          'VAULT :: Auto-indexing knowledge fragments...'
        ];
        addLog(heartbeats[Math.floor(Math.random() * heartbeats.length)]);
      }
    }, 8000);
    return () => clearInterval(logInterval);
  }, [gatewayStatus]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions', { cache: 'no-store' });
      const data = await res.json();
      setSessions(data);
    } catch (e) {
      console.error('Failed to fetch sessions');
    }
  };

  const formatLastActive = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  };

  useEffect(() => {
    addLog(`SYSTEM :: Switched context to [${activeTab.toUpperCase()}]`);
    if (activeTab === 'config') {
      fetchConfig();
    }
  }, [activeTab]);

  const resumeSession = async (id: string) => {
    try {
      addLog(`SYSTEM :: Fetching neural bridge for ${id}...`);

      const res = await fetch(`/api/sessions?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Linkage error: ${res.status}`);
      }

      const data = await res.json();
      const rawMessages = Array.isArray(data) ? data : data.messages;

      if (rawMessages && rawMessages.length > 0) {
        // 2. Data Normalization
        const sessionMessages = rawMessages.map((msg: any, idx: number) => ({
          ...msg,
          id: msg.id || `restored-${Date.now()}-${idx}`,
          content: typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content
        }));

        // 3. Atomic State Updates
        setMessages(sessionMessages);
        setActiveTab('chat');

        addLog(`SYSTEM :: Successfully re-linked ${sessionMessages.length} nodes.`);
      } else {
        addLog(`WARN :: Target session ${id} is empty.`);
      }
    } catch (e: any) {
      addLog(`ERROR :: ${e.message || 'Unknown link failure'}`);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      addLog(`SYSTEM :: Initiating purge sequence for ${id}...`);
      const res = await fetch(`/api/sessions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        addLog(`SYSTEM :: Purge successful. Clearing memory fragments.`);
        setSelectedSessions(prev => prev.filter(sid => sid !== id));
        fetchSessions();
        setShowDeleteConfirm(null);
      } else {
        throw new Error('Purge sequence failed.');
      }
    } catch (e: any) {
      addLog(`ERROR :: ${e.message}`);
    }
  };

  const deleteSessions = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      addLog(`SYSTEM :: Initiating batch purge for ${ids.length} artifacts...`);
      const res = await fetch(`/api/sessions?ids=${encodeURIComponent(ids.join(','))}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const data = await res.json();
        addLog(`SYSTEM :: Batch purge successful. ${data.deleted} nodes neutralized.`);
        setSelectedSessions([]);
        fetchSessions();
        setShowDeleteConfirm(null);
      } else {
        throw new Error('Batch purge sequence failed.');
      }
    } catch (e: any) {
      addLog(`ERROR :: ${e.message}`);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') fetchSessions();
  }, [activeTab]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      let attempts = 0;
      const scrollInterval = setInterval(() => {
        const container = chatContainerRef.current || document.getElementById('chat-scroll-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
          chatEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
        attempts++;
        if (attempts > 10) clearInterval(scrollInterval);
      }, 50);

      return () => clearInterval(scrollInterval);
    }
  }, [messages, isTyping, activeTab]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev.slice(-10), `[${time}] ${msg}`]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Aggressive compression for vision artifacts
    const compressImage = (base64Str: string): Promise<{ data: string, size: number }> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1600; // Restore high-res but stay under 1MB limit
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = "#FFFFFF"; 
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8); // 80% High quality
          resolve({ 
            data: compressedBase64, 
            size: Math.round(compressedBase64.length / 1024) 
          });
        };
      });
    };

    let processedFileData = selectedImage;
    let physicalPath = '';
    const isImage = uploadFileType?.startsWith('image/');

    if (processedFileData) {
      // 1. Pre-calculate path
      const currentFilename = uploadFileName || (isImage ? `ui_upload_${Date.now()}.jpg` : `ui_upload_${Date.now()}.txt`);
      const sanitizedFilename = currentFilename.startsWith('ui_upload_') ? currentFilename : `ui_upload_${Date.now()}_${currentFilename}`;
      physicalPath = `~/.hermes/uploads/${sanitizedFilename}`;
      
      addLog(`SYSTEM :: Pre-binding physical path: ${physicalPath}`);
      addLog(`SYSTEM :: Persisting ${isImage ? 'vision' : 'text'} artifact...`);

      try {
        let finalDataToUpload = processedFileData;
        
        // Only compress if it's an image
        if (isImage) {
          const result = await compressImage(processedFileData);
          finalDataToUpload = result.data;
        }

        fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: finalDataToUpload, 
            filename: sanitizedFilename,
            type: uploadFileType 
          })
        }).then(res => res.json()).then(data => {
          if (data.success) addLog(`SUCCESS :: Physical storage confirmed: ${data.path}`);
          else addLog(`ERROR :: Persistence failed: ${data.error}`);
        }).catch(e => addLog(`CRITICAL :: Bridge error: ${e.message}`));

      } catch (err: any) {
        addLog(`CRITICAL :: Processing error: ${err.message}`);
      }
    }

    const userMessageDetail: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: physicalPath 
        ? `${isImage ? '[Attached Image: ' : '[Attached File: '}${physicalPath}]\n\n${input}` 
        : input,
      image: isImage ? (processedFileData || selectedImage) : null,
      file: isImage ? null : (uploadFileName || 'attachment.txt'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessageDetail]);
    setHistory(prev => [input, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);
    setInput('');
    setSelectedImage(null);
    setUploadFileName('');
    setUploadFileType('');
    setIsTyping(true);

    if (input.startsWith('/')) {
      const cmd = input.trim().split(' ')[0].toLowerCase();
      addLog(`[COMMAND] >> EXECUTING: ${cmd.toUpperCase()}`);

      if (cmd === '/clear') {
        setMessages([]);
        setIsTyping(false);
        addLog('SYSTEM :: Chat buffer cleared via /clear');
        return;
      }
    }

    const finalUrl = `${gatewayUrl}/v1/chat/completions`;

    addLog(`USER >> Requesting completion ${userMessageDetail.image ? '(Vision Enabled)' : ''}: "${input.substring(0, 20)}${input.length > 20 ? '...' : ''}"`);
    addLog(`DEBUG :: Dispatched Neural Target -> [${activeModel}]`);
    addLog(`SYSTEM :: Routing via Gateway: ${gatewayUrl}`);
    addLog(`AGENT_HERMES :: Initiating neural session...`);

    try {
      const formattedMessages = [...messages, userMessageDetail].map(m => {
        if (m.image) {
          // Find the path string in the content if it exists
          const pathMatch = m.content.match(/\[Attached Image: (.*?)\]/);
          const currentPath = pathMatch ? pathMatch[1] : '';

          if (currentPath) {
            return {
              role: m.role === 'agent' ? 'assistant' : 'user',
              content: [
                { type: 'text', text: m.content },
                { 
                  type: 'image_url', 
                  image_url: { url: `file://${currentPath}` } // Mimic local file mount
                }
              ]
            };
          }
        }
        return {
          role: m.role === 'agent' ? 'assistant' : 'user',
          content: m.content
        };
      });

      if (userMessageDetail.image) {
        const hash = userMessageDetail.image.substring(userMessageDetail.image.length - 20);
        addLog(`DEBUG :: Multi-modal payload sequence checksum: ...${hash}`);
      }

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: activeModel || 'default',
          messages: formattedMessages,
          // Root-level images array for "mounting" simulation
          images: formattedMessages
            .filter(m => m.images && m.images.length > 0)
            .flatMap(m => m.images),
          stream: true
        })
      });
      
      const bodyPreview = JSON.stringify({ model: activeModel, stream: true });
      addLog(`SYSTEM :: Request dispatched [Size: ${Math.round(JSON.stringify(formattedMessages).length / 1024)}KB]`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream reader initialization failed');

      const decoder = new TextDecoder();
      let agentContent = '';
      const agentMsgId = (Date.now() + 1).toString();

      // Initialize the empty agent message
      setMessages(prev => [...prev, {
        id: agentMsgId,
        role: 'agent',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      addLog(`REASONING :: Receiving neural stream...`);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);

            // Capture the model name from the stream metadata
            const streamModel = parsed.model;

            const content = parsed.choices[0]?.delta?.content || '';
            if (content || streamModel) {
              agentContent += content;
              setMessages(prev => prev.map(m =>
                m.id === agentMsgId ? {
                  ...m,
                  content: agentContent,
                  model: streamModel || m.model
                } : m
              ));

              if (streamModel && !mStates.current[agentMsgId]) {
                addLog(`INTERNAL :: Neural Link Verified -> [${streamModel}]`);
                mStates.current[agentMsgId] = true;
              }
            }
          } catch (e) {
            // Partial JSON or unexpected format
          }
        }
      }

      setIsTyping(false);

      // Extract code block if present
      const codeMatch = agentContent.match(/```(\w+)?\n([\s\S]*?)\n```/);
      if (codeMatch) {
        const lang = codeMatch[1] || 'javascript';
        const code = codeMatch[2];
        setCodeLanguage(lang);
        setGeneratedCode(code);
        addLog(`ARTIFACT :: Autonomous ${lang.toUpperCase()} source extracted to Code Hub.`);
      }

      addLog(`AGENT_HERMES :: Session finalized.`);
    } catch (err) {
      console.error('Hermes Connection Error:', err);
      addLog(`CRITICAL :: ${err instanceof Error ? err.message : 'Unknown network failure'}`);
      setIsTyping(false);

      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'agent',
        content: "⚠️ Connection failed. Please ensure 'hermes gateway' is running and CORS is enabled.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  if (!isClient) return null;
  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'agent',
        content: 'Neural link re-established. Cache cleared. Standby for new instructions.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    addLog('SYSTEM :: Context cleared. New chat session started.');
  };


  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="glass-panel" style={{ padding: '8px', background: 'var(--primary)', borderRadius: '8px' }}>
            <Bot size={20} color="white" />
          </div>
          <h1 className={styles.title}>HERMES CONTROL</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
              <Activity size={14} color={gatewayStatus === 'online' ? '#10B981' : '#EF4444'} />
              <span style={{ fontSize: '13px', fontWeight: '800', color: gatewayStatus === 'online' ? '#10B981' : '#EF4444' }}>
                GATEWAY {gatewayStatus.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {checkIsVision(activeModel) && (
                  <span style={{ 
                    fontSize: '9px', 
                    padding: '1px 5px', 
                    background: 'var(--primary)', 
                    color: 'white', 
                    borderRadius: '4px', 
                    fontWeight: '900',
                    letterSpacing: '0.05em'
                  }}>
                    VISION
                  </span>
                )}
                <div style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: '800', letterSpacing: '0.02em', textShadow: '0 0 10px rgba(0, 243, 255, 0.3)' }}>{activeModel}</div>
              </div>
              <div style={{ fontSize: '7px', color: 'var(--text-dim)', fontWeight: '500', opacity: 0.8 }}>NEURAL_TARGET_ACTIVE</div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Settings size={20} />
          </button>

          <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '12px', fontWeight: '700' }}>V.2.5.0-HERMES</span>
          </div>
        </div>
      </header>

      {/* Sidebar: Vault */}
      <aside className={styles.sidebar}>
        {/* SECTION: WORKSPACE */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Neural Workspace</span>
          <Box size={14} color="var(--text-dim)" />
        </div>
        <div
          className="glass-panel"
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '12px',
            borderLeft: activeTab === 'chat' ? '3px solid var(--primary)' : '3px solid transparent',
            background: activeTab === 'chat' ? 'rgba(155, 77, 255, 0.1)' : 'rgba(255,255,255,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <FolderOpen size={14} color="var(--secondary)" />
            <span style={{ fontSize: '12px', fontWeight: '700' }}>hermes-ui</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            PATH: ~/github/hermes-ui
          </div>
        </div>

        {/* SECTION: GOVERNANCE */}
        <div className={styles.sectionHeader} style={{ marginTop: '20px' }}>
          <span className={styles.sectionTitle}>Agent Governance</span>
          <ShieldAlert size={14} color="var(--text-dim)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { label: 'Security Policies', icon: <Shield size={13} />, status: 'Enforced', id: 'security' },
            { label: 'Audit History', icon: <History size={13} />, status: 'Live', id: 'audit' },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => {
                console.log('Switching to', item.id);
                setActiveTab(item.id);
                addLog(`SYSTEM :: Navigation context shifted to ${item.label.toUpperCase()}`);
              }}
              className="glass-panel"
              style={{
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(155, 77, 255, 0.15)' : 'var(--glass-bg)',
                border: activeTab === item.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: activeTab === item.id ? 'var(--primary)' : 'var(--text-dim)' }}>{item.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: activeTab === item.id ? '700' : '500', color: activeTab === item.id ? 'white' : 'var(--text-dim)' }}>{item.label}</span>
              </div>
              <span style={{ fontSize: '9px', opacity: activeTab === item.id ? 1 : 0.6, color: activeTab === item.id ? 'var(--primary)' : 'inherit' }}>{item.status}</span>
            </div>
          ))}
        </div>

        {/* SECTION: INFRASTRUCTURE */}
        <div className={styles.sectionHeader} style={{ marginTop: '20px' }}>
          <span className={styles.sectionTitle}>Infrastructure Core</span>
          <Server size={14} color="var(--text-dim)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Compact Health Badge */}
          <div className="glass-panel" style={{ padding: '10px', background: 'transparent', marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', opacity: 0.5 }}>KERNEL HEALTH</span>
              <div style={{ width: '40px', height: '4px', background: '#10B981', borderRadius: '2px', alignSelf: 'center' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 5px #10B981' }}></div>
                <span style={{ fontSize: '10px', fontWeight: '600' }}>CLI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: gatewayStatus === 'online' ? '#10B981' : '#EF4444', boxShadow: gatewayStatus === 'online' ? '0 0 5px #10B981' : 'none' }}></div>
                <span style={{ fontSize: '10px', fontWeight: '600' }}>GATEWAY</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('sessions')}
            className="glass-panel"
            style={{
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              background: activeTab === 'sessions' ? 'rgba(155, 77, 255, 0.1)' : 'var(--glass-bg)',
              border: activeTab === 'sessions' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--primary)' }}><History size={13} /></span>
              <span style={{ fontSize: '11px', fontWeight: '500' }}>Active Sessions</span>
            </div>
            <span style={{ fontSize: '9px', opacity: 0.6 }}>Mapped</span>
          </div>

          <div
            onClick={() => setActiveTab('logs')}
            className="glass-panel"
            style={{
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              background: activeTab === 'logs' ? 'rgba(155, 77, 255, 0.1)' : 'var(--glass-bg)',
              border: activeTab === 'logs' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--secondary)' }}><Activity size={13} /></span>
              <span style={{ fontSize: '11px', fontWeight: '500' }}>Real-time Logs</span>
            </div>
            <span style={{ fontSize: '9px', opacity: 0.6 }}>Live</span>
          </div>
        </div>

        {/* SECTION: SYSTEM NAVIGATION */}
        <div className={styles.sectionHeader} style={{ marginTop: '20px' }}>
          <span className={styles.sectionTitle}>System Management</span>
          <Settings size={14} color="var(--text-dim)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            onClick={() => setActiveTab('skills')}
            className="glass-panel"
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: activeTab === 'skills' ? 'rgba(155, 77, 255, 0.1)' : 'var(--glass-bg)',
              border: activeTab === 'skills' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <Cpu size={14} color="var(--primary)" />
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Skills Core Hub</span>
          </div>

          <div
            onClick={() => setActiveTab('vault')}
            className="glass-panel"
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: activeTab === 'vault' ? 'rgba(155, 77, 255, 0.1)' : 'var(--glass-bg)',
              border: activeTab === 'vault' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <Layers size={14} color="var(--secondary)" />
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Knowledge Vault</span>
          </div>
        </div>

        {/* SECTION: TELEMETRY */}
        <div className={styles.sectionHeader} style={{ marginTop: 'auto', paddingTop: '10px' }}>
          <span className={styles.sectionTitle}>Live Telemetry</span>
          <Activity size={14} color="var(--secondary)" />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <div className="glass-panel" style={{ flex: 1, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>LOAD</div>
            <div style={{ fontSize: '12px', fontWeight: '800' }}>2.4%</div>
          </div>
          <div className="glass-panel" style={{ flex: 1, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>LATENCY</div>
            <div style={{ fontSize: '12px', fontWeight: '800' }}>42ms</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px', background: 'transparent' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Gateway Status</span>
            <span style={{ color: gatewayStatus === 'online' ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
              {gatewayStatus.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Active Adapters</span>
            <span>{gatewayStatus === 'online' ? '2' : '1'} / 3</span>
          </div>
        </div>
      </aside>

      {/* Main Stage */}
      <main className={styles.stage}>
        {/* Stage Header/Tabs */}
        <div style={{
          display: 'flex',
          gap: '2px',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(13, 11, 20, 0.4)'
        }}>
          {[
            { id: 'chat', label: 'Neural Chat', icon: <Bot size={14} /> },
            { id: 'skills', label: 'Skills Hub', icon: <Cpu size={14} /> },
            { id: 'models', label: 'Model Hub', icon: <Layers size={14} /> },
            { id: 'vault', label: 'Knowledge Vault', icon: <Database size={14} /> },
            { id: 'config', label: 'Config Center', icon: <Settings size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(155, 77, 255, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'skills' ? (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ width: '100%', height: '100%', padding: '32px', overflowY: 'auto' }}
              >
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Neural Skills Matrix</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Global registry of autonomous capabilities and semantic adapters.</p>
                  </div>

                  {/* SEARCH BAR */}
                  <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                      type="text"
                      placeholder="Filter capabilities..."
                      value={skillsSearch}
                      onChange={(e) => setSkillsSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--foreground)',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                    />
                  </div>
                </div>

                {/* Grouped Skills by Category */}
                {(Object.entries(skills
                  .filter(s =>
                    s.name.toLowerCase().includes(skillsSearch.toLowerCase()) ||
                    s.description.toLowerCase().includes(skillsSearch.toLowerCase()) ||
                    s.category.toLowerCase().includes(skillsSearch.toLowerCase())
                  )
                  .reduce((acc: any, skill: any) => {
                    const cat = skill.category || 'General';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(skill);
                    return acc;
                  }, {} as Record<string, any[]>)) as [string, any[]][]).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: '40px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <div style={{ padding: '4px 10px', background: 'var(--primary)', borderRadius: '4px', fontSize: '10px', fontWeight: '800', color: 'var(--foreground)' }}>
                          {category.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '500' }}>{items.length} ACTIVE BLOCKS</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {items.map((skill) => (
                          <div key={skill.name} className="glass-panel" style={{
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            border: skill.active ? '1px solid rgba(155, 77, 255, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* Status Glow */}
                            {skill.active && (
                              <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)' }}></div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '18px' }}>{skill.icon}</div>
                              <div style={{ fontSize: '10px', color: skill.active ? '#10B981' : 'var(--text-dim)', fontWeight: '800', letterSpacing: '0.1em' }}>
                                {skill.active ? 'ONLINE' : 'STANDBY'}
                              </div>
                            </div>

                            <div>
                              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--foreground)', marginBottom: '6px', fontFamily: '"Fira Code", monospace' }}>{skill.name}</h3>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{skill.description}</p>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => setSkills(prev => prev.map(s => s.name === skill.name ? { ...s, active: !s.active } : s))}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--glass-border)',
                                  background: skill.active ? 'rgba(239, 68, 68, 0.05)' : 'rgba(155, 77, 255, 0.1)',
                                  color: skill.active ? '#EF4444' : 'var(--primary)',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {skill.active ? 'DISABLE' : 'ENABLE'}
                              </button>
                              <button style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'var(--text-dim)', fontSize: '11px', cursor: 'not-allowed' }}>
                                REF
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </motion.div>
            ) : activeTab === 'security' ? (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ width: '100%', height: '100%', padding: '32px', overflowY: 'auto' }}
              >
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Security Governance</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Configure real-time guardrails and automated safety protocols.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { id: 'p1', title: 'File System Protection', desc: 'Restricts destructive file operations (rm, rmdir) in sensitive directories.', level: 'CRITICAL' },
                    { id: 'p2', title: 'Environment Sanitization', desc: 'Prevents the agent from accessing or exporting plain-text environment variables.', level: 'HIGH' },
                    { id: 'p3', title: 'Code Execution Sandbox', desc: 'Enforces memory and CPU limits on dynamically generated code blocks.', level: 'MEDIUM' },
                    { id: 'p4', title: 'Network Egress Filter', desc: 'Blocks outbound connections to unauthorized domains or IP ranges.', level: 'HIGH' }
                  ].map(policy => {
                    const isActive = securityPolicies[policy.id as keyof typeof securityPolicies];
                    return (
                      <div key={policy.id} className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(155, 77, 255, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid rgba(155, 77, 255, 0.2)'
                          }}>
                            <ShieldAlert size={20} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: '800', fontSize: '15px' }}>{policy.title}</span>
                              <span style={{ fontSize: '9px', padding: '2px 6px', background: policy.level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: policy.level === 'CRITICAL' ? '#EF4444' : 'var(--text-dim)', borderRadius: '4px', fontWeight: '900' }}>
                                {policy.level}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{policy.desc}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: isActive ? '#10B981' : 'var(--text-dim)', transition: 'color 0.2s', width: '60px', textAlign: 'right' }}>
                            {isActive ? 'ENFORCED' : 'OFF'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Toggling', policy.id);
                              setSecurityPolicies(prev => ({ ...prev, [policy.id]: !isActive }));
                            }}
                            style={{
                              width: '40px',
                              height: '22px',
                              background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                              borderRadius: '11px',
                              position: 'relative',
                              cursor: 'pointer',
                              border: 'none',
                              padding: 0,
                              outline: 'none',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            <motion.div
                              animate={{ x: isActive ? 19 : 3 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              style={{
                                position: 'absolute',
                                top: '3px',
                                width: '16px',
                                height: '16px',
                                background: 'white',
                                borderRadius: '50%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                pointerEvents: 'none'
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : activeTab === 'sessions' ? (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ width: '100%', height: '100%', padding: '32px', overflowY: 'auto' }}
              >
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AnimatePresence>
                      {selectedSessions.length > 0 && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: -10 }}
                          onClick={() => setShowDeleteConfirm(selectedSessions)}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            color: '#EF4444',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <ShieldAlert size={14} /> PURGE SELECTED ({selectedSessions.length})
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={handleNewChat}
                    style={{
                      width: 'auto',
                      padding: '12px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                      fontWeight: '900',
                      fontSize: '13px',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px -5px rgba(155, 77, 255, 0.4)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(155, 77, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(155, 77, 255, 0.4)';
                    }}
                  >
                    <Plus size={18} /> NEW COGNITION SESSION
                  </button>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '16px', width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={sessions.length > 0 && selectedSessions.length === sessions.length}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedSessions(sessions.map(s => s.id));
                              else setSelectedSessions([]);
                            }}
                            style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                        </th>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>TITLE</th>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>PREVIEW</th>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>LAST ACTIVE</th>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>ID</th>
                        <th style={{ padding: '16px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((sess) => (
                        <tr
                          key={sess.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                            transition: 'background 0.2s',
                            background: selectedSessions.includes(sess.id) ? 'rgba(155, 77, 255, 0.05)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '16px' }}>
                            <input
                              type="checkbox"
                              checked={selectedSessions.includes(sess.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedSessions(prev => [...prev, sess.id]);
                                else setSelectedSessions(prev => prev.filter(id => id !== sess.id));
                              }}
                              style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                          </td>
                          <td style={{ padding: '16px', fontWeight: '700' }}>{sess.title}</td>
                          <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sess.preview}
                          </td>
                          <td style={{ padding: '16px', color: 'var(--secondary)', fontWeight: '600' }}>{formatLastActive(sess.lastActive)}</td>
                          <td style={{ padding: '16px', fontFamily: '"Fira Code", monospace', fontSize: '11px', color: 'var(--text-dim)' }}>{sess.id}</td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(sess.id);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #EF4444',
                                  color: '#EF4444',
                                  padding: '6px 14px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  zIndex: 10
                                }}
                              >
                                DELETE
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resumeSession(sess.id);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--primary)',
                                  color: 'var(--primary)',
                                  padding: '6px 14px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  zIndex: 10
                                }}
                              >
                                RESUME
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : activeTab === 'logs' ? (
              <motion.div
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ width: '100%', height: '100%', background: '#08070b', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.1em' }}>KERNEL.LOG STREAM</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['ALL', 'INFO', 'WARN', 'ERROR'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setLogFilter(lvl)}
                        style={{
                          background: lvl === logFilter ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                          color: 'var(--foreground)',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '900',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: lvl === logFilter ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, padding: '20px', fontFamily: '"Fira Code", monospace', fontSize: '12px', overflowY: 'auto', color: '#a1a1aa' }}>
                  {logs
                    .slice()
                    .reverse()
                    .filter(log => logFilter === 'ALL' || log.includes(logFilter))
                    .map((log, i) => (
                      <div key={i} style={{ marginBottom: '6px', lineHeight: '1.4' }}>
                        <span style={{ color: log.includes('ERROR') ? '#EF4444' : log.includes('WARN') ? '#F59E0B' : 'var(--primary)' }}>
                          {log.split('::')[0]}::
                        </span>
                        <span>{log.split('::')[1] || log.split('::')[0]}</span>
                      </div>
                    ))}
                  <div style={{ marginTop: '10px', opacity: 0.5, fontStyle: 'italic' }}>Live Stream active via Neural Bridge...</div>
                </div>
              </motion.div>
            ) : activeTab === 'audit' ? (
              <motion.div
                key="audit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ width: '100%', height: '100%', padding: '32px', overflowY: 'auto' }}
              >
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Neural Audit Trail</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Permanent immutable record of agent transactions and tool invocations.</p>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>TIMESTAMP</th>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>OPERATION</th>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>RESOURCES</th>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>ID</th>
                        <th style={{ padding: '16px', color: 'var(--text-dim)', fontWeight: '800', fontSize: '10px' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { time: '14:58:22', op: 'FILE_READ', res: '/src/app/page.tsx', status: 'SUCCESS', id: 'Hermes-9' },
                        { time: '14:58:10', op: 'NET_FETCH', res: 'api.github.com', status: 'SUCCESS', id: 'Hermes-9' },
                        { time: '14:57:45', op: 'FILE_WRITE', res: '/config.yaml', status: 'INTERCEPTED', id: 'Hermes-9' },
                        { time: '14:56:30', op: 'SYS_EXEC', res: 'npx create-next-app', status: 'SUCCESS', id: 'Hermes-9' },
                        { time: '14:55:12', op: 'VAULT_QUERY', res: 'Vector_Index_Main', status: 'SUCCESS', id: 'Hermes-9' },
                        { time: '14:54:05', op: 'SEC_AUDIT', res: 'All Systems', status: 'PASSED', id: 'System' },
                        { time: '14:52:18', op: 'FILE_DELETE', res: '/tmp/session_cache', status: 'SUCCESS', id: 'Hermes-9' },
                      ].map((tx, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '16px', fontFamily: '"Fira Code", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{tx.time}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '2px 8px',
                              background: tx.op.includes('SEC') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(155, 77, 255, 0.1)',
                              color: tx.op.includes('SEC') ? '#10B981' : 'var(--primary)',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '900',
                              border: '1px solid currentColor'
                            }}>
                              {tx.op}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontFamily: '"Fira Code", monospace', fontSize: '12px', color: '#e2e2e2' }}>{tx.res}</td>
                          <td style={{ padding: '16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>{tx.id}</td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: tx.status === 'SUCCESS' || tx.status === 'PASSED' ? '#10B981' : '#EF4444' }}></div>
                              <span style={{ color: tx.status === 'SUCCESS' || tx.status === 'PASSED' ? '#10B981' : '#EF4444', fontWeight: '800', fontSize: '11px' }}>
                                {tx.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : activeTab === 'vault' ? (
              <motion.div
                key="vault"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ width: '100%', height: '100%', padding: '32px', overflowY: 'auto' }}
              >
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Knowledge Vault</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Manage the agent&apos;s persistent memory and semantic indices.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Layers size={20} color="var(--primary)" />
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Active Memory Streams</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { title: 'Project Context', records: 124, updated: '2m ago' },
                        { title: 'User Preferences', records: 42, updated: '1h ago' },
                        { title: 'Semantic Buffer', records: 856, updated: 'Live' },
                      ].map(item => (
                        <div key={item.title} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.title}</span>
                            <span style={{ fontSize: '10px', color: 'var(--secondary)' }}>{item.updated}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.records} Knowledge Records</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <FolderOpen size={20} color="var(--secondary)" />
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>External Indices</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['API_Documentation.pdf', 'Architecture_Guide.md', 'System_Source_Index'].map(file => (
                        <div key={file} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Database size={14} color="var(--text-dim)" />
                          <span style={{ fontSize: '12px' }}>{file}</span>
                          <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#10B981' }}>COMPLETED</span>
                        </div>
                      ))}
                      <button style={{
                        marginTop: '12px',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px dashed var(--primary)',
                        background: 'transparent',
                        color: 'var(--primary)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        + Index New Resource
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'models' ? (
              <motion.div
                key="models"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                style={{ width: '100%', height: '100%', padding: '32px', overflowY: 'auto' }}
              >
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Model Control Hub</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Configure neural providers and execution parameters.</p>
                  </div>
                  <button
                    onClick={() => setShowAddModel(true)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: 'rgba(155, 77, 255, 0.1)',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(155, 77, 255, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(155, 77, 255, 0.1)'}
                  >
                    <Plus size={16} /> REGISTER NODE
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={18} color="var(--primary)" />
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {availableModels.length > 0 ? (() => {
                        // Group models by base_url
                        const groups: Record<string, any[]> = {};
                        const activeBaseUrl = availableModels.find(m => m.type === 'PRIMARY')?.base_url;

                        availableModels.forEach(m => {
                          const key = m.base_url || 'INTERNAL';
                          if (!groups[key]) groups[key] = [];

                          // Simple de-duplication within the same URL group
                          if (!groups[key].find(em => em.model_name === m.model_name)) {
                            groups[key].push(m);
                          }
                        });

                        return (Object.entries(groups) as [string, any[]][]).map(([url, models], gIdx) => {
                          const isActuallyActiveGroup = url === activeBaseUrl || (url === 'INTERNAL' && !activeBaseUrl);
                          const activeInGroup = models.find(m => m.model_name === activeModel && isActuallyActiveGroup);
                          const providerName = models.length > 1 && url !== 'INTERNAL'
                            ? `Neural Provider Group (${models.length} Nodes)`
                            : (models[0]?.name || (url !== 'INTERNAL' ? url.split('//')[1]?.split('/')[0] : 'System Core'));
                          const isExpanded = expandedProviders[url] ?? activeInGroup;

                          return (
                            <div
                              key={url}
                              className="glass-panel"
                              style={{
                                padding: '0',
                                border: activeInGroup ? '1px solid var(--secondary)' : '1px solid var(--glass-border)',
                                background: activeInGroup ? 'rgba(0, 243, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginBottom: '12px'
                              }}
                            >
                              {/* Provider Header */}
                              <div
                                onClick={() => setExpandedProviders(prev => ({ ...prev, [url]: !isExpanded }))}
                                style={{
                                  padding: '20px 24px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  background: 'rgba(255,255,255,0.02)',
                                  borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: activeInGroup ? 'var(--secondary)' : 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: activeInGroup ? '0 0 15px rgba(0, 243, 255, 0.3)' : 'none'
                                  }}>
                                    <Cpu size={16} color="white" />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: activeInGroup ? 'var(--secondary)' : 'var(--foreground)' }}>
                                      {providerName}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                                      {url === 'INTERNAL' ? 'LOCAL CORE' : url}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontWeight: '700' }}>
                                    {models.length} MODEL{models.length > 1 ? 'S' : ''}
                                  </span>
                                  {activeInGroup && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ff88', fontSize: '10px', fontWeight: '800' }}>
                                      <div className="status-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88' }} />
                                      ACTIVE
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeProvider(url, providerName);
                                    }}
                                    className="action-button-hover"
                                    style={{
                                      padding: '6px',
                                      borderRadius: '6px',
                                      background: 'rgba(255, 50, 50, 0.05)',
                                      border: '1px solid rgba(255, 50, 50, 0.1)',
                                      color: '#ff5555',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s',
                                      marginLeft: '4px'
                                    }}
                                    title="Remove Provider"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                  <ChevronDown size={18} color="var(--text-dim)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                                </div>
                              </div>

                              {/* Models List (Expanded) */}
                              {isExpanded && (
                                <div style={{ padding: '16px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {models.map((m, mIdx) => {
                                    const isSelected = m.model_name.trim().toLowerCase() === (activeModel || '').trim().toLowerCase();
                                    return (
                                      <div
                                        key={mIdx}
                                        style={{
                                          padding: '16px',
                                          borderRadius: '12px',
                                          background: isSelected ? 'rgba(0, 243, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                          border: isSelected ? '1px solid var(--secondary)' : '1px solid transparent',
                                          boxShadow: isSelected ? '0 0 20px rgba(0, 243, 255, 0.1)' : 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                          transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                                        }}
                                      >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '700', color: isSelected ? 'var(--secondary)' : 'var(--foreground)' }}>
                                              {m.model_name}
                                            </span>
                                            {checkIsVision(m.model_name) && (
                                              <span style={{ 
                                                fontSize: '9px', 
                                                padding: '1px 6px', 
                                                background: 'rgba(155, 77, 255, 0.1)', 
                                                border: '1px solid var(--primary)',
                                                color: 'var(--primary-light)', 
                                                borderRadius: '4px', 
                                                fontWeight: '800' 
                                              }}>
                                                VISION
                                              </span>
                                            )}
                                            {isSelected && (
                                              <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--background)', fontWeight: '900' }}>
                                                CORE MODEL
                                              </span>
                                            )}
                                          </div>
                                          <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>TARGET IDENTITY</span>
                                        </div>

                                        {isSelected ? (
                                          <div style={{
                                            padding: '8px 24px',
                                            borderRadius: '20px',
                                            background: 'var(--secondary)',
                                            color: 'black',
                                            fontSize: '11px',
                                            fontWeight: '900',
                                            boxShadow: '0 0 20px rgba(0, 243, 255, 0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            letterSpacing: '0.05em'
                                          }}>
                                            <div className="status-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'black' }} />
                                            ACTIVE ENGINE
                                          </div>
                                        ) : (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                              onClick={() => switchModel(m.model_name, m.base_url || '')}
                                              className="secondary-button"
                                              style={{
                                                padding: '8px 24px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: 'var(--text-dim)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                              }}
                                              onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.color = 'white';
                                              }}
                                              onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.color = 'var(--text-dim)';
                                              }}
                                            >
                                              SELECT TARGET
                                            </button>
                                            <button
                                              onClick={() => removeProvider(url, providerName, m.model_name)}
                                              className="action-button-hover"
                                              style={{
                                                padding: '7px',
                                                borderRadius: '10px',
                                                background: 'rgba(255, 50, 50, 0.05)',
                                                border: '1px solid rgba(255, 50, 50, 0.1)',
                                                color: '#ff5555',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                              }}
                                              title="Remove specific model"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })() : (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                          Scanning neural grid for available providers...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} color="var(--secondary)" />
                      Neural Provider Catalog
                    </h3>

                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '16px' }}>Quickly register factory-certified neural providers.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                      {[
                        { name: 'Nous Portal', provider: 'openai', model: 'nous-hermes-2-pro' },
                        { name: 'OpenRouter', provider: 'openrouter', model: 'anthropic/claude-3-opus' },
                        { name: 'Anthropic', provider: 'anthropic', model: 'claude-3-5-sonnet-latest' },
                        { name: 'DeepSeek', provider: 'deepseek', model: 'deepseek-chat', url: 'https://api.deepseek.com/v1' },
                        { name: 'Google AI', provider: 'google', model: 'gemini-1.5-pro' },
                        { name: 'xAI Grok', provider: 'openai', model: 'grok-beta', url: 'https://api.x.ai/v1' },
                        { name: 'Moonshot AI', provider: 'openai', model: 'moonshot-v1-8k', url: 'https://api.moonshot.cn/v1' },
                        { name: 'ZHIPU AI', provider: 'openai', model: 'glm-4', url: 'https://open.bigmodel.cn/api/paas/v4' },
                        { name: 'MiniMax', provider: 'openai', model: 'abab6.5-chat' },
                        { name: 'DashScope', provider: 'openai', model: 'qwen-turbo' },
                        { name: 'Xiaomi MiMo', provider: 'openai', model: 'mimo-v2' },
                        { name: 'Hugging Face', provider: 'openai', model: 'meta-llama/Llama-2-70b-chat', url: 'https://api-inference.huggingface.co/v1' },
                        { name: 'Github Copilot', provider: 'openai', model: 'gpt-4' },
                        { name: 'Arcee AI', provider: 'openai', model: 'trinity' },
                        { name: 'Kilo Code', provider: 'openai', model: 'kilo-gateway' },
                        { name: 'OpenCode Zen', provider: 'openai', model: 'opencode-zen' },
                        { name: 'Vercel AI', provider: 'openai', model: 'vercel-gateway' },
                        { name: 'Local (Ollama)', provider: 'ollama', model: 'gemma:2b', url: 'http://localhost:11434/v1' },
                        { name: 'Custom Node', provider: 'custom', model: 'manual-entry', url: '' }
                      ].map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setDiscoveredModelsInModal([]); // Clear stale discovery results
                            setNewModel({
                              name: preset.name,
                              model_name: preset.model,
                              provider: preset.provider,
                              base_url: preset.url || '',
                              api_key: ''
                            });
                            setShowAddModel(true);
                          }}
                          style={{
                            padding: '16px 10px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(155, 77, 255, 0.15)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(155, 77, 255, 0.2)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: '900', color: 'white', marginBottom: '6px', letterSpacing: '0.05em' }}>{preset.name.toUpperCase()}</div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>{preset.model}</div>
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Sampling Parameters</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                          { label: 'Temperature', min: 0, max: 2, step: 0.1, value: modelSettings.temperature, key: 'temperature' },
                          { label: 'Top P', min: 0, max: 1, step: 0.05, value: modelSettings.topP, key: 'topP' },
                        ].map(param => (
                          <div key={param.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <label style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{param.label}</label>
                              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>{param.value}</span>
                            </div>
                            <input
                              type="range"
                              min={param.min}
                              max={param.max}
                              step={param.step}
                              value={param.value}
                              onChange={(e) => setModelSettings(prev => ({ ...prev, [param.key]: parseFloat(e.target.value) }))}
                              style={{ width: '100%', accentColor: 'var(--primary)' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'config' ? (
              <motion.div
                key="config"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                style={{ width: '100%', height: '100%', padding: '32px', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Config Center</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Directly manifest and modify the local ~/.hermes/config.yaml</p>
                  </div>
                  <button
                    onClick={saveConfig}
                    disabled={isSavingConfig}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      background: 'var(--primary)',
                      border: 'none',
                      color: 'var(--foreground)',
                      fontWeight: '700',
                      cursor: isSavingConfig ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(155, 77, 255, 0.3)'
                    }}
                  >
                    {isSavingConfig ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
                {/* VISUAL QUICK SETTINGS: Storage Management */}
                <div className="glass-panel" style={{ 
                  marginBottom: '20px', 
                  padding: '16px 24px', 
                  background: 'rgba(155, 77, 255, 0.05)',
                  border: '1px solid rgba(155, 77, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '8px', background: 'rgba(155, 77, 255, 0.15)', borderRadius: '8px' }}>
                      <HardDrive size={18} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--foreground)' }}>Upload Storage Retention</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Maximum number of files (images/docs) to keep in local server</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, maxWidth: '400px', marginLeft: '40px' }}>
                    <input 
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={(() => {
                        const match = configContent.match(/upload_retention_limit:\s*(\d+)/) || configContent.match(/image_retention_limit:\s*(\d+)/);
                        return match ? parseInt(match[1]) : 100;
                      })()}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        let newContent = configContent;
                        // Support both keys during transition, but prefer upload_retention_limit
                        if (newContent.includes('upload_retention_limit:')) {
                          newContent = newContent.replace(/upload_retention_limit:\s*\d+/, `upload_retention_limit: ${newVal}`);
                        } else if (newContent.includes('image_retention_limit:')) {
                          newContent = newContent.replace(/image_retention_limit:\s*\d+/, `upload_retention_limit: ${newVal}`);
                        } else if (newContent.includes('storage:')) {
                          newContent = newContent.replace(/storage:\s*/, `storage:\n  upload_retention_limit: ${newVal}\n`);
                        } else {
                          newContent = newContent + `\nstorage:\n  upload_retention_limit: ${newVal}\n`;
                        }
                        setConfigContent(newContent);
                      }}
                      style={{ 
                        flex: 1,
                        accentColor: 'var(--primary)',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ 
                      minWidth: '60px', 
                      padding: '4px 10px', 
                      background: 'var(--panel-bg)', 
                      borderRadius: '6px',
                      border: '1px solid var(--glass-border)',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--primary-light)'
                    }}>
                      {(() => {
                        const match = configContent.match(/upload_retention_limit:\s*(\d+)/) || configContent.match(/image_retention_limit:\s*(\d+)/);
                        return match ? match[1] : '100';
                      })()}
                    </div>
                  </div>
                </div>


                <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', padding: '0' }}>
                  <textarea
                    value={configContent}
                    onChange={(e) => setConfigContent(e.target.value)}
                    spellCheck={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(13, 11, 20, 0.5)',
                      border: 'none',
                      color: '#e2e2e2',
                      fontSize: '13px',
                      fontFamily: '"Fira Code", monospace',
                      padding: '24px',
                      resize: 'none',
                      outline: 'none',
                      lineHeight: '1.6'
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  height: '100%'
                }}
              >
                {/* LEFT: NEURAL BRIDGE (CHAT) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* WORKSPACE HEADER */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    background: 'var(--panel-bg)',
                    borderBottom: '1px solid var(--glass-border)',
                    zIndex: 20,
                    backdropFilter: 'blur(20px)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={14} color="var(--primary)" />
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '0.1em' }}>NEURAL_LINK_ACTIVE</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={async () => {
                          addLog('SYSTEM :: Manual Neural Engine restart initiated...');
                          try {
                            const resp = await fetch('/api/models', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'switch', model_name: activeModel })
                            });
                            if (resp.ok) {
                              addLog('SYSTEM :: Gateway hot-reload signal dispatched.');
                              await fetchModels();
                            }
                          } catch (e) {
                            addLog('ERROR :: Failed to dispatch reload.');
                          }
                        }}
                        className="glass-panel"
                        style={{
                          padding: '6px 14px',
                          fontSize: '10px',
                          fontWeight: '800',
                          border: '1px solid var(--primary)',
                          color: 'var(--primary)',
                          background: 'rgba(155, 77, 255, 0.05)',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        RESTART ENGINE
                      </button>

                      <button
                        onClick={handleNewChat}
                        className="glass-panel"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 14px',
                          border: '1px solid var(--glass-border)',
                          background: 'var(--glass-bg-low)',
                          borderRadius: '6px',
                          color: 'var(--text-dim)',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Plus size={12} />
                        NEW SESSION
                      </button>
                    </div>
                  </div>

                  <div
                    id="chat-scroll-container"
                    ref={chatContainerRef}
                    style={{ flex: 1, overflowY: 'auto', padding: '30px' }}
                  >
                    <AnimatePresence>
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '24px'
                          }}
                        >
                          <div style={{
                            maxWidth: '85%',
                            display: 'flex',
                            gap: '12px',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                          }}>
                            <div className="glass-panel" style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: msg.role === 'user' ? 'var(--glass-border)' : 'var(--primary)',
                              flexShrink: 0
                            }}>
                              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} color="white" />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="glass-panel" style={{
                                padding: '16px 20px',
                                background: msg.role === 'user' ? 'rgba(155, 77, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                border: msg.role === 'user' ? '1px solid rgba(155, 77, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                fontSize: '14px',
                                color: '#e5e7eb'
                              }}>
                                {msg.image && (
                                  <div className="mt-2 mb-2 flex flex-col justify-start">
                                    <div className="relative group cursor-zoom-in">
                                      <img 
                                        src={msg.image} 
                                        alt="Uploaded content" 
                                        style={{ maxWidth: '240px', maxHeight: '320px', width: 'auto', height: 'auto' }}
                                        className="rounded-lg border border-white/20 shadow-xl transition-all duration-200 hover:scale-[1.02] hover:border-white/40 object-contain flex-shrink-0"
                                      />
                                      <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
                                    </div>
                                  </div>
                                )}

                                {msg.file && (
                                  <div style={{ 
                                    marginBottom: '10px', 
                                    padding: '8px 12px', 
                                    background: 'rgba(155, 77, 255, 0.1)', 
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(155, 77, 255, 0.2)',
                                    maxWidth: 'max-content',
                                    marginTop: '4px'
                                  }}>
                                    <FileText size={16} color="var(--primary-light)" />
                                    <span style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: '500' }}>
                                      {msg.file}
                                    </span>
                                  </div>
                                )}
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => {
                                      const text = String(children);
                                      if (text.includes('[Attached Image:') || text.includes('[Attached File:')) {
                                        const cleanText = text.replace(/\[Attached (Image|File):.*?\]\n?/, '').trim();
                                        return cleanText ? <p className="mb-4 last:mb-0 leading-relaxed">{cleanText}</p> : null;
                                      }
                                      return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
                                    },
                                    code({ node, inline, className, children, ...props }: any) {
                                      const match = /language-(\w+)/.exec(className || '');
                                      return !inline && match ? (
                                        <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
                                      ) : (
                                        <code className={className} {...props} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.9em', color: 'var(--primary-light)' }}>
                                          {children}
                                        </code>
                                      );
                                    }
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                                  {msg.timestamp}
                                </div>
                                {msg.role === 'agent' && msg.model && (
                                  <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--primary)', opacity: 0.6, letterSpacing: '0.05em' }}>
                                    TARGET: {msg.model.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isTyping && (
                      <div style={{ display: 'flex', gap: '8px', padding: '10px 44px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-cyan 1s infinite' }}></div>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-cyan 1s infinite 0.2s' }}></div>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-cyan 1s infinite 0.4s' }}></div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* CMD INPUT BAR */}
                  <div style={{ padding: '24px', background: 'rgba(10, 10, 15, 0.8)', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>

                    {/* COMMAND PALETTE (TERMINAL STYLE) */}
                    <AnimatePresence>
                      {input.startsWith('/') && showCommands && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="glass-panel"
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '24px',
                            right: '24px',
                            background: '#0D0B14',
                            border: '1px solid #9b4dff',
                            borderRadius: '8px 8px 0 0',
                            padding: '10px 0',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            zIndex: 100,
                            boxShadow: '0 -10px 50px rgba(0,0,0,1)',
                            marginBottom: '2px'
                          }}
                        >
                          {(filteredCmds.length > 0 ? filteredCmds : ['save', 'skills', 'config', 'models', 'vault']).map((cmd, i) => {
                            const skillItem = skills.find(s => s.name === cmd);
                            return (
                              <div
                                key={cmd}
                                onClick={() => {
                                  setInput('/' + cmd + (skillItem ? ' ' : ''));
                                  setShowCommands(false);
                                }}
                                className={selectedIndex === i ? styles.selectedCmd : ''}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '180px 1fr',
                                  padding: '8px 24px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontFamily: '"Fira Code", monospace',
                                  background: selectedIndex === i ? 'rgba(155, 77, 255, 0.15)' : 'transparent'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#9b4dff', fontWeight: '800' }}>/{cmd}</span>
                                  {skillItem && (
                                    <span style={{ fontSize: '9px', padding: '1px 4px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', color: 'var(--text-dim)' }}>SKILL</span>
                                  )}
                                </div>
                                <span style={{ color: 'var(--text-dim)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {skillItem ? skillItem.description :
                                    cmd === 'save' ? 'Neural snapshot of current workspace' :
                                      cmd === 'skills' ? 'Access the skills core integration' :
                                        cmd === 'config' ? 'Modify the underlying system parameters' :
                                          cmd === 'models' ? 'Hot-swap the active inference engine' :
                                            cmd === 'vault' ? 'Query the hermes knowledge base' : 'Run system command'}
                                </span>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                      {/* IMAGE PREVIEW ZONE */}
                      <AnimatePresence>
                        {selectedImage && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-4 z-50 w-full"
                          >
                            <div className="glass-panel" style={{ 
                              padding: '10px 16px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px',
                              background: 'var(--panel-bg)',
                              border: '1px solid rgba(155, 77, 255, 0.4)',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                              borderRadius: '12px',
                              maxWidth: 'max-content'
                            }}>
                              {uploadFileType?.startsWith('image/') ? (
                                <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                                  <img 
                                    src={selectedImage} 
                                    className="w-full h-full object-cover rounded-lg border border-white/10"
                                    alt="Upload"
                                  />
                                </div>
                              ) : (
                                <div style={{ 
                                  width: '48px', 
                                  height: '48px', 
                                  background: 'rgba(155, 77, 255, 0.1)', 
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(155, 77, 255, 0.2)'
                                }}>
                                  <FileText size={22} color="var(--primary)" />
                                </div>
                              )}
                              
                              <div style={{ minWidth: '120px', maxWidth: '240px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary-light)', marginBottom: '1px', opacity: 0.8 }}>
                                  {uploadFileType?.startsWith('image/') ? 'PHYSICAL_IMAGE_READY' : 'PHYSICAL_FILE_READY'}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--foreground)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {uploadFileName || 'attachment.txt'}
                                </div>
                              </div>

                              <button 
                                onClick={() => {
                                  setSelectedImage(null);
                                  setUploadFileName('');
                                  setUploadFileType('');
                                }}
                                style={{ 
                                  background: 'rgba(255,255,255,0.05)', 
                                  border: 'none', 
                                  color: 'rgba(255,255,255,0.5)', 
                                  padding: '6px', 
                                  borderRadius: '50%',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  marginLeft: '4px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="glass-panel" style={{ display: 'flex', gap: '12px', padding: '12px 20px', borderRadius: '12px', alignItems: 'center' }}>
                        {/* Image Channel */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadFileName(file.name);
                              setUploadFileType(file.type);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSelectedImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />

                        {/* Document Channel */}
                        <input
                          type="file"
                          ref={documentInputRef}
                          hidden
                          accept=".txt,.md,.py,.json,.js,.tsx,.ts,.csv,.log,.yaml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadFileName(file.name);
                              setUploadFileType(file.type || 'text/plain');
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSelectedImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            title="Upload Vision Frame"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              background: (selectedImage && uploadFileType?.startsWith('image/')) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                              border: 'none',
                              color: (selectedImage && uploadFileType?.startsWith('image/')) ? 'white' : 'var(--text-dim)',
                              padding: '8px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: (selectedImage && uploadFileType?.startsWith('image/')) ? '0 0 15px var(--primary)' : 'none'
                            }}
                            onMouseEnter={(e) => { if (!selectedImage) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={(e) => { if (!selectedImage) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                          >
                            <ImageIcon size={18} />
                          </button>

                          <button
                            title="Analyze Code/Document"
                            onClick={() => documentInputRef.current?.click()}
                            style={{
                              background: (selectedImage && !uploadFileType?.startsWith('image/')) ? '#2563EB' : 'rgba(255,255,255,0.05)',
                              border: 'none',
                              color: (selectedImage && !uploadFileType?.startsWith('image/')) ? 'white' : 'var(--text-dim)',
                              padding: '8px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: (selectedImage && !uploadFileType?.startsWith('image/')) ? '0 0 15px #2563EB' : 'none'
                            }}
                            onMouseEnter={(e) => { if (!selectedImage) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={(e) => { if (!selectedImage) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                          >
                            <FileText size={18} />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={input}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInput(val);
                          // Only show commands if starting with / and no space yet
                          if (val.startsWith('/')) {
                            const search = val.slice(1).toLowerCase();
                            const sysCmds = ['save', 'skills', 'config', 'models', 'vault'];
                            const skillCmds = skills.map(s => s.name);
                            const allCmds = [...sysCmds, ...skillCmds];

                            // Progressive visibility: only sysCmds when empty, all matching when typing
                            const matches = search === ''
                              ? sysCmds
                              : allCmds.filter(c => c.toLowerCase().startsWith(search));

                            // Check if we should still show the palette
                            // We show if there's any match that is LONGER than or EQUAL to current input
                            const hasValidPrefix = matches.length > 0;
                            const isTypingArgs = !matches.some(m => m.toLowerCase().startsWith(search + ' ')) &&
                              matches.some(m => search.startsWith(m.toLowerCase() + ' '));

                            if (hasValidPrefix && !val.includes(' ', val.lastIndexOf('/') + matches[0]?.length + 1)) {
                              // Simplified: stop showing if user types a space AFTER a full command match that isn't a prefix of another
                              const exactMatch = allCmds.find(c => c.toLowerCase() === search);
                              const longerMatch = allCmds.find(c => c.toLowerCase().startsWith(search + ' ')); // rare for commands but possible

                              if (exactMatch && val.endsWith(' ') && !longerMatch) {
                                setShowCommands(false);
                              } else {
                                setFilteredCmds(matches);
                                setShowCommands(true);
                                setSelectedIndex(0);
                              }
                            } else {
                              setShowCommands(false);
                            }
                          } else {
                            setShowCommands(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown' && showCommands) {
                            e.preventDefault();
                            setSelectedIndex(prev => (prev + 1) % filteredCmds.length);
                          } else if (e.key === 'ArrowUp' && showCommands) {
                            e.preventDefault();
                            setSelectedIndex(prev => (prev - 1 + filteredCmds.length) % filteredCmds.length);
                          } else if (e.key === 'Enter' && !e.shiftKey) {
                            // Only prevent default if we're actually hijacking for a command selection
                            if (showCommands && filteredCmds.length > 0) {
                              e.preventDefault();
                              setInput('/' + filteredCmds[selectedIndex] + ' ');
                              setShowCommands(false);
                            } else {
                              // Regular message send
                              handleSend();
                            }
                          } else if (e.key === 'Escape') {
                            setShowCommands(false);
                          }
                          // Support Tab for completion
                          if (e.key === 'Tab' && showCommands && filteredCmds.length > 0) {
                            e.preventDefault();
                            setInput('/' + filteredCmds[selectedIndex] + ' ');
                            setShowCommands(false);
                          }
                        }}
                        placeholder="Neural prompt or '/' command..."
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--foreground)', outline: 'none', padding: '4px 0', fontSize: '15px' }}
                      />
                      <button onClick={handleSend} style={{ background: input.trim() ? 'var(--primary)' : 'var(--glass-border)', color: 'var(--foreground)', border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Right Panel: Inspector */}
      <aside className={styles.inspector}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>System Inspector</span>
            <Terminal size={14} color="var(--text-dim)" />
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            background: 'rgba(0,0,0,0.3)',
            padding: '12px',
            borderRadius: '6px',
            color: '#A1A1AA',
            lineHeight: '1.6',
            minHeight: '120px'
          }}>
            {logs.map((log, i) => (
              <div key={i} style={{ color: log.includes('AGENT') ? 'var(--secondary)' : log.includes('USER') ? 'var(--primary)' : log.includes('ERROR') || log.includes('CRITICAL') ? '#EF4444' : 'inherit' }}>
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <div style={{ width: '6px', height: '6px', background: gatewayStatus === 'online' ? 'var(--secondary)' : '#3F3F46', borderRadius: '50%', animation: gatewayStatus === 'online' ? 'pulse-cyan 2s infinite' : 'none' }}></div>
              {gatewayStatus === 'online' ? 'Listening...' : 'Gateway Offline'}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Agent Statics</span>
            <Activity size={14} color="var(--text-dim)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Neural Load', value: isTyping ? '42%' : '12%', color: 'var(--primary)' },
              { label: 'Context Usage', value: '4.2k / 128k', color: 'var(--secondary)' },
              { label: 'Tool Success Rate', value: '98.5%', color: '#10B981' }
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                  <span style={{ fontWeight: '600' }}>{stat.value}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: stat.value.includes('%') ? stat.value : '4%' }}
                    style={{ height: '100%', background: stat.color }}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(155, 77, 255, 0.05)', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu size={24} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700' }}>LOCAL COMPUTE</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>RTX 4090 - TEMP 42°C</div>
            </div>
          </div>
        </div>
      </aside>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettings && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)'
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '450px',
                background: 'rgba(20, 18, 25, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(155, 77, 255, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 40px rgba(155, 77, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.05em' }}>
                  <Settings size={18} color="var(--primary)" />
                  SYSTEM SETTINGS
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '10px', letterSpacing: '0.1em' }}>
                    NEURAL GATEWAY ENDPOINT
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input
                      type="text"
                      value={gatewayUrl}
                      onChange={(e) => setGatewayUrl(e.target.value)}
                      placeholder="http://localhost:8642"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 38px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--foreground)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                    />
                  </div>
                  <p style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                    Current target URI for inference, skills discovery, and neural handshake operations.
                  </p>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700' }}>SESSION PERSISTENCE</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Store settings in local storage</div>
                  </div>
                  <div
                    onClick={() => setSessionPersistence(!sessionPersistence)}
                    style={{
                      width: '36px',
                      height: '20px',
                      background: sessionPersistence ? 'var(--primary)' : 'var(--glass-border)',
                      borderRadius: '10px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <motion.div
                      animate={{ x: sessionPersistence ? 18 : 2 }}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        width: '16px',
                        height: '16px',
                        background: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (sessionPersistence) {
                      localStorage.setItem('hermes-gateway-url', gatewayUrl);
                    } else {
                      localStorage.removeItem('hermes-gateway-url');
                    }
                    checkGateway();
                    setShowSettings(false);
                    addLog(`SYSTEM :: Configuration updated (Persistence: ${sessionPersistence ? 'ON' : 'OFF'})`);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    fontWeight: '900',
                    fontSize: '13px',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    boxShadow: '0 10px 20px -5px rgba(155, 77, 255, 0.4)',
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  SAVE & SYNCHRONIZE
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteConfirm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '32px',
                position: 'relative',
                zIndex: 10,
                border: '1px solid rgba(239, 68, 68, 0.2)',
                background: 'rgba(10, 10, 15, 0.95)',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                margin: '0 auto 20px auto',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <ShieldAlert size={30} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#fff' }}>
                {Array.isArray(showDeleteConfirm) ? `PURGE ${showDeleteConfirm.length} ARTIFACTS?` : 'PURGE ARTIFACT?'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '24px' }}>
                {Array.isArray(showDeleteConfirm) ? (
                  `You are about to permanently delete ${showDeleteConfirm.length} selected sessions. This action cannot be revoked.`
                ) : (
                  <>You are about to permanently delete session <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{String(showDeleteConfirm).substring(0, 12)}...</span>. This action cannot be undone.</>
                )}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    if (Array.isArray(showDeleteConfirm)) {
                      deleteSessions(showDeleteConfirm);
                    } else if (showDeleteConfirm) {
                      deleteSession(showDeleteConfirm);
                    }
                    setShowDeleteConfirm(null);
                  }}
                  style={{
                    padding: '12px',
                    background: '#EF4444',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -5px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  CONFIRM PURGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Modal: Register New Model */}
        {showAddModel && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="glass-panel"
              style={{ width: '480px', padding: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(155, 77, 255, 0.3)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', background: 'rgba(155, 77, 255, 0.1)', borderRadius: '8px' }}>
                    <Cpu size={20} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.05em' }}>REGISTER NEURAL NODE</h3>
                </div>
                <button
                  onClick={() => setShowAddModel(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '8px' }}>FRIENDLY NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. GPT-4 Turbo"
                      value={newModel.name}
                      onChange={e => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '8px' }}>PROVIDER TYPE</label>
                    <select
                      value={newModel.provider}
                      onChange={e => {
                        const p = e.target.value;
                        let url = newModel.base_url;
                        if (p === 'deepseek') url = 'https://api.deepseek.com/v1';
                        if (p === 'ollama') url = 'http://localhost:11434/v1';
                        if (p === 'openrouter') url = 'https://openrouter.ai/api/v1';
                        if (p === 'openai') url = 'https://api.openai.com/v1';

                        setNewModel(prev => ({
                          ...prev,
                          provider: p,
                          base_url: url
                        }));
                      }}
                      style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    >
                      <option value="openai">OpenAI (Official)</option>
                      <option value="deepseek">DeepSeek</option>
                      <option value="ollama">Local (Ollama)</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google Gemini</option>
                      <option value="custom">Generic OpenAI Compatible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '8px' }}>NEURAL TARGET ID (MODEL NAME)</label>
                  {discoveredModelsInModal.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <select
                        disabled={batchRegister}
                        value={newModel.model_name}
                        onChange={e => setNewModel(prev => ({ ...prev, model_name: e.target.value }))}
                        style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', borderRadius: '6px', color: 'var(--secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px', opacity: batchRegister ? 0.5 : 1 }}
                      >
                        <option value="">-- SELECT DISCOVERED MODEL --</option>
                        {discoveredModelsInModal.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(155, 77, 255, 0.05)', borderRadius: '6px', border: '1px dashed rgba(155, 77, 255, 0.3)' }}>
                        <input
                          type="checkbox"
                          id="batch-reg"
                          checked={batchRegister}
                          onChange={e => setBatchRegister(e.target.checked)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <label htmlFor="batch-reg" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', cursor: 'pointer' }}>
                          REGISTER ALL {discoveredModelsInModal.length} DISCOVERED MODELS
                        </label>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. gpt-4-turbo-preview"
                      value={newModel.model_name}
                      onChange={e => setNewModel(prev => ({ ...prev, model_name: e.target.value }))}
                      style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                    />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-dim)' }}>BASE URL (SYSTEM GATEWAY)</label>
                    {newModel.base_url && (
                      <button
                        onClick={async () => {
                          setIsProbingModal(true);
                          setDiscoveredModelsInModal([]);
                          addLog(`NET_SCAN :: Routing discovery via internal proxy [${newModel.base_url}]...`);
                          try {
                            const r = await fetch('/api/models', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                action: 'scan',
                                base_url: newModel.base_url,
                                api_key: newModel.api_key
                              })
                            });
                            const data = await r.json();

                            if (data.success && Array.isArray(data.models)) {
                              setDiscoveredModelsInModal(data.models);
                              addLog(`NET_SCAN :: Discovery successful. Found ${data.models.length} models.`);
                              if (data.models.length > 0) {
                                setNewModel(prev => ({ ...prev, model_name: data.models[0] }));
                              }
                            } else {
                              addLog(`NET_SCAN :: Discovery failed or returned no models.`);
                            }
                          } catch (e) {
                            addLog('NET_SCAN :: Critical failure during neural discovery.');
                          } finally {
                            setIsProbingModal(false);
                          }
                        }}
                        disabled={isProbingModal}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '9px', fontWeight: '800', cursor: isProbingModal ? 'default' : 'pointer', opacity: isProbingModal ? 0.5 : 1 }}
                      >
                        {isProbingModal ? 'SCANNING...' : 'SCAN & DISCOVER MODELS'}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="https://api.openai.com/v1"
                    value={newModel.base_url}
                    onChange={e => setNewModel(prev => ({ ...prev, base_url: e.target.value }))}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '8px' }}>API KEY / TOKEN (ENCRYPTED AT REST)</label>
                  <input
                    type="password"
                    placeholder="sk-...."
                    value={newModel.api_key}
                    onChange={e => setNewModel(prev => ({ ...prev, api_key: e.target.value }))}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowAddModel(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={registerModel}
                    disabled={isAddingModel || !newModel.name || !newModel.model_name}
                    style={{
                      flex: 2,
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      border: 'none',
                      color: 'white',
                      fontWeight: '900',
                      cursor: (isAddingModel || !newModel.name || !newModel.model_name) ? 'default' : 'pointer',
                      boxShadow: '0 8px 20px -5px rgba(155, 77, 255, 0.4)',
                      opacity: (isAddingModel || !newModel.name || !newModel.model_name) ? 0.6 : 1
                    }}
                  >
                    {isAddingModel ? 'COMMITTING...' : 'REGISTER PROVIDER'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Global Confirmation Modal */}
        {confirmConfig.isOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              style={{
                width: '100%',
                maxWidth: '440px',
                padding: '40px',
                position: 'relative',
                zIndex: 10,
                border: '1px solid rgba(255, 50, 50, 0.3)',
                background: 'rgba(10, 10, 15, 0.98)',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                margin: '0 auto 24px auto',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <ShieldAlert size={36} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '14px', color: '#fff', letterSpacing: '0.05em' }}>
                {confirmConfig.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '32px' }}>
                {confirmConfig.message}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button
                  onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                  style={{
                    padding: '14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  ABORT
                </button>
                <button
                  onClick={() => {
                    if (confirmConfig.onConfirm) confirmConfig.onConfirm();
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                  }}
                  style={{
                    padding: '14px',
                    background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  CONFIRM PURGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
