'use strict';

/*global describe, it, chai, dataStream, jsArray*/
/*jshint -W030*/

describe('data streams', function () {
  
  var expect = chai.expect;

  it('should be created from a string', function () {
    var stream = dataStream('SWAG');
    expect(stream).to.exist;
  });

  it('should be created from an ArrayBuffer', function () {
    var stream = dataStream(new ArrayBuffer(10));
    expect(stream).to.exist;
  });

  it('should get the next byte from the stream', function () {
    var stream = dataStream('SWAG');
    expect(stream.getU8()).to.equal(0x53);
    expect(stream.getU8()).to.equal(0x57);
  });

  it('should get the next 16-bit unsigned value from the stream', function () {
    var arr = new Uint16Array([1337, 31337]), stream;
    stream = dataStream(arr.buffer);
    expect(stream.getU16()).to.equal(1337);
    expect(stream.getU16()).to.equal(31337);
  });

  it('should get a byte array from the stream', function () {
    var arr = new Uint8Array([1, 2, 3, 4, 5, 6]), stream;
    stream = dataStream(arr.buffer);
    expect(jsArray(stream.getU8Array(4))).to.eql([1, 2, 3, 4]);
    expect(jsArray(stream.getU8Array(2))).to.eql([5, 6]);
  });

  it('should get a string from the stream', function () {
    var stream = dataStream('SWAGSWAG');
    stream.skip(1);
    expect(stream.getString(4)).to.equal('WAGS');
  });

  it('should throw an exception when reading past the end of the stream', function () {
    var stream = dataStream('YOLO');
    stream.skip(4);
    expect(function () {
      stream.getU8();
    }).to.throw();
  });

  it('should skip bytes', function () {
    var stream = dataStream('SWAG');
    stream.getU8();
    stream.skip(1);
    expect(stream.getU8()).to.equal(0x41);
  });

  it('should convert a typed array to a JS array', function () {
    var arr = new Uint8Array([1, 2, 3]);
    expect(jsArray(arr)).to.eql([1, 2, 3]);
  });
});
/*jshint +W030*/

