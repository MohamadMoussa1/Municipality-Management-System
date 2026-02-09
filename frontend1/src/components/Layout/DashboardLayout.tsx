import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import getCsrfToken from '../../lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getRolePhoto } from '@/lib/rolePhotos';
import { toast } from 'sonner';
interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { role, user, logout } = useAuth();
  const { unreadCount, clearNotifications } = useNotifications();
  const navigate = useNavigate();
  const handleProfile = () => {
    switch (role) {
      case 'citizen':
        navigate('/profile');
        return;
      default:
        navigate('/profileEmployee');
        return;

    }
  }
  let isAdmin = null;
  if (role == "admin") {
    isAdmin = true;
  }

  const handleLogout = async () => {
    const response = await fetch("http://127.0.0.1:8000/cs/auth/logout", {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        'X-XSRF-TOKEN': getCsrfToken(),
      },
    });
    let res = null;
    try {
      res = await response.json();
      if (response.status === 200) {
        toast.success(res.message, { duration: 4000 });
        clearNotifications();
        logout();
        navigate('/login');
      } else {
        toast.error(res.message || "Logout failed");
      }
    }
    catch (e) {
      console.log("an error happened");
      toast.error("An error occurred during logout");
    }
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger />
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  Municipality Management System
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Welcome back, {user}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-10 px-2 sm:px-3">
                    <img
                      src={getRolePhoto(role || 'citizen')}
                      alt="Profile"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0"
                    />
                    <div className="text-left hidden sm:block min-w-0">
                      <p className="text-sm font-medium truncate">{user}</p>
                      {/* <p className="text-xs text-muted-foreground capitalize truncate">{user?.role.replace('_', ' ')}</p> */}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isAdmin && <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
