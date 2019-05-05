import { StyleSheet } from 'react-native';
import { Metrics, ApplicationStyles } from '../../Themes';

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    paddingBottom: Metrics.baseMargin,
  },
  loading_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: Metrics.doubleSection,
    height: Metrics.images.logo,
    width: Metrics.images.logo,
    resizeMode: 'contain',
  },
  centered: {
    alignItems: 'center',
  },
  list_card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItems_container: {
    flex: 1,
    backgroundColor: 'white',
  },
  list_container: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
  },
});
