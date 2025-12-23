import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';

interface RoshHashanahDecorationProps {
  width: number;
  height: number;
}

// Apple SVG
function AppleSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 55" style={{ opacity }}>
      {/* Stem */}
      <path d="M25,5 Q28,0 26,8" stroke="#8B4513" strokeWidth="3" fill="none" />
      {/* Leaf */}
      <ellipse cx="30" cy="6" rx="6" ry="3" fill="#228B22" transform="rotate(30 30 6)" />
      {/* Apple body */}
      <path
        d="M25,12 Q40,15 42,30 Q43,45 25,52 Q7,45 8,30 Q10,15 25,12"
        fill="#DC143C"
      />
      {/* Shine */}
      <ellipse cx="18" cy="25" rx="4" ry="6" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// Honey Jar SVG
function HoneyJarSVG({ size, dripProgress }: { size: number; dripProgress: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 50 60">
      {/* Jar body */}
      <rect x="8" y="20" width="34" height="35" rx="5" fill="rgba(255,215,0,0.8)" />
      {/* Jar neck */}
      <rect x="15" y="12" width="20" height="10" fill="rgba(255,215,0,0.9)" />
      {/* Lid */}
      <rect x="12" y="8" width="26" height="6" rx="2" fill="#DAA520" />
      {/* Honey inside */}
      <rect x="12" y="24" width="26" height="28" rx="3" fill="#FFD700" />
      {/* Honey drip */}
      <ellipse
        cx="25"
        cy={55 + dripProgress * 8}
        rx="4"
        ry={3 + dripProgress * 2}
        fill="#FFD700"
        opacity={0.8}
      />
      {/* Label */}
      <rect x="14" y="32" width="22" height="12" rx="2" fill="#FFFAF0" opacity={0.6} />
    </svg>
  );
}

// Pomegranate SVG
function PomegranateSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 55" style={{ opacity }}>
      {/* Crown */}
      <polygon points="25,0 20,8 30,8" fill="#8B0000" />
      <polygon points="22,2 18,8 26,8" fill="#A52A2A" />
      <polygon points="28,2 24,8 32,8" fill="#A52A2A" />
      {/* Body */}
      <ellipse cx="25" cy="30" rx="20" ry="22" fill="#C41E3A" />
      {/* Seeds visible */}
      <circle cx="20" cy="25" r="3" fill="#FF6B6B" />
      <circle cx="30" cy="25" r="3" fill="#FF6B6B" />
      <circle cx="25" cy="32" r="3" fill="#FF6B6B" />
      <circle cx="18" cy="35" r="2.5" fill="#FF6B6B" />
      <circle cx="32" cy="35" r="2.5" fill="#FF6B6B" />
      {/* Shine */}
      <ellipse cx="18" cy="22" rx="4" ry="6" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

// Shofar SVG
function ShofarSVG({ size }: { size: number }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 120 60">
      {/* Main horn body */}
      <path
        d="M10,30 Q20,10 60,15 Q100,20 110,35 Q115,45 105,50 Q95,55 85,50 Q75,45 65,42 Q40,38 20,40 Q10,42 10,30"
        fill="#DAA520"
        stroke="#8B4513"
        strokeWidth="2"
      />
      {/* Horn texture lines */}
      <path d="M30,25 Q50,22 70,28" stroke="#B8860B" strokeWidth="1" fill="none" />
      <path d="M35,32 Q55,30 75,35" stroke="#B8860B" strokeWidth="1" fill="none" />
      <path d="M25,38 Q45,36 65,40" stroke="#B8860B" strokeWidth="1" fill="none" />
      {/* Mouthpiece */}
      <ellipse cx="12" cy="30" rx="4" ry="8" fill="#CD853F" />
    </svg>
  );
}

// Golden Leaf SVG
function GoldenLeafSVG({ size, rotation }: { size: number; rotation: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 40"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M15,0 Q25,10 25,20 Q25,35 15,40 Q5,35 5,20 Q5,10 15,0"
        fill="#DAA520"
        opacity={0.8}
      />
      <path d="M15,5 L15,35" stroke="#B8860B" strokeWidth="1" fill="none" />
      <path d="M15,12 Q10,15 8,20" stroke="#B8860B" strokeWidth="0.5" fill="none" />
      <path d="M15,12 Q20,15 22,20" stroke="#B8860B" strokeWidth="0.5" fill="none" />
      <path d="M15,22 Q10,25 8,30" stroke="#B8860B" strokeWidth="0.5" fill="none" />
      <path d="M15,22 Q20,25 22,30" stroke="#B8860B" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

// Bee SVG
function BeeSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28">
      {/* Wings */}
      <ellipse cx="12" cy="8" rx="8" ry="5" fill="rgba(255,255,255,0.6)" />
      <ellipse cx="28" cy="8" rx="8" ry="5" fill="rgba(255,255,255,0.6)" />
      {/* Body */}
      <ellipse cx="20" cy="16" rx="12" ry="8" fill="#FFD700" />
      {/* Stripes */}
      <rect x="12" y="12" width="4" height="8" fill="#1a1a1a" />
      <rect x="20" y="12" width="4" height="8" fill="#1a1a1a" />
      <rect x="28" y="14" width="3" height="6" fill="#1a1a1a" />
      {/* Head */}
      <circle cx="8" cy="16" r="5" fill="#1a1a1a" />
      {/* Eyes */}
      <circle cx="6" cy="14" r="1.5" fill="white" />
      <circle cx="10" cy="14" r="1.5" fill="white" />
    </svg>
  );
}

export function RoshHashanahDecoration({ width, height }: RoshHashanahDecorationProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Honey drip animation
  const dripProgress = usePulse({ frequency: 0.5, min: 0, max: 1 });

  // Generate floating apples
  const apples = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: random(`apple-x-${i}`) * width,
      startY: random(`apple-startY-${i}`) * (height + 100),
      size: random(`apple-size-${i}`) * 25 + 30,
      speed: random(`apple-speed-${i}`) * 1 + 0.3,
      delay: random(`apple-delay-${i}`) * 30,
      swayAmplitude: random(`apple-sway-${i}`) * 20 + 10,
      opacity: random(`apple-opacity-${i}`) * 0.3 + 0.6,
    }));
  }, [width, height]);

  // Generate pomegranates
  const pomegranates = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: random(`pom-x-${i}`) * width,
      startY: random(`pom-startY-${i}`) * (height + 100),
      size: random(`pom-size-${i}`) * 20 + 25,
      speed: random(`pom-speed-${i}`) * 0.8 + 0.3,
      delay: random(`pom-delay-${i}`) * 30,
      opacity: random(`pom-opacity-${i}`) * 0.3 + 0.5,
    }));
  }, [width, height]);

  // Generate falling golden leaves
  const leaves = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: random(`leaf-x-${i}`) * width,
      startY: random(`leaf-startY-${i}`) * (height + 100),
      size: random(`leaf-size-${i}`) * 15 + 15,
      speed: random(`leaf-speed-${i}`) * 2 + 0.8,
      delay: random(`leaf-delay-${i}`) * 30,
      rotation: random(`leaf-rot-${i}`) * 360,
      rotationSpeed: random(`leaf-rot-speed-${i}`) * 4 - 2,
      swayAmplitude: random(`leaf-sway-${i}`) * 40 + 15,
    }));
  }, [width, height]);

  // Generate bees
  const bees = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: random(`bee-x-${i}`) * width * 0.8 + width * 0.1,
      y: random(`bee-y-${i}`) * height * 0.6 + height * 0.2,
      size: random(`bee-size-${i}`) * 15 + 20,
      phase: random(`bee-phase-${i}`) * Math.PI * 2,
      speedX: random(`bee-speedX-${i}`) * 2 + 1,
      speedY: random(`bee-speedY-${i}`) * 1 + 0.5,
    }));
  }, [width, height]);

  // Honey jars
  const honeyJars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: random(`jar-x-${i}`) * width * 0.6 + width * 0.2,
      startY: random(`jar-startY-${i}`) * (height + 80),
      size: random(`jar-size-${i}`) * 20 + 40,
      speed: random(`jar-speed-${i}`) * 0.5 + 0.2,
      delay: random(`jar-delay-${i}`) * 30,
    }));
  }, [width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Warm golden gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(218,165,32,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Falling golden leaves */}
      {leaves.map((leaf) => {
        const yOffset = (leaf.startY + (frame + leaf.delay) * leaf.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + leaf.delay) * 0.02) * leaf.swayAmplitude;
        const rotation = leaf.rotation + frame * leaf.rotationSpeed;

        return (
          <div
            key={`leaf-${leaf.id}`}
            style={{
              position: 'absolute',
              left: leaf.x + xSway,
              top: currentY,
            }}
          >
            <GoldenLeafSVG size={leaf.size} rotation={rotation} />
          </div>
        );
      })}

      {/* Floating apples */}
      {apples.map((apple) => {
        const yOffset = (apple.startY + (frame + apple.delay) * apple.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + apple.delay) * 0.015) * apple.swayAmplitude;

        return (
          <div
            key={`apple-${apple.id}`}
            style={{
              position: 'absolute',
              left: apple.x + xSway,
              top: currentY,
            }}
          >
            <AppleSVG size={apple.size} opacity={apple.opacity} />
          </div>
        );
      })}

      {/* Floating pomegranates */}
      {pomegranates.map((pom) => {
        const yOffset = (pom.startY + (frame + pom.delay) * pom.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + pom.delay) * 0.012) * 25;

        return (
          <div
            key={`pom-${pom.id}`}
            style={{
              position: 'absolute',
              left: pom.x + xSway,
              top: currentY,
            }}
          >
            <PomegranateSVG size={pom.size} opacity={pom.opacity} />
          </div>
        );
      })}

      {/* Honey jars floating */}
      {honeyJars.map((jar) => {
        const yOffset = (jar.startY + (frame + jar.delay) * jar.speed) % (height + 80);
        const currentY = yOffset - 40;
        const xSway = Math.sin((frame + jar.delay) * 0.01) * 15;

        return (
          <div
            key={`jar-${jar.id}`}
            style={{
              position: 'absolute',
              left: jar.x + xSway,
              top: currentY,
            }}
          >
            <HoneyJarSVG size={jar.size} dripProgress={dripProgress} />
          </div>
        );
      })}

      {/* Buzzing bees */}
      {bees.map((bee) => {
        const buzzX = Math.sin(frame * 0.1 + bee.phase) * 30 * bee.speedX;
        const buzzY = Math.cos(frame * 0.15 + bee.phase) * 20 * bee.speedY;
        const wobble = Math.sin(frame * 0.3) * 5;

        return (
          <div
            key={`bee-${bee.id}`}
            style={{
              position: 'absolute',
              left: bee.x + buzzX,
              top: bee.y + buzzY,
              transform: `rotate(${wobble}deg)`,
            }}
          >
            <BeeSVG size={bee.size} />
          </div>
        );
      })}

      {/* Shofar in corner */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          bottom: 30,
          opacity: 0.15,
        }}
      >
        <ShofarSVG size={150} />
      </div>

      {/* Hebrew watermark */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          fontSize: 28,
          fontFamily: 'serif',
          opacity: 0.08,
          color: '#DAA520',
        }}
      >
        שנה טובה
      </div>
    </AbsoluteFill>
  );
}
