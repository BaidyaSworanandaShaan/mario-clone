import { createImage } from "./utils";
import marioImg from "./images/mario.png";
type MarioCategory = "small" | "big" | "super";

interface MarioProps {
  x: number;
  y: number;
}
const marioSprite = createImage(marioImg);

export class Mario {
  x: number;
  y: number;
  sX: number;
  sY: number;
  height: number;
  width: number;
  dx: number;
  dy: number;
  speed: 4;
  isJumping: boolean;
  isOnGround: boolean;
  isInVulnerable: boolean;
  frames: number;
  tick: number;
  maxTick: number;
  category: MarioCategory;

  constructor(props: MarioProps) {
    this.x = props.x;
    this.y = props.y;
    this.width = 32;
    this.height = 44;
    this.sX = 0;
    this.sY = 4;
    this.dx = 0;
    this.dy = 0;
    this.speed = 4;
    this.isInVulnerable = false;
    this.category = "small";
    this.isJumping = false;
    this.isOnGround = false;
    this.frames = 0;
    this.tick = 0;
    this.maxTick = 25;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    let roundedY = this.y | 0;

    this.sX = this.frames * this.width;

    ctx.drawImage(
      marioSprite, // The sprite image containing Mario
      this.sX, // X coordinate on the sprite to start cropping
      this.sY, // Y coordinate on the sprite to start cropping
      this.width, // Width of the sprite section to crop
      this.height, // Height of the sprite section to crop
      this.x, // X position on canvas where to draw
      roundedY, // Y position on canvas where to draw
      this.width, // Width to draw on canvas
      this.height // Height to draw on canvas
    );
  }
 updateSprite(): void {
  }
  update(): void {
    this.x += this.dx;
    this.y += this.dy;
  }
}
