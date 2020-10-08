import pcron from "pcron";
import CronParser from "cron-parser";
import dayjs from "dayjs";

export function isPcronExpression(schedule: string) {
  return schedule.slice(0, 1).toLowerCase() === "p";
}

export function isValidCronExpression(expression: string) {
  try {
    CronParser.parseExpression(expression);

    return true;
  } catch (e) {
    try {
      pcron.parseExpression(expression);

      return true;
    } catch (e) {
      return false;
    }
  }
}

export function parseExpression(expression: string, unix?: number) {
  if (isPcronExpression(expression)) {
    const cron = pcron.parseExpression(expression, unix);

    return cron;
  }

  const cron = CronParser.parseExpression(expression, {
    currentDate: unix ? dayjs.unix(unix).toDate() : dayjs().toDate(),
  });

  return {
    next: () => {
      const date = cron.next();

      return date != null ? dayjs(date.toDate()) : null;
    },
    reset: () => {
      cron.reset();
    },
    prev: () => {
      const date = cron.prev();

      return date != null ? dayjs(date.toDate()) : null;
    },
  };
}
