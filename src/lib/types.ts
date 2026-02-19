
export type User = {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  avatar?: string;
  role: 'freelancer';
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export type Project = {
  id: string;
  userId: string;
  name: string;
  client: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Testing' | 'Completed';
  progress: number;
  budget: number;
  startDate: string | Date;
  endDate: string | Date;
  subcontractorIds?: string[];
  createdAt?: any;
  updatedAt?: any;
};

export type Client = {
  id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'Prospect' | 'Active' | 'Inactive';
  notes: string;
  createdAt?: any;
  updatedAt?: any;
};

export type Subcontractor = {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  hourlyRate: number;
  status: 'Active' | 'Inactive';
  bio: string;
  createdAt?: any;
  updatedAt?: any;
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  projectId: string;
  projectName?: string;
  assignedTo?: string;
  assignedToName?: string;
  status: 'Todo' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  createdAt?: any;
  updatedAt?: any;
};

export type ScheduleEvent = {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  type: 'Meeting' | 'Deadline' | 'Review' | 'Break' | 'Other';
  location?: string;
  isAllDay?: boolean;
  relatedProjectId?: string;
  relatedTaskId?: string;
  attendees?: string[];
  createdAt?: any;
  updatedAt?: any;
};

export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Invoice = {
  id: string;
  userId: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  issueDate: string | Date;
  dueDate: string | Date;
  description?: string;
  items: InvoiceItem[];
  template?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type Quote = {
  id: string;
  userId: string;
  quoteNumber: string;
  client: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  issueDate: string;
  validUntil: string;
  description: string;
  items: InvoiceItem[];
};

export type Prospect = {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  industry?: string;
  notes: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Interested' | 'Proposal Sent' | 'Won' | 'Lost';
  lastContactDate?: string | Date;
  followUpDate?: string | Date;
  source?: string;
  budget?: number;
  createdAt?: any;
  updatedAt?: any;
};
