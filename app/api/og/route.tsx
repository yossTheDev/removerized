// Vercel OG Image Implementation - COMMENTED OUT
// Uncomment to reactivate

// Empty export to make this a valid TypeScript module
export { }

/*
import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

const TOOL_ACCENTS: Record<string, string> = {
  remover: "#A855F7",
  upscaler: "#3B82F6",
  colorizer: "#F59E0B",
}

const SEO_CONTENT: Record<string, { heading: string; subheading: string }> = {
  remover: {
    heading: "AI Background Removal",
    subheading: "Instant & Private",
  },
  upscaler: {
    heading: "AI Image Upscaler",
    subheading: "Enhance Resolution",
  },
  colorizer: {
    heading: "AI Image Colorizer",
    subheading: "Restore Old Photos",
  },
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tool = searchParams.get("tool") || "remover"
    const accentColor = TOOL_ACCENTS[tool] || TOOL_ACCENTS.remover
    const content = SEO_CONTENT[tool] || SEO_CONTENT.remover

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
            backgroundColor: "#050505",
            backgroundImage: "radial-gradient(circle at top right, " + accentColor + "20, transparent), radial-gradient(circle at bottom left, " + accentColor + "10, transparent)",
            color: "white",
            padding: "80px",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Removerized
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "30px",
                fontWeight: "semibold",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: accentColor,
                margin: "0 0 20px 0",
              }}
            >
              {content.subheading}
            </p>
            <h1
              style={{
                fontSize: "80px",
                fontWeight: "bold",
                margin: "0",
                lineHeight: "1.1",
              }}
            >
              {content.heading}
            </h1>
            <p
              style={{
                fontSize: "28px",
                color: "rgba(255,255,255,0.5)",
                marginTop: "40px",
                maxWidth: "800px",
              }}
            >
              100% Client-Side • Private AI • No Data Leaves Your Device
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "80px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: accentColor,
                boxShadow: "0 0 10px " + accentColor,
              }}
            />
            <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.3)" }}>
              Works Offline
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
*/
