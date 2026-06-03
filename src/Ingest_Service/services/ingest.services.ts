import logger from '../../shared/loggers/logger';
import AppError from '../../shared/utils/errors/appError';
import { v4 as uuidv4 } from 'uuid';
import { EventProducer } from '../../shared/events/producer/eventProducer';

interface HitData {
    serviceName: string;
    endpoint: string;
    method: string;
    statusCode: string | number;
    latencyMs: string | number;
    clientId: string;
    apiKeyId?: string;
    ip?: string;
    userAgent?: string;
}

interface IngestServiceDependencies {
    eventProducer: EventProducer;
}

interface IngestResponse {
    eventId: string;
    status: 'queued' | 'rejected';
    reason?: string;
    timestamp: Date;
}

export class IngestService {
    private eventProducer: EventProducer;

    constructor({ eventProducer }: IngestServiceDependencies) {
        if (!eventProducer) {
            throw new Error('IngestService requires eventProducer');
        }

        this.eventProducer = eventProducer;
    }

    async ingestApiHit(
        hitData: HitData
    ): Promise<IngestResponse> {
        try {
            this.validateHitData(hitData);

            const event = {
                eventId: uuidv4(),
                timestamp: new Date(),
                serviceName: hitData.serviceName,
                endpoint: hitData.endpoint,
                method: hitData.method.toUpperCase(),
                statusCode: Number(hitData.statusCode),
                latencyMs: Number(hitData.latencyMs),
                clientId: hitData.clientId,
                apiKeyId: hitData.apiKeyId,
                ip: hitData.ip ?? 'unknown',
                userAgent: hitData.userAgent ?? '',
            };

            const published =
                await this.eventProducer.publishApiHit(event);

            if (!published) {
                logger.warn('API hit rejected by circuit breaker', {
                    eventId: event.eventId,
                    endpoint: event.endpoint,
                    method: event.method,
                    clientId: event.clientId,
                });

                return {
                    eventId: event.eventId,
                    status: 'rejected',
                    reason: 'service_unavailable',
                    timestamp: event.timestamp,
                };
            }

            logger.info('API hit ingested', {
                eventId: event.eventId,
                endpoint: event.endpoint,
                method: event.method,
                clientId: event.clientId,
            });

            return {
                eventId: event.eventId,
                status: 'queued',
                timestamp: event.timestamp,
            };
        } catch (error) {
            logger.error('Error ingesting API hit:', error);
            throw error;
        }
    }

    private validateHitData(hitData: HitData): void {
        const requiredFields: (keyof HitData)[] = [
            'serviceName',
            'endpoint',
            'method',
            'statusCode',
            'latencyMs',
            'clientId',
        ];

        const missingFields = requiredFields.filter(
            (field) => !hitData[field]
        );

        if (missingFields.length > 0) {
            throw new AppError(
                `Missing required fields: ${missingFields.join(', ')}`,
                400
            );
        }

        const validMethods = [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS',
            'HEAD',
        ];

        if (!validMethods.includes(hitData.method.toUpperCase())) {
            throw new AppError(
                `Invalid HTTP method: ${hitData.method}`,
                400
            );
        }

        const statusCode = Number(hitData.statusCode);

        if (
            Number.isNaN(statusCode) ||
            statusCode < 100 ||
            statusCode > 599
        ) {
            throw new AppError(
                `Invalid status code: ${hitData.statusCode}`,
                400
            );
        }

        const latency = Number(hitData.latencyMs);

        if (Number.isNaN(latency) || latency < 0) {
            throw new AppError(
                `Invalid latency: ${hitData.latencyMs}`,
                400
            );
        }
    }
}