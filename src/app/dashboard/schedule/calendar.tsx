'use client';

import { useState } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ScheduleEvent } from '@/lib/types';
import { EventDialog } from './event-dialog';

const EventBadge = ({ event, onClick }: { event: ScheduleEvent; onClick: (event: ScheduleEvent) => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(event); }}
    className="w-full text-left text-xs bg-primary/20 text-primary p-1 rounded-md truncate hover:bg-primary/30"
  >
    {event.title}
  </button>
);

export function CalendarView({ events }: { events: ScheduleEvent[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());
  
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedEvent(undefined);
    setDialogOpen(true);
  };
  
  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.startDate));
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={handleToday}>Today</Button>
          </div>
        </div>
        <Button onClick={() => { setSelectedEvent(undefined); setSelectedDate(new Date()); setDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />Create Event
        </Button>
      </div>

      <div className="grid grid-cols-7 grid-rows-1 text-center font-semibold text-sm text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 border-b">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-5 flex-1 border-l border-t">
        {days.map((day) => {
          const dayEvents = events.filter(e => format(new Date(e.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
          return (
            <div
              key={day.toString()}
              className={cn(
                'border-b border-r p-2 flex flex-col cursor-pointer hover:bg-muted/50',
                !isSameMonth(day, currentMonth) && 'bg-muted/20 text-muted-foreground',
              )}
              onClick={() => handleDayClick(day)}
            >
              <time
                dateTime={day.toString()}
                className={cn('self-end', isToday(day) && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center')}
              >
                {format(day, 'd')}
              </time>
              <div className="flex-1 overflow-y-auto mt-1 space-y-1">
                {dayEvents.map(event => (
                  <EventBadge key={event.id} event={event} onClick={handleEventClick} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
       <EventDialog
        isOpen={dialogOpen}
        setOpen={setDialogOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
    </>
  );
}