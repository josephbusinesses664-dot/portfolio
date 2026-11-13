// Pointer-reactive field for the playground. Hand-written on a 2D canvas:
// a lattice that yields to the pointer, with a decaying trail. Chosen over a
// WebGL shader so it paints identically everywhere, costs nothing when idle,
// and can be verified frame by frame.

type Cell = { x: number; y: number; ox: number; oy: number; heat: number };

export const initField = () => {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-field]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let step = 30;
  let cells: Cell[] = [];

  const pointer = { x: -9999, y: -9999, px: -9999, py: -9999, active: false, speed: 0 };
  let raf = 0;
  let visible = false;

  const build = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    step = w < 700 ? 26 : 34;
    cols = Math.ceil(w / step) + 1;
    rows = Math.ceil(h / step) + 1;
    cells = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        cells.push({ x: x * step, y: y * step, ox: 0, oy: 0, heat: 0 });
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    const reach = 190;
    for (const cell of cells) {
      const dx = cell.x - pointer.x;
      const dy = cell.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      const near = dist < reach ? 1 - dist / reach : 0;

      // Push away from the pointer, spring back on its own.
      const force = near * near * 26;
      const ang = Math.atan2(dy, dx) || 0;
      const tx = Math.cos(ang) * force;
      const ty = Math.sin(ang) * force;

      cell.ox += (tx - cell.ox) * 0.14;
      cell.oy += (ty - cell.oy) * 0.14;
      cell.heat += ((near > 0 ? near : 0) - cell.heat) * 0.12;

      const size = 1 + cell.heat * 2.4;
      const alpha = 0.16 + cell.heat * 0.72;
      ctx.fillStyle = `rgba(241, 241, 241, ${alpha})`;
      ctx.fillRect(
        cell.x + cell.ox - size / 2,
        cell.y + cell.oy - size / 2,
        size,
        size
      );
    }

    // Trail: fading dots behind the pointer.
    if (pointer.speed > 0.4) {
      const grad = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 90);
      grad.addColorStop(0, 'rgba(201, 180, 138, 0.18)');
      grad.addColorStop(1, 'rgba(201, 180, 138, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 90, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const frame = () => {
    raf = 0;
    if (!visible) return;
    pointer.speed *= 0.9;
    draw();
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (!visible || raf) return;
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    visible = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const onMove = (event: PointerEvent) => {
    if (!visible) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (pointer.active) {
      pointer.speed = Math.hypot(x - pointer.px, y - pointer.py);
    }
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
  };

  const onLeave = () => {
    pointer.active = false;
    pointer.x = -9999;
    pointer.y = -9999;
  };

  build();
  draw();

  if (reduced) {
    // Static lattice, no pointer response.
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) draw();
    });
    observer.observe(canvas);
    window.addEventListener('resize', () => {
      build();
      draw();
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    },
    { rootMargin: '100px' }
  );
  observer.observe(canvas);

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
  window.addEventListener('resize', () => {
    build();
    if (!raf) draw();
  });
};

initField();
