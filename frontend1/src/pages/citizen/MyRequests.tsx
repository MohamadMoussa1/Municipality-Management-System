import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { CitizenRequest } from '@/types';
import { toast } from 'sonner';
import getCsrfToken from '../../lib/utils';
import { useNavigate } from 'react-router-dom'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';

export default function MyRequests() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [Value, setValue] = useState("");
  const [Clicked, setClicked] = useState(false);
  const [R, setR] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [citizenLastPage, setCitizenLastPage] = useState(1);
  const [citizenCurrentPage, setCitizenCurrentPage] = useState(1);
  const fetchPage = async (pageNumber: number) => {
    const response = await fetch(`http://127.0.0.1:8000/api/requests/my-requests?page=${pageNumber}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    const res = await response.json();
    console.log(res.requests)
    setR(res.requests.data);
    setCitizenCurrentPage(res.requests.current_page);
    setCitizenLastPage(res.requests.last_page);
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchPage(1);
      setLoading(false);
    };
    fetchData();
  }, [Clicked]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading requests...</span>
      </div>
    );
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setDetails(false);
    if (!Value) { return; }
    try {
      const response = await fetch("http://127.0.0.1:8000/cs/citizen/requests", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          'type': Value,
        }),
      });

      const result = await response.json();
      navigate('/citizen/requests');
      setClicked(true);
      toast.message(result.message);
    } catch (e) {
      console.log("error");
    } finally {
      setLoadingSubmit(false);
    }

  }

  const handleViewDetails = (request: CitizenRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleCancelRequest = (requestId: string) => {
    let res = null;
    const fetchData = async () => {
      const response = await fetch("http://127.0.0.1:8000/cs/requests/" + requestId, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'X-XSRF-TOKEN': getCsrfToken(),
        },
      });
      res = await response.json();
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
    total: R?.length,
    pending: R?.filter(r => r.status === 'pending').length,
    inReview: R?.filter(r => r.status === 'in_progress').length,
    completed: R?.filter(r => r.status === 'completed' || r.status === 'approved')?.length,
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
                <Select value={Value} onValueChange={setValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residency_certificate">Residency Certificate</SelectItem>
                    <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                    <SelectItem value="death_certificate">Death Certificate</SelectItem>
                    <SelectItem value="marriage_certificate">Marriage Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Service request </Label>
                <Select value={Value} onValueChange={setValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="garbage_collection">Garbage Collection</SelectItem>
                    <SelectItem value="street_repair">Street Repair</SelectItem>
                    <SelectItem value="public_complaint">Public Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit} disabled={loadingSubmit}>
                {loadingSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
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
            <div className="text-2xl font-bold">{stats?.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats?.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats?.inReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats?.completed}</div>
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
            {R?.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{request?.type.replace('_', ' ').toUpperCase()}</h3>
                        <Badge variant="outline" className={getStatusColor(request.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {request?.status?.replace('_', ' ')}
                          </span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>ID: {request?.id}</span>
                        <span>Submitted: {request?.submission_date.split("T")[0]}</span>
                        <span>Completed: {request?.completion_date?.split("T")[0]}</span>

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
            {(citizenCurrentPage && citizenLastPage && citizenLastPage > 1) && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {citizenCurrentPage} of {citizenLastPage}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={citizenCurrentPage <= 1}
                    onClick={async () => {
                      setLoading(true);
                      await fetchPage(citizenCurrentPage - 1);
                      setLoading(false);
                    }}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, citizenLastPage) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === citizenCurrentPage;
                      return (
                        <Button
                          key={pageNum}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 text-xs font-medium transition-all duration-200 ${isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-primary hover:text-primary-foreground"
                            }`}
                          disabled={pageNum > citizenLastPage}
                          onClick={async () => {
                            setLoading(true);
                            await fetchPage(pageNum);
                            setLoading(false);
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {citizenLastPage > 5 && (
                      <>
                        <span className="text-muted-foreground text-xs px-1">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                          onClick={async () => {
                            setLoading(true);
                            await fetchPage(citizenLastPage);
                            setLoading(false);
                          }}
                        >
                          {citizenLastPage}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={citizenCurrentPage >= citizenLastPage}
                    onClick={async () => {
                      setLoading(true);
                      await fetchPage(citizenCurrentPage + 1);
                      setLoading(false);
                    }}
                  >
                    Next
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
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
                <p className="text-sm mt-1">{selectedRequest.submission_date.split("T")[0]}</p>
              </div>
              {selectedRequest.completion_date && (
                <div>
                  <Label>Completion Date</Label>
                  <p className="text-sm mt-1">{selectedRequest.completion_date.split("T")[0]}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
