import {
  mainMenuContainer,
  menuScreenContainer,
  startGameBtn,
} from "./htmlElements";
import { showMenuScreen } from "./screen";
import { World } from "./world";

showMenuScreen();
startGameBtn.addEventListener("click", () => {
  menuScreenContainer.style.display = "none";
  mainMenuContainer.style.display = "block";

  const world = new World();
  world.animate();
  world.startGameUpdateInterval();
});
