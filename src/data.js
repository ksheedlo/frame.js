'use strict';

/*exported dataStream, writeStream, jsArray, arrayFind*/

var ArrayBuffer_ = window.ArrayBuffer,
  DataView_ = window.DataView,
  Uint8Array_ = window.Uint8Array,
  Uint16Array_ = window.Uint16Array;

function arrayFind(arr, test) {
  var ctx = {};
  arr.forEach(function (elt, i) {
    if (this.index === undefined && test(elt)) {
      this.index = i;
    }
  }, ctx);
  return ctx.index;
}

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

function writeStream(size) {
  var view, offset = 0,
    getData,
    getDataAsU8Array,
    getDataAsU16Array,
    resize,
    writeU8,
    writeU16;

  size = size || 1048576;
  view = new DataView_(new ArrayBuffer_(size));

  resize = function () {
    var buf = new ArrayBuffer_(size * 2),
      tmpArray,
      targetArray,
      resizedView;

    tmpArray = new Uint8Array_(view.buffer);
    resizedView = new DataView_(buf);
    targetArray = new Uint8Array_(resizedView.buffer);
    targetArray.set(tmpArray);
    size = size * 2;
    view = resizedView;
  };

  writeU8 = function (val) {
    try {
      view.setUint8(offset, val);
      offset++;
    } catch (e) {
      resize(size * 2);
      view.setUint8(offset, val);
      offset++;
    }
  };

  writeU16 = function (val) {
    try {
      view.setUint16(offset, val);
      offset += 2;
    } catch (e) {
      resize(size * 2);
      view.setUint16(offset, val);
      offset += 2;
    }
  };

  getData = function () {
    var buf = new ArrayBuffer_(offset),
      tmpArray,
      targetArray;

    tmpArray = new Uint8Array_(view.buffer, 0, offset);
    targetArray = new Uint8Array_(buf);
    targetArray.set(tmpArray);
    return dataStream(buf);
  };

  getDataAsU8Array = function () {
    var buf = new ArrayBuffer_(offset),
      array,
      tmpArray;

    tmpArray = new Uint8Array_(view.buffer, 0, offset);
    array = new Uint8Array_(buf);
    array.set(tmpArray);
    return array;
  };

  getDataAsU16Array = function () {
    var buf = new ArrayBuffer_(offset),
      array,
      tmpArray;

    tmpArray = new Uint16Array_(view.buffer, 0, Math.ceil(offset/2));
    array = new Uint16Array_(buf);
    array.set(tmpArray);
    return array;
  };

  return {
    writeU8: writeU8,
    writeU16: writeU16,
    getData: getData,
    getDataAsU16Array: getDataAsU16Array,
    getDataAsU8Array: getDataAsU8Array
  };
}

function jsArray(typedArray) {
  return Array.prototype.slice.call(typedArray, 0);
}
