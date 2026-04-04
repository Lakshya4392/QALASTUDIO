import {
  Composition,
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
} from 'remotion';
import React, { useMemo } from 'react';

// Configuration
const CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  totalDuration: 540, // 18 seconds
  sections: {
    intro: { start: 0, duration: 120 },
    services: { start: 120, duration: 120 },
    studios: { start: 240, duration: 120 },
    showcase: { start: 360, duration: 90 },
    cta: { start: 450, duration: 90 },
  },
  colors: {
    background: '#0a0a0a',
    primary: '#8B5CF6',
    secondary: '#3B82F6',
    accent: '#a5b4fc',
    text: '#ffffff',
  },
};

// Main Composition Component
export const QalaStudiosEnhanced: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CONFIG.colors.background,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient background */}
      <GradientBackground frame={frame} fps={fps} />

      {/* Section 1: 3D Logo Intro */}
      <Sequence from={CONFIG.sections.intro.start} durationInFrames={CONFIG.sections.intro.duration}>
        <Intro3DSection frameInSequence={frame - CONFIG.sections.intro.start} fps={fps} />
      </Sequence>

      {/* Section 2: Services with 3D Cards */}
      <Sequence from={CONFIG.sections.services.start} durationInFrames={CONFIG.sections.services.duration}>
        <Services3DSection frameInSequence={frame - CONFIG.sections.services.start} fps={fps} />
      </Sequence>

      {/* Section 3: Studios 3D Tour */}
      <Sequence from={CONFIG.sections.studios.start} durationInFrames={CONFIG.sections.studios.duration}>
        <Studios3DSection frameInSequence={frame - CONFIG.sections.studios.start} fps={fps} />
      </Sequence>

      {/* Section 4: Showcase Carousel */}
      <Sequence from={CONFIG.sections.showcase.start} durationInFrames={CONFIG.sections.showcase.duration}>
        <Showcase3DSection frameInSequence={frame - CONFIG.sections.showcase.start} fps={fps} />
      </Sequence>

      {/* Section 5: Enhanced CTA */}
      <Sequence from={CONFIG.sections.cta.start} durationInFrames={CONFIG.sections.cta.duration}>
        <CTAEnhancedSection frameInSequence={frame - CONFIG.sections.cta.start} fps={fps} />
      </Sequence>

      {/* Overlay effects */}
      <VignetteOverlay />
      <NoiseOverlay />
    </AbsoluteFill>
  );
};

// Animated Gradient Background
const GradientBackground: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const gradientX = interpolate(frame, [0, CONFIG.totalDuration], [0, 100], {
    extrapolateRight: 'clamp',
  });

  const gradientY = interpolate(frame, [0, CONFIG.totalDuration], [0, 50], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${50 + gradientX * 0.2}% ${50 + gradientY * 0.1}%, rgba(139, 92, 246, 0.15) 0%, rgba(10, 10, 10, 1) 70%)`,
        opacity: 0.8,
      }}
    />
  );
};

// Floating particles (CSS-based)
const FloatingParticles: React.FC<{ count: number }> = ({ count }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 10,
      duration: Math.random() * 20 + 10,
    }));
  }, [count]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: '#8B5CF6',
            borderRadius: '50%',
            opacity: 0.4,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.3; }
          50% { transform: translateY(-20px); opacity: 0.7; }
        }
      `}</style>
    </AbsoluteFill>
  );
};

// 3D Intro Section
const Intro3DSection: React.FC<{ frameInSequence: number; fps: number }> = ({ frameInSequence, fps }) => {
  const logoRotation = interpolate(frameInSequence, [0, fps * 3], [0, Math.PI * 2], {
    extrapolateRight: 'clamp',
  });

  const logoScale = spring({
    frame: frameInSequence,
    fps: fps,
    config: { mass: 1, damping: 20, stiffness: 100 },
  });

  const logoOpacity = interpolate(frameInSequence, [0, fps * 1, fps * 2, fps * 3], [0, 0.3, 1, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1000px',
      }}
    >
      <div
        style={{
          transform: `scale(${logoScale}) rotateX(20deg) rotateY(${logoRotation}rad)`,
          opacity: logoOpacity,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {/* 3D Logo Cube */}
        <div
          style={{
            width: 180,
            height: 180,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(-20deg) rotateY(15deg)',
          }}
        >
          {/* Front face */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              borderRadius: 25,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 70,
              fontWeight: 900,
              color: 'white',
              transform: 'translateZ(50px)',
              boxShadow:
                '0 0 80px rgba(139, 92, 246, 0.7), inset 0 0 40px rgba(255, 255, 255, 0.15)',
            }}
          >
            Q
          </div>
          {/* Back face */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              borderRadius: 25,
              transform: 'rotateY(180deg) translateZ(50px)',
            }}
          />
          {/* Left face */}
          <div
            style={{
              position: 'absolute',
              width: '100px',
              height: '100%',
              background: 'linear-gradient(to bottom, #7C3AED, #2563EB)',
              left: 40,
              transform: 'rotateY(-90deg) translateZ(50px)',
            }}
          />
          {/* Right face */}
          <div
            style={{
              position: 'absolute',
              width: '100px',
              height: '100%',
              background: 'linear-gradient(to bottom, #7C3AED, #2563EB)',
              right: 40,
              transform: 'rotateY(90deg) translateZ(50px)',
            }}
          />
          {/* Top face */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100px',
              background: 'linear-gradient(to right, #8B5CF6, #6366F1)',
              top: 40,
              transform: 'rotateX(90deg) translateZ(50px)',
            }}
          />
          {/* Bottom face */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100px',
              background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
              bottom: 40,
              transform: 'rotateX(-90deg) translateZ(50px)',
            }}
          />
        </div>

        {/* Title with gradient shimmer */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: -1,
            background: 'linear-gradient(90deg, #ffffff, #a5b4fc, #8B5CF6)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s infinite linear',
            textAlign: 'center',
          }}
        >
          QALA STUDIOS
        </div>

        {/* Tagline with fade */}
        <div
          style={{
            fontSize: 20,
            color: CONFIG.colors.accent,
            letterSpacing: 8,
            textTransform: 'uppercase',
            fontWeight: 300,
            opacity: interpolate(frameInSequence, [fps * 1.5, fps * 2.5], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          Visionary Creativity
        </div>
      </div>

      <FloatingParticles count={50} />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </AbsoluteFill>
  );
};

// 3D Services Section
const Services3DSection: React.FC<{ frameInSequence: number; fps: number }> = ({ frameInSequence, fps }) => {
  const services = [
    { title: 'Film Production', icon: '🎬', color: '#8B5CF6' },
    { title: 'Post Production', icon: '✂️', color: '#3B82F6' },
    { title: 'Virtual Production', icon: '🎥', color: '#EC4899' },
    { title: 'Color Grading', icon: '🎨', color: '#F59E0B' },
  ];

  const slideIn = interpolate(frameInSequence, [0, fps * 2], [100, 0], { extrapolateRight: 'clamp' });
  const titleOpacity = spring({
    frame: frameInSequence,
    fps: fps,
    config: { damping: 50, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
      }}
    >
      <FloatingParticles count={30} />
      <div style={{ transform: `translateX(${slideIn}px)` }}>
        <div
          style={{
            fontSize: 32,
            color: CONFIG.colors.primary,
            marginBottom: 50,
            fontWeight: 700,
            textAlign: 'center',
            opacity: titleOpacity,
            textShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
          }}
        >
          Our Services
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 35,
            maxWidth: 1000,
            padding: '0 40px',
          }}
        >
          {services.map((service, i) => {
            const delay = i * (fps * 0.5);
            const cardProgress = Math.max(0, Math.min(1, (frameInSequence - delay) / fps));
            const cardOpacity = spring({
              frame: frameInSequence - delay,
              fps: fps,
              config: { damping: 30, stiffness: 150 },
            });
            const cardScale = interpolate(cardProgress, [0, 0.8, 1], [0, 1.1, 1], { extrapolateRight: 'clamp' });
            const cardRotateX = interpolate(cardProgress, [0, 1], [45, 0], { extrapolateRight: 'clamp' });
            const cardRotateY = interpolate(cardProgress, [0, 1], [-20, 0], { extrapolateRight: 'clamp' });

            return (
              <div
                key={i}
                style={{
                  padding: 40,
                  background: `linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 24,
                  border: `1px solid ${service.color}40`,
                  boxShadow: `
                    0 20px 60px rgba(0, 0, 0, 0.5),
                    0 0 40px ${service.color}30,
                    inset 0 1px 0 rgba(255,255,255,0.1)
                  `,
                  opacity: cardOpacity,
                  transform: `perspective(1000px) scale(${cardScale}) rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg) translateZ(${cardScale * 50}px)`,
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Shine effect */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${service.color}30, transparent)`,
                    transform: `translateX(${interpolate(frameInSequence, [0, CONFIG.sections.services.duration], [-100, 200])}%)`,
                  }}
                />

                <div style={{ fontSize: 56, marginBottom: 20 }}>{service.icon}</div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: 0.5,
                  }}
                >
                  {service.title}
                </div>

                {/* Bottom accent line */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    background: `linear-gradient(90deg, ${service.color}, transparent)`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 3D Studios Section
const Studios3DSection: React.FC<{ frameInSequence: number; fps: number }> = ({ frameInSequence, fps }) => {
  const studios = [
    { name: 'Studio Alpha', size: '12,000 sq ft', color: '#8B5CF6' },
    { name: 'Studio Beta', size: '8,000 sq ft', color: '#3B82F6' },
    { name: 'Studio Gamma', size: '5,000 sq ft', color: '#EC4899' },
  ];

  // Camera rotates slowly across studios
  const cameraAngle = interpolate(frameInSequence, [0, fps * 4], [0, Math.PI * 0.6], {
    extrapolateRight: 'clamp',
  });

  const studiosContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 60,
    alignItems: 'center',
    justifyContent: 'center',
    transform: `rotateY(${cameraAngle}rad)`,
    transformStyle: 'preserve-3d',
    perspective: '1200px',
    marginBottom: 60,
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
      }}
    >
      <FloatingParticles count={20} />

      <div
        style={{
          fontSize: 32,
          color: CONFIG.colors.primary,
          marginBottom: 60,
          fontWeight: 700,
          textAlign: 'center',
          textShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
        }}
      >
        Premium Facilities
      </div>

      {/* 3D Studio Row */}
      <div style={studiosContainerStyle}>
        {studios.map((studio, i) => {
          const baseOffset = (i - 1) * 350;
          const studioProgress = frameInSequence / (fps * 4);

          // Calculate depth-based opacity and scale
          const zPos = Math.cos((studioProgress * Math.PI * 2 + (i * (Math.PI * 2 / 3))) % (Math.PI * 2));
          const scale = 0.7 + zPos * 0.3;
          const opacity = 0.5 + zPos * 0.5;
          const translateZ = zPos * 100;

          return (
            <div
              key={i}
              style={{
                width: 280,
                height: 200,
                background: `linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))`,
                backdropFilter: 'blur(15px)',
                borderRadius: 20,
                border: `2px solid ${studio.color}88`,
                boxShadow: `
                  0 30px 60px rgba(0, 0, 0, 0.6),
                  0 0 60px ${studio.color}50,
                  inset 0 1px 0 rgba(255,255,255,0.15)
                `,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 15,
                transform: `translateX(${baseOffset}px) translateZ(${translateZ}px) scale(${scale})`,
                opacity: opacity,
                position: 'relative',
              }}
            >
              {/* Studio "window" with scan effect */}
              <div
                style={{
                  width: '80%',
                  height: 80,
                  background: `linear-gradient(135deg, ${studio.color}60, ${studio.color}20)`,
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 32,
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `repeating-linear-gradient(90deg, transparent, transparent 8px, ${studio.color}30 8px, ${studio.color}30 16px)`,
                    animation: `scanLine ${2 + i * 0.5}s linear infinite`,
                  }}
                />
                <span style={{ zIndex: 1 }}>📹</span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{studio.name}</div>
              <div style={{ fontSize: 14, color: CONFIG.colors.accent }}>{studio.size}</div>

              {/* Feature icons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {['🎥', '💡', '🔊'].map((icon, idx) => (
                  <span key={idx} style={{ fontSize: 16, opacity: 0.8 }}>
                    {icon}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Description text */}
      <div
        style={{
          maxWidth: 800,
          fontSize: 18,
          color: CONFIG.colors.accent,
          textAlign: 'center',
          lineHeight: 1.8,
          opacity: spring({
            frame: frameInSequence,
            fps: fps,
            config: { damping: 40, stiffness: 80 },
          }),
        }}
      >
        Three full-service sound stages equipped with the latest LED wall technology,
        professional lighting grids, and acoustic optimization for productions of any scale.
      </div>

      <style>{`
        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </AbsoluteFill>
  );
};

// 3D Showcase Carousel
const Showcase3DSection: React.FC<{ frameInSequence: number; fps: number }> = ({ frameInSequence, fps }) => {
  const projects = [
    { title: 'Project Alpha', category: 'Feature Film', gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)' },
    { title: 'Beta Series', category: 'TV Series', gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)' },
    { title: 'Gamma Film', category: 'Documentary', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  ];

  // Continuous rotation
  const rotation = interpolate(frameInSequence, [0, fps * 4], [0, Math.PI * 2], {
    extrapolateRight: 'clamp',
  });

  const cardWidth = 300;
  const radius = 500;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
      }}
    >
      <FloatingParticles count={15} />

      <div
        style={{
          fontSize: 32,
          color: CONFIG.colors.primary,
          marginBottom: 80,
          fontWeight: 700,
          textShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
        }}
      >
        Featured Productions
      </div>

      {/* 3D Carousel */}
      <div
        style={{
          width: 800,
          height: 500,
          position: 'relative',
          transformStyle: 'preserve-3d',
          perspective: '1500px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            transform: `rotateY(${rotation}rad)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {projects.map((project, i) => {
            const angle = (i / projects.length) * Math.PI * 2;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const scale = z > 0 ? 1 : 0.5;
            const opacity = z > 0 ? 1 : 0.2;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: cardWidth,
                  height: 180,
                  left: 'calc(50% - 150px)',
                  top: 'calc(50% - 90px)',
                  transform: `translate3d(${x}px, 0, ${z}px) scale(${scale})`,
                  opacity: opacity,
                  background: project.gradient,
                  borderRadius: 20,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `
                    0 30px 80px rgba(0, 0, 0, 0.5),
                    0 0 60px ${i === 0 ? 'rgba(139, 92, 246, 0.4)' : i === 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(245, 158, 11, 0.4)'}
                  `,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                  padding: 20,
                  backfaceVisibility: 'hidden',
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color: 'white', textAlign: 'center' }}>
                  {project.title}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                  }}
                >
                  {project.category}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    padding: '8px 24px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 20,
                    fontSize: 12,
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  VIEW PROJECT
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reflection */}
      <div
        style={{
          width: 800,
          height: 200,
          position: 'absolute',
          bottom: -200,
          transform: 'rotateX(180deg) scaleY(0.3)',
          opacity: 0.1,
          filter: 'blur(10px)',
          background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.2), transparent)',
          borderRadius: '0 0 20px 20px',
        }}
      />
    </AbsoluteFill>
  );
};

// Enhanced CTA Section
const CTAEnhancedSection: React.FC<{ frameInSequence: number; fps: number }> = ({ frameInSequence, fps }) => {
  const pulse = spring({
    frame: frameInSequence,
    fps: fps,
    config: { mass: 1, damping: 8, stiffness: 60 },
  });

  const elementsStagger = interpolate(frameInSequence, [0, fps * 2], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const buttonScale = 1 + 0.08 * pulse;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: `radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.15) 0%, ${CONFIG.colors.background} 70%)`,
      }}
    >
      <FloatingParticles count={25} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          opacity: elementsStagger,
          transform: `translateY(${interpolate(elementsStagger, [0, 1], [50, 0])}px)`,
        }}
      >
        {/* Star badge */}
        <div
          style={{
            fontSize: 36,
            marginBottom: 20,
            filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.8))',
            animation: 'twinkle 1.5s ease-in-out infinite',
          }}
        >
          ⭐
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: 1200,
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Ready to Create Something
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #8B5CF6, #3B82F6, #8B5CF6)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s infinite linear',
            }}
          >
            Extraordinary?
          </span>
        </div>

        {/* CTA Button */}
        <div
          style={{
            padding: '24px 70px',
            background: `linear-gradient(135deg, ${CONFIG.colors.primary}, ${CONFIG.colors.secondary})`,
            borderRadius: 60,
            fontSize: 28,
            fontWeight: 800,
            color: 'white',
            cursor: 'pointer',
            transform: `scale(${buttonScale})`,
            boxShadow: `
              0 20px 60px rgba(139, 92, 246, 0.5),
              0 0 ${80 * pulse}px rgba(139, 92, 246, ${0.4 * pulse}),
              inset 0 2px 0 rgba(255,255,255,0.2),
              inset 0 -2px 0 rgba(0,0,0,0.1)
            `,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'buttonShine 2s infinite',
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>Get Started</span>
        </div>

        {/* Contact info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginTop: 20,
          }}
        >
          <div style={{ fontSize: 18, color: CONFIG.colors.accent }}>www.qalastudios.com</div>
          <div style={{ fontSize: 18, color: CONFIG.colors.accent }}>hello@qalastudios.com</div>
        </div>

        {/* Social icons */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginTop: 20,
            opacity: interpolate(frameInSequence, [fps * 1.5, fps * 2.5], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {['📷', '💼', '🎥'].map((icon, i) => (
            <div
              key={i}
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 24,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* Small logo watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          opacity: 0.3,
          fontSize: 14,
          color: CONFIG.colors.accent,
          fontWeight: 600,
          letterSpacing: 2,
        }}
      >
        QALA STUDIOS
      </div>

      <style>{`
        @keyframes buttonShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes twinkle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </AbsoluteFill>
  );
};

// Vignette Overlay
const VignetteOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,0.5) 100%)',
      }}
    />
  );
};

// Noise overlay for cinematic effect
const NoiseOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
};

// Register composition
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QalaStudiosEnhanced"
        component={QalaStudiosEnhanced}
        durationInFrames={CONFIG.totalDuration}
        fps={CONFIG.fps}
        width={CONFIG.width}
        height={CONFIG.height}
      />
    </>
  );
};
