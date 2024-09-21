import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { create, Whatsapp, CreateOptions } from 'venom-bot';
import { Device } from './entities/device.entity';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private clients: Map<string, Whatsapp> = new Map(); // Keep track of connected clients
  private reconnectAttempts: Map<string, number> = new Map(); // Track reconnection attempts

  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) { }

  async connectDevice(userId: string, deviceName: string): Promise<Device> {
    try {
      const createOptions: CreateOptions = {
        session: deviceName,
        // Add other options as needed
      };

      const client: Whatsapp = await create(createOptions);

      const deviceId = deviceName;

      let device = await this.deviceRepository.findOne({ where: { deviceId } });
      if (device) {
        device.isConnected = true;
        device.lastConnection = new Date();
      } else {
        device = this.deviceRepository.create({
          deviceId,
          name: deviceName,
          isConnected: true,
          lastConnection: new Date(),
          user: { id: userId },
        });
      }

      // Store the client for future reference
      this.clients.set(deviceId, client);
      this.reconnectAttempts.set(deviceId, 0); // Initialize reconnection attempts

      client.onStateChange(async (state) => {
        if (state === 'DISCONNECTED') {
          await this.handleDeviceDisconnection(deviceId);
        }
      });

      client.onMessage((message) => {
        this.logger.log(`Received message from ${message.from}: ${message.body}`);
      });

      // Save the device record
      await this.deviceRepository.save(device);

      return device;
    } catch (error) {
      this.logger.error(`Failed to connect device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async disconnectDevice(deviceId: string): Promise<Device> {
    try {
      const device = await this.deviceRepository.findOne({ where: { deviceId } });
      if (device) {
        await this.updateDeviceConnectionStatus(deviceId, false);
        this.clients.delete(deviceId); // Remove the client from the map
        this.reconnectAttempts.delete(deviceId); // Remove reconnection attempts
        return device;
      }
      throw new NotFoundException('Device not found');
    } catch (error) {
      this.logger.error(`Failed to disconnect device: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateDeviceConnectionStatus(deviceId: string, isConnected: boolean): Promise<void> {
    await this.deviceRepository.update({ deviceId }, { isConnected, lastConnection: new Date() });
  }

  private async handleDeviceDisconnection(deviceId: string): Promise<void> {
    this.logger.warn(`Device ${deviceId} disconnected. Attempting to reconnect...`);
    await this.updateDeviceConnectionStatus(deviceId, false);
    this.clients.delete(deviceId); // Remove the client from the map

    // Reconnect with exponential backoff
    await this.reconnectDevice(deviceId);
  }

  private async reconnectDevice(deviceId: string): Promise<void> {
    const maxAttempts = 5; // Max reconnection attempts
    let attempts = this.reconnectAttempts.get(deviceId) || 0;

    if (attempts >= maxAttempts) {
      this.logger.error(`Maximum reconnection attempts reached for device ${deviceId}`);
      return;
    }

    this.reconnectAttempts.set(deviceId, attempts + 1);
    const delay = Math.pow(2, attempts) * 1000; // Exponential backoff

    setTimeout(async () => {
      try {
        const device = await this.deviceRepository.findOne({ where: { deviceId } });
        if (!device) {
          this.logger.error(`Device ${deviceId} not found during reconnection attempt`);
          return;
        }

        const createOptions: CreateOptions = {
          session: deviceId,
          // Add other options as needed
        };

        const client: Whatsapp = await create(createOptions);

        // Store the new client
        this.clients.set(deviceId, client);

        client.onStateChange(async (state) => {
          if (state === 'DISCONNECTED') {
            await this.handleDeviceDisconnection(deviceId);
          }
        });

        client.onMessage((message) => {
          this.logger.log(`Received message from ${message.from}: ${message.body}`);
        });

        // Update the device record to mark it as connected
        await this.updateDeviceConnectionStatus(deviceId, true);
        this.logger.log(`Device ${deviceId} reconnected successfully`);

      } catch (error) {
        this.logger.error(`Failed to reconnect device ${deviceId}: ${error.message}`, error.stack);
        await this.reconnectDevice(deviceId); // Retry reconnection
      }
    }, delay);
  }

  async getDeviceByIdAndUserId(deviceId: string, userId: string): Promise<Device | null> {
    return this.deviceRepository.findOne({ where: { deviceId, user: { id: userId } } });
  }

  async checkDeviceConnection(deviceId: string, userId: string): Promise<{ isConnected: boolean }> {
    const device = await this.getDeviceByIdAndUserId(deviceId, userId);
    if (!device) {
      throw new NotFoundException('Device not found or not associated with the user');
    }
    return { isConnected: device.isConnected };
  }

  async sendTestMessage(deviceId: string, phoneNumber: string, message: string): Promise<void> {
    try {
      const client = this.clients.get(deviceId);
      if (!client) {
        throw new NotFoundException('Client not found for the given device ID');
      }

      await client.sendText(phoneNumber, message);
      this.logger.log(`Test message sent to ${phoneNumber}: ${message}`);
    } catch (error) {
      this.logger.error(`Failed to send test message to ${phoneNumber}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async testSendMessage() {
    try {
      // Check device connection
      const { isConnected } = await this.checkDeviceConnection('Hessen Nasser', '4d6bc67a-cfd0-4d98-b745-178348a8a88a');
      this.logger.log(`Device connected: ${isConnected}`);

      if (isConnected) {
        // Send a test message
        await this.sendTestMessage('Hessen Nasser', '201064766851@c.us', 'Hello, this is a test message!');
        this.logger.log('Test message sent successfully.');
      } else {
        this.logger.warn('Device is not connected. Cannot send test message.');
      }
    } catch (error) {
      this.logger.error('Error during test:', error.message);
    }
  }
}
