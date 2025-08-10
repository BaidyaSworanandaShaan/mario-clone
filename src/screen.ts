import { createImage } from "./utils";
import marioLogoSVG from "./images/mario-logo.svg";
import { mainMenuContainer, menuScreenContainer } from "./htmlElements";
export function showMenuScreen(): void {
  const marioLogo = createImage(marioLogoSVG);
  marioLogo.height = 300;
  menuScreenContainer.appendChild(marioLogo);
}
