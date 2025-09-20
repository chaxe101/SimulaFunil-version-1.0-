
'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editor-store';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

export function CalendarPresentationView() {
  const { eventsForCalendar } = useEditorStore(state => ({
    eventsForCalendar: state.eventsForCalendar,
  }));
  
  const renderEventContent = (eventInfo: EventContentArg) => {
    const isCompleted = eventInfo.event.extendedProps.completed;
    const isTask = eventInfo.event.id.startsWith('task-');

    return (
      <div className="flex items-center gap-2 overflow-hidden w-full">
         {!isTask && (
            <Checkbox
                checked={isCompleted}
                className="h-4 w-4 rounded-full bg-white/30 border-none data-[state=checked]:bg-white data-[state=checked]:text-black pointer-events-none"
            />
         )}
         <div className={cn("flex-grow truncate", isCompleted && "line-through opacity-70")}>
             <span className="font-medium">{eventInfo.event.title}</span>
         </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 h-full w-full flex flex-col">
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
            color: #fff !important;
            margin-bottom: 4px !important;
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
      <div className="flex-grow h-full w-full">
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            events={eventsForCalendar.map(e => ({...e, backgroundColor: e.color, borderColor: e.color, classNames: e.completed ? ['event-completed'] : []}))}
            eventContent={renderEventContent}
            editable={false}
            selectable={false}
            headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
            }}
            height="100%"
        />
      </div>
    </div>
  );
}
