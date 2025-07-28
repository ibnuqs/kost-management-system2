// src/pages/Landing/services/index.ts
export { default as landingService } from './landingService';
export { default as analyticsService } from './analyticsService';
export { default as newsletterService } from './newsletterService';

// Re-export types
export type { ApiResponse } from './landingService';
export type { AnalyticsEvent, PageViewEvent } from './analyticsService';
export type { NewsletterSubscription } from './newsletterService';