import { redirect } from "next/navigation";

/** As duas telas viraram uma só: /admin/ajustes. */
export default function Page() {
  redirect("/admin/ajustes");
}
