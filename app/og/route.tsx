import { ImageResponse } from "takumi-js/response";
import OgImage from "./OgImage";
import { readFileSync } from "fs";
import { join } from "path";

// Read font files from the public directory
const fontRegular = readFileSync(join(process.cwd(), "public/fonts/InstrumentSerif-Regular.ttf"));
const fontInter = readFileSync(join(process.cwd(), "public/fonts/Inter-Regular.ttf"));
const fontInterMedium = readFileSync(join(process.cwd(), "public/fonts/Inter-Medium.ttf"));

// Read the logo to embed it as a base64 data URI
const logoBuffer = readFileSync(join(process.cwd(), "public/splitupi-logo.png"));
const logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;

export function GET(request: Request) {
  const url = new URL(request.url);
  // Optional URL parameters for dynamic generation
  const title = url.searchParams.get("title") ?? "split bills, paid in seconds.";
  const description = url.searchParams.get("description") ?? "Create a split, add a few numbers, and everyone pays you instantly over UPI. No app, no signup.";

  return new ImageResponse(
    <OgImage title={title} description={description} logoDataUri={logoDataUri} />,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Instrument Serif",
          data: fontRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: fontInter,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: fontInterMedium,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
