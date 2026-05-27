import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { AnimatePresenceWrapper } from "./animate-presence-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <div className="ml-60">
        <header className="sticky top-0 z-30 glass border-b border-border/50">
          <div className="flex items-center justify-end px-6 h-14">
            <UserNav />
          </div>
        </header>
        <main className="p-8">
          <AnimatePresenceWrapper>{children}</AnimatePresenceWrapper>
        </main>
      </div>
    </div>
  );
}
