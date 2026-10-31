/**
 * Normalize and validate Indian mobile phone numbers to E.164 format (+91XXXXXXXXXX).
 * Accepts: "+91 9876543210", "919876543210", "09876543210", "9876543210".
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  // Extract only digits
  const digits = rawPhone.replace(/\D/g, '');

  let clean10 = '';
  if (digits.length === 10) {
    clean10 = digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    clean10 = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    clean10 = digits.slice(2);
  } else {
    return null;
  }

  // Indian mobile numbers start with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(clean10)) {
    return null;
  }

  return {
    e164: `+91${clean10}`,
    national: clean10,
  };
}
