# 🏛️ Hermes Nexus Web UI
> **The High-Performance Web Interface for the [Hermes Agent](https://github.com/nousresearch/hermes-agent)**

**Hermes Nexus** is a premium, high-observability **Web UI** and operation center designed for the **[Hermes Agent](https://github.com/nousresearch/hermes-agent)** ecosystem. It transforms complex agentic workflows into a sleek, futuristic hub, providing developers with absolute command over their local neural models and agent behavior.

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

### 🖼️ Vision & Storage Management
High-performance visual analysis pipeline for multimodal models.
- **Environment-Aware**: Automatically resolves and mounts image paths between Host and Docker environments for seamless model access.
- **Auto-Purge (LRU)**: Intelligent storage management that keeps your disk clean by retaining only a specified number of recent files (images/docs).
- **Configurable Retention**: Control your storage footprint directly from the UI or YAML manifest.

---

## 🖥️ Web UI Interface

### 💬 Neural Chat Experience
Experience real-time stream generation with premium typography and smooth auto-scroll.
<img src="public/ui/chat.png" width="800" alt="Chat UI" />

### 🧠 Model Command Center
Hot-swap models and manage your provider fleet with high-density system metrics.
<img src="public/ui/model.png" width="800" alt="Model Hub" />

### 📂 Session & Artifact Vault
Deep history management with instant session re-linking and multimodal attachment support.
<img src="public/ui/sessions.png" width="800" alt="Sessions" />

### 🛠️ Neural Skills Library
Intelligent command discovery and automated skill orchestration for autonomous workflows.
<img src="public/ui/skills.png" width="800" alt="Skills" />

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

### 1. Manual Local Setup
Ideal for rapid UI customization and local experimentation.
```bash
# Clone & Enter
git clone https://github.com/hillzhang/hermes-ui.git
cd hermes-ui

# Install Dependencies
npm install

# Live Development
npm run dev
```

### 2. Standard Docker Deployment (Recommended)
The most isolated and robust way to run Hermes UI with persistent host configuration.

```bash
# One-liner to pull and run via Compose
docker-compose up -d --build
```

**Persistence Logic:**
- The container maps your host's `~/.hermes` directory to its internal logic.
- Managed via `HERMES_CONFIG_PATH` environment variable in `docker-compose.yml`.

### 3. Integrated All-in-One (Backend + UI)
This is the **zero-configuration** method. It builds both the [Hermes Agent](https://github.com/nousresearch/hermes-agent) backend and this Web UI into a single high-performance image.

**Features:**
- **Auto-Sync (Named Volumes)**: The container automatically seeds your persistent volume with the **Core Skills Library** and a default configuration on its first run.
- **Embedded Gateway**: The backend server runs internally, synchronized with the UI.
- **Single Port Access**: Expose port 3000 for the full experience.

**Build All-in-One:**
```bash
docker build -t hermes-nexus-allinone -f Dockerfile.allinone .
```

> [!NOTE]
> **All-in-One Efficiency**: Unlike the standard UI, this mode includes a pre-compiled version of the **Hermes Agent** kernel inside. It is perfect for users who want a single-command deployment without installing Python locally. It also features **Reverse-Mapping**, which automatically seeds your host volume with all built-in skills on the first launch.

**Run All-in-One (Persistent):**
```bash
# Docker will automatically create and populate 'hermes_data' volume
docker run -d \
  -p 3000:3000 \
  -v hermes_data:/data \
  --name hermes-nexus \
  hermes-nexus-allinone
```

---

## 📂 Configuration
Hermes Nexus acts as a bridge to your local environment. It primarily manages:
- **`~/.hermes/config.yaml`**: The ground truth for all agentic and model settings.
- **`~/.hermes/uploads/`**: Local cache for vision-capable model analysis (auto-managed).

### Storage Settings
Manage your local file footprint by adjusting the retention limit:
```yaml
storage:
  upload_retention_limit: 100  # Automatically purge oldest files when limit is reached
```
This can be adjusted via the **Config Center** slider in the WebUI.

---

## 🧪 Capability Showcase (Test Cases)

### 🖼️ Multimodal Vision
*Verified on: `gemma-4-26b-a4b-it-4bit`*

| Scenario | Input | AI Reasoning Output |
| :--- | :--- | :--- |
| **Local Image Analysis** | Attached Image (e.g., `panda.jpg`) | "The image contains a panda sitting on a bamboo branch..." |
| **Path-Injected Inference** | `[Attached Image: ~/.hermes/uploads/...]` | The vision adapter extracts the physical path and performs direct local file inference. |

*Steps to Reproduce:*
1. Select **`gemma-4-26b-a4b-it-4bit`** as the active node in Model Hub.
2. Upload an image via the Neural Chat interface.
3. The UI automatically injects the physical mounting path into the message.
4. The model parses the tag and analyzes the local file without cloud latency.

### 📄 Document & Code Analysis
Unlock deep reasoning over local artifacts without manual copy-pasting.

| Case Type | Target Model | Artifact Type | Prompt Example |
| :--- | :--- | :--- | :--- |
| **Logic Audit** | `gemma-4-26b` | `main.py` | "Analyze the concurrency safety of this script." |
| **Data Extraction** | `hermes-3-70b` | `data.json` | "Summarize the hierarchical structure of this config." |
| **Log Diagnosis** | `qwen-2.5-coder` | `error.log` | "Find the root cause of the timeout in line 42." |

**Workflow**:
1. Select the **Document Icon** (Blue) in the Neural Bridge.
2. Upload your source file or log.
3. The system injects a physical path `[Attached File: ~/.hermes/uploads/...]`.
4. The Agent reads the local file directly and provides reasoning.

---

### 🔧 Tool Execution (Draft)
*Coming Soon: Dynamic CLI & File System Operations benchmarks.*

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
