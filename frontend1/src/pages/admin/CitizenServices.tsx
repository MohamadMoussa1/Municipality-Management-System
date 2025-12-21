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
import { useAuth } from '@/contexts/AuthContext';
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
import { Filter, Eye,XCircle, FileText, Calendar, User, Loader2 } from 'lucide-react';

import { RequestStatus } from '@/types';
import { useEffect } from "react";
export default function CitizenServices() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [Clicked, setClicked] = useState(false);
  const [R, setR] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  let isAdminClerk = null;
  if (role == 'admin' || role == 'clerk') {
    isAdminClerk = true;
  }
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'in_progress': return 'bg-accent';
      case 'pending': return 'bg-outline text-black';
      case 'rejected': return 'bg-destructive';
      case 'completed': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const handleDeleteRequest = (Rid: string) => {
    let res = null;
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/requests/" + Rid, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      res = await response.json();
      toast({
        title: "Success",
        description: res.message,
      });
    }
    fetchData();
    setClicked(true);

  };
  const handleStatusChange = (Id: string, newStatus: RequestStatus) => {
    let res = null;
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/requests/" + Id + "/status", {
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
      const response = await fetch("http://127.0.0.1:8000/api/requests/department", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();

      setR(res.requests);
      setLoading(false);
    };

    fetchData();
  }, [Clicked]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading requests citizens...</span>
      </div>
    );
  }



  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };





  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-accent">In Progress</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-primary">Completed</Badge>;
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
            <div className="text-base sm:text-xl md:text-2xl font-bold">{R?.length}</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-warning">{R?.filter(r => r.status === 'pending').length}</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-accent">{R?.filter(r => r.status === 'in_review').length}</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">In Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-success">{R?.filter(r => r.status === 'completed' || r.status === 'approved').length}</div>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto -mx-3 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">ID</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">Citizen</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">Status</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">Submitted</TableHead>
                  <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {R?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-[10px] sm:text-sm px-2 sm:px-4">{request.id}</TableCell>
                    <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4 max-w-[80px] sm:max-w-none truncate">{request.citizen.user.name}</TableCell>
                    <TableCell className="capitalize text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">{request.type.replace('_', ' ')}</TableCell>
                    <TableCell className="px-2 sm:px-4">{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">{new Date(request.submission_date).toLocaleDateString()}</TableCell>
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
                        <Select
                          value={request.status}
                          onValueChange={(value: RequestStatus) => handleStatusChange(request.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue>
                              <Badge className={getStatusColor(request.status)}>
                                {request.status === 'in_review' ? 'In Review' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                        {isAdminClerk && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-2 bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 border-0 rounded-md flex items-center gap-1.5 self-center"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <XCircle className="h-3 w-3" />
                            Delete
                          </Button>
                        )}
                      </div>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>

          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm :grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Request ID</Label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{selectedRequest.id}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Citizen Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{selectedRequest.citizen.user.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Request Type</Label>
                <div className="font-medium capitalize text-sm">{selectedRequest.type.replace('_', ' ')}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Submission Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedRequest.submission_date}</span>
                  </div>
                </div>
                {selectedRequest.completion_date && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Completion Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRequest.completion_date}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
