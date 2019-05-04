import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

if (__DEV__) {
  Meteor.startup(() => {
    console.log('Meteor started up');
  });

  Tracker.autorun(() => {
    console.log('Meteor.status', Meteor.status());
  });

  Tracker.autorun(() => {
    console.log('Meteor.loggingIn()', Meteor.loggingIn());
  });

  Tracker.autorun(() => {
    console.log('Meteor.user()', Meteor.user());
  });
}
