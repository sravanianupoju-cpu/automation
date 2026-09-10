/**
 * Reusable test data generators for the Create Lead flows.
 *
 * The app rejects a lead whose mobile number already exists in QA data
 * (confirmed: submitting a duplicate number surfaces a blocking
 * "Lead Already exists!" dialog), so every test must use a freshly
 * generated, random 10-digit Indian mobile number.
 */

/** Generates a random, syntactically valid 10-digit Indian mobile number (starts with 6-9). */
export function randomIndianMobileNumber(): string {
  const firstDigit = ['6', '7', '8', '9'][Math.floor(Math.random() * 4)];
  let rest = '';
  for (let i = 0; i < 9; i++) {
    rest += Math.floor(Math.random() * 10);
  }
  return firstDigit + rest;
}

/**
 * Builds a lead name safe for the "Name" field.
 * Confirmed constraints on the live field:
 *  - maxlength = 20
 *  - keydown handler restricts input to letters and spaces only (`^[a-zA-Z\s]*$`)
 */
export function uniqueLeadName(prefix: string): string {
  const lettersAndSpacesOnly = prefix.replace(/[^a-zA-Z\s]/g, '');
  return lettersAndSpacesOnly.slice(0, 20).trim();
}

/** Generates a unique, plausible email address for the optional "Email ID" field. */
export function randomEmail(prefix = 'autotest'): string {
  return `${prefix}.${Date.now()}@example.com`;
}

/** Generates a random rupee amount as a string, for numeric text fields like Booking Amount. */
export function randomAmount(min = 100000, max = 5000000): string {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

/** Generates a random unit number string, e.g. "A-101". */
export function randomUnitNo(): string {
  const block = String.fromCharCode(65 + Math.floor(Math.random() * 5)); // A-E
  const num = Math.floor(Math.random() * 900) + 100; // 100-999
  return `${block}-${num}`;
}
