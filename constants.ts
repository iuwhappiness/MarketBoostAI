
import { Marketplace, CopywritingStyle } from './types';

export const MARKETPLACE_OPTIONS = [
  { value: Marketplace.SHOPEE, label: 'Shopee' },
  { value: Marketplace.TIKTOK, label: 'TikTok Shop' },
  { value: Marketplace.TOKOPEDIA, label: 'Tokopedia' },
  { value: Marketplace.LAZADA, label: 'Lazada' },
];

export const COPYWRITING_STYLE_OPTIONS = [
  { value: CopywritingStyle.NATURAL, label: 'Natural (santai & ramah)' },
  { value: CopywritingStyle.PROFESIONAL, label: 'Profesional' },
  { value: CopywritingStyle.SOFT, label: 'Soft Selling (Halus)' },
  { value: CopywritingStyle.HARD, label: 'Hard Selling (Tegas)' },
  { value: CopywritingStyle.STORYTELLING, label: 'Storytelling (Bercerita)' },
  { value: CopywritingStyle.EDUKATIF, label: 'Edukatif' },
  { value: CopywritingStyle.FOMO, label: 'FOMO / Limited Offer' },
  { value: CopywritingStyle.BRANDING, label: 'Branding (Citra Merek)' },
  { value: CopywritingStyle.PREMIUM, label: 'Premium (Mewah)' },
];