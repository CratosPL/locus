import { Cluster } from "@solana/web3.js";

export const SOLANA_CLUSTER: Cluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as Cluster) || "testnet";

export const EXPLORER_URL = (tx: string) => `https://explorer.solana.com/tx/${tx}?cluster=${SOLANA_CLUSTER}`;
export const ADDRESS_URL = (addr: string) => `https://explorer.solana.com/address/${addr}?cluster=${SOLANA_CLUSTER}`;
