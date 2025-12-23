import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse, useOscillate } from '../utils/animations';
import { SparkleOverlay, GlowPulse, SwayMotion, ScalePulse, TrailEffect, getBezierPoint, getBezierAngle } from '../utils/decorationAnimations';

interface ChristmasDecorationProps {
  width: number;
  height: number;
}

// Snow particle
interface Snowflake {
  id: number;
  x: number;
  startY: number;
  size: number;
  speed: number;
  delay: number;
  swayAmplitude: number;
  swaySpeed: number;
  opacity: number;
  rotation: number;
  type: 'dot' | 'flake';
}

// Christmas light
interface Light {
  id: number;
  x: number;
  color: string;
  phase: number;
}

// Ornament
interface Ornament {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
  swingPhase: number;
}

// SVG Snowflake
function SnowflakeSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <g fill="white" stroke="white" strokeWidth="0.5">
        <line x1="12" y1="1" x2="12" y2="23" />
        <line x1="1" y1="12" x2="23" y2="12" />
        <line x1="4" y1="4" x2="20" y2="20" />
        <line x1="20" y1="4" x2="4" y2="20" />
        <line x1="12" y1="5" x2="9" y2="2" />
        <line x1="12" y1="5" x2="15" y2="2" />
        <line x1="12" y1="19" x2="9" y2="22" />
        <line x1="12" y1="19" x2="15" y2="22" />
        <line x1="5" y1="12" x2="2" y2="9" />
        <line x1="5" y1="12" x2="2" y2="15" />
        <line x1="19" y1="12" x2="22" y2="9" />
        <line x1="19" y1="12" x2="22" y2="15" />
        <circle cx="12" cy="12" r="2" fill="white" />
      </g>
    </svg>
  );
}

// Improved Santa Sleigh with bezier curve path
function SantaSleigh({ progress, width, height }: { progress: number; width: number; height: number }) {
  // Bezier curve control points for smooth arc path
  const p0 = { x: -200, y: height * 0.15 };
  const p1 = { x: width * 0.3, y: height * 0.05 };
  const p2 = { x: width * 0.7, y: height * 0.08 };
  const p3 = { x: width + 200, y: height * 0.12 };

  const pos = getBezierPoint(progress, p0, p1, p2, p3);
  const angle = getBezierAngle(progress, p0, p1, p2, p3);

  // Gentle bob on top of the path
  const bobOffset = Math.sin(progress * Math.PI * 6) * 8;

  return (
    <>
      {/* Sparkle trail behind sleigh */}
      {progress > 0.05 && progress < 0.95 && (
        <TrailEffect
          x={pos.x - 100}
          y={pos.y + bobOffset + 30}
          count={12}
          color="rgba(255, 215, 0, 0.6)"
          spread={40}
          seed="sleigh-trail"
        />
      )}

      <div
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y + bobOffset,
          opacity: progress > 0 && progress < 1 ? 0.95 : 0,
          filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.6))',
          transform: `rotate(${angle * 0.3}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <svg width="180" height="80" viewBox="0 0 180 80" fill="#1a1a2e">
          {/* Sleigh */}
          <path d="M40,60 Q30,60 25,50 L20,50 Q15,50 15,45 L15,40 Q15,35 20,35 L100,35 Q110,35 115,40 L120,45 Q125,50 120,55 L115,60 Q110,65 100,60 Z" />
          {/* Runner */}
          <path d="M10,65 Q5,65 5,60 L5,55 Q5,50 10,50 L120,50 Q130,50 135,55 L140,60 Q145,65 140,70 L10,70 Q5,70 5,65 Z" fill="#8B4513" />
          {/* Santa body */}
          <ellipse cx="70" cy="25" rx="20" ry="18" fill="#cc0000" />
          {/* Santa head */}
          <circle cx="70" cy="8" r="10" fill="#FFE4C4" />
          {/* Santa hat */}
          <path d="M60,8 Q65,0 75,2 L90,8 Q85,15 80,10 Z" fill="#cc0000" />
          <circle cx="88" cy="5" r="4" fill="white" />
          {/* Beard */}
          <ellipse cx="70" cy="15" rx="8" ry="6" fill="white" />
          {/* Gift sack */}
          <ellipse cx="95" cy="25" rx="15" ry="20" fill="#8B0000" />
          {/* Reindeer */}
          <g transform="translate(130, 30)">
            <ellipse cx="15" cy="20" rx="18" ry="12" fill="#8B4513" />
            <circle cx="35" cy="12" r="8" fill="#8B4513" />
            <path d="M32,5 L28,-5 L25,0 M32,5 L35,-8 L38,-3" stroke="#5D4037" strokeWidth="2" fill="none" />
            <path d="M38,5 L42,-5 L45,0 M38,5 L41,-8 L44,-3" stroke="#5D4037" strokeWidth="2" fill="none" />
            <line x1="5" y1="30" x2="5" y2="45" stroke="#8B4513" strokeWidth="3" />
            <line x1="25" y1="30" x2="25" y2="45" stroke="#8B4513" strokeWidth="3" />
            {/* Glowing red nose */}
            <circle cx="42" cy="14" r="4" fill="#ff0000" filter="url(#noseGlow)" />
          </g>
          {/* Reins */}
          <path d="M100,30 Q115,25 135,35" stroke="#FFD700" strokeWidth="2" fill="none" />
          {/* Define glow filter */}
          <defs>
            <filter id="noseGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </>
  );
}

// Christmas light bulb with enhanced glow
function LightBulb({ color, brightness }: { color: string; brightness: number }) {
  return (
    <svg width="20" height="30" viewBox="0 0 20 30">
      <line x1="10" y1="0" x2="10" y2="8" stroke="#333" strokeWidth="2" />
      <rect x="6" y="6" width="8" height="6" fill="#555" rx="1" />
      <ellipse
        cx="10"
        cy="20"
        rx="8"
        ry="10"
        fill={color}
        opacity={0.4 + brightness * 0.6}
        filter={`drop-shadow(0 0 ${12 * brightness}px ${color}) drop-shadow(0 0 ${6 * brightness}px ${color})`}
      />
    </svg>
  );
}

// Ornament ball
function OrnamentBall({ size, color, swing }: { size: number; color: string; swing: number }) {
  return (
    <svg width={size + 10} height={size + 20} viewBox={`0 0 ${size + 10} ${size + 20}`}>
      <line x1={(size + 10) / 2} y1="0" x2={(size + 10) / 2} y2="15" stroke="#555" strokeWidth="1" />
      <rect x={(size + 10) / 2 - 4} y="12" width="8" height="6" fill="#FFD700" rx="1" />
      <circle
        cx={(size + 10) / 2}
        cy={size / 2 + 18}
        r={size / 2}
        fill={color}
        filter={`drop-shadow(0 2px 4px rgba(0,0,0,0.3))`}
      />
      <ellipse
        cx={(size + 10) / 2 - size / 5}
        cy={size / 2 + 15}
        rx={size / 6}
        ry={size / 4}
        fill="rgba(255,255,255,0.4)"
      />
    </svg>
  );
}

// Animated Holly with berries
function AnimatedHolly() {
  const berryPulse = usePulse({ frequency: 0.8, min: 0.6, max: 1, phase: 0 });

  return (
    <SwayMotion amplitude={3} frequency={0.25} originX="50%" originY="100%">
      <ScalePulse minScale={1} maxScale={1.03} frequency={0.4}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Holly leaves */}
          <path
            d="M80,20 Q100,30 90,50 Q110,40 100,60 Q120,70 90,80 Q100,100 70,90 Q60,110 50,80 Q20,90 40,60 Q10,50 40,40 Q30,20 60,30 Q70,10 80,20 Z"
            fill="#228B22"
            filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.3))"
          />
          {/* Animated glowing berries */}
          <GlowPulse color="rgba(255, 0, 0, 0.8)" minGlow={3} maxGlow={10} frequency={0.8}>
            <circle cx="65" cy="50" r="8" fill="#cc0000" opacity={berryPulse} />
          </GlowPulse>
          <GlowPulse color="rgba(255, 0, 0, 0.8)" minGlow={3} maxGlow={10} frequency={0.8} phase={0.33}>
            <circle cx="55" cy="60" r="8" fill="#cc0000" opacity={berryPulse} />
          </GlowPulse>
          <GlowPulse color="rgba(255, 0, 0, 0.8)" minGlow={3} maxGlow={10} frequency={0.8} phase={0.66}>
            <circle cx="75" cy="60" r="8" fill="#cc0000" opacity={berryPulse} />
          </GlowPulse>
          {/* Shine on berries */}
          <circle cx="62" cy="47" r="2" fill="rgba(255,255,255,0.7)" />
          <circle cx="52" cy="57" r="2" fill="rgba(255,255,255,0.7)" />
          <circle cx="72" cy="57" r="2" fill="rgba(255,255,255,0.7)" />
        </svg>
      </ScalePulse>
    </SwayMotion>
  );
}

export function ChristmasDecoration({ width, height }: ChristmasDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Generate snow particles
  const snowflakes = useMemo(() => {
    const result: Snowflake[] = [];
    const snowCount = 150;

    for (let i = 0; i < snowCount; i++) {
      result.push({
        id: i,
        x: random(`snow-x-${i}`) * width,
        startY: random(`snow-startY-${i}`) * (height + 100),
        size: random(`snow-size-${i}`) * 8 + 4,
        speed: random(`snow-speed-${i}`) * 1.5 + 0.5,
        delay: random(`snow-delay-${i}`) * 30,
        swayAmplitude: random(`snow-sway-${i}`) * 30 + 10,
        swaySpeed: random(`snow-sway-speed-${i}`) * 0.03 + 0.01,
        opacity: random(`snow-opacity-${i}`) * 0.5 + 0.5,
        rotation: random(`snow-rot-${i}`) * 360,
        type: random(`snow-type-${i}`) > 0.7 ? 'flake' : 'dot',
      });
    }
    return result;
  }, [width, height]);

  // Generate Christmas lights
  const lights = useMemo(() => {
    const colors = ['#ff0000', '#00ff00', '#ffff00', '#0066ff', '#ff6600'];
    const result: Light[] = [];
    const lightCount = 20;
    const spacing = width / lightCount;

    for (let i = 0; i < lightCount; i++) {
      result.push({
        id: i,
        x: i * spacing + spacing / 2,
        color: colors[i % colors.length],
        phase: i * 0.5,
      });
    }
    return result;
  }, [width]);

  // Generate ornaments
  const ornaments = useMemo(() => {
    const colors = ['#cc0000', '#00cc00', '#FFD700', '#0066cc', '#cc00cc'];
    const result: Ornament[] = [];
    const ornamentCount = 8;

    for (let i = 0; i < ornamentCount; i++) {
      result.push({
        id: i,
        x: random(`ornament-x-${i}`) * width * 0.8 + width * 0.1,
        size: random(`ornament-size-${i}`) * 20 + 25,
        color: colors[i % colors.length],
        delay: random(`ornament-delay-${i}`) * durationInFrames * 0.5,
        swingPhase: random(`ornament-swing-${i}`) * Math.PI * 2,
      });
    }
    return result;
  }, [width, durationInFrames]);

  // Santa progress - smoother timing
  const santaStartFrame = Math.floor(durationInFrames * 0.25);
  const santaDuration = Math.floor(durationInFrames * 0.35);
  const santaProgress = interpolate(
    frame,
    [santaStartFrame, santaStartFrame + santaDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Sparkle overlay */}
      <SparkleOverlay count={25} color="white" minSize={2} maxSize={6} seed="xmas-sparkle" />

      {/* Snow layer */}
      {snowflakes.map((snow) => {
        const yOffset = (snow.startY + (frame + snow.delay) * snow.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + snow.delay) * snow.swaySpeed) * snow.swayAmplitude;
        const currentX = snow.x + xSway;
        const rotation = (frame + snow.delay) * (snow.type === 'flake' ? 0.5 : 2);

        return (
          <div
            key={snow.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {snow.type === 'flake' ? (
              <SnowflakeSVG size={snow.size} opacity={snow.opacity} />
            ) : (
              <div
                style={{
                  width: snow.size / 2,
                  height: snow.size / 2,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  opacity: snow.opacity,
                  boxShadow: '0 0 6px white',
                }}
              />
            )}
          </div>
        );
      })}

      {/* Christmas lights at top with enhanced glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <svg
          width={width}
          height="50"
          style={{ position: 'absolute', top: 0 }}
        >
          <path
            d={`M0,10 ${lights.map((l) => `Q${l.x - 20},25 ${l.x},15`).join(' ')}`}
            stroke="#2d2d2d"
            strokeWidth="3"
            fill="none"
          />
        </svg>
        {lights.map((light) => {
          const brightness = (Math.sin(frame * 0.15 + light.phase) + 1) / 2;
          return (
            <div
              key={light.id}
              style={{
                position: 'absolute',
                left: light.x - 10,
                top: 5,
              }}
            >
              <LightBulb color={light.color} brightness={brightness} />
            </div>
          );
        })}
      </div>

      {/* Santa sleigh with improved path */}
      <SantaSleigh progress={santaProgress} width={width} height={height} />

      {/* Falling ornaments */}
      {ornaments.map((ornament) => {
        const fallProgress = interpolate(
          frame,
          [ornament.delay, ornament.delay + fps * 8],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        if (fallProgress === 0) return null;

        const currentY = interpolate(fallProgress, [0, 1], [-50, height + 50]);
        const swing = Math.sin(frame * 0.05 + ornament.swingPhase) * 20;

        return (
          <div
            key={ornament.id}
            style={{
              position: 'absolute',
              left: ornament.x + swing,
              top: currentY,
              transform: `rotate(${swing}deg)`,
              opacity: fallProgress < 0.9 ? 1 : interpolate(fallProgress, [0.9, 1], [1, 0]),
            }}
          >
            <OrnamentBall size={ornament.size} color={ornament.color} swing={swing} />
          </div>
        );
      })}

      {/* Corner decoration - Animated Holly */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
        <AnimatedHolly />
      </div>

      {/* Bottom snow bank with shimmer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))',
        }}
      />
    </AbsoluteFill>
  );
}
