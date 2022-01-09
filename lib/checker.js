"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nats_1 = require("nats");
var NatsChecker = (function () {
  function NatsChecker(opts, service, timeout) {
    this.opts = opts;
    this.timeout = (timeout ? timeout : 4200);
    this.service = (service && service.length > 0 ? service : 'nats');
    this.check = this.check.bind(this);
    this.name = this.name.bind(this);
    this.build = this.build.bind(this);
  }
  NatsChecker.prototype.check = function () {
    var obj = {};
    var promise = nats_1.connect(this.opts).then(function (conn) { return obj; });
    if (this.timeout > 0) {
      return promiseTimeOut(this.timeout, promise);
    }
    else {
      return promise;
    }
  };
  NatsChecker.prototype.name = function () {
    return this.service;
  };
  NatsChecker.prototype.build = function (data, err) {
    if (err) {
      if (!data) {
        data = {};
      }
      data.error = err;
    }
    return data;
  };
  return NatsChecker;
}());
exports.NatsChecker = NatsChecker;
function promiseTimeOut(timeoutInMilliseconds, promise) {
  return Promise.race([
    promise,
    new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject("Time out in: " + timeoutInMilliseconds + " milliseconds!");
      }, timeoutInMilliseconds);
    })
  ]);
}
