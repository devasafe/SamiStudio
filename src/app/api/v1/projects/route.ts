import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import type { QueryFilter } from "mongoose";
import { logAction } from "@/lib/api/audit";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";
import { connectDb } from "@/lib/db";
import { projectCreateSchema } from "@/lib/validation";
import { Project, type ProjectDoc } from "@/models/project";

/** Sessão opcional: público vê apenas publicados; admin vê tudo. */
async function optionalSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await connectDb();
    const session = await optionalSession(request);
    const params = request.nextUrl.searchParams;

    const filter: QueryFilter<ProjectDoc> = { deletedAt: null };
    if (session) {
      // ?deleted=true abre a lixeira — só para quem está no painel: o site
      // público nunca deve enxergar o que foi excluído.
      if (params.get("deleted") === "true") {
        filter.deletedAt = { $ne: null };
      }
      const status = params.get("status");
      if (status === "draft" || status === "published" || status === "archived") {
        filter.status = status;
      }
    } else {
      filter.status = "published";
    }

    const category = params.get("category");
    if (category) {
      filter.categoryId = category;
    }
    const city = params.get("city");
    if (city) {
      filter.city = city;
    }
    const year = params.get("year");
    if (year) {
      filter.year = Number(year);
    }
    if (params.get("featured") === "true") {
      filter.featured = true;
    }
    const search = params.get("search");
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const page = Math.max(1, Number(params.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 12)));

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    return ok(projects, "OK", { page, limit, total, totalPages: Math.ceil(total / limit) });
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireAuth(request);
    await connectDb();
    const data = projectCreateSchema.parse(await request.json());
    const project = await Project.create(data);
    await logAction(session, "create", "Project", String(project._id));
    // Conteúdo mudou: regenera as páginas do site.
    revalidatePath("/", "layout");
    return ok(project, "Projeto criado.", undefined, 201);
  });
}
