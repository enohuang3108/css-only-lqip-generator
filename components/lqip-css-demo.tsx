"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CssImplementation } from "./css-implementation";

interface LqipData {
  src: string;
  lqip: number;
  width: number;
  height: number;
}

// Client-side LQIP generation
async function generateClientSideLqip(file: File): Promise<number> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // If we can't get a canvas context, return a default LQIP value
      resolve(999999);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Resize to 3x2 grid
      canvas.width = 3;
      canvas.height = 2;
      ctx.drawImage(img, 0, 0, 3, 2);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, 3, 2);
      const data = imageData.data;

      // Calculate average color
      let r = 0,
        g = 0,
        b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      r = Math.round(r / (data.length / 4));
      g = Math.round(g / (data.length / 4));
      b = Math.round(b / (data.length / 4));

      // Generate a simple LQIP value
      const ll = Math.round(((r + g + b) / 765) * 3) & 0b11;
      const aaa = Math.round((r / 255) * 7) & 0b111;
      const bbb = Math.round((b / 255) * 7) & 0b111;

      // Generate cell values
      const cells = [];
      for (let i = 0; i < 6; i++) {
        const idx = i * 4;
        const cellR = data[idx];
        const cellG = data[idx + 1];
        const cellB = data[idx + 2];
        const brightness = (cellR + cellG + cellB) / 765;
        cells.push(Math.round(brightness * 3) & 0b11);
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
        (bbb & 0b111);

      resolve(lqip);
    };

    img.onerror = () => {
      // If we can't load the image, return a default LQIP value
      resolve(999999);
    };

    img.src = URL.createObjectURL(file);
  });
}

export function LqipDemo() {
  const [placeholderActive, setPlaceholderActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default example image with pre-computed LQIP value
  const defaultImage: LqipData = {
    src: "https://picsum.photos/seed/87/1200/800",
    lqip: 513379,
    width: 1200,
    height: 800,
  };

  const [imageData, setImageData] = useState<LqipData>(defaultImage);
  // const lqipDetails = extractLqipColors(imageData.lqip)
  const lqipDetails = {
    l: 0,
    a: 0,
    b: 0,
    cells: [0, 0, 0, 0, 0, 0],
  };

  useEffect(() => {
    const currentSrc = imageData.src;
    // Only revoke if it's a blob URL and it's not the default image
    if (
      currentSrc &&
      currentSrc.startsWith("blob:") &&
      currentSrc !== defaultImage.src
    ) {
      return () => {
        URL.revokeObjectURL(currentSrc);
      };
    }
  }, [imageData.src, defaultImage.src]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setLoading(true);
    setError(null);

    // Create an object URL for the file. This will be used for the image src.
    // It needs to be cleaned up by the useEffect hook when imageData.src changes or component unmounts.
    const objectUrl = URL.createObjectURL(file);

    try {
      // Part 1: Get dimensions and client-side LQIP in parallel
      const clientLqipPromise = generateClientSideLqip(file);
      const dimensionsPromise = new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
          };
          img.onerror = () => {
            // If image loading for dimensions fails, revoke the objectUrl immediately
            // as it won't be set to imageData.src and thus not cleaned by useEffect.
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image to get dimensions"));
          };
          img.src = objectUrl;
        }
      );

      const [clientLqip, dimensions] = await Promise.all([
        clientLqipPromise,
        dimensionsPromise,
      ]);

      // Update UI with client-side LQIP and dimensions first
      // This will trigger the useEffect to potentially revoke the previous blob URL
      setImageData({
        src: objectUrl,
        width: dimensions.width,
        height: dimensions.height,
        lqip: clientLqip,
      });

      // Part 2: Fetch server-side LQIP
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/lqip", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const serverData = await response.json();
      setImageData((prevState) => {
        // Ensure we are updating the state for the currently displayed image (objectUrl)
        // This prevents race conditions if another file is uploaded quickly.
        if (prevState.src === objectUrl) {
          return {
            ...prevState,
            lqip: serverData.lqip, // Update with server LQIP
          };
        }
        return prevState; // Avoid updating state for a different image
      });
    } catch (err) {
      console.error("Error in handleFileUpload:", err);
      let errorMessage = "Failed to process image";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      // Fallback if the ref isn't working
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event: Event) => {
        const currentTarget = event.currentTarget as HTMLInputElement;
        if (
          currentTarget &&
          currentTarget.files &&
          currentTarget.files.length > 0
        ) {
          // Synthesize the parts of React.ChangeEvent that handleFileUpload uses.
          const syntheticReactEvent = {
            target: currentTarget,
            currentTarget,
            // React's events are pooled, these are simplified approximations
            bubbles: true,
            cancelable: false,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: event.isTrusted,
            nativeEvent: event,
            preventDefault: () => event.preventDefault(),
            isDefaultPrevented: () => event.defaultPrevented,
            stopPropagation: () => event.stopPropagation(),
            isPropagationStopped: () => false, // Simplified
            persist: () => {}, // React's persist function for events
            timeStamp: event.timeStamp,
            type: event.type,
          } as React.ChangeEvent<HTMLInputElement>;
          handleFileUpload(syntheticReactEvent);
        }
      };
      input.click();
    }
  };

  const { ca, cb, cc, cd, ce, cf, ll, aaa, bbb } = {
    ca: Math.floor((imageData.lqip + Math.pow(2, 19)) / Math.pow(2, 18)) % 4,
    cb: Math.floor((imageData.lqip + Math.pow(2, 19)) / Math.pow(2, 16)) % 4,
    cc: Math.floor((imageData.lqip + Math.pow(2, 19)) / Math.pow(2, 14)) % 4,
    cd: Math.floor((imageData.lqip + Math.pow(2, 19)) / Math.pow(2, 12)) % 4,
    ce: Math.floor((imageData.lqip + Math.pow(2, 19)) / Math.pow(2, 10)) % 4,
    cf: Math.floor((imageData.lqip + Math.pow(2, 19)) / Math.pow(2, 8)) % 4,
    ll: Math.floor((imageData.lqip + Math.pow(2, 19)) / Math.pow(2, 6)) % 4,
    aaa: Math.floor((imageData.lqip + Math.pow(2, 19)) / Math.pow(2, 3)) % 8,
    bbb: (imageData.lqip + Math.pow(2, 19)) % 8,
  };

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
                <img
                  src={imageData.src || "/placeholder.svg"}
                  alt=""
                  className={`w-full h-full object-cover ${
                    placeholderActive && "force-lqip"
                  }`}
                  style={{ "--lqip": imageData.lqip } as React.CSSProperties}
                />
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  onClick={() => setPlaceholderActive(!placeholderActive)}
                  variant="outline"
                >
                  {placeholderActive ? "Show Original" : "Show Placeholder"}
                </Button>
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  disabled={loading}
                >
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
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {error && (
                <p className="text-amber-500 text-sm mt-2 text-center">
                  Note: {error}
                </p>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium mb-3">LQIP Details</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">LQIP Hash:</span>{" "}
                  {imageData.lqip}
                </p>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-3">LQIP Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="mt-4">
                      <p className="font-medium mb-2">Color Preview:</p>
                      <div
                        className="h-10 rounded-md"
                        style={{
                          backgroundColor: `oklab(${(ll / 3) * 0.6 + 0.2} ${
                            (aaa / 8) * 0.7 - 0.35
                          } ${(bbb / 8) * 0.7 - 0.35})`,
                        }}
                      />
                    </div>
                    <div className="mt-4">
                      <p className="font-medium mb-2">Grid Preview:</p>
                      <div className="grid grid-cols-3 grid-rows-2 gap-1 h-20">
                        <div
                          className="rounded-sm"
                          style={{
                            backgroundColor: `hsl(0 0% ${(ca / 3) * 60 + 20}%)`,
                          }}
                        />
                        <div
                          className="rounded-sm"
                          style={{
                            backgroundColor: `hsl(0 0% ${(cb / 3) * 60 + 20}%)`,
                          }}
                        />
                        <div
                          className="rounded-sm"
                          style={{
                            backgroundColor: `hsl(0 0% ${(cc / 3) * 60 + 20}%)`,
                          }}
                        />
                        <div
                          className="rounded-sm"
                          style={{
                            backgroundColor: `hsl(0 0% ${(cd / 3) * 60 + 20}%)`,
                          }}
                        />
                        <div
                          className="rounded-sm"
                          style={{
                            backgroundColor: `hsl(0 0% ${(ce / 3) * 60 + 20}%)`,
                          }}
                        />
                        <div
                          className="rounded-sm"
                          style={{
                            backgroundColor: `hsl(0 0% ${(cf / 3) * 60 + 20}%)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="p-6">
          <CssImplementation lqip={imageData.lqip} />
        </TabsContent>

        <TabsContent value="explanation" className="p-6">
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-lg font-medium">
              CSS-only LQIP Implementation
            </h3>

            <p>
              This implementation uses pure CSS to extract and render the LQIP
              placeholder, without requiring any JavaScript for the rendering
              process. This makes it extremely efficient and lightweight.
            </p>

            <h4 className="font-medium mt-4">How It Works</h4>
            <ol className="list-decimal pl-6 space-y-1 mt-2">
              <li>
                <strong>Bit Extraction:</strong> A 20-bit integer is passed via
                a CSS custom property (<code>--lqip</code>). Bit fields are
                extracted using CSS <code>calc()</code> and simulated modular
                arithmetic (e.g., <code>mod</code>, <code>floor</code>) to
                decode the base color and the brightness of each grid cell.
              </li>
              <li>
                <strong>Color and Brightness Decoding:</strong>
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>
                    The base color is encoded using the perceptually uniform
                    <strong>Oklab</strong> color space, and converted to{" "}
                    <code>rgb()</code> or <code>hsl()</code> for use as the
                    element’s background color.
                  </li>
                  <li>
                    Each of the 6 grid cells stores a 2-bit luminance value,
                    which is used to control the{" "}
                    <strong>alpha (opacity)</strong> of a radial gradient,
                    simulating brightness—not hue or saturation.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Gradient Rendering:</strong> A stack of six
                <code>radial-gradient</code> layers is rendered over the base
                color. Each gradient is precisely positioned to form one cell of
                the 3×2 layout, using its decoded alpha to approximate local
                brightness.
              </li>
              <li>
                <strong>Blur Simulation:</strong> No <code>filter: blur()</code>{" "}
                is used. Instead, visual blur is achieved through soft-edged,
                overlapping radial gradients with semi-transparent color
                stops—creating a naturally blended look without extra rendering
                cost.
              </li>
            </ol>

            <h4 className="font-medium mt-4">Benefits of CSS-only Approach</h4>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Zero JavaScript:</strong> The placeholder works entirely
                with CSS, making it functional even if JavaScript is disabled.
              </li>
              <li>
                <strong>Performance:</strong> Extremely fast rendering powered
                by the browser’s native CSS engine, without layout thrashing or
                scripting overhead.
              </li>
              <li>
                <strong>Simplicity:</strong> Just apply a CSS class and set the{" "}
                <code>--lqip</code>
                custom property with a single integer to enable the placeholder.
              </li>
            </ul>

            <h4 className="font-medium mt-4">Limitations</h4>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Browser Support:</strong> Requires modern browsers that
                support CSS custom properties, <code>calc()</code>, layered
                gradients, and modern color functions (e.g., <code>rgb()</code>{" "}
                with alpha).
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
