import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
