import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, TrendingUp, Users, DollarSign, Briefcase } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function Reports() {
  const financialData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 48000, expenses: 31000 },
    { month: 'Apr', revenue: 61000, expenses: 38000 },
    { month: 'May', revenue: 55000, expenses: 36000 },
    { month: 'Jun', revenue: 67000, expenses: 42000 },
  ];

  const requestsData = [
    { name: 'Residency', value: 245 },
    { name: 'Birth Cert', value: 189 },
    { name: 'Permits', value: 156 },
    { name: 'Complaints', value: 98 },
    { name: 'Other', value: 67 },
  ];

  const projectsData = [
    { month: 'Jan', completed: 4, inProgress: 8 },
    { month: 'Feb', completed: 6, inProgress: 10 },
    { month: 'Mar', completed: 5, inProgress: 12 },
    { month: 'Apr', completed: 8, inProgress: 9 },
    { month: 'May', completed: 7, inProgress: 11 },
    { month: 'Jun', completed: 9, inProgress: 8 },
  ];

  const employeeData = [
    { department: 'Admin', count: 12 },
    { department: 'Finance', count: 8 },
    { department: 'Urban Planning', count: 15 },
    { department: 'HR', count: 6 },
    { department: 'IT', count: 10 },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d'];

  const exportReport = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `municipality-report-${timestamp}`;
    
    if (type === 'PDF') {
      // Simulate PDF export
      const dataStr = `Municipality Management System Report
Generated: ${new Date().toLocaleString()}

Financial Summary:
- Total Revenue: $328,000
- Active Citizens: 12,458
- Total Requests: 755
- Active Projects: 8

This is a mock PDF export. In a real application, this would generate a proper PDF file.`;
      
      const blob = new Blob([dataStr], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported as text file (PDF simulation)');
    } else if (type === 'Excel') {
      // Simulate Excel export with CSV
      const csvData = `Category,Value,Change
Total Revenue,$328000,+12%
Active Citizens,12458,+8%
Total Requests,755,+24%
Active Projects,8,2 completed

Monthly Revenue:
Jan,45000
Feb,52000
Mar,48000
Apr,61000
May,55000
Jun,67000`;
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported as CSV file (Excel simulation)');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 px-4 sm:px-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Comprehensive system insights and data analysis</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm h-9" onClick={() => exportReport('PDF')}>
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              Export PDF
            </Button>
            <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm h-9" onClick={() => exportReport('Excel')}>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">$328K</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">+12% from last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Citizens</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">12,458</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">755</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">+24% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">8</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">2 completed this month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="financial" className="space-y-4 px-4 sm:px-0">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 sm:gap-0">
            <TabsTrigger value="financial" className="text-xs sm:text-sm py-2">Financial</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm py-2">Requests</TabsTrigger>
            <TabsTrigger value="projects" className="text-xs sm:text-sm py-2">Projects</TabsTrigger>
            <TabsTrigger value="hr" className="text-xs sm:text-sm py-2">HR</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Revenue vs Expenses</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Monthly financial overview for the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                    <Bar dataKey="expenses" fill="hsl(var(--secondary))" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg md:text-xl">Requests by Type</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Distribution of citizen service requests</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={requestsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {requestsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg md:text-xl">Request Processing Time</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Average days to complete requests</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Residency Certificate</span>
                      <span className="font-semibold">3.2 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Birth Certificate</span>
                      <span className="font-semibold">2.8 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Business Permit</span>
                      <span className="font-semibold">7.5 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Construction Permit</span>
                      <span className="font-semibold">14.2 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Complaint Resolution</span>
                      <span className="font-semibold">5.6 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Project Completion Trends</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Completed vs in-progress projects over time</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projectsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="hsl(var(--primary))" name="Completed" />
                    <Line type="monotone" dataKey="inProgress" stroke="hsl(var(--secondary))" name="In Progress" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hr" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Employee Distribution</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Staff count by department</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="department" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
