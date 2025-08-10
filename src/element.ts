import { createImage } from "./utils";
import elements from "./images/elements.png";
interface ElementProps {
  x: number;
  y: number;
  type: number;
}

const elementImage = createImage(elements);
export class Element {
  x: number;
  y: number;
  sX: number;
  sY: number;
  height: 32;
  width: 32;
  type: number;

  constructor(props: ElementProps) {
    this.x = props.x;
    this.y = props.y;
    this.height = 32;
    this.width = 32;
    this.sY = 0;
    this.type = props.type;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.sX = (this.type - 1) * this.width;
    ctx.drawImage(
      elementImage,
      this.sX,
      this.sY,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
