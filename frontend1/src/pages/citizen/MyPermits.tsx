import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, DollarSign } from 'lucide-react';
import { mockPermits } from '@/lib/mockData';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from "react";

export default function MyPermits() {
  const [permits] = useState<Permit[]>(mockPermits);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const token=localStorage.getItem("token");

useEffect(() => {
  const fetchData = async () => {
     
      const response = await fetch("http://127.0.0.1:8000/api/permits/my-permits", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization":`Bearer ${token}`
        },
      });
      let res=null;
      try{
        console.log(await response.json());
      
      }
      catch(e){
        console.log(token);
      }
  };

  fetchData();
}, []);

  const handleViewDetails = (permit: Permit) => {
    setSelectedPermit(permit);
    setDetailsOpen(true);
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
      case 'in_review': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const stats = {
    total: permits.length,
    active: permits.filter(p => p.status === 'approved' || p.status === 'completed').length,
    pending: permits.filter(p => p.status === 'pending' || p.status === 'in_review').length,
    totalFees: permits.reduce((sum, p) => sum + p.fee, 0),
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Permits</h1>
            <p className="text-muted-foreground">Manage your permits and licenses</p>
          </div>
          <Dialog>
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select permit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business License</SelectItem>
                      <SelectItem value="construction">Construction Permit</SelectItem>
                      <SelectItem value="vehicle">Vehicle Registration</SelectItem>
                      <SelectItem value="event">Event Permit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documents">Upload Documents</Label>
                  <Input id="documents" type="file" multiple />
                  <p className="text-xs text-muted-foreground">
                    Upload required documents (business plan, blueprints, etc.)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit Application</Button>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalFees.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permit Applications</CardTitle>
            <CardDescription>View and manage your permit applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {permits.map((permit) => (
                <Card key={permit.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{permit.type.replace('_', ' ').toUpperCase()} LICENSE</h3>
                            <Badge variant="outline" className={getStatusColor(permit.status)}>
                              {permit.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{permit.description}</p>
                        </div>
                        <div className="flex sm:flex-col gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(permit)}>
                            View Details
                          </Button>
                          {permit.status === 'approved' && (
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(permit)}>
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Permit ID</p>
                            <p className="font-medium">{permit.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Issue Date</p>
                            <p className="font-medium">{new Date(permit.issue_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {permit.expiry_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Expires</p>
                              <p className="font-medium">{new Date(permit.expiry_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Fee</p>
                            <p className="font-medium">${permit.fee.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {permit.related_documents && permit.related_documents.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Documents:</p>
                          <div className="flex flex-wrap gap-2">
                            {permit.related_documents.map((doc, idx) => (
                              <Badge key={idx} variant="secondary" className="gap-1">
                                <FileText className="h-3 w-3" />
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
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
              <DialogTitle>Permit Details</DialogTitle>
              <DialogDescription>
                Complete information about your permit
              </DialogDescription>
            </DialogHeader>
            {selectedPermit && (
              <div className="space-y-4">
                <div>
                  <Label>Permit Type</Label>
                  <p className="text-sm font-medium mt-1">{selectedPermit.type.replace('_', ' ').toUpperCase()} LICENSE</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant="outline" className={getStatusColor(selectedPermit.status)}>
                    {selectedPermit.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Issue Date</Label>
                    <p className="text-sm mt-1">{new Date(selectedPermit.issue_date).toLocaleDateString()}</p>
                  </div>
                  {selectedPermit.expiry_date && (
                    <div>
                      <Label>Expiry Date</Label>
                      <p className="text-sm mt-1">{new Date(selectedPermit.expiry_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Fee</Label>
                  <p className="text-sm mt-1">${selectedPermit.fee.toLocaleString()}</p>
                </div>
                {selectedPermit.related_documents && selectedPermit.related_documents.length > 0 && (
                  <div>
                    <Label>Related Documents</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedPermit.related_documents.map((doc, idx) => (
                        <Badge key={idx} variant="secondary">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
              {selectedPermit?.status === 'approved' && (
                <Button onClick={() => selectedPermit && handleDownload(selectedPermit)}>Download Permit</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
