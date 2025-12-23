import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Attendances() {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employee_id: '', department: 'all', from_date: '', to_date: '', missing_checkout: false });
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ check_in: '', check_out: '' });
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/employees', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (res.ok) {
        const body = await res.json().catch(() => null);
        setEmployees(body?.data || body || []);
      } else if (res.status === 403) {
        setEmployees([]);
      } else {
        setEmployees([]);
      }
    } catch (e) {
      setEmployees([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const params = new URLSearchParams();
      if (filters.employee_id) params.set('employee_id', filters.employee_id);
      if (filters.department && filters.department !== 'all') params.set('department', filters.department);
      if (filters.from_date) params.set('from_date', filters.from_date);
      if (filters.to_date) params.set('to_date', filters.to_date);
      if (filters.missing_checkout) params.set('missing_checkout', '1');

      const res = await fetch(`http://127.0.0.1:8000/api/attendance?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const body = await res.json().catch(() => null);
      if (res.ok) {
        setAttendances(body?.data || body || []);
      } else {
        toast.error(body?.message || 'Failed to fetch attendances');
        setAttendances([]);
      }
    } catch (e) {
      toast.error('Failed to fetch attendances. Please try again.');
      setAttendances([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
    fetchData();
  }, []);

  const openDetails = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/attendance/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const body = await res.json().catch(() => null);
      if (res.ok) {
        setSelected(body?.attendance || body?.data || body);
        setDetailsOpen(true);
      } else {
        toast.error(body?.message || 'Failed to fetch attendance');
      }
    } catch (e) {
      toast.error('Failed to fetch attendance details.');
    }
  };

  const openEdit = (attendance) => {
    setSelected(attendance);
    setEditForm({ check_in: attendance.check_in || '', check_out: attendance.check_out || '' });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (editLoading) return;
    // Basic validation: check_in <= check_out if both present
    if (editForm.check_in && editForm.check_out && new Date(editForm.check_in) > new Date(editForm.check_out)) {
      toast.error('Check-in must be before check-out');
      return;
    }
    setEditLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/attendance/${selected.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_in: editForm.check_in || null, check_out: editForm.check_out || null }),
      });
      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const body = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(body?.message || 'Attendance updated');
        // update local list
        const att = body?.attendance || body?.data || body;
        if (att) setAttendances(prev => prev.map(a => (a.id === att.id ? att : a)));
        setEditOpen(false);
      } else {
        toast.error(body?.message || 'Failed to update attendance');
      }
    } catch (e) {
      toast.error('Failed to update attendance.');
    }
    setEditLoading(false);
  };

  const fmt = (s) => (s ? new Date(s).toLocaleString() : '-');

  const stats = {
    total: attendances.length,
    missing: attendances.filter(a => !a.check_out).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendances</h1>
          <p className="text-muted-foreground">List, filter and manage employee attendances</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline"><Search className="h-4 w-4 mr-2"/> Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter attendance list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Employee ID</Label>
              <Input value={filters.employee_id} onChange={e => setFilters(f => ({ ...f, employee_id: e.target.value }))} placeholder="Enter employee id" />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={filters.department} onValueChange={val => setFilters(f => ({ ...f, department: val }))}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="public_services">Public Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Date</Label>
              <Input type="date" value={filters.from_date} onChange={e => setFilters(f => ({ ...f, from_date: e.target.value }))} />
            </div>
            <div>
              <Label>To Date</Label>
              <Input type="date" value={filters.to_date} onChange={e => setFilters(f => ({ ...f, to_date: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={filters.missing_checkout} onChange={e => setFilters(f => ({ ...f, missing_checkout: e.target.checked }))} />
              <span className="text-sm">Missing checkout only</span>
            </label>
            <Button onClick={fetchData}>Apply</Button>
            <Button variant="outline" onClick={() => { setFilters({ employee_id: '', department: 'all', from_date: '', to_date: '', missing_checkout: false }); fetchData(); }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Records</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Missing Checkout</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-500">{stats.missing}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Attendances</CardTitle>
          <CardDescription>View and manage attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendances.map(a => (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{new Date(a.date).toLocaleDateString()}</h3>
                        <Badge variant="outline" className={!a.check_out ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}>
                          <span className="flex items-center gap-1">
                            {!a.check_out ? <Clock className="h-4 w-4"/> : <CheckCircle className="h-4 w-4"/>}
                            {!a.check_out ? 'Missing checkout' : `${a.hours_worked} hrs`}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>Employee: {a.employee?.user?.name || a.employee?.user?.email || a.employee_id}</span>
                        <span>Dept: {a.employee?.department || '-'}</span>
                        <span>Check-in: {fmt(a.check_in)}</span>
                        <span>Check-out: {fmt(a.check_out)}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openDetails(a.id)}>View Details</Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(a)}><Edit className="h-4 w-4"/> Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {attendances.length === 0 && !loading && <div className="text-sm text-muted-foreground">No attendance records found.</div>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>Complete information about this attendance</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div><Label>Date</Label><p className="text-sm font-medium mt-1">{new Date(selected.date).toLocaleDateString()}</p></div>
              <div><Label>Employee</Label><p className="text-sm mt-1">{selected.employee?.user?.name || selected.employee?.user?.email || selected.employee_id}</p></div>
              <div><Label>Check-in</Label><p className="text-sm mt-1">{fmt(selected.check_in)}</p></div>
              <div><Label>Check-out</Label><p className="text-sm mt-1">{fmt(selected.check_out)}</p></div>
              <div><Label>Hours</Label><p className="text-sm mt-1">{selected.hours_worked ?? '-'}</p></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>Modify check-in or check-out times</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <Label>Check-in</Label>
                <Input type="datetime-local" value={editForm.check_in ? toLocalDatetimeVal(editForm.check_in) : ''} onChange={e => setEditForm(f => ({ ...f, check_in: e.target.value }))} />
              </div>
              <div>
                <Label>Check-out</Label>
                <Input type="datetime-local" value={editForm.check_out ? toLocalDatetimeVal(editForm.check_out) : ''} onChange={e => setEditForm(f => ({ ...f, check_out: e.target.value }))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={editLoading}>Update</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function fmt(s) {
  return s ? new Date(s).toLocaleString() : '-';
}

function toLocalDatetimeVal(s) {
  if (!s) return '';
  const d = new Date(s);
  // return string in format yyyy-mm-ddThh:mm
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
