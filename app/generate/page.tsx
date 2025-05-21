"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LqipImage } from "@/components/lqip-image"
import { Loader2 } from "lucide-react"

interface LqipResult {
  width: number
  height: number
  opaque: boolean
  dominantColor?: {
    r: number
    g: number
    b: number
  }
  lqip?: number
  baseColor?: {
    l: number
    a: number
    b: number
  }
  values?: number[]
  message?: string
  error?: string
}

export default function GeneratePage() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [result, setResult] = useState<LqipResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setImageUrl(URL.createObjectURL(e.target.files[0]))
      setResult(null)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select an image file")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/lqip", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate LQIP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Generate LQIP</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>Upload an image to generate its LQIP representation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              {imageUrl && (
                <div className="mt-4 aspect-[3/2] relative rounded-lg overflow-hidden">
                  <img src={imageUrl || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}

              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={!file || loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate LQIP"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>The generated LQIP information</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {result.error ? (
                  <div className="text-red-500">{result.error}</div>
                ) : result.message ? (
                  <div className="text-amber-500">{result.message}</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Original</h3>
                        <div className="aspect-[3/2] relative rounded-lg overflow-hidden">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt="Original"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">LQIP Preview</h3>
                        <div className="aspect-[3/2] relative rounded-lg overflow-hidden">
                          {result.lqip && (
                            <LqipImage
                              src={imageUrl}
                              alt="LQIP Preview"
                              lqip={result.lqip}
                              width={result.width}
                              height={result.height}
                              isLoaded={false}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Dimensions:</div>
                        <div>
                          {result.width} × {result.height}px
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">LQIP Integer:</div>
                        <div className="font-mono">{result.lqip}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">CSS Property:</div>
                        <div className="font-mono">--lqip:{result.lqip}</div>
                      </div>
                      {result.dominantColor && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium">Dominant Color:</div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: `rgb(${result.dominantColor.r}, ${result.dominantColor.g}, ${result.dominantColor.b})`,
                              }}
                            />
                            <span className="font-mono">
                              rgb({result.dominantColor.r}, {result.dominantColor.g}, {result.dominantColor.b})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">HTML Usage:</h3>
                      <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs">
                        {`<img src="your-image.jpg" width="${result.width}" height="${result.height}" style="--lqip:${result.lqip}" />`}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Analyzing image...</p>
                  </div>
                ) : (
                  <p>Upload an image and generate LQIP to see results</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
