import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

// Helper: Secure the entire Admin section
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || cookieStore.get("auth_token")?.value;

  if (!token) return false;

  try {
    const decoded: any = verify(token, process.env.JWT_SECRET || "secret");
    
    // DEBUG LOG: See what the server actually sees
    console.log("Admin Layout Check -> Role in Token:", decoded.role);

    // FIX: Convert to uppercase before checking to handle 'admin' vs 'ADMIN'
    const role = decoded.role?.toUpperCase(); 
    
    if (role !== "ADMIN") return false;
    
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAdminAuth();

  if (!isAuthenticated) {
    redirect("/login"); // Kick them out if not Admin
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 1. Fixed Sidebar */}
      <AdminSidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:hidden">
          <span className="font-bold text-slate-900">AfyaDiet Admin</span>
        </header>

        {/* The Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}