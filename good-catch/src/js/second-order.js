// Second-order dynamics (t3ssel8r) - a general-purpose replacement for naive
// lerp smoothing. Three intuitive parameters instead of a hand-tuned easing
// curve: f (frequency - how fast it reacts), z (damping - z<1 bouncy, z=1
// critically damped, z>1 sluggish), r (response - r<0 anticipates/dips back
// before moving forward, r=0 smooth start, r>1 overshoots immediately).
export class SecondOrderDynamics {
  constructor(f, z, r, initial = 0) {
    this.k1 = z / (Math.PI * f)
    this.k2 = 1 / ((2 * Math.PI * f) ** 2)
    this.k3 = (r * z) / (2 * Math.PI * f)
    this.xp = initial
    this.y = initial
    this.yd = 0
  }

  update(dt, x) {
    const xd = (x - this.xp) / dt
    this.xp = x
    const k2Stable = Math.max(this.k2, (dt * dt) / 2 + (dt * this.k1) / 2, dt * this.k1)
    this.y = this.y + dt * this.yd
    this.yd = this.yd + (dt * (x + this.k3 * xd - this.y - this.k1 * this.yd)) / k2Stable
    return this.y
  }
}
