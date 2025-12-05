import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// --- THE COMPATIBILITY LAYER ---

export function getSql() {
  return async (query: string, params: any[] = []) => {
    // 1. Convert Postgres syntax ($1, $2, etc) to MySQL syntax (?)
    let mysqlQuery = query.replace(/\$\d+/g, '?');

    // 2. Convert Postgres 'ILIKE' (Case Insensitive) to MySQL 'LIKE' (Default is case insensitive)
    mysqlQuery = mysqlQuery.replace(/ILIKE/gi, 'LIKE');

    // 3. Remove "RETURNING *" statements
    // MySQL crashes if you try to use RETURNING, so we strip it out.
    // WARNING: This means INSERT/UPDATE operations won't return the new data immediately.
    mysqlQuery = mysqlQuery.replace(/RETURNING \*|RETURNING \w+/gi, '');

    try {
      // 4. Execute the raw query using Prisma
      // Note: We use db.$queryRawUnsafe because we are manually building the query string
      const result = await db.$queryRawUnsafe(mysqlQuery, ...params);
      
      // 5. Ensure we return an array (Prisma sometimes returns objects for metadata)
      if (Array.isArray(result)) {
        return result;
      } 
      
      // If it's an INSERT/UPDATE result in MySQL, it's not an array of rows.
      // We return an empty array to prevent the app from crashing when it tries to read result[0].
      return [];
      
    } catch (error) {
      console.error("SQL Adapter Error:", error);
      throw error;
    }
  };
}
