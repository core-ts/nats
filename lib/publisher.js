"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nats_1 = require("nats");
var core_1 = require("./core");
var Publisher = (function () {
  function Publisher(client, subject, logError, logInfo) {
    this.client = client;
    this.subject = subject;
    this.logError = logError;
    this.logInfo = logInfo;
    this.jc = nats_1.JSONCodec();
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  Publisher.prototype.send = function (data) {
    return this.publish(data);
  };
  Publisher.prototype.put = function (data) {
    return this.publish(data);
  };
  Publisher.prototype.write = function (data) {
    return this.publish(data);
  };
  Publisher.prototype.produce = function (data) {
    return this.publish(data);
  };
  Publisher.prototype.publish = function (data) {
    var _this = this;
    var jc = nats_1.JSONCodec();
    return new Promise(function (resolve, reject) {
      if (_this.logInfo) {
        _this.logInfo('Produce send data : ' + JSON.stringify(data));
      }
      try {
        _this.client.publish(_this.subject, _this.jc.encode(data));
        resolve();
      }
      catch (e) {
        if (_this.logError) {
          _this.logError('Error nats: ' + core_1.toString(e));
        }
        reject(e);
      }
    });
  };
  return Publisher;
}());
exports.Publisher = Publisher;
exports.Producer = Publisher;
exports.Sender = Publisher;
exports.Writer = Publisher;
var SimplePublisher = (function () {
  function SimplePublisher(client, logError, logInfo) {
    this.client = client;
    this.logError = logError;
    this.logInfo = logInfo;
    this.jc = nats_1.JSONCodec();
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  SimplePublisher.prototype.send = function (subject, data) {
    return this.publish(subject, data);
  };
  SimplePublisher.prototype.put = function (subject, data) {
    return this.publish(subject, data);
  };
  SimplePublisher.prototype.write = function (subject, data) {
    return this.publish(subject, data);
  };
  SimplePublisher.prototype.produce = function (subject, data) {
    return this.publish(subject, data);
  };
  SimplePublisher.prototype.publish = function (subject, data) {
    var _this = this;
    var jc = nats_1.JSONCodec();
    return new Promise(function (resolve, reject) {
      if (_this.logInfo) {
        _this.logInfo('Produce send data : ' + JSON.stringify(data));
      }
      try {
        _this.client.publish(subject, _this.jc.encode(data));
        resolve();
      }
      catch (e) {
        if (_this.logError) {
          _this.logError('Error nats: ' + core_1.toString(e));
        }
        reject(e);
      }
    });
  };
  return SimplePublisher;
}());
exports.SimplePublisher = SimplePublisher;
exports.SimpleProducer = SimplePublisher;
exports.SimpleSender = SimplePublisher;
exports.SimpleWriter = SimplePublisher;
