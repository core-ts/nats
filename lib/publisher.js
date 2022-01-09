"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nats_1 = require("nats");
var core_1 = require("./core");
function createPublisher(c, logError, logInfo) {
  return nats_1.connect(c.opts).then(function (client) {
    return new Publisher(client, c.subject, logError, logInfo);
  });
}
exports.createPublisher = createPublisher;
exports.createProducer = createPublisher;
exports.createSender = createPublisher;
exports.createWriter = createPublisher;
var Publisher = (function () {
  function Publisher(connection, subject, logError, logInfo) {
    this.connection = connection;
    this.subject = subject;
    this.logError = logError;
    this.logInfo = logInfo;
    this.jc = nats_1.JSONCodec();
    this.sc = nats_1.StringCodec();
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  Publisher.prototype.send = function (data, attrs) {
    return this.publish(data, attrs);
  };
  Publisher.prototype.put = function (data, attrs) {
    return this.publish(data, attrs);
  };
  Publisher.prototype.write = function (data, attrs) {
    return this.publish(data, attrs);
  };
  Publisher.prototype.produce = function (data, attrs) {
    return this.publish(data, attrs);
  };
  Publisher.prototype.publish = function (data, attrs) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.logInfo) {
        _this.logInfo('Produce send data : ' + core_1.toString(data));
      }
      try {
        var d = (typeof data === 'string' ? _this.sc.encode(data) : _this.jc.encode(data));
        _this.connection.publish(_this.subject, d, createPublishOptions(attrs));
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
function createSimplePublisher(opts, logError, logInfo) {
  return nats_1.connect(opts).then(function (client) {
    return new SimplePublisher(client, logError, logInfo);
  });
}
exports.createSimplePublisher = createSimplePublisher;
exports.createSimpleProducer = createSimplePublisher;
exports.createSimpleSender = createSimplePublisher;
exports.createSimpleWriter = createSimplePublisher;
var SimplePublisher = (function () {
  function SimplePublisher(connection, logError, logInfo) {
    this.connection = connection;
    this.logError = logError;
    this.logInfo = logInfo;
    this.jc = nats_1.JSONCodec();
    this.sc = nats_1.StringCodec();
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  SimplePublisher.prototype.send = function (subject, data, attrs) {
    return this.publish(subject, data, attrs);
  };
  SimplePublisher.prototype.put = function (subject, data, attrs) {
    return this.publish(subject, data, attrs);
  };
  SimplePublisher.prototype.write = function (subject, data, attrs) {
    return this.publish(subject, data, attrs);
  };
  SimplePublisher.prototype.produce = function (subject, data, attrs) {
    return this.publish(subject, data, attrs);
  };
  SimplePublisher.prototype.publish = function (subject, data, attrs) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.logInfo) {
        _this.logInfo('Produce send data : ' + JSON.stringify(data));
      }
      try {
        var d = (typeof data === 'string' ? _this.sc.encode(data) : _this.jc.encode(data));
        _this.connection.publish(subject, d, createPublishOptions(attrs));
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
function createHeader(m) {
  if (m) {
    var h = nats_1.headers();
    var keys = Object.keys(m);
    var i = 0;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
      var k = keys_1[_i];
      i = i + 1;
      h.append(k, m[k]);
    }
    if (i === 0) {
      return undefined;
    }
    else {
      return h;
    }
  }
  else {
    return undefined;
  }
}
exports.createHeader = createHeader;
function createPublishOptions(m) {
  if (m) {
    var h = createHeader(m);
    if (h) {
      return { headers: h };
    }
    else {
      return undefined;
    }
  }
  else {
    return undefined;
  }
}
exports.createPublishOptions = createPublishOptions;
