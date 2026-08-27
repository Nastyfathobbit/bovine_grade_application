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
    id: 'approximate_age',
    label: 'Approximate Age',
    type: 'text',
    placeholder: 'e.g. 3.5 years / 42 mo',
    required: false,
    enabled: true,
  },
];
