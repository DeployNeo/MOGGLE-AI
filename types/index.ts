export type FaceShape =
  | "Oval"
  | "Round"
  | "Square"
  | "Rectangle"
  | "Diamond"
  | "Heart"
  | "Triangle";

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  country: string;
  photoURL: string | null;
  role: UserRole;
  scanCount: number;
  avgHarmony: number;
  avgSymmetry: number;
  avgPsl: number;
  favoriteHairstyles: string[];
  savedRecommendations: string[];
  joinDate: number;
  updatedAt: number;
}

export interface UserSettings {
  privacy: {
    profilePublic: boolean;
    showScans: boolean;
    showStats: boolean;
  };
  notifications: {
    analysisComplete: boolean;
    profileUpdates: boolean;
    systemAlerts: boolean;
    featureUpdates: boolean;
  };
  appearance: {
    theme: "dark" | "light" | "system";
    reducedMotion: boolean;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  type: "analysis" | "profile" | "system" | "feature";
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export interface FacialMetrics {
  symmetry: number;
  jawline: number;
  eyes: number;
  nose: number;
  lips: number;
  harmony: number;
  faceWidth: number;
  faceHeight: number;
  eyeSpacing: number;
  noseProportion: number;
  lipProportion: number;
  jawWidth: number;
  chinProportion: number;
  upperThird: number;
  middleThird: number;
  lowerThird: number;
  eyeTilt: number;
  canthalTilt: number;
  jawProminence: number;
  chinProjection: number;
  facialFifths: number[];
}

export interface FaceShapeResult {
  shape: FaceShape;
  confidence: number;
  reasoning: string;
}

export interface HairstyleRecommendation {
  name: string;
  score: number;
  reasoning: string;
  length?: string;
  texture?: string;
  volume?: string;
  products?: string[];
}

export interface BeardRecommendation {
  style: string;
  score: number;
  reasoning: string;
}

export interface GlassesRecommendation {
  style: string;
  score: number;
  reasoning: string;
}

export interface SkinRecommendation {
  routine: string[];
  hydration: string[];
  sleep: string[];
  guidance: string[];
}

export interface FitnessRecommendation {
  posture: string[];
  neck: string[];
  shoulders: string[];
  general: string[];
  bodyComposition: string[];
}

export interface CoachSuggestions {
  daily: string[];
  weekly: string[];
  monthly: string[];
  trends: string[];
}

export interface RecommendationItem {
  observation: string;
  recommendation: string;
  benefit: string;
}

export interface RecommendationSection {
  title: string;
  items: RecommendationItem[];
}

export type PSLRating =
  | "Sub-3"
  | "Sub-4"
  | "Sub-5"
  | "LTN"
  | "MTN"
  | "HTN"
  | "Chadlite"
  | "Chad";

export interface FeatureBreakdown {
  feature: string;
  score: number;
  verdict: string;
}

export interface AIAnalysisResult {
  faceShape: string;
  verdict: string;
  pslRating: PSLRating;
  pslNumeric: number;
  pslReasoning: string;
  pslCeiling: string;
  professionalAssessment: string;
  structuralScore: number;
  dimorphismScore: number;
  featureBreakdown: FeatureBreakdown[];
  strengths: string[];
  flaws: string[];
  improvements: string[];
  looksmaxxingPriority: string[];
  recommendedHaircuts: string[];
  recommendedGlasses: string[];
  skincare: string[];
  fitness: string[];
  posture: string[];
  confidence: number;
}

export interface SavedAnalysisRecord {
  id: string;
  userId: string;
  pslRating: string;
  pslNumeric: number;
  faceShape: string;
  harmonyScore: number;
  symmetryScore: number;
  compositeScore: number;
  source: "live" | "photo";
  imageUrl?: string | null;
  storagePath?: string | null;
  createdAt: number;
  metrics?: FacialMetrics;
  aiAnalysis?: AIAnalysisResult | null;
  hairstyles?: HairstyleRecommendation[];
  beards?: BeardRecommendation[];
  glasses?: GlassesRecommendation[];
}

export interface AnalysisResult {
  metrics: FacialMetrics;
  faceShape: FaceShapeResult;
  hairstyles: HairstyleRecommendation[];
  beards: BeardRecommendation[];
  glasses: GlassesRecommendation[];
  skin: SkinRecommendation;
  fitness: FitnessRecommendation;
  aiAnalysis: AIAnalysisResult | null;
  recommendations: RecommendationSection[];
  imageDataUrl: string;
  analyzedAt: number;
  aiProvider?: string;
}

export type AnalysisStatus =
  | "idle"
  | "loading"
  | "analyzing"
  | "success"
  | "error";

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export type ValidationMode = "standard" | "live";

export interface LiveAnalysisState {
  detection: FaceDetectionResult | null;
  isReady: boolean;
  hints: string[];
  fps: number;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface FaceDetectionResult {
  landmarks: LandmarkPoint[];
  faceCount: number;
  blurScore: number;
  faceSizeRatio: number;
  rotationAngle: number;
  brightnessScore?: number;
  overexposureScore?: number;
}

export type AIProvider = "openrouter" | "groq" | "cv-only";

export interface ProgressDataPoint {
  date: string;
  harmonyScore: number;
  symmetryScore: number;
  pslNumeric: number;
}

export interface ImprovementTimeline {
  harmony: ProgressDataPoint[];
  symmetry: ProgressDataPoint[];
  fitness: { date: string; note: string }[];
  skin: { date: string; note: string }[];
  hairstyles: { date: string; style: string }[];
}

export interface AdminStats {
  totalUsers: number;
  totalScans: number;
  scansToday: number;
  storageUsedMb: number;
  aiUsage: Record<string, number>;
  errorsLast7d: number;
}
