"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { CssImplementation } from "./css-implementation";

interface LqipData {
  src: string;
  lqip: number;
  width: number;
  height: number;
}

export function LqipDemo() {
  const [placeholderActive, setPlaceholderActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultImage: LqipData = {
    src: "https://picsum.photos/seed/87/1200/800",
    lqip: 513379,
    width: 1200,
    height: 800,
  };

  const [imageData, setImageData] = useState<LqipData>(defaultImage);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setLoading(true);
    setError(null);

    const objectUrl = URL.createObjectURL(file);

    try {
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
        return {
          ...prevState,
          src: objectUrl,
          lqip: serverData.lqip,
        };
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
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const target = e.currentTarget as HTMLInputElement;
      if (!target?.files?.length) return;

      handleFileUpload({
        target,
        currentTarget: target,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
      } as React.ChangeEvent<HTMLInputElement>);
    };
    input.click();
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
                <Image
                  src={imageData.src}
                  alt=""
                  className={`w-full h-full object-cover ${
                    placeholderActive && "force-lqip"
                  }`}
                  width={imageData.width}
                  height={imageData.height}
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
