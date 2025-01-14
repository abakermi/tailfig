// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Interfaces
interface FontSize {
  size: number;
  lineHeight: number;
}

interface FontWeight {
  name: string;
  weight: number;
}

interface ColorShade {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

type ShadeNumber = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

// Add these gradient configurations
interface GradientStop {
  position: number;
  color: { r: number; g: number; b: number; a: number; };
}

type GradientDirection = 'to-r' | 'to-tr' | 'to-t' | 'to-tl' | 'to-l' | 'to-bl' | 'to-b' | 'to-br';

const gradientDirections: Record<GradientDirection, number> = {
  'to-r': 0,
  'to-tr': 45,
  'to-t': 90,
  'to-tl': 135,
  'to-l': 180,
  'to-bl': 225,
  'to-b': 270,
  'to-br': 315
};

// Configurations
const tailwindFontSizes: Record<string, FontSize> = {
  'xs': { size: 12, lineHeight: 16 },
  'sm': { size: 14, lineHeight: 20 },
  'base': { size: 16, lineHeight: 24 },
  'lg': { size: 18, lineHeight: 28 },
  'xl': { size: 20, lineHeight: 28 },
  '2xl': { size: 24, lineHeight: 32 },
  '3xl': { size: 30, lineHeight: 36 },
  '4xl': { size: 36, lineHeight: 40 },
  '5xl': { size: 48, lineHeight: 48 },
  '6xl': { size: 60, lineHeight: 60 },
  '7xl': { size: 72, lineHeight: 72 },
  '8xl': { size: 96, lineHeight: 96 },
  '9xl': { size: 128, lineHeight: 128 },
};

const fontWeights: FontWeight[] = [
  { name: 'Thin', weight: 100 },
  { name: 'ExtraLight', weight: 200 },
  { name: 'Light', weight: 300 },
  { name: 'Regular', weight: 400 },
  { name: 'Medium', weight: 500 },
  { name: 'SemiBold', weight: 600 },
  { name: 'Bold', weight: 700 },
  { name: 'ExtraBold', weight: 800 },
  { name: 'Black', weight: 900 },
];

const containerSizes: Record<string, number> = {
  'none': 0,      // 100%
  'sm': 640,      // 640px
  'md': 768,      // 768px
  'lg': 1024,     // 1024px
  'xl': 1280,     // 1280px
  '2xl': 1536     // 1536px
};

const shadowStyles: Record<string, Effect[]> = {
  'sm': [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.05 },
    offset: { x: 0, y: 1 },
    radius: 2,
    visible: true,
    blendMode: 'NORMAL'
  }],
  'base': [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 1 },
    radius: 3,
    visible: true,
    blendMode: 'NORMAL'
  },
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.06 },
    offset: { x: 0, y: 1 },
    radius: 2,
    visible: true,
    blendMode: 'NORMAL'
  }],
  'md': [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 4 },
    radius: 6,
    visible: true,
    blendMode: 'NORMAL'
  },
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.06 },
    offset: { x: 0, y: 2 },
    radius: 4,
    visible: true,
    blendMode: 'NORMAL'
  }],
  'lg': [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 10 },
    radius: 15,
    visible: true,
    blendMode: 'NORMAL'
  },
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.05 },
    offset: { x: 0, y: 4 },
    radius: 6,
    visible: true,
    blendMode: 'NORMAL'
  }],
  'xl': [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 20 },
    radius: 25,
    visible: true,
    blendMode: 'NORMAL'
  },
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.04 },
    offset: { x: 0, y: 10 },
    radius: 10,
    visible: true,
    blendMode: 'NORMAL'
  }],
  '2xl': [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.25 },
    offset: { x: 0, y: 25 },
    radius: 50,
    visible: true,
    blendMode: 'NORMAL'
  }],
  'inner': [{
    type: 'INNER_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.06 },
    offset: { x: 0, y: 2 },
    radius: 4,
    visible: true,
    blendMode: 'NORMAL'
  }],
  'none': []
};

const tailwindColors: Array<{
  name: string;
  shades: Record<ShadeNumber, ColorShade>;
}> = [
    {
      name: 'gray',
      shades: {
        '50': { hex: '#F9FAFB', rgb: { r: 249 / 255, g: 250 / 255, b: 251 / 255 } },
        '100': { hex: '#F3F4F6', rgb: { r: 243 / 255, g: 244 / 255, b: 246 / 255 } },
        '200': { hex: '#E5E7EB', rgb: { r: 229 / 255, g: 231 / 255, b: 235 / 255 } },
        '300': { hex: '#D1D5DB', rgb: { r: 209 / 255, g: 213 / 255, b: 219 / 255 } },
        '400': { hex: '#9CA3AF', rgb: { r: 156 / 255, g: 163 / 255, b: 175 / 255 } },
        '500': { hex: '#6B7280', rgb: { r: 107 / 255, g: 114 / 255, b: 128 / 255 } },
        '600': { hex: '#4B5563', rgb: { r: 75 / 255, g: 85 / 255, b: 99 / 255 } },
        '700': { hex: '#374151', rgb: { r: 55 / 255, g: 65 / 255, b: 81 / 255 } },
        '800': { hex: '#1F2937', rgb: { r: 31 / 255, g: 41 / 255, b: 55 / 255 } },
        '900': { hex: '#111827', rgb: { r: 17 / 255, g: 24 / 255, b: 39 / 255 } },
      }
    },
    {
      name: 'red',
      shades: {
        '50': { hex: '#FEF2F2', rgb: { r: 254 / 255, g: 242 / 255, b: 242 / 255 } },
        '100': { hex: '#FEE2E2', rgb: { r: 254 / 255, g: 226 / 255, b: 226 / 255 } },
        '200': { hex: '#FECACA', rgb: { r: 254 / 255, g: 202 / 255, b: 202 / 255 } },
        '300': { hex: '#FCA5A5', rgb: { r: 252 / 255, g: 165 / 255, b: 165 / 255 } },
        '400': { hex: '#F87171', rgb: { r: 248 / 255, g: 113 / 255, b: 113 / 255 } },
        '500': { hex: '#EF4444', rgb: { r: 239 / 255, g: 68 / 255, b: 68 / 255 } },
        '600': { hex: '#DC2626', rgb: { r: 220 / 255, g: 38 / 255, b: 38 / 255 } },
        '700': { hex: '#B91C1C', rgb: { r: 185 / 255, g: 28 / 255, b: 28 / 255 } },
        '800': { hex: '#991B1B', rgb: { r: 153 / 255, g: 27 / 255, b: 27 / 255 } },
        '900': { hex: '#7F1D1D', rgb: { r: 127 / 255, g: 29 / 255, b: 29 / 255 } },
      }
    },
    {
      name: 'amber',
      shades: {
        '50': { hex: '#FFFBEB', rgb: { r: 255 / 255, g: 251 / 255, b: 235 / 255 } },
        '100': { hex: '#FEF3C7', rgb: { r: 254 / 255, g: 243 / 255, b: 199 / 255 } },
        '200': { hex: '#FDE68A', rgb: { r: 253 / 255, g: 230 / 255, b: 138 / 255 } },
        '300': { hex: '#FCD34D', rgb: { r: 252 / 255, g: 211 / 255, b: 77 / 255 } },
        '400': { hex: '#FBBF24', rgb: { r: 251 / 255, g: 191 / 255, b: 36 / 255 } },
        '500': { hex: '#F59E0B', rgb: { r: 245 / 255, g: 158 / 255, b: 11 / 255 } },
        '600': { hex: '#D97706', rgb: { r: 217 / 255, g: 119 / 255, b: 6 / 255 } },
        '700': { hex: '#B45309', rgb: { r: 180 / 255, g: 83 / 255, b: 9 / 255 } },
        '800': { hex: '#92400E', rgb: { r: 146 / 255, g: 64 / 255, b: 14 / 255 } },
        '900': { hex: '#78350F', rgb: { r: 120 / 255, g: 53 / 255, b: 15 / 255 } },
      }
    },
    {
      name: 'emerald',
      shades: {
        '50': { hex: '#ECFDF5', rgb: { r: 236 / 255, g: 253 / 255, b: 245 / 255 } },
        '100': { hex: '#D1FAE5', rgb: { r: 209 / 255, g: 250 / 255, b: 229 / 255 } },
        '200': { hex: '#A7F3D0', rgb: { r: 167 / 255, g: 243 / 255, b: 208 / 255 } },
        '300': { hex: '#6EE7B7', rgb: { r: 110 / 255, g: 231 / 255, b: 183 / 255 } },
        '400': { hex: '#34D399', rgb: { r: 52 / 255, g: 211 / 255, b: 153 / 255 } },
        '500': { hex: '#10B981', rgb: { r: 16 / 255, g: 185 / 255, b: 129 / 255 } },
        '600': { hex: '#059669', rgb: { r: 5 / 255, g: 150 / 255, b: 105 / 255 } },
        '700': { hex: '#047857', rgb: { r: 4 / 255, g: 120 / 255, b: 87 / 255 } },
        '800': { hex: '#065F46', rgb: { r: 6 / 255, g: 95 / 255, b: 70 / 255 } },
        '900': { hex: '#064E3B', rgb: { r: 6 / 255, g: 78 / 255, b: 59 / 255 } },
      }
    },
    {
      name: 'blue',
      shades: {
        '50': { hex: '#EFF6FF', rgb: { r: 239 / 255, g: 246 / 255, b: 255 / 255 } },
        '100': { hex: '#DBEAFE', rgb: { r: 219 / 255, g: 234 / 255, b: 254 / 255 } },
        '200': { hex: '#BFDBFE', rgb: { r: 191 / 255, g: 219 / 255, b: 254 / 255 } },
        '300': { hex: '#93C5FD', rgb: { r: 147 / 255, g: 197 / 255, b: 253 / 255 } },
        '400': { hex: '#60A5FA', rgb: { r: 96 / 255, g: 165 / 255, b: 250 / 255 } },
        '500': { hex: '#3B82F6', rgb: { r: 59 / 255, g: 130 / 255, b: 246 / 255 } },
        '600': { hex: '#2563EB', rgb: { r: 37 / 255, g: 99 / 255, b: 235 / 255 } },
        '700': { hex: '#1D4ED8', rgb: { r: 29 / 255, g: 78 / 255, b: 216 / 255 } },
        '800': { hex: '#1E40AF', rgb: { r: 30 / 255, g: 64 / 255, b: 175 / 255 } },
        '900': { hex: '#1E3A8A', rgb: { r: 30 / 255, g: 58 / 255, b: 138 / 255 } },
      }
    },
    {
      name: 'indigo',
      shades: {
        '50': { hex: '#EEF2FF', rgb: { r: 238 / 255, g: 242 / 255, b: 255 / 255 } },
        '100': { hex: '#E0E7FF', rgb: { r: 224 / 255, g: 231 / 255, b: 255 / 255 } },
        '200': { hex: '#C7D2FE', rgb: { r: 199 / 255, g: 210 / 255, b: 254 / 255 } },
        '300': { hex: '#A5B4FC', rgb: { r: 165 / 255, g: 180 / 255, b: 252 / 255 } },
        '400': { hex: '#818CF8', rgb: { r: 129 / 255, g: 140 / 255, b: 248 / 255 } },
        '500': { hex: '#6366F1', rgb: { r: 99 / 255, g: 102 / 255, b: 241 / 255 } },
        '600': { hex: '#4F46E5', rgb: { r: 79 / 255, g: 70 / 255, b: 229 / 255 } },
        '700': { hex: '#4338CA', rgb: { r: 67 / 255, g: 56 / 255, b: 202 / 255 } },
        '800': { hex: '#3730A3', rgb: { r: 55 / 255, g: 48 / 255, b: 163 / 255 } },
        '900': { hex: '#312E81', rgb: { r: 49 / 255, g: 46 / 255, b: 129 / 255 } },
      }
    },
    {
      name: 'violet',
      shades: {
        '50': { hex: '#F5F3FF', rgb: { r: 245 / 255, g: 243 / 255, b: 255 / 255 } },
        '100': { hex: '#EDE9FE', rgb: { r: 237 / 255, g: 233 / 255, b: 254 / 255 } },
        '200': { hex: '#DDD6FE', rgb: { r: 221 / 255, g: 214 / 255, b: 254 / 255 } },
        '300': { hex: '#C4B5FD', rgb: { r: 196 / 255, g: 181 / 255, b: 253 / 255 } },
        '400': { hex: '#A78BFA', rgb: { r: 167 / 255, g: 139 / 255, b: 250 / 255 } },
        '500': { hex: '#8B5CF6', rgb: { r: 139 / 255, g: 92 / 255, b: 246 / 255 } },
        '600': { hex: '#7C3AED', rgb: { r: 124 / 255, g: 58 / 255, b: 237 / 255 } },
        '700': { hex: '#6D28D9', rgb: { r: 109 / 255, g: 40 / 255, b: 217 / 255 } },
        '800': { hex: '#5B21B6', rgb: { r: 91 / 255, g: 33 / 255, b: 182 / 255 } },
        '900': { hex: '#4C1D95', rgb: { r: 76 / 255, g: 29 / 255, b: 149 / 255 } },
      }
    },
    {
      name: 'pink',
      shades: {
        '50': { hex: '#FDF2F8', rgb: { r: 253 / 255, g: 242 / 255, b: 248 / 255 } },
        '100': { hex: '#FCE7F3', rgb: { r: 252 / 255, g: 231 / 255, b: 243 / 255 } },
        '200': { hex: '#FBCFE8', rgb: { r: 251 / 255, g: 207 / 255, b: 232 / 255 } },
        '300': { hex: '#F9A8D4', rgb: { r: 249 / 255, g: 168 / 255, b: 212 / 255 } },
        '400': { hex: '#F472B6', rgb: { r: 244 / 255, g: 114 / 255, b: 182 / 255 } },
        '500': { hex: '#EC4899', rgb: { r: 236 / 255, g: 72 / 255, b: 153 / 255 } },
        '600': { hex: '#DB2777', rgb: { r: 219 / 255, g: 39 / 255, b: 119 / 255 } },
        '700': { hex: '#BE185D', rgb: { r: 190 / 255, g: 24 / 255, b: 93 / 255 } },
        '800': { hex: '#9D174D', rgb: { r: 157 / 255, g: 23 / 255, b: 77 / 255 } },
        '900': { hex: '#831843', rgb: { r: 131 / 255, g: 24 / 255, b: 67 / 255 } },
      }
    }
  ];

const spacingStyles: Record<string, number> = {
  'px': 1,
  '0': 0,
  '0.5': 2,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96
};

const borderRadiusStyles: Record<string, number> = {
  'none': 0,
  'sm': 2,
  'md': 6,
  'lg': 8,
  'xl': 12,
  '2xl': 16,
  '3xl': 24,
  'full': 9999
};

const opacityStyles: Record<string, number> = {
  '0': 0,
  '5': 0.05,
  '10': 0.1,
  '20': 0.2,
  '30': 0.3,
  '40': 0.4,
  '50': 0.5,
  '60': 0.6,
  '70': 0.7,
  '80': 0.8,
  '90': 0.9,
  '100': 1
};

const blurEffects: Record<string, Effect[]> = {
  'sm': [{
    type: 'LAYER_BLUR',
    radius: 4,
    visible: true
  }],
  'md': [{
    type: 'LAYER_BLUR',
    radius: 8,
    visible: true
  }],
  'lg': [{
    type: 'LAYER_BLUR',
    radius: 16,
    visible: true
  }],
  'xl': [{
    type: 'LAYER_BLUR',
    radius: 24,
    visible: true
  }]
};

async function createTextStyles(selectedFont: string) {
  try {
    // Track successfully loaded fonts
    const loadedFonts = new Set<string>();

    // Load fonts first
    for (const weight of fontWeights) {
      try {
        await figma.loadFontAsync({ family: selectedFont, style: weight.name });
        loadedFonts.add(`${selectedFont}-${weight.name}`);
        console.log(`Loaded ${selectedFont} ${weight.name}`);
      } catch (e) {
        console.warn(`Failed to load ${selectedFont} ${weight.name}:`, e);
        continue;
      }
    }

    // Create text styles only for loaded fonts
    const entries = Object.entries(tailwindFontSizes) as [
      keyof typeof tailwindFontSizes,
      { size: number; lineHeight: number }
    ][];

    for (const [sizeName, sizeConfig] of entries) {
      for (const weight of fontWeights) {
        // Skip if font wasn't loaded
        if (!loadedFonts.has(`${selectedFont}-${weight.name}`)) {
          console.log(`Skipping unloaded font: ${selectedFont} ${weight.name}`);
          continue;
        }

        const styleName = `text-${sizeName}/${weight.name.toLowerCase()}`;
        console.log(`Creating style: ${styleName}`);

        const style = figma.createTextStyle();
        style.name = styleName;
        style.fontSize = sizeConfig.size;
        style.lineHeight = {
          value: sizeConfig.lineHeight,
          unit: 'PIXELS'
        };
        style.fontName = {
          family: selectedFont,
          style: weight.name
        };
      }
    }

    figma.notify(`Created text styles for ${selectedFont}!`);
  } catch (error: any) {
    console.error('Error creating text styles:', error);
    figma.notify(`Error: ${error.message}`, { error: true });
  } finally {
    figma.closePlugin();
  }
}

// Show the UI
figma.showUI(__html__, { width: 300, height: 380 });

// Get available fonts and send them to the UI
figma.listAvailableFontsAsync()
  .then(fonts => {
    // Get unique font family names
    const fontFamilies = [...new Set(fonts.map(font => font.fontName.family))];
    figma.ui.postMessage({ type: 'update-fonts', fonts: fontFamilies });
  });

// Add function to create container frame
function createContainerFrame(size: string, addGrid: boolean) {
  const frame = figma.createFrame();
  frame.name = `Frame`;

  if (size === 'none') {
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisSizingMode = 'FIXED';
    frame.counterAxisSizingMode = 'AUTO';
    frame.resize(figma.viewport.bounds.width, frame.height);
  } else {
    frame.resize(containerSizes[size], frame.height);
  }

  // Add layout grid if requested
  if (addGrid) {
    const grid: LayoutGrid = {
      pattern: 'COLUMNS',
      alignment: 'CENTER',
      gutterSize: 32,
      count: 12,
      sectionSize: 64,
      visible: true,

      color: { r: 0.2, g: 0.2, b: 0.9, a: 0.1 }
    };

    // Add margins using a second grid
    const marginGrid: LayoutGrid = {
      pattern: 'GRID',

      sectionSize: 64,
      visible: true,
      color: { r: 0.9, g: 0.2, b: 0.2, a: 0.1 }
    };

    frame.layoutGrids = [grid];
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
    frame.resize(frame.width, 800);
  }

  frame.x = figma.viewport.center.x - frame.width / 2;
  frame.y = figma.viewport.center.y - frame.height / 2;

  return frame;
}

// Function to create spacing styles
function createSpacingStyles() {
  Object.entries(spacingStyles).forEach(([name, value]) => {
    const style = figma.createEffectStyle();
    style.name = `spacing-${name}`;
    // Create a grid layout to visualize the spacing
    style.effects = [{
      type: 'LAYER_BLUR',
      radius: value,
      visible: true
    }];
  });
}

// Function to create border radius styles
function createBorderRadiusStyles() {
  Object.entries(borderRadiusStyles).forEach(([name, value]) => {
    const style = figma.createPaintStyle();
    style.name = `radius-${name}`;
    // Store the radius value in the style description for reference
    style.description = `Border radius: ${value}px`;
  });
}

// Function to create blur effect styles
function createBlurStyles() {
  Object.entries(blurEffects).forEach(([name, effects]) => {
    const style = figma.createEffectStyle();
    style.name = `blur-${name}`;
    style.effects = effects;
  });
}

// Update message handler
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    try {
      if (msg.generateStyles) {
        await createTextStyles(msg.font);
      }

      if (msg.generateShadows) {
        createShadowStyles();
      }

      if (msg.generateColors) {
        createColorStyles();
      }

      if (msg.generateContainer) {
        const frame = createContainerFrame(msg.containerSize, msg.addGrid);
        figma.currentPage.appendChild(frame);
        figma.currentPage.selection = [frame];
        figma.viewport.scrollAndZoomIntoView([frame]);
      }

      if (msg.generateSpacing) {
        createSpacingStyles();
      }

      if (msg.generateRadius) {
        createBorderRadiusStyles();
      }

      if (msg.generateBlur) {
        createBlurStyles();
      }

      if (msg.generateGradients) {
        createGradientStyles();
      }

      figma.notify('Generation completed!');
    } catch (error: any) {
      console.error('Error:', error);
      figma.notify(`Error: ${error.message}`, { error: true });
    } finally {
      figma.closePlugin();
    }
  }
};

// Function to create shadow effect styles
function createShadowStyles() {
  Object.entries(shadowStyles).forEach(([name, effects]) => {
    const style = figma.createEffectStyle();
    style.name = `shadow-${name}`;
    style.effects = effects;
  });
}

// Function to create color styles
function createColorStyles() {
  tailwindColors.forEach(palette => {
    Object.entries(palette.shades).forEach(([shade, color]) => {
      const style = figma.createPaintStyle();
      style.name = `${palette.name}-${shade}`;
      style.paints = [{
        type: 'SOLID',
        color: color.rgb
      }];
    });
  });
}

// Add these gradient configurations
interface GradientStop {
  position: number;
  color: { r: number; g: number; b: number; a: number; };
}


function createGradientStyles() {
  // Create gradients for each color
  tailwindColors.forEach(palette => {
    // Create gradients between consecutive shades
    const shadeNumbers: ShadeNumber[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

    // Create gradients for each direction
    Object.entries(gradientDirections).forEach(([direction, angle]) => {
      // Create gradients between consecutive shades
      for (let i = 0; i < shadeNumbers.length - 1; i++) {
        const fromShade = shadeNumbers[i];
        const toShade = shadeNumbers[i + 1];

        const style = figma.createPaintStyle();
        style.name = `gradient-${palette.name}-${fromShade}-${toShade}-${direction}`;
        console.log(style.name);
        // Convert angle to radians
        const radians = (angle * Math.PI) / 180;

        style.paints = [{
          type: 'GRADIENT_LINEAR',
          gradientTransform: [
            [Math.cos(radians), Math.sin(radians), 0],
            [-Math.sin(radians), Math.cos(radians), 0]
          ],
          gradientStops: [
            {
              position: 0,
              color: {
                ...palette.shades[fromShade].rgb,
                a: 1
              }
            },
            {
              position: 1,
              color: {
                ...palette.shades[toShade].rgb,
                a: 1
              }
            }
          ]
        }];
      }
    });
  });
}
