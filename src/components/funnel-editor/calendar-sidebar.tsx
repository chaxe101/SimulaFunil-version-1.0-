'use client';

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Briefcase, Calendar, CheckCircle, Plus } from "lucide-react";
import { Button } from '../ui/button';

const eventTypes = [
    { type: 'reuniao', label: 'Reunião', icon: <Briefcase />, color: '#4C8FFF' },
    { type: 'tarefa', label: 'Tarefa', icon: <CheckCircle />, color: '#2ECC71' },
    { type: 'lembrete', label: 'Lembrete', icon: <Calendar />, color: '#F39C12' },
];

export const CalendarSidebar = () => {
    const onDragStart = (event: React.DragEvent, eventType: string, color: string) => {
        event.dataTransfer.setData('application/calendar-event', JSON.stringify({ eventType, color }));
        event.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <>
            <div className="p-3 border-b border-[#232837] h-14 flex items-center">
                <h3 className="text-lg font-semibold text-foreground">Calendário</h3>
            </div>
            <ScrollArea className="flex-1">
                <Accordion type="single" defaultValue="event-types" collapsible className="w-full">
                    <AccordionItem value="event-types">
                        <AccordionTrigger className="text-xs font-semibold uppercase text-[#A7B0C0] px-3 py-2 hover:no-underline">
                            Tipos de Evento
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-2 gap-2 p-3 pt-1">
                                {eventTypes.map((evt) => (
                                    <div
                                        key={evt.type}
                                        className="flex flex-col items-center justify-center text-center gap-1 p-2 rounded-md bg-[#151922] hover:bg-[#232837] cursor-grab"
                                        // onDragStart={(event) => onDragStart(event, evt.type, evt.color)}
                                        // draggable // Drag and drop to calendar is complex, using click for now.
                                    >
                                        <div style={{ color: evt.color }}>
                                            {React.cloneElement(evt.icon, { className: 'w-5 h-5' })}
                                        </div>
                                        <span className="text-xs text-center">{evt.label}</span>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </ScrollArea>
            <div className="p-3 border-t border-[#232837]">
                <Button variant="ghost" size="sm" className="w-full justify-start text-[#A7B0C0] hover:bg-[#151922] hover:text-[#E8ECF3]">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Evento
                </Button>
            </div>
        </>
    );
};
