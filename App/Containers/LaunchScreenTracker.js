import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'react-meteor-data-with-tracker';
import LaunchScreen from './LaunchScreen';
import { login, checkOrCreateKeys } from '../Lib/user';

const ready = new ReactiveVar(false);
const statusMessage = new ReactiveVar('');
const errorMessage = new ReactiveVar('');
Meteor.startup(async () => {
  // Dirty quickie hackie key generation
  // TODO: add startup screen + recovery etc.
  if (!checkOrCreateKeys()) {
    // failed getting or creating keys
    errorMessage.set('Could not initialize keys');
  }

  Tracker.autorun(async (computation) => {
    const loggingIn = Meteor.loggingIn();
    const user = Meteor.user();

    if (loggingIn) {
      return;
    }

    if (!user) {
      // login
      await login((err) => {
        if (err) {
          console.error(err);
          errorMessage.set(err.reason);
          computation.stop();
        }
      });
      return;
    }

    ready.set(true);
  });
});

export default withTracker((props) => {
  return {
    ready: ready.get(),
    statusMessage: statusMessage.get(),
    errorMessage: errorMessage.get(),
  };
})(LaunchScreen);
