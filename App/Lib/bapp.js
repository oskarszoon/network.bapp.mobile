import { Meteor } from 'meteor/meteor';
import { Base64 } from 'js-base64';
import { Buffer } from 'buffer';
import { buildAuthorIdentity } from 'bitcoinfiles-sdk';
import bsv from 'bsv';
import { encryptLine } from './encryption';
import { getSigningKey } from './user';

/**
 * Replace the given replacement variable with the correct data
 * @param replacementVariable
 * @param data
 * @returns {*}
 */
const getReplacementData = function (replacementVariable, data) {
  let dataKey = replacementVariable;
  if (dataKey.indexOf('${') === 0) {
    // chop off the first "${" and last "}"
    dataKey = dataKey.substr(2, replacementVariable.length - 3);
  }

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
  base64decode: Base64.decode,
  base64atob: Base64.atob,
  base64encode: Base64.encode,
  base64btoa: Base64.btoa,
  base58encode(hex) {
    return bsv.encoding.Base58.fromHex(hex).toString();
  },
  base58decode(base58) {
    return bsv.encoding.Base58.fromString(base58).toHex();
  },
  sha256(string) {
    return bsv.crypto.Hash.sha256(Buffer.from(string)).toString('hex');
  },
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
  Meteor.call('transactions/send', transaction, callback);
};

/**
 * Submit Bapp transaction from the interface for a certain definition
 * @param bapp
 * @param data
 * @param callback
 * @returns {boolean}
 */
export const submitBappTransaction = function (bapp, data, callback) {
  const Random = require('meteor/random').Random;

  let protocol = [];
  const encryptionKey = Random.secret(64);
  let lineNr = 0;
  protocol.push(Buffer.from(bapp.definition.protocolAddress).toString('hex'));
  bapp.definition.protocol.forEach((protocolLine) => {
    let line;
    if (typeof protocolLine === 'object') {
      line = processProtocolLineObject(protocolLine, data);
    } else {
      line = processProtocolLine(protocolLine, data);
    }

    let lineHex = Buffer.from(line).toString('hex');
    if (typeof bapp.definition.encrypt === 'object') {
      // encrypt contents
      if (bapp.definition.encrypt.indexOf(lineNr) >= 0) {
        // encrypt the contents
        lineHex = encryptLine(encryptionKey, line);
      }
    }

    protocol.push(lineHex);
    lineNr += 1;
  });

  if (bapp.definition.sign) {
    // sign transaction using AUTHOR_IDENTITY_PROTOCOL
    protocol.push('0x' + Buffer.from('|').toString('hex'));

    const signingKey = getSigningKey();
    const identityPrivateKey = bsv.PrivateKey(signingKey.toWIF());
    const signatureKey = identityPrivateKey.toWIF();
    const identityAddress = identityPrivateKey.publicKey.toAddress();
    const opReturnHexArray = buildAuthorIdentity({
      args: protocol,
      address: identityAddress.toString(),
      key: signatureKey,
      indexes: bapp.definition.sign,
    });

    protocol = protocol.concat(opReturnHexArray);
  }

  const bappTransaction = {
    protocol,
  };
  if (bapp.definition.encrypt) {
    bappTransaction.secret = encryptionKey;
  }

  sendBappTransaction(bappTransaction, (err, txId) => {
    if (err) {
      callback(err);
    } else {
      bappTransaction.txId = txId;
      callback(null, bappTransaction);
    }
  });
};
