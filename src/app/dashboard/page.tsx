
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockProjects, mockTasks } from "@/lib/data";
import { Activity, ArrowUpRight, CircleDollarSign, ListChecks } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 15000 },
  { month: "Mar", revenue: 17500 },
  { month: "Apr", revenue: 13000 },
  { month: "May", revenue: 22000 },
  { month: "Jun", revenue: 19000 },
];
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--accent))",
  },
};

export default function DashboardPage() {
  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProjects.filter(p => p.status === 'In Progress').length}</div>
            <p className="text-xs text-muted-foreground">{mockProjects.length} total projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTasks.filter(t => t.status === 'Todo' || t.status === 'In Progress').length}</div>
            <p className="text-xs text-muted-foreground">+5 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProjects.filter(p => p.status === 'Completed').length}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}K`}
                  />
                   <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTasks.slice(0, 4).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.projectName}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{task.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
