import React from "react";
import { Icon as RNEIcon, IconProps } from "react-native-elements";

interface IProps extends IconProps {
  type?: string;
}

export const Icon: React.SFC<IProps> = (props) => {
  const { type = "feather", ...restProps } = props;

  return <RNEIcon type={type} {...restProps} />;
};
