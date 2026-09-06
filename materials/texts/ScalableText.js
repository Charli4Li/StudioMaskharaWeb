/**
 * Studio Maskhara - Moveable & Scalable Text Material
 * Provides a scalable and draggable typographic element supporting multiple materials,
 * dynamic scale factors, and interactive drag positioning.
 */

export class ScalableText {
  /**
   * @param {Object} options
   * @param {string} options.text - Text string to render
   * @param {string} options.material - 'solid' | 'orange' | 'stroke' | 'stroke-orange' | 'gradient' | 'dots' | 'glow'
   * @param {number} options.fontSize - Base font size in px (default: 64)
   * @param {number} options.scale - Initial scale multiplier (default: 1.0)
   * @param {number} options.x - Initial X position in px
   * @param {number} options.y - Initial Y position in px
   * @param {boolean} options.moveable - Whether the text can be dragged (default: true)
   * @param {boolean} options.scalable - Whether the text scales with mouse wheel / gestures (default: true)
   */
  constructor(options = {}) {
    this.options = {
      text: 'STUDIO MASKHARA',
      material: 'orange',
      fontSize: 64,
      scale: 1.0,
      minScale: 0.25,
      maxScale: 4.0,
      x: 0,
      y: 0,
      moveable: true,
      scalable: true,
      fontFamily: "'Archivo', sans-serif",
      fontWeight: '850',
      fontWidth: '118',
      ...options,
    };

    this.x = this.options.x;
    this.y = this.options.y;
    this.scale = this.options.scale;
    this.isDragging = false;

    this.createDOM();
    if (this.options.moveable) this.attachDragHandlers();
    if (this.options.scalable) this.attachScaleHandlers();
  }

  createDOM() {
    this.el = document.createElement('div');
    this.el.className = `sm-scalable-text sm-mat-${this.options.material}`;
    this.el.textContent = this.options.text;

    this.el.style.fontFamily = this.options.fontFamily;
    this.el.style.fontSize = `${this.options.fontSize}px`;
    this.el.style.fontVariationSettings = `'wght' ${this.options.fontWeight}, 'wdth' ${this.options.fontWidth}`;
    this.el.style.letterSpacing = '-0.01em';
    this.el.style.lineHeight = '0.9';

    this.updateTransform();
  }

  updateTransform() {
    this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale(${this.scale})`;
  }

  attachDragHandlers() {
    let startX = 0, startY = 0;
    let initialX = 0, initialY = 0;

    const onMouseDown = (e) => {
      this.isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = this.x;
      initialY = this.y;
      this.el.classList.add('selected');

      const onMouseMove = (moveEvent) => {
        if (!this.isDragging) return;
        this.x = initialX + (moveEvent.clientX - startX);
        this.y = initialY + (moveEvent.clientY - startY);
        this.updateTransform();
      };

      const onMouseUp = () => {
        this.isDragging = false;
        this.el.classList.remove('selected');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    this.el.addEventListener('mousedown', onMouseDown);
  }

  attachScaleHandlers() {
    this.el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.0015;
      this.setScale(this.scale + delta);
    }, { passive: false });
  }

  setScale(newScale) {
    this.scale = Math.min(this.options.maxScale, Math.max(this.options.minScale, newScale));
    this.updateTransform();
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.updateTransform();
  }

  setMaterial(materialName) {
    this.el.className = `sm-scalable-text sm-mat-${materialName}`;
  }

  setText(newText) {
    this.el.textContent = newText;
  }

  mount(parent = document.body) {
    parent.appendChild(this.el);
    return this;
  }

  destroy() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}
