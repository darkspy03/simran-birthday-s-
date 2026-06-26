class RomanticParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.fireworks = [];
    this.mouseParticles = [];
    this.mode = 'hearts'; // 'hearts' | 'stars' | 'snow' | 'bubbles' | 'confetti'
    this.trailEnabled = true;

    this.mouse = { x: null, y: null };

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();
    this.spawnBackgroundParticles();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (this.trailEnabled) {
        this.spawnTrailParticle(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mouse.x = touch.clientX;
        this.mouse.y = touch.clientY;
        if (this.trailEnabled) {
          this.spawnTrailParticle(touch.clientX, touch.clientY);
        }
      }
    }, { passive: true });
  }

  setMode(mode) {
    this.mode = mode;
    this.particles = [];
    this.spawnBackgroundParticles();
  }

  spawnBackgroundParticles() {
    const count = this.mode === 'stars' ? 120 : 60;
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const size = Math.random() * 12 + 6;
    const x = Math.random() * this.canvas.width;
    const y = randomY ? Math.random() * this.canvas.height : this.canvas.height + 20;

    let speedX = (Math.random() - 0.5) * 0.8;
    let speedY = -(Math.random() * 1.5 + 0.5);

    if (this.mode === 'snow') {
      speedX = (Math.random() - 0.2) * 1;
      speedY = Math.random() * 1.2 + 0.8;
    } else if (this.mode === 'stars') {
      speedX = 0;
      speedY = 0;
    } else if (this.mode === 'confetti') {
      speedX = (Math.random() - 0.5) * 2;
      speedY = Math.random() * 2 + 1.5;
    }

    const hue = this.mode === 'hearts' ? (Math.random() * 30 + 340) % 360 : Math.random() * 360;

    return {
      x,
      y,
      size,
      speedX,
      speedY,
      alpha: Math.random() * 0.5 + 0.3,
      decay: Math.random() * 0.002 + 0.001,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      hue,
      color: `hsla(${hue}, 95%, 70%, 1)`,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01
    };
  }

  spawnTrailParticle(x, y) {
    for (let i = 0; i < 2; i++) {
      this.mouseParticles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5 - 0.5,
        alpha: 1,
        decay: 0.02,
        hue: (Math.random() * 40 + 330) % 360 // pinks
      });
    }
  }

  triggerExplosion(x, y, count = 80) {
    // Sparkles or heart explosion
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const hue = (Math.random() * 60 + 330) % 360;
      this.fireworks.push({
        x,
        y,
        size: Math.random() * 6 + 3,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.01,
        hue,
        gravity: 0.05
      });
    }
  }

  drawHeart(ctx, x, y, width, height, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 45, 85, 0.4)';
    ctx.beginPath();
    const topCurveHeight = height * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    // Left curve
    ctx.bezierCurveTo(
      x - width / 2, y - topCurveHeight / 2,
      x - width, y + topCurveHeight,
      x, y + height
    );
    // Right curve
    ctx.bezierCurveTo(
      x + width, y + topCurveHeight,
      x + width / 2, y - topCurveHeight / 2,
      x, y + topCurveHeight
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawStar(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = size * 2;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawBubble(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  drawConfetti(ctx, x, y, size, alpha, p) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.translate(x, y);
    ctx.rotate(p.angle);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw and update background particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update positions
      if (this.mode === 'hearts') {
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.4;
        p.y += p.speedY;
        if (p.y < -p.size * 2) {
          this.particles[i] = this.createParticle();
        }
        this.drawHeart(this.ctx, p.x, p.y, p.size * 1.5, p.size * 1.5, p.alpha, p.color);
      } else if (this.mode === 'stars') {
        p.alpha += p.spin; // spin as alpha change speed here
        if (p.alpha <= 0.1 || p.alpha >= 0.9) {
          p.spin = -p.spin;
        }
        // Occasional shooting stars (re-use normal structure)
        if (Math.random() < 0.0005) {
          p.x = Math.random() * this.canvas.width;
          p.y = 0;
          p.speedX = Math.random() * 8 + 4;
          p.speedY = Math.random() * 4 + 2;
        }
        if (p.speedX > 0) {
          p.x += p.speedX;
          p.y += p.speedY;
          this.ctx.save();
          this.ctx.strokeStyle = `rgba(255,255,255,${p.alpha})`;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x - p.speedX * 3, p.y - p.speedY * 3);
          this.ctx.stroke();
          this.ctx.restore();
          if (p.x > this.canvas.width || p.y > this.canvas.height) {
            p.speedX = 0;
            p.speedY = 0;
            p.x = Math.random() * this.canvas.width;
            p.y = Math.random() * this.canvas.height;
          }
        } else {
          this.drawStar(this.ctx, p.x, p.y, p.size * 0.3, p.alpha);
        }
      } else if (this.mode === 'snow') {
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.5 + p.speedX;
        p.y += p.speedY;
        if (p.y > this.canvas.height + p.size) {
          this.particles[i] = this.createParticle();
          this.particles[i].y = -p.size;
        }
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else if (this.mode === 'bubbles') {
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.4;
        p.y += p.speedY;
        if (p.y < -p.size) {
          this.particles[i] = this.createParticle();
        }
        this.drawBubble(this.ctx, p.x, p.y, p.size, p.alpha);
      } else if (this.mode === 'confetti') {
        p.x += p.speedX;
        p.y += p.speedY;
        p.angle += p.spin;
        if (p.y > this.canvas.height + p.size) {
          this.particles[i] = this.createParticle();
          this.particles[i].y = -p.size;
        }
        this.drawConfetti(this.ctx, p.x, p.y, p.size, p.alpha, p);
      }
    }

    // 2. Update and draw cursor trail sparkles
    for (let i = 0; i < this.mouseParticles.length; i++) {
      const p = this.mouseParticles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.mouseParticles.splice(i, 1);
        i--;
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = `hsla(${p.hue}, 95%, 75%, ${p.alpha})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = `hsla(${p.hue}, 95%, 75%, 0.8)`;
      this.ctx.beginPath();
      // Draw tiny sparkle cross or diamond
      this.ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 3. Update and draw fireworks/explosions
    for (let i = 0; i < this.fireworks.length; i++) {
      const p = this.fireworks[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += p.gravity; // pull down
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.fireworks.splice(i, 1);
        i--;
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.8)`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}
window.RomanticParticles = RomanticParticles;
