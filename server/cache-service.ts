/**
 * INFERA WebNova - In-Memory Cache Service
 * خدمة التخزين المؤقت في الذاكرة
 * 
 * High-performance caching layer for 5 million users
 * طبقة تخزين مؤقت عالية الأداء لـ 5 مليون مستخدم
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // Statistics
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };
  
  constructor(maxSize: number = 100000) {
    this.maxSize = maxSize;
    this.startCleanupTimer();
  }
  
  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    entry.hits++;
    this.stats.hits++;
    return entry.value as T;
  }
  
  /**
   * Set a value in cache with TTL (in seconds)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      hits: 0,
    });
  }
  
  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deleted = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    return deleted;
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
      : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }
  
  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    // Find and remove the least used entry
    let minHits = Infinity;
    let minKey: string | null = null;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        minKey = key;
      }
    }
    
    if (minKey) {
      this.cache.delete(minKey);
      this.stats.evictions++;
    }
  }
  
  /**
   * Cleanup expired entries periodically
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let expired = 0;
      
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
          expired++;
        }
      }
      
      if (expired > 0) {
        console.log(`[Cache] Cleaned up ${expired} expired entries`);
      }
    }, 60000); // Every minute
  }
  
  /**
   * Stop the cleanup timer
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Cache key generators for common patterns
   */
  static keys = {
    user: (id: string) => `user:${id}`,
    userSession: (userId: string, sessionId: string) => `session:${userId}:${sessionId}`,
    config: (key: string) => `config:${key}`,
    template: (id: string) => `template:${id}`,
    project: (id: string) => `project:${id}`,
    platform: (tenantId: string) => `platform:${tenantId}`,
    rateLimit: (ip: string, endpoint: string) => `rate:${ip}:${endpoint}`,
  };
}

// TTL presets (in seconds)
export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 1800,          // 30 minutes
  HOUR: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
  
  // Specific data types
  USER: 300,           // User data: 5 minutes
  SESSION: 1800,       // Session data: 30 minutes
  CONFIG: 3600,        // Config data: 1 hour
  TEMPLATE: 7200,      // Templates: 2 hours
  STATIC: 86400,       // Static data: 24 hours
} as const;

// Create singleton instance
export const cache = new CacheService(100000); // 100K items max

console.log('[Cache] In-memory cache service initialized');
console.log('[Cache] Max entries:', cache.getStats().maxSize);

export default cache;
