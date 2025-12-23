import * as React from "react";
import { cn } from "@/lib/utils";

export function Surface({
  className,
  glow = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-[var(--plinth-radius-lg)] border",
        "bg-white",
        "border-[color:rgba(var(--plinth-border))]",
        "shadow-[var(--plinth-shadow-2)]",
        glow && "overflow-hidden",
        className
      )}
      {...props}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{ background: "var(--plinth-glow)" }}
        />
      )}
      <div className={cn(glow && "relative")}>{props.children}</div>
    </div>
  );
}

export function CardShell({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--plinth-radius-md)] border bg-white",
        "border-[color:rgba(var(--plinth-border))]",
        "shadow-[var(--plinth-shadow-1)]",
        className
      )}
      {...props}
    />
  );
}

