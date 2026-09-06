/**
 * Studio Maskhara - Window Manager
 * Manages multiple floating draggable/scalable windows, z-index hierarchy, and state.
 */

import { DraggableWindow } from './DraggableWindow.js';

export class WindowManager {
  constructor() {
    this.windows = new Map();
    this.nextId = 1;
  }

  /**
   * Create and mount a new draggable/scalable window.
   * @param {Object} options
   * @returns {DraggableWindow}
   */
  createWindow(options = {}) {
    const id = `sm-win-${this.nextId++}`;
    const win = new DraggableWindow(options);
    win.id = id;
    this.windows.set(id, win);
    win.mount();
    return win;
  }

  getWindow(id) {
    return this.windows.get(id);
  }

  closeAll() {
    this.windows.forEach((win) => win.close());
    this.windows.clear();
  }
}

export const windowManager = new WindowManager();
