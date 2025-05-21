"use client"

import type React from "react"

import Image from "next/image"
import { useEffect, useState } from "react"

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

  const lqipStyle = { "--lqip": lqip } as React.CSSProperties

  useEffect(() => {
    setLoaded(isLoaded)
  }, [isLoaded])

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  return (
    <div className="lqip-container relative w-full h-full">
      <div className={`lqip-placeholder absolute inset-0 w-full h-full`} aria-hidden="true" style={lqipStyle}/>
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
