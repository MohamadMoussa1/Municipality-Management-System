import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  DollarSign,
  Building2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const citizenData = [
  { month: 'Jan', requests: 45, permits: 12 },
  { month: 'Feb', requests: 52, permits: 18 },
  { month: 'Mar', requests: 48, permits: 15 },
  { month: 'Apr', requests: 61, permits: 22 },
  { month: 'May', requests: 55, permits: 19 },
  { month: 'Jun', requests: 67, permits: 25 },
];

const financeData = [
  { name: 'Property Tax', value: 450000 },
  { name: 'Utilities', value: 280000 },
  { name: 'Permits', value: 95000 },
  { name: 'Fines', value: 65000 },
];

const projectData = [
  { month: 'Jan', budget: 100000, spent: 85000 },
  { month: 'Feb', budget: 120000, spent: 98000 },
  { month: 'Mar', budget: 110000, spent: 105000 },
  { month: 'Apr', budget: 130000, spent: 115000 },
  { month: 'May', budget: 125000, spent: 118000 },
  { month: 'Jun', budget: 140000, spent: 132000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const { role,loading} = useAuth();
  if (loading) return <div>Loading...</div>;
  const getDashboardContent = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'finance_officer':
        return <FinanceDashboard />;
      case 'urban_planner':
        return <ProjectDashboard />;
      case 'hr_manager':
        return <HRDashboard />;
      case 'clerk':
        return <ClerkDashboard />;
      case 'citizen':
        return <CitizenDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return <div className="space-y-6">{getDashboardContent()}</div>;
}

const AdminDashboard = () => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Municipality overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Citizens"
          value="12,453"
          change="+5.2%"
          trend="up"
          icon={Users}
        />
        <StatsCard
          title="Active Requests"
          value="186"
          change="-3.1%"
          trend="down"
          icon={FileText}
        />
        <StatsCard
          title="Revenue (Month)"
          value="$890K"
          change="+12.4%"
          trend="up"
          icon={DollarSign}
        />
        <StatsCard
          title="Active Projects"
          value="24"
          change="+8.0%"
          trend="up"
          icon={Building2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Citizen Requests & Permits</CardTitle>
            <CardDescription>Monthly trend of citizen services</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={citizenData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="hsl(var(--primary))" />
                <Bar dataKey="permits" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Income sources breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest system updates and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              icon={CheckCircle2}
              title="Building Permit Approved"
              description="Permit #PER002 for Robert Wilson approved"
              time="2 hours ago"
              variant="success"
            />
            <ActivityItem
              icon={AlertCircle}
              title="Payment Overdue"
              description="Property tax payment overdue for Michael Brown"
              time="5 hours ago"
              variant="warning"
            />
            <ActivityItem
              icon={Clock}
              title="New Request Submitted"
              description="Residency certificate requested by John Smith"
              time="1 day ago"
              variant="default"
            />
            <ActivityItem
              icon={Calendar}
              title="Event Scheduled"
              description="Town Hall Meeting scheduled for Feb 10"
              time="2 days ago"
              variant="info"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const CitizenDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track requests and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Requests"
          value="3"
          change="2 pending"
          icon={FileText}
        />
        <StatsCard
          title="Pending Payments"
          value="$1,200"
          change="Due Feb 1"
          icon={DollarSign}
        />
        <StatsCard
          title="Active Permits"
          value="1"
          change="Expires 2025"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Upcoming Events"
          value="2"
          change="This month"
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Status of your recent requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RequestStatusItem
              title="Residency Certificate"
              status="pending"
              date="Jan 15, 2024"
            />
            <RequestStatusItem
              title="Birth Certificate"
              status="in_review"
              date="Jan 14, 2024"
            />
            <RequestStatusItem
              title="Street Repair Request"
              status="approved"
              date="Jan 10, 2024"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and services</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/citizen/requests')}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">New Request</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/citizen/payments')}>
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Pay Bills</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/citizen/permits')}>
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs">Apply Permit</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/citizen/events')}>
              <Calendar className="h-5 w-5" />
              <span className="text-xs">View Events</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Recent updates and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              icon={CheckCircle2}
              title="Request Approved"
              description="Your residency certificate has been approved"
              time="2 hours ago"
              variant="success"
            />
            <ActivityItem
              icon={AlertCircle}
              title="Payment Due"
              description="Property tax payment due in 10 days"
              time="1 day ago"
              variant="warning"
            />
            <ActivityItem
              icon={Calendar}
              title="New Event"
              description="Town Hall Meeting on Feb 10"
              time="2 days ago"
              variant="info"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const FinanceDashboard = () => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
        <p className="text-muted-foreground mt-1">Revenue and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value="$890K"
          change="+12.4%"
          trend="up"
          icon={DollarSign}
        />
        <StatsCard
          title="Collected"
          value="$745K"
          change="+8.2%"
          trend="up"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Pending"
          value="$145K"
          change="-5.1%"
          trend="down"
          icon={Clock}
        />
        <StatsCard
          title="Overdue"
          value="$25K"
          change="+2.3%"
          trend="down"
          icon={AlertCircle}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
          <CardDescription>Income sources by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {financeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

const ProjectDashboard = () => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Projects Dashboard</h1>
        <p className="text-muted-foreground mt-1">Projects and budgets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Projects"
          value="24"
          change="+3 this month"
          icon={Building2}
        />
        <StatsCard
          title="Total Budget"
          value="$2.5M"
          change="Allocated"
          icon={DollarSign}
        />
        <StatsCard
          title="Completed"
          value="12"
          change="This year"
          icon={CheckCircle2}
        />
        <StatsCard
          title="On Hold"
          value="3"
          change="Awaiting approval"
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs Spending</CardTitle>
          <CardDescription>Monthly budget utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="budget" stroke="hsl(var(--primary))" />
              <Line type="monotone" dataKey="spent" stroke="hsl(var(--accent))" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

const HRDashboard = () => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">HR Dashboard</h1>
        <p className="text-muted-foreground mt-1">Employee management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Employees"
          value="156"
          change="+8 this month"
          icon={Users}
        />
        <StatsCard
          title="Present Today"
          value="142"
          change="91% attendance"
          icon={CheckCircle2}
        />
        <StatsCard
          title="On Leave"
          value="12"
          change="7 approved"
          icon={Clock}
        />
        <StatsCard
          title="Pending Approvals"
          value="5"
          change="Require action"
          icon={AlertCircle}
        />
      </div>
    </>
  );
};

const ClerkDashboard = () => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clerk Dashboard</h1>
        <p className="text-muted-foreground mt-1">Requests and permits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Requests"
          value="45"
          change="Require review"
          icon={FileText}
        />
        <StatsCard
          title="Today's Tasks"
          value="12"
          change="8 completed"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Permits Processed"
          value="28"
          change="This month"
          icon={Building2}
        />
        <StatsCard
          title="Average Time"
          value="2.5 days"
          change="Processing"
          icon={Clock}
        />
      </div>
    </>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
}

const StatsCard = ({ title, value, change, trend, icon: Icon }: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <div className="flex items-center gap-1 text-xs">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
                <span className={trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  variant?: 'success' | 'warning' | 'default' | 'info';
}

const ActivityItem = ({ icon: Icon, title, description, time, variant = 'default' }: ActivityItemProps) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return 'text-success bg-success/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'info':
        return 'text-accent bg-accent/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getVariantColor()}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
};

interface RequestStatusItemProps {
  title: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  date: string;
}

const RequestStatusItem = ({ title, status, date }: RequestStatusItemProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_review':
        return <Badge className="bg-accent">In Review</Badge>;
      case 'approved':
        return <Badge className="bg-success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      {getStatusBadge()}
    </div>
  );
};
