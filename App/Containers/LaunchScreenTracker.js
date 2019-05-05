import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'react-meteor-data-with-tracker';

import LaunchScreen from './LaunchScreen';

const ready = new ReactiveVar(false);
Meteor.startup(() => {
  ready.set(true);
});

export default withTracker((props) => {
  return {
    ready: ready.get(),
  };
})(LaunchScreen);
