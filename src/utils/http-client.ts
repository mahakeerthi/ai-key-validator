/**
 * Secure HTTP Client
 * 
 * Provides HTTP functionality with security features for API validation.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from './logger';
import { ConfigManager } from './config';

export class SecureHttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: ConfigManager.getConfig().timeout,
      headers: {
        'User-Agent': 'AI-Key-Validator/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging (without sensitive data)
    this.client.interceptors.request.use(
      (config) => {
        Logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        Logger.error('HTTP Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        Logger.debug(`HTTP Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        Logger.error('HTTP Response Error', error);
        return Promise.reject(error);
      }
    );
  }

  async get(url: string, config?: AxiosRequestConfig): Promise<unknown> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<unknown> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }
}