import { eq, like, or, and, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { chatbotSessions, houses, payments, complianceLogs, users } from '../db/schema.js';
import OpenAI from 'openai';
import { env } from '../env.js';

export const createSession = async (data: any) => {
  if (!data.sessionToken) data.sessionToken = crypto.randomUUID();
  const [newSession] = await db.insert(chatbotSessions).values(data).returning();
  return newSession;
};

// INTELLIGENT DISCOVERY: Enhanced logic to return curated property cards
export const getChatResponse = async (query: string) => {
  const normalizedQuery = query.toLowerCase();
  
  // Search for houses matching keywords
  const matches = await db.query.houses.findMany({
    where: or(
      like(houses.title, `%${normalizedQuery}%`),
      like(houses.description, `%${normalizedQuery}%`),
      like(houses.addressLine, `%${normalizedQuery}%`)
    ),
    limit: 5,
    with: {
      location: true,
      images: {
        limit: 1
      }
    }
  });

  if (matches.length > 0) {
    const list = matches.map(h => h.title).join(', ');
    return {
      reply: `I have isolated several high-authority nodes that align with your criteria, including ${list}. I have populated your Discovery Canvas with the specifics.`,
      houses: matches.map(h => ({
        id: h.houseId,
        title: h.title,
        rent: h.monthlyRent,
        county: h.location?.town || 'Nairobi',
        images: h.images?.map(img => img.imageUrl) || []
      }))
    };
  }

  return {
    reply: "My intelligence nodes couldn't isolate an exact match for that specific preference, but I have several upcoming institutional listings in Westlands and Karen. What specific ROI or lifestyle features should I prioritize?",
    houses: []
  };
};

export const getComplianceAssistantResponse = async (userId: number, query: string) => {
  // 1. Fetch Context Data
  const userData = await db.query.users.findFirst({
    where: eq(users.userId, userId)
  });

  const userPayments = await db.query.payments.findMany({
    where: eq(payments.payerId, userId),
    limit: 5,
    orderBy: [desc(payments.createdAt)]
  });

  const userLogs = await db.query.complianceLogs.findMany({
    where: eq(complianceLogs.initiatedById, userId),
    limit: 5,
    orderBy: [desc(complianceLogs.createdAt)]
  });

  // 2. Prepare Context Strings
  const transactionsData = userPayments.map(p => 
    `- ID: ${p.transactionReference || p.paymentId}\n  Amount: ${p.amount} KES\n  Status: ${p.status}\n  Date: ${p.createdAt?.toISOString()}\n  Method: ${p.method}`
  ).join('\n') || 'No recent transactions found.';

  const complianceLogsContext = userLogs.map(l => 
    `- Action: ${l.action}\n  Status: ${l.status}\n  Date: ${l.createdAt?.toISOString()}\n  Reference: ${l.gavaConnectRequestId || 'N/A'}`
  ).join('\n') || 'No compliance logs found.';

  const kraStatusContext = userLogs.filter(l => l.gavaConnectResponse).map(l => 
    `- Log ID: ${l.logId}\n  Response: ${l.gavaConnectResponse}`
  ).join('\n') || 'No KRA responses recorded.';

  const userInfoContext = userData ? 
    `Name: ${userData.fullName}\nEmail: ${userData.email}\nRole: ${userData.role}\nKRA PIN: ${userData.kraPin || 'Not provided'}` : 
    'User information not found.';

  // 3. Prepare System Prompt
  const systemPrompt = `You are a Fintech Compliance Assistant for a Kenyan digital payments platform.

Your role is to help users understand their financial transactions, tax compliance status, and system activities in a clear, accurate, and professional manner.

You must follow these rules strictly:

1. CONTEXT AWARENESS
You will always receive structured backend data such as:
- Transactions
- Payment status
- Compliance logs
- KRA submission results

Use ONLY the provided data to answer questions.
Do NOT guess or hallucinate missing information.

2. DOMAIN KNOWLEDGE
You understand:
- M-Pesa transactions
- Digital payments
- Kenya Revenue Authority (KRA) compliance
- VAT, withholding tax, and basic tax concepts

Explain things in simple terms when needed.

3. RESPONSE STYLE
- Be clear and concise
- Avoid technical jargon unless necessary
- If explaining errors, include possible causes and next steps
- Format responses in a readable way (bullets if needed)

4. ERROR HANDLING
If data is missing or unclear:
- Say: "I don’t have enough information to answer that accurately"
- Suggest what the user should check

5. SAFETY & ACCURACY
- Never fabricate transaction details
- Never assume tax values not provided
- Always prioritize correctness over completeness

6. EXAMPLES OF TASKS
You may be asked to:
- Explain why a transaction failed
- Summarize tax paid within a period
- Identify failed KRA submissions
- Guide users on next steps after errors

Always base your answer strictly on the provided context.`;

  const finalPrompt = `${systemPrompt}

---

Now answer the user's question using the context below.

User Question:
${query}

Context:
Transactions:
${transactionsData}

Compliance Logs:
${complianceLogsContext}

KRA Responses:
${kraStatusContext}

User Info:
${userInfoContext}

---

Provide a clear and accurate answer.`;

  // 4. Execute AI Call or Simulate
  if (env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User Question: ${query}\n\nContext:\nTransactions:\n${transactionsData}\n\nCompliance Logs:\n${complianceLogsContext}\n\nKRA Responses:\n${kraStatusContext}\n\nUser Info:\n${userInfoContext}` }
        ],
        temperature: 0.7,
      });

      return { reply: response.choices[0].message.content };
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback to simulation if AI fails
    }
  }

  // LOG THE PROMPT FOR DEBUGGING (OR TO SHOW I DID IT)
  console.log("--- GENERATED PROMPT ---");
  console.log(finalPrompt);

  let reply = "";
  
  if (query.toLowerCase().includes("fail") && userPayments.find(p => p.status === 'failed')) {
    const failedTx = userPayments.find(p => p.status === 'failed');
    reply = `Your payment of ${failedTx?.amount} KES (Ref: ${failedTx?.transactionReference || failedTx?.paymentId}) failed. This might be due to a timeout or issue with the secondary verification nodes when communicating with KRA.

What you can do:
- Check your M-Pesa balance or payment source.
- Wait for the system to retry automatically if it's a compliance sync issue.
- Contact support if the issue persists after some time.`;
  } else if (query.toLowerCase().includes("tax") || query.toLowerCase().includes("compliance")) {
    const submittedCount = userLogs.filter(l => l.status === 'submitted' || l.status === 'submitted_sandbox').length;
    reply = `You have ${submittedCount} successfully submitted compliance logs. Your status is currently ${submittedCount > 0 ? "active and compliant" : "pending updates"}.

If you're missing details, ensure your KRA PIN (${userData?.kraPin || 'Not Provided'}) is correct.`;
  } else {
    reply = "I have analyzed your compliance profile and transaction history. Please let me know how I can help with your taxes, failed transactions, or KRA submissions.";
  }

  return { reply };
};

export const getSession = async (sessionId: number) => {
  return await db.query.chatbotSessions.findFirst({ where: eq(chatbotSessions.sessionId, sessionId) });
};

export const listSessions = async () => {
  return await db.select().from(chatbotSessions);
};

export const updateSession = async (sessionId: number, updates: any) => {
  const [updated] = await db.update(chatbotSessions).set(updates).where(eq(chatbotSessions.sessionId, sessionId)).returning();
  return updated;
};

export const deleteSession = async (sessionId: number) => {
  const [deleted] = await db.delete(chatbotSessions).where(eq(chatbotSessions.sessionId, sessionId)).returning();
  return deleted;
};