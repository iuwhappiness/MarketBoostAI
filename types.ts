
export enum Marketplace {
  SHOPEE = "Shopee",
  TIKTOK = "TikTok Shop",
  TOKOPEDIA = "Tokopedia",
  LAZADA = "Lazada",
}

export enum CopywritingStyle {
  NATURAL = "Natural",
  SOFT = "Soft Selling",
  HARD = "Hard Selling",
  STORYTELLING = "Storytelling",
  BRANDING = "Branding",
  PREMIUM = "Premium",
  PROFESIONAL = "Profesional",
  EDUKATIF = "Edukatif",
  FOMO = "FOMO",
}

export enum ToastType {
    INFO = "info",
    DANGER = "danger",
}

export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
}

// New MLAE v2.0 Output Structure
export interface SeoKeywords {
  primary: string[];
  secondary: string[];
  longTail: string[];
  backendTags: string[];
}

export interface DetailedImageConcept {
  explanation: string;
  rationale: string; // Added rationale
  prompt: string;
}

export interface ImageConcepts {
  hero: DetailedImageConcept;
  supporting: DetailedImageConcept[];
  reasoning: string;
}

export interface StoryboardScene {
  scene: string;
  visual: string;
  audio: string;
  duration: string;
}

export interface VideoContent {
  hooks: string[];
  storyboard: StoryboardScene[]; // Changed from script string to detailed storyboard array
}

export interface ComplianceReport {
  status: string;
  notes: string[];
}

export interface TrendAndStrategy {
  visualTrends: string;
  copywritingTrends: string;
  actionableAdvice: string;
}

export interface PriceSuggestion {
  suggestedPriceRange: string;
  justification: string;
}

export interface GeneratedContent {
  trendAndStrategy: TrendAndStrategy;
  priceSuggestion: PriceSuggestion;
  titles: string[];
  shortDescription: string; // Added short description
  shortHighlights: string[];
  bulletFeatures: string[];
  longDescription: string; // Will now include hashtags
  whatsInTheBox: string;
  seoKeywords: SeoKeywords;
  imageConcepts: ImageConcepts;
  videoContent: VideoContent;
  complianceReport: ComplianceReport;
}


// Input Structure
export interface ProductInput {
  images: { data: string; mimeType: string }[];
  productName: string;
  materials: string;
  targetMarket: string;
  platform: Marketplace;
  estimatedPrice: string;
  copywritingStyle: CopywritingStyle;
  additionalBrief: string; // New Field
}

// Project Saving Structure
export interface SavedProject {
  id: string;
  name: string;
  timestamp: string;
  input: {
    images: ImageFile[]; // Note: We only save metadata, not base64 in the input state
    productName: string;
    materials: string;
    targetMarket: string;
    estimatedPrice: string;
    platform: Marketplace | '';
    copywritingStyle: CopywritingStyle;
    additionalBrief: string; // New Field
  };
  result: GeneratedContent | null;
}
// Toast Structure
export interface ToastInfo {
    id: string;
    message: string;
    type: ToastType;
    action?: { label: string; onClick: () => void };
}

// Handler for Image Generation Section
export interface ImageGenerationSectionHandle {
  getGeneratedImages: () => Promise<{ title: string, data: string }[]>;
}
