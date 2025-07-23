export type DateType = 'yearly' | 'monthly' | 'one-time';

export interface TrackedDate {
  id: string;
  title: string;
  date: string;
  type: DateType;
}