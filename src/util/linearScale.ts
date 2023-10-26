/**
 * Utility class that applies a linear mapping function from an input range
 * [x1, x2] to an output range [y1, y2]. This class is pattern after D3 Scale.
 */
export class LinearScale {
  private clamp: boolean;
  private domain: [number, number];
  private range: [number, number];
  public constructor({
    clamp,
    domain,
    range,
  }: {
    clamp: boolean;
    domain: [number, number];
    range: [number, number];
  }) {
    if (domain[0] === domain[1]) {
      throw new Error(`Empty domain interval [${domain[0]}, ${domain[1]}]`);
    }
    this.clamp = clamp;
    this.domain = domain;
    this.range = range;
  }

  public get(n: number) {
    const [d0, d1] = this.domain;
    const [r0, r1] = this.range;
    const clamped = this.clamp ? Math.max(d0, Math.min(d1, n)) : n;
    const normalized = (clamped - d0) / (d1 - d0);
    const denormalized = r0 + normalized * (r1 - r0);
    return denormalized;
  }
}
