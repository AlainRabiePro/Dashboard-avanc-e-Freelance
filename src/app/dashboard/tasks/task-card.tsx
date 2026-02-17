'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { Task } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

const priorityVariants = cva('', {
  variants: {
    priority: {
      Low: 'border-green-500/50 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300',
      Medium: 'border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-300',
      High: 'border-orange-500/50 text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-300',
      Critical: 'border-red-500/50 text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300',
    },
  },
  defaultVariants: {
    priority: 'Low',
  },
});

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const variants = cva("border", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary"
      }
    }
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card/90 hover:shadow-md transition-shadow',
        variants({
          dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        })
      )}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium leading-tight">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Folder className="h-3 w-3"/>
            <span>{task.projectName}</span>
        </div>
        <div className="flex justify-between items-center">
            <Badge variant="outline" className={priorityVariants({ priority: task.priority })}>
                {task.priority}
            </Badge>
            <div className="text-xs text-muted-foreground">
                Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
