import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import * as mysql from 'mysql2/promise';

interface MysqlClientConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class MysqlClient {
  private pool: mysql.Pool;

  constructor (
        private readonly options: MysqlClientConfig,
    ) {
    this.pool = mysql.createPool(this.options);
  }

  createPool (): mysql.Pool {
    return this.pool ?? mysql.createPool(this.options);
  }

  async closePool (): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

    /**
     * Ejecuta una consulta SQL con parámetros opcionales
     */
  async execute<T extends RowDataPacket[] | ResultSetHeader> (
        sql: string,
        values?: unknown[],
    ): Promise<T> {
    this.validateQuery(sql);

    let connection: PoolConnection | undefined;

    try {
      connection = await this.pool.getConnection();
      const [result] = await connection.execute<RowDataPacket[] | ResultSetHeader>(sql, values);
      return result as T;
    } catch (error) {
      throw new DatabaseError({
        message: 'Error executing query',
        sql,
        values,
        originalError: error as Error,
      });
    } finally {
      if (connection) { connection.release(); } // Importante liberar la conexión
    }
  }

    /**
     * Método para SELECT
     */
  async select<T extends RowDataPacket[]> (sql: string, values?: unknown[]): Promise<T> {
    return this.execute<T>(sql, values);
  }

    /**
     * Método para INSERT
     */
  async insert (table: string, data: Record<string, unknown>): Promise<ResultSetHeader> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = Array(values.length).fill('?').join(', ');

    return this.execute<ResultSetHeader>(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
            values,
        );
  }

    /**
     * Método para UPDATE
     */
  async update (
        table: string,
        data: Record<string, unknown>,
        where: Record<string, unknown>,
    ): Promise<ResultSetHeader> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];

    return this.execute<ResultSetHeader>(
            `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`,
            values,
        );
  }

  private validateQuery (sql: string): void {
    if (!sql || typeof sql !== 'string') {
      throw new Error('Invalid SQL query');
    }
  }

}

class DatabaseError extends Error {
  sql?: string;
  values?: unknown[];
  originalError: Error;

  constructor (options: {
    message: string;
    sql?: string;
    values?: unknown[];
    originalError: Error;
  }) {
    super(options.message);
    this.name = 'DatabaseError';
    this.sql = options.sql;
    this.values = options.values;
    this.originalError = options.originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}
