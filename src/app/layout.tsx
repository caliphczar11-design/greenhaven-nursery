import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "@/components/query-provider";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GreenHaven Nursery — Premium Plants & Garden Essentials",
  description: "Nepal's finest online nursery. Discover flowering plants, herbs, vegetables, indoor plants and more. Expert care guides, climate-specific growing info, and doorstep delivery across Nepal.",
  keywords: ["plants", "nursery", "Nepal", "garden", "indoor plants", "herbs", "vegetables", "flowering plants", "esewa", "khalti"],
  authors: [{ name: "GreenHaven Nursery" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "GreenHaven Nursery",
    description: "Nepal's finest online nursery with premium plants and garden essentials.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${robotoSlab.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}