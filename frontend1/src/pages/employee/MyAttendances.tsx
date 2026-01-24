import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, LogIn, LogOut ,Loader2} from 'lucide-react';
import  getCsrfToken  from '../../lib/utils';
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

export default function MyAttendances() {
  const [attendances, setAttendances] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsCheckoutLoading, setDetailsCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const [CurrentPage, setCurrentPage] = useState<number>(1);
  const [LastPage, setLastPage] = useState<number>(1);
  const [Clicked, setClicked] = useState(false);
  const fetchPage = async (pageNumber: number) => {
    const response = await fetch(`http://127.0.0.1:8000/api/attendance?page=${pageNumber}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    const res = await response.json();
    setAttendances(res.data.data);
    setCurrentPage(res.data.current_page);
    setLastPage(res.data.last_page);
  };
  const fetchData = async () => {
    await fetchPage(1);
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, [Clicked]);

  const [todayAttendance, setTodayAttendance] = useState(null);
  const todayStr = new Date().toISOString().split('T')[0];
  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/cs/attendance/check-in', {
        method: 'POST',
        credentials:"include",
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN':getCsrfToken(), },
      });

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      const body = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(body?.message || 'Checked in');
        // Use returned attendance if present, otherwise show optimistic local record
        const att = body?.attendance || body?.data || body;
        if (att && (att.id || att.date)) {
          // prefer canonical server record
          setAttendances(prev => [att, ...prev.filter(a => a.date !== att.date)]);
          setTodayAttendance(att);
        } else {
          const nowStr = new Date().toISOString();
          const temp = {
            id: `temp-${Date.now()}`,
            date: todayStr,
            check_in: nowStr,
            check_out: null,
            hours_worked: null,
          };
          setAttendances(prev => [temp, ...prev.filter(a => a.date !== temp.date)]);
          setTodayAttendance(temp);
        }
        // Re-sync with server to get canonical data (best-effort)
        await fetchData();
      } else {
        // Specific handling for already-checked-in
        if (body?.message && body.message.toLowerCase().includes('already checked in')) {
          toast.error(body.message);
          // refresh to get current state
          await fetchData();
        } else {
          toast.error(body?.message || 'Failed to check in');
        }
      }
    } catch (e) {
      toast.error('Failed to check in. Please try again.');
    }
    setActionLoading(false);
  };

  const handleCheckOut = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/cs/attendance/check-out', {
        method: 'POST',
        credentials:"include",
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN':getCsrfToken(), },
      });

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      const body = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(body?.message || 'Checked out');
        const att = body?.attendance || body?.data || body;
        if (att && att.id) {
          setAttendances(prev => prev.map(a => (a.date === att.date ? att : a)));
          setTodayAttendance(att);
        } else {
          // Optimistically update today's record if present (might be a temp record)
          const nowStr = new Date().toISOString();
          setAttendances(prev =>
            prev.map(a =>
              a.date === todayStr
                ? { ...a, check_out: nowStr, hours_worked: computeHours(a.check_in, nowStr) }
                : a
            )
          );
          setTodayAttendance(prev => (prev && prev.date === todayStr ? { ...prev, check_out: new Date().toISOString(), hours_worked: computeHours(prev.check_in, new Date().toISOString()) } : prev));
          // Re-sync to get authoritative record (and id)
          await fetchData();
        }
      } else {
        // specific handling
        if (body?.message && body.message.toLowerCase().includes('no check-in')) {
          toast.error(body.message);
          await fetchData();
        } else if (body?.message && body.message.toLowerCase().includes('already checked out')) {
          toast.error(body.message);
          await fetchData();
        } else {
          toast.error(body?.message || 'Failed to check out');
        }
      }
    } catch (e) {
      toast.error('Failed to check out. Please try again.');
    }
    setActionLoading(false);
  };

  const fetchDetails = async (id) => {
    if (!id) {
      toast.error('Attendance id not found.');
      return;
    }
   
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/attendance/${id}`, {
        headers: { Accept: 'application/json' },
        credentials:"include",
      });
      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        
        navigate('/login');
        return;
      }
      const body = await res.json().catch(() => null);
      if (res.ok) {
        const att = body?.attendance || body?.data || body;
        setSelected(att);
        setDetailsOpen(true);
      } else {
        toast.error(body?.message || 'Failed to fetch attendance details');
      }
    } catch (e) {
      toast.error('Failed to fetch attendance details.');
    }
  };

  // Checkout from the details dialog (employee action)
  const handleCheckoutFromDetails = async () => {
    if (detailsCheckoutLoading) return;
    setDetailsCheckoutLoading(true);
    

    try {
      const res = await fetch('http://127.0.0.1:8000/cs/attendance/check-out', {
        method: 'POST',
        credentials:"include",
        headers: {  Accept: 'application/json' , 'X-XSRF-TOKEN':getCsrfToken(),},
      });

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        setDetailsCheckoutLoading(false);
        return;
      }

      const body = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(body?.message || 'Checked out successfully');
        const att = body?.attendance || body?.data || body;
        if (att && att.date) {
          // update the list and the selected record
          setAttendances(prev => prev.map(a => (a.date === att.date ? att : a)));
          setSelected(att);
        } else {
          // fallback: update today's entry
          const nowStr = new Date().toISOString();
          setAttendances(prev => prev.map(a => (ymd(a.date) === todayStr ? { ...a, check_out: nowStr, hours_worked: computeHours(a.check_in, nowStr) } : a)));
          setTodayAttendance(prev => (prev && ymd(prev.date) === todayStr ? { ...prev, check_out: new Date().toISOString(), hours_worked: computeHours(prev.check_in, new Date().toISOString()) } : prev));
        }
        // close dialog and refresh full list to reflect canonical data
        setDetailsOpen(false);
        await fetchData();
      } else {
        if (body?.message) toast.error(body.message);
        else toast.error('Failed to check out');
      }
    } catch (e) {
      toast.error('Failed to check out. Please try again.');
    }

    setDetailsCheckoutLoading(false);
  };

  const stats = {
    total: attendances.length,
    missing_checkout: attendances.filter(a => !a.check_out).length,
    checked_today: todayAttendance ? (todayAttendance.check_out ? 2 : 1) : 0,
  };

  const fmt = (s) => (s ? new Date(s).toLocaleString() : '-');

  // Helper to get YYYY-MM-DD from server dates that may include time
  const ymd = (s) => (typeof s === 'string' && s.length >= 10 ? s.slice(0, 10) : null);

  const computeHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hrs = diffMs / (1000 * 60 * 60);
    return Math.round(hrs * 100) / 100;
  };
   if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading my attendances...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Attendances</h1>
          <p className="text-muted-foreground">Check-in, check-out and view your attendance history</p>
        </div>
        <div className="flex gap-2">
          {!todayAttendance && (
            <Button onClick={handleCheckIn} disabled={actionLoading}><LogIn className="h-4 w-4 mr-2"/> Check In</Button>
          )}
          {todayAttendance && !todayAttendance.check_out && (
            <Button onClick={handleCheckOut} variant="secondary" disabled={actionLoading}><LogOut className="h-4 w-4 mr-2"/> Check Out</Button>
          )}
          {todayAttendance && todayAttendance.check_out && (
            <Button disabled variant="outline">Checked out</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Records</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Missing Checkout</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-500">{stats.missing_checkout}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Checked Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.checked_today === 0 ? 'No' : stats.checked_today === 1 ? 'In' : 'In & Out'}</div></CardContent>
        </Card>
        {todayAttendance && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Today</CardTitle></CardHeader>
            <CardContent><div className="text-sm">{`${fmt(todayAttendance.check_in)} — ${todayAttendance.check_out ? fmt(todayAttendance.check_out) : '—'}`}</div></CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>View your recent records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendances.map((a) => (
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
                        <span>Check-in: {fmt(a.check_in)}</span>
                        <span>Check-out: {fmt(a.check_out)}</span>
                        
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => fetchDetails(a.id)}>View Details</Button>
                      {/* Quick checkout for today's missing checkout */}
                      {ymd(a.date) === todayStr && !a.check_out && (
                        <Button variant="secondary" size="sm" className="flex-1" onClick={async () => {
                          await handleCheckOut();
                          // if details dialog is open and showing this record, refresh selected from state
                          if (detailsOpen && selected && ymd(selected.date) === ymd(a.date)) {
                            const updated = attendances.find(x => ymd(x.date) === ymd(a.date));
                            if (updated) setSelected(updated);
                          }
                        }} disabled={actionLoading}>
                          <LogOut className="h-4 w-4 mr-2"/> Check Out
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {attendances.length === 0 && !loading && <div className="text-sm text-muted-foreground">No attendance records found.</div>}
            {(CurrentPage && LastPage && LastPage > 1) && (
                  <div className="flex items-center justify-between w-full p-4">
                    <div className="text-sm text-muted-foreground">
                      Page {CurrentPage} of {LastPage}
                    </div>
                    <div className="flex items-center gap-2">
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
              <div><Label>Check-in</Label><p className="text-sm mt-1">{fmt(selected.check_in)}</p></div>
              <div><Label>Check-out</Label><p className="text-sm mt-1">{fmt(selected.check_out)}</p></div>
              <div><Label>Hours</Label><p className="text-sm mt-1">{selected.hours_worked ?? '-'}</p></div>
            </div>
          )}
          <DialogFooter>
            {/* Show Checkout button to employee when check_out is null (allow attempting checkout for any record) */}
            {selected && !selected.check_out && (
              <Button onClick={async () => {
                await handleCheckoutFromDetails();
                // on success the handler refreshes data and the dialog will be closed
              }} disabled={detailsCheckoutLoading} className="mr-2">Check Out</Button>
            )}
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
