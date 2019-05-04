import 'react-native-meteor-polyfills';
import 'meteor-client';
import './polyfill';

import './App/Config/ReactotronConfig';
import { AppRegistry } from 'react-native';
import App from './App/Containers/App';

AppRegistry.registerComponent('Bapp', () => { return App; });
