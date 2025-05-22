"use client";

import type React from "react";

import Image from "next/image";

interface LqipImageProps {
  src: string;
  lqip: number;
  width: number;
  height: number;
  onLoad?: () => void;
  isLoaded?: boolean;
  className?: string;
}

export function LqipImage({
  src,
  lqip,
  width,
  height,
  onLoad,
  isLoaded = false,
  className = "",
}: LqipImageProps) {
  const lqipStyle = { "--lqip": lqip } as React.CSSProperties;

  const handleLoad = () => {
    onLoad?.();
  };

  return (
    <div className="lqip-container relative w-full h-full">
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        onLoad={handleLoad}
        style={lqipStyle}
      />
    </div>
  );
}
