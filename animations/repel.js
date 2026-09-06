export function applyCursorRepulsion(p, cursor, config) {
  const {
    repelRadius = 120,
    repelStrength = 9.4,
    returnSpeed = 0.10,
    damping = 0.07,
  } = config;

  if (cursor.active) {
    const dx = p.x - cursor.x;
    const dy = p.y - cursor.y;

    if (Math.abs(dx) < repelRadius && Math.abs(dy) < repelRadius) {
      const distSq = dx * dx + dy * dy;
      const radiusSq = repelRadius * repelRadius;

      if (distSq < radiusSq && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const proximity = 1 - (dist / repelRadius);
        const easeFactor = proximity * proximity * (3 - 2 * proximity);
        const force = easeFactor * repelStrength;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }
  }

  p.vx *= damping;
  p.vy *= damping;
  p.x += p.vx;
  p.y += p.vy;
  p.x += (p.x0 - p.x) * returnSpeed;
  p.y += (p.y0 - p.y) * returnSpeed;
}

export function updateParticles(particles, cursor, config) {
  const len = particles.length;
  for (let i = 0; i < len; i++) {
    applyCursorRepulsion(particles[i], cursor, config);
  }
}
