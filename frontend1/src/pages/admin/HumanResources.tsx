import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserCheck, Clock, AlertCircle, Calendar } from 'lucide-react';
import { mockEmployees, mockLeaves } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import type { Employee, Leave } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function HumanResources() {
  const { toast } = useToast();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState(mockLeaves);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    role: ''
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position || !newEmployee.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including role.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Employee Added",
      description: `${newEmployee.name} has been successfully added as ${newEmployee.role.replace('_', ' ')}.`,
    });

    setNewEmployee({ name: '', email: '', position: '', department: '', phone: '', role: '' });
    setAddEmployeeOpen(false);
  };

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewProfileOpen(true);
  };

  const handleApproveLeave = (leaveId: string) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId ? { ...leave, status: 'approved' as const } : leave
    ));
    toast({
      title: "Leave Approved",
      description: "Leave request has been approved successfully.",
    });
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId ? { ...leave, status: 'rejected' as const } : leave
    ));
    toast({
      title: "Leave Rejected",
      description: "Leave request has been rejected.",
    });
  };

  const handleProcessPayroll = () => {
    toast({
      title: "Payroll Processing",
      description: "Monthly payroll is being processed. This may take a few minutes.",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Human Resources</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Employee management and HR operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">156</div>
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
                <div className="text-xl sm:text-2xl font-bold">142</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Present Today</div>
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
                <div className="text-xl sm:text-2xl font-bold">12</div>
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
                <div className="text-xl sm:text-2xl font-bold">5</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Pending Approvals</div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="employees" className="text-xs sm:text-sm">Employees</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">Attendance</TabsTrigger>
          <TabsTrigger value="leaves" className="text-xs sm:text-sm">Leave Requests</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs sm:text-sm">Payroll</TabsTrigger>
        </TabsList>

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
                {mockEmployees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarFallback className="text-xs sm:text-sm">
                            {employee.name?.split(' ').map(n => n[0]).join('') || 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{employee.name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{employee.position}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{employee.departmentName}</p>
                        </div>
                        <div className="hidden lg:block text-right">
                          <p className="text-xs sm:text-sm font-medium truncate">{employee.email}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{employee.phone}</p>
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

        <TabsContent value="attendance" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Attendance Tracker</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Daily attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Employee</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Check In</TableHead>
                      <TableHead className="whitespace-nowrap">Check Out</TableHead>
                      <TableHead className="whitespace-nowrap">Hours</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">Admin User</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">Jan 22, 2024</TableCell>
                      <TableCell className="text-sm">08:30 AM</TableCell>
                      <TableCell className="text-sm">05:00 PM</TableCell>
                      <TableCell className="text-sm">8.5h</TableCell>
                      <TableCell>
                        <Badge className="bg-success text-xs">Present</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Finance Officer</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">Jan 22, 2024</TableCell>
                      <TableCell className="text-sm">09:15 AM</TableCell>
                      <TableCell className="text-sm">05:30 PM</TableCell>
                      <TableCell className="text-sm">8.25h</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-warning text-xs">Late</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Leave Requests</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Pending and approved leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Employee</TableHead>
                      <TableHead className="whitespace-nowrap">Type</TableHead>
                      <TableHead className="whitespace-nowrap">Start Date</TableHead>
                      <TableHead className="whitespace-nowrap">End Date</TableHead>
                      <TableHead className="whitespace-nowrap">Days</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell className="text-sm">{leave.employeeName}</TableCell>
                        <TableCell className="capitalize text-sm">{leave.type}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">{leave.days} days</TableCell>
                        <TableCell>
                          {leave.status === 'approved' ? (
                            <Badge className="bg-success text-xs">Approved</Badge>
                          ) : leave.status === 'rejected' ? (
                            <Badge variant="destructive" className="text-xs">Rejected</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {leave.status === 'pending' && (
                            <div className="flex gap-1 sm:gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => handleApproveLeave(leave.id)}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => handleRejectLeave(leave.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Payroll Overview</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monthly salary processing for all employees</CardDescription>
                </div>
                <Button className="w-full sm:w-auto text-sm" onClick={handleProcessPayroll}>Process Payroll</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-lg sm:text-xl font-bold">$1.2M</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Monthly Payroll</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-lg sm:text-xl font-bold">156</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Employees to Process</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-lg sm:text-xl font-bold">25th</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Payment Date</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Employee</TableHead>
                        <TableHead className="whitespace-nowrap">Position</TableHead>
                        <TableHead className="whitespace-nowrap">Department</TableHead>
                        <TableHead className="whitespace-nowrap">Base Salary</TableHead>
                        <TableHead className="whitespace-nowrap">Bonuses</TableHead>
                        <TableHead className="whitespace-nowrap">Deductions</TableHead>
                        <TableHead className="whitespace-nowrap">Net Pay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEmployees.slice(0, 5).map((employee) => {
                        const bonus = Math.floor(Math.random() * 500);
                        const deduction = Math.floor(Math.random() * 300);
                        const netPay = employee.salary + bonus - deduction;
                        return (
                          <TableRow key={employee.id}>
                            <TableCell className="text-sm">{employee.name}</TableCell>
                            <TableCell className="text-sm">{employee.position}</TableCell>
                            <TableCell className="text-sm">{employee.departmentName}</TableCell>
                            <TableCell className="text-sm">${employee.salary.toLocaleString()}</TableCell>
                            <TableCell className="text-sm text-success">+${bonus}</TableCell>
                            <TableCell className="text-sm text-destructive">-${deduction}</TableCell>
                            <TableCell className="text-sm font-semibold">${netPay.toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Internal Communication & Task Assignments</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Team collaboration and task management</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
              <TabsTrigger value="messages" className="text-xs sm:text-sm">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="mt-4 space-y-3">
              <div className="space-y-2 sm:space-y-3">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base">Review Q1 Budget Reports</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">Assigned to: Finance Officer</p>
                        <p className="text-xs text-muted-foreground mt-1">Due: Feb 5, 2024</p>
                      </div>
                      <Badge className="self-start sm:self-center text-xs">In Progress</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base">Update Employee Handbook</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">Assigned to: HR Manager</p>
                        <p className="text-xs text-muted-foreground mt-1">Due: Feb 10, 2024</p>
                      </div>
                      <Badge variant="outline" className="self-start sm:self-center text-xs">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base">Complete Staff Training Program</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">Assigned to: Training Coordinator</p>
                        <p className="text-xs text-muted-foreground mt-1">Due: Jan 30, 2024</p>
                      </div>
                      <Badge className="bg-success self-start sm:self-center text-xs">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="messages" className="mt-4 space-y-3">
              <div className="space-y-2 sm:space-y-3">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback className="text-xs sm:text-sm">AU</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <p className="font-medium text-sm">Admin User</p>
                          <span className="text-xs text-muted-foreground">2 hours ago</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Please review the updated attendance policy and provide feedback by end of week.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback className="text-xs sm:text-sm">FO</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <p className="font-medium text-sm">Finance Officer</p>
                          <span className="text-xs text-muted-foreground">5 hours ago</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Budget allocation for Q2 has been approved. Distribution will begin next week.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="emp-email">Email</Label>
              <Input 
                id="emp-email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <Label htmlFor="emp-position">Position</Label>
              <Input 
                id="emp-position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="emp-department">Department</Label>
              <Input 
                id="emp-department"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                placeholder="Engineering"
              />
            </div>
            <div>
              <Label htmlFor="emp-phone">Phone</Label>
              <Input 
                id="emp-phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                placeholder="+1 234-567-8900"
              />
            </div>
            <div>
              <Label htmlFor="emp-role">Role</Label>
              <Select
                value={newEmployee.role}
                onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}
              >
                <SelectTrigger id="emp-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="clerk">Clerk</SelectItem>
                  <SelectItem value="finance">Finance Officer</SelectItem>
                  <SelectItem value="hr_manager">HR Manager</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddEmployee} className="w-full">Add Employee</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    {selectedEmployee.name?.split(' ').map(n => n[0]).join('') || 'NA'}
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
                <p className="text-sm text-muted-foreground">{selectedEmployee.departmentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Hire Date</p>
                <p className="text-sm text-muted-foreground">{new Date(selectedEmployee.hire_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Salary</p>
                <p className="text-sm text-muted-foreground">${selectedEmployee.salary.toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
