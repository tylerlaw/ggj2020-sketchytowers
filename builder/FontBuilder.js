"use strict";
/** @file lang.ts */
//#endregion
//#region Size Of
/**
 * The byte length of various primitive numerical data types.
 */
var ByteLength;
(function (ByteLength) {
    /** Size of boolean */
    ByteLength[ByteLength["boolean"] = 1] = "boolean";
    /** Size of byte */
    ByteLength[ByteLength["byte"] = 1] = "byte";
    /** Size of ubyte */
    ByteLength[ByteLength["ubyte"] = 1] = "ubyte";
    /** Size of short */
    ByteLength[ByteLength["short"] = 2] = "short";
    /** Size of ushort */
    ByteLength[ByteLength["ushort"] = 2] = "ushort";
    /** Size of int */
    ByteLength[ByteLength["int"] = 4] = "int";
    /** Size of uint */
    ByteLength[ByteLength["uint"] = 4] = "uint";
    /** Size of float */
    ByteLength[ByteLength["float"] = 4] = "float";
    /** Size of double */
    ByteLength[ByteLength["double"] = 8] = "double";
    /** Size of an 8-bit char */
    ByteLength[ByteLength["char"] = 1] = "char";
    /** Size of a 16-bit unicode char */
    ByteLength[ByteLength["wchar"] = 2] = "wchar";
    /** Size of number */
    ByteLength[ByteLength["number"] = 8] = "number";
})(ByteLength || (ByteLength = {}));
/**
 * The various types that a number can be interpreted as.
 */
var NumberDataType;
(function (NumberDataType) {
    /** 8-bit signed byte, Int8 */
    NumberDataType[NumberDataType["byte"] = 0] = "byte";
    /** 8-bit unsigned byte, Uint8 */
    NumberDataType[NumberDataType["ubyte"] = 1] = "ubyte";
    /** 16-bit signed short, Int16 */
    NumberDataType[NumberDataType["short"] = 2] = "short";
    /** 16-bit unsigned short, Uint16 */
    NumberDataType[NumberDataType["ushort"] = 3] = "ushort";
    /** 32-bit signed int, Int32 */
    NumberDataType[NumberDataType["int"] = 4] = "int";
    /** 32-bit unsigned int, Uint32 */
    NumberDataType[NumberDataType["uint"] = 5] = "uint";
    /** 32-bit floating point decimal value, Float32 */
    NumberDataType[NumberDataType["float"] = 6] = "float";
    /** 64-bit floating point decimal value, Float64 */
    NumberDataType[NumberDataType["double"] = 7] = "double";
})(NumberDataType || (NumberDataType = {}));
//#endregion
/** @file ByteArray.ts */
/// <reference path="../lang/lang.ts" />
/**
 * The ByteArray class provides methods and properties to optimize reading, writing, and working with binary data.
 * ByteArray advantage over DataView is that it expands as needed and has handy methods for writing types as Ts devs think of them.
 */
var ByteArray = /** @class */ (function () {
    /** Unified Constructor. */
    function ByteArray(arg1) {
        if (arg1 === void 0) { arg1 = 0; }
        /** Changes or reads the byte order for the data. Default false. */
        this.littleEndian = false;
        this._position = 0;
        if (typeof arg1 === "number") {
            var length_1 = arg1;
            this._length = length_1;
            this._buffer = new ArrayBuffer(this._length > 0 ? this._length : 128); // Give it an initial size if no length is requested, this will give us a little wiggle room before expanding
            this._view = new DataView(this._buffer, 0);
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
        else {
            var arrayBuffer = arg1;
            this._length = arrayBuffer.byteLength;
            this._buffer = arrayBuffer;
            this._view = new DataView(this._buffer, 0);
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
    }
    Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
        //#endregion
        //#region Members
        /** The number of bytes of data available for reading from the current position in the byte array to the end of the array. */
        get: function () { return this._length - this._position; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "length", {
        /** The length of the ByteArray object, in bytes. If the length is set to a value that is larger than the current length, the right side of the byte array is filled with zeros. If the length is set to a value that is smaller than the current length, the byte array is truncated. */
        get: function () { return this._length; },
        set: function (v) { this.setByteLength(v); this._length = v; this._position = this._position < v ? this._position : v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "position", {
        /** Moves, or returns the current position, in bytes, of the file pointer into the ByteArray object. */
        get: function () { return this._position; },
        set: function (v) { this._position = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "bytes", {
        /** The actual set of bytes, provides index access to the data. */
        get: function () { return this._bytes; },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Read
    /**
     * Reads a signed byte from the byte stream.
     * Returns values in the range -128 to 127.
     * @returns The read value.
     * @throws Error if there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readByte = function () { return this.read(0 /* byte */, 1 /* byte */); };
    /**
     * Reads an unsigned byte from the byte stream.
     * Returns values in the range 0 to 255.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readUnsignedByte = function () { return this.read(1 /* ubyte */, 1 /* ubyte */); };
    /**
     * Reads a signed 16-bit short (integer) from the byte stream.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readShort = function () { return this.read(2 /* short */, 2 /* short */); };
    /**
     * Reads an unsigned 16-bit short (integer) from the byte stream.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readUnsignedShort = function () { return this.read(3 /* ushort */, 2 /* ushort */); };
    /**
     * Reads a signed 32-bit integer from the byte stream.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readInt = function () { return this.read(4 /* int */, 4 /* int */); };
    /**
     * Reads an unsigned 32-bit integer from the byte stream.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readUnsignedInt = function () { return this.read(5 /* uint */, 4 /* uint */); };
    /**
     * Reads a 32-bit floating point (decimal) value from the byte stream.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readFloat = function () { return this.read(6 /* float */, 4 /* float */); };
    /**
     * Reads a 64-bit floating point (decimal) value from the byte stream.
     * This is equivalent to javascript's number type.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readDouble = function () { return this.read(7 /* double */, 8 /* double */); };
    /**
     * Reads an 8-bit boolean (ubyte) from the byte stream.
     * The byte is considered true if it does not equal 0.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readBoolean = function () { return this.read(1 /* ubyte */, 1 /* ubyte */) !== 0; };
    /**
     * Reads an 8-bit character (ubyte) from the byte stream.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readChar = function () { return String.fromCharCode(this.read(1 /* ubyte */, 1 /* char */)); };
    /**
     * Reads an 8-bit character string from the byte stream.
     * Expects the characters to be prefixed with the string length as an unsigned short.
     * The characters are encoded as 8-bit ubyte values (utf-8 char codes).
     * Max string length is 65535, the max value of ushort.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readString = function () {
        if (this._position <= this._length) {
            var strLength = this._view.getUint16(this._position, this.littleEndian);
            var byteLength = strLength * 1 /* char */ + 2 /* ushort */;
            if (this._position + byteLength <= this._length) {
                // NOTE: we should not need to call slice here because characters are a uint8array as well
                var start = this._position + 2 /* ushort */;
                var end = this._position + 2 /* ushort */ + strLength * 1 /* char */;
                var length_2 = end - start;
                var charCodes = new Uint8Array(this._buffer, start, length_2);
                this._position += byteLength;
                return this.decodeString(charCodes);
            }
        }
        throw new Error(ByteArray.EOF_ERROR_MSG);
    };
    /**
     * Reads a fixed length 8-bit character string.
     * The characters are encoded as 8-bit ubyte values (utf-8 char codes).
     * Max string length is 65535, the max value of ushort.
     * @param strLength The string length.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readFixedString = function (strLength) {
        var byteLength = strLength * 1 /* char */;
        if (this._position + byteLength <= this._length) {
            // NOTE: we should not need to call slice here because characters are a uint8array as well
            //const charCodes:Uint8Array = new Uint8Array(this._buffer.slice(this._position, this._position + strLength * ByteLength.char));
            var start = this._position;
            var end = this._position + strLength * 1 /* char */;
            var length_3 = end - start;
            var charCodes = new Uint8Array(this._buffer, start, length_3);
            this._position += byteLength;
            return this.decodeString(charCodes);
        }
        else {
            throw new Error(ByteArray.EOF_ERROR_MSG);
        }
    };
    /**
     * Reads a 16-bit character (ushort) from the byte stream.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readUnicodeChar = function () { return String.fromCharCode(this.read(3 /* ushort */, 2 /* wchar */)); };
    /**
     * Reads a 16-bit character string from the byte stream.
     * Expects the characters to be prefixed with the string length as an unsigned short.
     * The characters are encoded as 16-bit ushort values (char codes).
     * Max string length is 65535, the max value of ushort.
     * @returns The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readUnicodeString = function () {
        if (this._position <= this._length) {
            var strLength = this._view.getUint16(this._position, this.littleEndian);
            var byteLength = strLength * 2 /* wchar */ + 2 /* ushort */;
            if (this._position + byteLength <= this._length) {
                // NOTE: string concatenation is really slow, but this is an easy way to read a unicode string without having to copy the buffer
                // this could probably be made faster using a buffer copy and a chunked text decoding, but screw it until we need fast unicode support
                this._position += 2 /* short */; // skip the length
                var str = "";
                for (var i = 0; i < strLength; ++i) {
                    str += this.readUnicodeChar();
                }
                return str;
            }
        }
        throw new Error(ByteArray.EOF_ERROR_MSG);
    };
    /**
     * Reads a fixed length 16-bit character string.
     * The characters are encoded as 16-bit ushort values (char codes).
     * Max string length is 65535, the max value of ushort.
     * @param strLength The string length.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readFixedUnicodeString = function (strLength) {
        var byteLength = strLength * 2 /* wchar */;
        if (this._position + byteLength <= this._length) {
            // NOTE: string concatenation is really slow, but this is an easy way to read a unicode string without having to copy the buffer
            // this could probably be made faster using a buffer copy and a chunked text decoding, but screw it until we need fast unicode support
            var str = "";
            for (var i = 0; i < strLength; ++i) {
                str += this.readUnicodeChar();
            }
            return str;
        }
        else {
            throw new Error(ByteArray.EOF_ERROR_MSG);
        }
    };
    /**
     * Reads a fixed number of bytes from the byte array.
     * @param numBytes The number of bytes to read.
     * @return The read value.
     * @throws Error If there isn't enough data in the stream to read the value.
     */
    ByteArray.prototype.readBytes = function (numBytes) {
        if (this._position + numBytes <= this._length) {
            var bytes = new Uint8Array(this._bytes.subarray(this._position, this._position + numBytes));
            this._position += numBytes;
            return bytes;
        }
        else {
            throw new Error(ByteArray.EOF_ERROR_MSG);
        }
    };
    //#endregion
    //#region Write
    /**
     * Writes an 8-bit signed byte to the byte stream.
     * @param v The byte to write.
     */
    ByteArray.prototype.writeByte = function (v) { this.write(0 /* byte */, 1 /* byte */, v); };
    /**
     * Writes an 8-bit unsigned byte to the byte stream.
     * @param v The ubyte to write.
     */
    ByteArray.prototype.writeUnsignedByte = function (v) { this.write(1 /* ubyte */, 1 /* ubyte */, v); };
    /**
     * Writes a 16-bit signed short (integer) to the byte stream.
     * @param v The value to write.
     */
    ByteArray.prototype.writeShort = function (v) { this.write(2 /* short */, 2 /* short */, v); };
    /**
     * Writes a 16-bit unsigned short (integer) to the byte stream.
     * @param v The value to write.
     */
    ByteArray.prototype.writeUnsignedShort = function (v) { this.write(3 /* ushort */, 2 /* ushort */, v); };
    /**
     * Writes a 32-bit signed integer to the byte stream.
     * @param v The value to write.
     */
    ByteArray.prototype.writeInt = function (v) { this.write(4 /* int */, 4 /* int */, v); };
    /**
     * Writes a 32-bit unsigned integer to the byte stream.
     * @param v The value to write.
     */
    ByteArray.prototype.writeUnsignedInt = function (v) { this.write(5 /* uint */, 4 /* uint */, v); };
    /**
     * Writes a 32-bit floating point (decimal) value to the byte stream.
     * @param v The value to write.
     */
    ByteArray.prototype.writeFloat = function (v) { this.write(6 /* float */, 4 /* float */, v); };
    /**
     * Writes a 64-bit floating point (decimal) value to the byte stream.
     * @param v The value to write.
     */
    ByteArray.prototype.writeDouble = function (v) { this.write(7 /* double */, 8 /* double */, v); };
    /**
     * Writes a boolean to the byte stream as an 8-bit unsigned byte (0 = false, 1 = true).
     * @param v The value to write.
     */
    ByteArray.prototype.writeBoolean = function (v) { this.write(1 /* ubyte */, 1 /* ubyte */, v ? 1 : 0); };
    /**
     * Writes an 8-bit character to the byte stream.
     * If the char is a string of length > 1, only the first character is written.
     * @param v The value to write.
     * @throws Error if the char string length is 0.
     */
    ByteArray.prototype.writeChar = function (v) { if (v.length < 1)
        throw new Error("Value length must be > 0!"); this.write(1 /* ubyte */, 1 /* char */, v.charCodeAt(0)); };
    /**
     * Writes an 8-bit character string to the byte stream.
     * Prefixes the characters with an unsigned short of the string length.
     * @param v The value to write.
     */
    ByteArray.prototype.writeString = function (v) {
        var byteLength = v.length * 1 /* char */ + 2 /* ushort */;
        if (this._position + byteLength > this._buffer.byteLength)
            this.expand(this._position + byteLength);
        this._view.setUint16(this._position, v.length, this.littleEndian);
        for (var i = 0; i < v.length; ++i) {
            this._view.setUint8(this._position + 2 /* ushort */ + i * 1 /* char */, v.charCodeAt(i));
        }
        this._position += byteLength;
        if (this._position > this._length) {
            this._length = this._position;
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
    };
    /**
     * Writes a fixed length 8-bit character string to the byte stream.
     * Does not prefix the string length.
     * @param v The string to write.
     */
    ByteArray.prototype.writeFixedString = function (v) {
        var byteLength = v.length * 1 /* char */;
        if (this._position + byteLength > this._buffer.byteLength)
            this.expand(this._position + byteLength);
        for (var i = 0; i < v.length; ++i) {
            this._view.setUint8(this._position + i * 1 /* char */, v.charCodeAt(i));
        }
        this._position += byteLength;
        if (this._position > this._length) {
            this._length = this._position;
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
    };
    /**
     * Writes a 16-bit character to the byte stream.
     * If the char is a string of length > 1, only the first character is written.
     * @param v The value to write.
     * @throws Error if the char string length is 0.
     */
    ByteArray.prototype.writeUnicodeChar = function (v) { if (v.length < 1)
        throw new Error("Value length must be > 0!"); this.write(3 /* ushort */, 2 /* wchar */, v.charCodeAt(0)); };
    /**
     * Writes a 16-bit character string to the byte stream.
     * Prefixes the characters with an unsigned short of the string length.
     * @param v The value to write.
     */
    ByteArray.prototype.writeUnicodeString = function (v) {
        var byteLength = v.length * 2 /* wchar */ + 2 /* ushort */;
        if (this._position + byteLength > this._buffer.byteLength)
            this.expand(this._position + byteLength);
        this._view.setUint16(this._position, v.length, this.littleEndian);
        for (var i = 0; i < v.length; ++i) {
            this._view.setUint16(this._position + 2 /* ushort */ + i * 2 /* wchar */, v.charCodeAt(i), this.littleEndian);
        }
        this._position += byteLength;
        if (this._position > this._length) {
            this._length = this._position;
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
    };
    /**
     * Writes a fixed length 16-bit character string to the byte stream.
     * Does not prefix the string length.
     * @param v The string to write.
     */
    ByteArray.prototype.writeFixedUnicodeString = function (v) {
        var byteLength = v.length * 2 /* wchar */;
        if (this._position + byteLength > this._buffer.byteLength)
            this.expand(this._position + byteLength);
        for (var i = 0; i < v.length; ++i) {
            this._view.setUint16(this._position + i * 2 /* wchar */, v.charCodeAt(i), this.littleEndian);
        }
        this._position += byteLength;
        if (this._position > this._length) {
            this._length = this._position;
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
    };
    /**
     * Writes a the supplied bytes to the byte stream
     * @param bytes The bytes to write.
     */
    ByteArray.prototype.writeBytes = function (bytes) {
        if (this._position + bytes.length > this._buffer.byteLength)
            this.expand(this._position + bytes.length);
        if (this._position + bytes.length > this._length) {
            this._length = this._position + bytes.length;
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
        this._bytes.set(bytes, this._position);
        this._position += bytes.length;
    };
    //#endregion
    //#region Helpers
    /**
     * Reads a number value from the buffer and advances the position.
     * @param format The format of the number.
     * @param byteLength The number of bytes in the number.
     */
    ByteArray.prototype.read = function (format, byteLength) {
        if (this._position + byteLength <= this._length) {
            var v = void 0;
            if (format === 1 /* ubyte */)
                v = this._view.getUint8(this._position);
            else if (format === 3 /* ushort */)
                v = this._view.getUint16(this._position, this.littleEndian);
            else if (format === 5 /* uint */)
                v = this._view.getUint32(this._position, this.littleEndian);
            else if (format === 0 /* byte */)
                v = this._view.getInt8(this._position);
            else if (format === 2 /* short */)
                v = this._view.getInt16(this._position, this.littleEndian);
            else if (format === 4 /* int */)
                v = this._view.getInt32(this._position, this.littleEndian);
            else if (format === 6 /* float */)
                v = this._view.getFloat32(this._position, this.littleEndian);
            else if (format === 7 /* double */)
                v = this._view.getFloat64(this._position, this.littleEndian);
            this._position += byteLength;
            return v;
        }
        else {
            throw new Error("There is not sufficient data available to read.");
        }
    };
    /**
     * Writes a number value to the buffer, expanding if necessary, and advances the position.
     * @param format The format of the number.
     * @param byteLength The number of bytes in the number.
     * @param v The value to write.
     */
    ByteArray.prototype.write = function (format, byteLength, v) {
        if (this._position + byteLength > this._buffer.byteLength)
            this.expand(this._position + byteLength);
        if (format === 1 /* ubyte */)
            this._view.setUint8(this._position, v);
        else if (format === 3 /* ushort */)
            this._view.setUint16(this._position, v, this.littleEndian);
        else if (format === 5 /* uint */)
            this._view.setUint32(this._position, v, this.littleEndian);
        else if (format === 0 /* byte */)
            this._view.setInt8(this._position, v);
        else if (format === 2 /* short */)
            this._view.setInt16(this._position, v, this.littleEndian);
        else if (format === 4 /* int */)
            this._view.setInt32(this._position, v, this.littleEndian);
        else if (format === 6 /* float */)
            this._view.setFloat32(this._position, v, this.littleEndian);
        else if (format === 7 /* double */)
            this._view.setFloat64(this._position, v, this.littleEndian);
        this._position += byteLength;
        if (this._position > this._length) {
            this._length = this._position;
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
    };
    /**
     * Expands the buffer, if needed, to fit the required size in bytes.
     * Grows the buffer by an amount that may be larger than the size requested.
     * @param byteLength The required buffer size in bytes.
     */
    ByteArray.prototype.expand = function (byteLength) {
        this.setByteLength(((byteLength + 1) * 3) >> 1);
    };
    /**
     * Sets the size of the buffer.
     * @param byteLength The new size of the buffer in bytes
     */
    ByteArray.prototype.setByteLength = function (byteLength) {
        if (byteLength > this._buffer.byteLength) {
            // grow and fill with 0
            var buffer = new ArrayBuffer(byteLength); // Filled with 0 when created
            // Copy the data from the existing buffer
            var copyFrom = new Uint8Array(this._buffer);
            var copyTo = new Uint8Array(buffer);
            copyTo.set(copyFrom);
            // Update buffer and view
            this._buffer = buffer;
            this._view = new DataView(this._buffer);
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
        else if (byteLength < this._buffer.byteLength) {
            // truncate
            if (Uint8Array.prototype.slice) {
                this._buffer = this._buffer.slice(0, byteLength);
            }
            else {
                // @see - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice
                this._buffer = new Uint8Array(Array.prototype.slice.call(this, 0, byteLength));
            }
            this._view = new DataView(this._buffer);
            this._bytes = new Uint8Array(this._buffer, 0, this._length);
        }
    };
    /**
     * Decodes a uint8array into a utf8 string.
     * @param charCodes The char codes to decode.
     */
    ByteArray.prototype.decodeString = function (charCodes) {
        var str = "";
        var chunkSize = 8192; // arbitrary number, must be less than max stack size
        for (var i = 0; i < charCodes.length; i += chunkSize) {
            var end = i + chunkSize;
            if (end > charCodes.length)
                end = charCodes.length;
            str += String.fromCharCode.apply(null, charCodes.subarray(i, end));
        }
        return str;
    };
    //#region Constants
    /** The error message when the byte array has attempted to read past the length of the data. */
    ByteArray.EOF_ERROR_MSG = "There is not sufficient data available to read.";
    return ByteArray;
}());
/** @file TTF.ts */
/// <reference path="../../../engine/src/ts/util/ByteArray.ts" />
/* tslint:disable:completed-docs */
/**
 * Parses a True Type Font from an array buffer.
 * @see http://stevehanov.ca/blog/index.php?id=143
 */
var TTF = /** @class */ (function () {
    function TTF(arrayBuffer) {
        this.file = new TTF.Buffer(new ByteArray(arrayBuffer));
        this.tables = this.readOffsetTables();
        this.readHeadTable(this.file);
        this.length = this.glyphCount();
        this.fsType = this.readfsType();
        var table = this.tables["hhea"];
        var file = this.file;
        file.pos = table.offset;
        // https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6hhea.html
        this.getFixed(file); // version
        this.ascent = this.getFword(file); // ascent
        this.descent = this.getFword(file); // descent
        //file.getUint16(); 						// usWidthClass
        this.computedAscent = this.ascent / this.unitsPerEm;
        this.computedDescent = this.descent / this.unitsPerEm;
        //console.log(this);
    }
    TTF.prototype.getFixed = function (file) {
        return file.getInt32() / (1 << 16);
    };
    TTF.prototype.getFword = function (file) {
        return file.getInt16();
    };
    TTF.prototype.get2Dot14 = function (file) {
        return file.getInt16() / (1 << 14);
    };
    TTF.prototype.glyphCount = function () {
        if (!("maxp" in this.tables))
            throw new Error("Missing maxp table!");
        var old = this.file.seek(this.tables["maxp"].offset + 4);
        var count = this.file.getUint16();
        this.file.seek(old);
        return count;
    };
    TTF.prototype.readOffsetTables = function () {
        var file = this.file;
        var tables = {};
        this.scalarType = file.getUint32();
        var numTables = file.getUint16();
        this.searchRange = file.getUint16();
        this.entrySelector = file.getUint16();
        this.rangeShift = file.getUint16();
        for (var i = 0; i < numTables; i++) {
            var tag = file.getString(4);
            tables[tag] =
                {
                    checksum: file.getUint32(),
                    offset: file.getUint32(),
                    length: file.getUint32()
                };
            if (tag !== "head") {
                if (this.calculateTableChecksum(file, tables[tag].offset, tables[tag].length) !== tables[tag].checksum) {
                    //throw new Error("Checksum failed! " + tag);
                    //throw new Error("Checksum failed: " + tag);
                    // TODO: FUTURE- do browsers care if the checksum fails?
                }
            }
        }
        return tables;
    };
    TTF.prototype.readfsType = function () {
        var table = this.tables["OS/2"];
        var file = this.file;
        file.pos = table.offset;
        // based on https://docs.microsoft.com/en-us/typography/opentype/spec/os2
        file.getUint16(); // version
        file.getInt16(); // xAvgCharWidth
        file.getUint16(); // usWeightClass
        file.getUint16(); // usWidthClass
        var fsType = file.getInt16(); // fsType
        return fsType;
    };
    /*
    public setFSType(v:number):void
    {
        const table:TTF.FontOffsetTable = this.tables["OS/2"];

        const file:TTF.Buffer = this.file;
        file.pos = table.offset;

        // based on https://docs.microsoft.com/en-us/typography/opentype/spec/os2
        file.getUint16();	// version
        file.getInt16();	// xAvgCharWidth
        file.getUint16();	// usWeightClass
        file.getUint16();	// usWidthClass
        file.putInt16(v);	// fsType
    }
    */
    TTF.prototype.calculateTableChecksum = function (file, offset, length) {
        var old = file.seek(offset);
        var sum = 0;
        var nlongs = ((length + 3) / 4) | 0;
        while (nlongs--) {
            sum = (sum + file.getUint32() & 0xffffffff) >>> 0;
        }
        file.seek(old);
        return sum;
    };
    TTF.prototype.readHeadTable = function (file) {
        if (!("head" in this.tables))
            throw new Error("no head table!");
        file.seek(this.tables["head"].offset);
        this.version = this.getFixed(file);
        this.fontRevision = this.getFixed(file);
        this.checksumAdjustment = file.getUint32();
        this.magicNumber = file.getUint32();
        if (this.magicNumber !== 0x5f0f3cf5)
            throw new Error("Magic number is off!");
        this.flags = file.getUint16();
        this.unitsPerEm = file.getUint16();
        this.created = file.getDate();
        this.modified = file.getDate();
        this.xMin = this.getFword(file);
        this.yMin = this.getFword(file);
        this.xMax = this.getFword(file);
        this.yMax = this.getFword(file);
        this.macStyle = file.getUint16();
        this.lowestRecPPEM = file.getUint16();
        this.fontDirectionHint = file.getInt16();
        this.indexToLocFormat = file.getInt16();
        this.glyphDataFormat = file.getInt16();
    };
    TTF.prototype.getGlyphOffset = function (index) {
        if (!("loca" in this.tables))
            throw new Error("loca table missing!");
        var table = this.tables["loca"];
        var file = this.file;
        var offset;
        var old;
        if (this.indexToLocFormat === 1) {
            old = file.seek(table.offset + index * 4);
            offset = file.getUint32();
        }
        else {
            old = file.seek(table.offset + index * 2);
            offset = file.getUint16() * 2;
        }
        file.seek(old);
        return offset + this.tables["glyf"].offset;
    };
    TTF.prototype.readGlyph = function (index) {
        var offset = this.getGlyphOffset(index);
        var file = this.file;
        if (offset >= this.tables["glyf"].offset + this.tables["glyf"].length) {
            return null;
        }
        if (!(offset >= this.tables["glyf"].offset))
            throw new Error("Offset invalid!");
        if (!(offset < this.tables["glyf"].offset + this.tables["glyf"].length))
            throw new Error("Offset invalid!");
        file.seek(offset);
        var glyph = {
            numberOfContours: file.getInt16(),
            xMin: this.getFword(file),
            yMin: this.getFword(file),
            xMax: this.getFword(file),
            yMax: this.getFword(file),
            type: null,
            contourEnds: null,
            points: null,
            components: null
        };
        if (!(glyph.numberOfContours >= -1))
            throw new Error("Invalid number of contours!");
        if (glyph.numberOfContours === -1) {
            this.readCompoundGlyph(file, glyph);
        }
        else {
            this.readSimpleGlyph(file, glyph);
        }
        return glyph;
    };
    TTF.prototype.readSimpleGlyph = function (file, glyph) {
        var ON_CURVE = 1;
        var X_IS_BYTE = 2;
        var Y_IS_BYTE = 4;
        var REPEAT = 8;
        var X_DELTA = 16;
        var Y_DELTA = 32;
        glyph.type = "simple";
        glyph.contourEnds = [];
        var points = glyph.points = [];
        for (var i = 0; i < glyph.numberOfContours; i++) {
            glyph.contourEnds.push(file.getUint16());
        }
        // skip over intructions
        file.seek(file.getUint16() + file.pos);
        if (glyph.numberOfContours === 0) {
            return;
        }
        var numPoints = Math.max.apply(null, glyph.contourEnds) + 1;
        var flags = [];
        for (var i = 0; i < numPoints; i++) {
            var flag = file.getUint8();
            flags.push(flag);
            points.push({
                onCurve: (flag & ON_CURVE) > 0
            });
            if (flag & REPEAT) {
                var repeatCount = file.getUint8();
                if (!(repeatCount > 0))
                    throw new Error("repeat count is off!");
                i += repeatCount;
                while (repeatCount--) {
                    flags.push(flag);
                    points.push({
                        onCurve: (flag & ON_CURVE) > 0
                    });
                }
            }
        }
        this.readCoords(this.file, numPoints, flags, points, "x", X_IS_BYTE, X_DELTA, glyph.xMin, glyph.xMax);
        this.readCoords(this.file, numPoints, flags, points, "y", Y_IS_BYTE, Y_DELTA, glyph.yMin, glyph.yMax);
    };
    TTF.prototype.readCompoundGlyph = function (file, glyph) {
        var ARG_1_AND_2_ARE_WORDS = 1, ARGS_ARE_XY_VALUES = 2, ROUND_XY_TO_GRID = 4, WE_HAVE_A_SCALE = 8, 
        // RESERVED              = 16
        MORE_COMPONENTS = 32, WE_HAVE_AN_X_AND_Y_SCALE = 64, WE_HAVE_A_TWO_BY_TWO = 128, WE_HAVE_INSTRUCTIONS = 256, USE_MY_METRICS = 512, OVERLAP_COMPONENT = 1024;
        glyph.type = "compound";
        glyph.components = [];
        var flags = MORE_COMPONENTS;
        while (flags & MORE_COMPONENTS) {
            var arg1 = void 0, arg2 = void 0;
            flags = file.getUint16();
            var component = {
                glyphIndex: file.getUint16(),
                matrix: {
                    a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
                },
                destPointIndex: null,
                srcPointIndex: null
            };
            if (flags & ARG_1_AND_2_ARE_WORDS) {
                arg1 = file.getInt16();
                arg2 = file.getInt16();
            }
            else {
                arg1 = file.getUint8();
                arg2 = file.getUint8();
            }
            if (flags & ARGS_ARE_XY_VALUES) {
                component.matrix.e = arg1;
                component.matrix.f = arg2;
            }
            else {
                component.destPointIndex = arg1;
                component.srcPointIndex = arg2;
            }
            if (flags & WE_HAVE_A_SCALE) {
                component.matrix.a = this.get2Dot14(file);
                component.matrix.d = component.matrix.a;
            }
            else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
                component.matrix.a = this.get2Dot14(file);
                component.matrix.d = this.get2Dot14(file);
            }
            else if (flags & WE_HAVE_A_TWO_BY_TWO) {
                component.matrix.a = this.get2Dot14(file);
                component.matrix.b = this.get2Dot14(file);
                component.matrix.c = this.get2Dot14(file);
                component.matrix.d = this.get2Dot14(file);
            }
            glyph.components.push(component);
        }
        if (flags & WE_HAVE_INSTRUCTIONS) {
            file.seek(file.getUint16() + file.pos);
        }
    };
    TTF.prototype.readCoords = function (file, numPoints, flags, points, name, byteFlag, deltaFlag, min, max) {
        var value = 0;
        for (var i = 0; i < numPoints; i++) {
            var flag = flags[i];
            if (flag & byteFlag) {
                if (flag & deltaFlag) {
                    value += file.getUint8();
                }
                else {
                    value -= file.getUint8();
                }
            }
            else if (~flag & deltaFlag) {
                value += file.getInt16();
            }
            else {
                // value is unchanged.
            }
            points[i][name] = value;
        }
    };
    TTF.FSTYPE_INSTALLABLE = 0;
    return TTF;
}());
(function (TTF) {
    var Buffer = /** @class */ (function () {
        function Buffer(ba) {
            this.ba = ba;
        }
        Object.defineProperty(Buffer.prototype, "pos", {
            get: function () { return this.ba.position; },
            set: function (v) { this.ba.position = v; },
            enumerable: true,
            configurable: true
        });
        Buffer.prototype.getInt32 = function () {
            /*
            return ((this.getUint8() << 24) |
                    (this.getUint8() << 16) |
                    (this.getUint8() <<  8) |
                    (this.getUint8()      ));
            */
            return this.ba.readInt();
        };
        Buffer.prototype.getInt16 = function () {
            /*
            let result:uint = this.getUint16();
            if (result & 0x8000) {
                result -= (1 << 16);
            }
            return result;
            */
            return this.ba.readShort();
        };
        Buffer.prototype.getUint32 = function () {
            //return this.getInt32() >>> 0;
            return this.ba.readUnsignedInt();
        };
        Buffer.prototype.getUint16 = function () {
            //return ((this.getUint8() << 8) | this.getUint8()) >>> 0;
            return this.ba.readUnsignedShort();
        };
        Buffer.prototype.getUint8 = function () {
            //if (this.pos >= this.ba.length) throw new Error("Pos invalid!");
            //return this.ba.bytes[this.pos++];
            return this.ba.readUnsignedByte();
        };
        Buffer.prototype.getDate = function () {
            var macTime = this.getUint32() * 0x100000000 + this.getUint32();
            var utcTime = macTime * 1000 + Date.UTC(1904, 1, 1);
            return new Date(utcTime);
        };
        Buffer.prototype.getString = function (length) {
            /*
            let result:string = "";
            for (let i:number = 0; i < length; i++)
            {
                result += String.fromCharCode(this.getUint8());
            }
            return result;
            */
            return this.ba.readFixedString(length);
        };
        // public putInt16(v:number):void
        // {
        // 	/*
        // 	const conversionBuffer:ArrayBuffer = new ArrayBuffer(16);
        // 	const conversionShort:Int16Array = new Int16Array(conversionBuffer);
        // 	const conversionUChar:Uint8Array = new Uint8Array(conversionBuffer);
        // 	conversionShort[0] = v;
        // 	this.ba.bytes[this.pos] = conversionUChar[0];
        // 	this.pos += 1;
        // 	this.ba.bytes[this.pos] = conversionUChar[1];
        // 	this.pos += 1;
        // 	*/
        // 	this.ba.writeShort(v);
        // }
        Buffer.prototype.seek = function (pos) {
            if (pos < 0 || pos > this.ba.length)
                throw new Error("Pos invalid!");
            var oldPos = this.pos;
            this.pos = pos;
            return oldPos;
        };
        return Buffer;
    }());
    TTF.Buffer = Buffer;
})(TTF || (TTF = {}));
/* tslint:enable:completed-docs */
/** @file FontMetrics.ts */
/** @file Font.ts */
/// <reference path="FontMetrics.ts" />
/**
 * Represents a font that may be used with the engine.
 */
var Font = /** @class */ (function () {
    /**
     * Defines a new Font.
     * @param family The font family.
     * @param weight The font weight.
     * @param style The fonts style.
     * @param variant The font variant.
     * @param ascent Font metrics ascent.
     * @param descent Font metrics descent.
     * @param unitsPerEm Font metrics unitsPerEm.
     * @internal
     */
    function Font(family, weight, style, variant, ascent, descent, unitsPerEm) {
        this.family = family;
        this.weight = weight;
        this.style = style;
        this.variant = variant;
        this.metrics = { ascent: ascent || 0, descent: descent || 0, unitsPerEm: unitsPerEm || 0 };
    }
    return Font;
}());
/** @file AssetType.ts */
/**
 * Enumerates the asset types that can be bundled.
 */
var AssetType;
(function (AssetType) {
    /** Indicates a font. */
    AssetType[AssetType["Font"] = 0] = "Font";
    /** Indicates an image. */
    AssetType[AssetType["Image"] = 1] = "Image";
    /** Indicates a sound. */
    AssetType[AssetType["Sound"] = 2] = "Sound";
})(AssetType || (AssetType = {}));


module.exports = {
    ByteArray: ByteArray,
    TTF: TTF,
    Font: Font
};