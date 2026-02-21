import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { SOLANA_CLUSTER } from "@/utils/config";

const PROGRAM_ID = new PublicKey(
  "HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn"
);

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const dropId = url.searchParams.get("id") || "unknown";

  const payload: ActionGetResponse = {
    title: "Locus — Claim Geo-Social Drop",
    icon: new URL("/favicon.ico", url.origin).toString(), // Fallback icon
    description: `A secret drop #${dropId} has been left for you. Walk to the location and claim it on Solana!`,
    label: "Claim Drop",
    links: {
      actions: [
        {
          label: "Claim Drop",
          href: `/api/actions/drop?id=${dropId}`,
        },
      ],
    },
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const dropId = url.searchParams.get("id");
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    if (!dropId) {
      return new Response('Missing "id" parameter', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    // Derive PDAs (same logic as useProgram.ts)
    const [dropPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("drop"), Buffer.from(dropId)],
      PROGRAM_ID
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from(dropId)],
      PROGRAM_ID
    );

    // Build claim instruction (same logic as useProgram.ts)
    const instructionData = Buffer.concat([
      Buffer.from([0x01]), // Claim opcode
      Buffer.from(dropId, "utf-8"),
    ]);

    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: dropPda, isSigner: false, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: account, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    });

    const connection = new Connection(clusterApiUrl(SOLANA_CLUSTER), "confirmed");
    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new Transaction();
    transaction.add(instruction);
    transaction.feePayer = account;
    transaction.recentBlockhash = blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Claiming drop ${dropId}...`,
      },
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    let message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};
