import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserCheck, Clock, AlertCircle, Loader2, Eye, Filter, Calendar, FileText, User, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Employee, RequestLeaveStatus } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import  getCsrfToken  from '../../lib/utils';
import { useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
export default function HumanResources() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<RequestLeaveStatus | 'all'>('all');
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [Clicked, setClicked] = useState(false);
  const [E, setE] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [R, setR] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [PayRollOpen, setPayRollOpen] = useState(false);
  const [mnth, setMonth] = useState("");
  const [pr, setpr] = useState<any[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [year, setYear] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payrollCurrentPage, setPayrollCurrentPage] = useState<number | null>(null);
  const [payrollLastPage, setPayrollLastPage] = useState<number | null>(null);
  const [payrollEditOpen, setPayrollEditOpen] = useState(false);
  const [payrollEditId, setPayrollEditId] = useState<number | null>(null);
  const [payrollEditType, setPayrollEditType] = useState<'bonus' | 'deduction'>('bonus');
  const [payrollEditAmount, setPayrollEditAmount] = useState('');
  const [payrollEditNote, setPayrollEditNote] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    role: '',
    salary: '',
    hire_date: '',
    status: '',
    password: '',
    password_confirmation: '',
  });
  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handlePayrollView = (payroll: any) => {
    setSelectedRequest(payroll);
    setDetailsOpen(true);

  };
  const fetchD = async () => {

    const response = await fetch("http://127.0.0.1:8000/cs/payrolls/" + payrollEditId + "/adjustments", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        'X-XSRF-TOKEN':getCsrfToken(),
      },
      body: JSON.stringify({
        'type': payrollEditType,
        'amount': payrollEditAmount,
        'note': payrollEditNote,
      }),
    });
    const res = await response.json();
    setClicked((v) => !v);
  }

  const handlePayrollEditOpen = (payroll: any) => {
    setPayrollEditId(payroll?.id ?? null);
    setPayrollEditType('bonus');
    setPayrollEditAmount('');
    setPayrollEditNote('');
    setPayrollEditOpen(true);

  };

  const fetchPayrollPage = async (pageNumber: number) => {

    const response = await fetch(`http://127.0.0.1:8000/api/payrolls?page=${pageNumber}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",

      },
    });
    const res = await response.json();
    const pageData = res?.data;
    setpr(Array.isArray(pageData?.data) ? pageData.data : []);
    setPayrollCurrentPage(typeof pageData?.current_page === 'number' ? pageData.current_page : null);
    setPayrollLastPage(typeof pageData?.last_page === 'number' ? pageData.last_page : null);
  };

  const handleStatusChange = (Id: string, newStatus: RequestLeaveStatus) => {
    let res = null;
    const fetchData = async () => {

      const response = await fetch("http://127.0.0.1:8000/cs/leaves/" + Id + "/status", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'X-XSRF-TOKEN':getCsrfToken(),
        },
        body: JSON.stringify({
          'status': newStatus
        }),
      });
      res = await response.json();
      setClicked((v) => !v);
    }
    fetchData();
    toast({
      title: "Status Updated",
      description: `Request ${Id} status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };
  const getStatusColor = (status: RequestLeaveStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-destructive';
      case 'approved': return 'bg-success';
      default: return 'bg-outline text-black';
    }
  };
  const getStatusBadge = (status: RequestLeaveStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'approved':
        return <Badge className="bg-primary">Completed</Badge>;
    }
  };

  useEffect(() => {
    const fetchData = async () => {

      const response = await fetch("http://127.0.0.1:8000/api/leaves", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",

        },
      });
      const res = await response.json();
      const leavesData = res?.data;
      const leaves = Array.isArray(leavesData)
        ? leavesData
        : Array.isArray(leavesData?.data)
          ? leavesData.data
          : [];
      setR(leaves);
      setLoading(false);
    };

    fetchData();
  }, [Clicked]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPayrollPage(1);
      setLoading(false);
    };

    fetchData();
  }, [Clicked]);
  const handleSave = () => {
    setPayrollEditOpen(false);
    fetchD();
  }
  useEffect(() => {
    const fetchData = async () => {

      const response = await fetch("http://127.0.0.1:8000/api/employees", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",

        },
      });
      const res = await response.json();
      setE(res.data);
      setLoading(false);
    };
    fetchData();
  }, [Clicked]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading emplyees list...</span>
      </div>
    );
  }

  const pendingApprovalsCount = Array.isArray(R)
    ? R.filter((request: any) => String(request?.status ?? '').toLowerCase() === 'pending').length
    : 0;

  const onLeaveCount = Array.isArray(R)
    ? R.filter((request: any) => String(request?.status ?? '').toLowerCase() === 'approved').length
    : 0;

  const handleAddEmployee = async () => {
    setLoadingSubmit(true);

    // Validate required fields
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position || !newEmployee.role || !newEmployee.password || !newEmployee.password_confirmation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including role and password.",
        variant: "destructive",
      });
      return;
    }


    try {
      const response = await fetch("http://127.0.0.1:8000/cs/admin/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
           'X-XSRF-TOKEN':getCsrfToken(),
        },
        body: JSON.stringify(newEmployee),
      });

      const result = await response.json();
      console.log(result.message);
      if (response.ok) {
        toast({
          title: "Employee Added",
          description: `${newEmployee.name} has been successfully added as ${newEmployee.role.replace('_', ' ')}.`,
        });
        setNewEmployee({
          name: '',
          email: '',
          position: '',
          department: '',
          phone: '',
          role: '',
          salary: '',
          hire_date: '',
          status: '',
          password: '',
          password_confirmation: '',
        });
        setClicked(prev => !prev);
        setAddEmployeeOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add employee",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };
  const handleAddPayRoll = async () => {
    setLoadingSubmit(true);
    setClicked(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/cs/payrolls/generate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'X-XSRF-TOKEN':getCsrfToken(),
        },
        body: JSON.stringify({
          'month': year + "-" + mnth
        }),
      });

      const result = await response.json();
      console.log(result.message);
      if (response.ok) {
        toast({
          title: "PayRoll Added",
          description: `${newEmployee.name} has been successfully added as ${newEmployee.role.replace('_', ' ')}.`,
        });

        setPayRollOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add PayRoll",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewProfileOpen(true);
  };


  ;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Human Resources</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Employee management and HR operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{E.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Employees</div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{Array.isArray(R) ? R.length : 0}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Leave Requests</div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-success/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{onLeaveCount}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">On Leave</div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{pendingApprovalsCount}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Pending Approvals</div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees">
        <TabsList className="w-full h-auto grid grid-cols-2 sm:grid-cols-3 gap-3 bg-muted/60 p-2 rounded-xl -mx-4 sm:mx-0">
          <TabsTrigger
            value="employees"
            className="text-xs sm:text-sm rounded-lg px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:bg-background/70"
          >
            Employees
          </TabsTrigger>
          <TabsTrigger
            value="leaves"
            className="text-xs sm:text-sm rounded-lg px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:bg-background/70"
          >
            Leave Requests
          </TabsTrigger>
          <TabsTrigger
            value="payroll"
            className="text-xs sm:text-sm rounded-lg px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:bg-background/70"
          >
            Payroll
          </TabsTrigger>
        </TabsList>

        {/* Employee Directory */}
        <TabsContent value="employees" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Employee Directory</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Complete staff roster</CardDescription>
                </div>
                <Button onClick={() => setAddEmployeeOpen(true)} className="w-full sm:w-auto text-sm">Add Employee</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4">
                {E.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarFallback className="text-xs sm:text-sm">
                            {employee.name?.split(' ').map(n => n[0]).join('') || 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">Name: {employee.name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">Position: {employee.position}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">Department: {employee.department}</p>

                        </div>
                        <div className="hidden lg:block text-right">
                          <p className="text-xs sm:text-sm font-medium truncate">{employee.email}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Role:{employee.role}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">Salary:{employee.salary}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Badge variant={employee.status === 'active' ? 'default' : 'outline'} className="text-xs">
                            {employee.status}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleViewProfile(employee)} className="text-xs h-8 flex-1 sm:flex-none">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaves */}
        <TabsContent value="leaves" className="mt-4 sm:mt-6">
          <Card>

            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col gap-2 mb-3 sm:mb-4">
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full sm:w-[180px] text-[11px] sm:text-sm h-8 sm:h-9">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border overflow-x-auto -mx-3 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">Employee Id</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">Employee Name</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">Type</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">Status</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">view</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading requests...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : R?.filter((request) =>
                      statusFilter === 'all' || String(request.status ?? '').toLowerCase() === statusFilter
                    ).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {statusFilter === 'all' ? 'No requests found' : `No ${statusFilter} requests found`}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      R?.filter((request) =>
                        statusFilter === 'all' || String(request.status ?? '').toLowerCase() === statusFilter
                      ).map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium text-[10px] sm:text-sm px-2 sm:px-4">{request.id}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4 max-w-[80px] sm:max-w-none truncate">{request?.employee.user?.name || 'N/A'}</TableCell>
                          <TableCell className="capitalize text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">{request.type || 'N/A'}</TableCell>
                          <TableCell className="px-2 sm:px-4">
                            <Select
                              value={request.status}
                              onValueChange={(value: RequestLeaveStatus) => handleStatusChange(request.id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue>
                                  <Badge className={getStatusColor(request.status)}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approved">
                                  <Badge className="bg-success">approved</Badge>
                                </SelectItem>
                                <SelectItem value="pending">
                                  <Badge className="bg-accent">Pending</Badge>
                                </SelectItem>
                                <SelectItem value="rejected">
                                  <Badge className="bg-destructive">rejected</Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell className="px-2 sm:px-4">
                            <div className="flex gap-0.5 sm:gap-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => handleViewRequest(request)}
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll */}
        <TabsContent value="payroll" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Payroll Records</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Employee payroll information</CardDescription>
                </div>
                <Button onClick={() => setPayRollOpen(true)} className="w-full sm:w-auto text-sm">Generate payroll</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <div>
                  {payrollCurrentPage && payrollLastPage ? `Page ${payrollCurrentPage} of ${payrollLastPage}` : null}
                </div>
                <div>
                  Showing {pr?.length || 0}
                </div>
              </div>
              <div className="rounded-md border overflow-x-auto -mx-3 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Employee ID</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Employee Name</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Month</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Base Salary</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Bonuses</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Generated Date</TableHead>
                      <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading payroll records...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : pr?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            No payroll records found
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pr?.map((payroll) => (
                        <TableRow key={payroll.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-[10px] sm:text-sm px-2 sm:px-4 text-blue-600">{payroll.employee_id}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4 max-w-[80px] sm:max-w-none truncate font-medium">{payroll?.employee?.user?.name || 'N/A'}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 bg-purple-50 text-purple-700 rounded px-2 py-1">{payroll.month || 'N/A'}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-green-600">${payroll.base_salary || '0.00'}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 text-blue-600">${payroll.bonuses || '0.00'}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 text-gray-600">{new Date(payroll.generated_at).toLocaleDateString()}</TableCell>
                          <TableCell className="px-2 sm:px-4">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-50"
                                onClick={() => handlePayrollView(payroll)}
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-50"
                                onClick={() => handlePayrollEditOpen(payroll)}
                              >
                                <Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {(payrollCurrentPage && payrollLastPage && payrollLastPage > 1) && (
                <div className="flex items-center justify-end gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={payrollCurrentPage <= 1}
                    onClick={async () => {
                      setPayrollLoading(true);
                      await fetchPayrollPage(payrollCurrentPage - 1);
                      setPayrollLoading(false);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={payrollCurrentPage >= payrollLastPage}
                    onClick={async () => {
                      setPayrollLoading(true);
                      await fetchPayrollPage(payrollCurrentPage + 1);
                      setPayrollLoading(false);
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance" className="mt-4 sm:mt-6">
          {/* ... attendance table (unchanged) */}
        </TabsContent>
      </Tabs>
      <Dialog open={PayRollOpen} onOpenChange={setPayRollOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
            <DialogDescription>Select month to generate payroll for</DialogDescription>
          </DialogHeader>
          <select value={mnth}
            onChange={e => setMonth(e.target.value)}>
            <option value="">Select month</option>
            <option value="04">April</option>
            <option value="08">August</option>
            <option value="12">December</option>
            <option value="02">February</option>
            <option value="01">January</option>
            <option value="07">July</option>
            <option value="06">June</option>
            <option value="03">March</option>
            <option value="05">May</option>
            <option value="11">November</option>
            <option value="10">October</option>
            <option value="09">September</option>
          </select>
          <div className="mt-4">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              placeholder="Enter year"
              min="2000"
              max="2100"
            />
          </div>
          <Button onClick={handleAddPayRoll} className="w-full" disabled={loadingSubmit}>
            {loadingSubmit ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add PayRoll'
            )}
          </Button>
        </DialogContent>
      </Dialog>
      {/* Add Employee Dialog */}
      <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Add a new employee to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emp-name">Full Name</Label>
              <Input
                id="emp-name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="emp-email">Email</Label>
              <Input
                id="emp-email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <Label htmlFor="emp-position">Position</Label>
              <Input
                id="emp-position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="emp-department">Department</Label>
              <Select
                value={newEmployee.department}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
              >
                <SelectTrigger id="depar">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="planning">planning</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="public_services">public services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="emp-role">Role</Label>
              <Select
                value={newEmployee.role}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
              >
                <SelectTrigger id="emp-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="clerk">Clerk</SelectItem>
                  <SelectItem value="finance_officer">Finance Officer</SelectItem>
                  <SelectItem value="hr_manager">HR Manager</SelectItem>
                  <SelectItem value="urban_planner">Project Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="emp-salary">Salary</Label>
              <Input
                id="emp-salary"
                type="number"
                value={newEmployee.salary}
                onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                placeholder="50000"
              />
            </div>
            <div>
              <Label htmlFor="emp-hire_date">Hire Date</Label>
              <Input
                id="emp-hire_date"
                type="date"
                value={newEmployee.hire_date}
                onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emp-status">Status</Label>
              <Select
                value={newEmployee.status}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, status: value })}
              >
                <SelectTrigger id="emp-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="emp-password">Password</Label>
              <Input
                id="emp-password"
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                placeholder="password"
              />
            </div>
            <div>
              <Label htmlFor="emp-password_confirmation">Confirm Password</Label>
              <Input
                id="emp-password_confirmation"
                type="password"
                value={newEmployee.password_confirmation}
                onChange={(e) => setNewEmployee({ ...newEmployee, password_confirmation: e.target.value })}
                placeholder="password"
              />
            </div>
            <Button onClick={handleAddEmployee} className="w-full" disabled={loadingSubmit}>
              {loadingSubmit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Employee'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
            <DialogDescription>Complete information for {selectedEmployee?.name}</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                  <AvatarFallback className="text-base sm:text-lg">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('') || 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">{selectedEmployee.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedEmployee.position}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Employee ID</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Hire Date</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.hire_date}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Salary</p>
                <p className="text-sm text-muted-foreground">${selectedEmployee.salary}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leave Request Details
            </DialogTitle>
            <DialogDescription>
              Review the complete leave request information
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Request Status Card */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900">Request Status</h3>
                      <div className="mt-2">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">Request ID</p>
                      <p className="font-mono text-blue-900">#{selectedRequest.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee Information Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Employee Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{selectedRequest?.employee.user?.name}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 text-xs font-bold">@</span>
                          </div>
                          <span className="text-sm">{selectedRequest.employee.user?.email}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</Label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 rounded text-sm font-medium">
                          {selectedRequest.employee?.position}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</Label>
                        <div className="mt-1 px-3 py-2 bg-purple-50 rounded text-sm font-medium text-purple-900">
                          {selectedRequest?.employee.user?.role?.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Salary</Label>
                        <div className="mt-1 px-3 py-2 bg-green-50 rounded text-sm font-medium text-green-900">
                          ${selectedRequest?.employee?.salary}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</Label>
                        <div className="mt-1">
                          <Badge variant={selectedRequest.employee.user?.status === 'active' ? 'default' : 'secondary'}>
                            {selectedRequest.employee.user?.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Details Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Leave Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason for Leave</Label>
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm">{selectedRequest.reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created Date</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    {selectedRequest.approved_at && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved Date</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            {new Date(selectedRequest.approved_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedRequest.approved_by && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved By</Label>
                      <div className="mt-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-900">
                        {selectedRequest?.approved_by}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button onClick={() => setViewDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Payroll Details</DialogTitle>
            <DialogDescription>
              Complete payroll information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee ID</Label>
                  <p className="text-sm font-medium mt-1">{selectedRequest.employee_id}</p>
                </div>
                <div>
                  <Label>Employee Name</Label>
                  <p className="text-sm font-medium mt-1">{selectedRequest.employee?.user?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Month</Label>
                  <p className="text-sm font-medium mt-1">{selectedRequest.month}</p>
                </div>
                <div>
                  <Label>Position</Label>
                  <p className="text-sm font-medium mt-1">{selectedRequest.employee?.position || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <p className="text-sm font-medium mt-1">{selectedRequest.employee?.department || 'N/A'}</p>
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <p className="text-sm font-medium mt-1">{new Date(selectedRequest.employee?.hire_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Financial Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Base Salary</Label>
                    <p className="text-sm font-medium mt-1 text-green-600">${selectedRequest.base_salary}</p>
                  </div>
                  <div>
                    <Label>Bonuses</Label>
                    <p className="text-sm font-medium mt-1 text-blue-600">${selectedRequest.bonuses}</p>
                  </div>
                  <div>
                    <Label>Deductions</Label>
                    <p className="text-sm font-medium mt-1 text-red-600">${selectedRequest.deductions}</p>
                  </div>
                  <div>
                    <Label>Net Salary</Label>
                    <p className="text-sm font-medium mt-1 text-purple-600 font-semibold">${selectedRequest.net_salary}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Generated Date</Label>
                  <p className="text-sm font-medium mt-1">{new Date(selectedRequest.generated_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Generated By</Label>
                  <p className="text-sm font-medium mt-1">{selectedRequest.generated_by}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created At</Label>
                  <p className="text-sm font-medium mt-1">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Updated At</Label>
                  <p className="text-sm font-medium mt-1">{new Date(selectedRequest.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payrollEditOpen} onOpenChange={setPayrollEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Payroll</DialogTitle>
            <DialogDescription>
              Add a bonus or deduction
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={payrollEditType} onValueChange={(v: 'bonus' | 'deduction') => setPayrollEditType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payroll-edit-amount">Amount</Label>
              <Input
                id="payroll-edit-amount"
                type="number"
                value={payrollEditAmount}
                onChange={(e) => setPayrollEditAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label htmlFor="payroll-edit-note">Note (optional)</Label>
              <Input
                id="payroll-edit-note"
                value={payrollEditNote}
                onChange={(e) => setPayrollEditNote(e.target.value)}
                placeholder="Optional note"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayrollEditOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                handleSave()
              }}
              disabled={!payrollEditId || !payrollEditAmount}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

