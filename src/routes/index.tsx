import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4">
      <p className="text-sm text-muted-foreground">template-full</p>
      <Link to="/demo" className="text-sm text-primary underline-offset-4 hover:underline">
        View tRPC demo →
      </Link>
    </div>
  );
}
