import pool from '../db';

export const queryWithTimeout = async (text: string, params?: any[], timeout = 15000) => {
    return Promise.race([
        pool.query(text, params),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), timeout)
        )
    ]);
};

export const safeQuery = async (text: string, params?: any[], retries = 2) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await queryWithTimeout(text, params);
        } catch (error: any) {
            console.error(`Query attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) throw error;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    throw new Error('Max retries exceeded');
};
