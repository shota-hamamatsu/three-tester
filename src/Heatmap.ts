export type HeatmapGradient = { [key: number]: string };
export type HeatmapData = [x: number, y: number, value: number][];

const DEFAULT_GRADIEANT: HeatmapGradient = {
  0.4: "blue",
  0.6: "cyan",
  0.7: "lime",
  0.8: "yellow",
  1.0: "red",
};
const DEFAULT_RADIUS = 25;
const DEFAULT_MAX = 100;
const DEFAULT_BLUR = 15;

export class Heatmap {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D | null;
  private _max: number;
  private _radius?: number;
  private _gradient?: Uint8ClampedArray;
  private _data: HeatmapData = [];
  // サークルイメージ
  private _circle?: HTMLCanvasElement;

  constructor(max: number = DEFAULT_MAX) {
    this._canvas = document.createElement("canvas");
    this._ctx = this._canvas.getContext("2d");
    this._max = max;
  }

  public getCanvas() {
    return this._canvas;
  }

  public setData(data: HeatmapData) {
    this._data = data;
  }

  public setMax(max: number) {
    this._max = max;
  }

  public addData(data: HeatmapData) {
    this._data.push(...data);
  }

  public clearData() {
    this._data = [];
  }

  public resize(width: number, height: number) {
    this._canvas.width = width;
    this._canvas.height = height;
  }

  public setRadius(r: number, blur: number = DEFAULT_BLUR) {
    // create a grayscale blurred circle image that we'll use for drawing points
    const circle = (this._circle = document.createElement("canvas"));
    const ctx = circle.getContext("2d");
    if (!ctx) return;
    const r2 = (this._radius = r + blur);

    circle.width = circle.height = r2 * 2;

    ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
    ctx.shadowBlur = blur;
    ctx.shadowColor = "black";

    ctx.beginPath();
    ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }

  public setGradient(grad: HeatmapGradient) {
    // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;

    for (const i in grad) {
      gradient.addColorStop(+Number(i), grad[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);

    this._gradient = ctx.getImageData(0, 0, 1, 256).data;
  }

  public draw(minOpacity: number) {
    if (!this._ctx) return;
    if (!this._circle) this.setRadius(DEFAULT_RADIUS);
    if (!this._gradient) this.setGradient(DEFAULT_GRADIEANT);
    if (!this._circle || !this._radius || !this._gradient) return;

    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // draw a grayscale heatmap by putting a blurred circle at each data point
    for (let i = 0, len = this._data.length, p; i < len; i++) {
      p = this._data[i];
      this._ctx.globalAlpha = Math.min(
        Math.max(
          p[2] / this._max,
          minOpacity === undefined ? 0.05 : minOpacity
        ),
        1
      );
      this._ctx.drawImage(
        this._circle,
        p[0] - this._radius,
        p[1] - this._radius
      );
    }

    // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
    const colored = this._ctx.getImageData(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );
    this._colorize(colored.data, this._gradient);
    this._ctx.putImageData(colored, 0, 0);
  }

  public _colorize(pixels: Uint8ClampedArray, gradient: Uint8ClampedArray) {
    for (let i = 0, len = pixels.length, j; i < len; i += 4) {
      j = pixels[i + 3] * 4; // get gradient color from opacity value
      if (j) {
        pixels[i] = gradient[j];
        pixels[i + 1] = gradient[j + 1];
        pixels[i + 2] = gradient[j + 2];
      }
    }
  }
}
