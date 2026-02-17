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

export default function CitizenEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [Clicked, setClicked] = useState(false);
  const [citizenLastPage, setCitizenLastPage] = useState(1);
  const [citizenCurrentPage, setCitizenCurrentPage] = useState(1);
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
    setEvents(res.data.data);
    setCitizenCurrentPage(res.data.current_page);
    setCitizenLastPage(res.data.last_page);
  };


  useEffect(() => {
    const fetchData = async () => {
      await fetchPage(1);
      setLoading(false);
    };
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
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">Upcoming Events</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Find and participate in local community events</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col xl:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-muted/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[130px] h-11 border-muted/50 hover:border-primary/50 transition-all duration-200">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="citizens">Citizens</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[120px] h-11 border-muted/50 hover:border-primary/50 transition-all duration-200">
                      <SelectValue placeholder="Status" />
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
                <div className="rounded-md border">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 w-[25%]">Event</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 hidden sm:table-cell w-[30%]">Description</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 w-[20%]">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 w-[15%]">Audience</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-3 py-3 w-[15%] text-right">Status</TableHead>
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
                          <TableCell className="text-sm text-muted-foreground px-3 py-3 align-middle hidden sm:table-cell">
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
                            <Badge className={`${getTypeColor(event.target_audience)} text-xs font-medium px-2 py-0.5 h-auto border-0 whitespace-nowrap capitalize`}>
                              {event.target_audience}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-3 py-3 align-middle">
                            <Badge className={`${getStatusColor(event.date)} text-xs font-medium px-2 py-0.5 h-auto border-0 whitespace-nowrap capitalize`}>
                              {new Date(event.date) < new Date() ? 'Past' : 'Upcoming'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(citizenCurrentPage && citizenLastPage && citizenLastPage > 1) && (
                        <TableRow>
                          <TableCell colSpan={5} className="p-3 sm:p-4">
                            <div className="flex items-center justify-between w-full">
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                Page {citizenCurrentPage} of {citizenLastPage}
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 sm:h-8 sm:w-auto sm:px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed p-0 sm:p-auto"
                                  disabled={citizenCurrentPage <= 1}
                                  onClick={async () => {
                                    setLoading(true);
                                    await fetchPage(citizenCurrentPage - 1);
                                    setLoading(false);
                                  }}
                                >
                                  <svg className="w-3 h-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                  <span className="hidden sm:inline">Previous</span>
                                </Button>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: Math.min(5, citizenLastPage) }, (_, i) => {
                                    const pageNum = i + 1;
                                    const isActive = pageNum === citizenCurrentPage;
                                    return (
                                      <Button
                                        key={pageNum}
                                        variant={isActive ? "default" : "outline"}
                                        size="sm"
                                        className={`h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs font-medium transition-all duration-200 ${isActive
                                          ? "bg-primary text-primary-foreground shadow-sm"
                                          : "hover:bg-primary hover:text-primary-foreground"
                                          }`}
                                        disabled={pageNum > citizenLastPage}
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
                                  {citizenLastPage > 5 && (
                                    <>
                                      <span className="text-muted-foreground text-xs px-1">...</span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                                        onClick={async () => {
                                          setLoading(true);
                                          await fetchPage(citizenLastPage);
                                          setLoading(false);
                                        }}
                                      >
                                        {citizenLastPage}
                                      </Button>
                                    </>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 sm:h-8 sm:w-auto sm:px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed p-0 sm:p-auto"
                                  disabled={citizenCurrentPage >= citizenLastPage}
                                  onClick={async () => {
                                    setLoading(true);
                                    await fetchPage(citizenCurrentPage + 1);
                                    setLoading(false);
                                  }}
                                >
                                  <span className="hidden sm:inline">Next</span>
                                  <svg className="w-3 h-3 sm:ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}