import React from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { useForm, Controller, UseFormMethods } from "react-hook-form";
import { Textarea } from "../common/textarea";
import { useRexContext } from "@jimengio/rex";
import { IStore } from "../../store";
import {
  translate,
  isDailySchedule,
  isWeeklySchedule,
  isMonthlySchedule,
  isOneTimeSchedule,
  getOneTimeScheduleStartTime,
} from "../../utils/common";
import { Select } from "../common/select";
import dayjs from "dayjs";
import { DateTimeSelect } from "../common/date-time-select";

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
  repeat: number;
  advanceTime: number;
  pointsPerTask: number;
}

export const EditPlan: React.SFC<IProps> = () => {
  const { edittingPlan } = useRexContext((store: IStore) => store);
  const { content, schedule } = edittingPlan || {};
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
  const startTime = schedule ? getOneTimeScheduleStartTime(schedule) : dayjs().unix();
  const endTime = schedule ? getOneTimeScheduleStartTime(schedule) : undefined;

  const form = useForm<IForm>({ mode: "onChange", defaultValues: { content, type, startTime, endTime } });
  const { control, handleSubmit, errors, watch } = form;
  const onSubmit = (data: IForm) => console.log(data);

  return (
    <View style={s.container}>
      <Header title="Remember" />
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
                  onChange(value[0]);
                }}
                value={[value]}
                data={[data]}
                label={translate("type")}
                error={errors.type}
              />
            );
          }}
        />
        <StartTimeAndEndTimePicker type={watch("type")} form={form} />
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
                  minTime={dayjs().unix()}
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
