import { RateLimiterOptions } from 'nestjs-rate-limiter';

const RateLimiterConfiguration: RateLimiterOptions = {
  for: 'Express',
  type: 'Memory',
  keyPrefix: 'global',
  points: 5,
  pointsConsumed: 1,
  inmemoryBlockOnConsumed: 1,
  duration: 60,
  blockDuration: 10,
  inmemoryBlockDuration: 1,
  maxQueueSize: 100,
  errorMessage: 'Rate limit exceeded, request blocked for 10 seconds',
};

export default RateLimiterConfiguration;
