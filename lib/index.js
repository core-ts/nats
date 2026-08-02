var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { headers as createHeaders } from "@nats-io/transport-node";
export class Publisher {
  constructor(connection, subject, buildHeaders, logError, logInfo) {
    this.connection = connection;
    this.subject = subject;
    this.buildHeaders = buildHeaders;
    this.logError = logError;
    this.logInfo = logInfo;
    this.encoder = new TextEncoder();
    this.publish = this.publish.bind(this);
  }
  publish(data, headers) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const msgHeaders = createHeaders();
        if (this.buildHeaders) {
          this.mergeHeaders(msgHeaders, yield this.buildHeaders());
        }
        if (headers) {
          this.mergeHeaders(msgHeaders, headers);
        }
        const payload = this.encoder.encode(JSON.stringify(data));
        this.connection.publish(this.subject, payload, {
          headers: msgHeaders,
        });
        if (this.logInfo) {
          this.logInfo(`Published message to '${this.subject}': ${JSON.stringify(data)}`);
        }
      }
      catch (err) {
        if (this.logError) {
          this.logError(err);
        }
        throw err;
      }
    });
  }
  mergeHeaders(target, source) {
    if (!source) {
      return;
    }
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = source[key];
        if (value !== undefined && value !== null) {
          target.set(key, value);
        }
      }
    }
  }
}
export class Subscriber {
  constructor(connection, subject, queue, logError, logInfo) {
    this.connection = connection;
    this.subject = subject;
    this.queue = queue;
    this.logError = logError;
    this.logInfo = logInfo;
    this.decoder = new TextDecoder();
    this.subscribe = this.subscribe.bind(this);
    this.run = this.run.bind(this);
  }
  subscribe(process) {
    return __awaiter(this, void 0, void 0, function* () {
      const options = this.queue ? { queue: this.queue } : undefined;
      this.subscription = this.connection.subscribe(this.subject, options);
      yield this.run(process);
    });
  }
  run(process) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.subscription) {
        return;
      }
      try {
        for (var _b = __asyncValues(this.subscription), _c; _c = yield _b.next(), !_c.done;) {
          const msg = _c.value;
          try {
            const data = JSON.parse(this.decoder.decode(msg.data));
            const attributes = this.buildHeaders(msg);
            yield process(data, attributes, msg);
            if (this.logInfo) {
              this.logInfo(`Received message from xxx '${this.subject}': ${JSON.stringify(data)}`);
            }
          }
          catch (err) {
            if (this.logError) {
              this.logError(err);
            }
          }
        }
      }
      catch (e_1_1) { e_1 = { error: e_1_1 }; }
      finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
      }
    });
  }
  buildHeaders(msg) {
    const headers = {};
    if (!msg.headers) {
      return headers;
    }
    for (const key of msg.headers.keys()) {
      const value = msg.headers.get(key);
      if (value !== null) {
        headers[key] = value;
      }
    }
    return headers;
  }
  unsubscribe() {
    var _a;
    (_a = this.subscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
  }
}
export class NATSChecker {
  constructor(connection, service, timeout = 4500) {
    this.connection = connection;
    this.timeout = timeout;
    this.service = service || "nats";
    this.name = this.name.bind(this);
    this.build = this.build.bind(this);
    this.check = this.check.bind(this);
  }
  name() {
    return this.service;
  }
  build(data, error) {
    if (!error) {
      return Object.assign({ status: "UP" }, data);
    }
    return Object.assign({ status: "DOWN", error: error instanceof Error ? error.message : String(error) }, data);
  }
  check() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        yield this.withTimeout(this.connection.flush(), this.timeout);
        return this.build({}, null);
      }
      catch (err) {
        return this.build({}, err);
      }
    });
  }
  withTimeout(promise, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`NATS health check timeout after ${timeout} ms`));
      }, timeout);
      promise
        .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
        .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
}
