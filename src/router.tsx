import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { Link } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-4 px-6">
      <p className="type-label">Missing page</p>
      <h1 className="type-2xl text-fg">That page is not in UniConnect.</h1>
      <Link to="/" className="type-sm underline-offset-4 hover:underline">
        Back to the workspace
      </Link>
    </main>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
  });
}
