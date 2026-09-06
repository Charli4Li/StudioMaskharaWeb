import { updateParticles } from './repel.js';

export class ParticleText {
  constructor(container, options = {}) {
    this.container = container;
    this.config = {
      text: 'MASKHARA',
      density: 14,
      pixelSize: 12,
      cornerRadius: 2.2,
      fontStretch: 1.18,
      char: '■',
      fontFamily: "'Archivo', sans-serif",
      fontWeight: '850',
      color: '#FF5A2A',
      repelRadius: 80,
      repelStrength: 4.4,
      returnSpeed: 0.052,
      damping: 0.82,
      renderMode: 'curved-square',
      glowColor: '#FF5A2A',
      glowSize: 16,
      ...options,
    };

    this.particles = [];
    this.cursor = { x: -9999, y: -9999, active: false };
    this.animId = null;
    this.isSleeping = false;
    this.dpr = window.devicePixelRatio || 1;

    this.initCanvas();
    this.attachEvents();
    this.build();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'particle-text-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
  }

  attachEvents() {
    this.updateCursorPosition = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      this.cursor.x = clientX - rect.left;
      this.cursor.y = clientY - rect.top;
      this.cursor.active = true;
      this.wakeUp();
    };

    this.onMouseMove = (e) => this.updateCursorPosition(e.clientX, e.clientY);

    this.onMouseLeave = () => {
      this.cursor.active = false;
      this.cursor.x = -9999;
      this.cursor.y = -9999;
    };

    this.onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        this.updateCursorPosition(t.clientX, t.clientY);
      }
    };

    this.onTouchEnd = () => this.onMouseLeave();

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    document.addEventListener('mouseleave', this.onMouseLeave);
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd);

    let resizeTimer = null;
    this.onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.build(), 120);
    };
    window.addEventListener('resize', this.onResize);
  }

  async build() {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    const wordmarkEl = this.container.closest('.wordmark') || this.container.parentElement;
    const parentRect = wordmarkEl ? wordmarkEl.getBoundingClientRect() : this.container.getBoundingClientRect();
    const containerWidth = Math.max(Math.round(parentRect.width), 320);

    const computedStyle = window.getComputedStyle(wordmarkEl || this.container);
    let fontSize = parseFloat(computedStyle.fontSize);
    if (isNaN(fontSize) || fontSize < 20) {
      fontSize = Math.min(Math.max(containerWidth * 0.16, 60), 220);
    }

    const testCtx = document.createElement('canvas').getContext('2d');
    testCtx.font = `${this.config.fontWeight} ${fontSize}px ${this.config.fontFamily}`;
    const measuredWidth = Math.ceil(testCtx.measureText(this.config.text).width * (this.config.fontStretch || 1.18));

    const padding = Math.max(this.config.repelRadius, 80);
    const canvasWidth = Math.max(measuredWidth, containerWidth) + padding * 2;
    const height = Math.ceil(fontSize * 1.05) + padding * 2;

    this.width = canvasWidth;
    this.height = height;
    this.padding = padding;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.round(canvasWidth * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.style.left = `-${padding}px`;
    this.canvas.style.top = `-${padding}px`;
    this.canvas.style.margin = '0';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    this.sampleParticles(canvasWidth, height, fontSize, padding);
    this.wakeUp();
  }

  sampleParticles(width, height, fontSize, padding) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    const fontStretch = this.config.fontStretch || 1.18;
    const fontStr = `${this.config.fontWeight} ${fontSize}px ${this.config.fontFamily}`;
    const textX = padding;
    const textY = padding;

    offCtx.fillStyle = '#ffffff';
    offCtx.font = fontStr;
    offCtx.textBaseline = 'top';
    offCtx.textAlign = 'left';
    offCtx.save();
    offCtx.translate(textX, textY);
    offCtx.scale(fontStretch, 1.0);
    offCtx.fillText(this.config.text, 0, 0);
    offCtx.restore();

    const imgData = offCtx.getImageData(0, 0, width, height).data;
    const rawPoints = [];
    const step = Math.max(Math.round(this.config.density), 4);
    const pSize = Math.max(Number(this.config.pixelSize) || 12, 2);

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (imgData[(y * width + x) * 4 + 3] > 75) rawPoints.push({ x, y });
      }
    }

    let capTop = textY;
    let baselineBottom = textY + Math.ceil(fontSize);

    try {
      const mW = Math.ceil(fontSize * fontStretch * 1.5) + 4;
      const mH = Math.ceil(fontSize * 1.5) + 4;
      const mCanvas = document.createElement('canvas');
      mCanvas.width = mW;
      mCanvas.height = mH;
      const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
      mCtx.fillStyle = '#ffffff';
      mCtx.font = fontStr;
      mCtx.textBaseline = 'top';
      mCtx.textAlign = 'left';
      mCtx.save();
      mCtx.scale(fontStretch, 1.0);
      mCtx.fillText('M', 0, 0);
      mCtx.restore();

      const mData = mCtx.getImageData(0, 0, mW, mH).data;
      let mTop = mH, mBottom = 0, found = false;
      for (let row = 0; row < mH; row++) {
        for (let col = 0; col < mW; col++) {
          if (mData[(row * mW + col) * 4 + 3] > 75) {
            if (row < mTop) mTop = row;
            if (row > mBottom) mBottom = row;
            found = true;
          }
        }
      }
      if (found) {
        capTop = textY + mTop;
        baselineBottom = textY + mBottom;
      }
    } catch (_) {
      if (rawPoints.length > 0) {
        capTop = Math.min(...rawPoints.map((pt) => pt.y));
        baselineBottom = Math.max(...rawPoints.map((pt) => pt.y));
      }
    }

    this.particles = rawPoints
      .filter((pt) => pt.y >= capTop && pt.y <= baselineBottom)
      .map((pt) => ({ x0: pt.x, y0: pt.y, x: pt.x, y: pt.y, vx: 0, vy: 0, size: pSize }));
  }

  wakeUp() {
    if (this.isSleeping) {
      this.isSleeping = false;
      this.tick();
    } else if (!this.animId) {
      this.tick();
    }
  }

  tick() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    updateParticles(this.particles, this.cursor, this.config);
    this.render();

    let isMoving = this.cursor.active;
    if (!isMoving) {
      const len = this.particles.length;
      for (let i = 0; i < len; i++) {
        const p = this.particles[i];
        if (Math.abs(p.vx) > 0.005 || Math.abs(p.vy) > 0.005 ||
            Math.abs(p.x - p.x0) > 0.02 || Math.abs(p.y - p.y0) > 0.02) {
          isMoving = true;
          break;
        }
      }
    }

    if (isMoving) {
      this.animId = requestAnimationFrame(() => this.tick());
    } else {
      const len = this.particles.length;
      for (let i = 0; i < len; i++) {
        const p = this.particles[i];
        p.x = p.x0; p.y = p.y0; p.vx = 0; p.vy = 0;
      }
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.render();
      this.isSleeping = true;
      this.animId = null;
    }
  }

  render() {
    const { renderMode, color, char, pixelSize, cornerRadius } = this.config;
    const len = this.particles.length;
    if (len === 0) return;

    this.ctx.fillStyle = color;

    if (renderMode === 'circle') {
      const r = pixelSize / 2;
      this.ctx.shadowColor = this.config.glowColor || color;
      this.ctx.shadowBlur = this.config.glowSize !== undefined ? this.config.glowSize : 16;
      this.ctx.beginPath();
      for (let i = 0; i < len; i++) {
        const p = this.particles[i];
        this.ctx.moveTo(p.x + r, p.y);
        this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      }
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      this.ctx.shadowColor = 'transparent';

    } else if (renderMode === 'unicode') {
      this.ctx.font = `${pixelSize}px 'Archivo', -apple-system, sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const unicodeChar = char || '●';
      for (let i = 0; i < len; i++) {
        this.ctx.fillText(unicodeChar, this.particles[i].x, this.particles[i].y);
      }

    } else {
      this.ctx.beginPath();
      const half = pixelSize / 2;
      const cr = Math.min(cornerRadius || 2.2, pixelSize * 0.25);
      if (typeof this.ctx.roundRect === 'function') {
        for (let i = 0; i < len; i++) {
          const p = this.particles[i];
          this.ctx.roundRect(p.x - half, p.y - half, pixelSize, pixelSize, cr);
        }
      } else {
        for (let i = 0; i < len; i++) {
          const p = this.particles[i];
          const l = p.x - half, t = p.y - half;
          this.ctx.moveTo(l + cr, t);
          this.ctx.arcTo(l + pixelSize, t, l + pixelSize, t + pixelSize, cr);
          this.ctx.arcTo(l + pixelSize, t + pixelSize, l, t + pixelSize, cr);
          this.ctx.arcTo(l, t + pixelSize, l, t, cr);
          this.ctx.arcTo(l, t, l + pixelSize, t, cr);
        }
      }
      this.ctx.fill();
    }
  }

  updateConfig(newConfig) {
    const prevDensity = this.config.density;
    const prevPixelSize = this.config.pixelSize;
    this.config = { ...this.config, ...newConfig };
    if (
      (newConfig.density !== undefined && newConfig.density !== prevDensity) ||
      (newConfig.pixelSize !== undefined && newConfig.pixelSize !== prevPixelSize) ||
      newConfig.text !== undefined ||
      newConfig.fontStretch !== undefined
    ) {
      const computedStyle = window.getComputedStyle(this.container);
      const fontSize = parseFloat(computedStyle.fontSize) || 120;
      this.sampleParticles(this.width, this.height, fontSize, this.padding || 80);
    }
    this.wakeUp();
  }

  destroy() {
    if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
    window.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseleave', this.onMouseLeave);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('resize', this.onResize);
    this.container.innerHTML = '';
  }
}

export function createParticleText(target, options = {}) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return null;
  return new ParticleText(container, options);
}
