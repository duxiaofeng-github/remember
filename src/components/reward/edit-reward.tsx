import React, {useEffect, useMemo, useState} from "react";
import {View, StyleSheet, ScrollView} from "react-native";
import dayjs from "dayjs";
import {useTranslation} from "react-i18next";
import {useForm, Controller, UseFormMethods} from "react-hook-form";
import {Header} from "../common/header";
import {IStore, globalStore} from "../../store";
import {
  isDailySchedule,
  isWeeklySchedule,
  isMonthlySchedule,
  isOneTimeSchedule,
  getOneTimeScheduleStartTime,
  parseSchedule,
} from "../../utils/common";
import {Select} from "../common/select";
import {DateTimeSelect} from "../common/date-time-select";
import {Input} from "../common/input";
import {useNavigation} from "@react-navigation/native";
import {Toast} from "../common/toast";
import {useRexContext} from "../../store/store";
import {TimeSelect} from "../common/time-select";
import {WeekTimeSelect} from "../common/week-time-select";
import {DayTimeSelect} from "../common/day-time-select";
import {
  RewardPlan,
  RewardPlanBase,
  createRewardPlan,
  updateRewardPlan,
} from "../../db/reward";
import {Radio} from "../common/radio";

interface IProps {}

enum Period {
  OneTime = "oneTime",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Customized = "customized",
}

enum RepeatEndedType {
  Endless = "endless",
  ByCount = "byCount",
  ByDate = "byDate",
}

interface IForm {
  content: string;
  repeatType: Period;
  startTime: number;
  disableEndTime: boolean;
  repeatEndedType: RepeatEndedType;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  consumption?: number;
}

export const EditReward: React.SFC<IProps> = () => {
  const {t} = useTranslation();
  const [now, setNow] = useState(dayjs().startOf("minute").unix());
  const navigation = useNavigation();
  const {rewardPlansData, edittingRewardId} = useRexContext(
    (store: IStore) => store,
  );
  const edittingPlan = useMemo(
    () =>
      rewardPlansData.data &&
      rewardPlansData.data.find((item) => item._id === edittingRewardId),
    [edittingRewardId, rewardPlansData],
  );
  const isCreating = useMemo(() => edittingPlan == null, [edittingPlan]);
  const {
    content,
    repeatType,
    startTime,
    disableEndTime,
    repeatEndedType,
    repeatEndedDate,
    repeatEndedCount,
    consumption,
  } = useMemo(() => transformPlanToForm(edittingPlan), [edittingPlan]);
  const form = useForm<IForm>({
    mode: "onChange",
    defaultValues: {
      content,
      repeatType,
      startTime,
      disableEndTime,
      repeatEndedType,
      repeatEndedDate,
      repeatEndedCount,
      consumption,
    },
  });
  const {control, handleSubmit, errors, watch} = form;
  const triggerSubmit = handleSubmit(async (data: IForm) => {
    if (edittingPlan == null) {
      const planBase = transformFormToPlanBase(data, now, now);

      await createRewardPlan(planBase);
    } else {
      const plan = transformFormToPlan(edittingPlan, data, now);

      await updateRewardPlan(plan);
    }

    Toast.message(
      isCreating ? t("Create successfully") : t("Edit successfully"),
    );

    await rewardPlansData.load();

    navigation.goBack();
  });

  useEffect(() => {
    return () => {
      globalStore.update((store) => {
        store.edittingRewardId = undefined;
      });
    };
  }, []);

  return (
    <View style={s.container}>
      <Header
        title="Remember"
        createButton={{
          visible: true,
          text: isCreating ? t("Create") : t("Save"),
          onTouchEnd: async () => {
            await triggerSubmit();
          },
        }}
      />
      <ScrollView style={s.content}>
        <Controller
          control={control}
          name="content"
          rules={{required: t("Content is required") as string}}
          render={({onChange, onBlur, value}) => (
            <Input
              multiline
              value={value}
              label={t("content")}
              error={errors.content}
              placeholder={t("Please input content")}
              onChangeText={(value) => onChange(value)}
              onBlur={onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="repeatType"
          rules={{required: t("Repeat type is required") as string}}
          render={({onChange, onBlur, value}) => {
            const data = [
              {label: t("No repeat"), value: Period.OneTime},
              {label: t("Daily task"), value: Period.Daily},
              {label: t("Weekly task"), value: Period.Weekly},
              {label: t("Monthly task"), value: Period.Monthly},
              // { label: t("customized"), value: Period.Customized },
            ];

            return (
              <Select
                onConfirm={(value) => {
                  const type = value ? value[0] : undefined;

                  onChange(type);

                  switch (type) {
                    case Period.OneTime:
                      const startTime = dayjs().second(0).millisecond(0);

                      form.setValue("startTime", startTime.unix());
                      break;
                    case Period.Daily:
                      const dailyStartTime = dayjs().startOf("day");

                      form.setValue("startTime", dailyStartTime.unix());
                      break;
                    case Period.Weekly:
                      const weeklyStartTime = dayjs().startOf("week");

                      form.setValue("startTime", weeklyStartTime.unix());
                      break;
                    case Period.Monthly:
                      const monthlyStartTime = dayjs().startOf("month");

                      form.setValue("startTime", monthlyStartTime.unix());
                      break;
                  }
                }}
                title={t("Select repeat type")}
                value={[value]}
                data={[data]}
                label={t("Repeat type")}
                error={errors.repeatType}
              />
            );
          }}
        />
        <StartTimeAndEndTimePicker
          repeatType={watch("repeatType")}
          form={form}
        />
        <Controller
          control={control}
          name="consumption"
          render={({onChange, onBlur, value}) => {
            return (
              <Input
                keyboardType="numeric"
                value={value != null ? `${value}` : ""}
                onBlur={onBlur}
                onChangeText={(value) => {
                  const valueParsed = parseFloat(value);

                  onChange(isNaN(valueParsed) ? undefined : valueParsed);
                }}
                label={t("Consumption")}
                error={errors.consumption}
                placeholder={t("Please input points")}
              />
            );
          }}
        />
      </ScrollView>
    </View>
  );
};

interface IStartTimeAndEndTimePickerProps {
  repeatType: Period;
  form: UseFormMethods<IForm>;
}

export const StartTimeAndEndTimePicker: React.SFC<IStartTimeAndEndTimePickerProps> = (
  props,
) => {
  const {repeatType, form} = props;
  const {control, errors, watch} = form;
  const {t} = useTranslation();

  return (
    <>
      <Controller
        control={control}
        name="startTime"
        rules={{required: t("Effective time is required") as string}}
        render={({onChange, onBlur, value}) => {
          switch (repeatType) {
            case Period.Daily:
              return (
                <TimeSelect
                  onChange={onChange}
                  value={value}
                  label={t("Effective time")}
                  error={errors.startTime}
                />
              );
            case Period.Weekly:
              return (
                <WeekTimeSelect
                  onChange={onChange}
                  value={value}
                  label={t("Effective time")}
                  error={errors.startTime}
                />
              );
            case Period.Monthly:
              return (
                <DayTimeSelect
                  onChange={onChange}
                  value={value}
                  label={t("Effective time")}
                  error={errors.startTime}
                />
              );
          }

          return (
            <DateTimeSelect
              onChange={onChange}
              value={value}
              label={t("Effective time")}
              error={errors.startTime}
            />
          );
        }}
      />
      {repeatType !== Period.OneTime && (
        <Controller
          control={control}
          name="disableEndTime"
          render={({onChange, onBlur, value}) => {
            return (
              <Radio
                label={t("Never expire")}
                value={value}
                onChange={onChange}
              />
            );
          }}
        />
      )}
      {repeatType !== Period.OneTime && (
        <>
          <Controller
            control={control}
            name="repeatEndedType"
            rules={{required: t("Repeat ended type is required") as string}}
            render={({onChange, onBlur, value}) => {
              const data = [
                {label: t("Endless"), value: RepeatEndedType.Endless},
                {label: t("By date"), value: RepeatEndedType.ByDate},
                {label: t("By count"), value: RepeatEndedType.ByCount},
              ];

              return (
                <Select
                  onConfirm={(value) => {
                    const type = value ? value[0] : undefined;

                    onChange(type);
                  }}
                  title={t("Select repeat ended type")}
                  value={[value]}
                  data={[data]}
                  label={t("Repeat ended type")}
                  error={errors.repeatEndedType}
                />
              );
            }}
          />
          {watch("repeatEndedType") === RepeatEndedType.ByDate && (
            <Controller
              control={control}
              name="repeatEndedDate"
              rules={{required: t("Repeat ended date is required") as string}}
              render={({onChange, onBlur, value}) => {
                return (
                  <DateTimeSelect
                    onChange={onChange}
                    value={value}
                    title={t("Select repeat ended date")}
                    label={t("Repeat ended date")}
                    error={errors.repeatEndedDate}
                  />
                );
              }}
            />
          )}
          {watch("repeatEndedType") === RepeatEndedType.ByCount && (
            <Controller
              control={control}
              name="repeatEndedCount"
              rules={{required: t("Repeat ended count is required") as string}}
              render={({onChange, onBlur, value}) => (
                <Input
                  keyboardType="numeric"
                  defaultValue={value}
                  onBlur={onBlur}
                  onChangeText={(value) => onChange(value)}
                  label={t("Repeat ended count")}
                  error={errors.repeatEndedCount}
                  placeholder={t("Please input repeat ended count")}
                />
              )}
            />
          )}
        </>
      )}
    </>
  );
};

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  content: {
    flex: 1,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 25,
    paddingRight: 25,
  },
});

interface IDefaultForm {
  content?: string;
  repeatType: Period;
  startTime: number;
  disableEndTime: boolean;
  repeatEndedType: RepeatEndedType;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  consumption?: number;
}

function transformPlanToForm(plan?: RewardPlan): IDefaultForm {
  const {
    content,
    schedule,
    duration,
    repeatEndedDate,
    repeatEndedCount,
    consumption,
  } = plan || {};
  const repeatType = !schedule
    ? Period.OneTime
    : isOneTimeSchedule(schedule)
    ? Period.OneTime
    : isDailySchedule(schedule)
    ? Period.Daily
    : isWeeklySchedule(schedule)
    ? Period.Weekly
    : isMonthlySchedule(schedule)
    ? Period.Monthly
    : Period.Customized;
  const {startTime} = getStartTimeAndEndTime(repeatType, schedule);
  const repeatEndedType =
    repeatType == Period.OneTime
      ? RepeatEndedType.Endless
      : repeatEndedDate != null
      ? RepeatEndedType.ByDate
      : repeatEndedCount != null
      ? RepeatEndedType.ByCount
      : RepeatEndedType.Endless;

  const defaultRepeatEndedDate =
    repeatEndedType === RepeatEndedType.ByDate
      ? repeatEndedDate
      : dayjs().unix();
  const disableEndTime = duration === 0;

  return {
    content,
    repeatType,
    startTime,
    disableEndTime,
    repeatEndedType,
    repeatEndedDate: defaultRepeatEndedDate,
    repeatEndedCount,
    consumption,
  };
}

function transformFormToPlan(
  originalPlan: RewardPlan,
  form: IForm,
  updatedAt: number,
): RewardPlan {
  const {_id, createdAt} = originalPlan;
  const planBase = transformFormToPlanBase(form, createdAt, updatedAt);

  const plan: RewardPlan = {
    ...planBase,
    _id,
  };

  return plan;
}

function transformFormToPlanBase(
  form: IForm,
  createdAt: number,
  updatedAt: number,
): RewardPlanBase {
  const {
    content,
    repeatType,
    startTime,
    disableEndTime,
    repeatEndedType,
    repeatEndedDate,
    repeatEndedCount,
    consumption,
  } = form;
  const {schedule, duration} = getScheduleAndDuration(
    repeatType,
    startTime,
    disableEndTime,
  );

  return {
    content,
    schedule,
    duration,
    repeatEndedDate:
      repeatEndedType === RepeatEndedType.ByDate ? repeatEndedDate : undefined,
    repeatEndedCount:
      repeatEndedType === RepeatEndedType.ByCount
        ? parseNumber(repeatEndedCount)
        : undefined,
    consumption: parseNumber(consumption, true),
    createdAt,
    updatedAt,
  };
}

function parseNumber(num?: string | number, isFloat = false) {
  const numParsed =
    num != null
      ? typeof num === "string"
        ? isFloat
          ? parseFloat(num)
          : parseInt(num)
        : num
      : NaN;

  return !isNaN(numParsed) ? numParsed : undefined;
}

function parseTimeString(time?: string) {
  const parsedTime = parseInt(time || "");

  return !isNaN(parsedTime) ? parsedTime : 0;
}

function getStartTimeAndEndTime(repeatType: Period, schedule?: string) {
  const parsedSchedule = schedule ? parseSchedule(schedule) : undefined;
  const {minute, hour, date, day} = parsedSchedule || {};
  const parsedMinute = parseTimeString(minute);
  const parsedHour = parseTimeString(hour);
  const parsedDate = parseTimeString(date);
  const parsedDay = parseTimeString(day);

  switch (repeatType) {
    case Period.Daily:
      const dailyBaseTime = dayjs().startOf("day");
      const startTimeDaily =
        parsedSchedule != null
          ? dailyBaseTime.hour(parsedHour).minute(parsedMinute)
          : dailyBaseTime;

      return {
        startTime: startTimeDaily.unix(),
      };
    case Period.Weekly:
      const weeklyBaseTime = dayjs().startOf("week");
      const startTimeWeekly =
        parsedSchedule != null
          ? weeklyBaseTime.day(parsedDay).hour(parsedHour).minute(parsedMinute)
          : weeklyBaseTime;

      return {
        startTime: startTimeWeekly.unix(),
      };
    case Period.Monthly:
      const monthlyBaseTime = dayjs().startOf("month");
      const startTimeMonthly =
        parsedSchedule != null
          ? monthlyBaseTime
              .date(parsedDate)
              .hour(parsedHour)
              .minute(parsedMinute)
          : monthlyBaseTime;

      return {
        startTime: startTimeMonthly.unix(),
      };
  }

  const baseTime = dayjs().second(0).millisecond(0);
  const startTime =
    schedule != null ? getOneTimeScheduleStartTime(schedule) : baseTime.unix();

  return {startTime};
}

function getScheduleAndDuration(
  repeatType: Period,
  startTime: number,
  disableEndTime: boolean,
) {
  const startTimeParsed = dayjs.unix(startTime);

  switch (repeatType) {
    case Period.Daily:
      return {
        schedule: `${startTimeParsed.minute()} ${startTimeParsed.hour()} * * *`,
        duration: !disableEndTime
          ? startTimeParsed.add(1, "day").diff(startTimeParsed, "second", false)
          : 0,
      };
    case Period.Weekly:
      return {
        schedule: `${startTimeParsed.minute()} ${startTimeParsed.hour()} * * ${startTimeParsed.day()}`,
        duration: !disableEndTime
          ? startTimeParsed
              .add(1, "week")
              .diff(startTimeParsed, "second", false)
          : 0,
      };
    case Period.Monthly:
      return {
        schedule: `${startTimeParsed.minute()} ${startTimeParsed.hour()} ${startTimeParsed.date()} * *`,
        duration: !disableEndTime
          ? startTimeParsed
              .add(1, "month")
              .diff(startTimeParsed, "second", false)
          : 0,
      };
  }

  return {
    schedule: startTimeParsed.format(),
    duration: 0,
  };
}
