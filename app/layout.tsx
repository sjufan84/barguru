import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { PostHogProvider } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BarGuru - Ingredient-first cocktail inspiration",
    template: "%s | BarGuru",
  },
  description:
    "BarGuru helps bartenders and bar managers turn surplus ingredients into standout cocktails with smart flavor pairings and service-ready specs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PostHog rewrite rules for privacy-compliant tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (document.location.hostname === 'localhost') {
                console.log('PostHog tracking enabled for development');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
