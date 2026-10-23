import React, { useEffect, useRef } from 'react';
import { Bubble, BubbleType, GameMode, GameSettings, GameStats, PopParticle, PopRipple, FloatingScore } from './types';
import { soundEngine } from './audio';

interface BubbleCanvasProps {
  mode: GameMode;
  settings: GameSettings;
  stats: GameStats;
  onUpdateStats: React.Dispatch<React.SetStateAction<GameStats>>;
  isPaused: boolean;
  isGameOver: boolean;
  onBonusTimeAdded?: () => void;
}

const BUBBLE_STYLES: Record<BubbleType, { base: string; light: string; glow: string; ring: string }> = {
  mint: {
    base: '#A8E6CF',
    light: '#F0FBF6',
    glow: 'rgba(168, 230, 207, 0.45)',
    ring: 'rgba(121, 199, 170, 0.7)',
  },
  sky: {
    base: '#BAE1FF',
    light: '#F4FAFF',
    glow: 'rgba(186, 225, 255, 0.45)',
    ring: 'rgba(136, 194, 242, 0.7)',
  },
  peach: {
    base: '#FFDFBA',
    light: '#FFF8F2',
    glow: 'rgba(255, 223, 186, 0.45)',
    ring: 'rgba(245, 185, 130, 0.7)',
  },
  lavender: {
    base: '#DED2F9',
    light: '#FAF7FF',
    glow: 'rgba(222, 210, 249, 0.45)',
    ring: 'rgba(190, 170, 235, 0.7)',
  },
  lemon: {
    base: '#FFFFBA',
    light: '#FFFFF2',
    glow: 'rgba(255, 255, 186, 0.45)',
    ring: 'rgba(226, 226, 120, 0.7)',
  },
  rose: {
    base: '#FFB3BA',
    light: '#FFF2F4',
    glow: 'rgba(255, 179, 186, 0.45)',
    ring: 'rgba(240, 139, 150, 0.7)',
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
};

export const BubbleCanvas: React.FC<BubbleCanvasProps> = ({
  mode,
  settings,
  stats,
  onUpdateStats,
  isPaused,
  isGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubblesRef = useRef<(Bubble & { scored?: boolean })[]>([]);
  const particlesRef = useRef<PopParticle[]>([]);
  const ripplesRef = useRef<PopRipple[]>([]);
  const floatingScoresRef = useRef<FloatingScore[]>([]);
  const comboTimerRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);
  const animationFrameIdRef = useRef<number>(0);

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

  const createBubble = (width: number, height: number, initialScatter = false): Bubble & { scored?: boolean } => {
    const isComboRush = mode === 'combo_rush';
    const roll = Math.random();
    let type: BubbleType = 'mint';

    // Occasional bonus bubbles
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

    const baseRadius =
      type === 'rainbow_bonus'
        ? Math.random() * 6 + 36
        : type === 'time_bonus' || type === 'multiplier_star'
        ? Math.random() * 6 + 32
        : Math.random() * 14 + 28;

    const points = type === 'rainbow_bonus' ? 50 : type === 'time_bonus' ? 25 : type === 'multiplier_star' ? 30 : 10;
    const style = BUBBLE_STYLES[type];

    // Ensure bubble stays strictly within the playfield horizontally
    const minX = baseRadius + 4;
    const maxX = Math.max(minX + 10, width - baseRadius - 4);
    const x = Math.random() * (maxX - minX) + minX;
    const y = initialScatter
      ? Math.random() * (height - 140) + 70
      : height + baseRadius + Math.random() * 60;

    // Gentle upward floating velocity
    const vy = -(Math.random() * 22 + 38) * speedMultiplier;
    const vx = (Math.random() - 0.5) * 16 * speedMultiplier;

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
      wobbleSpeed: Math.random() * 1.5 + 1.0,
      style: {
        baseColor: style.base,
        lightColor: style.light,
        glowColor: style.glow,
        ringColor: style.ring,
      },
      points,
      isPopped: false,
      popProgress: 0,
      scored: false,
    };
  };

  const spawnPopVisuals = (bubble: Bubble, earnedPoints: number, comboMultiplier: number) => {
    // 1. Expanding shockwave ripple
    ripplesRef.current.push({
      id: nextIdRef.current++,
      x: bubble.x,
      y: bubble.y,
      maxRadius: bubble.baseRadius * 1.85,
      currentRadius: bubble.radius * 0.35,
      color: bubble.style.baseColor,
      alpha: 0.85,
    });

    // 2. Floating score badge for instant satisfaction
    let scoreLabel = `+${earnedPoints}`;
    if (bubble.type === 'rainbow_bonus') {
      scoreLabel = `+${earnedPoints} 🌈`;
    } else if (bubble.type === 'time_bonus') {
      scoreLabel = `+${earnedPoints} (+3s)`;
    } else if (bubble.type === 'multiplier_star') {
      scoreLabel = `+${earnedPoints} ★`;
    } else if (comboMultiplier > 1) {
      scoreLabel = `+${earnedPoints} (${comboMultiplier}x)`;
    }

    floatingScoresRef.current.push({
      id: nextIdRef.current++,
      x: bubble.x,
      y: bubble.y - 10,
      text: scoreLabel,
      color: bubble.type === 'rainbow_bonus' ? '#8B5CF6' : bubble.type === 'time_bonus' ? '#D97706' : '#1E293B',
      alpha: 1,
      scale: 1,
      vy: -45,
    });

    if (settings.reducedMotion) return;

    // 3. Multi-color particle burst
    const count = bubble.type === 'rainbow_bonus' ? 14 : 10;
    const rainbowColors = ['#FF80AB', '#FFE57F', '#A8E6CF', '#BAE1FF', '#DED2F9', '#FFDFBA'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.35 - 0.175);
      const speed = Math.random() * 90 + 45;
      const particleColor = bubble.type === 'rainbow_bonus' ? rainbowColors[i % rainbowColors.length] : bubble.style.baseColor;

      particlesRef.current.push({
        id: nextIdRef.current++,
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColor,
        size: Math.random() * 3.5 + 2.5,
        alpha: 1,
        life: 1,
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
              b.popProgress += dt * 6.0;
              if (b.popProgress >= 1) {
                bubblesRef.current.splice(i, 1);
              }
              continue;
            }

            // Gentle buoyant movement
            b.y += b.vy * dt;
            b.x += b.vx * dt;

            // Gentle wobble unless reduced motion
            if (!settings.reducedMotion) {
              const wobble = Math.sin(nowMs * 0.002 * b.wobbleSpeed + b.wobblePhase);
              b.x += wobble * 0.28;
              b.radius = b.baseRadius + wobble * 0.8;
            }

            // Strict playfield containment: Left & Right boundaries
            if (b.x - b.radius < 4) {
              b.x = b.radius + 4;
              b.vx = Math.abs(b.vx);
            } else if (b.x + b.radius > width - 4) {
              b.x = width - b.radius - 4;
              b.vx = -Math.abs(b.vx);
            }

            // Re-check containment strictly
            b.x = Math.max(b.radius + 2, Math.min(width - b.radius - 2, b.x));

            // When bubble drifts above top screen, smoothly cycle back to bottom
            if (b.y + b.radius < -15) {
              b.y = height + b.radius + Math.random() * 40;
              const minX = b.radius + 4;
              const maxX = Math.max(minX + 10, width - b.radius - 4);
              b.x = Math.random() * (maxX - minX) + minX;
              b.scored = false;
            }
          }

          // Update ripples
          for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
            const r = ripplesRef.current[i];
            r.currentRadius += (r.maxRadius - r.currentRadius) * dt * 8.5 + 24 * dt;
            r.alpha -= dt * 2.0;
            if (r.alpha <= 0 || r.currentRadius >= r.maxRadius) {
              ripplesRef.current.splice(i, 1);
            }
          }

          // Update particles
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.98; // gentle air drag
            p.vy += 80 * dt; // soft gravity
            p.alpha -= dt * 1.7;
            if (p.alpha <= 0) {
              particlesRef.current.splice(i, 1);
            }
          }

          // Update floating scores
          for (let i = floatingScoresRef.current.length - 1; i >= 0; i--) {
            const fs = floatingScoresRef.current[i];
            fs.y += fs.vy * dt;
            fs.alpha -= dt * 1.3;
            fs.scale += dt * 0.4;
            if (fs.alpha <= 0) {
              floatingScoresRef.current.splice(i, 1);
            }
          }
        }

        // --- RENDER PASS ---

        // 1. Draw shockwave ripples
        ripplesRef.current.forEach((r) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(r.x, r.y, Math.max(1, r.currentRadius), 0, Math.PI * 2);
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = Math.max(0, r.alpha);
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        });

        // 2. Draw glossy bubbles
        bubblesRef.current.forEach((b) => {
          ctx.save();

          // If in pop animation state, render expanding dissolving bubble ring
          if (b.isPopped) {
            const popScale = 1 + b.popProgress * 0.35;
            const popAlpha = Math.max(0, 1 - b.popProgress);
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius * popScale, 0, Math.PI * 2);
            ctx.strokeStyle = b.style.ringColor;
            ctx.globalAlpha = popAlpha * 0.8;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            return;
          }

          // Soft outer ambient glow
          const glowGrad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.7, b.x, b.y, b.radius * 1.25);
          glowGrad.addColorStop(0, b.style.glowColor);
          glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 1.25, 0, Math.PI * 2);
          ctx.fill();

          // Main bubble body radial gradient
          const gradX = b.x - b.radius * 0.35;
          const gradY = b.y - b.radius * 0.35;
          const bodyGrad = ctx.createRadialGradient(gradX, gradY, b.radius * 0.1, b.x, b.y, b.radius);
          bodyGrad.addColorStop(0, b.style.lightColor);
          bodyGrad.addColorStop(0.55, b.style.baseColor);
          bodyGrad.addColorStop(1, b.style.ringColor);

          ctx.fillStyle = bodyGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();

          // Delicate outer rim
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.stroke();

          // Specular 3D highlight crescent in upper left
          const hlX = b.x - b.radius * 0.32;
          const hlY = b.y - b.radius * 0.32;
          const hlRadius = b.radius * 0.22;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(hlX, hlY, hlRadius, 0, Math.PI * 2);
          ctx.fill();

          // Secondary subtle soft glow in bottom right
          const brX = b.x + b.radius * 0.3;
          const brY = b.y + b.radius * 0.3;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(brX, brY, b.radius * 0.14, 0, Math.PI * 2);
          ctx.fill();

          // Special traits decorations
          if (b.type === 'time_bonus') {
            ctx.fillStyle = '#B45309';
            ctx.font = `bold ${Math.round(b.radius * 0.52)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+3s', b.x, b.y + 1);
          } else if (b.type === 'multiplier_star') {
            ctx.fillStyle = '#BE185D';
            ctx.font = `bold ${Math.round(b.radius * 0.65)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', b.x, b.y + 1);
          } else if (b.type === 'rainbow_bonus') {
            ctx.lineWidth = 2.2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius * 0.42, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.restore();
        });

        // 3. Draw particles
        particlesRef.current.forEach((p) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fill();
          ctx.restore();
        });

        // 4. Draw floating score badges
        floatingScoresRef.current.forEach((fs) => {
          ctx.save();
          ctx.font = `bold ${Math.round(15 * Math.min(fs.scale, 1.3))}px "Plus Jakarta Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = Math.max(0, fs.alpha);

          // White text shadow/outline for high readability
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 3;
          ctx.strokeText(fs.text, fs.x, fs.y);

          ctx.fillStyle = fs.color;
          ctx.fillText(fs.text, fs.x, fs.y);
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

          const currentCombo = statsRef.current.combo + 1;
          comboTimerRef.current = 1.8; // 1.8s window to maintain combo streak

          const isBonus = b.type === 'rainbow_bonus' || b.type === 'time_bonus' || b.type === 'multiplier_star';
          if (isBonus) {
            soundEngine.playBonus(settings.soundEnabled, settings.hapticEnabled);
          } else {
            soundEngine.playPop(currentCombo, settings.soundEnabled, settings.hapticEnabled);
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

          // Spawn visuals with floating score label
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
