'use strict';

/*global describe, chai, it, lzwEncode, lzwDecode*/

describe('LZW encoding', function () {

  var expect = chai.expect;

  it('should be a reversible operation', function () {
    // test taken from: http://www.matthewflickinger.com/lab/whatsinagif/lzw_image_data.asp
    // TODO: The test input is very long. It would be nice to have a shorter
    // example that works and is proven.
    var data = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
      1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2,
      1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1,
      2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
      2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1];
    var code = lzwEncode(2, new Uint8Array(data));
    expect(lzwDecode(new Uint8Array(code))).to.eql(data);

    data = [19, 17, 18, 14, 28, 36, 36, 19, 36, 4, 7, 43, 50, 14, 4, 8, 2, 42, 6,
      38, 48, 53, 30, 43, 55, 9, 23, 29, 19, 7, 25, 63, 39, 58, 14, 48, 29, 1,
      48, 59, 3, 6, 4, 30, 13, 37, 4, 23, 48, 3, 13, 25, 43, 51, 2, 36, 7, 17, 53,
      53, 6, 55, 26, 14];
    code = lzwEncode(6, new Uint8Array(data));
    expect(lzwDecode(new Uint8Array(code))).to.eql(data);

    data = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0];
    code = lzwEncode(2, new Uint8Array(data));
    expect(lzwDecode(new Uint8Array(code))).to.eql(data);
  });

  it('should encode data', function () {
    var code = lzwEncode(1, new Uint8Array([0, 1, 0, 1, 0, 1, 0, 1, 0]));
    expect(code).to.eql([2, 0, 1, 4, 6, 5, 3]);

    code = lzwEncode(2, new Uint8Array([1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
      1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2,
      1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1,
      2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
      2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1]));
    expect(code).to.eql([4, 1, 6, 6, 2, 9, 9, 7, 8, 10, 2, 12, 1, 14,
      15, 6, 0, 21, 0, 10, 7, 22, 23, 18, 26, 7, 10, 29, 13, 24, 12, 18, 16, 36,
      12, 5]);
  });
});

describe('LZW decoding', function () {

  var expect = chai.expect;

  it('should decode data', function () {
    var code = lzwDecode(new Uint8Array([2, 0, 1, 4, 6, 5, 3]));
    expect(code).to.eql([0, 1, 0, 1, 0, 1, 0, 1, 0]);

    code = lzwDecode(new Uint8Array([4, 1, 6, 6, 2, 9, 9, 7, 8, 10, 2, 12, 1, 14,
      15, 6, 0, 21, 0, 10, 7, 22, 23, 18, 26, 7, 10, 29, 13, 24, 12, 18, 16, 36,
      12, 5]));
    expect(code).to.eql([1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
      1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2,
      1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1,
      2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
      2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1]);
  });
});