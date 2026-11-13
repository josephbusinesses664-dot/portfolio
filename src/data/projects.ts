export interface Project {
  index: string;
  slug: string;
  title: string;
  oneLiner: string;
  description: string;
  stack: string;
  scale: string;
  tags: string[];
  repo?: string;
  repoLabel?: string;
  isPrivate: boolean;
}

export const projects: Project[] = [
  {
    index: '01',
    slug: 'memory-fabric',
    title: 'Memory Fabric',
    oneLiner: 'A memory layer that can prove what it remembers.',
    description:
      'A model-agnostic memory and retrieval platform. The canonical memory model is the only source of truth; the dense, lexical, entity and graph indexes are derived from it, so any index can be deleted and rebuilt without losing a fact. Every answer carries its evidence. Ten verbs on the stable API, from remember and recall to forget, restore and rebuild_index.',
    stack: 'Python',
    scale: '239 modules / 89 test modules',
    tags: ['Memory', 'Retrieval', 'Python'],
    isPrivate: true
  },
  {
    index: '02',
    slug: 'wardrobe',
    title: 'Wardrobe',
    oneLiner: 'A wardrobe that knows what you actually wear.',
    description:
      'Garments captured from the camera roll or a live camera, then read for structured metadata and colour by Gemini vision. Wear history and laundry cycles are tracked. Outfits come from a deterministic colour-harmony and silhouette-proportion engine, not from a model guessing, because proportions should give the same answer twice.',
    stack: 'TypeScript',
    scale: '~9.2k lines / Expo + Node',
    tags: ['Vision', 'Mobile', 'TypeScript'],
    repo: 'https://github.com/josephbusinesses664-dot/wardrobe-landing',
    repoLabel: 'wardrobe-landing',
    isPrivate: true
  },
  {
    index: '03',
    slug: 'agent-os-2',
    title: 'Agent OS 2',
    oneLiner: 'An operating system for a company staffed by agents.',
    description:
      'You talk to an entire organisation through Mattermost. Agents collaborate, delegate, spawn sub-agents, use skills and MCP tools, route work to the model that fits, hold to budgets, stop for human approval on anything dangerous, and leave an audit trail behind. LangGraph orchestration, skill contracts, agent identity, MCP governance, an admin UI.',
    stack: 'Python',
    scale: 'LangGraph / MCP',
    tags: ['Agents', 'Orchestration', 'MCP'],
    repo: 'https://github.com/josephbusinesses664-dot/agent_os2',
    repoLabel: 'agent_os2',
    isPrivate: false
  },
  {
    index: '04',
    slug: 'moe-runtime',
    title: 'moe-runtime',
    oneLiner: 'Autonomous coding on hardware that should not manage it.',
    description:
      'An executive model holds the global picture and compiles bounded task packets. A local 30B mixture-of-experts coding model implements, tests, reviews, repairs and security-checks each packet on a single 8 GB card. Every step runs through a crash-safe state machine, and only verified work is committed and pushed. Progress posts to Discord.',
    stack: 'Python',
    scale: '8 GB VRAM / Qwen3-Coder-30B-A3B',
    tags: ['Local models', 'Tooling', 'Python'],
    isPrivate: true
  }
];

export interface Aside {
  title: string;
  note: string;
  href?: string;
  label: string;
}

export const asides: Aside[] = [
  {
    title: 'prem-ium card',
    note: 'A 3D contact card lit like a sunlit room. Rendered in the browser, not a video.',
    href: 'https://tap.prem-ium.online',
    label: 'tap.prem-ium.online'
  },
  {
    title: 'browser-agent-muse',
    note: 'A harness for putting a model in front of a real browser and watching what it does.',
    href: 'https://github.com/josephbusinesses664-dot/browser-agent-muse',
    label: 'github'
  }
];
