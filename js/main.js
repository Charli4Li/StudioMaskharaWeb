import { createParticleText } from '../animations/index.js';
import { DraggableWindow, windowManager, ScalableText } from '../materials/index.js';
import { initMotion } from './motion.js';

export const PARTICLE_CONFIG = {
  text: 'MASKHARA',
  density: 9,
  pixelSize: 7,
  cornerRadius: 2.2,
  fontStretch: 1.18,
  char: '■',
  color: '#FF5A2A',
  repelRadius: 80,
  repelStrength: 4.4,
  returnSpeed: 0.10,
  damping: 0.82,
  renderMode: 'circle',
  glowColor: '#FF5A2A',
  glowSize: 16,
};

document.addEventListener('DOMContentLoaded', () => {
  initMotion();

  const particleContainer = document.getElementById('hara-particle-container');
  if (particleContainer) {
    const particleWordmark = createParticleText(particleContainer, PARTICLE_CONFIG);
    if (particleWordmark) {
      particleContainer.classList.add('initialized');
      window.maskharaParticles = particleWordmark;
    }
  }

  window.StudioMaterials = { DraggableWindow, windowManager, ScalableText };

  const yearElement = document.getElementById('current-year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();
});
