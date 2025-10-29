
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Step1State, MarketAnalysisResult, ProductRecommendation, MvpGuide, PromoStrategy, GroundingChunk } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const safeJsonParse = <T,>(text: string): T | null => {
    try {
        // Find the start and end of the JSON object/array
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})|(\[[\s\S]*\])/);
        if (!jsonMatch) {
          console.error("No JSON found in text:", text);
          return null;
        }
        // Use the first non-null capturing group
        const jsonString = jsonMatch[1] || jsonMatch[2] || jsonMatch[3];
        if (!jsonString) {
          console.error("Could not extract JSON string from match:", jsonMatch);
          return null;
        }
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse JSON:", text, error);
        return null;
    }
};

export const analyzeMarket = async (inputs: Step1State['inputs']): Promise<MarketAnalysisResult | null> => {
    const industry = inputs.customIndustry || inputs.industries.join(', ');
    const prompt = `
        Anda adalah seorang analis pasar ahli dari Indonesia. 
        Berdasarkan informasi berikut:
        - Lokasi: ${inputs.location || 'Indonesia'}
        - Industri: ${industry || 'Semua Industri'}
        - Target Audiens: ${inputs.audience || 'Umum'}
        - Skala Bisnis: ${inputs.scale || 'Tidak ditentukan'}
        - Modal: ${inputs.capital ? `Rp ${parseInt(inputs.capital).toLocaleString('id-ID')}` : 'Tidak ditentukan'}

        Lakukan analisis pasar terkini menggunakan Google Search. 
        1. Berikan ringkasan analisis pasar yang tajam dan mudah dibaca (gunakan line breaks untuk readability).
        2. Identifikasi dan buat daftar 5 kebutuhan pasar (market needs) yang paling mendesak dan relevan.
        3. Untuk setiap kebutuhan, berikan skor dari 1-100 berdasarkan tingkat permintaan dan potensi saat ini.
        4. Urutkan daftar dari skor tertinggi ke terendah.

        Format output HANYA sebagai JSON (tanpa markdown "'''json"). Strukturnya harus seperti ini:
        {"summary": "Ringkasan analisis Anda di sini...", "market_needs": [{"need": "Nama kebutuhan pasar", "description": "Deskripsi singkat kebutuhan", "score": 95}]}
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                temperature: 0.5,
            },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
        const result = safeJsonParse<Omit<MarketAnalysisResult, 'sources'>>(response.text);

        if (!result) {
            throw new Error("Gagal mem-parsing respons dari AI.");
        }

        return { ...result, sources };
    } catch (error) {
        console.error("Error analyzing market:", error);
        // FIX: Added missing return statement in catch block.
        return null;
    }
};

export const getInDepthAnalysis = async (need: string, audience: string, capital: string): Promise<string | null> => {
    // FIX: The prompt template literal was not assigned to a variable.
    const prompt = `
        Anda adalah seorang analis bisnis dan produk senior. Lakukan analisis mendalam untuk kebutuhan pasar berikut: "${need}". 
        Informasi tambahan:
        - Target audiens: "${audience || 'Umum'}"
        - Perkiraan modal: Rp ${capital ? parseInt(capital).toLocaleString('id-ID') : 'Tidak ditentukan'}.

        Jabarkan secara detail dengan poin-poin berikut:
        - **Analisis Permintaan:** Jelaskan mengapa kebutuhan ini penting saat ini. Sertakan data atau persentase jika memungkinkan.
        - **Manfaat untuk Pelanggan:** Apa nilai utama yang didapat pelanggan?
        - **Potensi Keuntungan:** Berikan perkiraan potensi pendapatan (range minimum, rata-rata, dan maksimum per bulan) untuk bisnis yang memenuhi kebutuhan ini.
        - **Target Segmen:** Siapa segmen audiens yang paling ideal?

        Gunakan markup markdown untuk hirarki visual (bold, headings, lists). Highlight data penting. Buat agar tulisan sangat mudah dibaca dan poin-poin pentingnya langsung terlihat.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting in-depth analysis:", error);
        return null;
    }
};

export const getProductRecommendations = async (analysis: string): Promise<ProductRecommendation[] | null> => {
    // FIX: The prompt template literal was not assigned to a variable.
    const prompt = `
        Berdasarkan analisis mendalam ini: "${analysis}", berikan 3 rekomendasi produk atau layanan yang konkret dan inovatif.

        Untuk setiap rekomendasi:
        1. Beri nama produk yang menarik.
        2. Berikan skor (1-100) berdasarkan kesesuaian dengan analisis dan potensi sukses.
        3. Jelaskan manfaat utamanya bagi audiens.
        4. Sebutkan potensi tantangan atau kelemahannya.

        Format output HANYA sebagai JSON (tanpa markdown "'''json"). Strukturnya harus seperti ini:
        {"products": [{"name": "Nama Produk A", "score": 92, "benefits": "Manfaat produk A...", "weaknesses": "Kelemahan produk A..."}]}
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                temperature: 0.8,
            }
        });
        
        const result = safeJsonParse<{ products: ProductRecommendation[] }>(response.text);
        return result?.products || null;
    } catch (error) {
        console.error("Error getting product recommendations:", error);
        return null;
    }
};

export const getMvpGuide = async (productName: string, audience: string, capital: string): Promise<MvpGuide | null> => {
    // FIX: The prompt template literal was not assigned to a variable.
    const prompt = `
        Anda adalah seorang manajer produk berpengalaman. Buat panduan langkah-demi-langkah untuk membangun Minimum Viable Product (MVP) untuk produk: "${productName}".
        Konteks:
        - Target audiens: "${audience || 'Umum'}"
        - Modal awal: Rp ${capital ? parseInt(capital).toLocaleString('id-ID') : 'Tidak ditentukan'}.

        Sajikan panduan ini dalam format tabel.
        Format output HANYA sebagai JSON (tanpa markdown "'''json") dengan struktur:
        {"mvp_steps": [{"tahap": 1, "aktivitas": "Validasi Ide", "detail": "Lakukan survei online...", "estimasi_waktu": "1 Minggu", "estimasi_biaya_rp": 0}]}
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                temperature: 0.6,
            }
        });
        
        return safeJsonParse<MvpGuide>(response.text);
    } catch (error) {
        console.error("Error getting MVP guide:", error);
        return null;
    }
};

export const getPromoStrategy = async (productName: string, audience: string, startDate: string, endDate: string): Promise<PromoStrategy | null> => {
    // FIX: The prompt template literal was not assigned to a variable.
    const prompt = `
        Anda adalah seorang ahli strategi pemasaran digital. Buat strategi promosi yang komprehensif untuk produk "${productName}" yang menargetkan "${audience || 'Umum'}".
        Periode promosi: dari ${startDate} hingga ${endDate}.

        Sajikan dalam format tabel. Berikan rencana yang actionable dan realistis.
        Format output HANYA sebagai JSON (tanpa markdown "'''json") dengan struktur:
        {"promo_plan": [{"timeline": "Minggu 1", "kegiatan": "Setup Media Sosial", "keterangan": "Buat akun di Instagram & TikTok...", "tools": "Canva, Buffer", "estimasi_waktu": "5 jam", "estimasi_biaya_rp": 0, "deadline": "..."}]}
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                temperature: 0.7,
            }
        });
        
        return safeJsonParse<PromoStrategy>(response.text);
    } catch (error) {
        console.error("Error getting promo strategy:", error);
        return null;
    }
};
