// symbol polyfills
import Symbol from 'core-js/es6/symbol';
import 'core-js/fn/symbol/iterator';
import 'react-native-console-time-polyfill';

// collection fn polyfills
import 'core-js/fn/map';
import 'core-js/fn/set';
import 'core-js/fn/array/find';
import 'core-js/fn/object/assign';
import 'core-js/fn/object/is';

global.Symbol = Symbol;
