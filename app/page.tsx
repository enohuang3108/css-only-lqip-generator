import { ImageGallery } from "@/components/image-gallery"
import { LqipCssDemo } from "@/components/lqip-css-demo"
import { NextResponse } from "next/server"

// Add a fallback API route for development environments
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Return a default LQIP value for testing
    return NextResponse.json({
      width: 1200,
      height: 800,
      opaque: true,
      dominantColor: { r: 100, g: 150, b: 200 },
      lqip: 999999,
      baseColor: { l: 0.5, a: 0.1, b: -0.2 },
      values: [0.5, 0.6, 0.7, 0.4, 0.3, 0.5],
    })
  } catch (error) {
    console.error("Error in fallback API:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">LQIP Image Gallery</h1>
        <p className="text-gray-600 mb-8 max-w-3xl">
          This gallery demonstrates the Low-Quality Image Placeholder (LQIP) technique for improved image loading
          experiences. The placeholders are generated from a compact integer representation of the image's dominant
          color and structure.
        </p>

        <div className="space-y-12">
          {/* <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">JavaScript LQIP Demo</h2>
            <LqipDemo />
          </div> */}

          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">CSS-only LQIP Demo</h2>
            <LqipCssDemo />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Image Gallery</h2>
            <ImageGallery />
          </div>
        </div>
      </div>
    </main>
  )
}
