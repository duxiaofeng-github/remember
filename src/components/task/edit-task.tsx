import React, {useEffect, useMemo, useState} from "react";
import {View, StyleSheet} from "react-native";
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
  getOneTimeScheduleEndTime,
  secondsToDuration,
  parseSchedule,
} from "../../utils/common";
import {Select} from "../common/select";
import {DateTimeSelect} from "../common/date-time-select";
import {DurationSelect} from "../common/duration-select";
import {Input} from "../common/input";
import {useNavigation} from "@react-navigation/native";
import {Toast} from "../common/toast";
import {Plan, PlanBase, createPlan, updatePlan} from "../../db/plan";
import {useRexContext} from "../../store/store";
import {Unit} from "../common/picker/duration-picker";
import {TimeSelect} from "../common/time-select";
import {WeekTimeSelect} from "../common/week-time-select";
import {DayTimeSelect} from "../common/day-time-select";

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
  endTime: number;
  repeatEndedType: RepeatEndedType;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  noticeTime?: number;
  points?: number;
}

export const EditTask: React.SFC<IProps> = () => {
  const {t} = useTranslation();
  const [now, setNow] = useState(dayjs().startOf("minute").unix());
  const navigation = useNavigation();
  const {plansData, edittingPlanId, settingsData} = useRexContext(
    (store: IStore) => store,
  );
  const edittingPlan = useMemo(
    () =>
      plansData.data &&
      plansData.data.find((item) => item._id === edittingPlanId),
    [edittingPlanId, plansData],
  );
  const isCreating = useMemo(() => edittingPlan == null, [edittingPlan]);
  const {
    content,
    repeatType,
    startTime,
    endTime,
    repeatEndedType,
    repeatEndedDate,
    repeatEndedCount,
    noticeTime,
    points,
  } = useMemo(() => transformPlanToForm(edittingPlan), [edittingPlan]);
  const form = useForm<IForm>({
    mode: "onChange",
    defaultValues: {
      content,
      repeatType,
      startTime,
      endTime,
      repeatEndedType,
      repeatEndedDate,
      repeatEndedCount,
      noticeTime,
      points,
    },
  });
  const {control, handleSubmit, errors, watch} = form;
  const triggerSubmit = handleSubmit(async (data: IForm) => {
    if (edittingPlan == null) {
      const planBase = transformFormToPlanBase(data, now, now);

      await createPlan(planBase);
    } else {
      const plan = transformFormToPlan(edittingPlan, data, now);

      await updatePlan(plan);
    }

    Toast.message(
      isCreating ? t("Create successfully") : t("Edit successfully"),
    );

    await plansData.load();

    navigation.goBack();
  });

  useEffect(() => {
    return () => {
      globalStore.update((store) => {
        store.edittingPlanId = undefined;
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
      <View style={s.content}>
        <Controller
          control={control}
          name="content"
          rules={{required: t("Content is required") as string}}
          render={({onChange, onBlur, value}) => (
            <Input
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value}
              label={t("content")}
              error={errors.content}
              multiline
              placeholder={t("Please input content")}
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
                  onChange(value ? value[0] : undefined);
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
          name="noticeTime"
          render={({onChange, onBlur, value}) => {
            return (
              <DurationSelect
                clearable
                title={t("Select advance notice time")}
                enabledUnits={[Unit.Minutes, Unit.Hours]}
                label={t("Notice")}
                value={value}
                error={errors.noticeTime}
                onChange={onChange}
                onFormat={(value) => {
                  if (value != null) {
                    return t("NoticeTimeInAdvance", {
                      duration: secondsToDuration(value)
                        .locale(settingsData.data!.lang)
                        .humanize(false),
                    });
                  }

                  return t("No notice");
                }}
                onFormatUnit={(unit) => {
                  return t(`${unit}`);
                }}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="points"
          render={({onChange, onBlur, value}) => {
            return (
              <Input
                keyboardType="numeric"
                defaultValue={value}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
                label={t("Points")}
                error={errors.points}
                placeholder={t("Please input points")}
              />
            );
          }}
        />
      </View>
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
        rules={{required: t("Start time is required") as string}}
        render={({onChange, onBlur, value}) => {
          switch (repeatType) {
            case Period.Daily:
              return (
                <TimeSelect
                  onChange={onChange}
                  maxTime={watch("endTime")}
                  value={value}
                  label={t("Start time")}
                  error={errors.startTime}
                />
              );
            case Period.Weekly:
              return (
                <WeekTimeSelect
                  onChange={onChange}
                  maxTime={watch("endTime")}
                  value={value}
                  label={t("Start time")}
                  error={errors.startTime}
                />
              );
            case Period.Monthly:
              return (
                <DayTimeSelect
                  onChange={onChange}
                  maxTime={watch("endTime")}
                  value={value}
                  label={t("Start time")}
                  error={errors.startTime}
                />
              );
          }

          return (
            <DateTimeSelect
              onChange={onChange}
              maxTime={watch("endTime")}
              value={value}
              label={t("Start time")}
              error={errors.startTime}
            />
          );
        }}
      />
      <Controller
        control={control}
        name="endTime"
        rules={{required: t("End time is required") as string}}
        render={({onChange, onBlur, value}) => {
          switch (repeatType) {
            case Period.Daily:
              return (
                <TimeSelect
                  onChange={onChange}
                  minTime={watch("startTime")}
                  value={value}
                  label={t("End time")}
                  error={errors.endTime}
                />
              );
            case Period.Weekly:
              return (
                <WeekTimeSelect
                  onChange={onChange}
                  minTime={watch("startTime")}
                  value={value}
                  label={t("End time")}
                  error={errors.endTime}
                />
              );
            case Period.Monthly:
              return (
                <DayTimeSelect
                  onChange={onChange}
                  minTime={watch("startTime")}
                  value={value}
                  label={t("End time")}
                  error={errors.endTime}
                />
              );
          }

          return (
            <DateTimeSelect
              onChange={onChange}
              minTime={watch("startTime")}
              value={value}
              label={t("End time")}
              error={errors.endTime}
            />
          );
        }}
      />
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
                    onChange(value ? value[0] : undefined);
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
    overflow: "scroll",
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 25,
    paddingRight: 25,
  },
});

interface IDefaultForm {
  content?: string;
  repeatType: Period;
  startTime: number;
  endTime?: number;
  repeatEndedType: RepeatEndedType;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  noticeTime?: number;
  points?: number;
}

function transformPlanToForm(plan?: Plan): IDefaultForm {
  const {
    content,
    schedule,
    duration,
    repeatEndedDate,
    repeatEndedCount,
    noticeTime,
    points,
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
  const {startTime, endTime} = getStartTimeAndEndTime(
    repeatType,
    schedule,
    duration,
  );
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

  return {
    content,
    repeatType,
    startTime,
    endTime,
    repeatEndedType,
    repeatEndedDate: defaultRepeatEndedDate,
    repeatEndedCount,
    noticeTime,
    points,
  };
}

function transformFormToPlan(
  originalPlan: Plan,
  form: IForm,
  updatedAt: number,
): Plan {
  const {_id, createdAt} = originalPlan;
  const planBase = transformFormToPlanBase(form, createdAt, updatedAt);

  const plan: Plan = {
    ...planBase,
    _id,
  };

  return plan;
}

function transformFormToPlanBase(
  form: IForm,
  createdAt: number,
  updatedAt: number,
): PlanBase {
  const {
    content,
    repeatType,
    startTime,
    endTime,
    repeatEndedType,
    repeatEndedDate,
    repeatEndedCount,
    noticeTime,
    points,
  } = form;
  const {schedule, duration} = getScheduleAndDuration(
    repeatType,
    startTime,
    endTime,
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
    noticeTime,
    points: parseNumber(points, true),
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

function getStartTimeAndEndTime(
  repeatType: Period,
  schedule?: string,
  duration?: number,
) {
  const parsedSchedule = schedule ? parseSchedule(schedule) : undefined;
  const {minute, hour, date, day} = parsedSchedule || {};
  const parsedMinute = parseTimeString(minute);
  const parsedHour = parseTimeString(hour);
  const parsedDate = parseTimeString(date);
  const parsedDay = parseTimeString(day);
  const baseTime = dayjs().second(0).millisecond(0);

  switch (repeatType) {
    case Period.Daily:
      const startTimeDaily =
        parsedSchedule != null
          ? baseTime.hour(parsedHour).minute(parsedMinute)
          : baseTime;
      const endTimeDaily =
        parsedSchedule != null && duration != null
          ? startTimeDaily.add(duration, "second")
          : undefined;

      return {
        startTime: startTimeDaily.unix(),
        endTime: endTimeDaily ? endTimeDaily.unix() : undefined,
      };
    case Period.Weekly:
      const startTimeWeekly =
        parsedSchedule != null
          ? baseTime.day(parsedDay).hour(parsedHour).minute(parsedMinute)
          : baseTime;
      const endTimeWeekly =
        parsedSchedule != null && duration != null
          ? startTimeWeekly.add(duration, "second")
          : undefined;

      return {
        startTime: startTimeWeekly.unix(),
        endTime: endTimeWeekly ? endTimeWeekly.unix() : undefined,
      };
    case Period.Monthly:
      const startTimeMonthly =
        parsedSchedule != null
          ? baseTime.date(parsedDate).hour(parsedHour).minute(parsedMinute)
          : baseTime;
      const endTimeMonthly =
        parsedSchedule != null && duration != null
          ? startTimeMonthly.add(duration, "second")
          : undefined;

      return {
        startTime: startTimeMonthly.unix(),
        endTime: endTimeMonthly ? endTimeMonthly.unix() : undefined,
      };
  }

  const startTime =
    schedule != null ? getOneTimeScheduleStartTime(schedule) : baseTime.unix();
  const endTime =
    schedule != null && duration != null
      ? getOneTimeScheduleEndTime(schedule, duration)
      : undefined;

  return {startTime, endTime};
}

function getScheduleAndDuration(
  repeatType: Period,
  startTime: number,
  endTime: number,
) {
  const startTimeParsed = dayjs.unix(startTime);
  const startTimeYear = startTimeParsed.year();
  const startTimeMonth = startTimeParsed.month();
  const startTimeDate = startTimeParsed.date();
  const endTimeBase = dayjs.unix(endTime);
  const endTimeWeekDay = dayjs.unix(endTime).weekday();

  switch (repeatType) {
    case Period.Daily:
      return {
        schedule: `${startTimeParsed.minute()} ${startTimeParsed.hour()} * * *`,
        duration: endTimeBase
          .year(startTimeYear)
          .month(startTimeMonth)
          .date(startTimeDate)
          .diff(startTimeParsed, "second", false),
      };
    case Period.Weekly:
      return {
        schedule: `${startTimeParsed.minute()} ${startTimeParsed.hour()} * * ${startTimeParsed.day()}`,
        duration: endTimeBase
          .year(startTimeYear)
          .month(startTimeMonth)
          .date(startTimeDate)
          .weekday(endTimeWeekDay)
          .diff(startTimeParsed, "second", false),
      };
    case Period.Monthly:
      return {
        schedule: `${startTimeParsed.minute()} ${startTimeParsed.hour()} ${startTimeParsed.date()} * *`,
        duration: endTimeBase
          .year(startTimeYear)
          .month(startTimeMonth)
          .diff(startTimeParsed, "second", false),
      };
  }

  return {
    schedule: startTimeParsed.format(),
    duration: endTimeBase.diff(startTimeParsed, "second", false),
  };
}
