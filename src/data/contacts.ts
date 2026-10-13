import type { TrustedContact } from '@/types';

// SAMPLE DATA — emergency contacts and trusted contacts for demo

export const EMERGENCY_NUMBERS = [
  { label: 'Police Control Room', number: '100', description: 'Chandigarh Police emergency helpline' },
  { label: 'Ambulance', number: '108', description: 'Emergency medical services' },
  { label: 'Fire Brigade', number: '101', description: 'Chandigarh Fire Service' },
  { label: 'Women Helpline', number: '1091', description: 'Women\'s distress helpline' },
  { label: 'Traffic Police', number: '1073', description: 'Chandigarh Traffic Police' },
  { label: 'Disaster Management', number: '1070', description: 'State disaster management authority' },
];

export const SAMPLE_TRUSTED_CONTACTS: TrustedContact[] = [
  { id: 'TC-001', name: 'Sample Contact — Family', relation: 'Family', phone: '+91-XXXXXXXXXX' },
  { id: 'TC-002', name: 'Sample Contact — Friend', relation: 'Friend', phone: '+91-XXXXXXXXXX' },
];
