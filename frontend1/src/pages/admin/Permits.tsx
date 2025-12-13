import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Download, FileText } from 'lucide-react';
import { mockPermits } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Permit, RequestStatus } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const workflowSteps = [
  { label: 'Submitted', status: 'completed' },
  { label: 'Document Review', status: 'completed' },
  { label: 'Inspection', status: 'current' },
  { label: 'Approval', status: 'pending' },
  { label: 'Issued', status: 'pending' },
];

export default function Permits() {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [permits, setPermits] = useState(mockPermits);

  const handleStatusChange = (permitId: string, newStatus: RequestStatus) => {
    setPermits(permits.map(permit => 
      permit.id === permitId ? { ...permit, status: newStatus } : permit
    ));
    toast({
      title: "Status Updated",
      description: `Permit ${permitId} status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'in_review': return 'bg-warning';
      case 'pending': return 'bg-accent';
      case 'rejected': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const handleViewPermit = (permit: Permit) => {
    setSelectedPermit(permit);
    setViewDialogOpen(true);
  };

  const handleDownloadPermit = (permit: Permit) => {
    toast({
      title: "Download Started",
      description: `Downloading permit ${permit.id} document...`,
    });
  };

  const handleDownloadDocument = (docName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${docName}...`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Permits & Licensing</h1>
        <p className="text-muted-foreground mt-1">Manage permit applications and renewals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">124</div>
            <div className="text-sm text-muted-foreground">Total Permits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-warning">28</div>
            <div className="text-sm text-muted-foreground">In Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-success">85</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-destructive">11</div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
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
                    <TableHead>Fee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permits.map((permit) => (
                    <TableRow key={permit.id}>
                      <TableCell className="font-medium">{permit.id}</TableCell>
                      <TableCell>{permit.citizenName}</TableCell>
                      <TableCell className="capitalize">{permit.type}</TableCell>
                      <TableCell>
                        <Select
                          value={permit.status}
                          onValueChange={(value: RequestStatus) => handleStatusChange(permit.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue>
                              <Badge className={getStatusColor(permit.status)}>
                                {permit.status === 'in_review' ? 'In Review' : permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">
                              <Badge className="bg-success">Approved</Badge>
                            </SelectItem>
                            <SelectItem value="in_review">
                              <Badge className="bg-warning">In Review</Badge>
                            </SelectItem>
                            <SelectItem value="pending">
                              <Badge className="bg-accent">Pending</Badge>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <Badge className="bg-destructive">Cancelled</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>${permit.fee?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewPermit(permit)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadPermit(permit)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Tracker</CardTitle>
            <CardDescription>Application PER002 Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {workflowSteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        step.status === 'completed'
                          ? 'bg-success text-success-foreground'
                          : step.status === 'current'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          step.status === 'completed' ? 'bg-success' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.status === 'completed' ? 'Completed' : step.status === 'current' ? 'In Progress' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">40%</span>
              </div>
              <Progress value={40} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents & Attachments</CardTitle>
          <CardDescription>Required documents for permit applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Business Plan', 'Tax ID', 'Blueprints', 'Land Deed', 'Insurance', 'Safety Certificate'].map((doc, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{doc}</p>
                  <p className="text-xs text-muted-foreground">PDF, 2.4 MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permit Details</DialogTitle>
            <DialogDescription>Complete information for {selectedPermit?.id}</DialogDescription>
          </DialogHeader>
          {selectedPermit && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Permit ID</p>
                <p className="text-sm text-muted-foreground">{selectedPermit.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Applicant</p>
                <p className="text-sm text-muted-foreground">{selectedPermit.citizenName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground capitalize">{selectedPermit.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge className={selectedPermit.status === 'approved' ? 'bg-success' : 'bg-accent'}>
                  {selectedPermit.status === 'approved' ? 'Approved' : 'In Review'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Issue Date</p>
                <p className="text-sm text-muted-foreground">{new Date(selectedPermit.issue_date).toLocaleDateString()}</p>
              </div>
              {selectedPermit.expiry_date && (
                <div>
                  <p className="text-sm font-medium">Expiry Date</p>
                  <p className="text-sm text-muted-foreground">{new Date(selectedPermit.expiry_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Fee</p>
                <p className="text-sm text-muted-foreground">${selectedPermit.fee.toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
