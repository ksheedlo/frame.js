'use strict';

/*global describe, it, chai, dataStream, writeStream, jsArray*/
/*jshint -W030*/
describe('jsArray', function () {

  var expect = chai.expect;

  it('should create a copy of an existing array', function () {
    var foo = [1, 2, 3],
      bar = jsArray(foo);

    foo[2] = 42;
    expect(bar).to.eql([1, 2, 3]);
  });

  it('should convert the arguments object into an array', function () {
    expect((function() {
      return jsArray(arguments);
    })('test1', 'test2', 'test3')).to.eql(['test1', 'test2', 'test3']);
  });

  it('should convert typed arrays to ordinary Javascript arrays', function () {
    var bites = new Uint8Array([2, 3, 5, 7, 9]);
    expect(jsArray(bites)).to.eql([2, 3, 5, 7, 9]);
  });
});

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

describe('write streams', function () {

  var expect = chai.expect;

  it('should write the data as 8-bit unsigned integers', function () {
    var stream = writeStream(16), data;
    stream.writeU8(42);
    stream.writeU8(99);

    data = stream.getData();
    expect(data.getU8()).to.equal(42);
    expect(data.getU8()).to.equal(99);
  });

  it('should write the data as 16-bit unsigned integers', function () {
    var stream = writeStream(16), data;
    stream.writeU16(1337);
    stream.writeU16(9999);

    data = stream.getData();
    expect(data.getU16()).to.equal(1337);
    expect(data.getU16()).to.equal(9999);
  });

  it('should resize itself automatically', function () {
    var stream = writeStream(4), data;
    stream.writeU16(42);
    stream.writeU16(9999);
    stream.writeU16(31337);

    data = stream.getData();
    data.skip(4);
    expect(data.getU16()).to.equal(31337);
  });

  it('should get the data as a dataStream', function () {
    var stream = writeStream(16), data;
    stream.writeU8(0x53);
    stream.writeU8(0x57);
    stream.writeU8(0x41);
    stream.writeU8(0x47);

    data = stream.getData();
    expect(data.getString(4)).to.equal('SWAG');
  });

  it('should get the data as a Uint8Array', function () {
    var stream = writeStream(16), data;
    stream.writeU8(9);
    stream.writeU8(8);
    stream.writeU8(7);
    stream.writeU8(6);

    data = stream.getDataAsU8Array();
    expect(data[2]).to.equal(7);
  });

  it('should get the data as a Uint16Array', function () {
    var stream = writeStream(16), data;
    stream.writeU16(9999);
    stream.writeU16(31337);
    stream.writeU16(1729);

    data = stream.getDataAsU16Array();
    expect(data[1]).to.equal(31337);
  });
});
/*jshint +W030*/
