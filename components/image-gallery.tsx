"use client"

import { LqipImage } from "@/components/lqip-image"
import { useState } from "react"

// Sample gallery images with pre-computed LQIP values
const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1682687982501-1e58ab814714",
    alt: "Mountain landscape",
    lqip: 999999,
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    alt: "Yosemite Valley",
    lqip: -520890,
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    alt: "Sunset over the ocean",
    lqip: -523456,
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    alt: "Forest path",
    lqip: -522789,
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    alt: "Sunlight through trees",
    lqip: -521234,
    width: 1200,
    height: 800,
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
    alt: "Lake and mountains",
    lqip: -525678,
    width: 1200,
    height: 800,
  },
]

export function ImageGallery() {
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({})

  const handleImageLoad = (src: string) => {
    setLoadingState((prev) => ({
      ...prev,
      [src]: true,
    }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {galleryImages.map((image, index) => (
        <div
          key={index}
          className="rounded-lg overflow-hidden shadow-md bg-white transition-all duration-300 hover:shadow-xl"
        >
          <div className="relative aspect-[3/2] overflow-hidden">
            <LqipImage
              src={image.src}
              alt={image.alt}
              lqip={image.lqip}
              width={image.width}
              height={image.height}
              onLoad={() => handleImageLoad(image.src)}
              isLoaded={loadingState[image.src]}
              className="object-cover w-full h-full transition-opacity duration-500"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900">{image.alt}</h3>
            <h3 className="font-medium text-gray-900">{image.lqip}</h3>
            <p className="text-sm text-gray-500 mt-1">{loadingState[image.src] ? "Loaded" : "Loading..."}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
