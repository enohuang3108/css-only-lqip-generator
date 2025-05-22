"use client"

import { LqipImage } from "@/components/lqip-image"
import { useState } from "react"

// Sample gallery images with pre-computed LQIP values
const galleryImages = [
  {
    src: "https://picsum.photos/seed/a/600/400",
    lqip: -96797,
    width: 1200,
    height: 800,
  },
  {
    src: "https://picsum.photos/seed/2/600/400",
    lqip: -169373,
    width: 1200,
    height: 800,
  },
  {
    src: "https://picsum.photos/seed/3/600/400",
    lqip: -88733,
    width: 1200,
    height: 800,
  },
  {
    src: "https://picsum.photos/seed/4/600/400",
    lqip: -174669,
    width: 1200,
    height: 800,
  },
  {
    src: "https://picsum.photos/seed/5/600/400",
    lqip: 431395,
    width: 1200,
    height: 800,
  },
  {
    src: "https://picsum.photos/seed/6/600/400",
    lqip: -432668,
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
              lqip={image.lqip}
              width={image.width}
              height={image.height}
              onLoad={() => handleImageLoad(image.src)}
              isLoaded={loadingState[image.src]}
              className="object-cover w-full h-full transition-opacity duration-500"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900">LQIP Hash: {image.lqip}</h3>
            <p className="text-sm text-gray-500 mt-1">{loadingState[image.src] ? "Loaded" : "Loading..."}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
