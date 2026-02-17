'use client';

import { useMemo, useState } from 'react';
import type { Project, Task } from '@/lib/types';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TaskColumn } from './task-column';
import { doc } from 'firebase/firestore';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { TaskCard } from './task-card';

export const TASK_STATUSES: Task['status'][] = ['Todo', 'In Progress', 'In Review', 'Done'];

type TaskContainer = {
  id: Task['status'];
  title: string;
  items: Task[];
};

export function TaskBoard({ tasks, projects }: { tasks: Task[], projects: Project[] }) {
  const { firestore } = useFirebase();
  const [containers, setContainers] = useState<TaskContainer[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useMemo(() => {
    const tasksWithProjectNames = tasks.map(task => ({
      ...task,
      projectName: projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'
    })).sort((a,b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0) );

    const initialContainers = TASK_STATUSES.map(status => ({
      id: status,
      title: status,
      items: tasksWithProjectNames.filter(task => task.status === status)
    }));
    setContainers(initialContainers);
  }, [tasks, projects]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string | number) => containers.find(c => c.id === id);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainerId = active.data.current?.sortable.containerId;
    const overContainerId = over.data.current?.sortable.containerId || over.id;

    if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
      return;
    }

    setContainers(prev => {
      const activeContainerIndex = prev.findIndex(c => c.id === activeContainerId);
      const overContainerIndex = prev.findIndex(c => c.id === overContainerId);
      const activeItemIndex = prev[activeContainerIndex].items.findIndex(item => item.id === active.id);

      let newContainers = [...prev];
      const [movedItem] = newContainers[activeContainerIndex].items.splice(activeItemIndex, 1);
      newContainers[overContainerIndex].items.push(movedItem);
      
      return newContainers;
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeContainer = findContainer(active.data.current?.sortable.containerId);
    const overContainer = findContainer(over.data.current?.sortable.containerId || over.id as string);

    if (!activeContainer || !overContainer || activeContainer.id === overContainer.id) {
      return;
    }
    
    const taskRef = doc(firestore, "tasks", active.id as string);
    updateDocumentNonBlocking(taskRef, { status: overContainer.id });
  };


  return (
    <div className="flex-1 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 pb-4">
          {containers.map(container => (
            <TaskColumn key={container.id} id={container.id} title={container.title} items={container.items} />
          ))}
        </div>
        
        {/* This is a temporary solution to render a draggable overlay. 
            A better approach would be to use a Portal. */}
        {activeTask && (
            <div style={{ position: 'fixed', top: -9999, left: -9999 }}>
                <TaskCard task={activeTask} isOverlay />
            </div>
        )}

      </DndContext>
    </div>
  );
}
