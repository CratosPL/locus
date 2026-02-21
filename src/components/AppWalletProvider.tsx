"use client";

import React, { useMemo, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { SOLANA_CLUSTER } from "@/utils/config";

// Import default wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface Props {
  children: ReactNode;
}

export default function AppWalletProvider({ children }: Props) {
  const endpoint = useMemo(() => clusterApiUrl(SOLANA_CLUSTER), []);

  // Empty array — wallets auto-register via wallet-standard protocol
  // Phantom, Solflare, Backpack etc. all register themselves
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
