import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, FileText, Loader2, BadgeCheck, Calendar, Clock, Phone, User, Plus, AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';;
import { useToast } from '@/hooks/use-toast';
import type { RequestPermitStatus, RequestStatus } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
export default function Permits() {
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [Clicked, setClicked] = useState(false);
  const [P, setP] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [Id, setId] = useState("");
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_audience: '',
    date: '',
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  let isAdmin = false;
  const { role } = useAuth();
  if (role == 'admin') {
    isAdmin = true;
  }
  useEffect(() => {
    const f = async () => {
      setClicked(false);    
      try {
       
        const response = await fetch("http://127.0.0.1:8000/api/permits", {
          method: "GET",
          credentials:"include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch permits');
        }

        const res = await response.json();
        setP(res.data || []);
      } catch (error) {
        console.error("Error fetching permits:", error);
        toast({
          title: "Error",
          description: "Failed to load permits. Please try again.",
          variant: "destructive",
        });
        setP([]);
      } finally {
        setLoading(false);
      }
    };
    f();
  }, [Clicked]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Permits...</span>
      </div>
    );
  }
  const handleStatusChange = (Id: string, newStatus: any) => {
    if (formData.date == '') {
      const fetchData = async () => {
        try {
          setClicked(false);
          setClicked(true);
          const response = await fetch(`http://127.0.0.1:8000/api/permits/${Id}/status`, {
            method: "PUT",
            credentials:"include",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              status: selectedStatus,
            }),
          });

          const res = await response.json();
          setClicked(true)
          toast({
            title: "Status Updated",
            description: `Permit ${Id} status changed to ${newStatus.replace("_", " ")}${formData.date ? ` (Expiry: ${formData.date})` : ""
              }.`,
          });
        } catch (error) {
          console.error("Failed to update status:", error);
          toast({
            title: "Error",
            description: "Failed to update permit status.",
            variant: "destructive",
          });
        }
        setDialogOpen(false);

      };

      fetchData();
    }
    else {
      const fetchData = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/permits/${Id}/status`, {
            method: "PUT",
            credentials:"include",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              status: selectedStatus,
              expiry_date: formData.date,
            }),
          });

          const res = await response.json();
          setClicked(true)
          toast({
            title: res.message,
            description: `Permit ${Id} status changed to ${newStatus.replace("_", " ")}${formData.date ? ` (Expiry: ${formData.date})` : ""
              }.`,
          });
        } catch (error) {
          console.error("Failed to update status:", error);
          toast({
            title: "Error",
            description: "Failed to update permit status.",
            variant: "destructive",
          });
        }
        setDialogOpen(false);

      };

      fetchData();

    }

  };
  const getStatusColor = (status: RequestPermitStatus) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'expired': return 'bg-warning';
      case 'pending': return 'bg-accent';
      case 'rejected': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const handleDeletePermit = (Pid: string) => {
    let res = null;
    const fetchData = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/permits/" + Pid, {
        method: "DELETE",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
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
  const handleViewPermit = async (p: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/permits/${p}`, {
        method: 'GET',
        credentials:"include",
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const res = await response.json();
        setSelectedPermit(res.data);
        setDetailsOpen(true);
      } else {
        toast({
          title: "Error",
          description: 'Failed to load permit details',
        });
      }
    } catch (error) {
      console.error('Error fetching permit details:', error);
      toast({
        title: "Error",
        description: 'Failed to load permit details',
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading permits details...</span>
      </div>
    );
  }
  const handleDownloadPermit = (url: string) => {
    toast({
      title: "Download Started",
      description: `Downloading permit  document...`,
    });
  };

  const handleDownload = (link: string, id: string) => {
    console.log(link)
    try {
      window.open(link,"_blank")

      toast({
        title: "Success",
        description: "Permit downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading permit:', error);
      toast({
        title: "Error",
        description: "Failed to download permit",
      });
    }
  };
  function handleStatus(id: any, newStatus: string) {
    setSelectedStatus(newStatus);
    setId(id);
    // Update selectedPermit status immediately for better UX
    if (selectedPermit) {
      setSelectedPermit({
        ...selectedPermit,
        status: newStatus as RequestStatus
      });
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Permits & Licensing</h1>
        <p className="text-muted-foreground mt-1">Manage permit applications and renewals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{P.length}</div>
            <div className="text-sm text-muted-foreground">Total Permits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-warning">{P.filter(r => r.status === 'expired').length}</div>
            <div className="text-sm text-muted-foreground">EXpirde</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-success">{P.filter(r => r.status === 'approved').length}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-destructive">{P.filter(r => r.status === 'rejected').length}</div>
            <div className="text-sm text-muted-foreground">rejected</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest permit applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permit ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {P.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.id}</TableCell>
                      <TableCell>{p.applicant.id}</TableCell>
                      <TableCell className="capitalize">{p.type}</TableCell>
                      <TableCell>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-9 px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 border-0 rounded-lg"
                          onClick={() => {
                            setDialogOpen(true);
                            setSelectedPermit(p);
                            setId(p.id);

                          }}
                        >
                          Choose
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.status}   
                        >
                          <SelectValue> 
                            <Badge className={getStatusColor(p.status)}>
                              {p.status === 'in_review' ? 'In Review' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </Badge>
                          </SelectValue>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewPermit(p.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadPermit(p.related_documents)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-3 bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 border-0 rounded-md flex items-center gap-2"
                              onClick={() => handleDeletePermit(p.id)}
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
        </Card >
      </div >
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Permit Details</DialogTitle>
            <DialogDescription>
              Complete information about your permit
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading permit details...</span>
            </div>
          ) : selectedPermit && selectedPermit.permit ? (

            <div className="space-y-5">
              {/* Permit Type */}
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label>Permit Type</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedPermit.permit.type.replace("_", " ").toUpperCase()} LICENSE
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <BadgeCheck className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${getStatusColor(selectedPermit.permit.status)}`}
                  >
                    {selectedPermit.permit.status?.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label>Created At</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedPermit.permit.created_at}
                  </p>
                </div>
              </div>

              {/* Applicant ID */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label>Applicant ID</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedPermit.applicant.id}
                  </p>
                </div>
              </div>

              {/* Applicant Name */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label>Applicant Name</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedPermit.applicant.name}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label>Contact</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedPermit.applicant.contact}
                  </p>
                </div>
              </div>

              {/* Issue / Expiry Dates */}
              {selectedPermit.permit.issue_date && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <Label>Issue Date</Label>
                      <p className="text-sm mt-1">{selectedPermit.permit.issue_date}</p>
                    </div>
                  </div>

                  {selectedPermit.permit.expiry_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <Label>Expiry Date</Label>
                        <p className="text-sm mt-1">{selectedPermit.permit.expiry_date}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Documents */}
              {selectedPermit.documents &&
                selectedPermit.documents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <Label>Related Documents</Label>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedPermit.documents.map((doc) => (
                        <Badge key={doc.id} variant="secondary">
                          {doc.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>

          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            {selectedPermit?.status === 'completed' && (
              <Button onClick={() => handleDownload(selectedPermit.documents.url, selectedPermit.appliant.id)}>Download Permit</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto p-6 space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedStatus === 'approved' && !formData.date) {
                toast({
                  title: "Error",
                  description: "Please select an expiry date for approved permits",
                  variant: "destructive",
                });
                return;
              }
               handleStatusChange(Id, selectedStatus)
            }}
            className="space-y-6"
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Update Status</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Change the permit status. Date input appears only if status is approved.
              </DialogDescription>
            </DialogHeader>

            {/* Status Select */}
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(newStatus) => {
                  setSelectedStatus(newStatus);
                  handleStatus(selectedPermit?.id, newStatus);
                }}
              >
                <SelectTrigger className="w-[180px] h-10 rounded-lg border border-border/50 shadow-sm hover:border-primary transition-colors">
                  <SelectValue>
                    <Badge
                      className={`flex items-center gap-1 px-2 py-1 rounded-full ${selectedStatus === "approved"
                        ? "bg-success text-white"
                        : selectedStatus === "expired"
                          ? "bg-warning text-white"
                          : selectedStatus === "pending"
                            ? "bg-accent text-white"
                            : selectedStatus === "rejected"
                              ? "bg-destructive text-white"
                              : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {selectedStatus === "approved" && <CheckCircle className="h-4 w-4" />}
                      {selectedStatus === "expired" && <Clock className="h-4 w-4" />}
                      {selectedStatus === "pending" && <AlertCircle className="h-4 w-4" />}
                      {selectedStatus === "rejected" && <XCircle className="h-4 w-4" />}
                      <span>
                        {selectedStatus === "in_review"
                          ? "In Review"
                          : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                      </span>
                    </Badge>
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="shadow-lg rounded-lg border border-border/30 p-2">
                  <SelectItem
                    value="approved"
                    className="flex items-center gap-2 px-2 py-1 hover:bg-success/20 rounded-md"
                  >
                    <CheckCircle className="h-4 w-4 text-success" /> Approved
                  </SelectItem>
                  <SelectItem
                    value="expired"
                    className="flex items-center gap-2 px-2 py-1 hover:bg-warning/20 rounded-md"
                  >
                    <Clock className="h-4 w-4 text-warning" /> Expired
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="flex items-center gap-2 px-2 py-1 hover:bg-accent/20 rounded-md"
                  >
                    <AlertCircle className="h-4 w-4 text-accent" /> Pending
                  </SelectItem>
                  <SelectItem
                    value="rejected"
                    className="flex items-center gap-2 px-2 py-1 hover:bg-destructive/20 rounded-md"
                  >
                    <XCircle className="h-4 w-4 text-destructive" /> Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Date Input */}
            {selectedStatus === "approved" && (
              <div className="p-4 border border-border/30 rounded-lg shadow-sm bg-secondary/10 transition-all duration-300 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label htmlFor="date" className="mb-1">Select Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-border/50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);

                }}
                disabled={loadingSubmit}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loadingSubmit}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Updating...
                  </>
                ) : (
                  "Update Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div >
  );
}


