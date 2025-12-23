import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse, useOscillate } from '../utils/animations';
import { SparkleOverlay, GlowPulse, Flicker, FloatMotion } from '../utils/decorationAnimations';

interface HalloweenDecorationProps {
  width: number;
  height: number;
}

interface Bat {
  id: number;
  x: number;
  startX: number; // Pre-seeded X position for immediate visibility
  y: number;
  size: number;
  speed: number;
  delay: number;
  flapSpeed: number;
}

interface Ghost {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
  wobblePhase: number;
}

interface Spider {
  id: number;
  x: number;
  startY: number;
  size: number;
  dropDelay: number;
  swingPhase: number;
}

// Bat SVG with wing animation
function BatSVG({ size, wingAngle }: { size: number; wingAngle: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60">
      {/* Body */}
      <ellipse cx="50" cy="35" rx="12" ry="18" fill="#1a1a2e" />
      {/* Head */}
      <circle cx="50" cy="15" r="10" fill="#1a1a2e" />
      {/* Ears */}
      <polygon points="42,8 45,0 48,10" fill="#1a1a2e" />
      <polygon points="58,8 55,0 52,10" fill="#1a1a2e" />
      {/* Eyes */}
      <circle cx="46" cy="14" r="2" fill="#ff4444" />
      <circle cx="54" cy="14" r="2" fill="#ff4444" />
      {/* Left wing */}
      <path
        d={`M38,30 Q20,${25 + wingAngle} 5,${20 + wingAngle} Q15,35 25,40 Q30,35 38,35 Z`}
        fill="#2d2d44"
      />
      {/* Right wing */}
      <path
        d={`M62,30 Q80,${25 + wingAngle} 95,${20 + wingAngle} Q85,35 75,40 Q70,35 62,35 Z`}
        fill="#2d2d44"
      />
    </svg>
  );
}

// Ghost SVG
function GhostSVG({ size, wobble }: { size: number; wobble: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 60 72" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}>
      {/* Body */}
      <path
        d={`M10,40 Q10,10 30,10 Q50,10 50,40 L50,60
            Q45,${55 + wobble} 40,60 Q35,${65 + wobble} 30,60
            Q25,${55 + wobble} 20,60 Q15,${65 + wobble} 10,60 Z`}
        fill="rgba(255,255,255,0.9)"
      />
      {/* Eyes */}
      <ellipse cx="22" cy="32" rx="5" ry="7" fill="#1a1a2e" />
      <ellipse cx="38" cy="32" rx="5" ry="7" fill="#1a1a2e" />
      {/* Mouth */}
      <ellipse cx="30" cy="45" rx="6" ry="4" fill="#1a1a2e" />
    </svg>
  );
}

// Pumpkin SVG
function PumpkinSVG({ size, glowIntensity }: { size: number; glowIntensity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Stem */}
      <path d="M38,10 Q35,5 40,2 Q45,5 42,10 L42,18 L38,18 Z" fill="#228B22" />
      {/* Main pumpkin */}
      <ellipse cx="40" cy="50" rx="35" ry="28" fill="#FF6600" />
      {/* Segments */}
      <path d="M20,50 Q20,30 40,25 Q20,30 20,50" fill="#CC5500" opacity="0.5" />
      <path d="M60,50 Q60,30 40,25 Q60,30 60,50" fill="#CC5500" opacity="0.5" />
      {/* Face glow */}
      <ellipse cx="40" cy="50" rx="25" ry="18" fill={`rgba(255,200,0,${glowIntensity * 0.3})`} />
      {/* Eyes */}
      <polygon points="25,42 32,35 35,45" fill="#1a1a2e" />
      <polygon points="55,42 48,35 45,45" fill="#1a1a2e" />
      {/* Nose */}
      <polygon points="40,45 37,52 43,52" fill="#1a1a2e" />
      {/* Mouth */}
      <path d="M28,58 L32,55 L36,60 L40,55 L44,60 L48,55 L52,58" stroke="#1a1a2e" strokeWidth="3" fill="none" />
      {/* Inner glow */}
      <polygon points="25,42 32,35 35,45" fill={`rgba(255,150,0,${glowIntensity * 0.5})`} />
      <polygon points="55,42 48,35 45,45" fill={`rgba(255,150,0,${glowIntensity * 0.5})`} />
    </svg>
  );
}

// Spider SVG
function SpiderSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {/* Body */}
      <ellipse cx="20" cy="25" rx="8" ry="10" fill="#1a1a2e" />
      <circle cx="20" cy="12" r="7" fill="#1a1a2e" />
      {/* Eyes */}
      <circle cx="17" cy="10" r="2" fill="#ff4444" />
      <circle cx="23" cy="10" r="2" fill="#ff4444" />
      {/* Legs */}
      <g stroke="#1a1a2e" strokeWidth="2" fill="none">
        <path d="M12,20 Q5,15 2,8" />
        <path d="M12,25 Q3,25 0,20" />
        <path d="M12,30 Q5,35 2,40" />
        <path d="M28,20 Q35,15 38,8" />
        <path d="M28,25 Q37,25 40,20" />
        <path d="M28,30 Q35,35 38,40" />
      </g>
    </svg>
  );
}

export function HalloweenDecoration({ width, height }: HalloweenDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Pumpkin glow pulse
  const pumpkinGlow = usePulse({ frequency: 0.5, min: 0.6, max: 1 });

  // Generate bats
  const bats = useMemo(() => {
    const result: Bat[] = [];
    const batCount = 15;

    for (let i = 0; i < batCount; i++) {
      result.push({
        id: i,
        x: random(`bat-x-${i}`) * width,
        startX: random(`bat-startX-${i}`) * (width + 200), // Pre-seeded for immediate visibility
        y: random(`bat-y-${i}`) * height * 0.6,
        size: random(`bat-size-${i}`) * 30 + 25,
        speed: random(`bat-speed-${i}`) * 3 + 2,
        delay: random(`bat-delay-${i}`) * 30, // Reduced from 200 for faster appearance
        flapSpeed: random(`bat-flap-${i}`) * 0.3 + 0.2,
      });
    }
    return result;
  }, [width, height]);

  // Generate ghosts
  const ghosts = useMemo(() => {
    const result: Ghost[] = [];
    const ghostCount = 6;

    for (let i = 0; i < ghostCount; i++) {
      result.push({
        id: i,
        x: random(`ghost-x-${i}`) * width * 0.8 + width * 0.1,
        size: random(`ghost-size-${i}`) * 40 + 40,
        speed: random(`ghost-speed-${i}`) * 0.5 + 0.3,
        delay: random(`ghost-delay-${i}`) * 30, // Reduced from 300 for faster appearance
        wobblePhase: random(`ghost-wobble-${i}`) * Math.PI * 2,
      });
    }
    return result;
  }, [width]);

  // Generate spiders
  const spiders = useMemo(() => {
    const result: Spider[] = [];
    const spiderCount = 4;

    for (let i = 0; i < spiderCount; i++) {
      result.push({
        id: i,
        x: random(`spider-x-${i}`) * width * 0.6 + width * 0.2,
        startY: -30,
        size: random(`spider-size-${i}`) * 20 + 20,
        dropDelay: random(`spider-drop-${i}`) * durationInFrames * 0.5,
        swingPhase: random(`spider-swing-${i}`) * Math.PI * 2,
      });
    }
    return result;
  }, [width, durationInFrames]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Spooky sparkle overlay - purple/orange tones */}
      <SparkleOverlay count={25} color="#9B59B6" minSize={2} maxSize={6} seed="halloween-sparkle" />

      {/* Spooky fog at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 150,
          background: 'linear-gradient(to top, rgba(100,100,120,0.4), transparent)',
        }}
      />

      {/* Flying bats */}
      {bats.map((bat) => {
        // Pre-seeded X position for immediate visibility
        const xOffset = (bat.startX + (frame + bat.delay) * bat.speed) % (width + 200);
        const currentX = xOffset - 100;
        const yWobble = Math.sin((frame + bat.delay) * 0.03) * 30;
        const currentY = bat.y + yWobble;
        const wingAngle = Math.sin((frame + bat.delay) * bat.flapSpeed) * 15;

        return (
          <div
            key={bat.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
            }}
          >
            <BatSVG size={bat.size} wingAngle={wingAngle} />
          </div>
        );
      })}

      {/* Floating ghosts */}
      {ghosts.map((ghost) => {
        const yOffset = Math.sin((frame + ghost.delay) * ghost.speed * 0.02) * 50;
        const xWobble = Math.sin((frame + ghost.delay) * 0.01) * 30;
        const wobble = Math.sin((frame + ghost.delay) * 0.1 + ghost.wobblePhase) * 5;

        // Ghosts fade in and out
        const fadeIn = interpolate(frame, [ghost.delay, ghost.delay + fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const cycleLength = durationInFrames / 3;
        const cycleProgress = ((frame - ghost.delay) % cycleLength) / cycleLength;
        const visibility = cycleProgress < 0.5 ? 1 : interpolate(cycleProgress, [0.5, 0.7, 0.9, 1], [1, 0, 0, 1]);

        return (
          <div
            key={ghost.id}
            style={{
              position: 'absolute',
              left: ghost.x + xWobble,
              top: height * 0.3 + yOffset,
              opacity: fadeIn * visibility * 0.8,
            }}
          >
            <GhostSVG size={ghost.size} wobble={wobble} />
          </div>
        );
      })}

      {/* Dropping spiders */}
      {spiders.map((spider) => {
        const elapsed = frame - spider.dropDelay;
        if (elapsed < 0) return null;

        const dropProgress = interpolate(elapsed, [0, fps * 3], [0, 1], { extrapolateRight: 'clamp' });
        const targetY = height * 0.4 + spider.id * 50;
        const currentY = interpolate(dropProgress, [0, 1], [spider.startY, targetY]);
        const swing = dropProgress === 1 ? Math.sin(elapsed * 0.05 + spider.swingPhase) * 20 : 0;

        return (
          <div key={spider.id}>
            {/* Web thread */}
            <svg
              style={{
                position: 'absolute',
                left: spider.x + spider.size / 2,
                top: 0,
                width: 2,
                height: currentY + spider.size / 2,
              }}
            >
              <line
                x1="1"
                y1="0"
                x2="1"
                y2={currentY + spider.size / 2}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
            </svg>
            {/* Spider */}
            <div
              style={{
                position: 'absolute',
                left: spider.x + swing,
                top: currentY,
              }}
            >
              <SpiderSVG size={spider.size} />
            </div>
          </div>
        );
      })}

      {/* Pumpkins at bottom corners with enhanced glow and flicker */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          bottom: 20,
          transform: `scale(${0.9 + pumpkinGlow * 0.1})`,
        }}
      >
        <GlowPulse color="rgba(255, 100, 0, 0.6)" minGlow={10} maxGlow={30} frequency={0.5}>
          <Flicker intensity={0.2} speed={6} seed="pumpkin1">
            <PumpkinSVG size={80} glowIntensity={pumpkinGlow} />
          </Flicker>
        </GlowPulse>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 30,
          bottom: 30,
          transform: `scale(${0.9 + pumpkinGlow * 0.1})`,
        }}
      >
        <GlowPulse color="rgba(255, 100, 0, 0.6)" minGlow={15} maxGlow={40} frequency={0.4} phase={0.5}>
          <Flicker intensity={0.25} speed={7} seed="pumpkin2">
            <PumpkinSVG size={100} glowIntensity={pumpkinGlow} />
          </Flicker>
        </GlowPulse>
      </div>

      {/* Cobweb in corner */}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.3,
        }}
      >
        {/* Radial threads */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI / 2;
          const endX = Math.cos(angle) * 200;
          const endY = Math.sin(angle) * 200;
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={endX}
              y2={endY}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
        {/* Spiral threads */}
        {Array.from({ length: 6 }).map((_, ring) => {
          const radius = (ring + 1) * 30;
          const points = Array.from({ length: 9 }).map((_, i) => {
            const angle = (i / 8) * Math.PI / 2;
            return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
          }).join(' ');
          return (
            <polyline
              key={ring}
              points={points}
              stroke="white"
              strokeWidth="0.5"
              fill="none"
            />
          );
        })}
      </svg>

      {/* Floating particles (dust/smoke) */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = random(`dust-x-${i}`) * width;
        const baseY = random(`dust-y-${i}`) * height;
        const yOffset = Math.sin((frame + i * 20) * 0.02) * 20;
        const opacity = (Math.sin((frame + i * 30) * 0.05) + 1) / 4 + 0.1;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: baseY + yOffset,
              width: 4,
              height: 4,
              backgroundColor: 'rgba(150,150,170,0.5)',
              borderRadius: '50%',
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}
