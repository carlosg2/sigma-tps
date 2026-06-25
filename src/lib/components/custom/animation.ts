import type { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { easeEmphasized } from "./easing";

/**
 * Animation utilities with full support for modern CSS color spaces
 * 
 * Features:
 * - OKLCH color space support (primary color system)
 * - RGB, HSL, Hex color support  
 * - CSS variable resolution
 * - Robust error handling
 * - Improved color interpolation
 */

export const parseSize = (size: string): number => {
  if (!size || size === 'none' || size === '0') return 0;
  
  // Manejar valores en px
  if (size.endsWith("px")) {
    return parseFloat(size.slice(0, -2)) || 0;
  }
  
  // Manejar valores en rem
  if (size.endsWith("rem")) {
    return (parseFloat(size.slice(0, -3)) || 0) * 16;
  }
  
  // Manejar valores en em (asumiendo 16px base)
  if (size.endsWith("em")) {
    return (parseFloat(size.slice(0, -2)) || 0) * 16;
  }
  
  // Manejar porcentajes (retornar como valor relativo)
  if (size.endsWith("%")) {
    return parseFloat(size.slice(0, -1)) || 0;
  }
  
  // Manejar valores numéricos puros
  const numValue = parseFloat(size);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  // Para variables CSS o valores complejos, retornar 0
  return 0;
};

interface transitionOptions {
  delay?: number;
  duration?: number;
  easing?: typeof cubicOut;
}
interface containerOptions {
  fallback?: (
    node: Element,
    params: transitionOptions & containerOptions & containerParamOptions,
    intro: boolean,
  ) => TransitionConfig;
  bgContainerZ?: number;
  fgContainerZ?: number;
}
interface containerParamOptions {
  key: string;
}
type ClientRectMap = Map<string, { rect: DOMRect; node: Element }>;

// Conversiones sRGB (0-255) <-> OKLab para interpolar de forma perceptualmente uniforme.
const srgbToLinear = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const linearToSrgb = (c: number): number => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
};

const rgbToOklab = (r: number, g: number, b: number): [number, number, number] => {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
};

const oklabToRgb = (L: number, a: number, b: number): [number, number, number] => {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    linearToSrgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
};

// Helper para interpolar entre dos colores de manera segura.
// Semántica: el peso de `fromColor` es `t` y el de `toColor` es `u` (= 1 - t).
const interpolateColor = (
  fromColor: [number, number, number, number], 
  toColor: [number, number, number, number], 
  t: number, 
  u: number
): string => {
  const fromAlpha = fromColor[3];
  const toAlpha = toColor[3];

  // Si ambos colores son completamente transparentes, no hay nada que mostrar.
  if (fromAlpha === 0 && toAlpha === 0) {
    return 'rgba(0, 0, 0, 0)';
  }

  // Si un lado es transparente, conservar el color visible y solo desvanecer su
  // alpha según su propio peso, evitando que la mezcla tienda a gris/negro.
  if (fromAlpha === 0) {
    const alpha = u * toAlpha;
    return `rgba(${toColor[0]}, ${toColor[1]}, ${toColor[2]}, ${alpha.toFixed(3)})`;
  }

  if (toAlpha === 0) {
    const alpha = t * fromAlpha;
    return `rgba(${fromColor[0]}, ${fromColor[1]}, ${fromColor[2]}, ${alpha.toFixed(3)})`;
  }

  // Interpolación perceptual en OKLab.
  const [fL, fA, fB] = rgbToOklab(fromColor[0], fromColor[1], fromColor[2]);
  const [tL, tA, tB] = rgbToOklab(toColor[0], toColor[1], toColor[2]);

  const [r, g, b] = oklabToRgb(
    t * fL + u * tL,
    t * fA + u * tA,
    t * fB + u * tB,
  );
  const a = (t * fromAlpha + u * toAlpha).toFixed(3);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const getBackgroundColor = (node: Element, defaultColor?: string): string => {
  const style = getComputedStyle(node);

  // getComputedStyle ya resuelve las variables CSS (incluidos los tokens de
  // Tailwind v4 como `bg-card` -> var(--color-card) -> oklch(...)), así que
  // basta con leer backgroundColor directamente.
  const computedBg = style.backgroundColor;

  if (!defaultColor) {
    const tmp = document.createElement("div");
    document.body.appendChild(tmp);
    defaultColor = getComputedStyle(tmp).backgroundColor;
    tmp.remove();
  }

  const isTransparent =
    !computedBg ||
    computedBg === "transparent" ||
    computedBg === "rgba(0, 0, 0, 0)";

  // Si el color es visible y distinto del default del documento, usarlo.
  if (!isTransparent && computedBg !== defaultColor) {
    return computedBg;
  }

  // Buscar el primer ancestro con un fondo opaco.
  if (node.parentElement) {
    return getBackgroundColor(node.parentElement, defaultColor);
  }

  // Fallback al color default.
  return defaultColor || 'rgba(0, 0, 0, 0)';
};
const parseColor = (color: string): [number, number, number, number] => {
  // Limpiar espacios y convertir a lowercase
  const cleanColor = color.trim().toLowerCase();
  
  // Helper para convertir OKLCH a RGB
  const oklchToRgb = (l: number, c: number, h: number): [number, number, number] => {
    // Convertir lightness de porcentaje a 0-1
    if (l > 1) l = l / 100;
    
    // Convertir hue a radianes
    const hRad = (h * Math.PI) / 180;
    
    // Convertir OKLCH a OKLAB
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);
    
    // Convertir OKLAB a RGB lineal usando matriz de transformación
    const lms1 = l + 0.3963377774 * a + 0.2158037573 * b;
    const lms2 = l - 0.1055613458 * a - 0.0638541728 * b;
    const lms3 = l - 0.0894841775 * a - 1.2914855480 * b;
    
    const lms1_3 = Math.pow(Math.max(0, lms1), 3);
    const lms2_3 = Math.pow(Math.max(0, lms2), 3);
    const lms3_3 = Math.pow(Math.max(0, lms3), 3);
    
    let r = +4.0767416621 * lms1_3 - 3.3077115913 * lms2_3 + 0.2309699292 * lms3_3;
    let g = -1.2684380046 * lms1_3 + 2.6097574011 * lms2_3 - 0.3413193965 * lms3_3;
    let b_rgb = -0.0041960863 * lms1_3 - 0.7034186147 * lms2_3 + 1.7076147010 * lms3_3;
    
    // Gamma correction
    const gammaCorrect = (val: number) => {
      if (val >= 0.0031308) {
        return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
      }
      return 12.92 * val;
    };
    
    r = gammaCorrect(Math.max(0, r));
    g = gammaCorrect(Math.max(0, g));
    b_rgb = gammaCorrect(Math.max(0, b_rgb));
    
    // Clamp y convertir a 0-255
    r = Math.max(0, Math.min(1, r)) * 255;
    g = Math.max(0, Math.min(1, g)) * 255;
    b_rgb = Math.max(0, Math.min(1, b_rgb)) * 255;
    
    return [Math.round(r), Math.round(g), Math.round(b_rgb)];
  };
  
  // Casos especiales
  if (cleanColor === 'transparent') return [0, 0, 0, 0];
  if (cleanColor === 'currentcolor') return [0, 0, 0, 1];
  
  // Colores nombrados básicos
  const namedColors: Record<string, [number, number, number]> = {
    'white': [255, 255, 255],
    'black': [0, 0, 0],
    'red': [255, 0, 0],
    'green': [0, 128, 0],
    'blue': [0, 0, 255],
    'yellow': [255, 255, 0],
    'cyan': [0, 255, 255],
    'magenta': [255, 0, 255],
  };
  
  if (namedColors[cleanColor]) {
    const [r, g, b] = namedColors[cleanColor];
    return [r, g, b, 1];
  }
  
  // OKLCH: oklch(lightness chroma hue / alpha) o oklch(lightness chroma hue)
  const oklchMatch = cleanColor.match(/oklch\(\s*([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/);
  if (oklchMatch) {
    let [, lStr, cStr, hStr, alphaStr] = oklchMatch;
    
    // Parse lightness (puede ser porcentaje)
    let l = parseFloat(lStr);
    if (lStr.includes('%')) l = l / 100;
    
    const c = parseFloat(cStr);
    const h = parseFloat(hStr);
    
    // Parse alpha
    let alpha = 1;
    if (alphaStr) {
      alpha = parseFloat(alphaStr);
      if (alphaStr.includes('%')) alpha = alpha / 100;
    }
    
    const [r, g, b] = oklchToRgb(l, c, h);
    return [r, g, b, alpha];
  }
  
  // RGB/RGBA tradicional (más flexible con espacios)
  const rgbaMatch = cleanColor.match(/rgba?\(\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*(?:\s*[,/]\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    const [, r, g, b, alpha = '1'] = rgbaMatch;
    return [parseInt(r), parseInt(g), parseInt(b), parseFloat(alpha)];
  }
  
  // Hexadecimal
  const hexMatch = cleanColor.match(/^#([a-f\d]{3}|[a-f\d]{6}|[a-f\d]{8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    
    // Expandir notación corta
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const alpha = hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : 1;
    
    return [r, g, b, alpha];
  }
  
  // HSL (conversión básica)
  const hslMatch = cleanColor.match(/hsla?\(\s*([\d.]+)\s*,?\s*([\d.]+)%\s*,?\s*([\d.]+)%\s*(?:\s*[,/]\s*([\d.]+))?\s*\)/);
  if (hslMatch) {
    const [, hStr, sStr, lStr, alphaStr] = hslMatch;
    const h = parseFloat(hStr) / 360;
    const s = parseFloat(sStr) / 100;
    const l = parseFloat(lStr) / 100;
    const alpha = alphaStr ? parseFloat(alphaStr) : 1;
    
    // Conversión HSL a RGB
    const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };
    
    const [r, g, b] = hslToRgb(h, s, l);
    return [r, g, b, alpha];
  }
  
  // Si no coincide con ningún formato, usar un elemento temporal para obtener el valor computado
  try {
    const tempDiv = document.createElement('div');
    tempDiv.style.backgroundColor = color; // Usar backgroundColor en lugar de color
    document.body.appendChild(tempDiv);
    const computedColor = getComputedStyle(tempDiv).backgroundColor;
    document.body.removeChild(tempDiv);
    
    // Recursivamente parsear el valor computado si es diferente
    if (computedColor !== color && computedColor !== 'rgba(0, 0, 0, 0)' && computedColor !== 'transparent') {
      return parseColor(computedColor);
    }
  } catch (e) {
    console.warn('Error parsing color with temp element:', color, e);
  }
  
  // Fallback: retornar negro transparente
  return [0, 0, 0, 0];
};

export const containerTransform = ({
  fallback,
  ...defaults
}: transitionOptions & containerOptions) => {
  /* This code is based on the crossfade function from Svelte. Svelte is under the MIT license.
  https://github.com/sveltejs/svelte/blob/master/src/runtime/transition/index.ts
  If you have an idea for cleaning up this mess of code, please make a PR. */
  const to_receive: ClientRectMap = new Map();
  const to_send: ClientRectMap = new Map();

  function calcTransition(
    from: DOMRect,
    fromNode: Element,
    node: Element,
    params: transitionOptions & containerOptions,
  ): TransitionConfig {
    const to = node.getBoundingClientRect();
    const isEntering = from.width * from.height < to.width * to.height;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top - to.top;

    const style = getComputedStyle(node);
    const transform = style.transform == "none" ? "" : style.transform;
    const opacity = +style.opacity;
    // Por defecto el morph debe quedar por encima de overlays de Dialog/Sheet
    // (que usan z-50). Configurable vía bgContainerZ/fgContainerZ.
    const bgContainerZ = params.bgContainerZ || defaults.bgContainerZ || 9998;
    const fgContainerZ = params.fgContainerZ || defaults.fgContainerZ || 9999;
    let container: {
      backwards?: boolean;
      e?: HTMLDivElement;
      fromColor: ReturnType<typeof parseColor>;
      fromRadius: number;
      fromBorderWidth: number;
      fromBorderColor: ReturnType<typeof parseColor>;
      toColor: ReturnType<typeof parseColor>;
      toRadius: number;
      toBorderWidth: number;
      toBorderColor: ReturnType<typeof parseColor>;
    } | null = null;
    
    try {
      const fromBgColor = getBackgroundColor(node);
      const toBgColor = getBackgroundColor(fromNode);
      const fromBorderColor = style.borderLeftColor;
      const toBorderColor = getComputedStyle(fromNode).borderLeftColor;
      
      container = {
        fromColor: parseColor(fromBgColor),
        fromRadius: parseSize(style.borderRadius),
        fromBorderWidth: parseSize(style.borderLeftWidth),
        fromBorderColor: parseColor(fromBorderColor),
        toColor: parseColor(toBgColor),
        toRadius: parseSize(getComputedStyle(fromNode).borderRadius),
        toBorderWidth: parseSize(getComputedStyle(fromNode).borderLeftWidth),
        toBorderColor: parseColor(toBorderColor),
      };
    } catch (e) {
      console.warn('Error parsing colors for transition, using fallback values:', e);
      container = {
        fromColor: [0, 0, 0, 0],
        fromRadius: 0,
        fromBorderWidth: 0,
        fromBorderColor: [0, 0, 0, 0],
        toColor: [0, 0, 0, 0],
        toRadius: 0,
        toBorderWidth: 0,
        toBorderColor: [0, 0, 0, 0],
      };
    }

    return {
      delay: params.delay || defaults.delay || 0,
      duration: params.duration || defaults.duration || 500,
      easing: params.easing || defaults.easing || easeEmphasized,
      css: (t, u) => {
        const dw = t + u * (from.width / to.width);
        const dh = t + u * (from.height / to.height);
        const tOpacity = (isEntering ? (10 * t - 3) / 7 : (-10 / 3) * u + 1) * opacity;
        const tScale = isEntering ? Math.max(dw, dh) : Math.min(dw, dh);
        const horizontalTrim = ((tScale - dw) * to.width) / tScale / 2;
        const verticalTrim = ((tScale - dh) * to.height) / tScale;
        return `
          opacity: ${tOpacity};
          transform-origin: top center;
          transform: ${transform} translate(${u * dx}px, ${u * dy}px) scale(${tScale});
          clip-path: inset(0 ${horizontalTrim}px ${verticalTrim}px ${horizontalTrim}px);
          z-index: ${fgContainerZ};
          ${t < 0.98 ? "background-color: transparent;" : ""}
          border-color: transparent;
          pointer-events: none;
        `;
      },
      tick: (t, u) => {
        if (!isEntering || !container) return;
        if (container.backwards == null) container.backwards = Boolean(t);
        if (!container.e) {
          container.e = document.createElement("div");
          container.e.style.position = "fixed";
          container.e.style.zIndex = bgContainerZ.toString();
          container.e.style.boxSizing = "border-box";
          container.e.style.borderStyle = "solid";
          container.e.style.pointerEvents = "none";
          document.body.appendChild(container.e);
        } else if (t == (container.backwards ? 0 : 1)) {
          document.body.removeChild(container.e);
          return (container = null);
        }
        container.e.style.top = (u * from.top + t * to.top).toFixed(1) + "px";
        container.e.style.left = (u * from.left + t * to.left).toFixed(1) + "px";
        container.e.style.width = (u * from.width + t * to.width).toFixed(1) + "px";
        container.e.style.height = (u * from.height + t * to.height).toFixed(1) + "px";

        const {
          fromColor,
          fromRadius,
          fromBorderWidth,
          fromBorderColor,
          toColor,
          toRadius,
          toBorderWidth,
          toBorderColor,
        } = container;

        // Usar la función helper para interpolar colores de manera segura
        const backgroundColor = interpolateColor(fromColor, toColor, t, u);
        const borderColor = interpolateColor(fromBorderColor, toBorderColor, t, u);
        
        container.e.style.backgroundColor = backgroundColor;
        container.e.style.borderRadius = (t * fromRadius + u * toRadius).toFixed(1) + "px";
        container.e.style.borderWidth = (t * fromBorderWidth + u * toBorderWidth).toFixed(1) + "px";
        container.e.style.borderColor = borderColor;
      },
    };
  }

  function makeTransition(items: ClientRectMap, counterparts: ClientRectMap, intro: boolean) {
    return (
      node: Element,
      params: transitionOptions & containerOptions & containerParamOptions,
    ) => {
      items.set(params.key, {
        rect: node.getBoundingClientRect(),
        node,
      });
      return () => {
        const counterpart = counterparts.get(params.key);
        if (counterpart) {
          counterparts.delete(params.key);
          return calcTransition(counterpart.rect, counterpart.node, node, params);
        }

        // if the node is disappearing altogether
        // (i.e. wasn't claimed by the other list)
        // then we need to supply an outro
        items.delete(params.key);
        return fallback ? fallback(node, params, intro) : {};
      };
    };
  }

  return [makeTransition(to_send, to_receive, false), makeTransition(to_receive, to_send, true)];
};

type sharedAxisOptions =
  | {
      direction: "X" | "Y";
      /**
       * true if this element is on the top/left of things
       * if it's first, then use transition: and set it to true
       * if it's last, then use transition: and set it to false
       * if it's in between, use separate in: and out: statements:
       * > set it to false when it's interacting with the left side, and true when interacting with its right
       * > in order to implement this, try something like using a prevPage variable:
       * > ```
       * > {:else if page == 1}
       * > <div
       * >   in:sharedAxisTransition={{
       * >     direction: "X",
       * >     rightSeam: prevPage > 1, (if we're transitioning from a page on the right, rightseam is true)
       * >   }}
       * >   out:sharedAxisTransition={{
       * >     direction: "X",
       * >     rightSeam: page > 1, (if we're transitioning to a page on the right, rightseam is true)
       * >   }}
       * > >
       * > ```
       *
       * i went insane over figuring this out :)
       */
      rightSeam: boolean;
    }
  | {
      direction: "Z";
      leaving: boolean /* set to true in out:, set to false in in: */;
    };
/* protip: set a background color on the items, and utilize position relative + absolute to let them overlap */
export const sharedAxisTransition = (
  node: Element,
  options: transitionOptions & sharedAxisOptions,
) => {
  return {
    delay: options.delay,
    duration: options.duration || 500,
    easing: options.easing || easeEmphasized,
    css: (t: number, u: number) => {
      const opacity = (t - 0.35) * (1 / 0.35);
      if (options.direction == "Z") {
        const factor = options.leaving ? u * 0.1 + 1 : t * 0.2 + 0.8;
        let css = `transform: scale(${factor.toFixed(3)});`;
        if (!options.leaving) css += `opacity: ${opacity.toFixed(3)};`;
        return css;
      }
      const factor = u * (options.rightSeam ? -30 : 30);
      return (
        `transform: translate${options.direction}(${factor.toFixed(3)}px);` +
        `opacity: ${opacity.toFixed(3)}`
      );
    },
  };
};

export const outroClass = (node: Element) => {
  const addClass = (e: Event) => {
    if (!(e.target instanceof Element)) return;
    e.target.classList.add("leaving");
  };
  const removeClass = (e: Event) => {
    if (!(e.target instanceof Element)) return;
    e.target.classList.remove("leaving");
  };
  node.addEventListener("outrostart", addClass);
  node.addEventListener("outroend", removeClass);
  return {
    destroy() {
      node.removeEventListener("outrostart", addClass);
      node.removeEventListener("outroend", removeClass);
    },
  };
};