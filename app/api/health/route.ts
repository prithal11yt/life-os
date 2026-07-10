// Tiny version marker so we can confirm which build is actually live.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    build: "date-normalization-v1",
    ts: new Date().toISOString(),
  });
}
