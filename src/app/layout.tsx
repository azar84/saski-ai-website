import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { prisma } from "../lib/db";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import DesignSystemProvider from "../components/layout/DesignSystemProvider";
import DynamicFavicon from "../components/layout/DynamicFavicon";
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
        faviconUrl: true,
        faviconLightUrl: true,
        faviconDarkUrl: true
      }
    });
    
    return {
      default: siteSettings?.faviconDarkUrl || siteSettings?.faviconUrl, // Always prefer dark favicon
      light: siteSettings?.faviconLightUrl,
      dark: siteSettings?.faviconDarkUrl
    };
  } catch (error) {
    console.error('Failed to fetch favicon from database:', error);
    return {
      default: null,
      light: null,
      dark: null
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const faviconData = await getDynamicFavicon();
  const defaultFavicon = faviconData.default || '/favicon.ico';
  
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
          url: defaultFavicon,
          sizes: '32x32',
          type: defaultFavicon.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon',
        },
        {
          url: defaultFavicon,
          sizes: '16x16', 
          type: defaultFavicon.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon',
        },
        // Fallback to default favicon.svg
        {
          url: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
        }
      ],
      shortcut: defaultFavicon,
      apple: defaultFavicon,
      other: [
        {
          rel: 'icon',
          url: defaultFavicon + '?v=' + Date.now(),
          type: defaultFavicon.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon',
        }
      ]
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
    other: {
      'color-scheme': 'light'
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get favicon URL for dynamic injection
  const faviconData = await getDynamicFavicon();
  const faviconUrl = faviconData.default;

  return (
    <html lang="en" suppressHydrationWarning data-theme="light" style={{colorScheme: 'light'}}>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <DesignSystemProvider>
            <ThemeProvider
              attribute="data-theme"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange={false}
            >
              <DynamicFavicon faviconUrl={faviconUrl} />
              {children}
            </ThemeProvider>
          </DesignSystemProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
