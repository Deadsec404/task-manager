import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  description: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  expectedTime: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional().default('USD'),
  category: z.enum(['PERSONAL', 'BUSINESS', 'CUSTOM']),
  subCategory: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const budgetSchema = z.object({
  category: z.enum(['PERSONAL', 'BUSINESS', 'CUSTOM']),
  subCategory: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['monthly', 'weekly', 'yearly']).optional(),
});

export const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required'),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
});

