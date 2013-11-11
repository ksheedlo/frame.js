'use strict';

/*exported dataStream, jsArray*/

var ArrayBuffer_ = window.ArrayBuffer,
  DataView_ = window.DataView,
  Uint8Array_ = window.Uint8Array;

function stringToDataView(s) {
  var view = new DataView_(new ArrayBuffer_(s.length)), i, arr;

  arr = new Uint8Array_(view.buffer);
  for (i = 0; i < s.length; i++) {
    arr[i] = s.charCodeAt(i);
  }
  return view;
}

function dataStream(data) {
  var view,
    offset = 0,
    getU8,
    getU16,
    getU8Array,
    getString,
    skip;

  if (typeof data === 'string') {
    view = stringToDataView(data);
  } else {
    // assume data is already an ArrayBuffer
    view = new DataView_(data);
  }

  getU8 = function () {
    var v = view.getUint8(offset);
    offset++;
    return v;
  };

  getU16 = function () {
    var v = view.getUint16(offset, true);
    offset += 2;
    return v;
  };

  getU8Array = function (length) {
    var arr = new Uint8Array_(view.buffer, offset, length);
    offset += length;
    return arr;
  };

  getString = function (length) {
    var arr = new Uint8Array_(view.buffer, offset, length);
    offset += length;
    return String.fromCharCode.apply(String, arr);
  };

  skip = function (bytes) {
    offset += bytes;
  };

  return {
    getU8: getU8,
    getU16: getU16,
    getU8Array: getU8Array,
    getString: getString,
    skip: skip
  };
}

function jsArray(typedArray) {
  return Array.prototype.slice.call(typedArray, 0);
}
