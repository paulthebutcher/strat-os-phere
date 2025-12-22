/**
 * Logo component
 * 
 * Reusable logo component with mark (image) and optional wordmark (text).
 * Uses next/image for optimization and CSS cropping to remove whitespace.
 */

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /**
   * Variant: "mark" (icon only) or "lockup" (mark + text)
   * @default "lockup"
   */
  variant?: "mark" | "lockup";
  /**
   * Size preset
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg";
  /**
   * Link href (wraps in Link if provided)
   * @default "/" for marketing, "/dashboard" for app
   */
  href?: string;
  /**
   * Show wordmark text (only applies to lockup variant)
   * @default true for lockup, false for mark
   */
  showText?: boolean;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Priority loading for above-the-fold logos
   * @default false
   */
  priority?: boolean;
}

const sizeMap = {
  xs: { mark: 20, text: "text-sm" },
  sm: { mark: 24, text: "text-sm" },
  md: { mark: 28, text: "text-base" },
  lg: { mark: 36, text: "text-lg" },
} as const;

export function Logo({
  variant = "lockup",
  size = "md",
  href,
  showText,
  className,
  priority = false,
}: LogoProps) {
  const isLockup = variant === "lockup";
  const shouldShowText = showText !== undefined ? showText : isLockup;
  const markSize = sizeMap[size].mark;
  const textSize = sizeMap[size].text;

  const content = (
    <div
      className={cn(
        "flex items-center gap-2",
        className
      )}
    >
      {/* Mark container with CSS cropping */}
      <div
        className={cn(
          "relative overflow-hidden rounded-md flex-shrink-0",
          "bg-transparent"
        )}
        style={{ width: markSize, height: markSize }}
      >
        <Image
          src="/brand/plinth-logo.png"
          alt="Plinth"
          width={markSize * 2}
          height={markSize * 2}
          priority={priority}
          className="object-cover object-center"
          style={{
            width: "135%",
            height: "135%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      {/* Wordmark text */}
      {shouldShowText && (
        <span
          className={cn(
            "font-semibold text-foreground",
            textSize
          )}
        >
          Plinth
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

