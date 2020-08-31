import React from 'react';
import RNVI from 'react-native-vector-icons/Feather';
import {IconProps} from 'react-native-vector-icons/Icon';

RNVI.loadFont();

interface IProps extends IconProps {}

export const Icon: React.SFC<IProps> = (props) => {
  return <RNVI {...props} />;
};
