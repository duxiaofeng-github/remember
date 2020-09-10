import {isOneTimeSchedule} from "../utils/common";

import cronParser from "cron-parser";
import dayjs from "dayjs";

export function isFinished(
  time: number,
  count: number,
  finishedTime: number[],
) {
  return finishedTime.filter((item) => item === time).length >= count;
}

export function isCanceled(time: number, canceledTime: number[]) {
  return canceledTime.includes(time);
}

export function isRepeatEnded(options: {
  time: number;
  count: number;
  finishedTime: number[];
  repeatEndedDate?: number;
  repeatEndedCount?: number;
}) {
  const {
    time,
    count,
    finishedTime,
    repeatEndedCount,
    repeatEndedDate,
  } = options;
  if (repeatEndedCount != null) {
    return finishedTime.length >= repeatEndedCount * count;
  } else if (repeatEndedDate != null) {
    return time > repeatEndedDate;
  }

  return false;
}

export function isPlanFinished(options: {
  schedule: string;
  count: number;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  finishedTime?: number[];
  canceledTime?: number[];
}) {
  const {
    schedule,
    repeatEndedCount,
    repeatEndedDate,
    count,
    finishedTime,
    canceledTime,
  } = options;

  const allTaskTimes = (finishedTime || []).concat(canceledTime || []);

  if (isOneTimeSchedule(schedule)) {
    return allTaskTimes.length >= count;
  } else if (repeatEndedCount != null) {
    return (finishedTime || []).length >= repeatEndedCount * count;
  } else if (repeatEndedDate != null) {
    if (allTaskTimes.length > 0) {
      allTaskTimes.sort((a, b) => b - a);

      const latestTaskTime = allTaskTimes[0];

      if (
        allTaskTimes.filter((time) => time === latestTaskTime).length >= count
      ) {
        const cron = cronParser.parseExpression(schedule, {
          currentDate: dayjs.unix(latestTaskTime).toDate(),
        });
        const nextTime = cron.hasNext()
          ? dayjs(cron.next().toDate()).unix()
          : undefined;

        if (nextTime != null && nextTime > repeatEndedDate) {
          return true;
        }
      }
    }
  }

  return false;
}
