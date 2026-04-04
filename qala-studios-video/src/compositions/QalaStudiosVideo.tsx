import {
  Composition,
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  Sequence,
  interpolate,
  Img,
  spring,
  Easing,
} from 'remotion';
import {useEffect, useState} from 'react';

// Video configuration
export const QalaStudiosVideo: React.FC = () => {
  const {fps, durationInFrames, width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Constants for video structure
  const introDuration = fps * 3; // 3 seconds intro
  const servicesDuration = fps * 4; // 4 seconds services
  const studiosDuration = fps * 4; // 4 seconds studios
  const showcaseDuration = fps * 4; // 4 seconds showcase
  const callToActionDuration = fps * 3; // 3 seconds CTA

  const totalFrames =
    introDuration + servicesDuration + studiosDuration + showcaseDuration + callToActionDuration;

  // Calculate current section
  let currentFrame = frame;
  let sectionY = 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        fontFamily: 'Inter, sans-serif',
        color: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient effect */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(10, 10, 10, 1) 70%)',
        }}
      />

      {/* Intro Section - Qala Studios Logo/Title */}
      <Sequence from={0} durationInFrames={introDuration}>
        <IntroSection frameInSequence={currentFrame} fps={fps} />
      </Sequence>

      {/* Services Section */}
      <Sequence from={introDuration} durationInFrames={servicesDuration}>
        <ServicesSection frameInSequence={currentFrame - introDuration} fps={fps} />
      </Sequence>

      {/* Studios Section */}
      <Sequence from={introDuration + servicesDuration} durationInFrames={studiosDuration}>
        <StudiosSection frameInSequence={currentFrame - introDuration - servicesDuration} fps={fps} />
      </Sequence>

      {/* Showcase Section */}
      <Sequence
        from={introDuration + servicesDuration + studiosDuration}
        durationInFrames={showcaseDuration}
      >
        <ShowcaseSection frameInSequence={currentFrame - introDuration - servicesDuration - studiosDuration} fps={fps} />
      </Sequence>

      {/* Call to Action */}
      <Sequence from={totalFrames - callToActionDuration} durationInFrames={callToActionDuration}>
        <CallToAction frameInSequence={currentFrame - (totalFrames - callToActionDuration)} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Intro Section Component
const IntroSection: React.FC<{frameInSequence: number; fps: number}> = ({frameInSequence, fps}) => {
  const opacity = spring({
    frame: frameInSequence,
    fps: fps,
    durationInFrames: fps * 2,
    config: { damping: 100, stiffness: 200 },
  });

  const scale = interpolate(frameInSequence, [0, fps * 2], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Logo placeholder */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 40,
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)',
        }}
      >
        <span style={{fontSize: 60, fontWeight: 800, color: 'white'}}>Q</span>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          letterSpacing: -2,
          background: 'linear-gradient(90deg, #fff, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 16,
        }}
      >
        QALA STUDIOS
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 24,
          color: '#a5b4fc',
          letterSpacing: 4,
          textTransform: 'uppercase',
          fontWeight: 300,
        }}
      >
        Visionary Creativity
      </div>
    </AbsoluteFill>
  );
};

// Services Section Component
const ServicesSection: React.FC<{frameInSequence: number; fps: number}> = ({frameInSequence, fps}) => {
  const slideIn = interpolate(frameInSequence, [0, fps * 2], [100, 0], {
    extrapolateRight: 'clamp',
  });

  const staggerDelay = fps * 0.5;
  const services = [
    {title: 'Film Production', icon: '🎬'},
    {title: 'Post Production', icon: '✂️'},
    {title: 'Virtual Production', icon: '🎥'},
    {title: 'Color Grading', icon: '🎨'},
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{transform: `translateX(${slideIn}px)`}}>
        <div
          style={{
            fontSize: 28,
            color: '#8B5CF6',
            marginBottom: 40,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Our Services
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 24,
            maxWidth: 800,
          }}
        >
          {services.map((service, i) => {
            const delay = i * staggerDelay;
            const itemOpacity = interpolate(frameInSequence, [delay, delay + fps], [0, 1], {
              extrapolateRight: 'clamp',
            });
            const itemY = interpolate(frameInSequence, [delay, delay + fps], [30, 0], {
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={i}
                style={{
                  padding: 30,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 16,
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  backdropFilter: 'blur(10px)',
                  opacity: itemOpacity,
                  transform: `translateY(${itemY}px)`,
                  textAlign: 'center',
                }}
              >
                <div style={{fontSize: 48, marginBottom: 16}}>{service.icon}</div>
                <div style={{fontSize: 20, fontWeight: 600}}>{service.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Studios Section Component
const StudiosSection: React.FC<{frameInSequence: number; fps: number}> = ({frameInSequence, fps}) => {
  const scaleProgress = frameInSequence / (fps * 4);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 28,
          color: '#8B5CF6',
          marginBottom: 40,
          fontWeight: 600,
        }}
      >
        State-of-the-Art Facilities
      </div>

      <div
        style={{
          display: 'flex',
          gap: 20,
          transform: `scale(${interpolate(scaleProgress, [0, 1], [0.9, 1])})`,
          opacity: interpolate(scaleProgress, [0, 0.3, 1], [0, 1, 1]),
        }}
      >
        {['Studio A', 'Studio B', 'Studio C'].map((studio, i) => (
          <div
            key={i}
            style={{
              width: 200,
              height: 150,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {studio}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 30,
          fontSize: 16,
          color: '#a5b4fc',
          maxWidth: 600,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Three full-service sound stages equipped with the latest technology for productions of any scale.
      </div>
    </AbsoluteFill>
  );
};

// Showcase Section Component
const ShowcaseSection: React.FC<{frameInSequence: number; fps: number}> = ({frameInSequence, fps}) => {
  const rotation = interpolate(frameInSequence, [0, fps * 4], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 28,
          color: '#8B5CF6',
          marginBottom: 30,
          fontWeight: 600,
        }}
      >
        Featured Productions
      </div>

      <div
        style={{
          display: 'flex',
          gap: 30,
          alignItems: 'center',
          transform: `rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {['Project Alpha', 'Beta Series', 'Gamma Film'].map((project, i) => (
          <div
            key={i}
            style={{
              width: 180,
              height: 120,
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              fontSize: 16,
              fontWeight: 600,
              transform: `rotateY(${i * 60}deg) translateZ(60px)`,
            }}
          >
            {project}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Call to Action Component
const CallToAction: React.FC<{frameInSequence: number; fps: number}> = ({frameInSequence, fps}) => {
  const pulse = spring({
    frame: frameInSequence,
    fps: fps,
    config: {mass: 1, damping: 10, stiffness: 100},
  });

  const textOpacity = spring({
    frame: frameInSequence,
    fps: fps,
    durationInFrames: fps * 2,
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 32,
          color: '#ffffff',
          marginBottom: 20,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        Ready to Create Something Extraordinary?
      </div>

      <div
        style={{
          padding: '20px 50px',
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          borderRadius: 50,
          fontSize: 24,
          fontWeight: 700,
          boxShadow: `0 0 ${30 * pulse}px rgba(139, 92, 246, 0.6)`,
          transform: `scale(${1 + 0.05 * pulse})`,
          cursor: 'pointer',
        }}
      >
        Get Started
      </div>

      <div
        style={{
          marginTop: 40,
          fontSize: 16,
          color: '#a5b4fc',
          textAlign: 'center',
        }}
      >
        <div style={{marginBottom: 8}}>www.qalastudios.com</div>
        <div>hello@qalastudios.com</div>
      </div>
    </AbsoluteFill>
  );
};

// Register composition
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QalaStudiosVideo"
        component={QalaStudiosVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
