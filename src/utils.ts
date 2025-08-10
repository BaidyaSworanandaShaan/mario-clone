import { tileSize } from "./constants";

export function createImage(src: string): HTMLImageElement {
  const image = new Image();
  image.src = src;
  return image;
}

interface GameElement {
  height: number;
  width: number;
  x: number;
  y: number;
}

export function getCollisionDirection(
  elementA: GameElement,
  elementB: GameElement
) {
  if (
    elementA.x + elementA.width >= elementB.x &&
    elementA.x <= elementB.x + elementB.width &&
    elementA.y + elementA.height >= elementB.y &&
    elementA.y <= elementB.y + elementB.height
  ) {
    const topDiff = elementB.y + elementB.height - elementA.y;
    const bottomDiff = elementA.y + elementA.height - elementB.y;
    const leftDiff = elementB.x + elementB.width - elementA.x;
    const rightDiff = elementA.x + elementA.width - elementB.x;
    const offset = Math.min(bottomDiff, topDiff, leftDiff, rightDiff);
    if (bottomDiff === offset) return { bottom: true, offset };
    if (topDiff === offset) return { top: true, offset };
    if (leftDiff === offset) return { left: true, offset };
    if (rightDiff === offset) return { right: true, offset };
  }
  return null;
}
export function getTileMapIndex(element: GameElement) {
  return { row: element.y / tileSize, column: element.x / tileSize };
}
