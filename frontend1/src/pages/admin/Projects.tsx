import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Building2, Clock, CheckCircle, DollarSign, Users, Search, Loader2, Calendar, Target, FileText, XCircle, CheckSquare } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import type { Project, RequestProjectStatus } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Projects() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>([]);
  const [specificPro, setspecificPro] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form, setForm] = useState({ eid: '', task: '', status: '', start_date: '', end_date: '', });
  const [EmployeeSearch, setEmployeeSearch] = useState('');
  const [EmployeeResult, setEmployeeResult] = useState(null);
  const [EmployeeLoading, setEmployeeLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [Projects, setProjects] = useState([]);
  const [Clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    name: '',
    department: '',
    budget: '',
    status: '',
    start_date: '',
    end_date: '',

  });
  const getStatusColor = (status: RequestProjectStatus) => {
    switch (status) {
      case 'in_progress': return 'bg-accent';
      case 'on_hold': return 'bg-outline text-black';
      case 'cancelled': return 'bg-destructive';
      case 'completed': return 'bg-primary';
      default: return 'bg-muted';
    }
  };
  const handleStatusChange = (Id: string, newStatus: RequestProjectStatus) => {
    let res = null;
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/employees/tasks/" + Id + "/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
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
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      setProjects(res.data);
      setLoading(false);
    };
    fetchData();
  }, [Clicked]);
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setCreateDialogOpen(false)
    setClicked(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({

          'name': newProject.name,
          'department': newProject.department,
          'budget': newProject.budget,
          'start_date': newProject.start_date,
          'end_date': newProject.end_date,
          'status': newProject.status,

        })
      });
      const result = await response.json();
      console.log(result.message);
      if (result.message == "Login successful") {
        toast({
          title: "Success",
          description: result.message
        });
      }
      else {

      }
    } catch (e) {

    } finally {
      setLoadingSubmit(false);
    }
  }
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!selectedProject?.id) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/projects/${selectedProject.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        const res = await response.json();
        setspecificPro(res.data.tasks);

      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (detailsDialogOpen) {
      fetchProjectDetails();
    }
  }, [selectedProject?.id, detailsDialogOpen]);
  const handleAssignTask = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setClicked(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/projects/" + id + "/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          'title': form.task,
          'assignee_id': form.eid,
          'status': form.status,
          'start_date': form.start_date,
          'end_date': form.end_date,
        }),
      });

      const result = await response.json();
      toast({
        title: "Success",
        description: result.message
      });
    } catch (e) {
      console.log("error");
    } finally {
      setLoadingSubmit(false);
    }

  }
  const handleEmployeeSearch = async () => {

    if (!EmployeeSearch) return;
    setEmployeeLoading(true);
    setEmployeeResult(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/employees/${encodeURIComponent(EmployeeSearch)}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const body = await res.json().catch(() => null);
      setEmployeeLoading(false);
      if (res.ok) {
        const result = body?.data || body;
        setEmployeeResult(result);
        setPermissionError(null);
      } else if (res.status === 403) {
        setEmployeeResult(null);
        const role = localStorage.getItem('role') || JSON.parse(localStorage.getItem('mms_user') || 'null')?.role || 'unknown';
        const msg = body?.message || 'Permission denied. You do not have access to view that citizen.';
        setPermissionError(`${msg} (Your role: ${role})`);
        toast({
          title: "Error",
          description: `${msg} (Your role: ${role})`,
          variant: "destructive"
        });
      } else {
        setEmployeeResult(null);
        setPermissionError(null);
        toast({
          title: "Error",
          description: body?.message || body?.error || "Citizen not found or unauthorized",
          variant: "destructive"
        });
      }
    } catch (e) {
      setEmployeeResult(false);
      setEmployeeResult(null);
      toast({
        title: "Error",
        description: "Search failed. Please try again.",
        variant: "destructive"
      });
    }
  };


  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleAssignTasks = (project: Project) => {
    setSelectedProject(project);
    setTasksDialogOpen(true);
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Urban Planning & Projects</h1>
        <p className="text-muted-foreground mt-1">Manage infrastructure and development projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">$2.5M</div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">On Hold</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>All active and planned projects</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>Create New Project</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Projects?.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">{project.department}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {project.created_at.split("T")[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {project.budget}
                          </span>
                        </div>
                        <Select
                          value={project.status}
                          onValueChange={(value: RequestProjectStatus) => handleStatusChange(project.project_id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status === 'in_review' ? 'In Review' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">
                              <Badge className="bg-success">completed</Badge>
                            </SelectItem>
                            <SelectItem value="in_progress">
                              <Badge className="bg-warning">In progress</Badge>
                            </SelectItem>
                            <SelectItem value="pending">
                              <Badge className="bg-accent">Pending</Badge>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <Badge className="bg-destructive">rejected</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(project)}>View Details</Button>
                      <Button variant="outline" size="sm" onClick={() => handleAssignTasks(project)}>assign a task</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new urban planning project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Downtown Revitalization"
              />
            </div>
            <div>
              <Label htmlFor="emp-department">Department</Label>
              <Select
                value={newProject.department}
                onValueChange={(value) => setNewProject({ ...newProject, department: value })}
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
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                placeholder="500000"
              />
            </div>
            <div>
              <div className="p-4 border border-border/30 rounded-lg shadow-sm bg-secondary/10 transition-all duration-300 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label htmlFor="date" className="mb-1">Select start Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-border/50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="p-4 border border-border/30 rounded-lg shadow-sm bg-secondary/10 transition-all duration-300 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label htmlFor="date" className="mb-1">Select end Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-border/50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreateProject} className="w-full">Create Project</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading project details...</span>
            </div>
          ) : (
            <>
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-primary" />
                  Project Details
                </DialogTitle>
                <DialogDescription>Complete information for {selectedProject?.name}</DialogDescription>
              </DialogHeader>

              {selectedProject && (
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Project Name
                      </Label>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm">{selectedProject.name}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Department
                      </Label>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm">{selectedProject.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Status
                    </Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Badge className={getStatusColor(selectedProject?.status)}>
                        {selectedProject?.status?.charAt(0).toUpperCase() + selectedProject?.status?.slice(1)?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Created At
                      </Label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {selectedProject.created_at?.split("T")[0]}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Budget
                      </Label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {selectedProject.budget}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Assigned Employees & Tasks
                    </Label>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {specificPro?.map((employee) => (
                        <div key={employee.id} className="border border-border/30 rounded-lg p-4 bg-secondary/5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{employee?.assignee?.user?.name}</div>
                                <div className="text-xs text-muted-foreground">{employee?.assignee?.user?.role}</div>
                                <div className="text-xs text-muted-foreground">{employee?.assignee?.user?.email}</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <CheckSquare className="h-3 w-3" />
                              Assigned Task
                            </Label>
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3 w-3 text-primary" />
                                  <span className="text-sm font-medium">{employee.title}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Start: {employee.start_date}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>End: {employee.end_date}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                                    {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)?.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={tasksDialogOpen} onOpenChange={setTasksDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Project Tasks</DialogTitle>
            <DialogDescription>Tasks for </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Employee (ID, name,or email)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ID, name, national ID, or email"
                  value={EmployeeSearch}
                  onChange={e => setEmployeeSearch(e.target.value)}
                />
                <Button onClick={handleEmployeeSearch} disabled={EmployeeLoading}><Search className="h-4 w-4" /></Button>
              </div>
              {EmployeeResult && (
                <div className="mt-2 flex items-center gap-2">
                  <div>
                    <div className="font-medium">{EmployeeResult?.user?.name || EmployeeResult?.user?.email}</div>
                    <div className="text-xs text-muted-foreground">{EmployeeResult?.user?.email}</div>
                    <div className="text-xs text-muted-foreground">ID: {EmployeeResult?.id}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { setForm(f => ({ ...f, eid: String(EmployeeResult?.id) })); toast({ title: 'Success', description: 'Citizen selected' }); setEmployeeResult(null); setEmployeeResult(''); }}>Select</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEmployeeResult(null); setEmployeeResult(''); }}>Cancel</Button>
                  </div>
                </div>
              )}
              {permissionError && (
                <div className="mt-2 text-sm text-red-600">{permissionError}</div>
              )}
              {form.eid && (
                <div className="mt-2 text-green-600 text-sm">Employee selected: {form.eid}</div>
              )}
            </div>
            <div>
              <div>
                <Label>Employee Id</Label>
                <Input type="number" value={form.eid} onChange={e => setForm(f => ({ ...f, eid: e.target.value }))} placeholder="Enter task" />
              </div>
              <Label>task to be assigned</Label>
              <Input type="text" value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} placeholder="Enter task" />
            </div>
            <div>
              <div className="p-4 border border-border/30 rounded-lg shadow-sm bg-secondary/10 transition-all duration-300 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label htmlFor="date" className="mb-1">Select start Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-border/50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="p-4 border border-border/30 rounded-lg shadow-sm bg-secondary/10 transition-all duration-300 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label htmlFor="date" className="mb-1">Select end Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-border/50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">to do</SelectItem>
                    <SelectItem value="in_review">In review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">blocked</SelectItem>
                    <SelectItem value="in_progress">in progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={(e) => handleAssignTask(e as any, selectedProject.id)} disabled={loadingSubmit}>
                {loadingSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
