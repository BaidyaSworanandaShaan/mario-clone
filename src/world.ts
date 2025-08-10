import { initCanvas } from "./canvas";
import { Coin } from "./coin";
import { tileSize } from "./constants";
import { Element } from "./element";
import { Goomba } from "./goombas";
import { Mario } from "./mario";
import type { PowerUp } from "./powerUp";
import { CANVAS_HEIGHT, CANVAS_WIDTH as viewPort, MAP } from "./base";
import { coinTextElement, scoreTextElement } from "./htmlElements";
import { getCollisionDirection, getTileMapIndex } from "./utils";
interface Keys {
  [key: string]: boolean;
}
const maxMapWidth = MAP[0].length * tileSize;

const gravity = 0.8;

const blocks = [2, 3, 4];
const flags = [5, 6];
const pipes = [7, 8, 9, 10];

export class World {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mario: Mario;
  elements: {
    [key: string]: Element[];
  };
  keys: Keys;
  score: number;
  goombas: Goomba[];
  powerUps: PowerUp[];
  coins: Coin[];
  coinCount: number;
  centerPos: number;
  scrollOffset: number;
  lastKey: "left" | "right";
  isGameActive: boolean;
  marioInGround: boolean;
  interval: number;
  marioDeadFromGoomba: boolean;
  levelComplete: boolean;
  gameAnimationFrame: number;
  constructor() {
    this.init();
  }
  init(): void {
    const { canvas, ctx } = initCanvas();
    this.canvas = canvas;
    this.ctx = ctx;
    this.keys = {};
    this.mario = new Mario({
      x: 50,
      y: 100,
    });
    this.score = 0;
    this.elements = {
      platforms: [],
      pipes: [],
      blocks: [],
      flags: [],
    };
    this.goombas = [];
    this.powerUps = [];
    this.coins = [];
    // this.bullets = [];
    this.centerPos = 0;
    this.lastKey = "right";
    this.coinCount = 0;
    this.scrollOffset = 0;
    this.setupEventListener();
    this.renderMap();
    this.isGameActive = true;
    this.levelComplete = false;
    this.marioDeadFromGoomba = false;
  }

  renderMap(): void {
    MAP.forEach((row, rIndex) => {
      row.forEach((col, cIndex) => {
        if (col === 0) return;

        // ( 1. Platform )
        if (col === 1) {
          this.elements["platforms"].push(
            new Element({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
              type: col,
            })
          );
        }

        // 2, 3, 4 ( Blocks )
        if (blocks.includes(col)) {
          this.elements["blocks"].push(
            new Element({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
              type: col,
            })
          );
        }

        // 5,6 (flagpole and flag)

        if (flags.includes(col)) {
          this.elements["flags"].push(
            new Element({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
              type: col,
            })
          );
        }

        // 7, 8, 9, 10 ( Pipes )
        if (pipes.includes(col)) {
          this.elements["pipes"].push(
            new Element({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
              type: col,
            })
          );
          return;
        } // 12 ( Goomba )
        if (col === 12) {
          this.goombas.push(
            new Goomba({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
            })
          );
        }
      });
    });
  }
  setupEventListener = () => {
    addEventListener("keydown", (e) => {
      if (e.code === "KeyA") {
        this.keys.left = true;
        this.lastKey = "left";

        return;
      }
      if (e.code === "KeyD") {
        this.keys.right = true;
        this.lastKey = "right";
        return;
      }
      if (
        e.code === "Space" &&
        !this.keys.space &&
        !this.mario.isJumping &&
        this.mario.isOnGround
      ) {
        this.keys.space = true;
        this.mario.dy -= 13;
      }
      if (e.code === "ControlLeft" && !this.keys.ctrl) {
        if (this.mario.category !== "super") return;

        this.keys.ctrl = true;
        //Add Bullets
      }
    });

    addEventListener("keyup", (e) => {
      if (e.code === "KeyA") {
        this.keys.left = false;
        return;
      }
      if (e.code === "KeyD") {
        this.keys.right = false;
        return;
      }
      if (e.code === "Space") {
        this.keys.space = false;
        return;
      }
      if (e.code === "ControlLeft") {
        this.keys.ctrl = false;
        return;
      }
    });
  };

  renderLoop = (): void => {
    this.ctx.clearRect(this.scrollOffset, 0, viewPort, this.canvas.height);

    for (const elem in this.elements) {
      const element = this.elements[elem];
      element.forEach((item) => {
        item.draw(this.ctx);
      });
    }
    this.coins.forEach((coins) => coins.draw(this.ctx));
    this.goombas.forEach((goomba) => goomba.draw(this.ctx));
    this.powerUps.forEach((powerUp) => powerUp.draw(this.ctx));
    this.mario.draw(this.ctx);
  };

  gameLoop = (): void => {
    this.centerPos = this.scrollOffset + Math.floor(viewPort / 2) - 120;
    this.mario.update();
    this.moveMario();
    this.goombas.forEach((goomba, gIndex) => {
      goomba.update();

      if (goomba.y > CANVAS_HEIGHT) {
        this.goombas.splice(gIndex, 1);
      }
    });

    this.powerUps.forEach((powerUp) => {
      powerUp.update();
      powerUp.dy += gravity;
    });
    //Remove coin if hit blocks
    this.coins.forEach((coin, cIndex) => {
      if (coin.y > coin.initialY) {
        this.coins.splice(cIndex, 1);
        return;
      }
      coin.update();
      coin.dy += gravity;
    });
    this.marioInGround = this.mario.isOnGround;

    if (this.mario.y + this.mario.height + this.mario.dy < CANVAS_HEIGHT) {
      this.mario.dy += gravity;
      this.mario.isOnGround = false;
    } else if (this.mario.y - 32 > CANVAS_HEIGHT) {
      this.isGameActive = false;

      clearInterval(this.interval);
      cancelAnimationFrame(this.gameAnimationFrame);

      setTimeout(this.restart, 2500);
    }
  };

  restart = (): void => {
    this.init();
    this.animate();
    this.startGameUpdateInterval();
  };

  moveMario = (): void => {
    if (this.keys.left && this.keys.right) {
      this.mario.dx = 0;
      return;
    }

    if (this.keys.left && this.mario.x > this.scrollOffset) {
      this.mario.dx = -this.mario.speed;
      return;
    }

    // MarioPos < centerPos
    if (this.keys.right && this.mario.x < this.centerPos) {
      this.mario.dx = this.mario.speed;
      return;
    }

    this.mario.dx = 0;

    // MarioPos >= centerPos
    if (this.keys.right) {
      if (this.mario.x >= maxMapWidth - 75) return;

      if (this.mario.x < maxMapWidth - viewPort / 2 - 160) {
        this.scrollOffset += this.mario.speed;
        this.ctx.translate(-this.mario.speed, 0);
        return;
      }
      if (this.mario.x > maxMapWidth - this.centerPos) {
        this.mario.dx = this.mario.speed;
        return;
      }
    }

    return;
  };
  updateAndRenderScoreAndCoin = (): void => {
    this.score = Math.max(this.score, this.mario.x - 50);
    scoreTextElement.textContent = `Score: ${this.score}`;
    coinTextElement.textContent = `Coins: ${this.coinCount}`;
  };

  checkMarioPlatformCollision = (): void => {
    const { platforms } = this.elements;

    platforms.forEach((platform) => {
      if (
        this.mario.x + this.mario.width > platform.x &&
        this.mario.x < platform.x + platform.width &&
        this.mario.y + this.mario.height + this.mario.dy >= platform.y
      ) {
        this.mario.isJumping = false;
        this.mario.isOnGround = true;
        this.mario.dy = 0;
      }
    });
  };
  checkMarioElementCollision = (elementArray: Element[]): void => {
    elementArray.forEach((element) => {
      const dir = getCollisionDirection(this.mario, element);

      if (!dir) return;
      const { left, right, top, bottom, offset } = dir;
      console.log(dir);

      if (top) {
        if (blocks.includes(element.type)) {
          this.mario.y += offset * 1.2;
          this.mario.dy = -this.mario.dy;

          if (element.type === 4) return;

          if (element.type === 2) {
            const { row, column } = getTileMapIndex(element);

            this.coins.push(
              new Coin({
                x: column * tileSize,
                y: row * tileSize - 2,
              })
            );
            this.coinCount++;
            this.score += 10;
          }
          element.type = 4;
        }
      }
      if (right) {
        this.mario.x -= offset;
        if (this.lastKey === "right") this.mario.dx = 0;
        return;
      }

      if (left) {
        this.mario.y += offset;
        if (this.lastKey === "left") this.mario.dx = 0;
        return;
      }
      if (bottom) {
        if (element.type === 7 || element.type === 8) return;
        this.mario.isJumping = false;
        this.mario.isOnGround = true;
        this.mario.y -= offset;
        this.mario.dy = 0;
        return;
      }
    });
  };
  checkGoombaElementCollision = (elementArray: Element[]): void => {
    elementArray.forEach((element) => {
      this.goombas.forEach((goomba) => {
        if (goomba.state === "dead" || goomba.state === "deadFromBullet")
          return;
        const dir = getCollisionDirection(goomba, element);
        if (!dir) return;

        if (dir.left || dir.right) {
          goomba.dx = -goomba.dx;
          return;
        }
      });
    });
  };
  checkMarioGoombaCollision = (): void => {
    this.goombas.forEach((goomba, index) => {
      if (goomba.state === "dead" || goomba.state === "deadFromBullet") return;
      if (this.mario.isInVulnerable) return;

      let dir = getCollisionDirection(this.mario, goomba);

      if (!dir) return;
      const { left, right, top, bottom, offset } = dir;

      if (bottom) {
        goomba.state = "dead";
        this.mario.dy = -8;
        this.score += 80;
        setTimeout(() => {
          this.goombas.splice(index, 1);
        }, 800);
        return;
      }

      if ((left || right) && offset > 4) {
        if (this.mario.category === "small") {
          this.mario.frames = 13;
          this.marioDeadFromGoomba = true;
          this.isGameActive = false;
          clearInterval(this.interval);
          cancelAnimationFrame(this.gameAnimationFrame);
          this.isGameActive = false;

          setTimeout(this.restart, 2500);
        }
      }
    });
  };

  checkMarioFlagCollision = (): void => {
    const { flags } = this.elements;
    flags.forEach((flag) => {
      const dir = getCollisionDirection(this.mario, flag);
      if (!dir) return;

      const { left, right } = dir;

      this.levelComplete = true;
      this.mario.dx = 0;
      this.mario.dy = 2;
      if (left) {
        this.mario.frames = 10;
      }

      if (right) {
        this.mario.frames = 11;
      }
      if (this.marioInGround) {
        this.mario.tick++;

        if (this.mario.tick > this.mario.maxTick) {
          this.mario.x += 10;
          this.mario.frames = 12;
          this.isGameActive = false;

          setTimeout(() => cancelAnimationFrame(this.gameAnimationFrame), 100);
        }
      }
    });
  };
  startGameUpdateInterval = (): void => {
    this.interval = setInterval(() => {
      this.gameLoop();
      this.updateAndRenderScoreAndCoin();
      this.checkMarioPlatformCollision();

      this.checkMarioElementCollision(this.elements["pipes"]);
      this.checkMarioElementCollision(this.elements["blocks"]);

      this.checkGoombaElementCollision(this.elements["pipes"]);
      this.checkMarioGoombaCollision();

      this.checkMarioFlagCollision();
    }, 15);
  };
  animate = (): void => {
    this.gameAnimationFrame = requestAnimationFrame(this.animate);
    this.renderLoop();
  };
}
