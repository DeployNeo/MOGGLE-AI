import { z } from "zod";

const faceShapeEnum = z.enum([
  "Oval",
  "Round",
  "Square",
  "Rectangle",
  "Diamond",
  "Heart",
  "Triangle",
]);

export const facialMetricsSchema = z.object({
  symmetry: z.number().min(0).max(100),
  jawline: z.number().min(0).max(100),
  eyes: z.number().min(0).max(100),
  nose: z.number().min(0).max(100),
  lips: z.number().min(0).max(100),
  harmony: z.number().min(0).max(100),
  faceWidth: z.number().nonnegative(),
  faceHeight: z.number().nonnegative(),
  eyeSpacing: z.number().nonnegative(),
  noseProportion: z.number().nonnegative(),
  lipProportion: z.number().nonnegative(),
  jawWidth: z.number().nonnegative(),
  chinProportion: z.number().min(0).max(100),
  upperThird: z.number().min(0).max(100),
  middleThird: z.number().min(0).max(100),
  lowerThird: z.number().min(0).max(100),
  eyeTilt: z.number().min(0).max(100),
  canthalTilt: z.number().min(0).max(100),
  jawProminence: z.number().min(0).max(100),
  chinProjection: z.number().min(0).max(100),
  facialFifths: z.array(z.number()),
});

export const faceShapeResultSchema = z.object({
  shape: faceShapeEnum,
  confidence: z.number().min(0).max(100),
  reasoning: z.string().min(1).max(2000),
});

export const analyzeRequestSchema = z.object({
  metrics: facialMetricsSchema,
  faceShape: faceShapeResultSchema,
  source: z.enum(["LIVE", "PHOTO"]).optional(),
  imageDataUrl: z.string().optional(),
});

export const analysisSaveSchema = z.object({
  source: z.enum(["LIVE", "PHOTO"]),
  result: z.object({
    metrics: facialMetricsSchema,
    faceShape: faceShapeResultSchema,
    hairstyles: z.array(z.unknown()),
    beards: z.array(z.unknown()),
    glasses: z.array(z.unknown()),
    skin: z.unknown(),
    fitness: z.unknown(),
    aiAnalysis: z.unknown().nullable(),
    recommendations: z.array(z.unknown()),
    imageDataUrl: z.string(),
    analyzedAt: z.number(),
    aiProvider: z.string().optional(),
  }),
});

export const coachRequestSchema = z.object({
  metrics: facialMetricsSchema,
});

export const analysisCreateSchema = z.object({
  source: z.enum(["LIVE", "PHOTO"]),
  imageUrl: z.string().url().optional(),
  faceShape: z.string().min(1),
  pslRating: z.string().min(1),
  pslNumeric: z.number().min(0).max(10),
  harmonyScore: z.number().min(0).max(100),
  symmetryScore: z.number().min(0).max(100),
  structuralScore: z.number().min(0).max(100),
  compositeScore: z.number().min(0).max(100),
  aiProvider: z.string().optional(),
  metrics: facialMetricsSchema,
  aiAnalysis: z.record(z.unknown()).optional(),
  recommendations: z
    .array(
      z.object({
        category: z.string().min(1),
        payload: z.record(z.unknown()),
      })
    )
    .optional(),
});

export const progressHistoryCreateSchema = z.object({
  analysisId: z.string().cuid(),
  harmonyScore: z.number().min(0).max(100),
  symmetryScore: z.number().min(0).max(100),
  pslNumeric: z.number().min(0).max(10),
});

export const activityLogCreateSchema = z.object({
  action: z.string().min(1).max(100),
  metadata: z.record(z.unknown()).optional(),
  ipAddress: z.string().ip().optional(),
});

export const subscriptionUpdateSchema = z.object({
  plan: z.enum(["FREE", "PRO", "PREMIUM"]),
  status: z.enum(["ACTIVE", "CANCELED", "PAST_DUE"]),
  stripeCustomerId: z.string().optional(),
  currentPeriodEnd: z.coerce.date().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
export type AnalysisCreateInput = z.infer<typeof analysisCreateSchema>;
export type FacialMetricsInput = z.infer<typeof facialMetricsSchema>;
export type FaceShapeResultInput = z.infer<typeof faceShapeResultSchema>;
export type ProgressHistoryCreateInput = z.infer<
  typeof progressHistoryCreateSchema
>;
export type ActivityLogCreateInput = z.infer<typeof activityLogCreateSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
