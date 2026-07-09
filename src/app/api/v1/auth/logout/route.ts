import { ok, withErrorHandling } from "@/lib/api/response";
import { SESSION_COOKIE } from "@/lib/auth/jwt";

export async function POST() {
  return withErrorHandling(async () => {
    const response = ok(null, "Sessão encerrada.");
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  });
}
