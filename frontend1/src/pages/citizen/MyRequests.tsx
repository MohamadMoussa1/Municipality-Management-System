import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { mockRequests } from '@/lib/mockData';
import { CitizenRequest } from '@/types';
import { toast } from 'sonner';
import { useEffect } from "react";
import {useNavigate} from 'react-router-dom'
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
  const navigate=useNavigate();
  const [requests, setRequests] = useState<CitizenRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
   const [details, setDetails] = useState(false);
  const [Value, setValue] = useState("");
  const [Clicked, setClicked] = useState(false);
  const [R, setR] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    setClicked(false);
    const fetchData = async () => {
        const token=localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/requests/my-requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization":`Bearer ${token}`
          },
        });
        const res=await response.json();
       
          setR(res.requests);
          setLoading(false);       
    }; 
    fetchData();
  }, [Clicked]);

  if (loading) {
    return <p>Loading requests...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       setLoadingSubmit(true);
       setDetails(false);
  if (!Value) { return;}
  try{
    const token=localStorage.getItem("token");
    const response = await fetch("http://127.0.0.1:8000/api/citizen/requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization":`Bearer ${token}`,
          },
         body: JSON.stringify({
            'type':Value ,      
      }),
      });

       const result = await response.json();
       navigate('/citizen/requests');
       setClicked(true);
       toast.message (result.message);
    }catch(e){
      console.log("error");
    }finally{
      setLoadingSubmit(false);
    }     

}

  const handleViewDetails = (request: CitizenRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleCancelRequest = (requestId: string) => {
    let res=null;
    setRequests(prev => prev.filter(r => r.id !== requestId));
     const fetchData = async () => {
        const token=localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/requests/"+requestId, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization":`Bearer ${token}`
          },
        });
         res=await response.json();
        console.log(res.message);
        toast.success(res.message);
      }
      fetchData();
      setClicked(true);
      
  };

  const getStatusIcon = (status: CitizenRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: CitizenRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
     
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const stats = {
    total: R.length,
    pending: R.filter(r => r.status === 'pending').length,
    inReview: R.filter(r => r.status === 'in_review').length,
    completed: R.filter(r => r.status === 'completed' || r.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Requests</h1>
            <p className="text-muted-foreground">Track and manage your service requests</p>
          </div>
          <Dialog open={details} onOpenChange={setDetails}>
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
                  <Select  value={Value} onValueChange={setValue}>
                    <SelectTrigger>
                      <SelectValue  placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residency_certificate">Residency Certificate</SelectItem>
                      <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                      <SelectItem value="death_certificate">Death Certificate</SelectItem>
                      <SelectItem value="marriage_certificate">Marriage Certificate</SelectItem>
                      <SelectItem value="garbage_collection">Garbage Collection</SelectItem>
                      <SelectItem value="street_repair">Street Repair</SelectItem>
                      <SelectItem value="public_complaint">Public Complaint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              
              </div>
              <DialogFooter>
                <Button type="submit"  onClick={handleSubmit} disabled={loadingSubmit}>
                   {loadingSubmit ? "Submitting the request...":"Submit"}
                </Button>
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
              {R.map((request) => (
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
                       
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>ID: {request.id}</span>
                          <span>Submitted:{request.submission_date}</span>
                           <span>Completed: {request.completion_date}</span>
                         
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
                  <p className="text-sm mt-1">{selectedRequest.submission_date}</p>
                </div>
                {selectedRequest.completion_date && (
                  <div>
                    <Label>Completion Date</Label>
                    <p className="text-sm mt-1">{selectedRequest.completion_date}</p>
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
