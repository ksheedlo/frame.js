'use strict';

/*global writeStream*/
/*exported lzwDecode, lzwEncode*/

/**
 * @function lzwDecode
 * Decodes a stream of encoded indices using the LZW algorithm.
 *
 * Note that this function does not decode indices from bytes as they are stored
 * in a GIF. The bytes must be decoded ahead of time.
 *
 * @param {number[]|Uint8Array|Uint16Array} codeStream - The stream of indices to decode.
 * @returns {Uint8Array} - The stream of decoded indices.
 */
function lzwDecode(codeStream) {
  var codeTable,
    indexStream = writeStream(4 * codeStream.length),
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
    indexStream.writeU8(elt);
  };

  clear();
  indexStream.writeU8((code = codeStream[1]));
  for (i = 2; i < codeStream.length; i++) {
    code = codeStream[i];
    if (code !== eoiCode) {
      if (code < codeTable.length) {
        codeTable[code].forEach(pushToIndexStream);
        codeTable.push(codeTable[codeStream[i-1]].concat([codeTable[code][0]]));
      } else {
        nextCode = codeTable[codeStream[i-1]][0];
        codeTable[codeStream[i-1]].forEach(pushToIndexStream);
        indexStream.writeU8(nextCode);
        codeTable.push(codeTable[codeStream[i-1]].concat([nextCode]));
      }
    }
  }

  return indexStream.getDataAsU8Array();
}

/**
 * @function lzwEncode
 * Encodes a stream of indices using the LZW algorithm.
 *
 * @param {number} minCodeSize - The size of the smallest possible encoded index, in bits.
 * @param {number[]|Uint8Array} indexStream - The stream of indices to encode
 * @returns {Uint16Array} The stream of encoded indices before encoding to bytes.
 */
function lzwEncode(minCodeSize, indexStream) {
  var codeStream = writeStream((indexStream.BYTES_PER_ELEMENT || 1) * indexStream.length + 100),
    codeTable,
    clear,
    clearCode = 1 << minCodeSize,
    counter,
    indexBuffer,
    i,
    eoiCode = clearCode + 1,
    nextIndex,
    nextIndexS,
    nextIndexBuffer,
    tableIndex;

  clear = function () {
    var i;

    codeTable = {};
    for (i = 0; i < clearCode; i++) {
      codeTable[String.fromCharCode(i)] = i;
    }
    codeTable[String.fromCharCode(clearCode)] = -1;
    codeTable[String.fromCharCode(eoiCode)] = null;
    counter = eoiCode + 1;
  };

  clear();
  codeStream.writeU16(clearCode);
  indexBuffer = String.fromCharCode(indexStream[0]);

  for (i = 1; i < indexStream.length; i++) {
    nextIndex = indexStream[i];
    nextIndexS = String.fromCharCode(nextIndex);
    nextIndexBuffer = indexBuffer + nextIndexS;

    if (codeTable.hasOwnProperty(nextIndexBuffer)) {
      indexBuffer = nextIndexBuffer;
    } else {
      tableIndex = codeTable[indexBuffer];
      codeTable[nextIndexBuffer] = counter;
      counter++;
      codeStream.writeU16(tableIndex);
      indexBuffer = nextIndexS;
    }
  }

  codeStream.writeU16(codeTable[indexBuffer]);
  codeStream.writeU16(eoiCode);
  return codeStream.getDataAsU16Array();
}
