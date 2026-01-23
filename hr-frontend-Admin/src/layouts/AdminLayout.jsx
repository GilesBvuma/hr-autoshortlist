import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { useAuthStore } from "../stores/useAuthStore";

export default function AdminLayout() {
  const { user, token, fetchProfile } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!user && token) {
      fetchProfile();
    }
  }, [user, token, fetchProfile]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content with dynamic left margin */}
      <main
        className={`flex-1 p-0 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'
          }`}
      >
        <Outlet />
      </main>
    </div>
  );
}



