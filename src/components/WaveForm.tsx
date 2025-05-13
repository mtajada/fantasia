import { useEffect, useRef } from "react";

interface WaveFormProps {
  isPlaying: boolean;
  color: string;
  intensity?: number;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

export const WaveForm = ({ isPlaying, color, intensity = 0.5 }: WaveFormProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth;
    const parentHeight = canvas.parentElement?.clientHeight || 300;

    canvas.width = parentWidth * dpr;
    canvas.height = parentHeight * dpr;
    canvas.style.width = `${parentWidth}px`;
    canvas.style.height = `${parentHeight}px`;

    ctx.scale(dpr, dpr);

    // Handle window resize
    const handleResize = () => {
      const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth;
      const parentHeight = canvas.parentElement?.clientHeight || 300;

      canvas.width = parentWidth * dpr;
      canvas.height = parentHeight * dpr;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${parentHeight}px`;

      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    const rgb = hexToRgb(color);

    // Number of particles
    const particleCount = 30;
    const particles: {
      x: number;
      y: number;
      radius: number;
      originalRadius: number;
      speed: number;
      angle: number;
      opacity: number;
      pulseSpeed: number;
    }[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const centerX = canvas.width / dpr / 2;
      const centerY = canvas.height / dpr / 2;

      // Create particles in circular pattern around center
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * (Math.min(centerX, centerY) * 0.6);

      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius: 5 + Math.random() * 20,
        originalRadius: 5 + Math.random() * 20,
        speed: 0.2 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.3,
        pulseSpeed: 0.01 + Math.random() * 0.03
      });
    }

    let phase = 0;

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear canvas with a subtle background
      ctx.fillStyle = rgb ?
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)` :
        'rgba(100, 100, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Update phase
      phase += isPlaying ? 0.02 : 0.005;

      // Center coordinates
      const centerX = canvas.width / dpr / 2;
      const centerY = canvas.height / dpr / 2;

      // Draw central pulsing circle
      const basePulse = isPlaying ?
        0.6 + Math.sin(phase * 2) * 0.2 * intensityRef.current :
        0.7 + Math.sin(phase) * 0.1;

      const mainRadius = Math.min(centerX, centerY) * 0.3 * basePulse;

      // Central glow
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, mainRadius * 2
      );

      if (rgb) {
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isPlaying ? 0.3 : 0.15})`);
        gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isPlaying ? 0.1 : 0.05})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      } else {
        gradient.addColorStop(0, `rgba(100, 100, 255, ${isPlaying ? 0.3 : 0.15})`);
        gradient.addColorStop(0.5, `rgba(100, 100, 255, ${isPlaying ? 0.1 : 0.05})`);
        gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, mainRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw main circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
      ctx.fillStyle = rgb ?
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isPlaying ? 0.4 : 0.2})` :
        `rgba(100, 100, 255, ${isPlaying ? 0.4 : 0.2})`;
      ctx.fill();

      // Draw and update particles
      particles.forEach((particle, index) => {
        // Create orbital movement
        if (isPlaying) {
          // More dynamic movement when playing
          particle.angle += particle.speed * 0.02;

          // Pulse radius based on audio intensity
          const pulseIntensity = intensityRef.current *
            (0.5 + 0.5 * Math.sin(phase * 3 + index * 0.2));

          particle.radius = particle.originalRadius *
            (0.8 + 0.4 * pulseIntensity * Math.sin(phase * particle.pulseSpeed * 10));

          // Dynamic opacity based on audio intensity
          particle.opacity = 0.2 + 0.3 * intensityRef.current * Math.sin(phase * 2 + index * 0.1);
        } else {
          // Slower, more subtle movement when paused
          particle.angle += particle.speed * 0.005;

          // Gentle pulsing when paused
          particle.radius = particle.originalRadius * (0.9 + 0.1 * Math.sin(phase + index * 0.1));
          particle.opacity = 0.1 + 0.1 * Math.sin(phase * 0.5 + index * 0.05);
        }

        // Calculate particle position based on orbital movement
        const orbitRadius = 20 + index % 3 * 40;
        const orbitX = centerX + Math.cos(particle.angle) * orbitRadius;
        const orbitY = centerY + Math.sin(particle.angle) * orbitRadius;

        // Add some wobble to the orbit
        const wobble = isPlaying ?
          Math.sin(phase * 2 + index) * 5 * intensityRef.current :
          Math.sin(phase + index) * 2;

        particle.x = orbitX + wobble * Math.cos(particle.angle * 2);
        particle.y = orbitY + wobble * Math.sin(particle.angle * 3);

        // Draw particle with gradient
        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );

        if (rgb) {
          particleGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`);
          particleGradient.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity * 0.5})`);
          particleGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        } else {
          particleGradient.addColorStop(0, `rgba(100, 100, 255, ${particle.opacity})`);
          particleGradient.addColorStop(0.6, `rgba(100, 100, 255, ${particle.opacity * 0.5})`);
          particleGradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();

        // Occasionally connect particles with lines when playing
        if (isPlaying && Math.random() > 0.97) {
          const nearestParticleIndex = (index + 1) % particles.length;
          const nearestParticle = particles[nearestParticleIndex];

          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(nearestParticle.x, nearestParticle.y);
          ctx.strokeStyle = rgb ?
            `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` :
            'rgba(100, 100, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};

export default WaveForm; 