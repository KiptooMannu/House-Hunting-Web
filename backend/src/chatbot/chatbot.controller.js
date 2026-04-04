const { Op } = require('sequelize');
const { House, User } = require('../models');

// ===================== In-Memory Session Store =====================
// For production, replace with Redis or a database-backed store.
const sessions = new Map();

// Session expires after 15 minutes of inactivity
const SESSION_TTL_MS = 15 * 60 * 1000;

/**
 * Conversation steps (state machine):
 *   greeting → budget → location → type → results
 */
const STEPS = {
  GREETING: 'greeting',
  BUDGET: 'budget',
  LOCATION: 'location',
  TYPE: 'type',
  RESULTS: 'results',
};

// Known Kenyan counties for matching
const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Kiambu', 'Machakos', 'Nyeri', 'Meru', 'Nanyuki', 'Malindi',
  'Lamu', 'Garissa', 'Kitale', 'Kakamega', 'Bungoma', 'Embu',
  'Kericho', 'Naivasha', 'Nyandarua', 'Kajiado', 'Kilifi',
  'Kwale', 'Taita Taveta', 'Tana River', 'Isiolo', 'Marsabit',
  'Samburu', 'Turkana', 'West Pokot', 'Baringo', 'Uasin Gishu',
  'Trans Nzoia', 'Nandi', 'Laikipia', 'Bomet', 'Nyamira',
  'Kisii', 'Homa Bay', 'Migori', 'Siaya', 'Vihiga', 'Busia',
  'Kirinyaga', 'Murang\'a', 'Tharaka Nithi',
];

/**
 * Create or retrieve a session.
 */
function getSession(sessionId) {
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    session.lastActivity = Date.now();
    return { sessionId, session };
  }

  const session = {
    step: STEPS.GREETING,
    filters: {},
    lastActivity: Date.now(),
  };
  sessions.set(sessionId, session);
  return { sessionId, session };
}

/**
 * Clean up expired sessions (called periodically).
 */
function cleanupSessions() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupSessions, 5 * 60 * 1000);

/**
 * Extract a number from user input.
 */
function extractNumber(text) {
  // Handle K/k notation (e.g., "20k" → 20000)
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;

  // Handle comma-separated numbers (e.g., "20,000")
  const commaMatch = text.match(/([\d,]+(?:\.\d+)?)/);
  if (commaMatch) return parseFloat(commaMatch[1].replace(/,/g, ''));

  // Plain number
  const numMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1]);

  return null;
}

/**
 * Extract budget range from user input.
 * Supports: "5000-15000", "5k-15k", "under 10000", "below 10k",
 *           "above 20000", "around 15000", "15000"
 */
function extractBudget(text) {
  const lower = text.toLowerCase().trim();

  // Range: "5000-15000", "5k to 15k", "5000 - 20000"
  const rangeMatch = lower.match(/(\d+(?:\.\d+)?)\s*k?\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*k?/i);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1]);
    let max = parseFloat(rangeMatch[2]);
    // If small numbers, likely in K notation
    if (min < 500) min *= 1000;
    if (max < 500) max *= 1000;
    return { minRent: min, maxRent: max };
  }

  // "under/below/less than X"
  const underMatch = lower.match(/(?:under|below|less\s*than|max|up\s*to)\s*(\d+(?:\.\d+)?)\s*k?/i);
  if (underMatch) {
    let max = parseFloat(underMatch[1]);
    if (max < 500) max *= 1000;
    return { maxRent: max };
  }

  // "above/over/more than/at least X"
  const overMatch = lower.match(/(?:above|over|more\s*than|at\s*least|min|from)\s*(\d+(?:\.\d+)?)\s*k?/i);
  if (overMatch) {
    let min = parseFloat(overMatch[1]);
    if (min < 500) min *= 1000;
    return { minRent: min };
  }

  // "around/about X" → ±20%
  const aroundMatch = lower.match(/(?:around|about|roughly|approximately)\s*(\d+(?:\.\d+)?)\s*k?/i);
  if (aroundMatch) {
    let val = parseFloat(aroundMatch[1]);
    if (val < 500) val *= 1000;
    return { minRent: val * 0.8, maxRent: val * 1.2 };
  }

  // Single number
  const num = extractNumber(lower);
  if (num) {
    const val = num < 500 ? num * 1000 : num;
    // Treat as max budget
    return { maxRent: val };
  }

  return null;
}

/**
 * Extract county/location from user input.
 */
function extractLocation(text) {
  const lower = text.toLowerCase().trim();

  for (const county of KENYAN_COUNTIES) {
    if (lower.includes(county.toLowerCase())) {
      return county;
    }
  }

  // If no county matched, use the raw input as a location search
  if (lower.length > 1 && lower !== 'any' && lower !== 'anywhere' && lower !== 'skip') {
    return text.trim();
  }

  return null;
}

/**
 * Extract bedroom count from user input.
 */
function extractBedrooms(text) {
  const lower = text.toLowerCase().trim();

  // "studio", "bedsitter", "single"
  if (/studio|bedsitter|single|1\s*room/i.test(lower)) return 0;

  // "1 bedroom", "2br", "3 bed", etc.
  const brMatch = lower.match(/(\d+)\s*(?:bedroom|bed\s*room|br|bed)/i);
  if (brMatch) return parseInt(brMatch[1]);

  // Just a number
  const num = extractNumber(lower);
  if (num !== null && num >= 0 && num <= 10) return Math.floor(num);

  return null;
}

/**
 * Query houses with accumulated filters.
 */
async function searchHouses(filters) {
  const where = { status: 'available' };

  if (filters.minRent || filters.maxRent) {
    where.rent = {};
    if (filters.minRent) where.rent[Op.gte] = filters.minRent;
    if (filters.maxRent) where.rent[Op.lte] = filters.maxRent;
  }

  if (filters.county) {
    where[Op.or] = [
      { county: { [Op.iLike]: `%${filters.county}%` } },
      { location_name: { [Op.iLike]: `%${filters.county}%` } },
    ];
  }

  if (filters.bedrooms !== undefined && filters.bedrooms !== null) {
    where.bedrooms = filters.bedrooms;
  }

  const houses = await House.findAll({
    where,
    include: [
      {
        model: User,
        as: 'landlord',
        attributes: ['id', 'name', 'phone'],
      },
    ],
    order: [['rent', 'ASC']],
    limit: 10,
  });

  return houses;
}

/**
 * Format houses for chatbot response.
 */
function formatHouses(houses) {
  if (houses.length === 0) {
    return 'No houses found matching your criteria. Try adjusting your budget, location, or house type.';
  }

  let msg = `I found ${houses.length} house(s) for you:\n\n`;
  houses.forEach((h, i) => {
    const rent = parseFloat(h.rent).toLocaleString('en-KE');
    msg += `${i + 1}. **${h.title}**\n`;
    msg += `   📍 ${h.location_name || h.county || 'Location not specified'}\n`;
    msg += `   💰 KES ${rent}/month\n`;
    msg += `   🛏️ ${h.bedrooms} bedroom(s) | 🚿 ${h.bathrooms} bathroom(s)\n`;
    if (h.amenities && h.amenities.length > 0) {
      msg += `   ✨ ${h.amenities.join(', ')}\n`;
    }
    if (h.landlord) {
      msg += `   👤 Contact: ${h.landlord.name} (${h.landlord.phone || 'No phone'})\n`;
    }
    msg += '\n';
  });

  return msg;
}

/**
 * Process a chatbot message through the conversation state machine.
 */
async function processMessage(session, message) {
  const lower = message.toLowerCase().trim();

  // Handle reset commands at any step
  if (['restart', 'reset', 'start over', 'new search'].includes(lower)) {
    session.step = STEPS.GREETING;
    session.filters = {};
    return {
      reply: "No problem! Let's start fresh. 🏠\n\nI'm your House-Hunting Assistant. I'll help you find the perfect home in Kenya!\n\nWhat is your **monthly budget** for rent? (e.g., \"10,000 - 25,000\" or \"under 15k\")",
      step: STEPS.BUDGET,
    };
  }

  switch (session.step) {
    // ==================== GREETING ====================
    case STEPS.GREETING: {
      session.step = STEPS.BUDGET;
      return {
        reply: "Hello! 👋 Welcome to the House-Hunting Assistant! 🏠\n\nI'll help you find your ideal home in Kenya in just a few quick steps.\n\n**Step 1 of 3:** What is your **monthly budget** for rent?\n\nYou can say things like:\n- \"10,000 - 25,000\"\n- \"under 15k\"\n- \"above 20,000\"\n- \"around 30k\"",
        step: STEPS.BUDGET,
        options: ['Under 10k', '10k - 20k', '20k - 50k', 'Above 50k'],
      };
    }

    // ==================== BUDGET ====================
    case STEPS.BUDGET: {
      const budget = extractBudget(lower);

      if (!budget) {
        return {
          reply: "I didn't quite catch that. Please enter your budget as a number or range.\n\nExamples: \"15000\", \"10k-25k\", \"under 20,000\"",
          step: STEPS.BUDGET,
          options: ['Under 10k', '10k - 20k', '20k - 50k', 'Above 50k'],
        };
      }

      session.filters = { ...session.filters, ...budget };
      session.step = STEPS.LOCATION;

      const budgetDisplay = budget.minRent && budget.maxRent
        ? `KES ${budget.minRent.toLocaleString()} - ${budget.maxRent.toLocaleString()}`
        : budget.maxRent
          ? `up to KES ${budget.maxRent.toLocaleString()}`
          : `from KES ${budget.minRent.toLocaleString()}`;

      return {
        reply: `Great! Budget set to **${budgetDisplay}** per month. ✅\n\n**Step 2 of 3:** Which **location or county** in Kenya are you interested in?\n\nYou can name a county (e.g., Nairobi, Mombasa, Kiambu) or a specific area.\nType "any" to search all locations.`,
        step: STEPS.LOCATION,
        options: ['Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Kisumu', 'Any location'],
      };
    }

    // ==================== LOCATION ====================
    case STEPS.LOCATION: {
      if (lower !== 'any' && lower !== 'anywhere' && lower !== 'skip' && lower !== 'any location') {
        const location = extractLocation(message);
        if (location) {
          session.filters.county = location;
        }
      }

      session.step = STEPS.TYPE;

      const locDisplay = session.filters.county || 'All locations';

      return {
        reply: `Location: **${locDisplay}** ✅\n\n**Step 3 of 3:** How many **bedrooms** do you need?\n\nYou can say:\n- \"Studio\" or \"Bedsitter\" for a single room\n- \"1 bedroom\", \"2 bedrooms\", etc.\n- Or just a number like \"3\"`,
        step: STEPS.TYPE,
        options: ['Studio/Bedsitter', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'],
      };
    }

    // ==================== HOUSE TYPE ====================
    case STEPS.TYPE: {
      // Handle "4+" or "4 plus"
      if (/4\+|4\s*plus|four\s*plus/i.test(lower)) {
        // Search for 4 or more — we'll handle this specially
        session.filters.bedrooms = 4;
      } else {
        const bedrooms = extractBedrooms(message);
        if (bedrooms !== null) {
          session.filters.bedrooms = bedrooms;
        }
      }

      session.step = STEPS.RESULTS;

      // Execute search
      try {
        const houses = await searchHouses(session.filters);
        const formattedResults = formatHouses(houses);

        // Build summary of search criteria
        const criteria = [];
        if (session.filters.minRent) criteria.push(`Min: KES ${session.filters.minRent.toLocaleString()}`);
        if (session.filters.maxRent) criteria.push(`Max: KES ${session.filters.maxRent.toLocaleString()}`);
        if (session.filters.county) criteria.push(`Location: ${session.filters.county}`);
        if (session.filters.bedrooms !== undefined) {
          criteria.push(`Bedrooms: ${session.filters.bedrooms === 0 ? 'Studio' : session.filters.bedrooms}`);
        }

        return {
          reply: `🔍 **Search Results**\n\nYour criteria: ${criteria.join(' | ')}\n\n${formattedResults}\n\nType **"new search"** to start over, or adjust your criteria.`,
          step: STEPS.RESULTS,
          houses: houses.map((h) => ({
            id: h.id,
            title: h.title,
            rent: h.rent,
            location_name: h.location_name,
            county: h.county,
            bedrooms: h.bedrooms,
            bathrooms: h.bathrooms,
            amenities: h.amenities,
          })),
          options: ['New search', 'Lower budget', 'Different location'],
        };
      } catch (error) {
        console.error('Chatbot search error:', error);
        return {
          reply: 'Sorry, I encountered an error while searching. Please try again.',
          step: STEPS.TYPE,
        };
      }
    }

    // ==================== RESULTS (post-search) ====================
    case STEPS.RESULTS: {
      // Handle follow-up interactions after results
      if (lower.includes('lower budget') || lower.includes('cheaper')) {
        session.filters.maxRent = session.filters.maxRent
          ? session.filters.maxRent * 0.7
          : session.filters.minRent || 15000;
        session.filters.minRent = undefined;
        session.step = STEPS.TYPE;

        return {
          reply: `Budget lowered to **under KES ${Math.round(session.filters.maxRent).toLocaleString()}**.\n\nHow many bedrooms do you need?`,
          step: STEPS.TYPE,
          options: ['Studio/Bedsitter', '1 Bedroom', '2 Bedrooms', '3 Bedrooms'],
        };
      }

      if (lower.includes('different location') || lower.includes('change location')) {
        session.step = STEPS.LOCATION;
        return {
          reply: 'Which **location or county** would you like to search instead?',
          step: STEPS.LOCATION,
          options: ['Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Kisumu', 'Any location'],
        };
      }

      // Default: treat as new search
      session.step = STEPS.GREETING;
      session.filters = {};
      return processMessage(session, message);
    }

    default: {
      session.step = STEPS.GREETING;
      session.filters = {};
      return processMessage(session, 'hi');
    }
  }
}

// ===================== Controller Methods =====================

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot.
 * Body: { session_id?: string, message: string }
 */
const sendMessage = async (req, res, next) => {
  try {
    const { session_id, message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message.',
      });
    }

    const { sessionId, session } = getSession(session_id);
    const response = await processMessage(session, message.trim());

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        ...response,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chatbot/reset
 * Reset a chatbot session.
 * Body: { session_id: string }
 */
const resetSession = async (req, res, next) => {
  try {
    const { session_id } = req.body;

    if (session_id && sessions.has(session_id)) {
      sessions.delete(session_id);
    }

    res.json({
      success: true,
      message: 'Session reset successfully. Start a new conversation!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, resetSession };
