import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Eye, XCircle, FileText, Calendar, User, Loader2, Building2, Briefcase, Users, Clock, CheckCircle, AlertCircle, Target } from 'lucide-react';

import { RequestProjectStatus, RequestStatus, RequestTaskStatus } from '@/types';
import { useEffect } from "react";
export default function EmployeeTasks() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [Clicked, setClicked] = useState(false);
  const [Tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const getStatusColor = (status: RequestTaskStatus) => {
    switch (status) {
      case 'in_progress': return 'bg-accent';
      case 'in_review': return 'bg-warning';
      case 'blocked': return 'bg-destructive';
      case 'completed': return 'bg-success';
      case 'todo': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  };
  const handleStatusChange = (Id: string, newStatus: RequestStatus) => {
    let res = null;
    const fetchData = async () => {
      
      const response = await fetch("http://127.0.0.1:8000/api/employees/tasks/" + Id + "/status", {
        method: "PUT",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          'status': newStatus
        }),
      });
      res = await response.json();
      setClicked(true);
    }
    fetchData();
    toast({
      title: "Status Updated",
      description: `Permit ${Id} status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  useEffect(() => {
    setClicked(false);
    const fetchData = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/employees/me/tasks", {
        method: "GET",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      const res = await response.json();

      setTasks(res.data);
      setLoading(false);
    };

    fetchData();
  }, [Clicked]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }
  const handleViewRequest = (task: any) => {
    setSelectedTask(task);
    setViewDialogOpen(true);
  };
  const getStatusBadge = (status: RequestProjectStatus) => {
      switch (status) {
      case 'in_progress':
        return <Badge className="bg-accent">In Progress</Badge>;
      case 'on_hold':
        return <Badge className="bg-muted text-black">On Hold</Badge>;
      case 'completed':
        return <Badge className="bg-success">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive">Cancelled</Badge>;
      case 'planned':
        return <Badge className="bg-primary">Planned</Badge>;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6 p-2 sm:p-0">
      <div className="px-2 sm:px-0">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">Citizen Services</h1>
        <p className="text-[11px] sm:text-sm md:text-base text-muted-foreground mt-0.5 sm:mt-1">Manage citizen requests and applications</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold">{Tasks?.length}</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-warning">{Tasks?.filter(r => r.status === 'todo').length}</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">To Do</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-accent">{Tasks?.filter(r => r.status === 'in_review').length}</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">In Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-success">{Tasks?.filter(r => r.status === 'completed').length}</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Completed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div>
              <CardTitle className="text-sm sm:text-lg md:text-xl">All Requests</CardTitle>
              <CardDescription className="text-[11px] sm:text-sm">View and manage citizen service requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-2 mb-3 sm:mb-4">
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px] text-[11px] sm:text-sm h-8 sm:h-9">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto -mx-3 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">project ID</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">Project Name</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">title</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">Status</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">created At</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">Actions</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {Tasks?.filter((task) =>
                  statusFilter === 'all' || task.status === statusFilter
                ).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium text-[10px] sm:text-sm px-2 sm:px-4">{task.project_id}</TableCell>
                    <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4 max-w-[80px] sm:max-w-none truncate">{task.project.name}</TableCell>
                    <TableCell className="capitalize text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">{task.title}</TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Select
                        value={task.status}
                        onValueChange={(value: RequestStatus) => handleStatusChange(task.id, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status === 'todo' ? 'To DO' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">
                            <Badge className="bg-success">completed</Badge>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <Badge className="bg-accent">In progress</Badge>
                          </SelectItem>
                          <SelectItem value="in_review">
                            <Badge className="bg-warning">In review</Badge>
                          </SelectItem>
                          <SelectItem value="todo">
                            <Badge className="bg-yellow-500">To Do</Badge>
                          </SelectItem>
                          <SelectItem value="blocked">
                            <Badge className="bg-destructive">blocked</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">{task.created_at.split("T")[0]}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => handleViewRequest(task)}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-primary" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Task ID
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm font-medium">{selectedTask.id}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Project Status
                  </Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    {getStatusBadge(selectedTask.project.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Task Status
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm capitalize">{selectedTask.project.status}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Task Title
                </Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium capitalize text-sm">{selectedTask.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">{selectedTask.start_date}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    End Date
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">{selectedTask.end_date}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assigned Information
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Name
                    </Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedTask.assignee.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      Position
                    </Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedTask.assignee.position}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Department
                    </Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedTask.assignee.department}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
