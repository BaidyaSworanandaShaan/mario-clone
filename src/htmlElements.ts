export const mainMenuContainer = document.querySelector(
  ".main-screen-container"
) as HTMLElement;
export const menuScreenContainer = document.querySelector(
  ".menu-screen-container"
) as HTMLElement;
export const startGameBtn = document.querySelector(
  ".start-game-btn"
) as HTMLButtonElement;
export const scoreTextElement = document.createElement(
  "span"
) as HTMLSpanElement;
scoreTextElement.classList.add("score-text");
mainMenuContainer.appendChild(scoreTextElement);

export const coinTextElement = document.createElement(
  "span"
) as HTMLSpanElement;
coinTextElement.classList.add("coin-text");
mainMenuContainer.appendChild(coinTextElement);
