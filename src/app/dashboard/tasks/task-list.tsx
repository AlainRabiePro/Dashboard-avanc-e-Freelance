'use client';

import * as React from 'react';
import type { Project, Task } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  PlusCircle,
  ListFilter,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
}

const statusBadgeVariants = {
  Todo: 'outline',
  'In Progress': 'secondary',
  'In Review': 'default',
  Done: 'default',
} as const;

const priorityBadgeVariants = {
  Low: 'outline',
  Medium: 'secondary',
  High: 'default',
  Critical: 'destructive',
} as const;


export function TaskList({ tasks: initialTasks, projects }: TaskListProps) {
  const [tasks, setTasks] = React.useState(initialTasks);
  const [filter, setFilter] = React.useState('');

  const tasksWithProjectNames = React.useMemo(() => {
    return tasks.map(task => {
      const project = projects.find(p => p.id === task.projectId);
      return {
        ...task,
        projectName: project ? project.name : 'Unknown Project',
      };
    });
  }, [tasks, projects]);

  const filteredTasks = React.useMemo(() => {
    return tasksWithProjectNames.filter(task =>
      task.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [tasksWithProjectNames, filter]);

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in tasks..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['Todo', 'In Progress', 'In Review', 'Done'].map(status => (
                <DropdownMenuCheckboxItem key={status}>
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <span>Group</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem>Status</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Priority</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Project</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
           </DropdownMenu>
           <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </div>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <Checkbox />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map(task => (
              <TableRow key={task.id}>
                <TableCell className="text-center">
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariants[task.status] || 'outline'}>{task.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityBadgeVariants[task.priority] || 'default'}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.projectName}</TableCell>
                <TableCell>
                    <Button variant="ghost" size="icon"><PlusCircle className="h-4 w-4 text-muted-foreground" /></Button>
                </TableCell>
              </TableRow>
            ))}
             <TableRow>
                <TableCell colSpan={6} className="p-0">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground rounded-none">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create
                    </Button>
                </TableCell>
             </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
