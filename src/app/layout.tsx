import type { Metadata } from "next";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";

export const metadata: Metadata = {
  title: "Locus — Geo-Social on Solana",
  description:
    "Discover and claim hidden drops across the city. A geo-social dApp built on Solana for the Graveyard Hackathon 2026.",
  keywords: ["solana", "geo-social", "web3", "graveyard", "hackathon", "nft"],
  openGraph: {
    title: "Locus — Geo-Social on Solana",
    description: "Discover and claim hidden drops across the city.",
    type: "website",
  },
};

/**
 * Root Layout
 *
 * CRITICAL: AppWalletProvider wraps ALL children here.
 * This ensures every component in the tree has access to:
 *   - ConnectionProvider (RPC connection)
 *   - WalletProvider (wallet state: publicKey, signTransaction, etc.)
 *   - WalletModalProvider (connect modal UI)
 *
 * Previous bug: Components using useWallet() were rendered outside the
 * provider tree, causing "read publicKey on WalletContext" errors.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#a78bfa" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Locus" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-512.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-512.svg" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-void text-crypt-100 overflow-hidden h-[100dvh]">
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}
