import { incomeCategories, expenseCategories } from '../constants/categories';
import formatDate from './formatDate';

/**
 * Parses a voice transcript into transaction fields.
 * Examples:
 *   "Add income 500 salary today"
 *   "Expense 100 food yesterday"
 *   "Income 45000 salary Monday"
 *   "Spent 2000 on travel"
 */
const parseVoiceCommand = (transcript) => {
    if (!transcript) return null;

    const text = transcript.toLowerCase().trim();
    const result = {};

    // ---- 1. Detect Type ----
    if (text.includes('income') || text.includes('earning') || text.includes('earned') || text.includes('received')) {
        result.type = 'Income';
    } else if (text.includes('expense') || text.includes('spent') || text.includes('spend') || text.includes('cost') || text.includes('paid')) {
        result.type = 'Expense';
    }

    // ---- 2. Extract Amount ----
    const amountPatterns = [
        /(?:rupees?|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)/i,
        /(\d+(?:\.\d{1,2})?)\s*(?:rupees?|rs\.?|inr)/i,
        /(?:for|of|amount)\s+(\d+(?:\.\d{1,2})?)/i,
        /(\d+(?:\.\d{1,2})?)/,
    ];

    for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match) {
            result.amount = match[1];
            break;
        }
    }

    // ---- 3. Match Category ----
    const allCategories = [
        ...incomeCategories.map(c => ({ type: c.type, parentType: 'Income' })),
        ...expenseCategories.map(c => ({ type: c.type, parentType: 'Expense' })),
    ];

    // Exact match
    for (const cat of allCategories) {
        if (text.includes(cat.type.toLowerCase())) {
            result.category = cat.type;
            if (!result.type) result.type = cat.parentType;
            break;
        }
    }

    // Fuzzy/partial match
    if (!result.category) {
        const words = text.split(/\s+/);
        for (const cat of allCategories) {
            const catLower = cat.type.toLowerCase();
            for (const word of words) {
                if (word.length >= 3 && (catLower.includes(word) || word.includes(catLower))) {
                    result.category = cat.type;
                    if (!result.type) result.type = cat.parentType;
                    break;
                }
            }
            if (result.category) break;
        }
    }

    // ---- 4. Parse Date ----
    const parsedDate = parseDate(text);
    if (parsedDate) {
        result.date = parsedDate;
    }

    if (Object.keys(result).length === 0) return null;
    return result;
};

/**
 * Extracts a date from natural language text.
 * Supports: today, yesterday, day names (Monday-Sunday),
 * "last monday", "march 5th", "15th", etc.
 */
const parseDate = (text) => {
    const today = new Date();

    // "day before yesterday"
    if (text.includes('day before yesterday')) {
        const d = new Date(today);
        d.setDate(d.getDate() - 2);
        return formatDate(d);
    }

    // "today"
    if (text.includes('today')) {
        return formatDate(today);
    }

    // "yesterday"
    if (text.includes('yesterday')) {
        const d = new Date(today);
        d.setDate(d.getDate() - 1);
        return formatDate(d);
    }

    // "last week"
    if (text.includes('last week')) {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        return formatDate(d);
    }

    // Day names: "monday", "tuesday", etc.
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
        if (text.includes(days[i])) {
            const todayDay = today.getDay();
            let diff = todayDay - i;
            if (diff <= 0) diff += 7;
            const d = new Date(today);
            d.setDate(d.getDate() - diff);
            return formatDate(d);
        }
    }

    // Month + day: "march 5", "march 5th", "april 10th"
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'];
    for (let i = 0; i < months.length; i++) {
        const monthPattern = new RegExp(months[i] + '\\s+(\\d{1,2})(?:st|nd|rd|th)?', 'i');
        const match = text.match(monthPattern);
        if (match) {
            const d = new Date(today.getFullYear(), i, parseInt(match[1]));
            return formatDate(d);
        }
    }

    // Just a day number: "15th", "5th"
    const dayMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)\b/);
    if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        if (day >= 1 && day <= 31) {
            const d = new Date(today.getFullYear(), today.getMonth(), day);
            return formatDate(d);
        }
    }

    return null;
};

export default parseVoiceCommand;
