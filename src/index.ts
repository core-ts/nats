import { headers as createHeaders, Msg, MsgHdrs, NatsConnection, Subscription } from "@nats-io/transport-node"

export interface StringMap {
  [key: string]: string
}

export type BuildHeaders = () => Promise<StringMap>
export type Log = (msg: any) => void

export class Publisher<T> {
  protected readonly encoder = new TextEncoder()

  constructor(
    protected readonly connection: NatsConnection,
    protected readonly subject: string,
    protected readonly buildHeaders?: BuildHeaders,
    protected readonly logError?: Log,
    protected readonly logInfo?: Log,
  ) {
    this.publish = this.publish.bind(this)
  }

  async publish(data: T, headers?: StringMap): Promise<void> {
    try {
      const msgHeaders = createHeaders()

      if (this.buildHeaders) {
        this.mergeHeaders(msgHeaders, await this.buildHeaders())
      }

      if (headers) {
        this.mergeHeaders(msgHeaders, headers)
      }

      const payload = this.encoder.encode(JSON.stringify(data))

      this.connection.publish(this.subject, payload, {
        headers: msgHeaders,
      })

      if (this.logInfo) {
        this.logInfo(`Published message to '${this.subject}': ${JSON.stringify(data)}`)
      }
    } catch (err) {
      if (this.logError) {
        this.logError(err)
      }
      throw err
    }
  }

  protected mergeHeaders(target: MsgHdrs, source?: StringMap): void {
    if (!source) {
      return
    }

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = source[key]
        if (value !== undefined && value !== null) {
          target.set(key, value)
        }
      }
    }
  }
}

export type Process<T, R> = (data: T, attributes?: StringMap) => Promise<R>

export class Subscriber<T, R> {
  protected readonly decoder = new TextDecoder()
  protected subscription?: Subscription

  constructor(
    protected readonly connection: NatsConnection,
    protected readonly subject: string,
    protected readonly queue?: string,
    protected readonly logError?: Log,
    protected readonly logInfo?: Log,
  ) {
    this.subscribe = this.subscribe.bind(this)
  }

  subscribe(process: Process<T, R>): void {
    const options = this.queue ? { queue: this.queue } : undefined

    this.subscription = this.connection.subscribe(this.subject, options)

    this.run(process).catch((err) => {
      if (this.logError) {
        this.logError(err)
      }
    })
  }

  protected async run(process: Process<T, R>): Promise<void> {
    if (!this.subscription) {
      return
    }

    for await (const msg of this.subscription) {
      try {
        const data = JSON.parse(this.decoder.decode(msg.data)) as T

        const attributes = this.buildHeaders(msg)

        await process(data, attributes)

        if (this.logInfo) {
          this.logInfo(`Received message from xxx '${this.subject}': ${JSON.stringify(data)}`)
        }
      } catch (err) {
        if (this.logError) {
          this.logError(err)
        }
      }
    }
  }

  protected buildHeaders(msg: Msg): StringMap {
    const headers: StringMap = {}

    if (!msg.headers) {
      return headers
    }

    for (const key of msg.headers.keys()) {
      const value = msg.headers.get(key)
      if (value !== null) {
        headers[key] = value
      }
    }

    return headers
  }

  unsubscribe(): void {
    this.subscription?.unsubscribe()
  }
}

export interface AnyMap {
  [key: string]: any
}

export class NATSChecker {
  constructor(
    protected readonly connection: NatsConnection,
    protected readonly timeout = 4500,
  ) {
    this.name = this.name.bind(this)
    this.build = this.build.bind(this)
    this.check = this.check.bind(this)
  }

  name(): string {
    return "nats"
  }

  build(data: AnyMap, error: any): AnyMap {
    if (!error) {
      return {
        status: "UP",
        ...data,
      }
    }

    return {
      status: "DOWN",
      error: error instanceof Error ? error.message : String(error),
      ...data,
    }
  }

  async check(): Promise<AnyMap> {
    try {
      await this.withTimeout(this.connection.flush(), this.timeout)

      return this.build({}, null)
    } catch (err) {
      return this.build({}, err)
    }
  }

  protected withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`NATS health check timeout after ${timeout} ms`))
      }, timeout)

      promise
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((err) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }
}
