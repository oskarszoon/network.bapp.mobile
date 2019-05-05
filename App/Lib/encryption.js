import { Buffer } from 'buffer';
import aesjs from 'aes-js';
import bsv from 'bsv';

// helpers
const CBC = aesjs.ModeOfOperation.cbc;
const { Hash } = bsv.crypto;

/**
 * Encrypt the data in the line, uses ECIES compatible encryption
 * @param encryptionKey
 * @param line
 */
export const encryptLine = function (encryptionKey, line) {
  const ivkEkM = Hash.sha512(Buffer.from(encryptionKey));
  const ivBuffer = ivkEkM.slice(0, 16);
  const keyBuffer = ivkEkM.slice(16, 32);
  const kM = ivkEkM.slice(32, 64);

  let lineBuffer = Buffer.from(line);
  lineBuffer = aesjs.padding.pkcs7.pad(lineBuffer);
  const aesCbc = new CBC(keyBuffer, ivBuffer);
  const encryptedBytes = aesCbc.encrypt(lineBuffer);
  const cipherText = Buffer.from(encryptedBytes);

  const BIE1 = Buffer.from('BIE1');
  const encBuffer = Buffer.concat([BIE1, cipherText]);
  const hmac = Hash.sha256hmac(encBuffer, kM);

  return Buffer.concat([encBuffer, hmac]).toString('hex');
};

export const decryptLine = function (encryptionKey, encryptedLine) {
  if (!Buffer.isBuffer(encryptedLine)) encryptedLine = Buffer.from(encryptedLine, 'hex');
  const ivkEkM = Hash.sha512(Buffer.from(encryptionKey));
  const ivBuffer = ivkEkM.slice(0, 16);
  const keyBuffer = ivkEkM.slice(16, 32);
  const kM = ivkEkM.slice(32, 64);

  const tagLength = 32;
  const offset = 4;
  const magic = encryptedLine.slice(0, 4);
  if (!magic.equals(Buffer.from('BIE1'))) {
    throw new Error('Invalid Magic');
  }

  const cipherText = encryptedLine.slice(offset, encryptedLine.length - tagLength);
  const hmac = encryptedLine.slice(encryptedLine.length - tagLength, encryptedLine.length);

  const hmac2 = Hash.sha256hmac(encryptedLine.slice(0, encryptedLine.length - tagLength), kM);

  if (!hmac.equals(hmac2)) {
    throw new Error('Invalid checksum');
  }

  const aesCbc = new CBC(keyBuffer, ivBuffer);
  const decryptedBytes = aesCbc.decrypt(cipherText);

  return Buffer.from(aesjs.padding.pkcs7.strip(decryptedBytes)).toString();
};
