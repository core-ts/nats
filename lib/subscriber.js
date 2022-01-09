"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
var Subscriber = (function () {
  function Subscriber(client, subject, logError, json, logInfo) {
    this.client = client;
    this.subject = subject;
    this.logError = logError;
    this.json = json;
    this.logInfo = logInfo;
    this.subject = subject;
    this.subscribe = this.subscribe.bind(this);
    this.get = this.get.bind(this);
    this.receive = this.receive.bind(this);
    this.read = this.read.bind(this);
    this.consume = this.consume.bind(this);
  }
  Subscriber.prototype.get = function (handle) {
    return this.subscribe(handle);
  };
  Subscriber.prototype.receive = function (handle) {
    return this.subscribe(handle);
  };
  Subscriber.prototype.read = function (handle) {
    return this.subscribe(handle);
  };
  Subscriber.prototype.consume = function (handle) {
    return this.subscribe(handle);
  };
  Subscriber.prototype.subscribe = function (handle) {
    var _this = this;
    this.client.subscribe(this.subject, function (error, msg) {
      if (error && _this.logError) {
        _this.logError('Fail to consume message ' + core_1.toString(error));
        return;
      }
      if (_this.logInfo) {
        _this.logInfo('Received : ' + core_1.toString(msg));
      }
      if (!msg.data) {
        throw new Error('message content is empty!');
      }
      var data = (_this.json ? JSON.parse(msg.data) : msg.data);
      handle(data, undefined, msg);
    });
  };
  return Subscriber;
}());
exports.Subscriber = Subscriber;
exports.Consumer = Subscriber;
exports.Reader = Subscriber;
exports.Receiver = Subscriber;
