'use client';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/lib/types';
import { TaskCard } from './task-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskColumnProps {
  id: string;
  title: string;
  items: Task[];
}

export function TaskColumn({ id, title, items }: TaskColumnProps) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef} className="w-80 shrink-0">
       <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex justify-between items-center">
            <span>{title}</span>
            <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-md">{items.length}</span>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-3 h-full px-4 pb-4">
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {items.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </CardContent>
        </ScrollArea>
       </Card>
    </div>
  );
}
