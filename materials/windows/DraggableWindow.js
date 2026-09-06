/**
 * Studio Maskhara - Moveable & Scalable Window Material
 * A robust floating window component that can be dragged, scaled (resized),
 * minimized, maximized, and stacked.
 */

export class DraggableWindow {
  /**
   * @param {Object} options
   * @param {string} options.title - Window header title
   * @param {string|HTMLElement} options.content - HTML string or element for window body
   * @param {number} options.x - Initial X position
   * @param {number} options.y - Initial Y position
   * @param {number} options.width - Initial width
   * @param {number} options.height - Initial height
   * @param {number} options.minWidth - Minimum allowed width
   * @param {number} options.minHeight - Minimum allowed height
   */
  constructor(options = {}) {
    this.options = {
      title: 'Studio Window',
      content: '',
      x: 120,
      y: 120,
      width: 380,
      height: 260,
      minWidth: 260,
      minHeight: 160,
      maxWidth: window.innerWidth * 0.9,
      maxHeight: window.innerHeight * 0.9,
      ...options,
    };

    this.x = this.options.x;
    this.y = this.options.y;
    this.width = this.options.width;
    this.height = this.options.height;
    this.isMinimized = false;
    this.isMaximized = false;
    this.prevBounds = null;

    this.createDOM();
    this.attachDragHandlers();
    this.attachResizeHandlers();
  }

  createDOM() {
    this.el = document.createElement('div');
    this.el.className = 'sm-window';
    this.updatePositionAndSize();

    // Header
    const header = document.createElement('div');
    header.className = 'sm-window-header';

    const titleEl = document.createElement('div');
    titleEl.className = 'sm-window-title';
    titleEl.innerHTML = `<span>${this.options.title}</span>`;

    const controls = document.createElement('div');
    controls.className = 'sm-window-controls';

    const minBtn = document.createElement('button');
    minBtn.className = 'sm-win-btn minimize';
    minBtn.title = 'Minimize';
    minBtn.onclick = (e) => { e.stopPropagation(); this.toggleMinimize(); };

    const maxBtn = document.createElement('button');
    maxBtn.className = 'sm-win-btn maximize';
    maxBtn.title = 'Maximize';
    maxBtn.onclick = (e) => { e.stopPropagation(); this.toggleMaximize(); };

    const closeBtn = document.createElement('button');
    closeBtn.className = 'sm-win-btn close';
    closeBtn.title = 'Close';
    closeBtn.onclick = (e) => { e.stopPropagation(); this.close(); };

    controls.appendChild(minBtn);
    controls.appendChild(maxBtn);
    controls.appendChild(closeBtn);

    header.appendChild(titleEl);
    header.appendChild(controls);
    this.header = header;

    // Body
    this.body = document.createElement('div');
    this.body.className = 'sm-window-body';
    if (typeof this.options.content === 'string') {
      this.body.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      this.body.appendChild(this.options.content);
    }

    this.el.appendChild(header);
    this.el.appendChild(this.body);

    // Resize Handles
    const handles = ['n', 's', 'e', 'w', 'nw', 'ne', 'se', 'sw'];
    handles.forEach((dir) => {
      const handle = document.createElement('div');
      handle.className = `sm-resize-handle sm-resize-${dir}`;
      handle.dataset.dir = dir;
      this.el.appendChild(handle);
    });

    // Bring to front on click
    this.el.addEventListener('mousedown', () => this.bringToFront());
  }

  updatePositionAndSize() {
    this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    this.el.style.width = `${this.width}px`;
    this.el.style.height = `${this.height}px`;
  }

  bringToFront() {
    const allWindows = document.querySelectorAll('.sm-window');
    let maxZ = 100;
    allWindows.forEach((win) => {
      win.classList.remove('active');
      const z = parseInt(window.getComputedStyle(win).zIndex, 10);
      if (!isNaN(z) && z > maxZ) maxZ = z;
    });
    this.el.style.zIndex = maxZ + 1;
    this.el.classList.add('active');
  }

  attachDragHandlers() {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const onMouseDown = (e) => {
      if (e.target.closest('.sm-window-controls')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = this.x;
      initialY = this.y;
      this.bringToFront();

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      this.x = Math.max(0, Math.min(window.innerWidth - this.width, initialX + dx));
      this.y = Math.max(0, Math.min(window.innerHeight - 42, initialY + dy));
      this.updatePositionAndSize();
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    this.header.addEventListener('mousedown', onMouseDown);
  }

  attachResizeHandlers() {
    let isResizing = false;
    let currentDir = '';
    let startX = 0, startY = 0;
    let startW = 0, startH = 0;
    let startPosX = 0, startPosY = 0;

    const onMouseDown = (e) => {
      const handle = e.target.closest('.sm-resize-handle');
      if (!handle || this.isMinimized) return;

      isResizing = true;
      currentDir = handle.dataset.dir;
      startX = e.clientX;
      startY = e.clientY;
      startW = this.width;
      startH = this.height;
      startPosX = this.x;
      startPosY = this.y;
      this.bringToFront();

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const { minWidth, minHeight, maxWidth, maxHeight } = this.options;

      if (currentDir.includes('e')) {
        this.width = Math.min(maxWidth, Math.max(minWidth, startW + dx));
      }
      if (currentDir.includes('s')) {
        this.height = Math.min(maxHeight, Math.max(minHeight, startH + dy));
      }
      if (currentDir.includes('w')) {
        const nextW = Math.min(maxWidth, Math.max(minWidth, startW - dx));
        if (nextW !== minWidth) {
          this.x = startPosX + dx;
        }
        this.width = nextW;
      }
      if (currentDir.includes('n')) {
        const nextH = Math.min(maxHeight, Math.max(minHeight, startH - dy));
        if (nextH !== minHeight) {
          this.y = startPosY + dy;
        }
        this.height = nextH;
      }

      this.updatePositionAndSize();
    };

    const onMouseUp = () => {
      isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    this.el.addEventListener('mousedown', onMouseDown);
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.el.classList.toggle('minimized', this.isMinimized);
  }

  toggleMaximize() {
    if (!this.isMaximized) {
      this.prevBounds = { x: this.x, y: this.y, width: this.width, height: this.height };
      this.x = 10;
      this.y = 10;
      this.width = window.innerWidth - 20;
      this.height = window.innerHeight - 20;
      this.isMaximized = true;
    } else if (this.prevBounds) {
      this.x = this.prevBounds.x;
      this.y = this.prevBounds.y;
      this.width = this.prevBounds.width;
      this.height = this.prevBounds.height;
      this.isMaximized = false;
    }
    this.updatePositionAndSize();
  }

  setContent(htmlOrElement) {
    if (typeof htmlOrElement === 'string') {
      this.body.innerHTML = htmlOrElement;
    } else if (htmlOrElement instanceof HTMLElement) {
      this.body.innerHTML = '';
      this.body.appendChild(htmlOrElement);
    }
  }

  mount(parent = document.body) {
    parent.appendChild(this.el);
    this.bringToFront();
    return this;
  }

  close() {
    this.el.style.opacity = '0';
    this.el.style.transform += ' scale(0.95)';
    this.el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    setTimeout(() => {
      this.destroy();
    }, 200);
  }

  destroy() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}
