"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_nats_1 = require("ts-nats");
function toString(m) {
  return typeof m === 'string' ? m : JSON.stringify(m);
}
exports.toString = toString;
function connect(uri) {
  return ts_nats_1.connect({ servers: [uri] });
}
exports.connect = connect;
