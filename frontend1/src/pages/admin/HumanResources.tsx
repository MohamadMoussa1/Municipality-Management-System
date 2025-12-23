import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserCheck, Clock, AlertCircle,Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from "react";
export default function HumanResources() {
  const { toast } = useToast();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [Clicked, setClicked] = useState(false);
  const [E, setE] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
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

  useEffect(() => {
      setClicked(false);
      const fetchData = async () => {
          const token=localStorage.getItem("token");
          const response = await fetch("http://127.0.0.1:8000/api/employees", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization":`Bearer ${token}`
            },
          });
          const res=await response.json();
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
  
  const handleAddEmployee = async () => {
    setLoadingSubmit(true);
    setClicked(true);
    // Validate required fields
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position || !newEmployee.role || !newEmployee.password || !newEmployee.password_confirmation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including role and password.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
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
    }finally{
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

      {/* Tabs */}
      <Tabs defaultValue="employees">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="employees" className="text-xs sm:text-sm">Employees</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">Attendance</TabsTrigger>
          <TabsTrigger value="leaves" className="text-xs sm:text-sm">Leave Requests</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs sm:text-sm">Payroll</TabsTrigger>
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

        {/* Attendance */}
        <TabsContent value="attendance" className="mt-4 sm:mt-6">
          {/* ... attendance table (unchanged) */}
        </TabsContent>

        {/* Leaves */}
        <TabsContent value="leaves" className="mt-4 sm:mt-6">
          {/* ... leave requests table (unchanged) */}
        </TabsContent>

        {/* Payroll */}
        <TabsContent value="payroll" className="mt-4 sm:mt-6">
          {/* ... payroll table (unchanged) */}
        </TabsContent>
      </Tabs>

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
              <Select
                value={newEmployee.department}
                onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}
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
                onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}
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
                onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                placeholder="50000"
              />
            </div>
            <div>
              <Label htmlFor="emp-hire_date">Hire Date</Label>
              <Input 
                id="emp-hire_date"
                type="date"
                value={newEmployee.hire_date}
                onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="emp-status">Status</Label>
              <Select
                value={newEmployee.status}
                onValueChange={(value) => setNewEmployee({...newEmployee, status: value})}
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
                onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                placeholder="password"
              />
            </div>
            <div>
              <Label htmlFor="emp-password_confirmation">Confirm Password</Label>
              <Input 
                id="emp-password_confirmation"
                type="password"
                value={newEmployee.password_confirmation}
                onChange={(e) => setNewEmployee({...newEmployee, password_confirmation: e.target.value})}
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
    </div>
  );
}
