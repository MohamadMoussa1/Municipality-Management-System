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
import { useNavigate } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea';
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
const API_URL = 'http://127.0.0.1:8000/api';

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

  // 5. Fetch all events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // 6. API: Fetch all events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

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
          `${API_URL}/events/${selectedEvent.id}`,
          eventData,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setEvents(events.map(event =>
          event.id === selectedEvent.id ? response.data : event
        ));
        await fetchEvents();
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const response = await axios.post(
          `${API_URL}/events`,
          eventData,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        // Ensure we're using the correct response structure
        const newEvent = response.data?.data || response.data;
        setEvents(prevEvents => [newEvent, ...prevEvents]);
        await fetchEvents();
        toast.success('Event created successfully');
      }

      setDialogOpen(false);
      resetForm();
      return true;
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(`Failed to ${selectedEvent ? 'update' : 'create'} event: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 8. API: View event details
  const handleViewEvent = async (eventId: number) => {
    try {
      const response = await axios.get(`${API_URL}/events/${eventId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      await axios.delete(`${API_URL}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
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
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">

              <Select value={filterAudience} onValueChange={setFilterAudience}>
                <SelectTrigger className="w-[140px]">
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
                <SelectTrigger className="w-[130px]">
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
        <CardContent>
          <div className="grid gap-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events found. Create a new event to get started.
              </div>
            ) : (
              filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {event.status || 'upcoming'}
                          </Badge>

                          <Badge variant="outline">
                            {getAudienceLabel(event.target_audience as EventAudience)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          )}
                          {event.capacity && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.registered || 0} / {event.capacity} registered
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                              handleDeleteEvent(event.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
