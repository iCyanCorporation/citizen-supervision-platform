import "./globals.css";
import { Providers } from "./providers";

// Google
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

// In the layout component, wrap the children with the Providers
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background`}>
        <Providers>{children}</Providers>

        {/* Google tags */}
        {/* <GoogleTagManager gtmId="GTM-xxx" />
      <GoogleAnalytics gaId="G-xxx" /> */}
      </body>
    </html>
  );
}
