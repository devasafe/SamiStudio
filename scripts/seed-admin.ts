/**
 * Cria (ou atualiza) o usuário administrador inicial.
 *
 * Uso:
 *   ADMIN_NAME="Sami" ADMIN_EMAIL="sami@exemplo.com" ADMIN_PASSWORD="senha-forte" npm run db:seed
 *
 * Requer MONGODB_URI no ambiente (.env.local é carregado automaticamente).
 */
import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../src/models/user";

async function main(): Promise<void> {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    loadEnvFile(envPath);
  }

  const uri = process.env.MONGODB_URI;
  const name = process.env.ADMIN_NAME ?? "Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!uri) {
    throw new Error("MONGODB_URI ausente. Configure o .env.local.");
  }
  if (!email || !password) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no ambiente.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD deve ter no mínimo 8 caracteres.");
  }

  await mongoose.connect(uri);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), passwordHash, role: "ADMIN", status: "active" },
    { new: true, upsert: true }
  );

  console.log(`Admin pronto: ${user.email} (role ${user.role})`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
