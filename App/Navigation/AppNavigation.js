import { createStackNavigator, createAppContainer } from 'react-navigation';
import LaunchScreen from '../Containers/LaunchScreen';
import BappItemAdd from '../Containers/BappItemAdd';

import styles from './Styles/NavigationStyles';

// Manifest of possible screens
const PrimaryNav = createStackNavigator({
  LaunchScreen: { screen: LaunchScreen },
  BappItemAdd: { screen: BappItemAdd },
}, {
  // Default config for all screens
  headerMode: 'none',
  initialRouteName: 'LaunchScreen',
  navigationOptions: {
    headerStyle: styles.header,
  },
});

export default createAppContainer(PrimaryNav);
