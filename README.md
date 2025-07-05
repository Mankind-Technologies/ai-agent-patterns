# AI Agent Patterns

A curated collection of practical, modern patterns for building robust, transparent, and efficient AI agents.  
**Explore real, working examples for OpenAI Agent SDK (TypeScript) and more coming soon!**

---

## 🚀 What Are AI Agent Patterns?

AI agent patterns are reusable solutions to common challenges in agent design—like tool usage, transparency, resource management, and user experience. This repo provides hands-on, production-ready implementations for developers.

---

## 🧩 Available Patterns

| Pattern Name                | Description                                                                                  | Docs & Code |
|-----------------------------|----------------------------------------------------------------------------------------------|-------------|
| **Agent Switch**            | Flat-complexity scaling for categorical use cases. Route requests to specialized agents based on a parameter (e.g., brand, region). | [Docs](src/site/docs/patterns/agent-switch.md) / [Code](src/patterns/agentSwitch/) |
| **CountDown Timer**         | Give agents a sense of real time and urgency. Tools return time-passing info, enabling time-aware strategies. | [Docs](src/site/docs/patterns/countdown-timer.md) / [Code](src/patterns/countDownTimer/) |
| **Embedded Explaining**     | Require agents to explain every tool call ("why" parameter), boosting transparency and debuggability. | [Docs](src/site/docs/patterns/embedded-explaining.md) / [Code](src/patterns/embeddedExplaining/) |
| **On-Demand Context Retrieval** | Efficiently retrieve and condense medium-sized context only when needed, reducing token and cost overhead. | [Docs](src/site/docs/patterns/on-demand-context-retrieval.md) / [Code](src/patterns/onDemandContextRetrieval/) |
| **Tap Actions**             | Intercept and aggregate agent operations for real-time, human-readable progress and debugging. | [Docs](src/site/docs/patterns/tap-actions.md) / [Code](src/patterns/tapActions/) |
| **Tool Budget**             | Enforce hard limits on expensive tool usage, encouraging strategic, cost-effective agent behavior. | [Docs](src/site/docs/patterns/tool-budget.md) / [Code](src/patterns/toolBudget/) |

---

## 🏁 Quick Start

1. **Browse Patterns:**  
   Explore the `src/patterns/` directory for code, and `src/site/docs/patterns/` for in-depth docs.

2. **Run Examples:**  
   Each pattern includes a TypeScript implementation using the OpenAI Agent SDK.  
   See the pattern's README for setup and usage.

3. **Documentation Site:**  
   Launch the interactive docs site:
   ```bash
   make site-install
   make site-start
   ```
   Visit [http://localhost:3000](http://localhost:3000) to explore.

---

## 🗂️ Project Structure

```
src/
├── patterns/      # Pattern implementations (code, tests, READMEs)
│   └── <pattern>/
│       └── openai-agent-sdk-ts/
├── site/          # Documentation website (Docusaurus)
│   └── docs/patterns/
```

---

## 🛠️ Development & Contribution

- **Install all dependencies:**  
  `make patterns-install`
- **Build all pattern projects:**  
  `make patterns-build`
- **Type-check all pattern projects:**  
  `make patterns-check`
- **Test all pattern projects:**  
  `make patterns-test`
- **Run all checks (site + patterns):**  
  `make check-all`

**Want to contribute?**  
See [AGENTS.md](./AGENTS.md) for guidelines and best practices.

---

## 📚 Supported Libraries

- **OpenAI Agent SDK (TypeScript)**
- *Python support for OpenAI Agent SDK and Pydantic AI coming soon!*

---

## 💡 Why Use These Patterns?

- Save time with proven, production-ready solutions
- Improve agent transparency, efficiency, and user experience
- Learn best practices for modern AI agent development

---

## 🤝 Community & Contact

- Found a bug? Have a new pattern idea?  
  Open an issue or PR!
- For questions, reach out via GitHub discussions or issues.

---

*Focus on communication, simplicity, and comprehensive coverage of modern AI agent frameworks.* 