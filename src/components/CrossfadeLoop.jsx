import { useRef, useState, useEffect } from "react";

const CrossfadeLoop = ({ src, transitionDuration = 1000, containerClassName, containerStyle }) => {
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const canvasRef = useRef(null);
  const trackersRef = useRef([]);
  
  // Track which video is currently the "main" visible one
  const [activePlayer, setActivePlayer] = useState(1);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [brightness, setBrightness] = useState(1);
  const [terms, setTerms] = useState([]);
  const isTransitioning = useRef(false);

  // Load terms
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'PsychTermsForTracker.txt')
      .then(r => r.text())
      .then(text => {
        setTerms(text.split('\n').map(l => l.trim()).filter(l => l));
      })
      .catch(e => console.error("Failed to load terms", e));
  }, []);

  // Initialize trackers
  useEffect(() => {
    if (trackersRef.current.length === 0) {
      for (let i = 0; i < 8; i++) {
        trackersRef.current.push({
          x: Math.random(), // Normalized 0-1
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.001,
          vy: (Math.random() - 0.5) * 0.001,
          id: Math.floor(Math.random() * 9999).toString(16).toUpperCase(),
          state: 'SCANNING',
          life: Math.random() * 180,
          maxLife: 160 + Math.random() * 40
        });
      }
    }
  }, []);

  useEffect(() => {
    // Initial setup: Play the first video
    if (videoRef1.current) {
      videoRef1.current.play().catch(e => console.log("Autoplay prevented", e));
    }
  }, []);

  // Canvas Animation Loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    const render = () => {
      const video = activePlayer === 1 ? videoRef1.current : videoRef2.current;

      if (video && video.readyState >= 2) {
        const { width, height } = canvas.getBoundingClientRect();

        // Resize canvas to match display size
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.clearRect(0, 0, width, height);

        // 1. Draw Grid Points (simplified - no UV mapping needed)
        const gridSize = 60;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        
        for (let x = gridSize/2; x < width; x += gridSize) {
            for (let y = gridSize/2; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 2. Update and Draw Trackers
        trackersRef.current.forEach(tracker => {
            // Update position
            tracker.x += tracker.vx;
            tracker.y += tracker.vy;
            tracker.life = (tracker.life || 0) + 1;

            // Respawn logic (no bounce)
            const isOutOfBounds = tracker.x < 0 || tracker.x > 1 || tracker.y < 0 || tracker.y > 1;
            const isDead = tracker.life > (tracker.maxLife || 180);

            if (isOutOfBounds || isDead) {
                tracker.x = 0.1 + Math.random() * 0.8;
                tracker.y = 0.1 + Math.random() * 0.8;
                tracker.vx = (Math.random() - 0.5) * 0.001;
                tracker.vy = (Math.random() - 0.5) * 0.001;
                tracker.life = 0;
                tracker.maxLife = 160 + Math.random() * 40;
                tracker.id = terms[Math.floor(Math.random() * terms.length)] || 'SCANNING';
                tracker.state = 'SCANNING';
            } else if (tracker.life > 40) {
                tracker.state = 'LOCKED';
            }

            const sx = tracker.x * width;
            const sy = tracker.y * height;
            
            // Set shadow for trackers and text
            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Draw Bracket
            const size = 25; // Increased by another 10% (was 23)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Top Left
            ctx.moveTo(sx - size, sy - size + 10);
            ctx.lineTo(sx - size, sy - size);
            ctx.lineTo(sx - size + 10, sy - size);
            // Top Right
            ctx.moveTo(sx + size - 10, sy - size);
            ctx.lineTo(sx + size, sy - size);
            ctx.lineTo(sx + size, sy - size + 10);
            // Bottom Left
            ctx.moveTo(sx - size, sy + size - 10);
            ctx.lineTo(sx - size, sy + size);
            ctx.lineTo(sx - size + 10, sy + size);
            // Bottom Right
            ctx.moveTo(sx + size - 10, sy + size);
            ctx.lineTo(sx + size, sy + size);
            ctx.lineTo(sx + size, sy + size - 10);
            ctx.stroke();

            // Draw Center Cross
            ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx - 5, sy);
            ctx.lineTo(sx + 5, sy);
            ctx.moveTo(sx, sy - 5);
            ctx.lineTo(sx, sy + 5);
            ctx.stroke();

            // Draw Data Text
            ctx.font = '15px monospace'; 
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fillText(tracker.id, sx + size + 5, sy - 5);
            ctx.fillText(`POS: ${Math.floor(sx)},${Math.floor(sy)}`, sx + size + 5, sy + 12);
            ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
            ctx.fillText(tracker.state, sx + size + 5, sy + 29);
        });

        // 3. Draw Connections (Plexus effect)
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';

        const trackers = trackersRef.current;
        for (let i = 0; i < trackers.length; i++) {
            const t1 = trackers[i];
            let nearestDist = Infinity;
            let nearest = null;

            for (let j = 0; j < trackers.length; j++) {
                if (i === j) continue;
                const t2 = trackers[j];
                const dx = (t1.x - t2.x) * width;
                const dy = (t1.y - t2.y) * height;
                const distSq = dx * dx + dy * dy;

                if (distSq < nearestDist) {
                    nearestDist = distSq;
                    nearest = t2;
                }
            }

            if (nearest) {
                ctx.beginPath();
                ctx.moveTo(t1.x * width, t1.y * height);
                ctx.lineTo(nearest.x * width, nearest.y * height);
                ctx.stroke();
            }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [activePlayer, terms]);

  const handleTimeUpdate = (e) => {
    const currentVideo = e.target;
    const duration = currentVideo.duration;
    const currentTime = currentVideo.currentTime;
    
    if (!duration) return;

    // Calculate the trigger point (duration minus transition time in seconds)
    const transitionPoint = duration - (transitionDuration / 1145);

    // If we reach the transition point and aren't already swapping...
    if (currentTime >= transitionPoint && !isTransitioning.current) {
      isTransitioning.current = true;
      
      // determine which player is next
      const nextPlayer = activePlayer === 1 ? videoRef2 : videoRef1;
      const nextId = activePlayer === 1 ? 2 : 1;

      // 1. Reset and play the background video
      if (nextPlayer.current) {
        nextPlayer.current.currentTime = 0;
        nextPlayer.current.play().catch(e => console.log("Play error", e));
      }

      // 2. Trigger the React state change to swap opacity
      setActivePlayer(nextId);

      // Flash effect & Brightness
      setFlashOpacity(0.25);
      setBrightness(2.0);
      setTimeout(() => {
        setFlashOpacity(0);
        setBrightness(1);
      }, transitionDuration / 2);

      // 3. Reset the flag after the transition finishes so we can do it again
      setTimeout(() => {
        isTransitioning.current = false;
        // Optional: Pause the hidden video to save resources
        currentVideo.pause(); 
      }, transitionDuration);
    }
  };

  return (
    <div className={containerClassName} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...containerStyle }}>
      {/* Video Player 1 */}
      <video
        ref={videoRef1}
        src={src}
        muted
        playsInline
        onTimeUpdate={activePlayer === 1 ? handleTimeUpdate : null}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: activePlayer === 1 ? 1 : 0,
          filter: `brightness(${brightness})`,
          transition: `opacity ${transitionDuration}ms ease-in-out, filter ${transitionDuration / 2}ms ease-in-out`,
          zIndex: activePlayer === 1 ? 2 : 1, // Ensure active is on top
        }}
      />

      {/* Video Player 2 */}
      <video
        ref={videoRef2}
        src={src}
        muted
        playsInline
        onTimeUpdate={activePlayer === 2 ? handleTimeUpdate : null}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: activePlayer === 2 ? 1 : 0,
          filter: `brightness(${brightness})`,
          transition: `opacity ${transitionDuration}ms ease-in-out, filter ${transitionDuration / 2}ms ease-in-out`,
          zIndex: activePlayer === 2 ? 2 : 1,
        }}
      />

      {/* Tech Overlay Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Flash Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#fc6f56",
          opacity: flashOpacity,
          pointerEvents: "none",
          zIndex: 10,
          transition: `opacity ${transitionDuration / 2}ms ease-in-out`,
        }}
      />
    </div>
  );
};

export default CrossfadeLoop;
