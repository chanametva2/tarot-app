export type Lang = 'th' | 'en';
export type Orientation = 'upright' | 'reversed';

export interface LocalizedText {
  th?: string;
  en?: string;
}

export interface DeckRegistry {
  deck_id: string;
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  author?: string;
  card_count: number;
  has_minor_arcana?: boolean;
  has_lookbook?: boolean;
  has_guidebook?: boolean;
  path: string;
}

export interface DeckBundle {
  manifest: Manifest;
  cards: CardRecord[];
  meanings: Record<string, MeaningRecord>;
  spreads: SpreadsData;
  lookbook?: {
    deck_id: string;
    entries: LookbookEntry[];
  };
  guidebook?: {
    deck_id: string;
    entries: GuidebookEntry[];
  };
}

export interface ModelProfile {
  model_name?: LocalizedText;
  model_stats?: {
    height_cm?: number;
    chest_in?: number;
    waist_in?: number;
    shoe_eu?: number;
  };
  key_features?: LocalizedText | LocalizedArray;
  signature_vibe?: LocalizedText;
  editorial_note?: LocalizedText;
}

export interface LookbookEntry {
  card_id: string;
  card: {
    number: number;
    roman: string;
    name: LocalizedText;
    image: string;
  };
  editorial_identity?: {
    archetype?: LocalizedText;
    visual_identity?: LocalizedText;
    aesthetic_tone?: LocalizedText | LocalizedArray;
    fashion_caption?: LocalizedText;
    model_profile?: ModelProfile;
  };
}

export interface GuidebookEntry {
  card_id: string;
  name: LocalizedText;
  number: number;
  roman: string;
  guidebook?: {
    archetype?: LocalizedText;
    symbolism?: LocalizedText | LocalizedArray;
    upright?: LocalizedText | LocalizedArray;
    reversed?: LocalizedText | LocalizedArray;
    oracle_message?: LocalizedText;
    fashion_caption?: LocalizedText;
    interpretive_note?: LocalizedText;
    reading_focus?: LocalizedText | LocalizedArray;
  };
}

export interface CardRecord {
  card_id: string;
  arcana: 'major' | 'minor';
  number?: number;
  roman?: string;
  suit_key?: string | null;
  suit_name?: LocalizedText;
  legacy_suit_en?: string;
  rank?: string | null;
  name: LocalizedText;
  image: string;
  manual_section?: string;
  manual_section_page_start?: number | null;
  model_profile?: ModelProfile;
}

export interface MeaningRecord {
  card_id: string;
  name: LocalizedText;
  quote?: LocalizedText;
  core_dhamma?: LocalizedArray;
  visual_description?: LocalizedText;
  dharma_essence?: LocalizedText;
  upright?: LocalizedArray;
  reversed?: LocalizedArray;
  reflection?: LocalizedText;
  story?: LocalizedText;
  [key: string]: unknown;
}

export interface LocalizedArray {
  th?: string[];
  en?: string[];
  [key: string]: unknown;
}

export interface Manifest {
  deck_id: string;
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  author?: string;
  language_support: Lang[];
  card_count: number;
  structure: {
    major: number;
    minor: number;
    minor_suits?: {
      suit_key: string;
      name: LocalizedText;
      legacy_name_en: string;
      count: number;
    }[];
  };
  assets?: {
    cover_image: string;
    back_image: string;
  };
  naming: {
    major_card_id_pattern: string;
    minor_card_id_patterns?: string[];
    image_extension: string;
  };
  card_aspect_ratio?: string;
}

export interface DrawResult {
  card: CardRecord;
  meaning: MeaningRecord;
  orientation: Orientation;
}

export interface SpreadPosition {
  position: number;
  key: string;
  label: LocalizedText;
}

export interface Spread {
  spread_id: string;
  name: LocalizedText;
  card_count: number;
  positions: SpreadPosition[];
}

export interface SpreadsData {
  deck_id: string;
  spreads: Spread[];
}
