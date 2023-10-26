export class Rgba {
  public r = 0;
  public g = 0;
  public b = 0;
  public a = 0;

  public constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public toColor() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
}
