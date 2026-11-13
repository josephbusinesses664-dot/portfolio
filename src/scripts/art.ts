// Generated art for the four work cards. Nothing here is a screenshot or a
// stock image: every pixel is drawn from the project's own subject matter.
// Each piece only animates while it is on screen, and paints in greyscale
// except for one restrained warm accent.

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

const INK = '241, 241, 241';
const ACCENT = '201, 180, 138';

const alpha = (a: number) => `rgba(${INK}, ${a})`;
const accent = (a: number) => `rgba(${ACCENT}, ${a})`;

const setup = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const paint = (draw: Draw) => {
    let raf = 0;
    let visible = false;
    let width = 0;
    let height = 0;
    const start = performance.now();

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      draw(ctx, width, height, (now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    const run = () => {
      if (!visible || raf) return;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      visible = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    size();
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          visible = true;
          size();
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            draw(ctx, width, height, 0);
          } else {
            run();
          }
        } else {
          stop();
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(canvas);

    new ResizeObserver(() => {
      size();
      if (!raf) draw(ctx, width, height, 0);
    }).observe(canvas);

    // A single static paint so the panel is never blank before it scrolls in.
    draw(ctx, width, height, 0);
    return { observer };
  };

  return paint;
};

/* 01 — Memory Fabric: a canonical lattice with a derived layer above it. */
const memoryFabric: Draw = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#101010';
  ctx.fillRect(0, 0, w, h);

  const cols = 22;
  const rows = 9;
  const padX = w * 0.09;
  const padY = h * 0.16;
  const stepX = (w - padX * 2) / (cols - 1);
  const stepY = (h - padY * 2) / (rows - 1);

  // Derived layer: faint lattice, breathes on a slow diagonal wave.
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = padX + x * stepX;
      const py = padY + y * stepY;
      const wave = Math.sin((x + y) * 0.42 - t * 0.9) * 0.5 + 0.5;
      const r = 0.7 + wave * 1.15;
      ctx.fillStyle = alpha(0.1 + wave * 0.22);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Canonical spine: one row that never moves, drawn solid.
  const spineY = padY + stepY * Math.floor(rows / 2);
  ctx.strokeStyle = alpha(0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX - stepX * 0.7, spineY);
  ctx.lineTo(w - padX + stepX * 0.7, spineY);
  ctx.stroke();

  // Three canonical nodes, connected down to the lattice beneath them.
  const nodes = [3, 11, 18];
  nodes.forEach((col, i) => {
    const px = padX + col * stepX;
    const hop = (Math.sin(t * 0.8 + i * 1.7) * 0.5 + 0.5) * (stepY * 2.1);
    const ty = spineY + stepY * 0.9 + hop;

    ctx.strokeStyle = alpha(0.28);
    ctx.beginPath();
    ctx.moveTo(px, spineY);
    ctx.lineTo(px, ty);
    ctx.stroke();

    ctx.fillStyle = i === 1 ? accent(0.95) : alpha(0.92);
    ctx.beginPath();
    ctx.arc(px, spineY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = alpha(0.5);
    ctx.beginPath();
    ctx.arc(px, ty, 4.5, 0, Math.PI * 2);
    ctx.stroke();
  });

  // A rebuild pass sweeping left to right every few seconds.
  const sweep = ((t * 0.22) % 1.4) - 0.2;
  if (sweep >= 0 && sweep <= 1) {
    const sx = padX + sweep * (w - padX * 2);
    const grad = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0);
    grad.addColorStop(0, alpha(0));
    grad.addColorStop(0.5, alpha(0.14));
    grad.addColorStop(1, alpha(0));
    ctx.fillStyle = grad;
    ctx.fillRect(sx - 80, 0, 160, h);
  }
};

/* 02 — Wardrobe: a folded stack with one deterministic harmony row. */
const wardrobe: Draw = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#131312';
  ctx.fillRect(0, 0, w, h);

  const padX = w * 0.1;
  const bandCount = 7;
  const padY = h * 0.18;
  const usable = h - padY * 2;

  for (let i = 0; i < bandCount; i++) {
    const share = 0.55 + ((Math.sin(i * 2.1) + 1) / 2) * 0.75;
    const total = Array.from({ length: bandCount }, (_, k) => 0.55 + ((Math.sin(k * 2.1) + 1) / 2) * 0.75).reduce(
      (a, b) => a + b,
      0
    );
    const bandH = (usable / total) * share;
    let y = padY;
    for (let k = 0; k < i; k++) {
      const s = 0.55 + ((Math.sin(k * 2.1) + 1) / 2) * 0.75;
      y += (usable / total) * s;
    }

    const drift = Math.sin(t * 0.5 + i * 0.9) * 1.6;
    const isPick = i === 2;
    const inset = (i % 3) * (w * 0.014) + (isPick ? w * 0.03 : 0);

    // Garment body.
    ctx.fillStyle = isPick ? accent(0.16) : alpha(0.05 + (i % 3) * 0.018);
    ctx.fillRect(padX + inset, y + drift, w - (padX + inset) * 2, bandH - 3);

    // Colour chip at the left, as the vision pass would have read it.
    ctx.fillStyle = isPick ? accent(0.9) : alpha(0.18 + (i % 4) * 0.12);
    ctx.fillRect(padX + inset, y + drift, 3, bandH - 3);

    // Seam.
    ctx.strokeStyle = alpha(0.1);
    ctx.beginPath();
    ctx.moveTo(padX, y + bandH - 1.5);
    ctx.lineTo(w - padX, y + bandH - 1.5);
    ctx.stroke();
  }

  // Harmony line: one continuous stroke threading the chips.
  ctx.strokeStyle = accent(0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < bandCount; i++) {
    const share = 0.55 + ((Math.sin(i * 2.1) + 1) / 2) * 0.75;
    const total = Array.from({ length: bandCount }, (_, k) => 0.55 + ((Math.sin(k * 2.1) + 1) / 2) * 0.75).reduce(
      (a, b) => a + b,
      0
    );
    let y = padY;
    for (let k = 0; k < i; k++) {
      const s = 0.55 + ((Math.sin(k * 2.1) + 1) / 2) * 0.75;
      y += (usable / total) * s;
    }
    const bandH = (usable / total) * share;
    const drift = Math.sin(t * 0.5 + i * 0.9) * 1.6;
    const x = padX + (i % 3) * (w * 0.014) + (i === 2 ? w * 0.03 : 0) + 1.5;
    const py = y + drift + (bandH - 3) / 2;
    if (i === 0) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();
};

/* 03 — Agent OS: delegation tree, with work pulses travelling outward. */
const agentOs: Draw = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#101011';
  ctx.fillRect(0, 0, w, h);

  const padX = w * 0.12;
  const levels = 4;
  const stepX = (w - padX * 2) / (levels - 1);
  const midY = h / 2;

  type Node = { x: number; y: number; depth: number; parent: Node | null };
  const nodes: Node[] = [];
  const root: Node = { x: padX, y: midY, depth: 0, parent: null };
  nodes.push(root);

  let frontier = [root];
  for (let d = 1; d < levels; d++) {
    const next: Node[] = [];
    const spread = h * 0.9;
    frontier.forEach((parent, i) => {
      const count = d === 1 ? 3 : 2;
      for (let c = 0; c < count; c++) {
        const y = midY + (i - (frontier.length - 1) / 2) * (spread / frontier.length) + (c - (count - 1) / 2) * (spread / (frontier.length * count + 1));
        const node: Node = { x: padX + d * stepX, y, depth: d, parent };
        nodes.push(node);
        next.push(node);
      }
    });
    frontier = next;
  }

  ctx.lineWidth = 1;
  nodes.forEach((node) => {
    if (!node.parent) return;
    const { x, y } = node;
    const px = node.parent.x;
    const py = node.parent.y;
    ctx.strokeStyle = alpha(0.16);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + (x - px) * 0.5, py);
    ctx.lineTo(px + (x - px) * 0.5, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  // Pulses: each edge gets one packet on a staggered cycle.
  nodes.forEach((node, i) => {
    if (!node.parent) return;
    const cycle = 3.4;
    const phase = ((t + i * 0.42) % cycle) / cycle;
    if (phase > 0.62) return;
    const p = phase / 0.62;
    const { x, y } = node;
    const px = node.parent.x;
    const py = node.parent.y;
    let cx = px;
    let cy = py;
    if (p < 0.33) cx = px + (x - px) * 0.5 * (p / 0.33);
    else if (p < 0.66) {
      cx = px + (x - px) * 0.5;
      cy = py + (y - py) * ((p - 0.33) / 0.33);
    } else {
      cx = px + (x - px) * 0.5 + (x - (px + (x - px) * 0.5)) * ((p - 0.66) / 0.34);
      cy = y;
    }
    ctx.fillStyle = node.depth === 3 ? accent(0.95) : alpha(0.75);
    ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
  });

  nodes.forEach((node) => {
    const isRoot = node.depth === 0;
    const size = isRoot ? 7 : 4;
    ctx.fillStyle = isRoot ? alpha(0.95) : alpha(0.55);
    ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size);
    if (isRoot) {
      ctx.strokeStyle = accent(0.55);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 13 + Math.sin(t * 1.2) * 2.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
};

/* 04 — moe-runtime: packets moving through lanes under a memory ceiling. */
const moeRuntime: Draw = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0E0E0F';
  ctx.fillRect(0, 0, w, h);

  const padX = w * 0.09;
  const padY = h * 0.2;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  // Memory ceiling: the 8 GB line nobody may cross.
  ctx.strokeStyle = alpha(0.34);
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.moveTo(padX, padY);
  ctx.lineTo(padX + innerW, padY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = alpha(0.4);
  ctx.font = '10px "JetBrains Mono Variable", monospace';
  ctx.fillText('CEILING', padX, padY - 7);

  // Usage profile sitting just under the ceiling.
  const bars = 46;
  for (let i = 0; i < bars; i++) {
    const x = padX + (i / bars) * innerW;
    const bw = (innerW / bars) * 0.62;
    const noise = (Math.sin(i * 0.7 + t * 1.4) * 0.5 + 0.5) * 0.55 + (Math.sin(i * 2.3) * 0.5 + 0.5) * 0.3;
    const bh = innerH * 0.42 * noise + 2;
    ctx.fillStyle = alpha(0.1 + noise * 0.2);
    ctx.fillRect(x, padY + innerH - bh, bw, bh);
  }

  // Three lanes of task packets, each state machine advancing.
  const lanes = 3;
  for (let lane = 0; lane < lanes; lane++) {
    const y = padY + 18 + lane * ((innerH * 0.44) / lanes);
    ctx.strokeStyle = alpha(0.08);
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + innerW, y);
    ctx.stroke();

    const count = 5;
    for (let k = 0; k < count; k++) {
      const speed = 0.11 + lane * 0.03;
      const p = ((t * speed + k / count + lane * 0.13) % 1);
      const x = padX + p * innerW;
      const verifying = p > 0.72;
      const size = 5;
      ctx.fillStyle = verifying ? accent(0.9) : alpha(0.4 + Math.sin(p * Math.PI) * 0.45);
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      if (verifying) {
        ctx.strokeStyle = accent(0.35);
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Commit markers along the bottom edge.
  ctx.fillStyle = alpha(0.3);
  for (let i = 0; i < 9; i++) {
    const x = padX + (i / 8) * innerW;
    ctx.fillRect(x, padY + innerH - 3, 1, 3);
  }
};

const artwork: Record<string, Draw> = {
  'memory-fabric': memoryFabric,
  wardrobe,
  'agent-os-2': agentOs,
  'moe-runtime': moeRuntime
};

export const initArt = () => {
  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-canvas]'));
  canvases.forEach((canvas) => {
    const paint = setup(canvas);
    const draw = artwork[canvas.dataset.canvas || ''];
    if (paint && draw) paint(draw);
  });
};

initArt();
