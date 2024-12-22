import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './form/Box';
import { Button } from './form/button';
import { Input } from './form/InputBox';
import { Label } from './form/label';
import { Textarea } from './form/TextField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './form/select';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  category: "work" | "personal" | "other";
  color?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  onDelete: (event: Event) => void; // Ensure onDelete is expecting a fully defined Event, not possibly undefined

  event?: Event;
  selectedDate: Date | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
}) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Event['category']>('other');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setDescription(event.description || '');
      setCategory(event.category);
      setColor(event.color || '');
    } else if (isOpen) {
      setTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
      setDescription('');
      setCategory('other');
      setColor('');
    }
  }, [isOpen, event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      startTime,
      endTime,
      description,
      category,
      color,
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event); // Pass the full event to onDelete
    }
    onClose();
  };

  const handleEventTypeChange = (value: "work" | "personal" | "other") => {
    setCategory(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white to-gray-50 text-gray-900 border-t-4 border-t-blue-500">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-blue-600">
            {event ? 'Edit Event' : 'Add Event'} - {selectedDate?.toLocaleDateString()}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {event ? 'Modify the event details below.' : 'Fill in the event details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Title *</Label>
            <Input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter event title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Category *</Label>
              <Select value={category} onValueChange={handleEventTypeChange}>
                <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work" className="hover:bg-blue-50">Work</SelectItem>
                  <SelectItem value="personal" className="hover:bg-blue-50">Personal</SelectItem>
                  <SelectItem value="other" className="hover:bg-blue-50">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Color Label</Label>
              <Input
                type="color"
                name="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Start Time *</Label>
              <Input
                type="time"
                name="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">End Time *</Label>
              <Input
                type="time"
                name="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[100px]"
              placeholder="Add event description..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            {event && (
              <Button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </Button>
            )}
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {event ? 'Update Event' : 'Add Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
