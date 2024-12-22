import React from 'react';
import { Button } from './form/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  category: "work" | "personal" | "other";
  color?: string;
}

interface CalendarProps {
  events: Record<string, Event[]>;
  onDaySelect: (date: Date) => void;
  onEventClick: (e: React.MouseEvent, event: Event, date: Date) => void;
  selectedDate: Date | null;
  onMonthChange: (date: Date) => void;
  currentMonth: Date;
  searchQuery: string;
  onEventDragEnd: (result: DropResult) => void;
}


const Calendar: React.FC<CalendarProps> = ({
  events,
  onDaySelect,
  onEventClick,
  selectedDate,
  onMonthChange,
  currentMonth,
  searchQuery,
  onEventDragEnd
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startingDayIndex = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: Date[] = [];
    const firstDay = new Date(firstDayOfMonth);
    firstDay.setDate(1 - startingDayIndex);
    
    const totalDays = startingDayIndex + daysInMonth;
    const numberOfWeeks = Math.ceil(totalDays / 7);
    const daysToShow = numberOfWeeks * 7;
    
    for (let i = 0; i < daysToShow; i++) {
      days.push(new Date(firstDay));
      firstDay.setDate(firstDay.getDate() + 1);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onMonthChange(newDate);
  };

  const isCurrentMonth = (date: Date) =>
    date.getMonth() === currentMonth.getMonth();

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const isSelected = (date: Date) => {
    return selectedDate && 
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const getFilteredEvents = (dateEvents: Event[]): Event[] => {
    if (!searchQuery) return dateEvents;
    
    const query = searchQuery.toLowerCase();
    return dateEvents.filter(event => 
      event.title.toLowerCase().includes(query) ||
      (event.description || '').toLowerCase().includes(query)
    );
  };
 

  const days = getDaysInMonth(currentMonth);

  return (
    <DragDropContext onDragEnd={onEventDragEnd}>
      <div className="h-full flex flex-col max-h-screen overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#2A2A2A] font-mono">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-4">
            <Button
              onClick={handlePrevMonth}
              className="bg-[#FFE4E1] text-[#2A2A2A] border-4 border-[#2A2A2A] rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </Button>
            <Button
              onClick={handleNextMonth}
              className="bg-[#FFE4E1] text-[#2A2A2A] border-4 border-[#2A2A2A] rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center py-2 font-bold text-sm font-mono border-4 border-[#2A2A2A] bg-[#F0F8FF]",
                index === 0 || index === 6 ? "text-[#FF6B6B]" : "text-[#2A2A2A]"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto min-h-0">
          {days.map((date, index) => {
            const dateKey = date.toISOString().split('T')[0];
            const dayEvents = getFilteredEvents(events[dateKey] || []);
            
            return (
              <div key={index} className="relative min-h-[120px]">
                <Droppable droppableId={dateKey}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="absolute inset-0"
                    >
                      <button
                        onClick={() => onDaySelect(date)}
                        className={cn(
                          "w-full h-full p-2 transition-all duration-200 flex flex-col",
                          "border-4 border-[#2A2A2A]",
                          isCurrentMonth(date) 
                            ? "bg-white" 
                            : "bg-[#F5F5F5]",
                          isToday(date) && "bg-[#FFF8DC]",
                          isSelected(date) && "bg-[#E6F3FF]",
                          !isCurrentMonth(date) && "opacity-50",
                          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "font-bold font-mono text-lg",
                            isWeekend(date) && isCurrentMonth(date) && "text-[#FF6B6B]",
                            !isCurrentMonth(date) && "text-gray-400"
                          )}>
                            {date.getDate()}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-xs font-bold bg-[#2A2A2A] text-white px-2 py-1 font-mono">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 overflow-hidden flex-1">
                          {dayEvents.slice(0, 2).map((event, eventIndex) => (
                            <Draggable
                              key={event.id}
                              draggableId={event.id}
                              index={eventIndex}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick(e, event, date);
                                  }}
                                  className={cn(
                                    "w-full text-left text-xs p-2 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
                                    "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                          
                                   
                                    "font-mono"
                                  )}
                                  style={{ backgroundColor: `${event.color || 'gray'}` }} 
                                >
                                  <div className="font-bold truncate">{event.title}</div>
                                  <div className="text-[10px] truncate mt-1 opacity-75">
                                    {event.startTime} - {event.endTime}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs font-bold text-[#2A2A2A] text-center bg-[#F0F8FF] py-1 border-2 border-[#2A2A2A] font-mono">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
};

export default Calendar;
