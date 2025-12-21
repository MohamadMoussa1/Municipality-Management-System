import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Edit, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const paymentTypes = [
  { value: 'property_tax', label: 'Property Tax' },
  { value: 'water_bill', label: 'Water Bill' },
  { value: 'electricity_bill', label: 'Electricity Bill' },
  { value: 'waste_management', label: 'Waste Management' },
  { value: 'other', label: 'Other' },
];

export default function Finance() {
  const [payments, setPayments] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Dialogs for create/update
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Form states
  const [form, setForm] = useState({ citizen_id: '', amount: '', payment_type: '' });
  const [bulkForm, setBulkForm] = useState({ citizen_ids: [], amount: '', payment_type: '' });
  const [editForm, setEditForm] = useState({ status: '', amount: '', payment_type: '' });

  // Citizen search for single payment
  const [citizenSearch, setCitizenSearch] = useState('');
  const [citizenResult, setCitizenResult] = useState(null);
  const [citizenLoading, setCitizenLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  // Bulk citizen search
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkSearchResult, setBulkSearchResult] = useState(null);
  const [bulkCitizenLoading, setBulkCitizenLoading] = useState(false);
  const [bulkPermissionError, setBulkPermissionError] = useState(null);

  const navigate = useNavigate();

  // Fetch all payments and citizens (for bulk)
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    // Payments
    try {
      const paymentsRes = await fetch("http://127.0.0.1:8000/api/payments", {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });

      if (paymentsRes.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json().catch(() => null);
        setPayments(paymentsData?.data || paymentsData || []);
      } else {
        const err = await paymentsRes.json().catch(() => null);
        toast.error(err?.message || "Failed to fetch payments");
        setPayments([]);
      }
    } catch (e) {
      toast.error("Failed to fetch payments. Please try again later.");
      setPayments([]);
    }

    // Citizens (for bulk selection)
    try {
      const citizensRes = await fetch("http://127.0.0.1:8000/api/citizens", {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      if (citizensRes.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (citizensRes.ok) {
        const citizensData = await citizensRes.json().catch(() => null);
        setCitizens(citizensData?.data || citizensData || []);
      } else if (citizensRes.status === 403) {
        // Not authorized to list all citizens - allow search instead
        setCitizens([]);
        toast.warning("You do not have permission to list all citizens. Use the search box to add citizens individually.");
      } else {
        const err = await citizensRes.json().catch(() => null);
        toast.error(err?.message || "Failed to fetch citizens");
        setCitizens([]);
      }
    } catch (e) {
      setCitizens([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search for a single citizen (by name/email/ID)
  const handleCitizenSearch = async () => {
    if (!citizenSearch) return;
    setCitizenLoading(true);
    setCitizenResult(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizens/${encodeURIComponent(citizenSearch)}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const body = await res.json().catch(() => null);
      setCitizenLoading(false);
      if (res.ok) {
        const result = body?.data || body;
        setCitizenResult(result);
        setPermissionError(null);
      } else if (res.status === 403) {
        setCitizenResult(null);
        const role = localStorage.getItem('role') || JSON.parse(localStorage.getItem('mms_user') || 'null')?.role || 'unknown';
        const msg = body?.message || 'Permission denied. You do not have access to view that citizen.';
        setPermissionError(`${msg} (Your role: ${role})`);
        toast.error(`${msg} (Your role: ${role})`);
      } else {
        setCitizenResult(null);
        setPermissionError(null);
        toast.error(body?.message || body?.error || "Citizen not found or unauthorized");
      }
    } catch (e) {
      setCitizenLoading(false);
      setCitizenResult(null);
      toast.error("Search failed. Please try again.");
    }
  };

  // Search for a citizen for bulk (by name/email/ID)
  const handleBulkCitizenSearch = async () => {
    if (!bulkSearch) return;
    setBulkCitizenLoading(true);
    setBulkSearchResult(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizens/${encodeURIComponent(bulkSearch)}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const body = await res.json().catch(() => null);
      setBulkCitizenLoading(false);
      if (res.ok) {
        const result = body?.data || body;
        setBulkSearchResult(result);
        setBulkPermissionError(null);
      } else if (res.status === 403) {
        setBulkSearchResult(null);
        const role = localStorage.getItem('role') || JSON.parse(localStorage.getItem('mms_user') || 'null')?.role || 'unknown';
        const msg = body?.message || 'Permission denied. You do not have access to view that citizen.';
        setBulkPermissionError(`${msg} (Your role: ${role})`);
        toast.error(`${msg} (Your role: ${role})`);
      } else {
        setBulkSearchResult(null);
        setBulkPermissionError(null);
        toast.error(body?.message || body?.error || "Citizen not found or unauthorized");
      }
    } catch (e) {
      setBulkCitizenLoading(false);
      setBulkSearchResult(null);
      toast.error("Search failed. Please try again.");
    }
  };

  // Add searched citizen to bulk list
  const handleAddBulkCitizen = () => {
    if (!bulkSearchResult) return;
    const idStr = String(bulkSearchResult.id);
    if (bulkForm.citizen_ids.includes(idStr)) {
      toast.error('Citizen already added to the list');
    } else {
      setBulkForm(f => ({
        ...f,
        citizen_ids: [...f.citizen_ids, idStr]
      }));
      toast.success('Citizen added to the list');
    }

    setBulkSearch('');
    setBulkSearchResult(null);
  };

  // Remove citizen from bulk list
  const handleRemoveBulkCitizen = (id) => {
    setBulkForm(f => ({
      ...f,
      citizen_ids: f.citizen_ids.filter(cid => cid !== id)
    }));
  };

  // Create payment for one citizen
  const handleCreatePayment = async () => {
    if (!form.citizen_id) {
      toast.error("Please select a citizen first.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          citizen_id: Number(form.citizen_id),
          amount: Number(form.amount),
          payment_type: form.payment_type,
        }),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(data?.message || "Payment created");
        setCreateDialogOpen(false);
        // Add created payment to UI without reloading
        const created = data?.data || data;
        if (created) setPayments(p => [created, ...p]);
      } else {
        toast.error(data?.message || "Failed to create payment");
      }
    } catch (e) {
      toast.error("Failed to create payment. Please try again.");
    }
  };

  // Create bulk payments
  const handleBulkPayment = async () => {
    if (!bulkForm.citizen_ids.length) {
      toast.error("Please select at least one citizen.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/payments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          citizen_ids: bulkForm.citizen_ids.map(Number),
          amount: Number(bulkForm.amount),
          payment_type: bulkForm.payment_type,
        }),
      });
      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(data?.message || "Bulk payments created");
        setBulkDialogOpen(false);
        // Refresh list
        fetchData();
      } else {
        toast.error(data?.message || "Failed to create bulk payments");
      }
    } catch (e) {
      toast.error("Failed to create bulk payments. Please try again.");
    }
  };

  // Update payment
  const handleUpdatePayment = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/payments/${selectedPayment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        status: editForm.status,
        amount: editForm.amount ? Number(editForm.amount) : undefined,
        payment_type: editForm.payment_type,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || "Payment updated");
      setEditDialogOpen(false);
      fetchData();
    } else {
      toast.error(data.message || "Failed to update payment");
    }
  };

  // Delete payment
  const handleDeletePayment = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/payments/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
    });
    if (res.status === 401) {
      toast.error("Session expired. Please login again.");
      return;
    }
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || "Payment deleted");
      // remove from state
      setPayments(p => p.filter(item => item.id !== id));
    } else {
      toast.error(data.message || "Failed to delete payment");
    }
  };

  // Stats
  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    completed: payments.filter(p => p.status === 'completed').length,
    failed: payments.filter(p => p.status === 'failed').length,
  };

  // UI helpers
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance & Billing</h1>
          <p className="text-muted-foreground">Track and manage all citizen payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4" /> New Payment</Button>
          <Button onClick={() => setBulkDialogOpen(true)} variant="outline"><Plus className="h-4 w-4" /> Bulk Payment</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Payments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-500">{stats.pending}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{stats.completed}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Failed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-500">{stats.failed}</div></CardContent></Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>View all payment transactions</CardDescription>
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
                        <span>Date: {new Date(payment.date).toLocaleDateString()}</span>
                        <span>Amount: ${payment.amount}</span>
                        <span>Citizen: {payment.citizen?.user?.name || payment.citizen?.user?.email || payment.citizen_id}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedPayment(payment); setDetailsOpen(true); }}>
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedPayment(payment); setEditForm({ status: payment.status, amount: payment.amount, payment_type: payment.payment_type }); setEditDialogOpen(true); }}>
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeletePayment(payment.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Complete information about this payment</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div><Label>Payment Type</Label><p className="text-sm font-medium mt-1">{selectedPayment.payment_type.replace('_', ' ').toUpperCase()}</p></div>
              <div><Label>Status</Label><Badge variant="outline" className={getStatusColor(selectedPayment.status)}>{selectedPayment.status.replace('_', ' ')}</Badge></div>
              <div><Label>Date</Label><p className="text-sm mt-1">{new Date(selectedPayment.date).toLocaleDateString()}</p></div>
              <div><Label>Amount</Label><p className="text-sm mt-1">${selectedPayment.amount}</p></div>
              <div><Label>Citizen</Label><p className="text-sm mt-1">{selectedPayment.citizen?.user?.name || selectedPayment.citizen?.user?.email || selectedPayment.citizen_id}</p></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Payment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payment</DialogTitle>
            <DialogDescription>Assign a payment to a single citizen</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Citizen (ID, name, national ID, or email)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ID, name, national ID, or email"
                  value={citizenSearch}
                  onChange={e => setCitizenSearch(e.target.value)}
                />
                <Button onClick={handleCitizenSearch} disabled={citizenLoading}><Search className="h-4 w-4" /></Button>
              </div>
              {citizenResult && (
                <div className="mt-2 flex items-center gap-2">
                  <div>
                    <div className="font-medium">{citizenResult?.user?.name || citizenResult?.user?.email}</div>
                    <div className="text-xs text-muted-foreground">{citizenResult?.user?.email}</div>
                    <div className="text-xs text-muted-foreground">ID: {citizenResult?.id}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { setForm(f => ({ ...f, citizen_id: String(citizenResult?.id) })); toast.success('Citizen selected'); setCitizenResult(null); setCitizenSearch(''); }}>Select</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setCitizenResult(null); setCitizenSearch(''); }}>Cancel</Button>
                  </div>
                </div>
              )}
              {permissionError && (
                <div className="mt-2 text-sm text-red-600">{permissionError}</div>
              )}
              {form.citizen_id && (
                <div className="mt-2 text-green-600 text-sm">Citizen selected: {form.citizen_id}</div>
              )}
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Enter amount" />
            </div>
            <div>
              <Label>Payment Type</Label>
              <Select value={form.payment_type} onValueChange={v => setForm(f => ({ ...f, payment_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {paymentTypes.map(pt => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePayment}>Create</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Payment Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Payment</DialogTitle>
            <DialogDescription>Assign a payment to multiple citizens</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search & Add Citizens (ID, name, or email)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ID, name, or email"
                  value={bulkSearch}
                  onChange={e => setBulkSearch(e.target.value)}
                />
                <Button onClick={handleBulkCitizenSearch} disabled={bulkCitizenLoading}><Search className="h-4 w-4" /></Button>
                {bulkSearchResult && (
                  <Button size="sm" onClick={handleAddBulkCitizen}>Add</Button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {bulkForm.citizen_ids.map(cid => {
                  const citizen = citizens.find(c => String(c.id) === cid);
                  return (
                    <span key={cid} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                      {citizen?.user?.name || citizen?.user?.email || cid}
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveBulkCitizen(cid)}>x</Button>
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={bulkForm.amount} onChange={e => setBulkForm(f => ({ ...f, amount: e.target.value }))} placeholder="Enter amount" />
            </div>
            <div>
              <Label>Payment Type</Label>
              <Select value={bulkForm.payment_type} onValueChange={v => setBulkForm(f => ({ ...f, payment_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {paymentTypes.map(pt => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleBulkPayment}>Create Bulk</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>Update payment status, amount, or type</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} placeholder="Enter amount" />
            </div>
            <div>
              <Label>Payment Type</Label>
              <Select value={editForm.payment_type} onValueChange={v => setEditForm(f => ({ ...f, payment_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {paymentTypes.map(pt => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdatePayment}>Update</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}