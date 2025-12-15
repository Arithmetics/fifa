import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
      {/* Logout button in top right */}
      {user && (
        <div className="absolute top-4 right-4">
          <Button onClick={signOut} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
      )}
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🌍 World Cup 2026 ⚽
          </h1>
          <p className="text-xl text-muted-foreground">
            The ultimate football experience
          </p>
        </div>

        {/* Auth Card */}
        {user ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardDescription className="text-lg">
                Welcome back,
              </CardDescription>
              <h2 className="text-3xl font-semibold">
                {user.displayName || user.name || user.email}
              </h2>
            </CardHeader>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <h2 className="text-2xl font-semibold">Get Started</h2>
              <CardDescription>
                Sign in with your Google account to join the World Cup 2026
                experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => signIn("google")}
                size="lg"
                className="w-full"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
