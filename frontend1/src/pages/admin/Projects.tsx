import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Clock, CheckCircle, DollarSign, Users } from 'lucide-react';
import { mockProjects, mockTasks } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types';

export default function Projects() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTaskTab, setActiveTaskTab] = useState('in_progress');

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    budget: '',
    manager: ''
  });

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.description || !newProject.budget || !newProject.manager) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Project Created",
      description: `${newProject.name} has been successfully created.`,
    });

    setNewProject({ name: '', description: '', budget: '', manager: '' });
    setCreateDialogOpen(false);
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleViewTasks = (project: Project) => {
    setSelectedProject(project);
    setTasksDialogOpen(true);
  };

  const getFilteredTasks = () => {
    return mockTasks.filter(t => t.status === activeTaskTab);
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
            {mockProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{project.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        </div>
                        <Badge
                          className={
                            project.status === 'in_progress'
                              ? 'bg-accent'
                              : project.status === 'completed'
                              ? 'bg-success'
                              : project.status === 'planning'
                              ? 'bg-primary'
                              : 'bg-warning'
                          }
                        >
                          {project.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{project.manager}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(project)}>View Details</Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewTasks(project)}>Tasks</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Board</CardTitle>
          <CardDescription>Track project tasks and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTaskTab} onValueChange={setActiveTaskTab}>
            <TabsList>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTaskTab} className="mt-4">
              <div className="grid gap-4">
                {getFilteredTasks().length > 0 ? (
                  getFilteredTasks().map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                              <span>Assignee: {task.assigneeName}</span>
                              <span>Due: {new Date(task.end_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge
                            variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks in {activeTaskTab.replace('_', ' ')} status
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="Downtown Revitalization"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="Project description..."
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input 
                id="budget"
                type="number"
                value={newProject.budget}
                onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                placeholder="500000"
              />
            </div>
            <div>
              <Label htmlFor="manager">Project Manager</Label>
              <Input 
                id="manager"
                value={newProject.manager}
                onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                placeholder="John Smith"
              />
            </div>
            <Button onClick={handleCreateProject} className="w-full">Create Project</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>Complete information for {selectedProject?.name}</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Project Name</p>
                <p className="text-sm text-muted-foreground">{selectedProject.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge className={
                  selectedProject.status === 'in_progress' ? 'bg-accent' :
                  selectedProject.status === 'completed' ? 'bg-success' :
                  selectedProject.status === 'planning' ? 'bg-primary' : 'bg-warning'
                }>
                  {selectedProject.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Project Manager</p>
                <p className="text-sm text-muted-foreground">{selectedProject.manager}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Timeline</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedProject.start_date).toLocaleDateString()} - {new Date(selectedProject.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-sm text-muted-foreground">
                  ${selectedProject.spent.toLocaleString()} / ${selectedProject.budget.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Progress</p>
                <Progress value={selectedProject.progress} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{selectedProject.progress}% Complete</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={tasksDialogOpen} onOpenChange={setTasksDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Project Tasks</DialogTitle>
            <DialogDescription>Tasks for {selectedProject?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {mockTasks.filter(t => t.project_id === selectedProject?.id).length > 0 ? (
              mockTasks.filter(t => t.project_id === selectedProject?.id).map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Assignee: {task.assigneeName}</span>
                          <span>Due: {new Date(task.end_date).toLocaleDateString()}</span>
                          <Badge variant="outline" className="ml-2">{task.status.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      <Badge
                        variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tasks assigned to this project yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
