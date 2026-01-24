import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import { CitizenRequest } from '@/types';
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
  const [CurrentPage, setCurrentPage] = useState<number>(1);
  const [LastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (pageNumber: number) => {

    const response = await fetch(`http://127.0.0.1:8000/api/payrolls?page=${pageNumber}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    const res = await response.json();
    setpr(res?.data?.data);
    setCurrentPage(res.data.current_page);
    setLastPage(res.data.last_page);
    setLoading(false);
  };

  useEffect(() => {
    fetchPage(1);
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
            {(CurrentPage && LastPage && LastPage > 1) && (
              <div className="flex items-center justify-between w-full p-4 pt-2 mb-1">
                <div className="text-sm text-muted-foreground ">
                  Page {CurrentPage} of {LastPage}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={CurrentPage <= 1}
                    onClick={async () => {
                      setLoading(true);
                      await fetchPage(CurrentPage - 1);
                      setLoading(false);
                    }}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, LastPage) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === CurrentPage;
                      return (
                        <Button
                          key={pageNum}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 text-xs font-medium transition-all duration-200 ${isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-primary hover:text-primary-foreground"
                            }`}
                          disabled={pageNum > LastPage}
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
                    {LastPage > 5 && (
                      <>
                        <span className="text-muted-foreground text-xs px-1">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                          onClick={async () => {
                            setLoading(true);
                            await fetchPage(LastPage);
                            setLoading(false);
                          }}
                        >
                          {LastPage}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={CurrentPage >= LastPage}
                    onClick={async () => {
                      setLoading(true);
                      await fetchPage(CurrentPage + 1);
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
              <div className="space-y-6">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Employee ID</TableCell>
                      <TableCell>{selectedRequest.employee_id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Employee Name</TableCell>
                      <TableCell>{selectedRequest.employee?.user?.name || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Month</TableCell>
                      <TableCell>{selectedRequest.month}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Position</TableCell>
                      <TableCell>{selectedRequest.employee?.position || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Department</TableCell>
                      <TableCell>{selectedRequest.employee?.department || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Hire Date</TableCell>
                      <TableCell>{new Date(selectedRequest.employee?.hire_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div>
                  <h4 className="font-semibold mb-3">Financial Details</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-1/3">Base Salary</TableCell>
                        <TableCell className="text-green-600 font-medium">${selectedRequest.base_salary}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Bonuses</TableCell>
                        <TableCell className="text-blue-600 font-medium">${selectedRequest.bonuses}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Deductions</TableCell>
                        <TableCell className="text-red-600 font-medium">${selectedRequest.deductions}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Net Salary</TableCell>
                        <TableCell className="text-purple-600 font-semibold">${selectedRequest.net_salary}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Generated Date</TableCell>
                      <TableCell>{new Date(selectedRequest.generated_at).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Generated By</TableCell>
                      <TableCell>{selectedRequest.generated_by}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Created At</TableCell>
                      <TableCell>{new Date(selectedRequest.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Updated At</TableCell>
                      <TableCell>{new Date(selectedRequest.updated_at).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
