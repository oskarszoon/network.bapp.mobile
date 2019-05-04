import { createAppContainer } from 'react-navigation';
import { Animated, Easing } from 'react-native';
import { FluidNavigator } from 'react-navigation-fluid-transitions';
import LaunchScreen from '../Containers/LaunchScreen';
import BappItemAdd from '../Containers/BappItemAdd';

import styles from './Styles/NavigationStyles';

const transitionConfig = {
  duration: 300,
  timing: Animated.timing,
  easing: Easing.easing,
};

// Manifest of possible screens
const PrimaryNav = FluidNavigator({
  LaunchScreen: { screen: LaunchScreen },
  BappItemAdd: { screen: BappItemAdd },
}, {
  transitionConfig,
  mode: 'card',
  initialRouteName: 'LaunchScreen',
  defaultNavigationOptions: { gesturesEnabled: true },
});

export default createAppContainer(PrimaryNav);
