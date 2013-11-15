'use strict';

/*global arrayFind*/
/*exported lzwDecode, lzwEncode*/

/**
 * @function lzwDecode
 * Decodes a stream of encoded indices using the LZW algorithm.
 *
 * Note that this function does not decode indices from bytes as they are stored
 * in a GIF. The bytes must be decoded ahead of time.
 *
 * @param {number[]|Uint8Array|Uint16Array} codeStream - The stream of indices to decode.
 * @returns {number[]} - The stream of decoded indices.
 */
function lzwDecode(codeStream) {
  var codeTable,
    indexStream = [],
    clearCode = codeStream[0],
    eoiCode = clearCode + 1,
    pushToIndexStream,
    clear, code, i, nextCode;

  clear = function () {
    var i;

    codeTable = [];
    for (i = 0; i < clearCode; i++) {
      codeTable[i] = [i];
    }
    codeTable[clearCode] = [];
    codeTable[eoiCode] = null;
  };

  pushToIndexStream = function (elt) {
    indexStream.push(elt);
  };

  clear();
  indexStream.push((code = codeStream[1]));
  for (i = 2; i < codeStream.length; i++) {
    code = codeStream[i];
    if (code !== eoiCode) {
      if (code < codeTable.length) {
        codeTable[code].forEach(pushToIndexStream);
        codeTable.push(codeTable[codeStream[i-1]].concat([codeTable[code][0]]));
      } else {
        nextCode = codeTable[codeStream[i-1]][0];
        codeTable[codeStream[i-1]].forEach(pushToIndexStream);
        indexStream.push(nextCode);
        codeTable.push(codeTable[codeStream[i-1]].concat([nextCode]));
      }
    }
  }

  return indexStream;
}

/**
 * @function lzwEncode
 * Encodes a stream of indices using the LZW algorithm.
 *
 * @param {number} minCodeSize - The size of the smallest possible encoded index, in bits.
 * @param {number[]|Uint8Array} indexStream - The stream of indices to encode
 * @returns {number[]} The stream of encoded indices before encoding to bytes.
 */
function lzwEncode(minCodeSize, indexStream) {
  var codeStream = [],
    codeTable,
    clearCode = 1 << minCodeSize,
    eq,
    indexBuffer = [],
    i,
    eoiCode = clearCode + 1,
    nextIndex,
    nextIndexBuffer,
    tableIndex;

  eq = function (lhs, rhs) {
    var i;

    if (!(lhs && rhs)) {
      return false;
    }
    if (lhs.length === rhs.length) {
      for (i = 0; i < lhs.length; i++) {
        if (lhs[i] !== rhs[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  var clear = function () {
    var i;

    codeTable = [];
    for (i = 0; i < clearCode; i++) {
      codeTable[i] = [i];
    }
    codeTable[clearCode] = [];
    codeTable[eoiCode] = null;
  };

  clear();
  codeStream.push(clearCode);
  indexBuffer.push(indexStream[0]);

  for (i = 1; i < indexStream.length; i++) {
    nextIndex = indexStream[i];
    nextIndexBuffer = indexBuffer.concat(nextIndex);

    tableIndex = arrayFind(codeTable, eq.bind(null, nextIndexBuffer));
    if (tableIndex !== undefined) {
      indexBuffer = nextIndexBuffer;
    } else {
      tableIndex = arrayFind(codeTable, eq.bind(null, indexBuffer));
      codeTable.push(nextIndexBuffer);
      codeStream.push(tableIndex);
      indexBuffer = [nextIndex];
    }
  }

  codeStream.push(arrayFind(codeTable, eq.bind(null, indexBuffer)));
  codeStream.push(eoiCode);
  return codeStream;
}