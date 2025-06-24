import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { prisma } from "../lib/db";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import DesignSystemProvider from "../components/layout/DesignSystemProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

// Function to get dynamic favicon
async function getDynamicFavicon() {
  try {
    const siteSettings = await prisma.siteSettings.findFirst({
      select: {
        faviconUrl: true
      }
    });
    return siteSettings?.faviconUrl;
  } catch (error) {
    console.error('Failed to fetch favicon from database:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const dynamicFavicon = await getDynamicFavicon();
  
  return {
    title: "Saski AI - Transform Your Customer Communication with AI",
    description: "Empower your business with intelligent conversations across WhatsApp, SMS, Telegram, and more. Automate responses, capture leads, and delight customers 24/7.",
    keywords: "AI chatbot, customer service automation, WhatsApp business, multi-channel communication, lead generation",
    authors: [{ name: "Saski AI" }],
    creator: "Saski AI",
    publisher: "Saski AI",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://saskiai.com"),
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [
        {
          url: dynamicFavicon || '/favicon.ico',
          sizes: '32x32',
          type: 'image/x-icon',
        },
        {
          url: dynamicFavicon || '/favicon.ico',
          sizes: '16x16',
          type: 'image/x-icon',
        }
      ],
      shortcut: dynamicFavicon || '/favicon.ico',
      apple: dynamicFavicon || '/favicon.ico',
    },
    openGraph: {
      title: "Saski AI - Transform Your Customer Communication with AI",
      description: "Empower your business with intelligent conversations across WhatsApp, SMS, Telegram, and more. Automate responses, capture leads, and delight customers 24/7.",
      url: "https://saskiai.com",
      siteName: "Saski AI",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Saski AI - AI-Powered Customer Communication",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Saski AI - Transform Your Customer Communication with AI",
      description: "Empower your business with intelligent conversations across WhatsApp, SMS, Telegram, and more.",
      images: ["/og-image.jpg"],
      creator: "@saskiai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <DesignSystemProvider>
            <ThemeProvider
              attribute="data-theme"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange={false}
            >
              {children}
            </ThemeProvider>
          </DesignSystemProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
