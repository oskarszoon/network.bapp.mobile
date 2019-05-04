import { Meteor } from 'meteor/meteor';
//import datapay from 'datapay';
//import bsv from 'bsv';

/**
 * Replace the given replacement variable with the correct data
 * @param replacementVariable
 * @param data
 * @returns {*}
 */
const getReplacementData = function (replacementVariable, data) {
  // chop off the first "${" and last "}"
  const dataKey = replacementVariable.substr(2, replacementVariable.length - 3);
  // we only support 2 dimensional data objects so far, KISS and naive
  if (dataKey.indexOf('.')) {
    const [key, subKey] = dataKey.split('.');
    return data[key] ? data[key][subKey] : '';
  }

  return data[dataKey];
};

/**
 * Process a protocol line definition, replacing all ${...} found with data
 * @param protocolLine string
 * @param data object
 * @returns {*}
 */
const processProtocolLine = function (protocolLine, data) {
  // get all the ${...} replacements in the line definition
  const replacements = protocolLine.match(/\${[^}]+}/gm);
  if (replacements) {
    replacements.forEach((replacement) => {
      const replacementData = getReplacementData(replacement, data);
      // TODO: handle binary data in replacement
      protocolLine = protocolLine.replace(replacement, replacementData);
    });
  }

  return protocolLine;
};

/**
 * Defined the process function that are available as helpers in the definition
 */
const processFunctions = {
  base64decode: atob,
  base64encode: btoa,
  /*
  base58encode(hex) {
    return bsv.encoding.Base58.fromHex(hex).toString();
  },
  base58decode(base58) {
    return bsv.encoding.Base58.fromString(base58).toHex();
  },
  sha256(string) {
    return bsv.crypto.Hash.sha256(Buffer.from(string)).toString('hex');
  },
  */
};

/**
 * Process as a protocol line as an object definition. For now this only supports calling a simple
 * process function that is defined in processFunctions{}
 * @param protocolLine
 * @param data
 * @returns {*}
 */
const processProtocolLineObject = function (protocolLine, data) {
  let lineData = getReplacementData(protocolLine.dataElement, data);

  if (protocolLine.process) {
    if (processFunctions[protocolLine.process]) {
      lineData = processFunctions[protocolLine.process](lineData);
    } else {
      // panic ...
    }
  }

  return lineData;
};

/**
 * Send the transaction to the backend
 * @param transaction
 * @param callback
 */
const sendBappTransaction = function (transaction, callback) {
  console.log(transaction);
  //Meteor.call('send-transaction', transaction, callback);
};

/**
 * Submit Bapp transaction from the interface for a certain definition
 * @param bapp
 * @param data
 * @param callback
 * @returns {boolean}
 */
export const submitBappTransaction = function (bapp, data, callback) {
  const protocol = [];
  console.log(bapp.definition);
  bapp.definition.protocol.forEach((protocolLine) => {
    if (typeof protocolLine === 'object') {
      protocol.push(processProtocolLineObject(protocolLine, data));
    } else {
      protocol.push(processProtocolLine(protocolLine, data));
    }
  });
  console.log('protocol', protocol);

  const transaction = protocol.join(' ');
  const config = {
    data: transaction,
  };

  if (bapp.definition.sign) {
    // sign transaction using AUTHOR_IDENTITY_PROTOCOL
  }

  if (bapp.definition.encrypt) {
    // encrypt contents
  }

  console.log('config', config);
  callback(null, config);
  return false;

  /*
  datapay.build(config, (error, tx) => {
    if (error) {
      // error handling ...
    } else {
      sendBappTransaction(tx, callback);
    }
  });
  */
};
