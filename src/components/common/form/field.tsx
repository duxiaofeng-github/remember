import React from "react";
import {View, StyleSheet, StyleProp, TextStyle} from "react-native";
import {FieldError} from "react-hook-form";
import {Text} from "../text";
import {colorError} from "../../../utils/style";

export interface IFieldProps {
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  error?: FieldError;
  block?: boolean;
}

export const Field: React.SFC<IFieldProps> = (props) => {
  const {block, label, labelStyle, error, children} = props;

  return (
    <View style={s.container}>
      {!block ? (
        <View style={s.content}>
          {label && <Text style={[s.label, labelStyle]}>{label}</Text>}
          {children}
        </View>
      ) : (
        <>
          {label && (
            <Text style={[s.label, s.labelBlock, labelStyle]}>{label}</Text>
          )}
          {children}
        </>
      )}
      {error && <Text style={s.error}>{error.message}</Text>}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 18,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
  },
  labelBlock: {
    marginBottom: 10,
  },
  error: {
    marginTop: 5,
    color: colorError,
    fontSize: 12,
  },
});
