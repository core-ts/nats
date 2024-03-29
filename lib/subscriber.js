"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0: case 1: t = op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y = op[1]; op = [0]; continue;
        case 7: op = _.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
          if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
          if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op = body.call(thisArg, _);
    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var nats_1 = require("nats");
function createSubscriber(c, logError, json, logInfo) {
  return nats_1.connect(c.opts).then(function (client) {
    return new Subscriber(client, c.subject, logError, json, logInfo);
  });
}
exports.createSubscriber = createSubscriber;
exports.createConsumer = createSubscriber;
exports.createReader = createSubscriber;
exports.createReceiver = createSubscriber;
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
    var sc = nats_1.StringCodec();
    var sub = this.client.subscribe(this.subject);
    (function () {
      return __awaiter(_this, void 0, void 0, function () {
        var sub_1, sub_1_1, msg, s, data, e_1_1;
        var e_1, _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 5, 6, 11]);
              sub_1 = __asyncValues(sub);
              _b.label = 1;
            case 1: return [4, sub_1.next()];
            case 2:
              if (!(sub_1_1 = _b.sent(), !sub_1_1.done)) return [3, 4];
              msg = sub_1_1.value;
              s = sc.decode(msg.data);
              console.log("[" + sub.getProcessed() + "]: " + s);
              data = (this.json ? JSON.parse(s) : s);
              handle(data, mapHeaders(msg.headers), msg);
              _b.label = 3;
            case 3: return [3, 1];
            case 4: return [3, 11];
            case 5:
              e_1_1 = _b.sent();
              e_1 = { error: e_1_1 };
              return [3, 11];
            case 6:
              _b.trys.push([6, , 9, 10]);
              if (!(sub_1_1 && !sub_1_1.done && (_a = sub_1.return))) return [3, 8];
              return [4, _a.call(sub_1)];
            case 7:
              _b.sent();
              _b.label = 8;
            case 8: return [3, 10];
            case 9:
              if (e_1) throw e_1.error;
              return [7];
            case 10: return [7];
            case 11:
              if (this.logInfo) {
                this.logInfo('subscription closed');
              }
              return [2];
          }
        });
      });
    })();
  };
  return Subscriber;
}());
exports.Subscriber = Subscriber;
exports.Consumer = Subscriber;
exports.Reader = Subscriber;
exports.Receiver = Subscriber;
function mapHeaders(hdr) {
  if (hdr) {
    var r = {};
    var keys = hdr.keys();
    var i = 0;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
      var k = keys_1[_i];
      i = i + 1;
      var obj = hdr.get(k);
      r[k] = obj;
    }
    if (i === 0) {
      return undefined;
    }
    else {
      return r;
    }
  }
  else {
    return undefined;
  }
}
exports.mapHeaders = mapHeaders;
