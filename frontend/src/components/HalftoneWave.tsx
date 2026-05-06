import React, { useEffect, useRef } from 'react';

const HalftoneWave: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Handle Resize with Performance Scaling
    const resize = () => {
      // Use a slightly lower scale for performance on high-DPI screens if needed
      // but cap it to 1.5 to keep it sharp but fast
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    // Handle Mouse Interaction
    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      // Swapped for Dark Theme
      ctx.fillStyle = '#1A1A1A'; // Black Background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#DCC9A9'; // Cream Squares
      const spacing = 30; // Increased spacing = significantly fewer draw calls
      const rows = Math.ceil(window.innerHeight / spacing);
      const cols = Math.ceil(window.innerWidth / spacing);

      time += 0.03;

      // Pre-calculate wave factors to save CPU cycles
      const t1 = time;
      const t2 = time * 0.8;
      const t3 = time * 1.1;

      for (let i = 0; i < cols; i++) {
        const iOff = i * 0.1;
        const iOff2 = i * 0.08;
        const xBase = i * spacing + spacing / 2;

        for (let j = 0; j < rows; j++) {
          const yBase = j * spacing + spacing / 2;

          // 3. Optimized Multi-Wave Math
          const wave1 = Math.sin(iOff + t1);
          const wave2 = Math.cos(j * 0.12 + t2);
          const wave3 = Math.sin(iOff2 + j * 0.08 + t3);
          const waveEffect = (wave1 + wave2 + wave3) / 3;

          // 4. Subtle Mouse Interaction
          const dx = xBase - mouseX;
          const dy = yBase - mouseY;
          const distSq = dx * dx + dy * dy; // Use squared distance to avoid Math.sqrt

          let mouseEffect = 0;
          if (distSq < 90000) { // 300px * 300px
            const mouseEffectRaw = 1 - Math.sqrt(distSq) / 300;
            mouseEffect = mouseEffectRaw * mouseEffectRaw;
          }

          // 5. Final Size Calculation
          let size = 2 + (waveEffect * 4) + (mouseEffect * 3);
          size = size < 0.5 ? 0.5 : (size > spacing - 8 ? spacing - 8 : size);

          ctx.beginPath();
          ctx.rect(xBase - size / 2, yBase - size / 2, size, size);
          ctx.fill();
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Cleanup listeners and animation on component unmount
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    />
  );
};

export default HalftoneWave;
