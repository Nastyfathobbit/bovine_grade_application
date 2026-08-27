export type TraitCategoryId = 'muscle' | 'skeletal' | 'capacity';

export type ProductionProfileCategory = 'PP3' | 'PP2-' | 'PP2+' | 'PP1';

export interface TraitDefinition {
  id: string;
  categoryId: TraitCategoryId;
  categoryName: string;
  anatomicSite: string;
  traitName: string;
  pp3Label: string; // Score 1 (PP3)
  pp1Label: string; // Score 10 (PP1)
  anatomicNotes?: string;
}

export type FieldType = 'text' | 'number' | 'date' | 'select';

export interface DynamicFieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select type
  unit?: string; // e.g. "kg", "months"
  enabled: boolean;
}

export interface CowRecord {
  id: string; // UUID
  cowId: string; // Assessor's COW ID (e.g. "COW-042")
  timestamp: number; // Unix timestamp
  traitScores: Record<string, number>; // traitId -> score (1-10)
  dynamicValues: Record<string, string | number>; // fieldId -> value
  finalProductionCategory?: ProductionProfileCategory; // Final Holistic PP Grade
  notes?: string;
  assessorName?: string;
}

export interface CategorySummary {
  categoryId: TraitCategoryId;
  categoryName: string;
  scoredCount: number;
  totalCount: number;
}
