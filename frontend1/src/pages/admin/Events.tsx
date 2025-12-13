import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Search, MapPin, Users, Clock, Filter, Edit, Eye } from 'lucide-react';
import { mockEvents } from '@/lib/mockData';
import { Event, EventAudience } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function Events() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAudience, setFilterAudience] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'public' as Event['type'],
    target_audience: 'public' as EventAudience,
    date: '',
    location: '',
    capacity: '',
  });

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesAudience = filterAudience === 'all' || event.target_audience === filterAudience;
    return matchesSearch && matchesType && matchesStatus && matchesAudience;
  });

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ongoing': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'public': return 'bg-purple-500/10 text-purple-500';
      case 'official': return 'bg-blue-500/10 text-blue-500';
      case 'cultural': return 'bg-pink-500/10 text-pink-500';
      case 'sports': return 'bg-orange-500/10 text-orange-500';
      case 'internal': return 'bg-slate-500/10 text-slate-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAudienceLabel = (audience: EventAudience) => {
    const labels: Record<EventAudience, string> = {
      public: 'Public',
      citizen: 'Citizens Only',
      finance: 'Finance Team',
      hr_manager: 'HR Team',
      project_manager: 'Project Team',
      clerk: 'Clerks',
      all_employees: 'All Staff',
    };
    return labels[audience] || audience;
  };

  const getAudienceBadgeColor = (audience: EventAudience) => {
    if (audience === 'public') return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (audience === 'citizen') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (audience === 'all_employees') return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  const handleCreateEvent = () => {
    if (!formData.title || !formData.date || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      target_audience: formData.target_audience,
      date: formData.date,
      location: formData.location,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      registered: 0,
      organizer: 'Municipality',
      status: 'upcoming',
    };

    setEvents([newEvent, ...events]);
    setDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      type: 'public',
      target_audience: 'public',
      date: '',
      location: '',
      capacity: '',
    });
    toast.success('Event created successfully');
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    toast.info(`Viewing event: ${event.title}`);
  };

  const handleEditEvent = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      target_audience: event.target_audience,
      date: event.date,
      location: event.location,
      capacity: event.capacity?.toString() || '',
    });
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Events & Public Notices</h1>
            <p className="text-muted-foreground">Manage community events and announcements</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => {
                setSelectedEvent(null);
                setFormData({
                  title: '',
                  description: '',
                  type: 'public',
                  target_audience: 'public',
                  date: '',
                  location: '',
                  capacity: '',
                });
              }}>
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
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
                    <Label htmlFor="type">Event Type</Label>
                    <Select value={formData.type} onValueChange={(value: Event['type']) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="official">Official</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience *</Label>
                    <Select value={formData.target_audience} onValueChange={(value: EventAudience) => setFormData({ ...formData, target_audience: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (Everyone)</SelectItem>
                        <SelectItem value="citizen">Citizens Only</SelectItem>
                        <SelectItem value="all_employees">All Staff</SelectItem>
                        <SelectItem value="finance">Finance Team</SelectItem>
                        <SelectItem value="hr_manager">HR Team</SelectItem>
                        <SelectItem value="project_manager">Project Team</SelectItem>
                        <SelectItem value="clerk">Clerks</SelectItem>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input 
                      id="capacity" 
                      type="number" 
                      placeholder="100"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input 
                      id="location" 
                      placeholder="City Hall"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input 
                      id="capacity" 
                      type="number" 
                      placeholder="100"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" onClick={handleCreateEvent}>
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </DialogFooter>
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
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="official">Official</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAudience} onValueChange={setFilterAudience}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audience</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="citizen">Citizens</SelectItem>
                    <SelectItem value="all_employees">All Staff</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr_manager">HR</SelectItem>
                    <SelectItem value="project_manager">Projects</SelectItem>
                    <SelectItem value="clerk">Clerks</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
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
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                          <Badge variant="secondary" className={getTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                          <Badge variant="outline" className={getAudienceBadgeColor(event.target_audience)}>
                            {getAudienceLabel(event.target_audience)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.registered || 0} / {event.capacity || 'Unlimited'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.organizer}
                          </div>
                        </div>
                      </div>
                      <div className="flex lg:flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => handleViewEvent(event)}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
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
