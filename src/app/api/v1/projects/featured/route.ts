import { ok, withErrorHandling } from "@/lib/api/response";
import { connectDb } from "@/lib/db";
import { Project } from "@/models/project";

export async function GET() {
  return withErrorHandling(async () => {
    await connectDb();
    const projects = await Project.find({
      status: "published",
      featured: true,
      deletedAt: null,
    }).sort({ createdAt: -1 });
    return ok(projects);
  });
}
