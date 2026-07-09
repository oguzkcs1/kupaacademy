"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface KupaLogoProps {
  className?: string;
  /** "dark" = siyah bg üzerinde beyaz logo (sidebar/login için — mix-blend-mode:screen ile siyah bg kalkar) */
  /** "color" = renkli logo açık zemin için */
  variant?: "dark" | "color";
  width?: number;
  height?: number;
}

export function KupaLogo({ className, variant = "dark", width = 140, height = 140 }: KupaLogoProps) {
  const src = variant === "dark" ? "/logo-dark.png" : "/logo-color.png";
  return (
    <Image
      src={src}
      alt="Kupa Coffee Co."
      width={width}
      height={height}
      style={variant === "dark" ? { mixBlendMode: "screen" } : undefined}
      className={cn("object-contain", className)}
      priority
    />
  );
}
