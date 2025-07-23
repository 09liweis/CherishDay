import { DateType } from '@/contexts/DateContext';

/**
 * 计算下一次事件发生的日期
 * @param date 日期字符串或Date对象
 * @param type 日期类型（yearly、monthly或one-time）
 * @returns 下一次事件发生的日期
 */
export function getNextOccurrence(date: string, type: DateType): Date {
  const now = new Date();
  let [year,month,day] = date.split('-');
  const originalYear = parseInt(year);
  let originalMonth = parseInt(month);
  originalMonth = originalMonth == 1 ? 12 : originalMonth - 1;
  const originalDay = parseInt(day);

  const originalDate = new Date(originalYear, originalMonth, originalDay);
  
  switch (type) {
    case 'yearly':
      let nextYear = new Date(now.getFullYear(), originalMonth, originalDay);
      if (nextYear <= now) {
        nextYear = new Date(now.getFullYear() + 1, originalMonth, originalDay);
      }
      return nextYear;
      
    case 'monthly':
      let nextMonth = new Date(now.getFullYear(), now.getMonth(), originalDay);
      if (nextMonth <= now) {
        nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, originalDay);
      }
      return nextMonth;
      
    case 'one-time':
      return originalDate;
      
    default:
      return originalDate;
  }
}

export function getDaysUntil(date: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function getYearsDuration(originalDate: Date): string {
  const now = new Date();
  let years = now.getFullYear() - originalDate.getFullYear();
  
  // 如果今年的纪念日还没到，则减去1年
  if (
    now.getMonth() < originalDate.getMonth() || 
    (now.getMonth() === originalDate.getMonth() && now.getDate() < originalDate.getDate())
  ) {
    years--;
  }
  const durations = Math.max(0, years);
  
  return `${durations} year${durations > 1 ? 's': ''}`;
}