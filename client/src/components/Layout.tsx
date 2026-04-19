import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useAuth } from "../auth/AuthContext";

export const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />
      
      {user ? (
        <div className="flex w-full min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col transition-all duration-300">
            {/* 
              This margin will be handled by Sidebar's fixed position.
              We adjust main content padding based on sidebar presence 
            */}
            <div className="lg:pl-64 transition-all duration-300">
              <Navbar />
              <main className="p-8">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      ) : (
        <main className="w-full">
          <Outlet />
        </main>
      )}
    </div>
  );
};
