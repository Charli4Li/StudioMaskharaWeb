export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function springForce(current, target, stiffness = 0.08) {
  return (target - current) * stiffness;
}

export function applyDamping(velocity, damping = 0.88) {
  return velocity * damping;
}

export function vectorAngle(fromX, fromY, toX, toY) {
  return Math.atan2(toY - fromY, toX - fromX);
}
