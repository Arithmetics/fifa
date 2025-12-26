import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useAdminUsers, useUpdatePaymentStatus, isAdminUser } from "@/lib/admin";
import { useSettings, useUpdateSettings } from "@/lib/settings";
import { STEPS } from "@/lib/picks-steps";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { WinStatusConfig } from "@/components/admin/win-status-config";

export const Route = createFileRoute("/admin")({
  component: AdminComponent,
});

function AdminComponent() {
  const { user, signOut } = useAuth();
  const { data: adminData, isLoading, error } = useAdminUsers();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  const isAdmin = isAdminUser(user);

  // Get all step categories (exclude summary)
  const categories = STEPS.filter((step) => step.slug !== "summary");

  const handlePaymentToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updatePaymentStatus.mutateAsync({
        userId,
        hasPaid: !currentStatus,
      });
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Title and Logout */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🌍 World Cup 2026 ⚽</h1>
            <div className="flex items-center gap-2">
              <Link to="/leaderboard">
                <Button variant="outline" size="sm">
                  Leaderboard
                </Button>
              </Link>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Admin Panel with Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Admin Panel</CardTitle>
              <CardDescription>
                Manage users and configure win status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="users" className="w-full">
                <TabsList>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-4">
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading users...</p>
                  ) : error ? (
                    <p className="text-destructive">
                      Error loading users: {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                  ) : adminData ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-semibold sticky left-0 bg-background">
                              User
                            </th>
                            <th className="text-left p-3 font-semibold">Email</th>
                            <th className="text-center p-3 font-semibold">Paid</th>
                            {categories.map((category) => (
                              <th
                                key={category.slug}
                                className="text-center p-3 font-semibold min-w-[120px]"
                                title={category.description}
                              >
                                {category.name}
                              </th>
                            ))}
                            <th className="text-center p-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminData.users.length === 0 ? (
                            <tr>
                              <td
                                colSpan={categories.length + 4}
                                className="p-4 text-center text-muted-foreground"
                              >
                                No users found
                              </td>
                            </tr>
                          ) : (
                            adminData.users.map((user) => (
                              <tr
                                key={user.id}
                                className="border-b hover:bg-muted/50 transition-colors"
                              >
                                <td className="p-3 font-medium sticky left-0 bg-background">
                                  {user.displayName || user.name}
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {user.email}
                                </td>
                                <td className="p-3 text-center">
                                  <Checkbox
                                    checked={user.hasPaid}
                                    onCheckedChange={() =>
                                      handlePaymentToggle(user.id, user.hasPaid)
                                    }
                                    disabled={updatePaymentStatus.isPending}
                                    aria-label={`${user.displayName || user.name} payment status`}
                                  />
                                </td>
                                {categories.map((category) => {
                                  const status = user.pickStatus[category.slug];
                                  if (!status) {
                                    return (
                                      <td key={category.slug} className="p-3 text-center">
                                        -
                                      </td>
                                    );
                                  }
                                  const isComplete =
                                    status.current === status.required;
                                  const isEmpty = status.current === 0;

                                  return (
                                    <td
                                      key={category.slug}
                                      className={`text-center p-3 ${
                                        isEmpty
                                          ? "bg-destructive/20 text-destructive font-semibold"
                                          : !isComplete
                                          ? "bg-yellow-500/20 text-yellow-600 font-semibold"
                                          : "text-muted-foreground"
                                      }`}
                                      title={`${status.current} / ${status.required} picks${!isComplete ? " (Incomplete)" : ""}`}
                                    >
                                      {status.current} / {status.required}
                                    </td>
                                  );
                                })}
                                <td className="p-3 text-center">
                                  {user.allComplete ? (
                                    <span className="text-green-600 font-semibold">
                                      ✓ Complete
                                    </span>
                                  ) : (
                                    <span className="text-yellow-600 font-semibold">
                                      ⚠ Incomplete
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No users found.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="results" className="mt-4">
                  <WinStatusConfig />
                </TabsContent>

                <TabsContent value="settings" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contest Settings</CardTitle>
                      <CardDescription>
                        Manage contest-wide settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="contestClosed"
                            checked={settings?.contestClosed ?? false}
                            onCheckedChange={(checked) => {
                              if (typeof checked !== "boolean") return;
                              
                              console.log("Checkbox changed to:", checked);
                              updateSettings.mutate(
                                { contestClosed: checked },
                                {
                                  onSuccess: () => {
                                    console.log("Settings updated successfully");
                                  },
                                  onError: (error) => {
                                    console.error("Failed to update settings:", error);
                                    alert(`Failed to update settings: ${error.message}`);
                                  },
                                }
                              );
                            }}
                            disabled={updateSettings.isPending}
                          />
                          <Label
                            htmlFor="contestClosed"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Contest Closed
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          When the contest is closed, users can see the full
                          leaderboard with all picks and points. When open, users
                          can see the leaderboard but without bet details.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

