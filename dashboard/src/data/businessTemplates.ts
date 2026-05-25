import Papa from 'papaparse';
import businessTemplatesCsv from '../../../business_type,message_template.csv?raw';

type BusinessTemplateCsvRow = {
  business_type: string;
  message_template: string;
};

const BUSINESS_TYPE_EMOJIS: Record<string, string> = {
  'AC repair service': '❄️',
  'Appliance repair service': '🛠️',
  Bakery: '🥐',
  'Beauty parlour': '💄',
  'Bike service centre': '🏍️',
  'Building material shop': '🧱',
  'CA office': '📊',
  Café: '☕',
  'Car service centre': '🚗',
  'Clinic inside hospital': '🏥',
  'Coaching centre': '📚',
  'Computer repair service': '💻',
  'Consultancy firm': '💼',
  'Dental clinic': '🦷',
  'Diagnostic lab': '🧪',
  'Electronics retail shop': '🔌',
  'Event planner': '🎉',
  'Eye clinic': '👓',
  'Fashion retail shop': '👗',
  'Fitness centre': '💪',
  'Furniture retail shop': '🛋️',
  Garage: '🔧',
  'General medical clinic': '🩺',
  'Guest house': '🏡',
  Gym: '💪',
  'Hardware shop': '🔩',
  Homestay: '🏠',
  Hotel: '🏨',
  'Legal firm': '⚖️',
  'Medical store': '💊',
  'Mobile repair service': '📱',
  'Mobile retail shop': '📱',
  Other: '✨',
  'Pet grooming': '🐶',
  'Pet shop': '🐾',
  Pharmacy: '💊',
  'Photocopy centre': '📄',
  Photographer: '📸',
  'Physiotherapy clinic': '🏃',
  'Printing press': '🖨️',
  'Property dealer': '🏢',
  'Real estate agent': '🏘️',
  Restaurant: '🍽️',
  Salon: '💇',
  'Sanitary shop': '🚿',
  'Skin clinic': '✨',
  Spa: '💆',
  'Stationery shop': '✏️',
  Studio: '🎥',
  'Tile shop': '🏗️',
  'Tour operator': '🧳',
  'Training institute': '🎓',
  'Travel agency': '✈️',
  'Tuition class': '📘',
  'Tyre shop': '🛞',
  'Veterinary clinic': '🐾',
  'Yoga studio': '🧘',
};

const DEFAULT_BODY_TEMPLATE =
  'thank you for choosing {{business_name}}. We’d really appreciate if you could take a moment to share your experience with us';

const getBusinessTypeEmoji = (businessType: string) => BUSINESS_TYPE_EMOJIS[businessType] || BUSINESS_TYPE_EMOJIS.Other;

const boldTemplateValues = (message: string) => {
  return message
    .replaceAll('{{business_name}}', '*{{business_name}}*')
    .replaceAll('{{name}}', '*{{name}}*')
    .replaceAll('{{link}}', '*{{link}}*');
};

const cleanTemplateBody = (messageTemplate: string) => {
  const body = messageTemplate
    .trim()
    .replace(/^Hi\s+\{\{name\}\},?\s*/i, '')
    .replace(/\s*:?\s*\{\{link\}\}\s*$/i, '')
    .replace(/[.!?]\s*$/, '')
    .trim();

  return body ? `${body.charAt(0).toUpperCase()}${body.slice(1)}` : body;
};

const buildReviewMessageTemplate = (businessType: string, messageTemplate: string) => {
  const body = cleanTemplateBody(messageTemplate) || DEFAULT_BODY_TEMPLATE;
  return `Hi *{{name}}* 👋

${boldTemplateValues(body)} ${getBusinessTypeEmoji(businessType)}

👉 *{{link}}*`;
};

const parsedTemplates = Papa.parse<BusinessTemplateCsvRow>(businessTemplatesCsv, {
  header: true,
  skipEmptyLines: true,
}).data.filter((row) => row.business_type && row.message_template);

export const BUSINESS_TEMPLATE_OPTIONS = parsedTemplates.map((row) => ({
  businessType: row.business_type.trim(),
  messageTemplate: buildReviewMessageTemplate(row.business_type.trim(), row.message_template),
}));

export const DEFAULT_MESSAGE_TEMPLATE =
  BUSINESS_TEMPLATE_OPTIONS.find((option) => option.businessType === 'Other')?.messageTemplate
  || buildReviewMessageTemplate('Other', DEFAULT_BODY_TEMPLATE);

export const OTHER_MESSAGE_TEMPLATE = DEFAULT_MESSAGE_TEMPLATE;

export const BUSINESS_TYPES = BUSINESS_TEMPLATE_OPTIONS
  .map((option) => option.businessType)
  .sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b, 'en', { sensitivity: 'base' });
  });

export const getMessageTemplateForBusinessType = (businessType: string) => {
  return BUSINESS_TEMPLATE_OPTIONS.find((option) => option.businessType === businessType)?.messageTemplate
    || DEFAULT_MESSAGE_TEMPLATE;
};
