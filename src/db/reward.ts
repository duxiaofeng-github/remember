import dayjs from "dayjs";
import {nanoid} from "nanoid";
import cronParser from "cron-parser";
import {getRemoteAddr, isOneTimeSchedule, isTimeout} from "../utils/common";
import {getData, putData, delData} from "./db";
import {isFinished, isPlanFinished, isRepeatEnded} from "./utils";
import {addPoints} from "./setting";

export interface RewardPlanBase {
  content: string;
  schedule: string;
  duration: number;
  count: number;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  consumption?: number;
  finishedTime?: number[];
  createdAt: number;
  updatedAt: number;
}

export interface RewardPlan extends RewardPlanBase {
  _id: string;
}

const dbName = "rewards";

export async function listRewardPlans(options?: {
  all?: boolean;
  finished?: boolean;
}): Promise<RewardPlan[]> {
  const {all, finished = false} = options || {};
  const remoteAddr = await getRemoteAddr();
  const data = await getData({dbName, remoteAddr});

  return data.filter((plan: RewardPlan) => {
    const {schedule, finishedTime, repeatEndedCount, repeatEndedDate} = plan;

    if (all) {
      return true;
    } else if (finished === true) {
      return isPlanFinished({
        schedule,
        finishedTime: finishedTime,
        repeatEndedDate,
        repeatEndedCount,
      });
    } else if (finished === false) {
      return !isPlanFinished({
        schedule,
        finishedTime: finishedTime,
        repeatEndedDate,
        repeatEndedCount,
      });
    }

    return true;
  });
}

export async function getRewardPlan(id: string): Promise<RewardPlan> {
  const remoteAddr = await getRemoteAddr();
  const data = await getData({dbName, remoteAddr, id});

  return data;
}

export async function createRewardPlan(data: RewardPlanBase): Promise<void> {
  const remoteAddr = await getRemoteAddr();
  const newData = {...data, _id: nanoid()};

  return putData({dbName, remoteAddr, data: newData});
}

export async function updateRewardPlan(data: RewardPlan): Promise<void> {
  const remoteAddr = await getRemoteAddr();

  return putData({dbName, remoteAddr, data});
}

export async function deleteRewardPlan(id: string): Promise<void> {
  const remoteAddr = await getRemoteAddr();

  return delData({dbName, remoteAddr, id});
}

export async function receiveReward(
  planId: string,
  rewardTime: number,
): Promise<void> {
  const plan = await getRewardPlan(planId);
  const finishedTime = (plan.finishedTime || []).filter(
    (item) => item !== rewardTime,
  );

  finishedTime.push(rewardTime);

  await addPoints(-(plan.consumption || 0));

  await updateRewardPlan({...plan, finishedTime});
}

export interface Reward {
  planId: string;
  content: string;
  startedAt: number;
  duration: number;
  consumption: number;
  finished: boolean;
}

function isRewardTimeInRange(
  rewardTime: number,
  startTime: number,
  endTime: number,
) {
  return rewardTime >= startTime && rewardTime <= endTime;
}

function generateReward(options: {
  plan: RewardPlan;
  rewardTime: number;
  finished: boolean;
}): Reward {
  const {plan, rewardTime, finished} = options;
  const {_id, content, duration, consumption = 0} = plan;

  return {
    planId: _id,
    content: content,
    startedAt: rewardTime,
    duration,
    consumption,
    finished,
  };
}

function getReward(options: {
  plan: RewardPlan;
  rewardTime: number;
  startTime: number;
  endTime: number;
  count: number;
  finishedTime: number[];
  repeatEndedDate?: number;
  repeatEndedCount?: number;
}) {
  const {
    plan,
    rewardTime,
    startTime,
    endTime,
    count,
    finishedTime,
    repeatEndedDate,
    repeatEndedCount,
  } = options;

  if (!isRewardTimeInRange(rewardTime, startTime, endTime)) {
    return false;
  } else {
    const repeatEnded = isRepeatEnded(
      rewardTime,
      finishedTime,
      repeatEndedDate,
      repeatEndedCount,
    );

    if (!repeatEnded) {
      const finished = isFinished(rewardTime, count, finishedTime);

      if (!finished) {
        const reward = generateReward({plan, rewardTime, finished});
        const timeout =
          reward.duration !== 0
            ? isTimeout(reward.startedAt, reward.duration)
            : false;

        if (!timeout) {
          return reward;
        }
      }
    }
  }
}

export function listRewards(options: {
  plan: RewardPlan;
  startTime?: number;
  endTime?: number;
}): Reward[] {
  const {plan, startTime = plan.createdAt, endTime = dayjs().unix()} = options;
  const {
    schedule,
    finishedTime = [],
    count,
    repeatEndedDate,
    repeatEndedCount,
  } = plan;

  const rewards: Reward[] = [];

  if (isOneTimeSchedule(schedule)) {
    const rewardTime = dayjs(schedule).unix();
    const reward = getReward({
      plan,
      rewardTime,
      startTime,
      endTime,
      count,
      finishedTime,
    });

    if (reward != null && reward !== false) {
      rewards.push(reward);
    }
  } else {
    const cron = cronParser.parseExpression(schedule);

    while (true) {
      try {
        if (cron.hasPrev()) {
          const rewardDate = cron.prev().toDate();
          const rewardTime = dayjs(rewardDate).unix();
          const reward = getReward({
            plan,
            rewardTime,
            startTime,
            endTime,
            count,
            finishedTime,
            repeatEndedDate,
            repeatEndedCount,
          });

          if (reward === false) {
            break;
          }

          if (reward != null) {
            rewards.push(reward);
          }
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }

    cron.reset();

    while (true) {
      try {
        if (cron.hasNext()) {
          const rewardDate = cron.next().toDate();
          const rewardTime = dayjs(rewardDate).unix();
          const reward = getReward({
            plan,
            rewardTime,
            startTime,
            endTime,
            count,
            finishedTime,
            repeatEndedDate,
            repeatEndedCount,
          });

          if (reward === false) {
            break;
          }

          if (reward != null) {
            rewards.push(reward);
          }
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }
  }

  return rewards;
}
