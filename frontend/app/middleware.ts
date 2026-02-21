import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("barber.token")?.value;
  const userCookie = request.cookies.get("barber.user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;
  const role = user?.role;

  const { pathname } = request.nextUrl;

  const dashboardUrl = new URL("/dashboard", request.url);
  const loginUrl = new URL("/login", request.url);
  const homeUrl = new URL("/", request.url);

  // 1. DASHBOARD (Área Restrita)
  if (pathname.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(loginUrl);
    if (role !== "BARBEIRO") return NextResponse.redirect(homeUrl);
  }

  // 2. LOGIN (Quem já tá logado não entra aqui)
  if (pathname === "/login" && token) {
    if (role === "BARBEIRO") return NextResponse.redirect(dashboardUrl);
    return NextResponse.redirect(homeUrl);
  }

  // 3. HOME (Raiz)
  if (pathname === "/") {
    // A única restrição é: Barbeiro não fica na home, vai pro painel
    if (token && role === "BARBEIRO") {
      return NextResponse.redirect(dashboardUrl);
    }
    // Clientes e Visitantes passam livre
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};
