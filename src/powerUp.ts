import powerUpImage from "./images/powerups.png";
import { createImage } from "./utils";

type PowerUpType = "mushroom" | "flower";

const powerUpSprite = createImage(powerUpImage);
interface PowerUpProps {
  x: number;
  y: number;
  type: PowerUpType;
}
export class PowerUp {
  x: number;
  y: number;
  dx: number;
  dy: number;
  sX: number;
  sY: number;
  speed = 2;
  height = 32;
  width = 32;
  frames: number;
  type: PowerUpType;

  constructor(props: PowerUpProps) {
    this.x = props.x;
    this.y = props.y;
    this.sX = 0;
    this.sY = 0;
    this.dx = this.speed;
    this.dy = 0;
    this.height = 32;
    this.width = 32;
    this.type = props.type;
    this.frames = this.type === "mushroom" ? 0 : 1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(
      powerUpSprite,
      this.sX,
      this.sY,
      this.width,
      this.height,
      this.dx,
      this.dy,
      this.width,
      this.height
    );
  }

  update(): void {
    if (this.type === "flower") return;
    this.x += this.dx;
    this.y += this.dy;
  }
}
