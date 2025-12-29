import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea'; // adjust path if different

import {
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// ---- Types ----

type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | string;

type Leave = {
    id: number;
    type: 'annual' | 'sick' | 'unpaid' | 'other' | string;
    start_date: string; // Y-m-d
    end_date: string;   // Y-m-d
    reason: string | null;
    status: LeaveStatus;
    created_at?: string;
    updated_at?: string;
};

const API_BASE = 'http://127.0.0.1:8000/api';

// ---- Helpers ----

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
}

function getStatusIcon(status: LeaveStatus) {
    switch (status) {
        case 'pending':
            return <Clock className="h-4 w-4" />;
        case 'approved':
            return <CheckCircle className="h-4 w-4" />;
        case 'rejected':
            return <XCircle className="h-4 w-4" />;
        case 'cancelled':
            return <AlertCircle className="h-4 w-4" />;
        default:
            return <AlertCircle className="h-4 w-4" />;
    }
}

function getStatusColor(status: LeaveStatus) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'approved':
            return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'rejected':
            return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'cancelled':
            return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        default:
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
}

// ---- Component ----

export default function MyLeaves() {
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);

    const [newDialogOpen, setNewDialogOpen] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Form state
    const [leaveType, setLeaveType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    // Reload flag after submit
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch my leaves
    useEffect(() => {
        const fetchLeaves = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            try {
                const res = await fetch(`${API_BASE}/leaves/my`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.status === 401) {
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                const body = await res.json().catch(() => null);

                if (res.ok) {
                    const data = body?.data || body || [];
                    setLeaves(Array.isArray(data) ? data : []);
                } else {
                    toast.error(body?.message || 'Failed to fetch leave requests');
                    setLeaves([]);
                }
            } catch (error) {
                toast.error('Failed to fetch leave requests. Please try again.');
                setLeaves([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    // Stats
    const stats = {
        total: leaves.length,
        pending: leaves.filter((l) => l.status === 'pending').length,
        approved: leaves.filter((l) => l.status === 'approved').length,
        rejected: leaves.filter((l) => l.status === 'rejected').length,
    };

    // Submit new leave request
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!leaveType || !startDate || !endDate) {
            toast.error('Please fill in leave type, start date and end date.');
            return;
        }

        setLoadingSubmit(true);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_BASE}/leaves`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: leaveType,
                    start_date: startDate,
                    end_date: endDate,
                    reason: reason || null,
                }),
            });

            if (res.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const body = await res.json().catch(() => null);

            if (res.status === 422) {
                // Validation errors
                const errors = body?.errors;
                if (errors) {
                    const firstField = Object.keys(errors)[0];
                    const firstMsg = errors[firstField][0];
                    toast.error(firstMsg || 'Validation failed.');
                } else {
                    toast.error(body?.message || 'Validation failed.');
                }
                return;
            }

            if (res.ok) {
                toast.success(body?.message || 'Leave request submitted successfully.');

                const created: Leave | undefined = body?.data || body;
                if (created) {
                    setLeaves((prev) => [created, ...prev]);
                } else {
                    setRefreshKey((k) => k + 1);
                }

                // Reset form & close
                setLeaveType('');
                setStartDate('');
                setEndDate('');
                setReason('');
                setNewDialogOpen(false);
            } else {
                toast.error(body?.message || 'Failed to submit leave request');
            }
        } catch (error) {
            toast.error('Failed to submit leave request. Please try again.');
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleViewDetails = (leave: Leave) => {
        setSelectedLeave(leave);
        setDetailsOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading leave requests...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header + New Leave Dialog */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Leave Requests</h1>
                    <p className="text-muted-foreground">
                        Submit and track your leave requests
                    </p>
                </div>

                <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Leave Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Submit New Leave Request</DialogTitle>
                            <DialogDescription>
                                Choose leave type and dates, and optionally add a reason.
                            </DialogDescription>
                        </DialogHeader>

                        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="leave-type">Leave Type</Label>
                                <Select value={leaveType} onValueChange={setLeaveType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="annual">Annual Leave</SelectItem>
                                        <SelectItem value="sick">Sick Leave</SelectItem>
                                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason (optional)</Label>
                                <Textarea
                                    id="reason"
                                    rows={3}
                                    placeholder="Add any additional details about your leave"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={loadingSubmit}
                                >
                                    {loadingSubmit ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
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
                        <div className="text-2xl font-bold text-yellow-500">
                            {stats.pending}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {stats.approved}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {stats.rejected}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leave list */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Request History</CardTitle>
                    <CardDescription>
                        View the status and details of all your leave requests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {leaves.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            You have not submitted any leave requests yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {leaves.map((leave) => (
                                <Card
                                    key={leave.id}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold">
                                                        {leave.type.replace('_', ' ').toUpperCase()}
                                                    </h3>
                                                    <Badge
                                                        variant="outline"
                                                        className={getStatusColor(leave.status)}
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            {getStatusIcon(leave.status)}
                                                            {leave.status.replace('_', ' ')}
                                                        </span>
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                    <span>
                                                        ID: {leave.id}
                                                    </span>
                                                    <span>
                                                        From:{' '}
                                                        <span className="font-medium">
                                                            {formatDate(leave.start_date)}
                                                        </span>
                                                    </span>
                                                    <span>
                                                        To:{' '}
                                                        <span className="font-medium">
                                                            {formatDate(leave.end_date)}
                                                        </span>
                                                    </span>
                                                    {leave.created_at && (
                                                        <span>
                                                            Submitted:{' '}
                                                            <span className="font-medium">
                                                                {formatDate(leave.created_at)}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex sm:flex-col gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleViewDetails(leave)}
                                                >
                                                    View Details
                                                </Button>
                                                {/* If later you add cancel endpoint, you can put a Cancel button here for pending status */}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Leave Request Details</DialogTitle>
                        <DialogDescription>
                            Complete information about your leave request
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLeave && (
                        <div className="space-y-4 text-sm">
                            <div>
                                <Label>Leave Type</Label>
                                <p className="text-sm font-medium mt-1">
                                    {selectedLeave.type.replace('_', ' ').toUpperCase()}
                                </p>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Badge
                                    variant="outline"
                                    className={getStatusColor(selectedLeave.status)}
                                >
                                    {selectedLeave.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div>
                                <Label>Start Date</Label>
                                <p className="mt-1">
                                    {formatDate(selectedLeave.start_date)}
                                </p>
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <p className="mt-1">
                                    {formatDate(selectedLeave.end_date)}
                                </p>
                            </div>
                            {selectedLeave.reason && (
                                <div>
                                    <Label>Reason</Label>
                                    <p className="mt-1 whitespace-pre-line">
                                        {selectedLeave.reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}