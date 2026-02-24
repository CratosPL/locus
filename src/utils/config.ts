import { clusterApiUrl, PublicKey } from "@solana/web3.js";

// Change to 'devnet' or 'mainnet-beta' for production
export const SOLANA_CLUSTER = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as any) || "devnet";

export const SOLANA_ENDPOINT = SOLANA_CLUSTER === "devnet"
  ? clusterApiUrl("devnet")
  : SOLANA_CLUSTER === "testnet"
    ? clusterApiUrl("testnet")
    : "https://api.mainnet-beta.solana.com";

// REAL DEPLOYED PROGRAM ID on Devnet
export const PROGRAM_ID = new PublicKey(
  'HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn'
);

export const ADDRESS_URL = (address: string) =>
  `https://explorer.solana.com/address/${address}?cluster=${SOLANA_CLUSTER}`;

export const TX_URL = (signature: string) =>
  `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`;
