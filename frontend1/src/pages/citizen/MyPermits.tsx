import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Calendar, Loader2 } from 'lucide-react';
import getCsrfToken from '../../lib/utils';
import {
  User,
  Phone,
  Clock,
  BadgeCheck,
} from "lucide-react"
import { Permit } from '@/types';
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from "react";

export default function MyPermits() {
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [openSubmit, setSubmitOpen] = useState(false);
  const [value, setvalue] = useState("");
  const [loading, setLoading] = useState(true);
  const [P, setP] = useState([]);
  const [files, setFiles] = useState<File[]>([]);
  const [Clicked, setClicked] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [LastPage, setLastPage] = useState(1);
    const [CurrentPage, setCurrentPage] = useState(1);
    const fetchPage = async (pageNumber: number) => {
      const response = await fetch(`http://127.0.0.1:8000/api/permits/my-permits?page=${pageNumber}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      const res = await response.json();
      setP(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    };
  
  
    useEffect(() => {
      const fetchData = async () => {
        await fetchPage(1);
        setLoading(false);
      };
      fetchData();
    }, [Clicked]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const formData = new FormData();
      formData.append("type", value);
      files.forEach((file: File) => {
        formData.append("documents[]", file);
      });
      const response = await fetch("http://127.0.0.1:8000/cs/permits", {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: formData,
      });
      const res = await response.json();
      if (response.ok) {
        // Reset form state
        setvalue("");
        setFiles([]);
        setSubmitOpen(false);
        setClicked(true);
        toast.success('Permit application submitted successfully!');
      } else {
        throw new Error(res.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoadingSubmit(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading permits...</span>
      </div>
    );
  }
  const handleViewDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/permits/${id}`, {
        method: 'GET',
        credentials: "include",
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const res = await response.json();
        
        setSelectedPermit(res.data);
        setDetailsOpen(true);
      } else {
        toast.error('Failed to load permit details');
      }
    } catch (error) {
      console.error('Error fetching permit details:', error);
      toast.error('Failed to load permit details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (permit: Permit) => {
    // Simulate download
    const data = `Municipality Management System
Permit Certificate

Permit ID: ${permit.id}
Type: ${permit.type.replace('_', ' ').toUpperCase()}
Status: ${permit.status}
Issue Date: ${new Date(permit.issue_date).toLocaleDateString()}
${permit.expiry_date ? `Expiry Date: ${new Date(permit.expiry_date).toLocaleDateString()}` : ''}
Fee: $${permit.fee}

Description:
${permit.description}

This is an official permit issued by the municipality.
`;

    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permit-${permit.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Permit downloaded successfully');
  };

  const getStatusColor = (status: Permit['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const stats = {
    total: P.length,
    active: P.filter(p => p.status === 'completed').length,
    pending: P.filter(p => p.status === 'pending' || p.status === 'in_progress').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Permits</h1>
          <p className="text-muted-foreground">Manage your permits and licenses</p>
        </div>
        <Dialog open={openSubmit} onOpenChange={setSubmitOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Apply for Permit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Apply for New Permit</DialogTitle>
              <DialogDescription>
                Submit a new permit application
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Permit Type</Label>
                <Select value={value} onValueChange={setvalue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business ">Business License</SelectItem>
                    <SelectItem value="construction">Construction Permit</SelectItem>
                    <SelectItem value="vehicle">Vehicle Registration</SelectItem>
                    <SelectItem value="public_event">Event Permit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documents">Upload Documents</Label>
                <Input id="documents" type="file" multiple
                  onChange={(e) => {
                    const uploadedFiles = e.currentTarget.files;
                    if (uploadedFiles) {
                      setFiles(Array.from(uploadedFiles));
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Upload required documents (business plan, blueprints, etc.)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={!value || files.length === 0 || loadingSubmit}
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Permits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
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
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Permit Applications</CardTitle>
          <CardDescription>View and manage your permit applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permit Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permit ID</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {P.map((permit) => (
                  <TableRow key={permit.id}>
                    <TableCell className="font-medium">
                      {permit.type.replace('_', ' ').toUpperCase()} LICENSE
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(permit.status)}>
                        {permit.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {permit.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      {permit.issue_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {permit.issue_date.split("T")[0]}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {permit.expiry_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {permit.expiry_date.split("T")[0]}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(permit.id)}>
                          View Details
                        </Button>
                        {permit.status === 'completed' && (
                          <Button variant="outline" size="sm" onClick={() => handleDownload(permit)}>
                            Download
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                 {(CurrentPage && LastPage && LastPage > 1) && (
            <div className="flex justify-start gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={CurrentPage <= 1}
                onClick={async () => {
                  setLoading(true);
                  await fetchPage(CurrentPage - 1);
                  setLoading(false);
                }} >Previous</Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={CurrentPage >= LastPage}
                onClick={async () => {
                  setLoading(true);
                  await fetchPage(CurrentPage + 1);
                  setLoading(false);
                }}
              >
                Next
              </Button>
            </div>
          )}
              </TableBody>
            </Table>
          </div>

          {P.some(permit => permit.related_documents && permit.related_documents.length > 0) && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Related Documents:</h4>
              <div className="space-y-2">
                {P.filter(permit => permit.related_documents && permit.related_documents.length > 0).map((permit) => (
                  <div key={permit.id} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{permit.id}:</span>
                    <div className="flex flex-wrap gap-1">
                      {permit.related_documents.map((doc, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1 text-xs">
                          <FileText className="h-3 w-3" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
          ) : selectedPermit ? (

            <div className="space-y-5">
              {/* Permit Type */}
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <Label>Permit Type</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedPermit.permit.type?.replace("_", " ").toUpperCase()} LICENSE
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
                    {selectedPermit.permit.created_at?.split("T")[0]}
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
              {selectedPermit.issue_date && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <Label>Issue Date</Label>
                      <p className="text-sm mt-1">{selectedPermit.issue_date}</p>
                    </div>
                  </div>

                  {selectedPermit.expiry_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <Label>Expiry Date</Label>
                        <p className="text-sm mt-1">{selectedPermit.expiry_date}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Documents */}
              {selectedPermit.related_documents &&
                selectedPermit.related_documents.length > 0 && (
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
              <Button onClick={() => handleDownload(selectedPermit)}>Download Permit</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
