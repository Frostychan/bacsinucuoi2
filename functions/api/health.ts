export const onRequestGet = async (context: { env: Record<string, string> }) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      hasApiKey: !!context.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
      platform: 'cloudflare-pages',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};
