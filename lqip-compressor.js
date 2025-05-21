import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Convert RGB to OkLab color space
function rgbToOkLab(rgb) {
  // Convert RGB [0-255] to linear RGB [0-1]
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Convert linear RGB to LMS
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  // Apply nonlinear transformation to LMS
  const lCbrt = Math.cbrt(l);
  const mCbrt = Math.cbrt(m);
  const sCbrt = Math.cbrt(s);

  // Convert to OkLab
  const L = 0.2104542553 * lCbrt + 0.7936177850 * mCbrt - 0.0040720468 * sCbrt;
  const a = 1.9779984951 * lCbrt - 2.4285922050 * mCbrt + 0.4505937099 * sCbrt;
  const b = 0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.8086757660 * sCbrt;

  return { L, a, b };
}

// Get dominant color from image
async function getDominantColor(imagePath) {
  const { dominant } = await sharp(imagePath)
    .resize(10, 10, { fit: 'cover' })
    .stats();

  return {
    r: dominant.r,
    g: dominant.g,
    b: dominant.b
  };
}

// Find the best bit configuration for OkLab values
function findOklabBits(targetL, targetA, targetB) {
  const targetChroma = Math.hypot(targetA, targetB);
  const scaledTargetA = scaleComponentForDiff(targetA, targetChroma);
  const scaledTargetB = scaleComponentForDiff(targetB, targetChroma);

  let bestBits = [0, 0, 0];
  let bestDifference = Infinity;

  for (let ll = 0; ll <= 0b11; ll++) {
    for (let aaa = 0; aaa <= 0b111; aaa++) {
      for (let bbb = 0; bbb <= 0b111; bbb++) {
        const { L, a, b } = bitsToLab(ll, aaa, bbb);
        const chroma = Math.hypot(a, b);
        const scaledA = scaleComponentForDiff(a, chroma);
        const scaledB = scaleComponentForDiff(b, chroma);

        const difference = Math.hypot(
          L - targetL,
          scaledA - scaledTargetA,
          scaledB - scaledTargetB
        );

        if (difference < bestDifference) {
          bestDifference = difference;
          bestBits = [ll, aaa, bbb];
        }
      }
    }
  }

  return { ll: bestBits[0], aaa: bestBits[1], bbb: bestBits[2] };
}

// Scale component for difference calculation
function scaleComponentForDiff(x, chroma) {
  return x / (1e-6 + Math.pow(chroma, 0.5));
}

// Convert bits to Lab values
function bitsToLab(ll, aaa, bbb) {
  const L = (ll / 0b11) * 0.6 + 0.2;
  const a = (aaa / 0b1000) * 0.7 - 0.35;
  const b = ((bbb + 1) / 0b1000) * 0.7 - 0.35;
  return { L, a, b };
}

// Clamp value between min and max
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Main function to analyze image and generate LQIP
async function generateLQIP(imagePath) {
  try {
    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;
    
    // Check if image is opaque
    const stats = await sharp(imagePath).stats();
    const isOpaque = stats.isOpaque;
    
    if (!isOpaque) {
      console.log('Image has transparency, LQIP not generated');
      return {
        width,
        height,
        opaque: false
      };
    }
    
    // Get dominant color
    const dominantColor = await getDominantColor(imagePath);
    console.log('Dominant color:', dominantColor);
    
    // Convert dominant color to OkLab
    const { L: rawBaseL, a: rawBaseA, b: rawBaseB } = rgbToOkLab(dominantColor);
    
    // Find best bit representation
    const { ll, aaa, bbb } = findOklabBits(rawBaseL, rawBaseA, rawBaseB);
    const { L: baseL, a: baseA, b: baseB } = bitsToLab(ll, aaa, bbb);
    
    console.log('OkLab (original):', 
      Number(rawBaseL.toFixed(4)),
      Number(rawBaseA.toFixed(4)), 
      Number(rawBaseB.toFixed(4))
    );
    
    console.log('OkLab (compressed):', 
      Number(baseL.toFixed(4)), 
      Number(baseA.toFixed(4)), 
      Number(baseB.toFixed(4))
    );
    
    // Generate 3x2 preview
    const previewBuffer = await sharp(imagePath)
      .resize(3, 2, { fit: 'fill' })
      .sharpen({ sigma: 1 })
      .removeAlpha()
      .raw()
      .toBuffer();
    
    // Process each cell in the 3x2 grid
    const cells = [];
    for (let i = 0; i < 6; i++) {
      const r = previewBuffer[i * 3];
      const g = previewBuffer[i * 3 + 1];
      const b = previewBuffer[i * 3 + 2];
      cells.push(rgbToOkLab({ r, g, b }));
    }
    
    // Calculate relative lightness values
    const values = cells.map(({ L }) => clamp(0.5 + L - baseL, 0, 1));
    console.log('Relative lightness values:', values.map(v => v.toFixed(2)));
    
    // Encode to integer format
    const ca = Math.round(values[0] * 0b11);
    const cb = Math.round(values[1] * 0b11);
    const cc = Math.round(values[2] * 0b11);
    const cd = Math.round(values[3] * 0b11);
    const ce = Math.round(values[4] * 0b11);
    const cf = Math.round(values[5] * 0b11);
    
    const lqip =
      -(2 ** 19) +
      ((ca & 0b11) << 18) +
      ((cb & 0b11) << 16) +
      ((cc & 0b11) << 14) +
      ((cd & 0b11) << 12) +
      ((ce & 0b11) << 10) +
      ((cf & 0b11) << 8) +
      ((ll & 0b11) << 6) +
      ((aaa & 0b111) << 3) +
      (bbb & 0b111);
    
    // Sanity check
    if (lqip < -999_999 || lqip > 999_999) {
      throw new Error(`Invalid LQIP value: ${lqip}`);
    }
    
    return {
      width,
      height,
      opaque: true,
      ll,
      aaa,
      bbb,
      values,
      lqip
    };
  } catch (error) {
    console.error('Error generating LQIP:', error);
    throw error;
  }
}

// Main execution
async function main() {
  // You can replace this with any image URL or local path
  const imagePath = 'https://images.unsplash.com/photo-1682687982501-1e58ab814714';
  
  try {
    // If it's a URL, download it first
    let localPath = imagePath;
    if (imagePath.startsWith('http')) {
      console.log('Downloading image from URL...');
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      localPath = 'temp-image.jpg';
      await fs.writeFile(localPath, Buffer.from(buffer));
      console.log('Image downloaded successfully');
    }
    
    console.log(`Analyzing image: ${localPath}`);
    const result = await generateLQIP(localPath);
    
    console.log('\nLQIP Result:');
    console.log('----------------------------------');
    console.log(`Width: ${result.width}px`);
    console.log(`Height: ${result.height}px`);
    console.log(`Opaque: ${result.opaque}`);
    
    if (result.opaque) {
      console.log(`LQIP Integer: ${result.lqip}`);
      console.log(`CSS Property: --lqip:${result.lqip}`);
      
      // Generate HTML example
      const htmlExample = `<img src="${imagePath}" width="${result.width}" height="${result.height}" style="--lqip:${result.lqip}" />`;
      console.log('\nHTML Example:');
      console.log(htmlExample);
    }
    
    // Clean up if we downloaded a temporary file
    if (imagePath !== localPath) {
      await fs.unlink(localPath);
    }
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
