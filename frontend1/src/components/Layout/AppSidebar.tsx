import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Building2,
  UserCog,
  Calendar,
  BarChart3,
  ClipboardList,
  Home,
  Bell,
  CreditCard,
  ListTodo 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export const AppSidebar = () => {
  const { role,loading} = useAuth();
  const { open } = useSidebar();
  const { unreadCount } = useNotifications();
  
  if (loading) return null;
  
  const getMenuItems = () => {
    const citizenItems = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'My Requests', url: '/citizen/requests', icon: ClipboardList },
      { title: 'My Permits', url: '/citizen/permits', icon: FileText },
      { title: 'My Payments', url: '/citizen/payments', icon: CreditCard },
      { title: 'Events', url: '/citizen/events', icon: Calendar },
      { title: 'Notifications', url: '/notifications', icon: Bell },
    ];

    const adminItems = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Citizen Services', url: '/admin/citizen-services', icon: Users },
      { title: 'Citizen', url: '/admin/citizen-view', icon: Users },
      { title: 'Permits', url: '/admin/permits', icon: FileText },
      { title: 'Finance', url: '/admin/finance', icon: DollarSign },
      { title: 'Projects', url: '/admin/projects', icon: Building2 },
      { title: 'Human Resources', url: '/admin/hr', icon: UserCog },
      { title: 'Events', url: '/admin/events', icon: Calendar },
      { title: 'Attendances', url: '/admin/attendences', icon: ClipboardList },
      { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
      { title: 'Notifications', url: '/notifications', icon: Bell },
    ];

    const financeItems = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Finance', url: '/admin/finance', icon: DollarSign },
      { title: 'Tasks', url: '/employee/tasks', icon: DollarSign },
      {title: 'My Attendances', url: '/employee/attendences', icon: ClipboardList},
      {title: 'My Leaves', url: '/employee/MyLeaves', icon: ClipboardList},
      {title: 'My Payroll', url: '/employee/MyPayroll', icon: ClipboardList},
      { title: 'Notifications', url: '/notifications', icon: Bell }
    ];

    const projectItems = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Projects', url: '/admin/projects', icon: Building2 },
      { title: 'Events', url: '/employee/events', icon: Calendar },
      {title: 'My Attendances', url: '/employee/attendences', icon: ClipboardList},
      {title: 'My Leaves', url: '/employee/MyLeaves', icon: ClipboardList},
      {title: 'My Payroll', url: '/employee/MyPayroll', icon: ClipboardList},
      { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
      { title: 'Notifications', url: '/notifications', icon: Bell }

    ];

    const hrItems = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Human Resources', url: '/admin/hr', icon: UserCog },
      { title: 'Events', url: '/employee/events', icon: Calendar },
      { title: 'Tasks', url: '/employee/tasks', icon: Calendar },
      { title: 'Attendances', url: '/admin/attendences', icon: ClipboardList },
      {title: 'My Leaves', url: '/employee/MyLeaves', icon: ClipboardList},
      {title: 'My Payroll', url: '/employee/MyPayroll', icon: ClipboardList},
      { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
      { title: 'Notifications', url: '/notifications', icon: Bell }
     
    ];

    const clerkItems = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Citizen Services', url: '/admin/citizen-services', icon: Users },
      { title: 'Permits', url: '/admin/permits', icon: FileText },
      { title: 'Tasks', url: '/employee/tasks', icon: ListTodo },
      {title: 'My Attendances', url: '/employee/attendences', icon: ClipboardList},
      {title: 'My Leaves', url: '/employee/MyLeaves', icon: ClipboardList},
      {title: 'My Payroll', url: '/employee/MyPayroll', icon: ClipboardList},
      { title: 'Events', url: '/employee/events', icon: Calendar },
      { title: 'Notifications', url: '/notifications', icon: Bell }
      
    ];
    
    switch (role) {
      case 'citizen':
        return citizenItems;
      case 'admin':
        return adminItems;
      case 'finance_officer':
        return financeItems;
      case 'urban_planner':
        return projectItems;
      case 'hr_manager':
        return hrItems;
      case 'clerk':
        return clerkItems;
      default:
        return citizenItems;
    }
  };

  const menuItems = getMenuItems();
  return (
   
    <Sidebar className={open ? 'w-64' : 'w-14'} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          {open && (
            <div>
              <h1 className="font-bold text-sm">MMS</h1>
              <p className="text-xs text-muted-foreground">Municipality Portal</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent relative"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                      {item.title === 'Notifications' && unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
