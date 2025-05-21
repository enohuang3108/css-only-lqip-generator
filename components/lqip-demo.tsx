"use client"

import type React from "react"

import { LqipImage } from "@/components/lqip-image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { extractLqipColors } from "@/lib/lqip"
import { Loader2, Upload } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface LqipData {
  src: string
  alt: string
  lqip: number
  width: number
  height: number
}

// Client-side LQIP generation
async function generateClientSideLqip(file: File): Promise<number> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      // If we can't get a canvas context, return a default LQIP value
      resolve(999999)
      return
    }

    const img = new Image()
    img.onload = () => {
      // Resize to 3x2 grid
      canvas.width = 3
      canvas.height = 2
      ctx.drawImage(img, 0, 0, 3, 2)

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, 3, 2)
      const data = imageData.data

      // Calculate average color
      let r = 0,
        g = 0,
        b = 0
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }
      r = Math.round(r / (data.length / 4))
      g = Math.round(g / (data.length / 4))
      b = Math.round(b / (data.length / 4))

      // Generate a simple LQIP value
      const ll = Math.round(((r + g + b) / 765) * 3) & 0b11
      const aaa = Math.round((r / 255) * 7) & 0b111
      const bbb = Math.round((b / 255) * 7) & 0b111

      // Generate cell values
      const cells = []
      for (let i = 0; i < 6; i++) {
        const idx = i * 4
        const cellR = data[idx]
        const cellG = data[idx + 1]
        const cellB = data[idx + 2]
        const brightness = (cellR + cellG + cellB) / 765
        cells.push(Math.round(brightness * 3) & 0b11)
      }

      // Pack into LQIP format
      const lqip =
        -(2 ** 19) +
        ((cells[0] & 0b11) << 18) +
        ((cells[1] & 0b11) << 16) +
        ((cells[2] & 0b11) << 14) +
        ((cells[3] & 0b11) << 12) +
        ((cells[4] & 0b11) << 10) +
        ((cells[5] & 0b11) << 8) +
        ((ll & 0b11) << 6) +
        ((aaa & 0b111) << 3) +
        (bbb & 0b111)

      resolve(lqip)
    }

    img.onerror = () => {
      // If we can't load the image, return a default LQIP value
      resolve(999999)
    }

    img.src = URL.createObjectURL(file)
  })
}

export function LqipDemo() {
  const [showOriginal, setShowOriginal] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Default example image with pre-computed LQIP value
  const defaultImage: LqipData = {
    src: "https://images.unsplash.com/photo-1682687982501-1e58ab814714",
    alt: "Mountain landscape",
    lqip: 999999,
    width: 1200,
    height: 800,
  }

  const [imageData, setImageData] = useState<LqipData>(defaultImage)
  const [lqipDetails, setLqipDetails] = useState(extractLqipColors(defaultImage.lqip))

  // Update LQIP details when imageData changes
  useEffect(() => {
    setLqipDetails(extractLqipColors(imageData.lqip))
  }, [imageData.lqip])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]
    setLoading(true)
    setError(null)

    try {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file)

      // Generate LQIP using client-side processing
      const lqip = await generateClientSideLqip(file)

      // Load the image to get dimensions
      const img = new Image()
      img.onload = () => {
        // Update image data with the uploaded image and generated LQIP
        setImageData({
          src: objectUrl,
          alt: file.name,
          width: img.width,
          height: img.height,
          lqip: lqip,
        })

        setLoading(false)
      }

      img.onerror = () => {
        setError("Failed to load image")
        setLoading(false)
      }

      img.src = objectUrl
    } catch (err) {
      console.error("Error in handleFileUpload:", err)
      setError("Failed to process image")
      setLoading(false)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    } else {
      // Fallback if the ref isn't working
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.onchange = (e) => handleFileUpload(e as React.ChangeEvent<HTMLInputElement>)
      input.click()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Tabs defaultValue="demo" className="w-full">
        <div className="px-6 pt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="explanation">How It Works</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="demo" className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="aspect-[3/2] relative rounded-lg overflow-hidden">
                <LqipImage
                  src={imageData.src}
                  alt={imageData.alt}
                  lqip={imageData.lqip}
                  width={imageData.width}
                  height={imageData.height}
                  isLoaded={showOriginal}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button onClick={() => setShowOriginal(!showOriginal)} variant="outline">
                  {showOriginal ? "Show Placeholder" : "Show Original"}
                </Button>
                <Button onClick={handleUploadClick} variant="outline" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
              {error && <p className="text-amber-500 text-sm mt-2 text-center">Note: {error}</p>}
              <p className="text-gray-500 text-xs mt-2 text-center">
                Running in preview mode with client-side LQIP generation
              </p>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium mb-3">LQIP Details</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">LQIP Integer:</span> {imageData.lqip}
                </p>
                <p>
                  <span className="font-medium">Base Color (OkLab):</span> L: {lqipDetails.l.toFixed(2)}, a:{" "}
                  {lqipDetails.a.toFixed(2)}, b: {lqipDetails.b.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Cell Values:</span> [
                  {lqipDetails.cells.map((c) => c.toFixed(2)).join(", ")}]
                </p>
                <div className="mt-4">
                  <p className="font-medium mb-2">Color Preview:</p>
                  <div
                    className="h-10 rounded-md"
                    style={{
                      backgroundColor: `oklch(${lqipDetails.l} ${Math.hypot(lqipDetails.a, lqipDetails.b)} ${Math.atan2(
                        lqipDetails.b,
                        lqipDetails.a,
                      )})`,
                    }}
                  />
                </div>
                <div className="mt-4">
                  <p className="font-medium mb-2">Grid Preview:</p>
                  <div className="grid grid-cols-3 grid-rows-2 gap-1 h-20">
                    {lqipDetails.cells.map((cell, i) => (
                      <div
                        key={i}
                        className="rounded-sm"
                        style={{
                          backgroundColor: `oklch(${lqipDetails.l * (0.5 + cell)} ${Math.hypot(
                            lqipDetails.a,
                            lqipDetails.b,
                          )} ${Math.atan2(lqipDetails.b, lqipDetails.a)})`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">HTML Usage</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                {`<img src="${imageData.src}" style="--lqip:${imageData.lqip}" />`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">CSS Implementation</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                {`.lqip-container {
  position: relative;
}

.lqip-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.lqip-placeholder::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    /* Top row */
    linear-gradient(
      to right,
      oklch(
          calc(var(--lqip-l) * (0.5 + var(--lqip-c1)))
            calc(sqrt(var(--lqip-a) * var(--lqip-a) + var(--lqip-b) * var(--lqip-b)))
            calc(atan2(var(--lqip-b), var(--lqip-a)))
        )
        0% 0%,
      oklch(
          calc(var(--lqip-l) * (0.5 + var(--lqip-c2)))
            calc(sqrt(var(--lqip-a) * var(--lqip-a) + var(--lqip-b) * var(--lqip-b)))
            calc(atan2(var(--lqip-b), var(--lqip-a)))
        )
        33.33% 0%,
      oklch(
          calc(var(--lqip-l) * (0.5 + var(--lqip-c3)))
            calc(sqrt(var(--lqip-a) * var(--lqip-a) + var(--lqip-b) * var(--lqip-b)))
            calc(atan2(var(--lqip-b), var(--lqip-a)))
        )
        66.66% 0%,
    /* Bottom row */
    linear-gradient(
      to right,
      oklch(
          calc(var(--lqip-l) * (0.5 + var(--lqip-c4)))
            calc(sqrt(var(--lqip-a) * var(--lqip-a) + var(--lqip-b) * var(--lqip-b)))
            calc(atan2(var(--lqip-b), var(--lqip-a)))
        )
        0% 100%,
      oklch(
          calc(var(--lqip-l) * (0.5 + var(--lqip-c5)))
            calc(sqrt(var(--lqip-a) * var(--lqip-a) + var(--lqip-b) * var(--lqip-b)))
            calc(atan2(var(--lqip-b), var(--lqip-a)))
        )
        33.33% 100%,
      oklch(
          calc(var(--lqip-l) * (0.5 + var(--lqip-c6)))
            calc(sqrt(var(--lqip-a) * var(--lqip-a) + var(--lqip-b) * var(--lqip-b)))
            calc(atan2(var(--lqip-b), var(--lqip-a)))
        )
        66.66% 100%;
  background-size: 100% 100%;
  filter: blur(20px);
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">JavaScript Usage</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                {`// Extract LQIP values from integer
function extractLqipColors(lqip) {
  // Extract the bits from the LQIP integer
  const bits = lqip + 2 ** 19;

  const ca = (bits >> 18) & 0b11;
  const cb = (bits >> 16) & 0b11;
  const cc = (bits >> 14) & 0b11;
  const cd = (bits >> 12) & 0b11;
  const ce = (bits >> 10) & 0b11;
  const cf = (bits >> 8) & 0b11;
  const ll = (bits >> 6) & 0b11;
  const aaa = (bits >> 3) & 0b111;
  const bbb = bits & 0b111;

  // Convert bits to OkLab values
  const l = (ll / 0b11) * 0.6 + 0.2;
  const a = (aaa / 0b1000) * 0.7 - 0.35;
  const b = ((bbb + 1) / 0b1000) * 0.7 - 0.35;

  // Convert 2-bit values to normalized values [0-1]
  const cells = [ca / 0b11, cb / 0b11, cc / 0b11, cd / 0b11, ce / 0b11, cf / 0b11];

  return { l, a, b, cells };
}`}
              </pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="explanation" className="p-6">
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-lg font-medium">How LQIP Works</h3>

            <p>
              The LQIP (Low-Quality Image Placeholder) technique improves perceived loading performance by showing an
              instant placeholder while the full image loads.
            </p>

            <h4 className="font-medium mt-4">The LQIP Integer Format</h4>
            <p>The LQIP integer packs multiple pieces of information into a single number:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Base color in OkLab color space (L, a, b components)</li>
              <li>A 3×2 grid of relative lightness values</li>
            </ul>

            <h4 className="font-medium mt-4">Encoding Process</h4>
            <ol className="list-decimal pl-6 space-y-1 mt-2">
              <li>Extract the dominant color from the image</li>
              <li>Convert to OkLab color space for better perceptual uniformity</li>
              <li>Quantize the color components (L: 2 bits, a: 3 bits, b: 3 bits)</li>
              <li>Downsample the image to a 3×2 grid</li>
              <li>Calculate relative lightness values for each cell</li>
              <li>Pack all values into a single integer using bit operations</li>
            </ol>

            <h4 className="font-medium mt-4">Benefits</h4>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Extremely compact (single integer vs. data URL)</li>
              <li>Can be stored as a CSS custom property</li>
              <li>Provides color and structure information</li>
              <li>Improves perceived loading performance</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
