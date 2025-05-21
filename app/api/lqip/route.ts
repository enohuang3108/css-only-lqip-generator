import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

// Convert RGB to OkLab color space
function rgbToOkLab(rgb: { r: number; g: number; b: number }) {
  // Convert RGB [0-255] to linear RGB [0-1]
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  // Convert linear RGB to LMS
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  // Apply nonlinear transformation to LMS
  const lCbrt = Math.cbrt(l)
  const mCbrt = Math.cbrt(m)
  const sCbrt = Math.cbrt(s)

  // Convert to OkLab
  const L = 0.2104542553 * lCbrt + 0.793617785 * mCbrt - 0.0040720468 * sCbrt
  const a = 1.9779984951 * lCbrt - 2.428592205 * mCbrt + 0.4505937099 * sCbrt
  const c = 0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.808675766 * sCbrt

  return { L, a, c }
}

// Scale component for difference calculation
function scaleComponentForDiff(x: number, chroma: number) {
  return x / (1e-6 + Math.pow(chroma, 0.5))
}

// Convert bits to Lab values
function bitsToLab(ll: number, aaa: number, bbb: number) {
  const L = (ll / 0b11) * 0.6 + 0.2
  const a = (aaa / 0b1000) * 0.7 - 0.35
  const b = ((bbb + 1) / 0b1000) * 0.7 - 0.35
  return { L, a, b }
}

// Find the best bit configuration for OkLab values
function findOklabBits(targetL: number, targetA: number, targetB: number) {
  const targetChroma = Math.hypot(targetA, targetB)
  const scaledTargetA = scaleComponentForDiff(targetA, targetChroma)
  const scaledTargetB = scaleComponentForDiff(targetB, targetChroma)

  let bestBits = [0, 0, 0]
  let bestDifference = Number.POSITIVE_INFINITY

  for (let ll = 0; ll <= 0b11; ll++) {
    for (let aaa = 0; aaa <= 0b111; aaa++) {
      for (let bbb = 0; bbb <= 0b111; bbb++) {
        const { L, a, b } = bitsToLab(ll, aaa, bbb)
        const chroma = Math.hypot(a, b)
        const scaledA = scaleComponentForDiff(a, chroma)
        const scaledB = scaleComponentForDiff(b, chroma)

        const difference = Math.hypot(L - targetL, scaledA - scaledTargetA, scaledB - scaledTargetB)

        if (difference < bestDifference) {
          bestDifference = difference
          bestBits = [ll, aaa, bbb]
        }
      }
    }
  }

  return { ll: bestBits[0], aaa: bestBits[1], bbb: bestBits[2] }
}

// Clamp value between min and max
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer())

      // Get image metadata
      const metadata = await sharp(buffer).metadata()
      const { width, height } = metadata

      // Check if image is opaque
      const stats = await sharp(buffer).stats()
      const isOpaque = stats.isOpaque

      if (!isOpaque) {
        return NextResponse.json(
          {
            width,
            height,
            opaque: false,
            message: "Image has transparency, LQIP not generated",
          },
          { status: 200 },
        )
      }

      // Get dominant color
      const { dominant } = await sharp(buffer).resize(10, 10, { fit: "cover" }).stats()

      const dominantColor = {
        r: dominant.r,
        g: dominant.g,
        b: dominant.b,
      }

      // Convert dominant color to OkLab
      const { L: rawBaseL, a: rawBaseA, c: rawBaseC } = rgbToOkLab(dominantColor)

      // Find best bit representation
      const { ll, aaa, bbb } = findOklabBits(rawBaseL, rawBaseA, rawBaseC)
      const { L: baseL, a: baseA, b: baseB } = bitsToLab(ll, aaa, bbb)

      // Generate 3x2 preview
      const previewBuffer = await sharp(buffer)
        .resize(3, 2, { fit: "fill" })
        .sharpen({ sigma: 1 })
        .removeAlpha()
        .raw()
        .toBuffer()

      // Process each cell in the 3x2 grid
      const cells = []
      for (let i = 0; i < 6; i++) {
        const r = previewBuffer[i * 3]
        const g = previewBuffer[i * 3 + 1]
        const b = previewBuffer[i * 3 + 2]
        cells.push(rgbToOkLab({ r, g, b }))
      }

      // Calculate relative lightness values
      const values = cells.map(({ L }) => clamp(0.5 + L - baseL, 0, 1))

      // Encode to integer format
      const ca = Math.round(values[0] * 0b11)
      const cb = Math.round(values[1] * 0b11)
      const cc = Math.round(values[2] * 0b11)
      const cd = Math.round(values[3] * 0b11)
      const ce = Math.round(values[4] * 0b11)
      const cf = Math.round(values[5] * 0b11)

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
        (bbb & 0b111)

      // Sanity check
      if (lqip < -999_999 || lqip > 999_999) {
        return NextResponse.json({ error: `Invalid LQIP value: ${lqip}` }, { status: 500 })
      }

      return NextResponse.json({
        width,
        height,
        opaque: true,
        dominantColor,
        lqip,
        baseColor: {
          l: baseL,
          a: baseA,
          b: baseB,
        },
        values,
      })
    } catch (error) {
      console.error("Error processing image:", error)
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Failed to process image",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error handling form data:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to handle form data",
      },
      { status: 500 },
    )
  }
}
