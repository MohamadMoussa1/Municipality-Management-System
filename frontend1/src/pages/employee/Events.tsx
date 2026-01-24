import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  target_audience: 'public' | 'staff' | 'citizens';
  created_at: string;
  updated_at: string;
}

export default function EmployeeEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [CurrentPage, setCurrentPage] = useState<number>(1);
  const [LastPage, setLastPage] = useState<number>(1);
  const [Clicked, setClicked] = useState(false);

  const fetchPage = async (pageNumber: number) => {
    const response = await fetch(`http://127.0.0.1:8000/api/events?page=${pageNumber}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    const res = await response.json();
    console.log(res)
    setEvents(res.data.data);
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
  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || event.target_audience === filterType;
    const isPast = new Date(event.date) < new Date();
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'past' && isPast) ||
      (filterStatus === 'upcoming' && !isPast);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (eventDate: string) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);

    if (eventDateObj < today) {
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  const getTypeColor = (audience: Event['target_audience']) => {
    switch (audience) {
      case 'public': return 'bg-purple-500/10 text-purple-500';
      case 'citizens': return 'bg-blue-500/10 text-blue-500';
      case 'staff': return 'bg-pink-500/10 text-pink-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading events...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
              <p className="text-muted-foreground">Find and participate in local community events</p>
            </div>
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
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-muted-foreground/40 mb-4">
                    <Calendar className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium">No events found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {events.length === 0
                      ? 'There are no events at the moment.'
                      : 'Try adjusting your search or filter to find what you\'re looking for.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {event.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getTypeColor(event.target_audience)} capitalize`}>
                            {event.target_audience}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(event.date)} capitalize`}>
                            {new Date(event.date) < new Date() ? 'Past' : 'Upcoming'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(CurrentPage && LastPage && LastPage > 1) && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <div className="flex items-center justify-between w-full p-4 bg-muted/30 border-t">
                            <div className="text-sm font-medium text-muted-foreground">
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
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}