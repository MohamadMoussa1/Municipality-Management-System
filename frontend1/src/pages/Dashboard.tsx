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
  Loader2,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';




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
  const { role, loading } = useAuth();
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
  const [info, setinfo] = useState<any>([]);
  const [i, seti] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [D, setD] = useState<any>(true);
  const [load, setload] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/payments/summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      seti(res);
      setload(false);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/admin/dashboard/permits-requests/monthly-counts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setD(res);
      setLoading(false);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/admin/dashboard/totals", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setinfo(res);
      setLoading(false);
    };
    fetchData();
  }, []);
  let citizenData = null;
  if (!loading && info) {
    citizenData = [
      { month: 'Jan', requests: D.requests['2025-01'], permits: D.permits['2025-01'] },
      { month: 'Feb', requests: D.requests['2025-02'], permits: D.permits['2025-02'] },
      { month: 'Mar', requests: D.requests['2025-03'], permits: D.permits['2025-03'] },
      { month: 'Apr', requests: D.requests['2025-04'], permits: D.permits['2025-04'] },
      { month: 'May', requests: D.requests['2025-05'], permits: D.permits['2025-05'] },
      { month: 'Jun', requests: D.requests['2025-06'], permits: D.permits['2025-06'] },
      { month: 'July', requests: D.requests['2025-07'], permits: D.permits['2025-07'] },
      { month: 'Aug', requests: D.requests['2025-08'], permits: D.permits['2025-08'] },
      { month: 'Sep', requests: D.requests['2025-09'], permits: D.permits['2025-09'] },
      { month: 'Oct', requests: D.requests['2025-10'], permits: D.permits['2025-10'] },
      { month: 'Nov', requests: D.requests['2025-11'], permits: D.permits['2025-11'] },
      { month: 'Dec', requests: D.requests['2025-12'], permits: D.permits['2025-12'] },
    ];
  }
  let financeData = null;
  if (!load && i) {
    financeData = [
      { name: 'property tax', value: i.by_type.property_tax.total_amount },
      { name: 'water bill', value: i.by_type?.water_bill?.total_amount },
      { name: 'eletricity bill', value: i.by_type?.eletricity_bill?.total_amount },
      { name: 'waste management', value: i.by_type?.waste_management?.total_amount },
      { name: 'other', value: i.by_type?.other?.total_amount },
    ];
  }
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Municipality overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Citizens"
          value={loading ? "Loading..." : info?.total_citizens}

          icon={Users}
        />
        <StatsCard
          title="Total Employee"
          value={loading ? "Loading..." : info?.total_employees}

          icon={FileText}
        />
        <StatsCard
          title="Completed Projects"
          value={loading ? "Loading..." : info?.completed_projects}

          icon={Building2}
        />
        <StatsCard
          title="Completed Requests"
          value={loading ? "Loading..." : info?.completed_requests}

          icon={Building2}
        />
        <StatsCard
          title="Completed Permits"
          value={loading ? "Loading..." : info?.completed_permits}

          icon={Building2}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
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
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financeData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [Loading, setloading] = useState(true);
  const [requestsL, setrequestsL] = useState<any>([]);
  const [UCEC, setUCEC] = useState<any>([]);
  const [pc, setpc] = useState<any>([]);
  const [ue, setue] = useState<any>([]);
  const [p, setp] = useState<any>([]);
  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/requests/latest", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setloading(false);
      setrequestsL(res.requests);
      console.log(requestsL);

    };
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/events/upcoming-count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setloading(false);
      setue(res);

    };
    const fetchRequestsCounts = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/requests/counts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setloading(false);
      setUCEC(res);

    };
    const fetchPermitCount = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/permits/permit-counts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setloading(false);
      setpc(res);

    };
    const fetchPayments = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/payments/pending-total", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setloading(false);
      setLoading(false);
      setp(res);

    };
    fetchRequestsCounts();
    fetchPermitCount();
    fetchEvents();
    fetchRequests();
    fetchPayments();
  }, []);


  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track requests and payments</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading data...</span>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Active Requests"
              value={Loading ? "Loading..." : UCEC.active_requests}
              change={UCEC.pending_requests + " pending"}
              icon={FileText}
            />
            <StatsCard
              title="Pending Payments"
              value={p.total_pending_amount}
              change={Loading ? "Loading..." : p.pending_payments_count + " pending"}
              icon={DollarSign}
            />
            <StatsCard
              title="Active Permits"
              value={Loading ? "Loading..." : pc.approved_permits}
              change={Loading ? "Loading..." : pc.pending_permits + " pending"}
              icon={CheckCircle2}
            />
            <StatsCard
              title="Upcoming Events"
              value={Loading ? "Loading..." : ue.upcoming_events_count}

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
                {requestsL && requestsL.length > 0 ? (
                  requestsL.map((request: any, index: number) => (
                    <RequestStatusItem
                      key={request.id || index}
                      title={request.title || request.type || `Request ${index + 1}`}
                      status={request.status}
                      date={request.created_at ? request.created_at.split("T")[0] : new Date().toLocaleDateString()}
                    />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No requests available
                  </div>
                )}
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
        </>
      )}
    </>
  );
};

const FinanceDashboard = () => {
  const [info, setinfo] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/payments/summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setinfo(res);
      setLoading(false);
    };
    fetchData();
  }, []);
  let financeData = null;
  if (!loading && info) {
    financeData = [
      { name: 'property tax', value: info.by_type.property_tax.total_amount },
      { name: 'water bill', value: info.by_type?.water_bill?.total_amount },
      { name: 'eletricity bill', value: info.by_type?.eletricity_bill?.total_amount },
      { name: 'waste management', value: info.by_type?.waste_management?.total_amount },
      { name: 'other', value: info.by_type?.other?.total_amount },
    ];
  }
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
        <p className="text-muted-foreground mt-1">Revenue and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Amount"
          value={loading ? "Loading..." : `${info?.total_amount} ${info?.currency}`}
          icon={DollarSign}
        />
        <StatsCard
          title="Completed"
          value={loading ? "Loading..." : info?.total_completed}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Pending"
          value={loading ? "Loading..." : info?.total_pending}
          icon={Clock}
        />
        <StatsCard
          title="total failed"
          value={loading ? "Loading..." : info?.total_failed}
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
                data={financeData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(financeData || []).map((entry, index) => (
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
  const [loading, setLoading] = useState(true);
  const [projectsL, setprojectsL] = useState<any>(true);
  const navigate = useNavigate();
  useEffect(() => {

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/projects/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();

      setprojectsL(res);
      setLoading(false)
      console.log(projectsL?.projects_by_department.it);

    };
    fetchData();
  }, []);
  let financeData = null;
  if (!loading && projectsL) {
    financeData = [
      { name: 'finance', value: projectsL?.projects_by_department?.finance },
      { name: 'it', value: projectsL?.projects_by_department?.it },
      { name: 'hr', value: projectsL?.projects_by_department?.hr },
      { name: 'planning', value: projectsL?.projects_by_department?.planning },
      { name: 'public_services', value: projectsL?.projects_by_department?.public_services },
    ];
  }
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Projects Dashboard</h1>
        <p className="text-muted-foreground mt-1">Projects and budgets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Budget"
          value={loading ? "Loading..." : projectsL.total_budget}
          change="Allocated"
          icon={DollarSign}
        />
        <StatsCard
          title="Completed"
          value={loading ? "Loading..." : projectsL.completed_projects}
          change="This year"
          icon={CheckCircle2}
        />
        <StatsCard
          title="On Hold"
          value={loading ? "Loading..." : projectsL.in_progress_projects}
          change="Awaiting approval"
          icon={Clock}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Status of your recent projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financeData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>

        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>

          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/notifications')}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Notifications</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/projects')}>
              <Building2 className="h-5 w-5" />
              <span className="text-xs">View Projects</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/employee/attendences')}>
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs">Check In</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/employee/events')}>
              <Calendar className="h-5 w-5" />
              <span className="text-xs">View Events</span>
            </Button>
          </CardContent>
        </Card>
      </div>

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasksL, settasksL] = useState<any>([]);
  const [UCEC, setUCEC] = useState<any>([]);
  const [pc, setpc] = useState<any>([]);
  const [ue, setue] = useState<any>([]);
  const [tasksCount, settasksCount] = useState<any>([]);
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/employees/me/tasks/latest-todo", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setLoading(false);
      settasksL(res.tasks);
    };
    const fetchTasksCount = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/employees/me/tasks/todo-count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setLoading(false);
      settasksCount(res);
    };
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/events/upcoming-count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setue(res);

    };
    const fetchRequestsCounts = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/requests/counts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setLoading(false);
      setUCEC(res);

    };
    const fetchPermitCount = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/permits/permit-counts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setLoading(false);
      setpc(res);

    };
    fetchTasks();
    fetchRequestsCounts();
    fetchPermitCount();
    fetchEvents();
    fetchTasksCount();

  }, []);
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clerk Dashboard</h1>
        <p className="text-muted-foreground mt-1">Requests and permits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Requests"
          value={loading ? "Loading..." : UCEC.pending_requests}
          change="Require review"
          icon={FileText}
        />
        <StatsCard
          title="To Do Tasks"
          value={loading ? "Loading..." : tasksCount.todo_tasks_count}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Permits Pending"
          value={loading ? "Loading..." : pc.pending_permits}
          icon={Building2}
        />
        <StatsCard
          title="Upcoming Events"
          value={loading ? "Loading..." : ue.upcoming_events_count}

          icon={Clock}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>To Do tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksL && tasksL.length > 0 ? (
              tasksL.map((task: any, index: number) => (
                <RequestStatusItem
                  key={task.id || index}
                  title={task.title}
                  status={task.status}
                  date={task.created_at.split("T")[0]}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No tasks available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>

          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/employee/attendences')}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Check In</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/citizen-services')}>
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Citizen Services</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/permits')}>
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs">Permit View</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/employee/events')}>
              <Calendar className="h-5 w-5" />
              <span className="text-xs">View Events</span>
            </Button>
          </CardContent>
        </Card>
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
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  date: string;
}

const RequestStatusItem = ({ title, status, date }: RequestStatusItemProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-accent">In progress</Badge>;
      case 'completed':
        return <Badge className="bg-success">completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
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


