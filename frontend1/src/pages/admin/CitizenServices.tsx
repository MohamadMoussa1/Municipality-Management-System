import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Search, Filter, Eye, CheckCircle, XCircle, FileText, Calendar, User } from 'lucide-react';
import { mockRequests } from '@/lib/mockData';
import { RequestStatus, CitizenRequest, RequestType } from '@/types';

export default function CitizenServices() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(mockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionRequest, setActionRequest] = useState<CitizenRequest | null>(null);
  
  const [newRequest, setNewRequest] = useState({
    citizenName: '',
    type: '' as RequestType,
    description: '',
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.citizenName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewRequest = (request: CitizenRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleApproveRequest = (request: CitizenRequest) => {
    setActionRequest(request);
    setApproveDialogOpen(true);
  };

  const handleRejectRequest = (request: CitizenRequest) => {
    setActionRequest(request);
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!actionRequest) return;
    
    const updatedRequest = { 
      ...actionRequest, 
      status: 'approved' as RequestStatus, 
      completion_date: new Date().toISOString() 
    };
    
    setRequests(prev => {
      const newRequests = prev.map(req => 
        req.id === actionRequest.id ? updatedRequest : req
      );
      // Save to localStorage for persistence
      localStorage.setItem('citizenRequests', JSON.stringify(newRequests));
      return newRequests;
    });
    
    toast({
      title: "Request Approved",
      description: `Request ${actionRequest.id} has been approved successfully.`,
    });
    
    setApproveDialogOpen(false);
    setActionRequest(null);
  };

  const confirmReject = () => {
    if (!actionRequest) return;
    
    const updatedRequest = { 
      ...actionRequest, 
      status: 'rejected' as RequestStatus,
      completion_date: new Date().toISOString()
    };
    
    setRequests(prev => {
      const newRequests = prev.map(req => 
        req.id === actionRequest.id ? updatedRequest : req
      );
      // Save to localStorage for persistence
      localStorage.setItem('citizenRequests', JSON.stringify(newRequests));
      return newRequests;
    });
    
    toast({
      title: "Request Rejected",
      description: `Request ${actionRequest.id} has been rejected.`,
      variant: "destructive",
    });
    
    setRejectDialogOpen(false);
    setActionRequest(null);
  };

  const handleCreateRequest = () => {
    if (!newRequest.citizenName || !newRequest.type || !newRequest.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const request: CitizenRequest = {
      id: `REQ${String(requests.length + 1).padStart(3, '0')}`,
      citizen_id: `CIT${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      citizenName: newRequest.citizenName,
      type: newRequest.type,
      status: 'pending',
      submission_date: new Date().toISOString(),
      description: newRequest.description,
    };

    setRequests(prev => [request, ...prev]);
    
    toast({
      title: "Request Created",
      description: `New request ${request.id} has been created successfully.`,
    });

    setNewRequest({ citizenName: '', type: '' as RequestType, description: '' });
    setCreateDialogOpen(false);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_review':
        return <Badge className="bg-accent">In Review</Badge>;
      case 'approved':
        return <Badge className="bg-success">Approved</Badge>;
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
            <div className="text-base sm:text-xl md:text-2xl font-bold">186</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-warning">45</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-accent">32</div>
            <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground leading-tight">In Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 md:p-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold text-success">109</div>
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
            <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto text-[11px] sm:text-sm h-8 sm:h-9">Create New Request</Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-2 mb-3 sm:mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-7 sm:pl-10 text-[11px] sm:text-sm h-8 sm:h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-[10px] sm:text-sm px-2 sm:px-4">{request.id}</TableCell>
                    <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4 max-w-[80px] sm:max-w-none truncate">{request.citizenName}</TableCell>
                    <TableCell className="capitalize text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">{request.type.replace('_', ' ')}</TableCell>
                    <TableCell className="px-2 sm:px-4">{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">{new Date(request.submission_date).toLocaleDateString()}</TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <div className="flex gap-0.5 sm:gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-success hover:text-success hover:bg-success/10"
                              onClick={() => handleApproveRequest(request)}
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRejectRequest(request)}
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </>
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
            <DialogDescription>
              Full information about request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <span className="font-medium text-sm">{selectedRequest.citizenName}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Request Type</Label>
                <div className="font-medium capitalize text-sm">{selectedRequest.type.replace('_', ' ')}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Description</Label>
                <div className="text-sm">{selectedRequest.description}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Submission Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(selectedRequest.submission_date).toLocaleDateString()}</span>
                  </div>
                </div>
                {selectedRequest.completion_date && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Completion Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(selectedRequest.completion_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.assignedTo && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <div className="font-medium text-sm">{selectedRequest.assignedTo}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Request</DialogTitle>
            <DialogDescription>
              Submit a new citizen service request
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="citizenName">Citizen Name *</Label>
              <Input
                id="citizenName"
                value={newRequest.citizenName}
                onChange={(e) => setNewRequest(prev => ({ ...prev, citizenName: e.target.value }))}
                placeholder="Enter citizen name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Request Type *</Label>
              <Select
                value={newRequest.type}
                onValueChange={(value: RequestType) => setNewRequest(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residency">Residency Certificate</SelectItem>
                  <SelectItem value="birth">Birth Certificate</SelectItem>
                  <SelectItem value="death">Death Certificate</SelectItem>
                  <SelectItem value="marriage">Marriage Certificate</SelectItem>
                  <SelectItem value="garbage">Garbage Collection</SelectItem>
                  <SelectItem value="street_repair">Street Repair</SelectItem>
                  <SelectItem value="complaint">Public Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide details about the request..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleCreateRequest} className="w-full sm:w-auto">Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve request {actionRequest?.id} for {actionRequest?.citizenName}?
              This action will update the request status to approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject request {actionRequest?.id} for {actionRequest?.citizenName}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
