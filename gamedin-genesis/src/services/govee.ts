// services/govee.ts
import type { PathColor } from '../types';

/**
 * Mocks setting the color of Govee lights.
 * In a real application, this would call the Govee API.
 * @param color The color corresponding to a chosen path.
 */
export const setLightColor = (color: PathColor) => {
  console.log(`%c[Govee Mock] Divine light sequence initiated. Setting color to ${color}.`, `color: ${color}; font-weight: bold;`);
};

/**
 * Mocks flashing the lights for confirmation.
 */
export const flashLights = () => {
  console.log('%c[Govee Mock] SOUL CONFIRMED. Flashing lights.', 'color: gold; font-weight: bold; text-decoration: underline;');
};
