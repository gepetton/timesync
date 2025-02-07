import { format, parse, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

export const parseDateTime = (text) => {
  const patterns = [
    '오늘 HH시',
    '내일 HH시',
    'M월 d일 HH시',
    'yyyy년 M월 d일 HH시'
  ];

  for (const pattern of patterns) {
    try {
      const date = parse(text, pattern, new Date(), { locale: ko });
      if (isValid(date)) return date;
    } catch (e) {
      continue;
    }
  }
  return null;
};

export const formatDateTime = (date) => {
  return format(date, 'M월 d일 (E) HH:mm', { locale: ko });
};
