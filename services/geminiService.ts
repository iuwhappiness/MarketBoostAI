
import { GoogleGenAI, Type } from '@google/genai';
import type { ProductInput, GeneratedContent } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    trendAndStrategy: {
      type: Type.OBJECT,
      properties: {
        visualTrends: { type: Type.STRING, description: "Analisis mendalam tentang tren visual yang relevan." },
        copywritingTrends: { type: Type.STRING, description: "Analisis tren copywriting dan angle konten." },
        actionableAdvice: { type: Type.STRING, description: "Saran konkret untuk meningkatkan konversi." }
      },
      required: ["visualTrends", "copywritingTrends", "actionableAdvice"]
    },
    priceSuggestion: {
        type: Type.OBJECT,
        properties: {
            suggestedPriceRange: { type: Type.STRING, description: "Saran rentang harga jual." },
            justification: { type: Type.STRING, description: "Analisis berbasis data pasar dan nilai produk." }
        },
        required: ["suggestedPriceRange", "justification"]
    },
    titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Tiga (3) judul produk optimal (< 150 karakter) dengan SEO power tinggi."
    },
    shortDescription: {
        type: Type.STRING,
        description: "Hook pendek (2-3 kalimat)."
    },
    shortHighlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 poin singkat (Bullet points)."
    },
    bulletFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4-8 poin fitur utama detail."
    },
    longDescription: {
      type: Type.STRING,
      description: "Deskripsi lengkap (minimal 500 kata), mencakup skenario penggunaan, solusi masalah pembeli, integrasi fitur & spesifikasi, serta Hashtags."
    },
    whatsInTheBox: {
      type: Type.STRING,
      description: "Isi paket pembelian."
    },
    seoKeywords: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 Kata kunci utama." },
        secondary: { type: Type.ARRAY, items: { type: Type.STRING }, description: "8 Kata kunci sekunder." },
        longTail: { type: Type.ARRAY, items: { type: Type.STRING }, description: "10 Kata kunci long-tail spesifik." },
        backendTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "7 Search tags tersembunyi." }
      },
      required: ["primary", "secondary", "longTail", "backendTags"]
    },
    imageConcepts: {
      type: Type.OBJECT,
      properties: {
        hero: {
          type: Type.OBJECT,
          description: "Konsep Hero Image Utama.",
          properties: {
            explanation: { type: Type.STRING },
            rationale: { type: Type.STRING },
            prompt: { type: Type.STRING }
          },
          required: ["explanation", "rationale", "prompt"]
        },
        supporting: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING },
              rationale: { type: Type.STRING },
              prompt: { type: Type.STRING }
            },
            required: ["explanation", "rationale", "prompt"]
          },
          description: "Lima (5) konsep gambar pendukung yang variatif."
        },
        reasoning: { type: Type.STRING }
      },
      required: ["hero", "supporting", "reasoning"]
    },
    videoContent: {
      type: Type.OBJECT,
      properties: {
        hooks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 Hook viral 3-detik pertama." },
        storyboard: { 
            type: Type.ARRAY, 
            description: "Storyboard detail frame-by-frame.",
            items: {
                type: Type.OBJECT,
                properties: {
                    scene: { type: Type.STRING, description: "Nomor Scene dan Judul (e.g., Scene 1: Masalah)" },
                    visual: { type: Type.STRING, description: "Deskripsi visual detail apa yang terlihat di layar." },
                    audio: { type: Type.STRING, description: "Suara, Musik, atau Voiceover yang terdengar." },
                    duration: { type: Type.STRING, description: "Durasi scene (detik)." }
                },
                required: ["scene", "visual", "audio", "duration"]
            }
        }
      },
      required: ["hooks", "storyboard"]
    },
    complianceReport: {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING },
            notes: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["status", "notes"]
    }
  },
  required: [
    "trendAndStrategy", "priceSuggestion", "titles", "shortDescription", "shortHighlights", "bulletFeatures", "longDescription", "whatsInTheBox", 
    "seoKeywords", "imageConcepts", "videoContent", "complianceReport"
  ]
};

function buildPrompt(input: ProductInput): string {
  return `
**SYSTEM INSTRUCTION: MARKET BOOST INTELLIGENCE v4.5**

**BAHASA OUTPUT WAJIB: INDONESIA.**

**CORE ENGINE (5 PILLARS OF EXPERTISE):**
Anda adalah sistem kecerdasan buatan yang mensimulasikan diskusi tim ahli e-commerce kelas dunia. Aktifkan 5 persona ahli berikut secara internal:
1. **🕵️ Algorithm Strategist**, 2. **👁️ Visibility Architect**, 3. **🚀 Growth & Algorithm Expert**, 4. **📈 Growth Hacker**, 5. **📱 Social Optimizer**.

---
**TUGAS OPERASIONAL KHUSUS:**

1.  **DESKRIPSI PRODUK PANJANG (Long Description):**
    *   Wajib sangat detail dan persuasif (AIDA Framework).
    *   **Skenario Penggunaan:** Berikan contoh situasi nyata di mana produk ini sangat berguna (Use-case scenarios).
    *   **Pain Points:** Identifikasi masalah yang biasanya dihadapi calon pembeli dan bagaimana produk ini menyelesaikannya secara tuntas.
    *   **Integrasi Penuh:** Masukkan 'Key Highlights', 'Fitur Utama', dan 'Spesifikasi Teknik' ke dalam narasi deskripsi agar terlihat profesional.
    *   Gunakan Formatting (Bold, Bullet points) yang menarik.
    *   Tambahkan 15-20 Hashtags relevan di akhir.

2.  **SEO KEYWORDS (30 KEYWORDS):**
    *   Hasilkan TOTAL 30 kata kunci unik.
    *   Distribusi: 5 Primary, 8 Secondary, 10 Long-Tail, 7 Backend Tags.
    *   Fokus pada volume pencarian tinggi dan relevansi marketplace ${input.platform}.

3.  **JUDUL & VISUAL:**
    *   Judul optimal SEO dengan formula: [Keyword] + [USP] + [Specs].
    *   Konsep visual yang "Thumb-stopping".

**USER INPUT DATA:**
- Produk: ${input.productName}
- Material: ${input.materials}
- Target: ${input.targetMarket}
- Harga: ${input.estimatedPrice}
- Platform: ${input.platform}
- Gaya Bahasa: ${input.copywritingStyle}

**BRIEF SPESIFIK:**
"${input.additionalBrief || 'Optimasi standar maksimal.'}"

Hasilkan objek JSON sesuai skema. Pastikan total SEO keywords berjumlah tepat 30.
`;
}

export const generateProductContent = async (input: ProductInput): Promise<GeneratedContent> => {
  const model = 'gemini-3-flash-preview';

  const textPart = {
    text: buildPrompt(input),
  };

  const imageParts = input.images.map(image => ({
    inlineData: {
      mimeType: image.mimeType,
      data: image.data,
    },
  }));
  
  const contents = {
    parts: [textPart, ...imageParts]
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 4096 }, 
      },
    });

    if (!response.text) {
        throw new Error("Menerima respons kosong dari API.");
    }
    
    const parsedJson = JSON.parse(response.text);
    return parsedJson as GeneratedContent;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let friendlyMessage = "Terjadi kesalahan pada Market Boost Engine.";
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('safety')) {
            friendlyMessage = 'Konten diblokir filter keamanan AI.';
        } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
            friendlyMessage = 'Kuota API tercapai. Tunggu sejenak.';
        }
    }
    throw new Error(friendlyMessage);
  }
};

export const generateImageFromConcept = async (concept: string, baseImage: { data: string, mimeType: string }): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    const finalConcept = `${concept}. 
    
    INSTRUKSI VISUAL (SANGAT PENTING):
    1. PRODUK WAJIB 100% AKURAT: Pertahankan bentuk, warna, desain, dan label produk SAMA PERSIS dengan gambar referensi. Jangan mengubah atau memperbaiki produk sedikitpun.
    2. GAYA FOTO: User Generated Content (UGC), foto amatir menggunakan HP kelas menengah (non-flagship), pencahayaan natural apa adanya (non-studio).
    3. SUASANA: Terlihat seperti "Real Pic" testimoni pembeli asli, autentik, tidak diedit filter estetik, tekstur nyata, latar belakang generik (rumah/kantor biasa).`;

    const textPart = { text: finalConcept };
    const imagePart = {
        inlineData: {
            mimeType: baseImage.mimeType,
            data: baseImage.data,
        },
    };

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: {
                    parts: [imagePart, textPart]
                },
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part && part.inlineData) {
                return part.inlineData.data;
            }
            throw new Error("Tidak ada data gambar.");

        } catch (error: any) {
            lastError = error;
            const isRateLimit = error.message?.includes('429') || error.status === 429;
            if (isRateLimit) {
                 const delay = 2000 * Math.pow(2, attempt);
                 await sleep(delay);
                 continue;
            }
            if (attempt < maxRetries - 1) await sleep(1000);
        }
    }
    throw new Error("Gagal membuat gambar.");
};
