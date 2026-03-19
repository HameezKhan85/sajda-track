import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  title: "Sajda — Salah Tracker",
  description: "A beautiful and intuitive prayer tracking application. Track your daily prayers, manage Qaza, and build consistency.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.svg",
    apple: "/icons/icon-512x512.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#3a5245",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
