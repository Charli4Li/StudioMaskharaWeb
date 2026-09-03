import { initMotion } from './motion.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Kinetic Motion
  initMotion();

  // Dynamic Year in Footer
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = currentYear;
  }
});
