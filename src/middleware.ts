import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Exemple : vérifier la présence d'un cookie d'authentification
  const token = request.cookies.get("auth_token");

  // Si le token n'existe pas, rediriger vers /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Sinon, continuer normalement
  return NextResponse.next();
}

// Appliquer le middleware sur les routes dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
