"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { extractLqipColors } from "@/lib/lqip-utils"

interface LqipImageProps {
  src: string
  alt: string
  lqip: number
  width: number
  height: number
  onLoad?: () => void
  isLoaded?: boolean
  className?: string
}

export function LqipImage({ src, alt, lqip, width, height, onLoad, isLoaded = false, className = "" }: LqipImageProps) {
  const [loaded, setLoaded] = useState(isLoaded)
  const { l, a, b, cells } = extractLqipColors(lqip)

  // Create CSS variables for the LQIP colors
  const lqipStyle = {
    "--lqip": lqip,
    "--lqip-l": l.toFixed(2),
    "--lqip-a": a.toFixed(2),
    "--lqip-b": b.toFixed(2),
    "--lqip-c1": cells[0].toFixed(2),
    "--lqip-c2": cells[1].toFixed(2),
    "--lqip-c3": cells[2].toFixed(2),
    "--lqip-c4": cells[3].toFixed(2),
    "--lqip-c5": cells[4].toFixed(2),
    "--lqip-c6": cells[5].toFixed(2),
  } as React.CSSProperties

  useEffect(() => {
    setLoaded(isLoaded)
  }, [isLoaded])

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  return (
    <div className="lqip-container relative w-full h-full" style={lqipStyle}>
      <div className={`lqip-placeholder absolute inset-0 ${loaded ? "opacity-0" : "opacity-100"}`} aria-hidden="true" />
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}
