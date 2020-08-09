import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { useForm, Controller, UseFormMethods } from "react-hook-form";
import { Textarea } from "../common/textarea";
import { IStore, globalStore } from "../../store";
import {
  translate,
  isDailySchedule,
  isWeeklySchedule,
  isMonthlySchedule,
  isOneTimeSchedule,
  getOneTimeScheduleStartTime,
  getOneTimeScheduleEndTime,
  secondsToDuration,
} from "../../utils/common";
import { Select } from "../common/select";
import dayjs from "dayjs";
import { DateTimeSelect } from "../common/date-time-select";
import { DurationSelect } from "../common/duration-select";
import { Input } from "../common/input";
import { useNavigation } from "@react-navigation/native";
import { Toast } from "../common/toast";
import { Plan, PlanBase, createPlan, updatePlan } from "../../db/plan";
import { useRexContext } from "../../store/store";
import { Unit } from "../common/picker/duration-picker";

interface IProps {}

enum Period {
  OneTime = "oneTime",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Customized = "customized",
}

interface IForm {
  content: string;
  type: Period;
  startTime: number;
  endTime: number;
  repeatEndedAt?: number;
  repeatEndedCount?: number;
  noticeDuration?: number;
  pointsPerTask?: number;
}

export const EditPlan: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const { plansData, edittingPlanId, lang } = useRexContext((store: IStore) => store);
  const edittingPlan = useMemo(() => plansData.data && plansData.data.find((item) => item._id === edittingPlanId), [
    edittingPlanId,
    plansData,
  ]);
  const isCreating = useMemo(() => edittingPlan == null, [edittingPlan]);
  const { content, type, startTime, endTime, noticeDuration, pointsPerTask } = useMemo(
    () => transformPlanToForm(edittingPlan),
    [edittingPlan],
  );
  const form = useForm<IForm>({
    mode: "onChange",
    defaultValues: { content, type, startTime, endTime, noticeDuration, pointsPerTask },
  });
  const { control, handleSubmit, errors, watch } = form;
  const triggerSubmit = handleSubmit(async (data: IForm) => {
    if (edittingPlan == null) {
      const planBase = transformFormToPlanBase(data);

      await createPlan(planBase);
    } else {
      const plan = transformFormToPlan(edittingPlan, data);

      await updatePlan(plan);
    }

    Toast.message(isCreating ? translate("Create successfully") : translate("Edit successfully"));
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
          text: isCreating ? translate("Create") : translate("Save"),
          onTouchEnd: async () => {
            await triggerSubmit();

            await plansData.load();

            navigation.goBack();
          },
        }}
      />
      <View style={s.content}>
        <Controller
          control={control}
          name="content"
          rules={{ required: translate("Plan content is required") }}
          render={({ onChange, onBlur, value }) => (
            <Textarea
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value}
              label={translate("content")}
              error={errors.content}
              rows={1}
              placeholder={translate("Please input plan content")}
            />
          )}
        />
        <Controller
          control={control}
          name="type"
          rules={{ required: translate("Plan type is required") }}
          render={({ onChange, onBlur, value }) => {
            const data = [
              { label: translate("oneTime"), value: Period.OneTime },
              { label: translate("dailyPlan"), value: Period.Daily },
              { label: translate("weeklyPlan"), value: Period.Weekly },
              { label: translate("monthlyPlan"), value: Period.Monthly },
              // { label: translate("customized"), value: Period.Customized },
            ];

            return (
              <Select
                onConfirm={(value) => {
                  onChange(value ? value[0] : undefined);
                }}
                title={translate("Select type")}
                value={[value]}
                data={[data]}
                label={translate("type")}
                error={errors.type}
              />
            );
          }}
        />
        <StartTimeAndEndTimePicker type={watch("type")} form={form} />
        <Controller
          control={control}
          name="noticeDuration"
          render={({ onChange, onBlur, value }) => {
            return (
              <DurationSelect
                clearable
                title={translate("Select advance notice time")}
                enabledUnits={[Unit.Minutes, Unit.Hours]}
                label={translate("Notice")}
                value={value}
                error={errors.noticeDuration}
                onChange={onChange}
                onFormat={(value) => {
                  if (value != null) {
                    return translate("NoticeDurationInAdvance", {
                      duration: secondsToDuration(value).locale(lang).humanize(false),
                    });
                  }

                  return translate("No notice");
                }}
                onFormatUnit={(unit) => {
                  return translate(`${unit}`);
                }}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="pointsPerTask"
          render={({ onChange, onBlur, value }) => (
            <Input
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              label={translate("Points")}
              error={errors.pointsPerTask}
              placeholder={translate("Please input points")}
            />
          )}
        />
      </View>
    </View>
  );
};

interface IStartTimeAndEndTimePickerProps {
  type: Period;
  form: UseFormMethods<IForm>;
}

export const StartTimeAndEndTimePicker: React.SFC<IStartTimeAndEndTimePickerProps> = (props) => {
  const { type, form } = props;
  const { control, errors, watch } = form;

  switch (type) {
    case Period.OneTime:
      return (
        <>
          <Controller
            control={control}
            name="startTime"
            rules={{ required: translate("Plan start time is required") }}
            render={({ onChange, onBlur, value }) => {
              return (
                <DateTimeSelect
                  onChange={onChange}
                  maxTime={watch("endTime")}
                  value={value}
                  label={translate("Start time")}
                  error={errors.startTime}
                />
              );
            }}
          />
          <Controller
            control={control}
            name="endTime"
            rules={{ required: translate("Plan end time is required") }}
            render={({ onChange, onBlur, value }) => {
              return (
                <DateTimeSelect
                  onChange={onChange}
                  minTime={watch("startTime")}
                  value={value}
                  label={translate("End time")}
                  error={errors.endTime}
                />
              );
            }}
          />
        </>
      );
  }

  return null;
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    padding: 20,
  },
});

interface IDefaultForm {
  content?: string;
  type: Period;
  startTime: number;
  endTime?: number;
  noticeDuration?: number;
  pointsPerTask?: number;
}

function transformPlanToForm(plan?: Plan): IDefaultForm {
  const { content, schedule, duration, repeatEndedAt, repeatEndedCount, noticeDuration, pointsPerTask } = plan || {};
  const type = !schedule
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
  const startTime = schedule != null ? getOneTimeScheduleStartTime(schedule) : dayjs().unix();
  const endTime = schedule != null && duration != null ? getOneTimeScheduleEndTime(schedule, duration) : undefined;

  return {
    content,
    type,
    startTime,
    endTime,
    noticeDuration,
    pointsPerTask,
  };
}

function transformFormToPlan(originalPlan: Plan, form: IForm): Plan {
  const { _id, taskIds, createdAt, updatedAt } = originalPlan;
  const planBase = transformFormToPlanBase(form);
  const plan: Plan = {
    ...planBase,
    _id,
    taskIds,
    createdAt,
    updatedAt,
  };

  return plan;
}

function transformFormToPlanBase(form: IForm): PlanBase {
  const { content, type, startTime, endTime, repeatEndedAt, repeatEndedCount, noticeDuration, pointsPerTask } = form;
  const { schedule, duration } = getScheduleAndDuration(type, startTime, endTime);

  return {
    content,
    schedule,
    duration,
    repeatEndedAt,
    repeatEndedCount,
    noticeDuration,
    pointsPerTask,
  };
}

function getScheduleAndDuration(type: Period, startTime: number, endTime: number) {
  const startTimeParsed = dayjs.unix(startTime);
  const endTimeParsed = dayjs.unix(endTime);

  switch (type) {
    case Period.Daily:
      return { schedule: ``, duration: 0 };
  }

  return { schedule: startTimeParsed.format(), duration: endTimeParsed.diff(startTimeParsed, "second", false) };
}
