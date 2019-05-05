import { StyleSheet } from 'react-native';
import { Metrics, ApplicationStyles } from '../../Themes';

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    paddingBottom: Metrics.baseMargin,
  },
  loading_container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    flex: 0,
    height: 152, // 120 + 2*16
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: 'white',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  list_card_content: {
    flex: 1,
    padding: 16,
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
  credits_text: {
    color: '#ffffff',
    marginTop: 32,
    paddingLeft: 16,
    paddingRight: 16,
    textAlign: 'center',
  },
  input_field_container: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
  },
  text_field_input_container: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  text_field_input: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingLeft: 8,
    paddingRight: 8,
  },
});
