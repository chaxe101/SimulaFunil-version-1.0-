
'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ptBR } from 'date-fns/locale';

export function CalendarWidget() {
    const { eventsForCalendar, setCurrentView } = useEditorStore(state => ({
        eventsForCalendar: state.eventsForCalendar,
        setCurrentView: state.setCurrentView,
    }));
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    const eventDays = React.useMemo(() => {
        return eventsForCalendar.map(event => new Date(event.start));
    }, [eventsForCalendar]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-xl">Calendário</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('calendar')}>
                    Ver Completo
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                    locale={ptBR}
                    modifiers={{ events: eventDays }}
                    modifiersClassNames={{
                        events: 'bg-primary/20 text-primary-foreground rounded-full',
                    }}
                 />
            </CardContent>
        </Card>
    )
}
