/**
 * Message Queue (RabbitMQ) infrastructure for event-driven architecture
 */

import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { config } from '../../config';
import { logger } from '../logger';

let connection: Connection | null = null;
let channel: Channel | null = null;

export interface MessageHandler {
  (message: any): Promise<void>;
}

export async function initializeMessageQueue(): Promise<void> {
  try {
    // Connect to RabbitMQ
    connection = await amqp.connect(config.messageQueue.url);
    channel = await connection.createChannel();

    // Create exchange
    await channel.assertExchange(config.messageQueue.exchange, 'topic', {
      durable: true,
    });

    // Set up event queues
    await setupEventQueues();

    logger.info('Message queue initialized');

    // Handle connection errors
    connection.on('error', (error) => {
      logger.error('RabbitMQ connection error:', error);
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });
  } catch (error) {
    logger.error('Failed to initialize message queue:', error);
    throw error;
  }
}

async function setupEventQueues(): Promise<void> {
  if (!channel) {
    throw new Error('Message queue channel not initialized');
  }

  const queues = [
    { name: 'pa_request_created', routingKey: 'pa.request.created' },
    { name: 'pa_request_submitted', routingKey: 'pa.request.submitted' },
    { name: 'pa_request_updated', routingKey: 'pa.request.updated' },
    { name: 'pa_response_received', routingKey: 'pa.response.received' },
    { name: 'pa_validation_required', routingKey: 'pa.validation.required' },
    { name: 'pa_workflow_triggered', routingKey: 'pa.workflow.triggered' },
    { name: 'pa_notification_required', routingKey: 'pa.notification.required' },
    { name: 'pa_audit_event', routingKey: 'pa.audit.event' },
    { name: 'pa_error_occurred', routingKey: 'pa.error.occurred' },
  ];

  for (const queue of queues) {
    const queueName = `${config.messageQueue.queuePrefix}_${queue.name}`;
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000, // 24 hours
        'x-max-length': 10000,
      },
    });

    await channel.bindQueue(
      queueName,
      config.messageQueue.exchange,
      queue.routingKey
    );

    logger.info(`Queue ${queueName} bound to ${queue.routingKey}`);
  }
}

export async function publishEvent(
  routingKey: string,
  event: any
): Promise<void> {
  if (!channel) {
    throw new Error('Message queue channel not initialized');
  }

  try {
    const message = JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
    });

    channel.publish(
      config.messageQueue.exchange,
      routingKey,
      Buffer.from(message),
      {
        persistent: true,
        contentType: 'application/json',
      }
    );

    logger.debug(`Event published: ${routingKey}`, { event });
  } catch (error) {
    logger.error(`Failed to publish event: ${routingKey}`, error);
    throw error;
  }
}

export async function subscribeToQueue(
  queueName: string,
  handler: MessageHandler
): Promise<void> {
  if (!channel) {
    throw new Error('Message queue channel not initialized');
  }

  const fullQueueName = `${config.messageQueue.queuePrefix}_${queueName}`;

  try {
    await channel.consume(
      fullQueueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          return;
        }

        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          channel!.ack(msg);
          logger.debug(`Message processed from ${fullQueueName}`);
        } catch (error) {
          logger.error(`Error processing message from ${fullQueueName}:`, error);
          // Reject and requeue the message
          channel!.nack(msg, false, true);
        }
      },
      {
        noAck: false,
      }
    );

    logger.info(`Subscribed to queue: ${fullQueueName}`);
  } catch (error) {
    logger.error(`Failed to subscribe to queue ${fullQueueName}:`, error);
    throw error;
  }
}

export async function closeMessageQueue(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    logger.info('Message queue connection closed');
  } catch (error) {
    logger.error('Error closing message queue:', error);
  }
}

// Event types for type safety
export enum PAEventType {
  REQUEST_CREATED = 'pa.request.created',
  REQUEST_SUBMITTED = 'pa.request.submitted',
  REQUEST_UPDATED = 'pa.request.updated',
  RESPONSE_RECEIVED = 'pa.response.received',
  VALIDATION_REQUIRED = 'pa.validation.required',
  WORKFLOW_TRIGGERED = 'pa.workflow.triggered',
  NOTIFICATION_REQUIRED = 'pa.notification.required',
  AUDIT_EVENT = 'pa.audit.event',
  ERROR_OCCURRED = 'pa.error.occurred',
}

export interface PAEvent {
  type: PAEventType;
  requestId: string;
  data: any;
  timestamp?: string;
}
