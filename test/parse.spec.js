'use strict';

/*global describe, it, chai, dataStream, parseColorTable, parseHeader, parseGIF*/
/*jshint -W030*/

describe('parseColorTable', function () {

  var expect = chai.expect;

  it('should parse the color table', function () {
    var stream = dataStream('\xFF\x00\x00\x00\xFF\x00\x00\x00\xFF');
    expect(parseColorTable(stream, 3)).to.eql([[0xFF, 0, 0], [0, 0xFF, 0], [0, 0, 0xFF]]);
  });

  it('should advance the stream by 3 times the number of entries', function () {
    var stream = dataStream('\xFF\x00\x00\x00\xFF\x00\x99');
    parseColorTable(stream, 2);
    expect(stream.getU8()).to.equal(0x99);
  });
});

describe('parseHeader', function () {

  var expect = chai.expect;
  
  it('should throw an error if the file is not a GIF', function () {
    var stream = dataStream('LOL9001a');
    expect(function () {
      parseHeader(stream, {});
    }).to.throw(/\[fr:nosig\]/);
  });

  it('should get the width and height', function () {
    var stream = dataStream('GIF89a\x39\x05\x2A\x00\x00xx'), gif = {};
    parseHeader(stream, gif);
    expect(gif.width).to.equal(1337);
    expect(gif.height).to.equal(42);
  });

  it('should get the global color table flag', function () {
    var stream = dataStream('GIF89a\x39\x05\x2A\x00\x00xx'), gif = {};
    parseHeader(stream, gif);
    expect(gif.gctf).to.be.false;
  });

  it('should parse the global color table', function () {
    var stream = dataStream('GIF89a\x39\x05\x2A\x00\x81xx' +
      '\x11\x22\x33\x22\x33\x44\x33\x44\x55\x44\x55\x66\x99'),
      gif = {};
    parseHeader(stream, gif);
    expect(gif.gctf).to.be.true;
    expect(gif.gct).to.eql([
      [0x11, 0x22, 0x33],
      [0x22, 0x33, 0x44],
      [0x33, 0x44, 0x55],
      [0x44, 0x55, 0x66]
    ]);
    expect(stream.getU8()).to.equal(0x99);
  });
});

describe('parseGIF', function () {

  var prefix = 'GIF89a\x39\x05\x2A\x00\x81xx\x11\x22\x33\x22\x33\x44\x33\x44' +
   '\x55\x44\x55\x66',
   expect = chai.expect;

  it('should get the number of iterations', function (done) {
    // 0x2329 === 9001
    var stream = prefix + '\x21\xFF\x0BNETSCAPE2.0\x03\x01\x29\x23\x00;';
    parseGIF(stream, function (gif) {
      expect(gif.iterations).to.equal(9001);
      done();
    });
  });

  it('should skip over comment extension blocks', function (done) {
    var stream = prefix + '\x21\xFE\x08SWAGSWAG\x00' +
      '\x21\xFF\x0BNETSCAPE2.0\x03\x01\x29\x23\x00;';
    parseGIF(stream, function (gif) {
      // if the comment extension was skipped over correctly, then gif.iterations
      // will be 9001 as before.
      expect(gif.iterations).to.equal(9001);
      done();
    });
  });

  it('should skip over plain text extension blocks', function (done) {
    var stream = prefix + '\x21\x01\x0CSWAGSWAGSWAG\x04YOLO\x05LMFAO\x00' +
      '\x21\xFF\x0BNETSCAPE2.0\x03\x01\x29\x23\x00;';
    parseGIF(stream, function (gif) {
      expect(gif.iterations).to.equal(9001);
      done();
    });
  });

  it('should skip over unknown extensions', function (done) {
    var stream = prefix + '\x21\x99\x0Bunicornswag\x00' +
      '\x21\xFF\x0BNETSCAPE2.0\x03\x01\x29\x23\x00;';
    parseGIF(stream, function (gif) {
      expect(gif.iterations).to.equal(9001);
      done();
    });
  });

  it('should skip over unknown application extensions', function (done) {
    var stream = prefix + '\x21\xFF\x0BUNICORNS2.0\x04SWAG\x03LOL\x00' +
      '\x21\xFF\x0BNETSCAPE2.0\x03\x01\x29\x23\x00;';
    parseGIF(stream, function (gif) {
      expect(gif.iterations).to.equal(9001);
      done();
    });
  });
});
/*jshint +W030*/
