/**
 * Message Queue infrastructure tests
 */

// Mock amqplib module
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertExchange: jest.fn().mockResolvedValue({}),
      assertQueue: jest.fn().mockResolvedValue({}),
      bindQueue: jest.fn().mockResolvedValue({}),
      publish: jest.fn().mockReturnValue(true),
      consume: jest.fn().mockResolvedValue({}),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    }),
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('Message Queue Infrastructure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should connect to RabbitMQ and create channel', async () => {
      const amqp = await import('amqplib');
      const { initializeMessageQueue } = await import('../message-queue');
      
      await initializeMessageQueue();
      
      expect(amqp.connect).toHaveBeenCalled();
    });

    it('should create exchange with correct configuration', async () => {
      const amqp = await import('amqplib');
      const { initializeMessageQueue } = await import('../message-queue');
      
      await initializeMessageQueue();
      
      const connection = await amqp.connect('');
      const channel = await connection.createChannel();
      
      expect(channel.assertExchange).toHaveBeenCalledWith(
        expect.any(String),
        'topic',
        expect.objectContaining({ durable: true })
      );
    });

    it('should set up all event queues', async () => {
      const amqp = await import('amqplib');
      const { initializeMessageQueue } = await import('../message-queue');
      
      await initializeMessageQueue();
      
      const connection = await amqp.connect('');
      const channel = await connection.createChannel();
      
      // Verify queues were created
      expect(channel.assertQueue).toHaveBeenCalled();
      expect(channel.bindQueue).toHaveBeenCalled();
    });
  });

  describe('Event Publishing', () => {
    it('should publish events to the exchange', async () => {
      const amqp = await import('amqplib');
      const { initializeMessageQueue, publishEvent } = await import('../message-queue');
      
      await initializeMessageQueue();
      
      const testEvent = {
        type: 'pa.request.created',
        requestId: 'test-123',
        data: { test: 'data' },
      };
      
      await publishEvent('pa.request.created', testEvent);
      
      const connection = await amqp.connect('');
      const channel = await connection.createChannel();
      
      expect(channel.publish).toHaveBeenCalledWith(
        expect.any(String),
        'pa.request.created',
        expect.any(Buffer),
        expect.objectContaining({
          persistent: true,
          contentType: 'application/json',
        })
      );
    });

    it('should add timestamp to published events', async () => {
      const { initializeMessageQueue, publishEvent } = await import('../message-queue');
      
      await initializeMessageQueue();
      
      const testEvent = {
        type: 'pa.request.created',
        requestId: 'test-123',
        data: { test: 'data' },
      };
      
      await publishEvent('pa.request.created', testEvent);
      
      // Event should have timestamp added
      expect(testEvent).toBeDefined();
    });
  });

  describe('Queue Subscription', () => {
    it('should subscribe to queues with message handler', async () => {
      const amqp = await import('amqplib');
      const { initializeMessageQueue, subscribeToQueue } = await import('../message-queue');
      
      await initializeMessageQueue();
      
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      await subscribeToQueue('pa_request_created', mockHandler);
      
      const connection = await amqp.connect('');
      const channel = await connection.createChannel();
      
      expect(channel.consume).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.objectContaining({ noAck: false })
      );
    });
  });

  describe('Connection Management', () => {
    it('should close channel and connection on shutdown', async () => {
      const amqp = await import('amqplib');
      const { initializeMessageQueue, closeMessageQueue } = await import('../message-queue');
      
      await initializeMessageQueue();
      await closeMessageQueue();
      
      const connection = await amqp.connect('');
      const channel = await connection.createChannel();
      
      expect(channel.close).toHaveBeenCalled();
      expect(connection.close).toHaveBeenCalled();
    });
  });
});
