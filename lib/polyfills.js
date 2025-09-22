// Polyfill for File API in Node.js environments
// This fixes the "File is not defined" error in undici

if (typeof globalThis !== 'undefined') {
  // Add File polyfill if not available
  if (typeof globalThis.File === 'undefined') {
    // Simple File polyfill for Node.js environments
    globalThis.File = class File {
      constructor(fileBits, fileName, options = {}) {
        this.name = fileName;
        this.type = options.type || '';
        this.lastModified = options.lastModified || Date.now();
        this.size = 0;
        
        if (Array.isArray(fileBits)) {
          this.size = fileBits.reduce((total, chunk) => {
            if (typeof chunk === 'string') return total + Buffer.byteLength(chunk);
            if (chunk instanceof Buffer) return total + chunk.length;
            return total;
          }, 0);
        }
      }
      
      stream() {
        // Return a simple readable stream
        return new ReadableStream();
      }
      
      text() {
        return Promise.resolve('');
      }
      
      arrayBuffer() {
        return Promise.resolve(new ArrayBuffer(0));
      }
    };
  }
  
  // Also add FormData if not available
  if (typeof globalThis.FormData === 'undefined') {
    try {
      const { FormData } = require('formdata-node');
      globalThis.FormData = FormData;
    } catch (e) {
      // Fallback if formdata-node is not available
      globalThis.FormData = class FormData {
        constructor() {
          this._data = new Map();
        }
        append(name, value) {
          this._data.set(name, value);
        }
        get(name) {
          return this._data.get(name);
        }
        has(name) {
          return this._data.has(name);
        }
      };
    }
  }
}

module.exports = {};