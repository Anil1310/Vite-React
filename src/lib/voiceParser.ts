import { ExpenseCategory, PaymentMode } from '@/types/expense';

export interface ParsedVoiceExpense {
  title: string;
  amount: number | null;
  category: ExpenseCategory;
  paymentMode: PaymentMode;
  rawText: string;
}

const CATEGORY_KEYWORDS: { category: ExpenseCategory; words: string[] }[] = [
  {
    category: 'Food & Dining',
    words: ['lunch', 'dinner', 'breakfast', 'coffee', 'tea', 'chai', 'snack', 'snacks', 'restaurant', 'pizza', 'burger', 'food', 'meal', 'zomato', 'swiggy', 'cafe'],
  },
  {
    category: 'Groceries',
    words: ['grocery', 'groceries', 'milk', 'vegetable', 'vegetables', 'fruits', 'fruit', 'bread', 'ration', 'sabzi', 'supermarket', 'kirana', 'blinkit', 'zepto'],
  },
  {
    category: 'Travel & Fuel',
    words: ['petrol', 'diesel', 'fuel', 'cab', 'uber', 'ola', 'auto', 'rickshaw', 'bus', 'train', 'metro', 'ticket', 'flight', 'travel', 'toll', 'parking'],
  },
  {
    category: 'Bills & Utilities',
    words: ['bill', 'electricity', 'water', 'gas', 'wifi', 'broadband', 'internet', 'recharge', 'mobile', 'phone', 'rent', 'maintenance', 'dth'],
  },
  {
    category: 'Shopping',
    words: ['shopping', 'clothes', 'shirt', 'shoes', 'amazon', 'flipkart', 'myntra', 'dress', 'bag', 'watch', 'gift'],
  },
  {
    category: 'Health & Medical',
    words: ['medicine', 'pharmacy', 'doctor', 'hospital', 'clinic', 'health', 'medical', 'tablet', 'checkup', 'lab', 'test'],
  },
  {
    category: 'Entertainment',
    words: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'entertainment', 'pvr', 'inox'],
  },
  {
    category: 'Education',
    words: ['book', 'books', 'course', 'tuition', 'school', 'college', 'fees', 'stationery', 'pen', 'notebook', 'education'],
  },
];

const PAYMENT_KEYWORDS: { mode: PaymentMode; words: string[] }[] = [
  { mode: 'UPI', words: ['upi', 'gpay', 'google pay', 'phonepe', 'paytm', 'bhim', 'qr'] },
  { mode: 'Cash', words: ['cash', 'notes', 'rupees cash'] },
  { mode: 'Card', words: ['card', 'credit card', 'debit card', 'visa', 'mastercard', 'rupay', 'swipe'] },
  { mode: 'Net Banking', words: ['net banking', 'netbanking', 'neft', 'imps', 'rtgs', 'bank transfer', 'online banking'] },
];

export function parseVoiceExpense(transcript: string): ParsedVoiceExpense {
  const lower = transcript.toLowerCase().trim();

  // Extract amount (numbers like 250, 1500, 1,200, 45.50)
  const cleanedNumbers = lower.replace(/,/g, '');
  const amountMatch = cleanedNumbers.match(/(?:rs\.?|rupees|₹)?\s*(\d+(?:\.\d{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

  // Detect category
  let category: ExpenseCategory = 'Other';
  for (const item of CATEGORY_KEYWORDS) {
    if (item.words.some((w) => lower.includes(w))) {
      category = item.category;
      break;
    }
  }

  // Detect payment mode
  let paymentMode: PaymentMode = 'UPI';
  for (const item of PAYMENT_KEYWORDS) {
    if (item.words.some((w) => lower.includes(w))) {
      paymentMode = item.mode;
      break;
    }
  }

  // Build clean title
  let title = transcript
    .replace(/(?:spent|paid|bought|for|on|via|by|using|through|rs\.?|rupees|₹)/gi, ' ')
    .replace(/\b\d+(?:,\d+)*(?:\.\d{1,2})?\b/g, ' ')
    .replace(/\b(upi|gpay|google pay|phonepe|paytm|cash|credit card|debit card|card|net banking|netbanking)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!title) {
    title = `${category} Expense`;
  } else {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    title,
    amount,
    category,
    paymentMode,
    rawText: transcript,
  };
}
