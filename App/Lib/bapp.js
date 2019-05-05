import { Meteor } from 'meteor/meteor';
import { Base64 } from 'js-base64';
import { Buffer } from 'buffer';
import { buildAuthorIdentity } from 'bitcoinfiles-sdk';
import bsv from 'bsv';
import { encryptLine } from './encryption';
import { getSigningKey, getEncryptionKey } from './user';
import { each } from 'lodash';
import ECIES from 'bsv/ecies';

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
  base58encode (hex) {
    return bsv.encoding.Base58.fromHex(hex).toString();
  },
  base58decode (base58) {
    return bsv.encoding.Base58.fromString(base58).toHex();
  },
  sha256 (string) {
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
 * @param encryptedSecret
 * @param callback
 */
const sendBappTransaction = function (transaction, encryptedSecret, callback) {
  Meteor.call('transactions/send', transaction, encryptedSecret, callback);
};

const getJSONdata = function (data) {
  const jsonFields = {};
  const jsonData = {};
  const allowedAttributes = ['fileName', 'fileSize', 'height', 'width', 'type'];
  each(data, (value, key) => {
    let dataValue = value;
    if (typeof value === 'object') {
      // deep clone
      dataValue = JSON.parse(JSON.stringify(value));
      if (dataValue.fileName) {
        // clean all reduntant fields from files for the output
        each(dataValue, (dataValueAttribute, attributeKey) => {
          if (allowedAttributes.indexOf(attributeKey) < 0) {
            delete dataValue[attributeKey];
          }
        });
      }
      jsonData[key] = dataValue;
    }
    jsonFields[key] = dataValue;
  });
  jsonData.fields = JSON.stringify(jsonFields);

  return jsonData;
};
/**
 * Submit Bapp transaction from the interface for a certain definition
 * @param bapp
 * @param data
 * @param callback
 * @returns {boolean}
 */
export const submitBappTransaction = async function (bapp, data, callback) {
  const Random = require('meteor/random').Random;

  // add the JSON helper attributes to the data object
  data.JSON = getJSONdata(data);

  let protocol = [];
  const encryptionKey = Random.secret(64);
  let lineNr = 0;
  protocol.push('0x' + Buffer.from(bapp.protocolAddress).toString('hex'));
  bapp.definition.protocol.forEach((protocolLine) => {
    let line;
    if (typeof protocolLine === 'object') {
      line = processProtocolLineObject(protocolLine, data);
    } else {
      line = processProtocolLine(protocolLine, data);
    }

    let lineHex = '0x' + Buffer.from(line).toString('hex');
    if (typeof bapp.definition.encrypt === 'object') {
      // encrypt contents
      if (bapp.definition.encrypt.indexOf(lineNr) >= 0) {
        // encrypt the contents
        lineHex = '0x' + encryptLine(encryptionKey, line);
      }
    }

    protocol.push(lineHex);
    lineNr += 1;
  });

  if (bapp.definition.sign) {
    // sign transaction using AUTHOR_IDENTITY_PROTOCOL
    protocol.push('0x' + Buffer.from('|').toString('hex'));

    const signingKey = await getSigningKey();
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

  let encryptedSecret;
  if (bapp.definition.encrypt) {
    bappTransaction.secret = encryptionKey;

    // We don't have a way (yet) to give the user the encryption secret in the app
    // for now we send it to the backend, where it will be stored in the database, encrypted
    // by the public key of the user
    const loginKey = await getEncryptionKey();
    const ecies = ECIES();
    ecies.publicKey(loginKey.publicKey);
    encryptedSecret = ecies.encrypt(bappTransaction.secret).toString('hex');

    /* placeholder for decryption ...
    const ecies2 = ECIES();
    ecies2.privateKey(loginKey);
    const decrypted = ecies2.decrypt(Buffer.from(encryptedSecret, 'hex')).toString();
    console.log({decrypted});
    */
  }

  sendBappTransaction(bappTransaction.protocol, encryptedSecret, (err, txId) => {
    if (err) {
      callback(err);
    } else {
      bappTransaction.txId = txId;
      callback(null, bappTransaction);
    }
  });
};
