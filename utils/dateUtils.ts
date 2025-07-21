import { DateType } from '@/contexts/DateContext';

/**
 * 计算下一次事件发生的日期
 * @param date 日期字符串或Date对象
 * @param type 日期类型（yearly、monthly或one-time）
 * @returns 下一次事件发生的日期
 */
export function getNextOccurrence(date: string | Date, type: DateType): Date {
  const now = new Date();
  const originalDate = date instanceof Date ? date : new Date(date);
  
  switch (type) {
    case 'yearly':
      let nextYear = new Date(now.getFullYear(), originalDate.getMonth(), originalDate.getDate());
      if (nextYear <= now) {
        nextYear = new Date(now.getFullYear() + 1, originalDate.getMonth(), originalDate.getDate());
      }
      return nextYear;
      
    case 'monthly':
      let nextMonth = new Date(now.getFullYear(), now.getMonth(), originalDate.getDate());
      if (nextMonth <= now) {
        nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, originalDate.getDate());
      }
      return nextMonth;
      
    case 'one-time':
      return originalDate;
      
    default:
      return originalDate;
  }
}