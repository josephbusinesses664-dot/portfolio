// Motion system. Guarantees, in this order:
//   1. reduced motion wins over everything and shows final states instantly;
//   2. Lenis drives ScrollTrigger through one shared ticker;
//   3. no ScrollTrigger pins anywhere — the stacking is CSS sticky;
//   4. text scrubs use start 'top center' / end 'bottom center' / scrub true;
//   5. theme flips are a scrubbed background/color tween on the two groups.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ duration: 0.5, overwrite: false });

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

export const initMotion = () => {
  const preloader = document.querySelector<HTMLElement>('#preloader');
  const skip = document.querySelector<HTMLElement>('[data-skip]');
  const counter = document.querySelector<HTMLElement>('[data-count]');
  const bar = document.querySelector<HTMLElement>('[data-bar]');
  const groups = document.querySelectorAll<HTMLElement>('[data-group]');

  const finishPreloader = () => {
    if (!preloader || preloader.hidden) return;
    preloader.setAttribute('hidden', '');
    document.documentElement.style.overflow = '';
    ScrollTrigger.refresh();
  };

  if (reduced.matches) {
    // Final states, immediately. No counter, no wipes, no scrub.
    finishPreloader();
    document.querySelectorAll<HTMLElement>('[data-mask-line], [data-statement] .w').forEach((el) => {
      el.style.transform = 'none';
      el.style.opacity = '1';
    });
    document.querySelectorAll<HTMLElement>('.hero__copy').forEach((el) => {
      el.style.opacity = '1';
    });
    const rail = document.querySelector<HTMLElement>('[data-rail-track]');
    if (rail) rail.style.transform = 'none';
    const clock = document.querySelector<HTMLElement>('[data-clock]');
    if (clock) startClock(clock);
    initMenu();
    return;
  }

  /* ---------------- Lenis <-> ScrollTrigger ---------------- */
  const lenis = new Lenis({
    duration: 1.05,
    lerp: 0.1,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
    smoothWheel: true
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.documentElement.style.overflow = 'hidden';

  /* ---------------- Preloader ---------------- */
  const state = { value: 0 };
  const setCount = () => {
    if (counter) counter.textContent = String(Math.round(state.value)).padStart(2, '0');
  };
  setCount();

  const intro = gsap.timeline({
    onComplete: () => {
      finishPreloader();
      heroIn();
    }
  });

  // Whole sequence is deliberately under 2.2s, including the wipe.
  intro
    .to(state, {
      value: 100,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: setCount
    })
    .to(bar, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' }, 0)
    .to(counter ? [counter] : [], { yPercent: -18, opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.0)
    .to(preloader, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.5,
      ease: 'power3.inOut'
    }, 1.05);

  if (preloader) {
    preloader.style.clipPath = 'inset(0% 0% 0% 0%)';
  }

  const killIntro = () => {
    intro.progress(1);
    finishPreloader();
    heroIn();
  };

  skip?.addEventListener('click', killIntro);
  const onAnyKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Enter') {
      killIntro();
      window.removeEventListener('keydown', onAnyKey);
    }
  };
  window.addEventListener('keydown', onAnyKey);

  /* ---------------- Hero ---------------- */
  const heroLine = () => {
    const lines = document.querySelectorAll<HTMLElement>('.hero [data-mask-line]');
    gsap.set(lines, { yPercent: 110 });
    return lines;
  };

  const heroIn = () => {
    const lines = heroLine();
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(lines, { yPercent: 0, duration: 0.9, stagger: 0.06 })
      .from('.hero__eyebrow > span', { opacity: 0, y: 8, duration: 0.5, stagger: 0.06 }, 0.15)
      .from('.hero__copy', { opacity: 0, y: 10, duration: 0.6 }, 0.4)
      .from('.hero__cue', { opacity: 0, duration: 0.5 }, 0.5)
      .from('.hero__prox', { opacity: 0, duration: 0.8 }, 0.55);
  };

  if (!preloader) heroIn();
  else heroLine();

  /* ---------------- Marquee: xPercent loop, velocity modulated ---------------- */
  const track = document.querySelector<HTMLElement>('[data-marquee]');
  if (track) {
    const loop = gsap.to(track, {
      xPercent: -50,
      duration: 26,
      ease: 'none',
      repeat: -1
    });

    ScrollTrigger.create({
      trigger: '.marquee',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const kick = gsap.utils.clamp(-3, 5, Math.abs(self.getVelocity()) / 320);
        gsap.to(loop, { timeScale: 1 + kick, duration: 0.5, overwrite: true });
      }
    });
  }

  /* ---------------- Statement: word-by-word scrub ---------------- */
  const statement = document.querySelector<HTMLElement>('[data-statement]');
  if (statement) {
    const words = statement.querySelectorAll('.w');
    gsap.set(words, { opacity: 0.12 });
    gsap.to(words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.4,
      scrollTrigger: {
        trigger: statement,
        start: 'top center',
        end: 'bottom center',
        scrub: true
      }
    });
  }

  /* ---------------- Card entrances + masks ---------------- */
  document.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
    const line = card.querySelector<HTMLElement>('[data-mask-line]');
    const media = card.querySelector<HTMLElement>('[data-media]');
    const top = card.querySelector<HTMLElement>('.card__top');
    const desc = card.querySelector<HTMLElement>('.card__desc');

    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 72%', once: true }
    });

    if (line) {
      gsap.set(line, { yPercent: 108 });
      tl.to(line, { yPercent: 0, duration: 0.8, ease: 'power3.out' });
    }
    if (top) tl.from(top, { opacity: 0, duration: 0.4 }, 0);
    if (desc) tl.from(desc, { opacity: 0, y: 12, duration: 0.5 }, 0.12);
    if (media) tl.from(media, { opacity: 0, y: 22, duration: 0.6 }, 0.18);
  });

  /* ---------------- Hover: media reveal ---------------- */
  document.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
    const media = card.querySelector<HTMLElement>('[data-media]');
    if (!media) return;
    card.addEventListener('pointerenter', () => gsap.to(media, { scale: 0.994, duration: 0.5, ease: 'power2.out' }));
    card.addEventListener('pointerleave', () => gsap.to(media, { scale: 1, duration: 0.5, ease: 'power2.out' }));
  });

  /* ---------------- Playground: horizontal run, sticky stage ---------------- */
  const run = document.querySelector<HTMLElement>('[data-rail]');
  const railTrack = document.querySelector<HTMLElement>('[data-rail-track]');
  if (run && railTrack) {
    const distance = () => Math.max(0, railTrack.scrollWidth - window.innerWidth + 48);

    gsap.to(railTrack, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: run,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2}`,
        scrub: true,
        invalidateOnRefresh: true
      }
    });
  }

  /* ---------------- Theme flips ---------------- */
  // Exactly two wrapper groups, each with the reference's 12% insets:
  // group A scrubs dark -> light, group B scrubs light -> dark, so the seam
  // between them is the chapter change and the contact section lands dark.
  //
  // One deliberate deviation: every chapter paints its own flat colour. A
  // scrub over a 7,000px group otherwise parks rgb(81,81,81) behind the hero —
  // a grey smear through the middle of a chapter instead of an edge. With the
  // chapters opaque, the scrubbed group colour is only ever seen at the seam,
  // which is exactly where a flip belongs.
  groups.forEach((group) => {
    const isLight = group.classList.contains('group--light');
    const from = isLight ? '#F1F1F1' : '#161616';
    const to = isLight ? '#161616' : '#F1F1F1';

    gsap.fromTo(
      group,
      { backgroundColor: from },
      {
        backgroundColor: to,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: group,
          start: 'top 12%',
          end: 'bottom 12%',
          scrub: true
        }
      }
    );
  });

  /* ---------------- Contact ---------------- */
  const say = document.querySelector<HTMLElement>('.contact [data-mask-line]');
  if (say) {
    gsap.set(say, { yPercent: 108 });
    gsap.to(say, {
      yPercent: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.contact__say', start: 'top 82%', once: true }
    });
  }

  /* ---------------- Cursor + magnets ---------------- */
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (fine && dot && ring) {
    dot.hidden = false;
    ring.hidden = false;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { x: pointer.x, y: pointer.y };
    const ringPos = { x: pointer.x, y: pointer.y };
    let scale = 1;
    let visible = false;

    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!visible) {
        visible = true;
        dotPos.x = ringPos.x = pointer.x;
        dotPos.y = ringPos.y = pointer.y;
      }
    });

    gsap.ticker.add(() => {
      if (!visible) return;
      dotPos.x += (pointer.x - dotPos.x) * 0.35;
      dotPos.y += (pointer.y - dotPos.y) * 0.35;
      ringPos.x += (pointer.x - ringPos.x) * 0.14;
      ringPos.y += (pointer.y - ringPos.y) * 0.14;
      dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) scale(${scale})`;
    });

    const grow = { scale: 1 };
    const scaleTo = (value: number) => {
      gsap.to(grow, {
        scale: value,
        duration: 0.35,
        ease: 'power2.out',
        onUpdate: () => {
          scale = grow.scale;
        }
      });
    };

    document.querySelectorAll<HTMLElement>('a, button, [data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', () => scaleTo(1.9));
      el.addEventListener('pointerleave', () => scaleTo(1));
    });
  }

  /* ---------------- Magnets ---------------- */
  if (fine) {
    document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((el) => {
      const strength = 14;
      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        gsap.to(el, { x: dx * strength, y: dy * strength * 0.7, duration: 0.45, ease: 'power2.out' });
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'power2.out' }));
    });
  }

  /* ---------------- Clock ---------------- */
  const clock = document.querySelector<HTMLElement>('[data-clock]');
  if (clock) startClock(clock);

  initMenu();

  // Nav must not keep a stale cursor when the pointer leaves the window.
  window.addEventListener('blur', () => {
    if (dot) dot.style.opacity = '0';
    if (ring) ring.style.opacity = '0';
  });

  ScrollTrigger.refresh();
};

const startClock = (el: HTMLElement) => {
  const tick = () => {
    el.textContent = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Los_Angeles'
    }).format(new Date());
  };
  tick();
  setInterval(tick, 1000);
};

const initMenu = () => {
  const toggle = document.querySelector<HTMLElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('#menu');
  if (!toggle || !menu) return;

  const set = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
  };

  toggle.addEventListener('click', () => set(menu.hidden));
  menu.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => set(false));
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') set(false);
  });
};

initMotion();
