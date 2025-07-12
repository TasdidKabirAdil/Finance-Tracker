const { GoogleGenerativeAI } = require('@google/generative-ai')
const dotenv = require('dotenv')
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const MODEL_NAME = 'gemini-2.5-flash-preview-05-20'

async function suggestThresholds({ monthlyIncome, savingAmount, categoricalThresholds }) {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const prompt = `
        You are a budgeting assistant. A user has a monthly income of $${monthlyIncome} and wants to save $${savingAmount}.

        Provided category thresholds:
        ${JSON.stringify(categoricalThresholds, null, 2)}

        Rules:
        1. Use only the listed categories. Do NOT add new ones.
        2. Fixed categories ("RENT", "UTILITY"): never adjust.
        3. Flexible categories ("FOOD", "SUBSCRIPTION", "TRANSPORT"): reduce between 0% to 30%.
        4. Volatile categories ("ENTERTAINMENT", "GAMES", "MISC"): reduce between 0% to 20%.
        5. If the total of original category amounts + savingAmount <= monthlyIncome:
        - Keep all category values as-is.
        - Recommendation: "Saving goal is feasible without adjustments."
        6. If savingAmount > monthlyIncome – sum(min-allowed thresholds):
        - Reduce categories to their minimum allowed.
        - Recommendation: "Desired saving of $${savingAmount} exceeds what's realistically possible. Maximum possible savings is $[computed_value]."
        7. Always return this JSON structure:
        {
        "suggestedThresholds": [ { "category": string, "amount": number }, ... ],
        "recommendationNote": string
        }
        8. If no categories are provided, return:
        {
        "suggestedThresholds": [],
        "recommendationNote": "No categories provided."
        }
    `;

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const jsonMatch = text.match(/\{[\s\S]*\}/)

        if (!jsonMatch) throw new Error('No valid JSON found')
        return JSON.parse(jsonMatch[0])
    } catch (err) {
        console.error('Gemini Error:', err)
        throw new Error('Failed to generate thresholds from Gemini.')
    }
}

module.exports = { suggestThresholds } 
