import React from "react";
import {Tips} from "./tips";
import {useTranslation} from "react-i18next";

interface IProps {}

export const Empty: React.SFC<IProps> = (props) => {
  const {t} = useTranslation();

  return <Tips iconName="inbox">{t("Empty here")}</Tips>;
};
