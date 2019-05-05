import SecureStorage, {
  ACCESS_CONTROL,
  ACCESSIBLE,
  AUTHENTICATION_TYPE,
} from 'react-native-secure-storage';
import Mnemonic from 'bsv/mnemonic';

const secureConfig = {
  accessControl: ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  authenticationPrompt: 'Authenticate to initialize keys',
  service: 'network.bapp.mobile',
  authenticateType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
};

const key = 'bapp_mnemonic';

export const getMnemonic = async () => {
  return SecureStorage.getItem(key, secureConfig);
};

export const generateNewMnemonic = async () => {
  const mnemonic = Mnemonic.fromRandom();
  const mnemonicString = mnemonic.toString();
  await SecureStorage.setItem(key, mnemonicString, secureConfig);
  return mnemonicString;
};
