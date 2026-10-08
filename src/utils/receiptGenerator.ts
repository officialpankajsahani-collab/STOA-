/**
 * Utility functions for generating official STOA Membership Renewal Receipts
 * Matching the authentic Sambalpur Truck Owners' Association physical receipt voucher.
 */

/**
 * Converts numeric amount to official uppercase words in English
 * e.g. 300 -> "THREE HUNDRED ONLY"
 * e.g. 1500 -> "ONE THOUSAND FIVE HUNDRED ONLY"
 */
export function amountToWords(num: number): string {
  if (num === 0) return 'ZERO RUPEES ONLY';
  
  const ones = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
    'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  function convertBelowThousand(n: number): string {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' HUNDRED ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = num;

  if (crore > 0) words += convertBelowThousand(crore) + 'CRORE ';
  if (lakh > 0) words += convertBelowThousand(lakh) + 'LAKH ';
  if (thousand > 0) words += convertBelowThousand(thousand) + 'THOUSAND ';
  if (remainder > 0) words += convertBelowThousand(remainder);

  return (words.trim().replace(/\s+/g, ' ') + ' ONLY').toUpperCase();
}

/**
 * Format date in official receipt format DD-MM-YYYY
 * e.g. "14-05-2025" or "04-10-2026"
 */
export function formatReceiptDate(dateInput?: Date | string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '14-05-2025';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Calculates official Indian Financial Year string
 * April to March (e.g. 2025-26, 2026-27)
 */
export function getFinancialYear(dateInput?: Date | string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '2025-26';
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 is January, 3 is April
  if (month >= 3) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
}
