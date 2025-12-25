import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Dimensions for Open Graph images
export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const variant = (searchParams.get("variant") || "default") as
    | "default"
    | "results"
    | "competitors";

  // Variant-specific content
  const variantConfig = {
    default: {
      headline: "Decisions you can defend.",
      subtitle: "Evidence-bound opportunities with confidence boundaries.",
      badge: null,
    },
    results: {
      headline: "Results — Plinth",
      subtitle: null,
      badge: "Results",
    },
    competitors: {
      headline: "Competitors — Plinth",
      subtitle: null,
      badge: "Competitors",
    },
  };

  const config = variantConfig[variant];

  // Use system fonts for reliability
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a", // Dark background
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
          position: "relative",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
            padding: "80px",
            zIndex: 1,
          }}
        >
          {/* Badge (if variant has one) */}
          {config.badge && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 24px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                fontSize: "18px",
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {config.badge}
            </div>
          )}

          {/* Plinth wordmark */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-1px",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            Plinth
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: 600,
              color: "#ffffff",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: 1.2,
              fontFamily: "system-ui, -apple-system, sans-serif",
              marginBottom: "16px",
            }}
          >
            {config.headline}
          </div>

          {/* Subtitle (only for default variant) */}
          {config.subtitle && (
            <div
              style={{
                fontSize: "28px",
                fontWeight: 300,
                color: "rgba(255, 255, 255, 0.75)",
                textAlign: "center",
                maxWidth: "800px",
                lineHeight: 1.3,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {config.subtitle}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}

