import { storage } from "./storage";

// Error types for infrastructure operations
export type InfraErrorType = 
  | 'api_error'
  | 'rate_limit'
  | 'invalid_token'
  | 'network_failure'
  | 'validation_error'
  | 'permission_denied'
  | 'resource_not_found'
  | 'timeout'
  | 'unknown';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Bilingual error messages
const ERROR_MESSAGES: Record<InfraErrorType, { en: string; ar: string }> = {
  api_error: {
    en: 'API request failed',
    ar: 'فشل طلب API',
  },
  rate_limit: {
    en: 'Rate limit exceeded. Please wait before retrying',
    ar: 'تم تجاوز حد الطلبات. يرجى الانتظار قبل المحاولة مرة أخرى',
  },
  invalid_token: {
    en: 'Invalid or expired API token',
    ar: 'رمز API غير صالح أو منتهي الصلاحية',
  },
  network_failure: {
    en: 'Network connection failed',
    ar: 'فشل الاتصال بالشبكة',
  },
  validation_error: {
    en: 'Invalid input data',
    ar: 'بيانات الإدخال غير صالحة',
  },
  permission_denied: {
    en: 'You do not have permission for this action',
    ar: 'ليس لديك صلاحية لهذا الإجراء',
  },
  resource_not_found: {
    en: 'Resource not found',
    ar: 'المورد غير موجود',
  },
  timeout: {
    en: 'Operation timed out',
    ar: 'انتهت مهلة العملية',
  },
  unknown: {
    en: 'An unexpected error occurred',
    ar: 'حدث خطأ غير متوقع',
  },
};

// Error with context
export interface InfraError {
  type: InfraErrorType;
  severity: ErrorSeverity;
  message: string;
  messageAr: string;
  details?: string;
  retryable: boolean;
  retryAfter?: number; // seconds
  httpStatus: number;
  provider?: string;
  operation?: string;
  originalError?: Error;
}

// Map HTTP status to error type
function mapHttpStatusToErrorType(status: number): InfraErrorType {
  if (status === 401 || status === 403) return 'invalid_token';
  if (status === 404) return 'resource_not_found';
  if (status === 429) return 'rate_limit';
  if (status >= 400 && status < 500) return 'validation_error';
  if (status >= 500) return 'api_error';
  return 'unknown';
}

// Map error type to severity
function mapErrorTypeToSeverity(type: InfraErrorType): ErrorSeverity {
  switch (type) {
    case 'rate_limit':
    case 'timeout':
      return 'low';
    case 'validation_error':
    case 'resource_not_found':
      return 'medium';
    case 'api_error':
    case 'network_failure':
      return 'high';
    case 'invalid_token':
    case 'permission_denied':
      return 'critical';
    default:
      return 'medium';
  }
}

// Check if error is retryable
function isRetryable(type: InfraErrorType): boolean {
  return ['api_error', 'rate_limit', 'network_failure', 'timeout'].includes(type);
}

// Map error type to HTTP status
function mapErrorTypeToHttpStatus(type: InfraErrorType): number {
  switch (type) {
    case 'invalid_token':
      return 401;
    case 'permission_denied':
      return 403;
    case 'resource_not_found':
      return 404;
    case 'rate_limit':
      return 429;
    case 'validation_error':
      return 400;
    case 'timeout':
      return 408;
    default:
      return 500;
  }
}

// Create structured error from various inputs
export function createInfraError(
  input: {
    type?: InfraErrorType;
    httpStatus?: number;
    message?: string;
    details?: string;
    provider?: string;
    operation?: string;
    retryAfter?: number;
    originalError?: Error;
  }
): InfraError {
  const type = input.type || (input.httpStatus ? mapHttpStatusToErrorType(input.httpStatus) : 'unknown');
  const baseMessage = ERROR_MESSAGES[type];
  
  return {
    type,
    severity: mapErrorTypeToSeverity(type),
    message: input.message || baseMessage.en,
    messageAr: baseMessage.ar,
    details: input.details || input.originalError?.message,
    retryable: isRetryable(type),
    retryAfter: input.retryAfter,
    httpStatus: input.httpStatus || mapErrorTypeToHttpStatus(type),
    provider: input.provider,
    operation: input.operation,
    originalError: input.originalError,
  };
}

// Log error to database
export async function logInfraError(
  error: InfraError,
  context: {
    providerId?: string;
    serverId?: string;
    userId?: string;
    requestId?: string;
  }
): Promise<void> {
  try {
    await storage.createProviderErrorLog({
      providerId: context.providerId || 'unknown',
      providerType: error.provider || 'unknown',
      errorType: error.type,
      errorCode: String(error.httpStatus),
      errorMessage: `${error.message} | ${error.details || ''}`,
      httpStatus: error.httpStatus,
      endpoint: error.operation,
      resolved: false,
    });
  } catch (logError) {
    console.error('[ErrorManager] Failed to log error:', logError);
  }
}

// Format error for API response
export function formatErrorResponse(error: InfraError, language: 'en' | 'ar' = 'en'): {
  error: string;
  code: string;
  severity: ErrorSeverity;
  retryable: boolean;
  retryAfter?: number;
} {
  return {
    error: language === 'ar' ? error.messageAr : error.message,
    code: error.type,
    severity: error.severity,
    retryable: error.retryable,
    retryAfter: error.retryAfter,
  };
}

// Handle error in Express route
export async function handleInfraError(
  error: unknown,
  context: {
    provider?: string;
    operation?: string;
    providerId?: string;
    serverId?: string;
    userId?: string;
  },
  res: { status: (code: number) => { json: (body: unknown) => void } },
  language: 'en' | 'ar' = 'en'
): Promise<void> {
  let infraError: InfraError;
  
  if (error instanceof Error) {
    // Check for fetch errors
    if (error.message.includes('fetch')) {
      infraError = createInfraError({
        type: 'network_failure',
        provider: context.provider,
        operation: context.operation,
        originalError: error,
      });
    } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      infraError = createInfraError({
        type: 'timeout',
        provider: context.provider,
        operation: context.operation,
        originalError: error,
      });
    } else {
      infraError = createInfraError({
        type: 'unknown',
        message: error.message,
        provider: context.provider,
        operation: context.operation,
        originalError: error,
      });
    }
  } else {
    infraError = createInfraError({
      type: 'unknown',
      provider: context.provider,
      operation: context.operation,
    });
  }
  
  // Log to database
  await logInfraError(infraError, {
    providerId: context.providerId,
    serverId: context.serverId,
    userId: context.userId,
  });
  
  // Send response
  res.status(infraError.httpStatus).json(formatErrorResponse(infraError, language));
}

// Wrap async route handler with error handling
export function withInfraErrorHandling(
  handler: (req: any, res: any, next: any) => Promise<any>,
  context: { provider?: string; operation?: string }
): (req: any, res: any, next: any) => Promise<void> {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      const language = req.headers['accept-language']?.includes('ar') ? 'ar' : 'en';
      await handleInfraError(
        error,
        {
          ...context,
          userId: (req.user as any)?.claims?.sub,
        },
        res,
        language
      );
    }
  };
}
