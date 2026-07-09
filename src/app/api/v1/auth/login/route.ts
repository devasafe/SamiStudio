import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { assertRateLimit } from "@/lib/auth/rate-limit";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/auth/jwt";
import { connectDb } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { User } from "@/models/user";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    assertRateLimit(`login:${ip}`, 5, 60_000);

    const { email, password } = loginSchema.parse(await request.json());
    await connectDb();

    const user = await User.findOne({ email, status: "active" });
    const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !passwordOk) {
      throw new ApiError(401, "E-mail ou senha inválidos.");
    }

    user.lastLogin = new Date();
    await user.save();

    const token = await signSession({
      sub: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = ok(
      { name: user.name, email: user.email, role: user.role },
      "Login realizado."
    );
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  });
}
