import React, { useEffect, useRef } from 'react';
import { Bubble, BubbleType, GameMode, GameSettings, GameStats, PopParticle, PopRipple, FloatingScore, TargetColor } from './types';
import { soundEngine } from './audio';
import { getBubbleStyles, TARGET_COLORS, TARGET_COLOR_CONFIGS, DANGER_BUBBLE_STYLE } from './themes';



interface BubbleCanvasProps {
  mode: GameMode;
  settings: GameSettings;
  stats: GameStats;
  onUpdateStats: React.Dispatch<React.SetStateAction<GameStats>>;
  isPaused: boolean;
  isGameOver: boolean;
  onFlowPaceChange?: (multiplier: number) => void;
}


const BUBBLE_STYLES: Record<BubbleType, { base: string; light: string; glow: string; ring: string }> = {
  mint: {
    base: '#A8E6CF',
    light: '#F4FCF8',
    glow: 'rgba(168, 230, 207, 0.45)',
    ring: 'rgba(121, 199, 170, 0.75)',
  },
  sky: {
    base: '#BAE1FF',
    light: '#F5FAFF',
    glow: 'rgba(186, 225, 255, 0.45)',
    ring: 'rgba(136, 194, 242, 0.75)',
  },
  peach: {
    base: '#FFDFBA',
    light: '#FFF9F2',
    glow: 'rgba(255, 223, 186, 0.45)',
    ring: 'rgba(245, 185, 130, 0.75)',
  },
  lavender: {
    base: '#DED2F9',
    light: '#FAF7FF',
    glow: 'rgba(222, 210, 249, 0.45)',
    ring: 'rgba(190, 170, 235, 0.75)',
  },
  lemon: {
    base: '#FFFFBA',
    light: '#FFFFF4',
    glow: 'rgba(255, 255, 186, 0.45)',
    ring: 'rgba(226, 226, 120, 0.75)',
  },
  rose: {
    base: '#FFB3BA',
    light: '#FFF3F5',
    glow: 'rgba(255, 179, 186, 0.45)',
    ring: 'rgba(240, 139, 150, 0.75)',
  },
  rainbow_bonus: {
    base: '#E0C3FC',
    light: '#8EC5FC',
    glow: 'rgba(255, 209, 255, 0.65)',
    ring: 'rgba(179, 136, 255, 0.85)',
  },
  time_bonus: {
    base: '#FFE57F',
    light: '#FFFDE7',
    glow: 'rgba(255, 213, 79, 0.65)',
    ring: 'rgba(255, 179, 0, 0.85)',
  },
  multiplier_star: {
    base: '#FF80AB',
    light: '#FFF0F5',
    glow: 'rgba(255, 64, 129, 0.65)',
    ring: 'rgba(245, 0, 87, 0.85)',
  },
  danger: {
    base: '#EF4444',
    light: '#FEE2E2',
    glow: 'rgba(239, 68, 68, 0.65)',
    ring: 'rgba(185, 28, 28, 0.9)',
  },
};

export const BubbleCanvas: React.FC<BubbleCanvasProps> = ({
  mode,
  settings,
  stats,
  onUpdateStats,
  isPaused,
  isGameOver,
  onFlowPaceChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<PopParticle[]>([]);
  const ripplesRef = useRef<PopRipple[]>([]);
  const floatingScoresRef = useRef<FloatingScore[]>([]);
  const comboTimerRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);
  const animationFrameIdRef = useRef<number>(0);
  const lastFlowPaceRef = useRef<number>(1.0);


  // Keep references to latest stats for callback during render loop
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;

  // Strict 8-14 floating bubbles requirement: Cozy=8, Normal=11, Dense=14
  const targetCount = settings.bubbleDensity === 'cozy' ? 8 : settings.bubbleDensity === 'dense' ? 14 : 11;
  const speedMultiplier = settings.bubbleSpeed === 'gentle' ? 0.7 : settings.bubbleSpeed === 'lively' ? 1.3 : 1.0;

  const createBubble = (width: number, height: number, initialScatter = false): Bubble => {
    const isComboRush = mode === 'combo_rush';
    const isReflex = mode === 'reflex';
    const roll = Math.random();
    let type: BubbleType = 'mint';
    let isDanger = false;

    if (isReflex) {
      // Escalating difficulty curve over 60s run:
      // - Phase 1 (60s-40s): 14% danger bubbles, 44% target color (gentle calibration)
      // - Phase 2 (40s-20s): 18% danger bubbles, 42% target color (accelerated focus)
      // - Phase 3 (20s-0s): 22% danger bubbles, 40% target color (climax reflex test)
      const remaining = statsRef.current.remainingTime ?? 60;
      const dangerThreshold = remaining > 40 ? 0.14 : remaining > 20 ? 0.18 : 0.22;
      const targetThreshold = dangerThreshold + (remaining > 40 ? 0.44 : remaining > 20 ? 0.42 : 0.40);

      const currentTarget: TargetColor = (statsRef.current.targetColor as TargetColor) || 'mint';
      if (roll < dangerThreshold) {
        type = 'danger';
        isDanger = true;
      } else if (roll < targetThreshold) {
        type = currentTarget;
      } else {
        const otherColors = TARGET_COLORS.filter((c) => c !== currentTarget);
        type = otherColors[Math.floor(Math.random() * otherColors.length)];
      }
    } else {
      // Occasional bonus bubbles in Flow & Combo Rush
      if (roll < 0.05 && isComboRush) {
        type = 'time_bonus'; // 5% chance in Combo Rush (+3 seconds)
      } else if (roll < 0.09) {
        type = 'rainbow_bonus'; // 4% chance (high score 50 pts + prismatic burst)
      } else if (roll < 0.13) {
        type = 'multiplier_star'; // 4% chance (doubles combo multiplier boost)
      } else if (roll < 0.28) {
        type = 'mint';
      } else if (roll < 0.43) {
        type = 'sky';
      } else if (roll < 0.58) {
        type = 'peach';
      } else if (roll < 0.73) {
        type = 'lavender';
      } else if (roll < 0.88) {
        type = 'lemon';
      } else {
        type = 'rose';
      }
    }

    const baseRadius =
      type === 'danger'
        ? Math.random() * 8 + 32
        : type === 'rainbow_bonus'
        ? Math.random() * 6 + 36
        : type === 'time_bonus' || type === 'multiplier_star'
        ? Math.random() * 6 + 32
        : Math.random() * 14 + 28;

    const points =
      type === 'danger'
        ? 0
        : type === 'rainbow_bonus'
        ? 50
        : type === 'time_bonus'
        ? 25
        : type === 'multiplier_star'
        ? 30
        : isReflex
        ? 20
        : 10;

    const currentThemeStyles = getBubbleStyles(settings.theme || 'spring');
    const style =
      type === 'danger'
        ? DANGER_BUBBLE_STYLE
        : currentThemeStyles[type] || currentThemeStyles.mint;

    // Ensure bubble stays strictly within the playfield horizontally
    const minX = baseRadius + 6;
    const maxX = Math.max(minX + 10, width - baseRadius - 6);
    const x = Math.random() * (maxX - minX) + minX;
    const y = initialScatter
      ? Math.random() * (height - 140) + 70
      : height + baseRadius + Math.random() * 50;

    // Gentle upward floating velocity
    const vy = -(Math.random() * 20 + 36) * speedMultiplier;
    const vx = (Math.random() - 0.5) * 14 * speedMultiplier;

    return {
      id: nextIdRef.current++,
      type,
      x,
      y,
      radius: baseRadius,
      baseRadius,
      vx,
      vy,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 1.4 + 0.9,
      scaleX: 1,
      scaleY: 1,
      wallSquish: 0,
      style: {
        baseColor: style.baseColor || style.base || '#A8E6CF',
        lightColor: style.lightColor || style.light || '#F4FCF8',
        glowColor: style.glowColor || style.glow || 'rgba(168, 230, 207, 0.45)',
        ringColor: style.ringColor || style.ring || 'rgba(121, 199, 170, 0.75)',
        base: style.base || style.baseColor,
        light: style.light || style.lightColor,
        glow: style.glow || style.glowColor,
        ring: style.ring || style.ringColor,
      },
      points,
      isPopped: false,
      popProgress: 0,
      scored: false,
      isDanger,
    };
  };

  const spawnPopVisuals = (bubble: Bubble, earnedPoints: number, comboMultiplier: number) => {
    const isDanger = bubble.type === 'danger' || bubble.isDanger;
    const isRainbow = bubble.type === 'rainbow_bonus';
    const isTime = bubble.type === 'time_bonus';
    const isStar = bubble.type === 'multiplier_star';
    const isBonus = isRainbow || isTime || isStar;

    // 1. Dual-layer shockwave ripple with thinning stroke
    ripplesRef.current.push({
      id: nextIdRef.current++,
      x: bubble.x,
      y: bubble.y,
      maxRadius: isDanger ? bubble.baseRadius * 2.3 : bubble.baseRadius * 1.9,
      currentRadius: bubble.radius * 0.35,
      color: isDanger ? '#EF4444' : bubble.style.baseColor,
      alpha: isDanger ? 1.0 : 0.9,
      lineWidth: isDanger ? 4.5 : 3.5,
    });

    if (isBonus || isDanger) {
      // Secondary concentric ripple for extra punch
      ripplesRef.current.push({
        id: nextIdRef.current++,
        x: bubble.x,
        y: bubble.y,
        maxRadius: bubble.baseRadius * 1.45,
        currentRadius: bubble.radius * 0.2,
        color: '#FFFFFF',
        alpha: 0.85,
        lineWidth: 2.2,
      });
    }

    // 2. Floating score / streak badge for tactile satisfaction
    if (!isDanger) {
      let scoreText = `+${earnedPoints}`;
      let subtext: string | undefined = undefined;

      if (isRainbow) {
        subtext = '🌈 Rainbow!';
      } else if (isTime) {
        subtext = '+3s Time';
      } else if (isStar) {
        subtext = '★ Star Boost';
      } else if (comboMultiplier > 1) {
        subtext = `${comboMultiplier}x Multiplier`;
      }

      floatingScoresRef.current.push({
        id: nextIdRef.current++,
        x: bubble.x,
        y: bubble.y - 12,
        text: scoreText,
        subtext,
        color:
          isRainbow
            ? '#7C3AED'
            : isTime
            ? '#D97706'
            : isStar
            ? '#BE185D'
            : '#1E293B',
        alpha: 1,
        scale: 0.85,
        vy: -48,
        isBonus,
      });
    } else {
      floatingScoresRef.current.push({
        id: nextIdRef.current++,
        x: bubble.x,
        y: bubble.y - 12,
        text: 'HAZARD!',
        subtext: 'Detonated',
        color: '#DC2626',
        alpha: 1,
        scale: 1.05,
        vy: -42,
        isBonus: false,
      });
    }

    if (settings.reducedMotion) return;

    // 3. Multi-color particle burst with sparkles & droplets
    const count = isDanger ? 18 : isRainbow ? 16 : isBonus ? 13 : 10;
    const rainbowColors = ['#FF80AB', '#FFE57F', '#A8E6CF', '#BAE1FF', '#DED2F9', '#FFDFBA'];
    const dangerColors = ['#EF4444', '#DC2626', '#B91C1C', '#F87171', '#FDE047', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.35 - 0.175);
      const speed = isDanger ? Math.random() * 110 + 60 : Math.random() * 85 + 40;
      const particleColor = isDanger
        ? dangerColors[i % dangerColors.length]
        : isRainbow
        ? rainbowColors[i % rainbowColors.length]
        : i % 3 === 0
        ? '#FFFFFF'
        : bubble.style.baseColor;

      particlesRef.current.push({
        id: nextIdRef.current++,
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColor,
        size: isDanger ? Math.random() * 3.8 + 2.5 : Math.random() * 3.2 + 2.2,
        alpha: 1,
        life: 1,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 8,
        isSparkle: i % 2 === 0, // Alternate between circular droplets and 4-point diamond sparkles
      });
    }
  };

  // Main 60fps canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const width = canvas.width;
      const height = canvas.height;
      const ctx = canvas.getContext('2d');
      const nowMs = time;

      if (ctx && width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);

        const paused = isPausedRef.current || isGameOverRef.current;

        if (!paused) {
          // Update combo timer
          if (comboTimerRef.current > 0) {
            comboTimerRef.current -= dt;
            if (comboTimerRef.current <= 0) {
              onUpdateStats((prev) => (prev.combo > 0 ? { ...prev, combo: 0 } : prev));
            }
          }

          // Maintain 8-14 floating bubbles
          while (bubblesRef.current.length < targetCount) {
            bubblesRef.current.push(createBubble(width, height, bubblesRef.current.length === 0));
          }

          // Update bubbles
          const nowMs = performance.now();
          for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
            const b = bubblesRef.current[i];

            // If popped, handle expanding pop burst and removal
            if (b.isPopped) {
              b.popProgress += dt * 6.5;
              if (b.popProgress >= 1) {
                bubblesRef.current.splice(i, 1);
              }
              continue;
            }

            // Dynamic difficulty:
            // - Flow Mode: gently ramp float speed with score (up to 1.45x)
            // - Reflex Mode: gently ramp float speed over 60s run (from 1.0x to 1.35x)
            const reflexPaceFactor =
              mode === 'reflex'
                ? 1.0 + Math.min(0.35, Math.max(0, (60 - (statsRef.current.remainingTime ?? 60)) / 60) * 0.35)
                : 1.0;
            const activeSpeedFactor =
              mode === 'flow'
                ? Math.min(1.45, 1.0 + Math.floor(statsRef.current.score / 200) * 0.05)
                : reflexPaceFactor;

            if (mode === 'flow' && Math.abs(activeSpeedFactor - lastFlowPaceRef.current) > 0.01) {
              lastFlowPaceRef.current = activeSpeedFactor;
              onFlowPaceChange?.(activeSpeedFactor);
            }

            // Gentle buoyant movement with dynamic pace factor
            b.y += b.vy * dt * activeSpeedFactor;
            b.x += b.vx * dt;


            // Smooth squash-and-stretch animation
            if (!settings.reducedMotion) {
              const wobble = Math.sin(nowMs * 0.002 * b.wobbleSpeed + b.wobblePhase);
              b.x += wobble * 0.28;

              // Elastic decay on wall bounce squish
              b.wallSquish += (0 - b.wallSquish) * dt * 8;

              // Out-of-phase scale oscillation for organic breathing feel
              b.scaleX = 1.0 - wobble * 0.045 + b.wallSquish;
              b.scaleY = 1.0 + wobble * 0.045 - b.wallSquish * 0.55;
            } else {
              b.scaleX = 1;
              b.scaleY = 1;
            }

            // Strict playfield containment & wall bounce squash
            if (b.x - b.radius < 4) {
              b.x = b.radius + 4;
              b.vx = Math.abs(b.vx);
              if (!settings.reducedMotion) b.wallSquish = -0.12; // horizontal squish against left wall
            } else if (b.x + b.radius > width - 4) {
              b.x = width - b.radius - 4;
              b.vx = -Math.abs(b.vx);
              if (!settings.reducedMotion) b.wallSquish = -0.12; // horizontal squish against right wall
            }

            // Re-check containment strictly
            b.x = Math.max(b.radius + 2, Math.min(width - b.radius - 2, b.x));

            // When bubble drifts above top screen, smoothly cycle back to bottom
            if (b.y + b.radius < -15) {
              b.y = height + b.radius + Math.random() * 40;
              const minX = b.radius + 6;
              const maxX = Math.max(minX + 10, width - b.radius - 6);
              b.x = Math.random() * (maxX - minX) + minX;
              b.scored = false;
            }
          }

          // Update shockwave ripples
          for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
            const r = ripplesRef.current[i];
            r.currentRadius += (r.maxRadius - r.currentRadius) * dt * 7.5 + 24 * dt;
            r.alpha -= dt * 1.8;
            r.lineWidth = Math.max(0.6, r.lineWidth - dt * 2.5);
            if (r.alpha <= 0 || r.currentRadius >= r.maxRadius) {
              ripplesRef.current.splice(i, 1);
            }
          }

          // Update particles
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.96; // air drag
            p.vy *= 0.96;
            p.vy += 65 * dt; // soft gravity
            p.alpha -= dt * 1.5;
            p.rotation += p.rotSpeed * dt;
            if (p.alpha <= 0) {
              particlesRef.current.splice(i, 1);
            }
          }

          // Update floating scores
          for (let i = floatingScoresRef.current.length - 1; i >= 0; i--) {
            const fs = floatingScoresRef.current[i];
            fs.y += fs.vy * dt;
            fs.alpha -= dt * 1.1;
            if (!settings.reducedMotion) {
              fs.scale = Math.min(1.05, fs.scale + dt * 0.6);
            }
            if (fs.alpha <= 0) {
              floatingScoresRef.current.splice(i, 1);
            }
          }
        }

        // --- RENDER PASS ---

        // 1. Draw expanding shockwave rings
        ripplesRef.current.forEach((r) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, Math.max(1, r.currentRadius), 0, Math.PI * 2);
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = Math.max(0, r.alpha);
          ctx.lineWidth = r.lineWidth;
          ctx.stroke();
          ctx.restore();
        });

        // 2. Draw glossy bubbles with squash-and-stretch
        bubblesRef.current.forEach((b) => {
          ctx.save();

          // Apply squash-and-stretch transform
          ctx.translate(b.x, b.y);
          ctx.scale(b.scaleX, b.scaleY);

          // If in pop animation state, render expanding dissolving bubble ring
          if (b.isPopped) {
            const popScale = 1 + b.popProgress * 0.4;
            const popAlpha = Math.max(0, 1 - b.popProgress);
            ctx.beginPath();
            ctx.arc(0, 0, b.radius * popScale, 0, Math.PI * 2);
            ctx.strokeStyle = b.style.ringColor;
            ctx.globalAlpha = popAlpha * 0.85;
            ctx.lineWidth = 2.2;
            ctx.stroke();
            ctx.restore();
            return;
          }

          const isDangerBubble = b.type === 'danger' || b.isDanger;

          // A. Soft outer ambient glow (danger bubbles get an animated volatile pulse aura)
          if (isDangerBubble) {
            const dangerPulse = Math.sin(nowMs * 0.007 + b.id) * 0.2 + 0.8;
            const dangerGlowGrad = ctx.createRadialGradient(0, 0, b.radius * 0.75, 0, 0, b.radius * 1.4);
            dangerGlowGrad.addColorStop(0, `rgba(239, 68, 68, ${0.65 * dangerPulse})`);
            dangerGlowGrad.addColorStop(0.65, `rgba(185, 28, 28, ${0.35 * dangerPulse})`);
            dangerGlowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = dangerGlowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, b.radius * 1.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const glowGrad = ctx.createRadialGradient(0, 0, b.radius * 0.7, 0, 0, b.radius * 1.25);
            glowGrad.addColorStop(0, b.style.glowColor);
            glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, b.radius * 1.25, 0, Math.PI * 2);
            ctx.fill();
          }

          // B. Main bubble body radial gradient
          const gradX = -b.radius * 0.35;
          const gradY = -b.radius * 0.35;
          const bodyGrad = ctx.createRadialGradient(gradX, gradY, b.radius * 0.1, 0, 0, b.radius);
          if (isDangerBubble) {
            bodyGrad.addColorStop(0, '#FFE4E6');
            bodyGrad.addColorStop(0.28, '#F43F5E');
            bodyGrad.addColorStop(0.72, '#DC2626');
            bodyGrad.addColorStop(1, '#881337');
          } else {
            bodyGrad.addColorStop(0, b.style.lightColor);
            bodyGrad.addColorStop(0.55, b.style.baseColor);
            bodyGrad.addColorStop(1, b.style.ringColor);
          }

          ctx.fillStyle = bodyGrad;
          ctx.beginPath();
          ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
          ctx.fill();

          // C. Caustic bottom-right bounce reflection
          const causticGrad = ctx.createRadialGradient(
            b.radius * 0.35,
            b.radius * 0.35,
            0,
            b.radius * 0.35,
            b.radius * 0.35,
            b.radius * 0.5
          );
          causticGrad.addColorStop(0, isDangerBubble ? 'rgba(254, 202, 202, 0.45)' : 'rgba(255, 255, 255, 0.45)');
          causticGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = causticGrad;
          ctx.beginPath();
          ctx.arc(b.radius * 0.32, b.radius * 0.32, b.radius * 0.38, 0, Math.PI * 2);
          ctx.fill();

          // D. Delicate outer perimeter sheen ring
          ctx.lineWidth = isDangerBubble ? 2.2 : 1.6;
          ctx.strokeStyle = isDangerBubble ? 'rgba(254, 226, 226, 0.95)' : 'rgba(255, 255, 255, 0.8)';
          ctx.stroke();

          // E. Specular 3D highlight crescent in upper left
          const hlX = -b.radius * 0.32;
          const hlY = -b.radius * 0.32;
          const hlRadius = b.radius * 0.22;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.beginPath();
          ctx.arc(hlX, hlY, hlRadius, 0, Math.PI * 2);
          ctx.fill();

          // F. Secondary specular glint dot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(hlX + b.radius * 0.24, hlY + b.radius * 0.08, b.radius * 0.07, 0, Math.PI * 2);
          ctx.fill();

          // Special traits decorations
          if (b.type === 'time_bonus') {
            ctx.fillStyle = '#B45309';
            ctx.font = `bold ${Math.round(b.radius * 0.52)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+3s', 0, 1);
          } else if (b.type === 'multiplier_star') {
            ctx.fillStyle = '#BE185D';
            ctx.font = `bold ${Math.round(b.radius * 0.65)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', 0, 1);
          } else if (b.type === 'rainbow_bonus') {
            ctx.lineWidth = 2.2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(0, 0, b.radius * 0.42, 0, Math.PI * 2);
            ctx.stroke();
          } else if (isDangerBubble) {
            // Distinct danger bubble visual with shadow and high-contrast warning shield
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `900 ${Math.round(b.radius * 0.72)}px system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚠', 0, 1);
            ctx.restore();
          }

          ctx.restore();
        });

        // 3. Draw particles (sparkles and soft droplets)
        particlesRef.current.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;

          if (p.isSparkle) {
            // Draw 4-point diamond sparkle
            ctx.rotate(p.rotation);
            ctx.beginPath();
            const s = p.size * 1.3;
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.35, 0);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.35, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            // Draw smooth droplet circle
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });

        // 4. Draw floating score badges with pill card backing
        floatingScoresRef.current.forEach((fs) => {
          ctx.save();
          ctx.translate(fs.x, fs.y);
          ctx.scale(fs.scale, fs.scale);
          ctx.globalAlpha = Math.max(0, fs.alpha);

          const mainText = fs.text;
          const subtext = fs.subtext;
          ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
          const textMetrics = ctx.measureText(mainText);
          const badgeWidth = Math.max(textMetrics.width + 24, subtext ? 76 : 52);
          const badgeHeight = subtext ? 32 : 24;

          // Capsule pill background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;
          ctx.beginPath();
          ctx.roundRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, 14);
          ctx.fill();

          // Border stroke
          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = fs.isBonus ? 'rgba(234, 179, 8, 0.4)' : 'rgba(226, 232, 240, 0.8)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Main text
          ctx.textAlign = 'center';
          ctx.textBaseline = subtext ? 'top' : 'middle';
          ctx.fillStyle = fs.color;
          ctx.fillText(mainText, 0, subtext ? -badgeHeight / 2 + 3 : 0);

          // Subtext
          if (subtext) {
            ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.textBaseline = 'bottom';
            ctx.fillText(subtext, 0, badgeHeight / 2 - 3);
          }

          ctx.restore();
        });
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [mode, settings, targetCount, speedMultiplier]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamically update existing bubbles when theme changes
  useEffect(() => {
    const themeStyles = getBubbleStyles(settings.theme || 'spring');
    bubblesRef.current.forEach((b) => {
      b.style = themeStyles[b.type] || themeStyles.mint;
    });
  }, [settings.theme]);


  // Reliable tap detection: ensures each bubble can score ONLY once
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    // Hit test reverse order so topmost bubble gets popped
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];

      // Strict guarantee: each bubble can score only once
      if (!b.isPopped && !b.scored) {
        const dx = touchX - b.x;
        const dy = touchY - b.y;
        const distSq = dx * dx + dy * dy;
        const hitTolerance = b.radius + 16; // comfortable touch target for mobile fingertips

        if (distSq <= hitTolerance * hitTolerance) {
          // Immediately lock bubble to prevent any secondary scoring
          b.isPopped = true;
          b.scored = true;

          const vol = settings.soundVolume ?? 0.8;

          // REFLEX PROTOCOL LOGIC:
          // - Tapping danger bubble => Immediate failure!
          // - Tapping target color bubble => Score points & combo!
          // - Tapping wrong color bubble => Immediate failure!
          if (mode === 'reflex') {
            if (b.type === 'danger' || b.isDanger) {
              soundEngine.playFail(settings.soundEnabled, settings.hapticEnabled, vol);
              spawnPopVisuals(b, 0, 1);
              const survived = Math.max(0, 60 - statsRef.current.remainingTime);
              onUpdateStats((prev) => ({
                ...prev,
                isGameOver: true,
                isFailed: true,
                elapsedTime: survived,
                gameOverReason: 'danger_bubble',
                failureMessage: 'Critical Failure: Danger bubble detonated!',
              }));
              break;
            }

            const currentTarget = (statsRef.current.targetColor as TargetColor) || 'mint';
            if (b.type === currentTarget) {
              const currentCombo = statsRef.current.combo + 1;
              comboTimerRef.current = 1.8;

              if (currentCombo === 5 || currentCombo === 10 || currentCombo === 15 || currentCombo === 20) {
                soundEngine.playComboMilestone(currentCombo, settings.soundEnabled, settings.hapticEnabled, vol);
              } else {
                soundEngine.playPop(currentCombo, settings.soundEnabled, settings.hapticEnabled, vol);
              }

              const multiplier = currentCombo >= 15 ? 4 : currentCombo >= 10 ? 3 : currentCombo >= 5 ? 2 : 1;
              const earned = 20 * multiplier;

              spawnPopVisuals(b, earned, multiplier);

              onUpdateStats((prev) => ({
                ...prev,
                score: prev.score + earned,
                combo: currentCombo,
                maxCombo: Math.max(prev.maxCombo, currentCombo),
                totalPops: prev.totalPops + 1,
              }));
              break;
            } else {
              // Tapped wrong color bubble
              soundEngine.playFail(settings.soundEnabled, settings.hapticEnabled, vol);
              spawnPopVisuals(b, 0, 1);

              const targetConfig = TARGET_COLOR_CONFIGS[currentTarget];
              const tappedConfig = TARGET_COLOR_CONFIGS[b.type as TargetColor];
              const targetName = targetConfig?.name || currentTarget;
              const tappedName = tappedConfig?.name || b.type;
              const survived = Math.max(0, 60 - statsRef.current.remainingTime);

              onUpdateStats((prev) => ({
                ...prev,
                isGameOver: true,
                isFailed: true,
                elapsedTime: survived,
                gameOverReason: 'wrong_color',
                failureMessage: `Protocol Violated: Tapped ${tappedName} instead of ${targetName}!`,
              }));
              break;
            }
          }

          // FLOW & COMBO RUSH MODES:
          const currentCombo = statsRef.current.combo + 1;
          comboTimerRef.current = 1.8; // 1.8s window to maintain combo streak

          const isBonus = b.type === 'rainbow_bonus' || b.type === 'time_bonus' || b.type === 'multiplier_star';

          if (isBonus) {
            soundEngine.playBonus(settings.soundEnabled, settings.hapticEnabled, vol);
          } else if (currentCombo === 5 || currentCombo === 10 || currentCombo === 15 || currentCombo === 20) {
            soundEngine.playComboMilestone(currentCombo, settings.soundEnabled, settings.hapticEnabled, vol);
          } else {
            soundEngine.playPop(currentCombo, settings.soundEnabled, settings.hapticEnabled, vol);
          }

          let bonusSeconds = 0;
          let comboMultiplierBoost = 1;
          if (b.type === 'time_bonus' && mode === 'combo_rush') {
            bonusSeconds = 3;
          } else if (b.type === 'multiplier_star') {
            comboMultiplierBoost = 2;
          }

          const multiplier =
            (currentCombo >= 15 ? 4 : currentCombo >= 10 ? 3 : currentCombo >= 5 ? 2 : 1) * comboMultiplierBoost;
          const earned = b.points * multiplier;

          // Spawn visuals with floating score pill badge
          spawnPopVisuals(b, earned, multiplier);

          onUpdateStats((prev) => {
            const newScore = prev.score + earned;
            const newMaxCombo = Math.max(prev.maxCombo, currentCombo);
            const newTime = mode === 'combo_rush' ? Math.min(prev.remainingTime + bonusSeconds, 60) : prev.remainingTime;

            return {
              ...prev,
              score: newScore,
              combo: currentCombo,
              maxCombo: newMaxCombo,
              totalPops: prev.totalPops + 1,
              bonusPops: isBonus ? prev.bonusPops + 1 : prev.bonusPops,
              remainingTime: newTime,
            };
          });

          break; // exactly one bubble scored per tap
        }
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 w-full h-full cursor-pointer touch-none select-none"
      style={{ touchAction: 'none' }}
    />
  );
};
