import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  width,
  height,
  className,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md",
        className
      )}
      style={{ width, height }}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
          Loading...
        </div>
      )}

      <Image
        src={!error ? src : "/placeholder.svg?height=100&width=100"}
        alt={alt}
        width={width}
        height={height}
        priority
        className={cn(
          "object-contain w-full h-full transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
}
