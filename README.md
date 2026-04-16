# 🏛️ Hermes Nexus
> **Next-Gen Neural Command Nexus for Autonomous Intelligence**

**Hermes Nexus** is a premium, high-observability operation center designed for the **Hermes Agent** ecosystem. It transforms complex agentic workflows into a sleek, futuristic hub, providing developers with absolute command over their local neural models and agent behavior.

![AESTHETICS](https://img.shields.io/badge/Aesthetics-Premium-9b4dff)
![TECH](https://img.shields.io/badge/Stack-Next.js%20|%20Framer%20Motion-blue)
![DOCKER](https://img.shields.io/badge/Deployment-Docker%20Ready-2496ed)

---

## ⚡ Key Modules

### 🧠 Neural Hub (Model Management)
Total control over your AI provider fleet. Register, switch, and prune model endpoints with a single click.
- **Auto-Discovery**: Support for probing providers (Ollama, DeepSeek, OpenAI) to auto-batch register available nodes.
- **Precise Purge**: Delete entire provider groups or surgically remove individual model nodes.
- **State Sync**: Real-time synchronization between the UI registry and your local `config.yaml`.

### ⚙️ Config Center (Live Manifest)
A real-time, manifest-style editor for the `~/.hermes/config.yaml` file.
- **Instant Manifestation**: Edit your kernel configuration directly in the browser with high-fidelity YAML syntax highlighting.
- **Shadow Syncing**: Any change in the Model Hub UI is instantly reflected in the Config Center manifest, and vice versa.
- **Auto-Backup**: Every save operation creates a `.bak` version of your configuration for safety.

### 🕸️ Neural Chat & Logs
- **Thought Streaming**: Watch the agent process logic in real-time.
- **Kernel Stream**: Integrated real-time log viewer to monitor system heartbeats and gateway status.
- **Glassmorphism UI**: High-density interface with interactive micro-animations and smooth transitions.

---

## 🛠️ Mandatory Gateway Setup

Before using the Hermes Nexus, you **must** ensure your Hermes Gateway is configured to allow API access and CORS requests.

Update your `~/.hermes/config.yaml` with the following block:

```yaml
platforms:
  api_server:
    enabled: true
    port: 8642      # Default gateway port
  extra:
    cors_origins:
      - '*'         # Required to allow the WebUI to communicate with the gateway
```

> [!IMPORTANT]
> Without the `cors_origins: ['*']` setting, the Web UI will be unable to fetch logs or stream chat thought processes due to browser security restrictions.

---

## 🚀 Deployment Options

### Manual Local Setup
```bash
# Clone & Enter
git clone https://github.com/hillzhang/hermes-ui.git
cd hermes-ui

# Install Dependencies
npm install

# Live Development
npm run dev
```

### 🐳 Docker Deployment (Recommended)
The most isolated and robust way to run Hermes UI with persistent host configuration.

```bash
# One-liner to pull and run
docker-compose up -d --build
```

**Persistence Logic:**
- The container maps your host's `~/.hermes` directory to its internal logic.
- Managed via `HERMES_CONFIG_PATH` environment variable in `docker-compose.yml`.

---

## 📂 Configuration
Hermes Nexus acts as a bridge to your local environment. It primarily manages:
- **`~/.hermes/config.yaml`**: The ground truth for all agentic and model settings.
- **Port 3000**: Default WebUI access.
- **Port 2024**: Default Hermes Gateway communication.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS with Design Token Architecture
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Visuals**: [Lucide React](https://lucide.dev/) Icons
- **Deployment**: [Docker](https://www.docker.com/) (Standalone Multi-stage)

---

> [!TIP]
> **Pro-Tip**: Use the **Model Hub**'s "Batch Discover" feature to instantly onboard all your local Ollama models into the Hermes ecosystem.

*Developed with the spirit of absolute observability and premium aesthetics for the Nous Research ecosystem.*
