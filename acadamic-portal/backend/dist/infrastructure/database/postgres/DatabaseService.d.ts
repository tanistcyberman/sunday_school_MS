import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { QueryResult } from 'pg';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private pool;
    private isConnected;
    private memoryTables;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getIsConnected(): boolean;
    initializeDatabase(): Promise<void>;
    query(text: string, params?: any[]): Promise<QueryResult<any> | {
        rows: any[];
        rowCount: number;
    }>;
    getMemoryStore(): {
        [tableName: string]: any[];
    };
    private simulateQuery;
}
