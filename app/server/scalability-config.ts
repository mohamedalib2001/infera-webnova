/**
 * INFERA WebNova - Scalability Configuration
 * تكوين قابلية التوسع لـ 5 مليون مستخدم
 * 
 * Architecture designed for:
 * - 5,000,000 concurrent users
 * - High availability (99.99% uptime)
 * - Low latency (<100ms average response)
 * - Horizontal scaling support
 */

export const SCALABILITY_CONFIG = {
  // Target capacity
  targetUsers: 5_000_000,
  
  // Database connection pooling
  database: {
    // Connection pool settings for high traffic
    pool: {
      min: 10,           // Minimum connections
      max: 100,          // Maximum connections (adjust based on PostgreSQL max_connections)
      acquireTimeout: 30000,  // 30 seconds
      idleTimeout: 10000,     // 10 seconds
      connectionTimeout: 5000, // 5 seconds
      maxUses: 7500,     // Close connection after this many uses
    },
    
    // Read replicas for scaling reads
    readReplicas: {
      enabled: false,    // Enable when deploying multiple DB instances
      count: 2,
      loadBalancing: 'round-robin', // round-robin, random, least-connections
    },
    
    // Query optimization
    queryOptimization: {
      slowQueryThreshold: 1000, // Log queries taking > 1 second
      queryCache: true,
      preparedStatements: true,
      batchSize: 1000,   // For bulk operations
    },
    
    // Partitioning strategy for large tables
    partitioning: {
      enabled: true,
      strategy: 'range', // range, list, hash
      tables: [
        { name: 'users', column: 'created_at', interval: 'monthly' },
        { name: 'login_sessions', column: 'login_at', interval: 'weekly' },
        { name: 'ai_audit_logs', column: 'created_at', interval: 'daily' },
        { name: 'sovereign_audit_logs', column: 'created_at', interval: 'daily' },
        { name: 'notifications', column: 'created_at', interval: 'monthly' },
        { name: 'messages', column: 'created_at', interval: 'monthly' },
      ],
    },
  },
  
  // Caching configuration
  cache: {
    enabled: true,
    type: 'memory', // memory, redis (upgrade to redis for production)
    
    // Cache TTL settings (in seconds)
    ttl: {
      user: 300,          // 5 minutes for user data
      session: 1800,      // 30 minutes for sessions
      config: 3600,       // 1 hour for configurations
      static: 86400,      // 24 hours for static data
      templates: 7200,    // 2 hours for templates
    },
    
    // Cache size limits
    limits: {
      maxItems: 100000,   // Maximum cached items
      maxSize: '512mb',   // Maximum cache size
    },
    
    // Cache invalidation
    invalidation: {
      strategy: 'write-through', // write-through, write-behind, cache-aside
      onUpdate: true,
      onDelete: true,
    },
  },
  
  // Rate limiting for API protection
  rateLimiting: {
    enabled: true,
    
    // Global rate limits
    global: {
      windowMs: 60000,    // 1 minute window
      maxRequests: 1000,  // 1000 requests per minute per IP
    },
    
    // Endpoint-specific limits
    endpoints: {
      auth: {
        windowMs: 60000,
        maxRequests: 10,   // 10 login attempts per minute
      },
      api: {
        windowMs: 60000,
        maxRequests: 100,  // 100 API calls per minute per user
      },
      search: {
        windowMs: 60000,
        maxRequests: 30,   // 30 searches per minute
      },
      ai: {
        windowMs: 60000,
        maxRequests: 20,   // 20 AI requests per minute
      },
      upload: {
        windowMs: 3600000, // 1 hour
        maxRequests: 50,   // 50 uploads per hour
      },
    },
    
    // Rate limit by user tier
    tierMultipliers: {
      free: 1,
      basic: 2,
      pro: 5,
      enterprise: 10,
      sovereign: 20,
    },
  },
  
  // Load balancing configuration
  loadBalancing: {
    enabled: true,
    algorithm: 'least-connections', // round-robin, least-connections, ip-hash
    healthCheck: {
      enabled: true,
      interval: 10000,    // 10 seconds
      timeout: 5000,      // 5 seconds
      unhealthyThreshold: 3,
    },
  },
  
  // Session management for high concurrency
  session: {
    store: 'database',   // memory, database, redis
    maxConcurrentSessions: 5, // Per user
    sessionTimeout: 86400000, // 24 hours in ms
    rollingSession: true,
    
    // Session cleanup
    cleanup: {
      enabled: true,
      interval: 3600000,  // Every hour
      expiredSessionsTTL: 604800000, // 7 days
    },
  },
  
  // Background job processing
  jobs: {
    enabled: true,
    concurrency: 10,      // Parallel job workers
    
    // Job queues
    queues: {
      email: { priority: 'high', retries: 3 },
      notification: { priority: 'high', retries: 3 },
      analytics: { priority: 'low', retries: 1 },
      cleanup: { priority: 'low', retries: 1 },
      backup: { priority: 'medium', retries: 3 },
    },
  },
  
  // Monitoring and observability
  monitoring: {
    enabled: true,
    metrics: {
      collectInterval: 5000,  // 5 seconds
      retentionDays: 30,
    },
    
    // Alerts thresholds
    alerts: {
      cpuThreshold: 80,       // Alert at 80% CPU
      memoryThreshold: 85,    // Alert at 85% memory
      diskThreshold: 90,      // Alert at 90% disk
      errorRateThreshold: 5,  // Alert at 5% error rate
      latencyThreshold: 1000, // Alert at 1s average latency
    },
  },
  
  // Auto-scaling rules
  autoScaling: {
    enabled: false,  // Enable with Hetzner Cloud integration
    minInstances: 2,
    maxInstances: 10,
    
    // Scale up rules
    scaleUp: {
      cpuThreshold: 70,
      memoryThreshold: 75,
      requestsPerSecond: 1000,
      cooldown: 300,  // 5 minutes
    },
    
    // Scale down rules
    scaleDown: {
      cpuThreshold: 30,
      memoryThreshold: 40,
      requestsPerSecond: 200,
      cooldown: 600,  // 10 minutes
    },
  },
} as const;

// Calculate estimated resources for 5M users
export function calculateResourceEstimates(userCount: number = 5_000_000) {
  const peakConcurrentUsers = Math.ceil(userCount * 0.05); // 5% concurrent
  const requestsPerSecond = Math.ceil(peakConcurrentUsers * 0.1); // 10% active
  
  return {
    userCount,
    peakConcurrentUsers,
    requestsPerSecond,
    
    // Database recommendations
    database: {
      connections: Math.min(Math.ceil(requestsPerSecond / 10), 500),
      storage: `${Math.ceil(userCount / 100000)}GB`, // ~10KB per user
      memory: `${Math.ceil(requestsPerSecond / 100)}GB`,
    },
    
    // Server recommendations
    servers: {
      apiServers: Math.ceil(requestsPerSecond / 500),
      webServers: Math.ceil(peakConcurrentUsers / 10000),
      workerServers: Math.ceil(requestsPerSecond / 1000),
    },
    
    // Cache recommendations
    cache: {
      size: `${Math.ceil(peakConcurrentUsers / 1000)}GB`,
      connections: Math.ceil(requestsPerSecond / 50),
    },
  };
}

// Export for use in application
export const resourceEstimates = calculateResourceEstimates(SCALABILITY_CONFIG.targetUsers);

console.log('[Scalability] Configured for', SCALABILITY_CONFIG.targetUsers.toLocaleString(), 'users');
console.log('[Scalability] Peak concurrent users:', resourceEstimates.peakConcurrentUsers.toLocaleString());
console.log('[Scalability] Estimated requests/second:', resourceEstimates.requestsPerSecond.toLocaleString());
