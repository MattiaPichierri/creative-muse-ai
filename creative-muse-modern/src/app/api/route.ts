import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Creative Muse AI API",
    version: "1.0.0",
    backend_url: "http://localhost:8000",
    endpoints: {
      auth: {
        register: "POST /api/v1/auth/register",
        login: "POST /api/v1/auth/login",
        profile: "GET /api/v1/auth/me"
      },
      subscription: {
        info: "GET /api/v1/subscription/info"
      },
      ideas: {
        generate: "POST /api/v1/generate",
        random: "POST /api/v1/random",
        list: "GET /api/v1/ideas"
      },
      health: "GET /health"
    },
    note: "Die eigentliche API läuft auf http://localhost:8000. Diese Route dient nur zur Information."
  });
}