import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Download, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/payments/my-payments", {
        method: "GET",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const res = await response.json().catch(() => null);
      setPayments(res?.data || []);
    } catch (e) {
      toast.error("Failed to fetch payments. Please try again.");
      setPayments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle redirect back from Stripe (success/cancel)
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('payment');
    const id = params.get('id');
    if (!status) return;

    if (status === 'success') {
      toast.success('Payment successful');
      // Try polling the payment until webhook marks it completed, then refresh
      if (id) {
        let attempts = 0;
        const maxAttempts = 8;
        const interval = 1000;
        const poll = async () => {
          attempts++;
          try {
            const r = await fetch(`http://127.0.0.1:8000/api/payments/${id}`, { headers: { Accept: 'application/json' },credentials:"include" });
            if (r.status === 401) {
              toast.error('Session expired. Please login again.');
              navigate('/login');
              return;
            }
            if (r.ok) {
              const body = await r.json().catch(() => null);
              const p = body?.data || body;
              if (p && p.status === 'completed') {
                fetchData();
                return;
              }
            }
          } catch (e) {
            // ignore
          }
          if (attempts < maxAttempts) {
            setTimeout(poll, interval);
          } else {
            // give up and refresh list anyway
            fetchData();
          }
        };
        poll();
      } else {
        fetchData();
      }
    } else if (status === 'failed') {
      toast.error('Payment failed');
      fetchData();
    }

    // Remove query params from URL to avoid repeating the toast
    navigate(location.pathname, { replace: true });
  }, [location.search, navigate, location.pathname]);

  const handlePayNow = async (payment) => {
    if (payLoading) return;
    setPayLoading(true);
   
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/payments/${payment.id}/pay`, {
        method: "POST",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          
        },
      });
      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const res = await response.json().catch(() => null);
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        toast.error(res?.message || "Failed to initiate payment.");
      }
    } catch (e) {
      toast.error("Failed to initiate payment.");
    }
    setPayLoading(false);
  }; 

  const handleDownloadReceipt = (payment) => {
    const receiptData = `Municipality Management System
Payment Receipt

Payment ID: ${payment.id}
Payment Type: ${payment.payment_type.replace('_', ' ').toUpperCase()}
Amount: $${payment.amount}
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

  const fetchPaymentDetails = async (id) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/payments/${id}`, {
        method: "GET",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate('/login');
        return;
      }
      const res = await response.json().catch(() => null);
      if (response.ok) {
        setSelectedPayment(res?.data || res);
        setDetailsOpen(true);
      } else {
        toast.error(res?.message || "Failed to fetch payment details");
      }
    } catch (e) {
      toast.error("Failed to fetch payment details.");
    }
    setDetailsLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  }; 

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'refunded': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return '';
    }
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    completed: payments.filter(p => p.status === 'completed').length,
    failed: payments.filter(p => p.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Payments</h1>
          <p className="text-muted-foreground">Manage bills and payment history</p>
        </div>
        {/* <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">Refresh</Button>
        </div> */}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
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
                          <span className="flex items-center gap-1">
                            {getStatusIcon(payment.status)}
                            {payment.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>ID: {payment.id}</span>
                        <span>Date: {new Date(payment.date).toLocaleDateString()}</span>
                        <span>Amount: ${payment.amount}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => fetchPaymentDetails(payment.id)}>
                        View Details
                      </Button>

                      {/* fetch fresh details */}
                      
                      {payment.status === 'pending' && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePayNow(payment)}>
                          <CreditCard className="h-4 w-4" /> Pay Now
                        </Button>
                      )}
                      {payment.status === 'completed' && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownloadReceipt(payment)}>
                          <Download className="h-4 w-4" /> Receipt
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
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete information about your payment
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label>Payment Type</Label>
                <p className="text-sm font-medium mt-1">{selectedPayment.payment_type.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant="outline" className={getStatusColor(selectedPayment.status)}>
                  {selectedPayment.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <Label>Date</Label>
                <p className="text-sm mt-1">{new Date(selectedPayment.date).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm mt-1">${selectedPayment.amount}</p>
              </div>
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