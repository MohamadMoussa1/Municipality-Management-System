import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import { CitizenRequest } from '@/types';

import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function MyPayroll() {
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [Clicked, setClicked] = useState(false);
  const [pr, setpr] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setClicked(false);
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/payrolls", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const res = await response.json();
      console.log(res.data.data);
      setpr(res?.data?.data);
      setLoading(false);
    };

    fetchData();
  }, [Clicked]);

  const handlePayrollView = (payroll: any) => {
    setSelectedRequest(payroll);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading requests...</span>
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My PayRoll</h1>
          <p className="text-muted-foreground">Track and manage your  payrolls</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div>
                <CardTitle className="text-lg sm:text-xl">Payroll Records</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Employee payroll information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Employee ID</TableHead>
                    <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Employee Name</TableHead>
                    <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Month</TableHead>
                    <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Base Salary</TableHead>
                    <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Bonuses</TableHead>
                    <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Generated Date</TableHead>
                    <TableHead className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading payroll records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : pr?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No payroll records found
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pr?.map((payroll) => (
                      <TableRow key={payroll.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-[10px] sm:text-sm px-2 sm:px-4 text-blue-600">{payroll.employee_id}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4 max-w-[80px] sm:max-w-none truncate font-medium">{payroll?.employee?.user?.name || 'N/A'}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 bg-purple-50 text-purple-700 rounded px-2 py-1">{payroll.month || 'N/A'}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 font-semibold text-green-600">${payroll.base_salary || '0.00'}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 text-blue-600">${payroll.bonuses || '0.00'}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 text-gray-600">{new Date(payroll.generated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-50"
                            onClick={() => handlePayrollView(payroll)}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Payroll Details</DialogTitle>
              <DialogDescription>
                Complete payroll information
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employee ID</Label>
                    <p className="text-sm font-medium mt-1">{selectedRequest.employee_id}</p>
                  </div>
                  <div>
                    <Label>Employee Name</Label>
                    <p className="text-sm font-medium mt-1">{selectedRequest.employee?.user?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Month</Label>
                    <p className="text-sm font-medium mt-1">{selectedRequest.month}</p>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <p className="text-sm font-medium mt-1">{selectedRequest.employee?.position || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department</Label>
                    <p className="text-sm font-medium mt-1">{selectedRequest.employee?.department || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Hire Date</Label>
                    <p className="text-sm font-medium mt-1">{new Date(selectedRequest.employee?.hire_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Financial Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Base Salary</Label>
                      <p className="text-sm font-medium mt-1 text-green-600">${selectedRequest.base_salary}</p>
                    </div>
                    <div>
                      <Label>Bonuses</Label>
                      <p className="text-sm font-medium mt-1 text-blue-600">${selectedRequest.bonuses}</p>
                    </div>
                    <div>
                      <Label>Deductions</Label>
                      <p className="text-sm font-medium mt-1 text-red-600">${selectedRequest.deductions}</p>
                    </div>
                    <div>
                      <Label>Net Salary</Label>
                      <p className="text-sm font-medium mt-1 text-purple-600 font-semibold">${selectedRequest.net_salary}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Generated Date</Label>
                    <p className="text-sm font-medium mt-1">{new Date(selectedRequest.generated_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Generated By</Label>
                    <p className="text-sm font-medium mt-1">{selectedRequest.generated_by}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Created At</Label>
                    <p className="text-sm font-medium mt-1">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Updated At</Label>
                    <p className="text-sm font-medium mt-1">{new Date(selectedRequest.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
