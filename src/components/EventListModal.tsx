import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Clock, CalendarDays, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { Button } from './form/Buttons';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

interface EventListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
}

const EventListModal: React.FC<EventListModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  events,
  onEditEvent,
  onDeleteEvent,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-overlayShow"
          style={{ animationDuration: '150ms', animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        <Dialog.Content 
          className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-slideIn"
          style={{ animationDuration: '150ms', animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div>
              <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Events
              </Dialog.Title>
              {selectedDate && (
                <Dialog.Description className="text-sm text-gray-500 mt-1 flex items-center">
                  <CalendarDays className="inline-block w-4 h-4 mr-1" />
                  {formatDate(selectedDate)}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-auto">
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No events scheduled</p>
                <p className="text-sm mt-1">Click anywhere on the calendar to add an event</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {events
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((event) => (
                    <div
                      key={event.id}
                      className="group bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate pr-4">
                            {event.title}
                          </h3>
                          <div className="mt-1 text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => onEditEvent(event)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteEvent(event)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Click to edit</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EventListModal;
