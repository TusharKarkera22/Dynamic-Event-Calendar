import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import { Clock, CalendarDays, Plus, Search, Download } from 'lucide-react';
import { Button } from './components/form/Buttons';
import { Input } from './components/form/InputBox';
import { DropResult } from '@hello-pangea/dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/form/DropdownSelect';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  category: "work" | "personal" | "other";
  color?: string;
}

// Local Storage key for events
const EVENTS_STORAGE_KEY = 'calendar_events';

// Helper functions for localStorage
const loadEventsFromStorage = (): Record<string, Event[]> => {
  try {
    const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
    return storedEvents ? JSON.parse(storedEvents) : {};
  } catch (error) {
    console.error('Error loading events from localStorage:', error);
    return {};
  }
};

const saveEventsToStorage = (events: Record<string, Event[]>) => {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events to localStorage:', error);
  }
};

// Helper function to check for time overlap
const hasTimeOverlap = (event1: Event, event2: Event): boolean => {
  const start1 = new Date(`2000-01-01T${event1.startTime}`);
  const end1 = new Date(`2000-01-01T${event1.endTime}`);
  const start2 = new Date(`2000-01-01T${event2.startTime}`);
  const end2 = new Date(`2000-01-01T${event2.endTime}`);

  return start1 < end2 && end1 > start2;
};

function App() {
  const [events, setEvents] = useState<Record<string, Event[]>>(loadEventsFromStorage());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Save events to localStorage whenever they change
  useEffect(() => {
    saveEventsToStorage(events);
  }, [events]);

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    // If selected date is not in the new month view, clear it
    if (selectedDate && (
      selectedDate.getMonth() !== date.getMonth() ||
      selectedDate.getFullYear() !== date.getFullYear()
    )) {
      setSelectedDate(null);
      setShowAddEvent(false);
    }
  };

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    setShowAddEvent(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: Event, date: Date) => {
    e.stopPropagation();
    setSelectedDate(date);
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>) => {
    if (!selectedDate) return;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const newEvents = { ...events };
    const existingEvents = newEvents[dateKey] || [];

    // Create the new event object
    const newEvent = {
      ...eventData,
      id: selectedEvent?.id || Math.random().toString(36).substr(2, 9),
    };

    // Check for time overlap with existing events
    const hasOverlap = existingEvents.some(event => 
      event.id !== newEvent.id && hasTimeOverlap(event, newEvent)
    );

    if (hasOverlap) {
      alert('This time slot overlaps with an existing event. Please choose a different time.');
      return;
    }

    if (selectedEvent) {
      // Edit existing event
      newEvents[dateKey] = existingEvents.map(event =>
        event.id === selectedEvent.id ? newEvent : event
      );
    } else {
      // Create new event
      newEvents[dateKey] = [...existingEvents, newEvent];
    }

    setEvents(newEvents);
    setSelectedEvent(undefined);
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (event?: Event) => {
    if (!event || !selectedDate) return;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const newEvents = { ...events };

    // Remove the event from the selected date
    newEvents[dateKey] = newEvents[dateKey].filter((e) => e.id !== event.id);

    // If no events left for this date, remove the date entry
    if (newEvents[dateKey].length === 0) {
      delete newEvents[dateKey];
    }

    setEvents(newEvents);
    saveEventsToStorage(newEvents);
    setIsEventModalOpen(false);
  };

  const handleEventDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceDate = result.source.droppableId;
    const destinationDate = result.destination.droppableId;
    const eventIndex = result.source.index;

    // If dropped in the same day and same position, do nothing
    if (sourceDate === destinationDate && result.source.index === result.destination.index) {
      return;
    }

    const newEvents = { ...events };
    
    // Remove event from source date
    const [movedEvent] = newEvents[sourceDate].splice(eventIndex, 1);
    
    // Initialize destination date array if it doesn't exist
    if (!newEvents[destinationDate]) {
      newEvents[destinationDate] = [];
    }

    // Add event to destination date
    newEvents[destinationDate].splice(result.destination.index, 0, movedEvent);

    // Update state and save to storage
    setEvents(newEvents);
    saveEventsToStorage(newEvents);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(undefined);
  };

  const getFilteredEvents = (dateEvents: Event[]): Event[] => {
    if (!searchQuery) return dateEvents;
    
    const query = searchQuery.toLowerCase();
    return dateEvents.filter(event => 
      event.title.toLowerCase().includes(query) ||
      (event.description || '').toLowerCase().includes(query)
    );
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split('T')[0];
    const dateEvents = events[dateKey] || [];
    return getFilteredEvents(dateEvents);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleExportEvents = (format: "json" | "csv") => {
    const currentMonthEvents: Event[] = [];
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      if (events[dateKey]) {
        currentMonthEvents.push(...events[dateKey]);
      }
    }

    if (format === "json") {
      const jsonString = JSON.stringify(currentMonthEvents, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `events-${currentMonth.toISOString().slice(0, 7)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const headers = ["id", "title", "startTime", "endTime", "description", "category"];
      const csvContent = [
        headers.join(","),
        ...currentMonthEvents.map(event =>
          headers.map(header => {
            const value = event[header as keyof Event] || "";
            return `"${value.toString().replace(/"/g, '""')}"`
          }).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `events-${currentMonth.toISOString().slice(0, 7)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAF0]">
      <div className="h-screen flex flex-col p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-[#2A2A2A] tracking-tight font-mono">
            Event Calendar
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2A2A2A]" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 w-72 h-12 bg-white border-4 border-[#2A2A2A] rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-12 bg-[#FFE4E1] text-[#2A2A2A] border-4 border-[#2A2A2A] rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Download className="h-5 w-5 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-4 border-[#2A2A2A] rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <DropdownMenuItem 
                  onClick={() => handleExportEvents("json")}
                  className="hover:bg-[#F0F8FF] transition-colors"
                >
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExportEvents("csv")}
                  className="hover:bg-[#F0F8FF] transition-colors"
                >
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8 flex-1 overflow-hidden">
          {/* Calendar Section */}
          <div className="flex-1 min-w-[800px] bg-white border-4 border-[#2A2A2A] rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <Calendar
              events={events}
              onDaySelect={handleDaySelect}
              onEventClick={handleEventClick}
              selectedDate={selectedDate}
              onMonthChange={handleMonthChange}
              currentMonth={currentMonth}
              searchQuery={searchQuery}
              onEventDragEnd={handleEventDragEnd}
            />
          </div>

          {/* Events Sidebar */}
          <div className="w-[420px] bg-white border-4 border-[#2A2A2A] rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col shrink-0">
            {!selectedDate ? (
              <div className="h-full flex items-center justify-center text-[#2A2A2A]">
                <div className="p-6 flex flex-col justify-center items-center text-center">
                <img src="/calendar.png" width="64" height="64" />
                  <p className="text-xl font-bold font-mono">Please select the date </p>
                  
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 border-b-4 border-[#2A2A2A] bg-[#F0F8FF]">
                  <h2 className="text-2xl font-black text-[#2A2A2A] font-mono">Events</h2>
                  <p className="text-sm text-[#2A2A2A] mt-2 flex items-center font-mono">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {formatDate(selectedDate)}
                  </p>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  {showAddEvent && (
                    <Button
                      onClick={() => setIsEventModalOpen(true)}
                      className="w-full mb-6 bg-[#98FB98] text-[#2A2A2A] border-4 border-[#2A2A2A] rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Event
                    </Button>
                  )}
                  <div className="space-y-4">
                    {getSelectedDateEvents()
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((event) => (
                        <button
                          key={event.id}
                          onClick={(e) => handleEventClick(e, event, selectedDate)}
                          className="w-full text-left bg-white border-4 border-[#2A2A2A] rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          <h3 className="font-bold text-[#2A2A2A] font-mono">
                            {event.title}
                          </h3>
                          <div className="mt-2 text-sm text-[#2A2A2A] flex items-center font-mono">
                            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm text-[#2A2A2A] font-mono">
                              {event.description}
                            </p>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}


export default App;
