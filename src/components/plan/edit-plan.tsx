import React from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "../common/textarea";
import { useRexContext } from "@jimengio/rex";
import { IStore } from "../../store";
import { translate, isDailySchedule, isWeeklySchedule, isMonthlySchedule } from "../../utils/common";
import { Select } from "../common/select";

interface IProps {}

enum Period {
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
  const { control, handleSubmit, errors } = useForm<IForm>({ mode: "onChange" });
  const onSubmit = (data: IForm) => console.log(data);
  const period = !schedule
    ? Period.Daily
    : isDailySchedule(schedule)
    ? Period.Daily
    : isWeeklySchedule(schedule)
    ? Period.Weekly
    : isMonthlySchedule(schedule)
    ? Period.Monthly
    : Period.Customized;

  return (
    <View style={s.container}>
      <Header title="Remember" />
      <View style={s.content}>
        <Controller
          control={control}
          name="content"
          rules={{ required: translate("Plan content is required") }}
          defaultValue={content}
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
          defaultValue={period}
          render={({ onChange, onBlur, value }) => {
            const data = [
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
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    padding: 20,
  },
});
