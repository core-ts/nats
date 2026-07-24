# nats-plus

A lightweight, type-safe, opinionated wrapper for NATS in TypeScript.

`nats-plus` simplifies publishing and consuming JSON messages while providing a consistent API for enterprise applications. It hides low-level NATS details such as encoding, decoding, and header handling so application code can focus on business logic.

## Features

* Lightweight wrapper over the official NATS client
* Type-safe publishers and subscribers
* Automatic JSON serialization and deserialization
* Header propagation
* Queue group support
* Simple health check for Kubernetes
* Minimal API with almost zero runtime overhead
* Suitable for microservices and event-driven architectures

## Installation

```bash
npm install nats-plus
```

## Requirements

* Node.js 18+
* A running NATS server

## Quick Start

### Create a Connection

```ts
import { connect } from "@nats-io/transport-node"

const connection = await connect({
  servers: "nats://localhost:4222",
})
```

---

## Publishing Messages

```ts
import { Publisher } from "nats-plus"

interface UserCreated {
  id: string
  name: string
}

const publisher = new Publisher<UserCreated>(
  connection,
  "users.created"
)

await publisher.publish({
  id: "1001",
  name: "John Doe",
})
```

---

## Consuming Messages

```ts
import { Subscriber } from "nats-plus"

interface UserCreated {
  id: string
  name: string
}

const subscriber = new Subscriber<UserCreated, void>(
  connection,
  "users.created"
)

subscriber.subscribe(async (user, headers) => {
  console.log(user)
  console.log(headers)
})
```

---

## Queue Groups

Multiple subscribers can share the same queue group.

```ts
const subscriber = new Subscriber<UserCreated, void>(
  connection,
  "users.created",
  "user-service"
)
```

Only one subscriber in the queue group receives each message.

---

## Custom Headers

Headers can be supplied for every published message.

```ts
await publisher.publish(
  user,
  {
    correlationId: "abc123",
    tenant: "tenant-a",
  }
)
```

The subscriber receives the same headers.

```ts
subscriber.subscribe(async (user, headers) => {
  console.log(headers?.correlationId)
  console.log(headers?.tenant)
})
```

---

## Global Headers

Applications often need headers such as:

* Correlation ID
* Trace ID
* Tenant
* Locale
* Authorization

Instead of passing them manually every time, provide a header builder.

```ts
const publisher = new Publisher<UserCreated>(
  connection,
  "users.created",
  async () => ({
    correlationId: currentCorrelationId(),
    tenant: currentTenant(),
  })
)
```

The generated headers are automatically merged with any headers supplied during publishing.

---

## Logging

Logging callbacks are optional.

```ts
const publisher = new Publisher<UserCreated>(
  connection,
  "users.created",
  undefined,
  console.error,
  console.log
)
```

The same applies to `Subscriber`.

---

## Health Check

`NATSChecker` provides a simple health check suitable for Kubernetes.

```ts
import { NATSChecker } from "nats-plus"

const checker = new NATSChecker(connection)

const result = await checker.check()

console.log(result)
```

Healthy response:

```json
{
  "status": "UP"
}
```

Unavailable response:

```json
{
  "status": "DOWN",
  "error": "NATS health check timeout after 4500 ms"
}
```

The checker uses `connection.flush()` with a configurable timeout to verify communication with the server.

---

## API

### Publisher

```ts
new Publisher<T>(
    connection,
    subject,
    buildHeaders?,
    logError?,
    logInfo?
)
```

#### publish

```ts
await publisher.publish(data)

await publisher.publish(data, headers)
```

---

### Subscriber

```ts
new Subscriber<T, R>(
    connection,
    subject,
    queue?,
    logError?,
    logInfo?
)
```

#### subscribe

```ts
subscriber.subscribe(async (data, headers) => {

})
```

#### unsubscribe

```ts
subscriber.unsubscribe()
```

---

### NATSChecker

```ts
const checker = new NATSChecker(connection)
```

```ts
await checker.check()
```

---

## Design Philosophy

`nats-plus` intentionally exposes a very small API.

Instead of requiring application code to work directly with:

* `Uint8Array`
* `TextEncoder`
* `TextDecoder`
* `Msg`
* `MsgHdrs`

the library provides strongly typed publishers and subscribers that automatically handle JSON serialization, deserialization, and headers.

The goal is to keep business code clean while remaining very close to the performance of the official NATS client.

---

## Use Cases

* Microservices
* Event-driven architecture
* Domain events
* Integration services
* Background workers
* Message processing
* Kubernetes deployments

---

## Related Projects

The project is part of the **core-ts** ecosystem.

* sql-core
* mysql2-core
* redis
* rabbitmq-plus
* activemq
* kafka-plus
* io-one

Each messaging library follows a similar API, making it easier to switch between brokers while keeping application code consistent.

---

## License

MIT
