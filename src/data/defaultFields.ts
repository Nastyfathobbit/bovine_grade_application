import { DynamicFieldDefinition } from '../types';

export const DEFAULT_DYNAMIC_FIELDS: DynamicFieldDefinition[] = [
  {
    id: 'classification_date',
    label: 'Date of Classification',
    type: 'date',
    required: false,
    enabled: true,
  },
  {
    id: 'cow_weight',
    label: 'Cow Weight',
    type: 'number',
    placeholder: 'e.g. 540',
    unit: 'kg',
    required: false,
    enabled: true,
  },
  {
    id: 'Feedlot ID',
    label: 'Actual Animal ID',
    type: 'text',
    placeholder: 'Animal Ear Tag ID',
    required: false,
    enabled: true,
  },
];
