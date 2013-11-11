'use strict';

/*global dataStream, jsArray*/
/*exported parseGIF*/

function parseHeader(stream, gif) {
  var sig, flags;

  sig = stream.getString(3);

  // Skip the version, assume 89a because no one uses 87a anymore
  stream.skip(3);
  if (sig !== 'GIF') {
    throw new Error('[fr:nosig] Not a GIF file! Expected signature to be GIF, but it was ' +
      sig);
  }
  gif.width = stream.getU16();
  gif.height = stream.getU16();

  flags = stream.getU8();

  // Skip background color index and pixel aspect ratio for now.
  // They aren't that important.
  stream.skip(2);
  gif.gctf = !!(flags & (1<<7));
  gif.gctSize = (flags & 7);

  if (gif.gctf) {
    gif.gct = parseColorTable(stream, 1 << (gif.gctSize + 1));
  }
  return gif;
}

function parseColorTable(stream, entries) {
  var table = [], arr = stream.getU8Array(3*entries), i, offset;
  for (i = 0; i < entries; i++) {
    offset = 3*i;
    table.push(jsArray(arr.subarray(offset, offset+3)));
  }
  return table;
}

function parseGIF(buffer, callback) {
  var SENTINEL_EXT = 0x21,
    SENTINEL_IMG = 0x2c,
    SENTINEL_EOF = 0x3b,
    delayTime,
    disposalMethod,
    gif = {},
    stream,
    tmpCanvas = document.createElement('canvas'),
    transparency;

  stream = dataStream(buffer);

  var readSubBlocks = function () {
    var size, data = '';
    do {
      size = stream.getU8();
      data += stream.getString(size);
    } while (size !== 0);
    return data;
  };

  var parseExt = function (block) {
    var EXT_TYPE_GCE = 0xF9,
      EXT_TYPE_COMMENT = 0xFE,
      EXT_TYPE_PTE = 0x01,
      EXT_TYPE_APP = 0xFF;

    var parseGCExt = function (block) {
      var flags, transparencyGiven, transparencyIndex;

      // Skip the block size because it's always 4.
      stream.skip(1);

      // TODO(ken): libgif.js pushes a frame here. It might be a good idea for us to do the same

      flags = stream.getU8();
      disposalMethod = (flags & (7<<2)) >> 2;
      transparencyGiven = (flags & 1);
      delayTime = stream.getU16();
      transparencyIndex = stream.getU8();
      transparency = transparencyGiven ? transparencyIndex : null;
      block.terminator = stream.getU8();
    };

    // GIFs have comment extensions that don't do anything. Ignore them.
    var parseComExt = readSubBlocks;

    var parsePTExt = function () {
      // Plain text extensions aren't widely supported. If we encounter one,
      // we should skip past it without doing anything.
      stream.skip(13);
      readSubBlocks();
    };

    var parseAppExt = function (block) {
      var blockSize,
        parseNetscapeExt,
        parseUnknownAppExt;

      parseNetscapeExt = function () {
        stream.skip(2);
        gif.iterations = stream.getU16();
        stream.skip(1);
      };

      // If we don't know the application extension, we should just skip over the data
      parseUnknownAppExt = readSubBlocks;

      blockSize = stream.getU8();
      block.identifier = stream.getString(8);
      block.authCode = stream.getString(3);

      if (block.identifier === 'NETSCAPE') {
        parseNetscapeExt(block);
      } else {
        parseUnknownAppExt(block);
      }
    };

    // If we don't know the extension at all, we should also skip over the data
    var parseUnknownExt = readSubBlocks;

    block.label = stream.getU8();
    switch (block.label) {
      case EXT_TYPE_GCE:
        block.extType = 'gce';
        parseGCExt(block);
        break;
      case EXT_TYPE_COMMENT:
        block.extType = 'comment';
        parseComExt(block);
        break;
      case EXT_TYPE_PTE:
        block.extType = 'pte';
        parsePTExt(block);
        break;
      case EXT_TYPE_APP:
        block.extType = 'app';
        parseAppExt(block);
        break;
      default:
        block.extType = 'unknown';
        parseUnknownExt(block);
        break;
    }
  };

  var parseImg = function () {
    
  };

  var parseBlock = function () {
    var block = {};
    block.sentinel = stream.getU8();

    switch (block.sentinel) {
      case SENTINEL_EXT:
        block.type = 'ext';
        parseExt(block);
        break;
      case SENTINEL_IMG:
        block.type = 'img';
        parseImg(block);
        break;
      case SENTINEL_EOF:
        block.type = 'eof';
        break;
      default:
        throw new Error('[fr:unbl] Unknown block: 0x' + block.sentinel.toString(16));
    }
    
    if (block.type !== 'eof') {
      window.setTimeout(parseBlock, 0);
    } else {
      callback(gif);
    }
  };
  
  parseHeader(stream, gif);
  tmpCanvas.width = gif.width;
  tmpCanvas.height = gif.height;
  window.setTimeout(parseBlock, 0);
}

function frame() {
  var gif = {};

  // GIF API
  // gif.delay()          -- animation delay
  // gif.load()           -- loads the gif
  // gif.play(ctx)        -- plays in the given context
  // gif.save(props)      -- saves the gif, could return data or something
  // gif.frame(n, func)   -- calls the drawing function on frame n
  //                      -- could have n = 'all' for every frame
  // gif.repaint()        -- redraws the gif on the current frame immediately
  // 

  return gif;
}

window.frame = frame;
