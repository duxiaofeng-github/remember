import React from "react";
import { Tips } from "./tips";
import { translate } from "../../utils/common";

interface IProps {}

export const Empty: React.SFC<IProps> = (props) => {
  return <Tips iconName="inbox">{translate("Empty here")}</Tips>;
};
