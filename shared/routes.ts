import { z } from 'zod';
import { insertVendorSchema, insertRfpSchema, vendors, rfps, proposals, generateRfpSchema, sendRfpSchema, inboundEmailSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  vendors: {
    list: {
      method: 'GET' as const,
      path: '/api/vendors',
      responses: {
        200: z.array(z.custom<typeof vendors.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/vendors',
      input: insertVendorSchema,
      responses: {
        201: z.custom<typeof vendors.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/vendors/:id',
      input: insertVendorSchema.partial(),
      responses: {
        200: z.custom<typeof vendors.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  rfps: {
    list: {
      method: 'GET' as const,
      path: '/api/rfps',
      responses: {
        200: z.array(z.custom<typeof rfps.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/rfps/:id',
      responses: {
        200: z.custom<typeof rfps.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/rfps',
      input: insertRfpSchema,
      responses: {
        201: z.custom<typeof rfps.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/rfps/:id',
      input: insertRfpSchema.partial(),
      responses: {
        200: z.custom<typeof rfps.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/rfps/generate',
      input: generateRfpSchema,
      responses: {
        200: z.object({
          structuredRequirements: z.any(), // JSON
          title: z.string(),
        }),
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/rfps/:id/send',
      input: sendRfpSchema,
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  proposals: {
    list: {
      method: 'GET' as const,
      path: '/api/rfps/:id/proposals',
      responses: {
        200: z.array(z.custom<typeof proposals.$inferSelect>()),
      },
    },
    getRecommendation: {
      method: 'GET' as const,
      path: '/api/rfps/:id/recommendation',
      responses: {
        200: z.object({
          recommendation: z.string(),
          reasoning: z.string(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  webhooks: {
    email: {
      method: 'POST' as const,
      path: '/api/webhooks/email',
      input: inboundEmailSchema,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
