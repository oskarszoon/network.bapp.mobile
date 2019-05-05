import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { Animated, Easing } from 'react-native';
import { FluidNavigator } from 'react-navigation-fluid-transitions';

import LaunchScreen from '../Containers/LaunchScreenTracker';
import BappsList from '../Containers/BappsList';
import BappListItems from '../Containers/BappListItems';
import BappItemAdd from '../Containers/BappItemAdd';

const transitionConfig = {
  duration: 300,
  timing: Animated.timing,
  easing: Easing.easing,
};

// Manifest of possible screens
const App = FluidNavigator({
  BappsList: { screen: BappsList },
  BappListItems: { screen: BappListItems },
  BappItemAdd: { screen: BappItemAdd },
}, {
  transitionConfig,
  mode: 'card',
  initialRouteName: 'BappsList',
  defaultNavigationOptions: { gesturesEnabled: true },
});

const PrimaryNav = createSwitchNavigator({
  LaunchScreen,
  App,
}, {
  initialRouteName: 'LaunchScreen',
});

export default createAppContainer(PrimaryNav);
