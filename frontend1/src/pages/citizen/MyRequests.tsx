import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { mockRequests } from '@/lib/mockData';
import { CitizenRequest } from '@/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MyRequests() {
  const [requests, setRequests] = useState<CitizenRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (request: CitizenRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleCancelRequest = (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    toast.success('Request cancelled successfully');
  };

  const getStatusIcon = (status: CitizenRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_review': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: CitizenRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_review': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inReview: requests.filter(r => r.status === 'in_review').length,
    completed: requests.filter(r => r.status === 'completed' || r.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Requests</h1>
            <p className="text-muted-foreground">Track and manage your service requests</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Submit New Request</DialogTitle>
                <DialogDescription>
                  Submit a request for municipal services or documents
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Request Type</Label>
                  <Select>
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
              
              </div>
              <DialogFooter>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.inReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>View the status and details of all your requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{request.type.replace('_', ' ').toUpperCase()}</h3>
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {request.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>ID: {request.id}</span>
                          <span>Submitted: {new Date(request.submission_date).toLocaleDateString()}</span>
                          {request.completion_date && <span>Completed: {new Date(request.completion_date).toLocaleDateString()}</span>}
                          {request.assignedTo && <span>Assigned to: {request.assignedTo}</span>}
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(request)}>
                          View Details
                        </Button>
                        {request.status === 'pending' && (
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCancelRequest(request.id)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>
                Complete information about your request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <Label>Request Type</Label>
                  <p className="text-sm font-medium mt-1">{selectedRequest.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant="outline" className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div>
                  <Label>Submission Date</Label>
                  <p className="text-sm mt-1">{new Date(selectedRequest.submission_date).toLocaleDateString()}</p>
                </div>
                {selectedRequest.completion_date && (
                  <div>
                    <Label>Completion Date</Label>
                    <p className="text-sm mt-1">{new Date(selectedRequest.completion_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
