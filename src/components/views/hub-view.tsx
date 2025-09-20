
'use client';

import { CalendarWidget } from "../widgets/calendar-widget";
import { KanbanWidget } from "../widgets/kanban-widget";
import { NotesWidget } from "../widgets/notes-widget";
import { CanvasWidget } from "../widgets/canvas-widget";

export function HubView() {
    return (
        <div className="h-full w-full p-4 sm:p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <KanbanWidget />
                </div>
                <div className="lg:col-span-1">
                    <CalendarWidget />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                <div className="lg:col-span-1 flex flex-col">
                    <NotesWidget />
                </div>
                <div className="lg:col-span-2 flex flex-col">
                    <CanvasWidget />
                </div>
            </div>
        </div>
    )
}
