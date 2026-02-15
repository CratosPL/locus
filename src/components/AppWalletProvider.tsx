"use client";

import React, { useMemo, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Import default wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface Props {
  children: ReactNode;
}

/**
 * AppWalletProvider
 *
 * CRITICAL FIX: This component MUST wrap all components that use wallet hooks.
 * Previous bug: components using useWallet()/useConnection() were rendered
 * OUTSIDE this provider tree, causing "read publicKey on WalletContext" errors.
 *
 * Provider hierarchy:
 * ConnectionProvider → WalletProvider → WalletModalProvider → children
 */
export default function AppWalletProvider({ children }: Props) {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  // Wallet adapters auto-detected via wallet-standard.
  // No need to manually list Phantom, Solflare, etc. — they register themselves.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
