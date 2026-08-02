# nats-plus

A lightweight, type-safe, opinionated wrapper for NATS in TypeScript.

[`nats-plus`](https://www.npmjs.com/package/nats-plus) simplifies publishing and consuming JSON messages while providing a consistent API for enterprise applications. It hides low-level NATS details such as encoding, decoding, and header handling so application code can focus on business logic.

It intentionally does **not** provide:

- Retry policies
- Retry queues
- Validation
- Dead Letter Queue
- Business workflow

These responsibilities belong to the [`message-processing`](https://www.npmjs.com/package/message-processing) library.


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

# Transport Responsibilities

This library intentionally focuses on NATS transport.

It provides:

- Connection
- Publisher
- Subscriber
- Serialization
- Header conversion
- Health checking

It intentionally does **not** provide:

- Retry policies
- Retry queues
- Validation
- Dead Letter Queue
- Business workflow

These responsibilities belong to the Message Processing library.

---

# Architecture

```
 Business Application

         ↓

  Message Processing

--------------------------

     Validation
        Retry
  Dead Letter Queue
     Retry Count
       Logging

          ↓

         NATS

--------------------------

      Publisher
      Subscriber
       Headers
     Health Check

          ↓

@nats-io/transport-node

          ↓

    RabbitMQ Server
```

This separation keeps the RabbitMQ library small, reusable, and focused on transport concerns.

---

# Why Separate Transport from Processing?

Retry logic is not specific to NATS.

For example, the same business workflow can be implemented using:

- RabbitMQ
- Kafka
- Amazon SQS
- Azure Service Bus
- Google Pub/Sub

By keeping transport and processing separate, business logic remains independent of the messaging technology.

---

# Ecosystem

This library works naturally with the **Message Processing** library.

```
   NATS Server

        ↓

@nats-io/transport-node

        ↓

     nats-plus

        ↓

 message-processing

        ↓

 Business Services
```

The [`nats-plus`](https://www.npmjs.com/package/nats-plus) library handles transport.

The [`message-processing`](https://www.npmjs.com/package/message-processing) library handles:

- Validation
- Retry
- Retry queues
- Dead Letter Queue
- Error handling
- Logging

Together they provide a complete messaging solution while maintaining clear separation of responsibilities.

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

| Library | Responsibility                           |
|----------|------------------------------------------|
| [`health-service`](https://www.npmjs.com/package/health-service) | Health checks | 
| [`config-plus`](https://www.npmjs.com/package/config-plus) | Configuration |
| [`logger-core`](https://www.npmjs.com/package/logger-core) | Structured logging |
| [`validation-core`](https://www.npmjs.com/package/validation-core) | Data validation |
| [`rabbitmq-transport`](https://www.npmjs.com/package/rabbitmq-transport) | RabbitMQ transport and Health Check |
| [`activemq`](https://www.npmjs.com/package/activemq) | ActiveMQ transport and Health Check |
| [`kafka-plus`](https://www.npmjs.com/package/kafka-plus) | Kafka transport and Health Check |
| [`google-pubsub`](https://www.npmjs.com/package/google-pubsub) | Google Pubsub transport and Health Check |
| [`nats-plus`](https://www.npmjs.com/package/nats-plus) | NATS transport and Health Check |
| [`ibmmq-plus`](https://www.npmjs.com/package/ibmmq-plus) | IBM MQ transport and Health Check |
| [`redis-messaging`](https://github.com/core-ts/redis-messaging) | Redis Pubsub transport and Health Check |
| [`mysql2-core`](https://www.npmjs.com/package/mysql2-core) | MySQL access and Health Check |
| [`mongodb-kit`](https://www.npmjs.com/package/mongodb-kit) | MongoDB access and Health Check |

Each messaging library follows a similar API, making it easier to switch between brokers while keeping application code consistent.

---

## License

MIT
