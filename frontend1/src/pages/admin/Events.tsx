// 1. Update imports
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, Plus, Search, MapPin, Users, Clock, Filter, Edit, Eye, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import getCsrfToken from '../../lib/utils';
import { useNavigate } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

// 2. Define the Event interface
interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  target_audience: 'public' | 'staff' | 'citizens';
  created_at: string;
  updated_at: string;
  location?: string;
  capacity?: number;
  status?: string;
  type?: string;
  registered?: number;
  organizer?: string;
}

type EventAudience = 'public' | 'staff' | 'citizens';

// 3. API base URL


export default function Events() {
  const navigate = useNavigate();
  // 4. State management
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAudience, setFilterAudience] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState<number | null>(null);
  const [LastPage, setLastPage] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'public',
    target_audience: 'public' as EventAudience,
    date: '',
    location: '',
    capacity: '',
  });
  const fetchEvents = async (pageNumber: number) => {
    const response = await fetch(`http://127.0.0.1:8000/api/events?page=${pageNumber}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    const res = await response.json();
    setEvents(res.data.data);
    setCurrentPage(res.data.current_page);
    setLastPage(res.data.last_page);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchEvents(1);
      setLoading(false);
    };
    fetchData();
  }, []);
  // 7. API: Create or Update event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.title || !formData.date) {
      toast.error('Title and date are required');
      return false;
    }

    try {
      setIsSubmitting(true);
      const eventData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      if (selectedEvent) {
        // Update existing event
        const response = await axios.put(
          `http://127.0.0.1:8000/cs/events/${selectedEvent.id}`,
          eventData,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-XSRF-TOKEN': getCsrfToken(),
            },
            withCredentials: true,
          }
        );
        setEvents(events.map(event =>
          event.id === selectedEvent.id ? response.data : event
        ));
        await fetchEvents(1);
        toast.success('Event updated successfully');
        setDialogOpen(false);
        resetForm();
      } else {
        // Create new event
        const response = await axios.post(
          `http://127.0.0.1:8000/cs/events`,
          eventData,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-XSRF-TOKEN': getCsrfToken(),
            },
            withCredentials: true,
          }
        );
        // Ensure we're using the correct response structure
        const newEvent = response.data?.data || response.data;
        setEvents(prevEvents => [newEvent, ...prevEvents]);
        await fetchEvents(1);
        toast.success('Event created successfully');
        setDialogOpen(false);
        resetForm();
      }
      return true;
    } catch (error: any) {
    
      toast.error(`Failed to ${selectedEvent ? 'update' : 'create'} event. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 8. API: View event details
  const handleViewEvent = async (eventId: number) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/events/${eventId}`, {
        headers: {
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      setSelectedEvent(response.data);
      // You can open a view dialog here if needed
      toast.success('Event details loaded');
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    }
  };

  // 9. Handle edit event
  const handleEditEvent = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type || 'public',
      target_audience: event.target_audience || 'public',
      date: event.date.split('T')[0], // Format date for date input
      location: event.location || '',
      capacity: event.capacity?.toString() || '',
    });
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  // 9.1 Handle delete event
  const handleDeleteEvent = async (eventId: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/cs/events/${eventId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getCsrfToken(),
        },
        withCredentials: true,
      });

      // Remove the deleted event from the state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event. Please try again.');
    }
  };

  // 10. Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'public',
      target_audience: 'public',
      date: '',
      location: '',
      capacity: '',
    });
    setSelectedEvent(null);
  };

  // 11. Filter events
  const filteredEvents = events.filter((event) => {
    // Safely get all properties with fallbacks
    const title = event?.title || '';
    const description = event?.description || '';
    const eventType = event?.type || '';
    const eventStatus = event?.status || '';
    const eventAudience = event?.target_audience || '';

    // Convert search query to lowercase once
    const searchLower = searchQuery.toLowerCase();

    // Safe string operations
    const matchesSearch = title?.toLowerCase().includes(searchLower) ||
      description?.toLowerCase().includes(searchLower);
    const matchesType = filterType === 'all' || eventType === filterType;
    const matchesStatus = filterStatus === 'all' || eventStatus === filterStatus;
    const matchesAudience = filterAudience === 'all' || eventAudience === filterAudience;

    return matchesSearch && matchesType && matchesStatus && matchesAudience;
  });

  // 12. UI helper functions
  const getStatusColor = (status: string = 'upcoming') => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ongoing': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAudienceLabel = (audience: EventAudience) => {
    const labels: Record<EventAudience, string> = {
      public: 'Public',
      citizens: 'Citizens',
      staff: 'Staff',
    };
    return labels[audience] || audience;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events & Public Notices</h1>
          <p className="text-muted-foreground">Manage community events and announcements</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}>
              <DialogHeader>
                <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                <DialogDescription>
                  {selectedEvent ? 'Update event details' : 'Schedule a new public event or announcement'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Town Hall Meeting"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Event details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience *</Label>
                    <Select
                      value={formData.target_audience}
                      onValueChange={(value: EventAudience) =>
                        setFormData({ ...formData, target_audience: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (Everyone)</SelectItem>
                        <SelectItem value="citizens">Citizens Only</SelectItem>
                        <SelectItem value="staff">Staff Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                </div>

              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {selectedEvent ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    selectedEvent ? 'Save Changes' : 'Create Event'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{events.length}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500">{events.filter(e => e.status === 'upcoming').length}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-500">{events.filter(e => e.status === 'ongoing').length}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Ongoing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-500">{events.filter(e => e.status === 'completed').length}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterAudience} onValueChange={setFilterAudience}>
                <SelectTrigger className="w-[120px] sm:w-[140px] h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audience</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="citizens">Citizens</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[110px] sm:w-[130px] h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No events found. Create a new event to get started.
            </div>
          ) : (
            <div className="w-full">
              <div className="rounded-md border">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 w-[30%] sm:w-[25%]">Event</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 hidden md:table-cell w-[30%]">Description</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 w-[25%] sm:w-[20%]">Date</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 w-[20%] sm:w-[15%]">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 hidden sm:table-cell w-[15%]">Audience</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 w-[25%] sm:w-[15%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event, index) => (
                      <TableRow key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                        <TableCell className="font-medium text-sm px-3 py-3 align-middle">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="p-1.5 bg-primary/10 rounded-md flex-shrink-0 hidden sm:block">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-semibold text-foreground truncate">{event.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground px-3 py-3 align-middle hidden md:table-cell">
                          <div className="truncate" title={event.description}>
                            {event.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap px-3 py-3 align-middle">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="px-3 py-3 align-middle">
                          <Badge className={`${getStatusColor(event.status)} text-xs font-medium px-2 py-0.5 h-auto border-0 whitespace-nowrap`}>
                            {event.status || 'upcoming'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3 align-middle hidden sm:table-cell">
                          <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 h-auto whitespace-nowrap">
                            {getAudienceLabel(event.target_audience as EventAudience)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-3 py-3 align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this event?')) {
                                  handleDeleteEvent(event.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {(CurrentPage && LastPage && LastPage > 1) && (
                <div className="flex items-center justify-between w-full p-4">
                  <div className="text-sm text-muted-foreground">
                    Page {CurrentPage} of {LastPage}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 sm:h-8 sm:w-auto sm:px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={CurrentPage <= 1}
                      onClick={async () => {
                        setLoading(true);
                        await fetchEvents(CurrentPage - 1);
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
                              await fetchEvents(pageNum);
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
                              await fetchEvents(LastPage);
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
                      className="h-8 w-8 sm:h-8 sm:w-auto sm:px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={CurrentPage >= LastPage}
                      onClick={async () => {
                        setLoading(true);
                        await fetchEvents(CurrentPage + 1);
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
