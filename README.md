# CSS-only LQIP (Low-Quality Image Placeholder)

> This tool is implemented based on [Lean Rada’s article on CSS-only LQIP](https://leanrada.com/notes/css-only-lqip).

A lightweight, JavaScript-free implementation of low-quality image placeholders (LQIP) using only CSS custom properties and gradients.

This technique renders a soft, blurry image preview using a compact 20-bit integer — all handled natively by CSS, making it ideal for performance-critical applications or environments where JavaScript is restricted.

## 🚀 Features

- ✅ Zero JavaScript
- ⚡ Ultra-fast rendering using browser-native CSS
- 🎨 Only 6 numbers needed for the placeholder
- 🧠 Pure CSS logic: no runtime decoding needed

---

## 🛠 How It Works

1. **Bit Extraction**
   A 20-bit integer is passed via a CSS custom property (`--lqip`). Bit fields are extracted using CSS `calc()` and simulated modular arithmetic (e.g., `mod`, `floor`) to decode the base color and per-cell brightness.

2. **Color and Brightness Decoding**

   - The base color is encoded in the **Oklab** color space and converted to `rgb()` or `hsl()` for use as a background.
   - Each of the 6 cells in the 3×2 grid has a 2-bit luminance value used to control the **opacity** (alpha) of a radial gradient, simulating brightness.

3. **Gradient Rendering**
   A stack of 6 `radial-gradient` layers is rendered on top of the base color. Each gradient is precisely positioned to form one grid cell, with its alpha adjusted to approximate local brightness.

4. **Blur Simulation**
   This implementation does **not** use `filter: blur()`. Instead, visual blur is simulated through soft-edged, overlapping radial gradients with smooth transparency transitions—resulting in a perceptually smooth appearance at zero runtime cost.

---

## 📦 Example Usage

```html
<img src="https://example.com/image.jpg" style="--lqip: 123456;" />
```
