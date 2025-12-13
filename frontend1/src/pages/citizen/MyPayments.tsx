import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Download, AlertCircle } from 'lucide-react';
import { mockPayments } from '@/lib/mockData';
import { Payment } from '@/types';
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

export default function MyPayments() {
  const [payments] = useState<Payment[]>(mockPayments);

  const handleDownloadReceipt = (payment: Payment) => {
    // Generate receipt data
    const receiptData = `Municipality Management System
Payment Receipt

Receipt Number: ${payment.receiptNumber || 'N/A'}
Payment ID: ${payment.id}
Payment Type: ${payment.payment_type.replace('_', ' ').toUpperCase()}
Amount: $${payment.amount.toLocaleString()}
Date: ${new Date(payment.date).toLocaleDateString()}
Status: ${payment.status.toUpperCase()}

Thank you for your payment!
`;
    
    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${payment.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded successfully');
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const stats = {
    totalDue: payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter(p => p.status === 'overdue').length,
    paid: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Payments</h1>
            <p className="text-muted-foreground">Manage bills and payment history</p>
          </div>
        </div>

        {stats.overdue > 0 && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-500">Overdue Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    You have {stats.overdue} overdue payment{stats.overdue > 1 ? 's' : ''}. Please pay immediately to avoid penalties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalDue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
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
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.paid}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View all your bills and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{payment.payment_type.replace('_', ' ').toUpperCase()}</h3>
                          <Badge variant="outline" className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-lg">${payment.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className={payment.status === 'overdue' ? 'text-red-500 font-medium' : ''}>
                              {new Date(payment.date).toLocaleDateString()}
                            </span>
                          </div>
                          {payment.receiptNumber && (
                            <div>
                              <span className="text-muted-foreground">Receipt: </span>
                              {payment.receiptNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        {payment.status === 'paid' ? (
                          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleDownloadReceipt(payment)}>
                            <Download className="h-4 w-4" />
                            Receipt
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="flex-1 gap-2">
                                <CreditCard className="h-4 w-4" />
                                Pay Now
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Make Payment</DialogTitle>
                                <DialogDescription>
                                  Pay ${payment.amount} for {payment.payment_type.replace('_', ' ')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="method">Payment Method</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                                      <SelectItem value="bank">Bank Transfer</SelectItem>
                                      <SelectItem value="cash">Cash at Office</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="card">Card Number</Label>
                                  <Input id="card" placeholder="1234 5678 9012 3456" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date</Label>
                                    <Input id="expiry" placeholder="MM/YY" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input id="cvv" placeholder="123" type="password" />
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Pay ${payment.amount}</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
