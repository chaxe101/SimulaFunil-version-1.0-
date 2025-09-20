
'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventDropArg, EventClickArg, DateClickArg, EventContentArg } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CalendarEvent } from '@/stores/editor-store';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { FileDown } from 'lucide-react';

const colorOptions = [
  { value: '#FF5678', label: 'Rosa' },
  { value: '#4C8FFF', label: 'Azul' },
  { value: '#2ECC71', label: 'Verde' },
  { value: '#F39C12', label: 'Laranja' },
  { value: '#9B59B6', label: 'Roxo' },
];

export function CalendarView() {
  const { eventsForCalendar, addCalendarEvent, updateCalendarEvent, exportToPdf, currentView } = useEditorStore(state => ({
    eventsForCalendar: state.eventsForCalendar,
    addCalendarEvent: state.addCalendarEvent,
    updateCalendarEvent: state.updateCalendarEvent,
    exportToPdf: state.exportToPdf,
    currentView: state.currentView
  }));

  const [isModalOpen, setModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<CalendarEvent> | null>(null);

  const handleExport = () => {
    exportToPdf('calendario', currentView);
  };

  const handleToggleComplete = (eventId: string, completed: boolean) => {
    // Prevent toggling for task-derived events
    if (eventId.startsWith('task-')) {
        return;
    }
    updateCalendarEvent(eventId, { completed: !completed });
  };
  
  const renderEventContent = (eventInfo: EventContentArg) => {
    const isCompleted = eventInfo.event.extendedProps.completed;
    const isTask = eventInfo.event.id.startsWith('task-');

    return (
      <div className="flex items-center gap-2 overflow-hidden w-full">
         {!isTask && (
             <div onClick={(e) => {
                 e.stopPropagation(); // Prevent modal from opening
                 handleToggleComplete(eventInfo.event.id, !!isCompleted);
             }}>
                <Checkbox
                    checked={isCompleted}
                    className="h-4 w-4 rounded-full bg-white/30 border-none data-[state=checked]:bg-white data-[state=checked]:text-black"
                />
            </div>
         )}
         <div className={cn("flex-grow truncate", isCompleted && "line-through opacity-70")}>
             <span className="font-medium">{eventInfo.event.title}</span>
         </div>
      </div>
    );
  };

  const handleDateClick = (arg: DateClickArg) => {
    setCurrentEvent({ start: arg.dateStr, title: '', color: '#4C8FFF', completed: false });
    setModalOpen(true);
  };

  const handleEventClick = (arg: EventClickArg) => {
    // Prevent editing task-derived events directly on the calendar
    if (arg.event.id.startsWith('task-')) {
        arg.jsEvent.preventDefault();
        return;
    }
    const event = eventsForCalendar.find(e => e.id === arg.event.id);
    if (event) {
      setCurrentEvent(event);
      setModalOpen(true);
    }
  };
  
  const handleEventDrop = (arg: EventDropArg) => {
    const { event } = arg;
    if (event.id.startsWith('task-')) {
        arg.revert();
        return;
    }
    if (event.start) {
      updateCalendarEvent(event.id, { start: event.start.toISOString() });
    }
  };

  const handleSaveEvent = () => {
    if (currentEvent && currentEvent.title) {
      if (currentEvent.id) {
        updateCalendarEvent(currentEvent.id, currentEvent);
      } else {
        addCalendarEvent({
          ...currentEvent,
          id: `event-${Date.now()}`,
          start: currentEvent.start || new Date().toISOString(),
          title: currentEvent.title,
          color: currentEvent.color || '#4C8FFF',
          completed: currentEvent.completed || false,
        });
      }
    }
    setModalOpen(false);
    setCurrentEvent(null);
  };

  return (
    <div className="p-4 sm:p-6 h-full w-full flex flex-col" id="calendar-export-area">
        <style>
        {`
          /* General Calendar Styles */
          .fc { 
            height: 100%; 
            display: flex; 
            flex-direction: column;
            --fc-border-color: hsl(var(--border));
            --fc-today-bg-color: hsl(var(--card));
          }
          .fc .fc-toolbar-title { 
            color: hsl(var(--foreground)); 
            font-size: 1.5rem; 
            font-family: "Space Grotesk", sans-serif;
          }
          .fc .fc-button {
            background-color: hsl(var(--card));
            border-color: hsl(var(--border));
            color: hsl(var(--foreground));
            transition: background-color 0.2s;
          }
          .fc .fc-button:hover, .fc .fc-button-primary:not(:disabled):active {
            background-color: hsl(var(--accent));
          }
          .fc .fc-view-harness { 
            flex-grow: 1; 
            background-color: hsl(var(--card)); 
            border: 1px solid hsl(var(--border)); 
            border-radius: 0.5rem;
          }

          /* Day Header & Numbers */
          .fc .fc-col-header-cell-cushion { 
             color: hsl(var(--muted-foreground)); 
          }
          .fc .fc-daygrid-day-number { 
            color: hsl(var(--muted-foreground)); 
            padding: 8px;
            font-weight: 500;
          }
          .fc-daygrid-day.fc-day-today {
            background-color: hsl(var(--accent) / 0.5);
          }
          .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
             color: hsl(var(--primary));
             background-color: hsl(var(--primary) / 0.1);
             border-radius: 9999px;
             width: 28px;
             height: 28px;
             display: inline-flex;
             align-items: center;
             justify-content: center;
             padding: 0;
             margin: 4px;
          }

          /* Event Styling */
          .fc-daygrid-day-events {
            margin: 2px 4px !important;
          }
          .fc-daygrid-event {
            border-radius: 6px !important;
            padding: 4px 8px !important;
            border: none !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            color: #fff !important;
            margin-bottom: 4px !important;
            cursor: pointer;
          }
          .fc-daygrid-event:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          .fc-daygrid-event .fc-event-main {
            color: #fff !important;
            font-weight: 500;
          }
          .fc-daygrid-event.event-completed {
             opacity: 0.6;
          }
        `}
      </style>
      <div className="flex-shrink-0 mb-4 flex justify-end">
          <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
          </Button>
      </div>
      <div className="flex-grow h-full w-full">
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            events={eventsForCalendar.map(e => ({...e, backgroundColor: e.color, borderColor: e.color, classNames: e.completed ? ['event-completed'] : []}))}
            eventContent={renderEventContent}
            editable={true}
            selectable={true}
            eventDrop={handleEventDrop}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
            }}
            height="100%"
        />
      </div>

       <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEvent?.id ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Título</Label>
              <Input 
                id="event-title" 
                value={currentEvent?.title || ''} 
                onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value })}
              />
            </div>
             <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex items-center gap-2">
                  {colorOptions.map(color => (
                    <button 
                      key={color.value} 
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                         currentEvent?.color === color.value ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setCurrentEvent({...currentEvent, color: color.value })}
                      aria-label={`Selecionar cor ${color.label}`}
                    />
                  ))}
                </div>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox 
                  id="event-completed" 
                  checked={currentEvent?.completed || false}
                  onCheckedChange={(checked) => setCurrentEvent({...currentEvent, completed: !!checked})}
                  disabled={currentEvent?.id?.startsWith('task-')}
                />
                <Label htmlFor="event-completed">Marcar como concluído</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEvent}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
