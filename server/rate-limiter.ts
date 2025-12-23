/**
 * Rate Limiter with Exponential Backoff for Anthropic API
 * Handles 429 rate limit errors gracefully with automatic retry
 * Uses mutex to serialize concurrent requests during cooldown
 */

interface RateLimitState {
  outputTokensRemaining: number;
  outputTokensLimit: number;
  resetTime: Date;
  isLimited: boolean;
  retryAfter: number;
}

class AsyncMutex {
  private locked = false;
  private queue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.();
    } else {
      this.locked = false;
    }
  }
}

class AnthropicRateLimiter {
  private state: RateLimitState = {
    outputTokensRemaining: 8000,
    outputTokensLimit: 8000,
    resetTime: new Date(),
    isLimited: false,
    retryAfter: 0,
  };

  private mutex = new AsyncMutex();
  private maxRetries = 3;
  private baseDelay = 1000; // 1 second

  updateFromHeaders(headers: any) {
    try {
      const remaining = headers.get?.('anthropic-ratelimit-output-tokens-remaining');
      const limit = headers.get?.('anthropic-ratelimit-output-tokens-limit');
      const reset = headers.get?.('anthropic-ratelimit-output-tokens-reset');
      const retryAfter = headers.get?.('retry-after');

      if (remaining !== null && remaining !== undefined) {
        this.state.outputTokensRemaining = parseInt(remaining, 10);
      }
      if (limit !== null && limit !== undefined) {
        this.state.outputTokensLimit = parseInt(limit, 10);
      }
      if (reset) {
        this.state.resetTime = new Date(reset);
      }
      if (retryAfter) {
        this.state.retryAfter = parseInt(retryAfter, 10);
        this.state.isLimited = true;
      }
    } catch (e) {
      console.error('[RateLimiter] Error parsing headers:', e);
    }
  }

  isRateLimited(): boolean {
    if (this.state.isLimited && new Date() > this.state.resetTime) {
      this.state.isLimited = false;
      this.state.outputTokensRemaining = this.state.outputTokensLimit;
    }
    return this.state.isLimited || this.state.outputTokensRemaining <= 0;
  }

  getWaitTime(): number {
    if (this.state.retryAfter > 0) {
      return this.state.retryAfter * 1000;
    }
    const now = new Date();
    const resetTime = this.state.resetTime;
    if (resetTime > now) {
      return resetTime.getTime() - now.getTime();
    }
    return 60000; // Default 1 minute
  }

  async executeWithRetry<T>(fn: () => Promise<T>, maxRetries = this.maxRetries): Promise<T> {
    // Serialize all API calls using mutex to prevent concurrent rate limit violations
    await this.mutex.acquire();
    
    try {
      let lastError: any;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // Check if we're rate limited before making request
          if (this.isRateLimited()) {
            const waitTime = Math.min(this.getWaitTime(), 65000); // Max 65 seconds
            console.log(`[RateLimiter] Rate limited. Waiting ${Math.round(waitTime / 1000)}s before attempt ${attempt + 1}/${maxRetries + 1}...`);
            await this.sleep(waitTime);
          }

          const result = await fn();
          
          // Reset rate limit state on success
          this.state.isLimited = false;
          this.state.retryAfter = 0;
          
          return result;
        } catch (error: any) {
          lastError = error;
          
          // Check if it's a rate limit error
          if (error?.status === 429 || error?.error?.type === 'rate_limit_error') {
            // Update state from error headers
            if (error.headers) {
              this.updateFromHeaders(error.headers);
            }
            
            this.state.isLimited = true;
            
            // Calculate backoff time
            const backoffTime = this.calculateBackoff(attempt);
            const waitTime = Math.max(backoffTime, this.state.retryAfter * 1000);
            
            console.log(`[RateLimiter] Rate limit hit. Attempt ${attempt + 1}/${maxRetries + 1}. Waiting ${Math.round(waitTime / 1000)}s...`);
            
            if (attempt < maxRetries) {
              await this.sleep(waitTime);
              continue;
            }
          } else {
            // Non-rate-limit error, throw immediately
            throw error;
          }
        }
      }
      
      // All retries exhausted
      console.error(`[RateLimiter] All ${maxRetries + 1} attempts failed`);
      throw lastError;
    } finally {
      // Always release mutex when done
      this.mutex.release();
    }
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s... with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // Add up to 1s of jitter
    return Math.min(exponentialDelay + jitter, 65000); // Max 65 seconds
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus(): RateLimitState {
    return { ...this.state };
  }
}

// Singleton instance
export const anthropicRateLimiter = new AnthropicRateLimiter();

// Helper function for wrapping API calls
export async function withRateLimitRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  return anthropicRateLimiter.executeWithRetry(fn, maxRetries);
}
