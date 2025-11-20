const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

class AIService {
  static async generatePGG(product) {
    const prompt = `Kamu adalah seorang copywriter dan marketing strategist yang ahli dalam menganalisis produk untuk content marketing.

Tugas kamu adalah menganalisis produk berikut dan buatkan:
1. 10 Pain Points (masalah yang dihadapi customer terkait produk ini) - harus spesifik dan relevan
2. 10 Gains (keuntungan/benefit produk yang jelas dan spesifik) - fokus pada value yang diberikan
3. 10 Goals (tujuan yang ingin dicapai customer dengan produk ini) - harus realistis dan achievable

Informasi Produk:
- Nama Produk: ${product.name}
- Deskripsi: ${product.description || 'Tidak ada deskripsi'}

Buatkan analisa yang akurat, spesifik, dan relevan. Hindari generic statements. Setiap pain point, gain, dan goal harus spesifik untuk produk ini.

Format output HANYA JSON (tanpa penjelasan tambahan):
{
  "pains": ["pain1", "pain2", "pain3", "pain4", "pain5", "pain6", "pain7", "pain8", "pain9", "pain10"],
  "gains": ["gain1", "gain2", "gain3", "gain4", "gain5", "gain6", "gain7", "gain8", "gain9", "gain10"],
  "goals": ["goal1", "goal2", "goal3", "goal4", "goal5", "goal6", "goal7", "goal8", "goal9", "goal10"]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const content = completion.choices[0].message.content;
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Invalid AI response format");
    } catch (error) {
      console.error("AI Service Error:", error.message);
      // Fallback jika AI error
      return {
        pains: [
          "Masalah umum 1",
          "Masalah umum 2",
          "Masalah umum 3",
          "Masalah umum 4",
          "Masalah umum 5",
          "Masalah umum 6",
          "Masalah umum 7",
          "Masalah umum 8",
          "Masalah umum 9",
          "Masalah umum 10",
        ],
        gains: [
          "Keuntungan 1",
          "Keuntungan 2",
          "Keuntungan 3",
          "Keuntungan 4",
          "Keuntungan 5",
          "Keuntungan 6",
          "Keuntungan 7",
          "Keuntungan 8",
          "Keuntungan 9",
          "Keuntungan 10",
        ],
        goals: [
          "Tujuan 1",
          "Tujuan 2",
          "Tujuan 3",
          "Tujuan 4",
          "Tujuan 5",
          "Tujuan 6",
          "Tujuan 7",
          "Tujuan 8",
          "Tujuan 9",
          "Tujuan 10",
        ],
      };
    }
  }

  static async generateBrief(product, funnel, tone, briefType, count = 5) {
    const funnelArray = Array.isArray(funnel) ? funnel : [funnel];
    const briefTypeArray = Array.isArray(briefType) ? briefType : [briefType];
    
    const prompt = `Kamu adalah seorang content creator dan copywriter profesional yang ahli dalam membuat ide konten viral untuk social media marketing.

Buatkan ${count} ide konten yang kreatif, menarik, dan viral-worthy dalam bentuk array JSON untuk produk berikut:

INFORMASI PRODUK:
- Nama Produk: ${product.name}
- Deskripsi: ${product.description || 'Tidak ada deskripsi'}
- Pain Points: ${(product.pains || []).join(", ") || 'Belum ada pain points'}
- Gains: ${(product.gains || []).join(", ") || 'Belum ada gains'}
- Goals: ${(product.goals || []).join(", ") || 'Belum ada goals'}

PARAMETER KONTEN:
- Funnel Stage yang dipilih: ${funnelArray.join(', ')}
- Gaya Bahasa/Tone of Voice: ${tone}
- Jenis Brief/Copywriting Formula: ${briefTypeArray.join(', ')}

REQUIREMENT SETIAP IDE KONTEN (setiap ide harus lengkap dan detail):
1. platform: Pilih secara acak dan variatif dari ["TikTok", "Instagram", "Shopee", "Meta", "YouTube"]
2. tag: Pilih secara acak dan variatif dari ["video", "carousel", "image"]
3. title: Buat judul konten yang menarik, catchy, dan sesuai dengan platform yang dipilih. Gunakan formula copywriting yang dipilih.
4. funnel: Pilih salah satu dari funnel stage yang dipilih di atas (${funnelArray.join(', ')}). Variasikan pilihan funnel untuk setiap ide.
5. objectiveCampaign: Tentukan objective campaign yang jelas dan spesifik (contoh: "Meningkatkan brand awareness", "Mendorong trial produk", "Meningkatkan conversion rate", dll)
6. decisionTrigger: Buat decision trigger yang kuat untuk mendorong action (contoh: "Limited time offer", "Exclusive discount", "Social proof", "Urgency", dll)
7. productValueHighlight: Highlight value proposition utama produk yang akan ditonjolkan dalam konten (maksimal 2-3 poin utama)
8. communicationApproach: Tentukan pendekatan komunikasi yang akan digunakan (contoh: "Storytelling", "Problem-Solution", "Testimonial", "Educational", dll)
9. hookOpening: Buat hook/opening yang kuat dan menarik untuk 3 detik pertama (untuk video) atau slide pertama (untuk carousel/image)
10. mainContentPoints: Buat 3-5 poin utama konten yang akan disampaikan (array of strings)
11. cta: Buat call to action yang sesuai dengan funnel stage dan platform. Contoh: "BELI SEKARANG", "TAP LINK", "SWIPE UP", "KLIK BIO", "COBA GRATIS", dll.
12. breakdownDetail: Buat breakdown detail konten berdasarkan format (video: scene breakdown, carousel: slide breakdown, image: element breakdown)
13. visualIdentityNote: Buat catatan visual identity yang akan digunakan (warna, mood, style, typography, dll)

PENTING:
- Setiap ide harus unik dan berbeda
- Semua field harus diisi dengan detail dan spesifik
- Gunakan pain points, gains, dan goals produk untuk membuat konten yang relevan
- Pastikan konten sesuai dengan karakteristik platform yang dipilih
- Objective campaign harus jelas dan measurable
- Decision trigger harus kuat dan relevan dengan funnel stage
- Product value highlight harus spesifik dan menarik
- Communication approach harus sesuai dengan tone of voice dan formula copywriting
- Hook/opening harus powerful dan attention-grabbing
- Main content points harus terstruktur dan jelas
- Breakdown detail harus actionable untuk production
- Visual identity note harus detail untuk design/production

Format output HANYA JSON array (tanpa penjelasan tambahan):
[
  {
    "platform": "TikTok",
    "tag": "video",
    "title": "Judul konten yang menarik dan catchy",
    "funnel": "${funnelArray[0] || 'awareness'}",
    "objectiveCampaign": "Objective campaign yang jelas",
    "decisionTrigger": "Decision trigger yang kuat",
    "productValueHighlight": "Value proposition utama produk",
    "communicationApproach": "Pendekatan komunikasi",
    "hookOpening": "Hook/opening yang powerful",
    "mainContentPoints": ["Poin 1", "Poin 2", "Poin 3"],
    "cta": "BELI SEKARANG",
    "breakdownDetail": "Breakdown detail konten",
    "visualIdentityNote": "Catatan visual identity"
  },
  ...
]`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = completion.choices[0].message.content;
      const contentLength = content.length;
      const finishReason = completion.choices[0].finish_reason;
      const wasTruncated = finishReason === 'length';

      console.log("AI Brief Generation Response:", {
        length: contentLength,
        preview: content.substring(0, 300),
        finishReason,
        count
      });

      if (wasTruncated) {
        console.warn("AI response was truncated due to token limit:", {
          contentLength,
          count
        });
      }

      // Extract JSON array
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Format respons AI tidak valid: Tidak ditemukan array JSON");
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Coba perbaiki JSON dengan menghapus trailing comma dan karakter tidak valid
        let cleanedJson = jsonMatch[0]
          .replace(/,\s*}/g, '}')  // Remove trailing comma before }
          .replace(/,\s*]/g, ']')  // Remove trailing comma before ]
          .replace(/,\s*,/g, ',')   // Remove double commas
          .replace(/:\s*,/g, ': null,')  // Replace missing values with null
          .replace(/[\u0000-\u001F]/g, '');  // Remove control characters
        
        try {
          parsed = JSON.parse(cleanedJson);
        } catch (e2) {
          console.error("Failed to parse AI brief response:", {
            originalError: e.message,
            cleanedError: e2.message,
            jsonPreview: jsonMatch[0].substring(0, 500),
            jsonLength: jsonMatch[0].length
          });
          throw new Error("Format respons AI tidak valid. Silakan coba lagi.");
        }
      }

      // Validasi bahwa hasilnya adalah array
      if (!Array.isArray(parsed)) {
        throw new Error("Format respons AI tidak valid: Bukan array");
      }

      // Validasi bahwa setiap item memiliki field yang diperlukan
      const validItems = parsed.filter(item => 
        item && 
        typeof item === 'object' && 
        item.platform && 
        item.tag && 
        item.title
      );

      if (validItems.length === 0) {
        throw new Error("Format respons AI tidak valid: Tidak ada item yang valid");
      }

      // Log untuk debugging - cek apakah semua field ter-generate
      if (process.env.NODE_ENV === 'development') {
        validItems.forEach((item, index) => {
          const missingFields = [];
          if (!item.objectiveCampaign) missingFields.push('objectiveCampaign');
          if (!item.decisionTrigger) missingFields.push('decisionTrigger');
          if (!item.productValueHighlight) missingFields.push('productValueHighlight');
          if (!item.communicationApproach) missingFields.push('communicationApproach');
          if (!item.hookOpening) missingFields.push('hookOpening');
          if (!item.mainContentPoints || !Array.isArray(item.mainContentPoints) || item.mainContentPoints.length === 0) missingFields.push('mainContentPoints');
          if (!item.breakdownDetail) missingFields.push('breakdownDetail');
          if (!item.visualIdentityNote) missingFields.push('visualIdentityNote');
          
          if (missingFields.length > 0) {
            console.warn(`⚠️ Brief Idea ${index + 1} missing fields:`, missingFields);
          } else {
            console.log(`✅ Brief Idea ${index + 1} all fields present`);
          }
        });
      }

      return validItems;
    } catch (error) {
      console.error("AI Service Error (generateBrief):", {
        message: error.message,
        stack: error.stack,
        count
      });
      // Fallback jika AI error
      return Array.from({ length: count }, (_, i) => ({
        platform: ["TikTok", "Instagram", "Shopee"][i % 3],
        tag: ["video", "carousel", "image"][i % 3],
        title: `Ide Konten ${i + 1}`,
        funnel: funnel,
        objectiveCampaign: "Meningkatkan brand awareness",
        decisionTrigger: "Limited time offer",
        productValueHighlight: "Kualitas premium dengan harga terjangkau",
        communicationApproach: "Storytelling",
        hookOpening: "Pernah merasa...",
        mainContentPoints: ["Poin 1", "Poin 2", "Poin 3"],
        cta: "BELI SEKARANG",
        breakdownDetail: "Detail konten akan di-generate",
        visualIdentityNote: "Warna brand, mood positif, style modern",
      }));
    }
  }

  static async generateDetail(briefRow, product, tone) {
    const { tag, title } = briefRow;
    let prompt = "";

    if (tag === "video") {
      prompt = `Kamu adalah seorang video content creator dan script writer profesional yang ahli dalam membuat konten video viral untuk social media.

Buatkan detail konten VIDEO 15 detik yang SANGAT LENGKAP, RINCI, dan DETAIL untuk judul: "${title}"

INFORMASI PRODUK:
- Nama Produk: ${product.name}
- Deskripsi: ${product.description || 'Tidak ada deskripsi'}
- Pain Points: ${(product.pains || []).join(", ") || 'Belum ada'}
- Gains: ${(product.gains || []).join(", ") || 'Belum ada'}
- Goals: ${(product.goals || []).join(", ") || 'Belum ada'}

PARAMETER KONTEN:
- Gaya Bahasa/Tone of Voice: ${tone}
- Judul Konten: "${title}"

REQUIREMENT DETAIL VIDEO (HARUS RINCI):
1. Scene Breakdown (WAJIB 5 scene dengan deskripsi yang DETAIL):
   - Scene 1 (0-2s): Hook yang sangat kuat. Deskripsikan: apa yang terlihat, gerakan kamera, ekspresi talent, teks overlay, emosi. Minimal 2-3 kalimat.
   - Scene 2 (3-5s): Pengenalan masalah. Deskripsikan: setting, props, lighting, angle kamera, visual masalah. Minimal 2-3 kalimat.
   - Scene 3 (6-9s): Solusi atau demo produk. Deskripsikan: bagaimana produk ditampilkan, fitur yang ditonjolkan, cara penggunaan, close-up shots. Minimal 3-4 kalimat.
   - Scene 4 (10-12s): Benefit atau hasil. Deskripsikan: testimoni visual, before-after, demonstrasi manfaat. Minimal 2-3 kalimat.
   - Scene 5 (13-15s): CTA dan closing. Deskripsikan: teks CTA, visual pendukung, closing statement. Minimal 2-3 kalimat.

2. Visual Description (HARUS DETAIL, minimal 6-8 kalimat):
   - Warna dominan dan palet warna (sebutkan kode warna jika perlu)
   - Mood dan atmosphere
   - Style visual (minimalist, vibrant, cozy, modern, dll)
   - Setting dan lokasi shooting (ruangan, outdoor, atau studio)
   - Props dan elemen visual
   - Lighting setup (natural light, soft lighting, dramatic lighting)
   - Camera movement dan angle (close-up, wide shot, tracking shot)
   - Style editing dan transisi

3. Music Suggestion (DETAIL, minimal 2-3 kalimat):
   - Genre musik yang tepat
   - Tempo dan beat (slow, medium, fast)
   - Mood musik (energetic, calm, dramatic)
   - Timing fade in/out

4. Caption (HARUS PANJANG, minimal 6-10 kalimat, 120-200 kata):
   - Hook yang sangat menarik di awal (2 kalimat)
   - Penjelasan masalah atau pain point yang relevan (2 kalimat)
   - Penjelasan solusi dan manfaat produk secara detail (2-3 kalimat)
   - Social proof atau urgency jika relevan (1 kalimat)
   - Call to action yang jelas dan compelling (1-2 kalimat)
   - 8-10 hashtag yang relevan, trending, dan sesuai dengan produk dan platform di akhir caption
   - Gunakan emoji yang relevan untuk meningkatkan engagement (3-5 emoji)
   
   Format caption: [Teks caption panjang dengan hook, masalah, solusi, manfaat, dan CTA] [spasi] [8-10 hashtag dipisahkan spasi]

PENTING:
- Setiap scene breakdown HARUS detail dan actionable, minimal 2-3 kalimat per scene
- Visual description HARUS lengkap untuk memudahkan production, minimal 5-7 kalimat
- Caption HARUS panjang (6-10 kalimat, 120-200 kata) dan engaging
- Semua deskripsi harus spesifik, tidak generic
- Output harus siap pakai untuk production team

PENTING: Output HARUS dalam format JSON yang valid. Jangan tambahkan penjelasan, markdown code blocks, atau teks lain di luar JSON. Hanya return JSON object saja. Pastikan semua string ditutup dengan quote yang benar.

Format output JSON (HARUS EXACT FORMAT INI):
{
  "detail": {
    "type": "video",
    "duration": "15 detik",
    "scenes": [
      {"time": "0-2s", "description": "Deskripsi scene 1 yang DETAIL (minimal 2-3 kalimat)"},
      {"time": "3-5s", "description": "Deskripsi scene 2 yang DETAIL (minimal 2-3 kalimat)"},
      {"time": "6-9s", "description": "Deskripsi scene 3 yang DETAIL (minimal 3-4 kalimat)"},
      {"time": "10-12s", "description": "Deskripsi scene 4 yang DETAIL (minimal 2-3 kalimat)"},
      {"time": "13-15s", "description": "Deskripsi scene 5 yang DETAIL (minimal 2-3 kalimat)"}
    ],
    "visual": "Deskripsi visual yang DETAIL (minimal 5-7 kalimat, mencakup warna, mood, style, setting, props, lighting, camera movement)",
    "music": "Rekomendasi musik yang DETAIL (minimal 2-3 kalimat, mencakup genre, tempo, mood, dan timing)"
  },
  "caption": "Caption yang PANJANG (6-10 kalimat, 120-200 kata) dengan hook, masalah, solusi, manfaat, CTA, dan hashtag di akhir",
  "hashtags": []
}`;
    } else if (tag === "carousel") {
      prompt = `Kamu adalah seorang content creator dan copywriter profesional yang ahli dalam membuat konten carousel yang engaging untuk social media.

Buatkan detail konten CAROUSEL yang SANGAT LENGKAP, RINCI, dan DETAIL untuk judul: "${title}"

INFORMASI PRODUK:
- Nama Produk: ${product.name}
- Deskripsi: ${product.description || 'Tidak ada deskripsi'}
- Pain Points: ${(product.pains || []).join(", ") || 'Belum ada'}
- Gains: ${(product.gains || []).join(", ") || 'Belum ada'}
- Goals: ${(product.goals || []).join(", ") || 'Belum ada'}

PARAMETER KONTEN:
- Gaya Bahasa/Tone of Voice: ${tone}
- Judul Konten: "${title}"

REQUIREMENT DETAIL CAROUSEL (HARUS SANGAT RINCI DAN PANJANG):
1. Jumlah Slide: Tentukan 5-7 slide (pilih yang paling efektif untuk storytelling yang lengkap)

2. Konten Setiap Slide (SETIAP SLIDE HARUS MEMILIKI DESKRIPSI YANG SANGAT DETAIL):
   - Slide 1: Hook yang sangat menarik (pertanyaan provokatif, statement mengejutkan, atau problem statement yang kuat). Deskripsikan dengan detail: teks headline, visual yang mendukung, dan emosi yang ingin ditimbulkan. Minimal 2-3 kalimat deskripsi per slide.
   - Slide 2-3: Pengenalan masalah atau pain point. Deskripsikan dengan detail: bagaimana masalah ditampilkan secara visual, teks yang digunakan, dan visual elements. Minimal 2-3 kalimat deskripsi per slide.
   - Slide 4-5: Solusi dan manfaat produk. Deskripsikan dengan SANGAT DETAIL: fitur produk yang ditonjolkan, benefit yang ditampilkan, visual produk, dan cara penyajian informasi. Minimal 3-4 kalimat deskripsi per slide.
   - Slide 6: Social proof atau testimoni (jika relevan). Deskripsikan dengan detail: bagaimana testimoni ditampilkan, visual yang mendukung. Minimal 2-3 kalimat deskripsi.
   - Slide Terakhir: CTA yang sangat jelas dan kuat. Deskripsikan dengan detail: teks CTA, visual yang mendukung, dan urgency jika ada. Minimal 2-3 kalimat deskripsi.

3. Visual Tone (HARUS SANGAT DETAIL, minimal 8-10 kalimat):
   - Warna dominan dan palet warna lengkap (sebutkan kode warna hex jika perlu)
   - Style visual (minimalist, vibrant, elegant, modern, dll) dengan penjelasan detail
   - Mood dan atmosphere yang ingin diciptakan
   - Typography style (font family, size hierarchy, weight, spacing)
   - Layout style (grid, asymmetric, centered, dll)
   - Icon style dan illustration style jika digunakan
   - Background style (gradient, solid, pattern, dll)
   - Spacing dan padding guidelines

4. Caption (HARUS PANJANG, minimal 8-12 kalimat, 150-250 kata):
   - Hook yang sangat menarik di awal (2-3 kalimat)
   - Penjelasan masalah atau pain point yang relevan (2-3 kalimat)
   - Penjelasan solusi dan manfaat produk secara detail (3-4 kalimat)
   - Social proof atau urgency jika relevan (1-2 kalimat)
   - Call to action yang jelas dan compelling (1-2 kalimat)
   - 8-12 hashtag yang relevan, trending, dan sesuai dengan produk dan platform di akhir caption
   - Gunakan emoji yang relevan untuk meningkatkan engagement (3-5 emoji)
   
   Format caption: [Teks caption panjang dengan hook, masalah, solusi, manfaat, dan CTA] [spasi] [8-12 hashtag dipisahkan spasi]

PENTING:
- Setiap slide HARUS memiliki deskripsi yang sangat detail, minimal 2-4 kalimat per slide
- Visual tone HARUS sangat lengkap untuk memudahkan design, minimal 8-10 kalimat
- Caption HARUS panjang (8-12 kalimat, 150-250 kata) dan engaging
- Semua deskripsi harus spesifik, tidak generic
- Output harus siap pakai untuk design team

PENTING: Output HARUS dalam format JSON yang valid. Jangan tambahkan penjelasan atau teks lain di luar JSON.

Format output JSON:
{
  "detail": {
    "type": "carousel",
    "slideCount": 5,
    "slides": [
      {"slide": 1, "text": "Hook yang menarik", "description": "Deskripsi detail slide 1 (minimal 2-3 kalimat)"},
      {"slide": 2, "text": "Konten slide 2", "description": "Deskripsi detail slide 2 (minimal 2-3 kalimat)"},
      {"slide": 3, "text": "Konten slide 3", "description": "Deskripsi detail slide 3 (minimal 2-3 kalimat)"},
      {"slide": 4, "text": "Konten slide 4", "description": "Deskripsi detail slide 4 (minimal 3-4 kalimat)"},
      {"slide": 5, "text": "CTA yang jelas", "description": "Deskripsi detail slide 5 (minimal 2-3 kalimat)"}
    ],
    "visualTone": "Deskripsi visual tone yang SANGAT DETAIL dan PANJANG (minimal 8-10 kalimat, mencakup warna, style, mood, typography, layout, icon, background, spacing)"
  },
  "caption": "Caption yang SANGAT PANJANG (8-12 kalimat, 150-250 kata) dengan hook, masalah, solusi, manfaat, CTA, dan hashtag di akhir",
  "hashtags": []
}`;
    } else {
      // image
      prompt = `Kamu adalah seorang graphic designer dan copywriter profesional yang ahli dalam membuat konten image static ads yang eye-catching untuk social media.

Buatkan detail konten IMAGE STATIC yang SANGAT LENGKAP, RINCI, dan DETAIL untuk judul: "${title}"

INFORMASI PRODUK:
- Nama Produk: ${product.name}
- Deskripsi: ${product.description || 'Tidak ada deskripsi'}
- Pain Points: ${(product.pains || []).join(", ") || 'Belum ada'}
- Gains: ${(product.gains || []).join(", ") || 'Belum ada'}
- Goals: ${(product.goals || []).join(", ") || 'Belum ada'}

PARAMETER KONTEN:
- Gaya Bahasa/Tone of Voice: ${tone}
- Judul Konten: "${title}"

REQUIREMENT DETAIL IMAGE (HARUS SANGAT RINCI DAN PANJANG):
1. Headline (HARUS KUAT DAN IMPACTFUL):
   - Buat headline yang sangat kuat, menarik, dan sesuai dengan tone of voice "${tone}"
   - Maksimal 1 kalimat yang impactful
   - Harus langsung menarik perhatian dan memicu curiosity

2. Subheadline (HARUS MENDUKUNG HEADLINE):
   - Buat subheadline yang sangat mendukung headline
   - Jelaskan value proposition atau benefit utama secara jelas
   - Maksimal 2-3 kalimat yang powerful
   - Harus memberikan konteks dan alasan untuk action

3. Visual Description (HARUS DETAIL, minimal 6-8 kalimat):
   - Warna dominan dan palet warna (sebutkan kode warna hex atau nama warna)
   - Mood dan atmosphere (energetic, calm, luxurious, dll)
   - Style visual (minimalist, vibrant, elegant, modern, dll)
   - Elemen visual yang digunakan (illustration, photography, icon, pattern)
   - Setting dan background (studio, lifestyle, abstract)
   - Composition style (rule of thirds, centered, asymmetric)
   - Lighting dan visual effects
   - Visual hierarchy dan focal point

4. Layout Description (HARUS DETAIL, minimal 6-8 kalimat):
   - Posisi headline (top, center, bottom dengan persentase)
   - Posisi subheadline relatif terhadap headline
   - Posisi gambar produk (center, left, right dengan size)
   - Posisi CTA button (size, color, position)
   - Spacing dan padding antara elemen (dalam pixel atau persentase)
   - Typography hierarchy (font size untuk headline, subheadline, CTA)
   - Alignment (left, center, right)
   - Grid system atau layout structure

5. Caption (HARUS PANJANG, minimal 6-10 kalimat, 120-200 kata):
   - Hook yang sangat menarik di awal (2 kalimat)
   - Penjelasan masalah atau pain point yang relevan (2 kalimat)
   - Penjelasan solusi dan manfaat produk secara detail (2-3 kalimat)
   - Social proof atau urgency jika relevan (1 kalimat)
   - Call to action yang jelas dan compelling (1-2 kalimat)
   - 8-10 hashtag yang relevan, trending, dan sesuai dengan produk dan platform di akhir caption
   - Gunakan emoji yang relevan untuk meningkatkan engagement (3-5 emoji)
   
   Format caption: [Teks caption panjang dengan hook, masalah, solusi, manfaat, dan CTA] [spasi] [8-10 hashtag dipisahkan spasi]

PENTING:
- Visual description HARUS lengkap untuk memudahkan production, minimal 5-7 kalimat yang detail
- Layout description HARUS detail untuk memudahkan design, minimal 5-7 kalimat yang spesifik
- Caption HARUS panjang (6-10 kalimat, 120-200 kata) dan engaging
- Semua deskripsi harus spesifik, tidak generic
- Output harus siap pakai untuk design team

PENTING: Output HARUS dalam format JSON yang valid. Jangan tambahkan penjelasan, markdown code blocks, atau teks lain di luar JSON. Hanya return JSON object saja. Pastikan semua string ditutup dengan quote yang benar.

Format output JSON (HARUS EXACT FORMAT INI):
{
  "detail": {
    "type": "image",
    "headline": "Headline yang sangat kuat dan impactful",
    "subheadline": "Subheadline yang sangat mendukung headline (2-3 kalimat)",
    "visual": "Deskripsi visual yang DETAIL (minimal 5-7 kalimat, mencakup warna, mood, style, elemen visual, setting, composition, lighting)",
    "layout": "Deskripsi layout yang DETAIL (minimal 5-7 kalimat, mencakup posisi semua elemen, spacing, typography, alignment, grid system)"
  },
  "caption": "Caption yang PANJANG (6-10 kalimat, 120-200 kata) dengan hook, masalah, solusi, manfaat, CTA, dan hashtag di akhir",
  "hashtags": []
}`;
    }

    try {
      let completion;
      try {
        completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that always responds with valid JSON format only. Return ONLY the JSON object, no markdown, no code blocks, no explanations. The JSON must be complete and valid. Ensure all string values are properly closed with quotes." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 16000,
        });
      } catch (apiError) {
        console.error("OpenAI API Error:", {
          message: apiError.message,
          status: apiError.status,
          code: apiError.code,
          type: apiError.type,
          tag: briefRow.tag,
          title: briefRow.title
        });
        if (apiError.status === 429) {
          throw new Error("Quota OpenAI habis. Silakan coba lagi nanti.");
        } else if (apiError.status === 401) {
          throw new Error("API key OpenAI tidak valid.");
        } else if (apiError.status === 500 || apiError.status === 503) {
          throw new Error("Server OpenAI sedang bermasalah. Silakan coba lagi.");
        }
        throw new Error(`Error API OpenAI: ${apiError.message || 'Silakan coba lagi.'}`);
      }

      if (!completion.choices || !completion.choices[0] || !completion.choices[0].message || !completion.choices[0].message.content) {
        throw new Error("Respons AI kosong. Silakan coba lagi.");
      }

      const content = completion.choices[0].message.content;
      const contentLength = content.length;
      const wasTruncated = completion.choices[0].finish_reason === 'length';
      
      // Log response untuk debugging
      console.log("AI Response received:", {
        length: contentLength,
        preview: content.substring(0, 300),
        finishReason: completion.choices[0].finish_reason,
        detailId: briefRow.id,
        tag: briefRow.tag,
        title: briefRow.title
      });
      
      if (wasTruncated) {
        console.warn("AI response was truncated due to token limit:", {
          detailId: briefRow.id,
          tag: briefRow.tag,
          title: briefRow.title,
          contentLength
        });
      }
      
      if (!content || content.trim().length === 0) {
        throw new Error("Respons AI kosong. Silakan coba lagi.");
      }
      
      // Clean content: remove markdown code blocks if present
      let jsonString = content.trim();
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // If truncated, try to fix incomplete strings at the end
      if (wasTruncated) {
        // Find the last complete property by looking for pattern: "key": "value",
        // or "key": "value"} at the end
        let lastCompleteIndex = -1;
        let inString = false;
        let escapeNext = false;
        
        // Scan from end to find the last complete property
        for (let i = jsonString.length - 1; i >= 0; i--) {
          const char = jsonString[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }
          
          // If we're not in a string, look for comma or closing brace
          if (!inString) {
            if (char === ',' || char === '}') {
              // Check if this is followed by whitespace and then either comma, closing brace, or end
              let isValidEnd = true;
              for (let j = i + 1; j < jsonString.length; j++) {
                const nextChar = jsonString[j];
                if (nextChar === ' ' || nextChar === '\n' || nextChar === '\r' || nextChar === '\t') {
                  continue;
                }
                // If we find a non-whitespace character that's not a closing brace or bracket, this isn't a valid end
                if (nextChar !== '}' && nextChar !== ']' && nextChar !== ',') {
                  isValidEnd = false;
                }
                break;
              }
              
              if (isValidEnd) {
                // Check backwards to see if this is a complete property (has a value with closing quote)
                let hasCompleteValue = false;
                let quoteCount = 0;
                for (let j = i - 1; j >= 0 && j >= i - 200; j--) {
                  if (jsonString[j] === '"' && (j === 0 || jsonString[j-1] !== '\\')) {
                    quoteCount++;
                    if (quoteCount === 2) {
                      // Found a complete value, check if there's a colon before it
                      for (let k = j - 1; k >= 0 && k >= j - 50; k--) {
                        if (jsonString[k] === ':') {
                          hasCompleteValue = true;
                          break;
                        }
                        if (jsonString[k] !== ' ' && jsonString[k] !== '\n' && jsonString[k] !== '\r' && jsonString[k] !== '\t') {
                          break;
                        }
                      }
                      break;
                    }
                  }
                }
                
                if (hasCompleteValue) {
                  lastCompleteIndex = i;
                  break;
                }
              }
            }
          }
        }
        
        // If we found a complete property, truncate there
        if (lastCompleteIndex > 0) {
          jsonString = jsonString.substring(0, lastCompleteIndex + 1);
          // Close any open structures
          let openBraces = (jsonString.match(/{/g) || []).length - (jsonString.match(/}/g) || []).length;
          let openBrackets = (jsonString.match(/\[/g) || []).length - (jsonString.match(/\]/g) || []).length;
          
          for (let i = 0; i < openBrackets; i++) {
            jsonString += ']';
          }
          for (let i = 0; i < openBraces; i++) {
            jsonString += '}';
          }
        } else {
          // Fallback: find the last opening quote and close it
          let lastOpenQuote = -1;
          inString = false;
          escapeNext = false;
          
          for (let i = jsonString.length - 1; i >= 0; i--) {
            const char = jsonString[i];
            
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            
            if (char === '"') {
              if (!inString) {
                lastOpenQuote = i;
                break;
              }
              inString = !inString;
            }
          }
          
          // If we have an unclosed string, close it and the JSON structure
          if (lastOpenQuote >= 0) {
            jsonString = jsonString.substring(0, lastOpenQuote + 1) + '"';
            // Close structures
            let openBraces = (jsonString.match(/{/g) || []).length - (jsonString.match(/}/g) || []).length;
            let openBrackets = (jsonString.match(/\[/g) || []).length - (jsonString.match(/\]/g) || []).length;
            
            for (let i = 0; i < openBrackets; i++) {
              jsonString += ']';
            }
            for (let i = 0; i < openBraces; i++) {
              jsonString += '}';
            }
          }
        }
      }
      
      // Try to parse JSON directly first
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (parseError) {
        // If direct parse fails, try to extract valid JSON object
        // Find the first complete JSON object by tracking braces
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let jsonStart = -1;
        let jsonEnd = -1;
        
        for (let i = 0; i < jsonString.length; i++) {
          const char = jsonString[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '{') {
              if (braceCount === 0) {
                jsonStart = i;
              }
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0 && jsonStart >= 0) {
                jsonEnd = i;
                // Try to parse this JSON object
                try {
                  const extractedJson = jsonString.substring(jsonStart, jsonEnd + 1);
                  parsed = JSON.parse(extractedJson);
                  break; // Successfully parsed, exit loop
                } catch (e) {
                  // This JSON object is invalid, continue searching
                  jsonStart = -1;
                  jsonEnd = -1;
                }
              }
            }
          }
        }
        
        // If we found a valid JSON object, use it
        if (parsed) {
          // Successfully parsed
        } else if (jsonStart >= 0 && jsonEnd >= 0) {
          // Found JSON boundaries but parsing failed, try to fix it
          let fixedJson = jsonString.substring(jsonStart, jsonEnd + 1);
          
          // Try to fix common issues: incomplete strings, unclosed structures
          // Close any open structures
          let openBraces = (fixedJson.match(/{/g) || []).length - (fixedJson.match(/}/g) || []).length;
          let openBrackets = (fixedJson.match(/\[/g) || []).length - (fixedJson.match(/\]/g) || []).length;
          
          // Close arrays first
          for (let i = 0; i < openBrackets; i++) {
            fixedJson += ']';
          }
          
          // Close objects
          for (let i = 0; i < openBraces; i++) {
            fixedJson += '}';
          }
          
          // Try to fix incomplete strings at the end
          if (inString) {
            // Find the last complete property before the incomplete string
            let lastCompleteComma = -1;
            let inStringForComma = false;
            let escapeNextForComma = false;
            
            for (let i = fixedJson.length - 1; i >= 0; i--) {
              const char = fixedJson[i];
              
              if (escapeNextForComma) {
                escapeNextForComma = false;
                continue;
              }
              
              if (char === '\\') {
                escapeNextForComma = true;
                continue;
              }
              
              if (char === '"' && !escapeNextForComma) {
                inStringForComma = !inStringForComma;
                continue;
              }
              
              if (!inStringForComma && char === ',') {
                lastCompleteComma = i;
                break;
              }
            }
            
            if (lastCompleteComma > 0) {
              fixedJson = fixedJson.substring(0, lastCompleteComma + 1);
              // Close structures again
              openBraces = (fixedJson.match(/{/g) || []).length - (fixedJson.match(/}/g) || []).length;
              openBrackets = (fixedJson.match(/\[/g) || []).length - (fixedJson.match(/\]/g) || []).length;
              for (let i = 0; i < openBrackets; i++) {
                fixedJson += ']';
              }
              for (let i = 0; i < openBraces; i++) {
                fixedJson += '}';
              }
            }
          }
          
          try {
            parsed = JSON.parse(fixedJson);
          } catch (e) {
            // Jika masih gagal, coba extract JSON dengan cara yang lebih agresif
            console.error("Failed to parse fixed JSON, trying aggressive extraction:", e.message);
            // Coba cari JSON object dengan regex yang lebih permisif
            const jsonMatch = fixedJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                parsed = JSON.parse(jsonMatch[0]);
              } catch (e2) {
                // Jika masih gagal, coba perbaiki dengan menghapus trailing comma dan karakter tidak valid
                let cleanedJson = jsonMatch[0]
                  .replace(/,\s*}/g, '}')  // Remove trailing comma before }
                  .replace(/,\s*]/g, ']')  // Remove trailing comma before ]
                  .replace(/([^\\])\\([^"\\/bfnrt])/g, '$1\\\\$2'); // Fix invalid escape sequences
                try {
                  parsed = JSON.parse(cleanedJson);
                } catch (e3) {
                  console.error("All JSON parsing attempts failed:", {
                    originalError: e.message,
                    regexError: e2.message,
                    cleanedError: e3.message,
                    jsonPreview: jsonMatch[0].substring(0, 500)
                  });
                  throw new Error("Format respons AI tidak valid. Silakan coba lagi.");
                }
              }
            } else {
              throw new Error("Format respons AI tidak valid. Silakan coba lagi.");
            }
          }
        } else {
          // No JSON object found, try regex as fallback
          const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch (e) {
              // Coba perbaiki dengan menghapus trailing comma
              let cleanedJson = jsonMatch[0]
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']')
                .replace(/([^\\])\\([^"\\/bfnrt])/g, '$1\\\\$2');
              try {
                parsed = JSON.parse(cleanedJson);
              } catch (e2) {
                // Coba perbaiki lebih agresif dengan menghapus karakter tidak valid
                let moreCleanedJson = cleanedJson
                  .replace(/,\s*}/g, '}')  // Remove trailing comma before }
                  .replace(/,\s*]/g, ']')  // Remove trailing comma before ]
                  .replace(/,\s*,/g, ',')   // Remove double commas
                  .replace(/:\s*,/g, ': null,')  // Replace missing values with null
                  .replace(/,\s*}/g, '}')  // Remove trailing comma again
                  .replace(/,\s*]/g, ']')  // Remove trailing comma again
                  .replace(/([^\\])\\([^"\\/bfnrt])/g, '$1\\\\$2')  // Fix invalid escape sequences
                  .replace(/[\u0000-\u001F]/g, '');  // Remove control characters
                try {
                  parsed = JSON.parse(moreCleanedJson);
                } catch (e3) {
                  // Coba extract hanya bagian yang valid dengan mencari nested objects
                  try {
                    // Coba parse dengan menghapus bagian yang bermasalah
                    const lines = moreCleanedJson.split('\n');
                    let validJson = '';
                    let braceCount = 0;
                    let bracketCount = 0;
                    let inString = false;
                    let escapeNext = false;
                    
                    for (const line of lines) {
                      for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (escapeNext) {
                          escapeNext = false;
                          validJson += char;
                          continue;
                        }
                        if (char === '\\') {
                          escapeNext = true;
                          validJson += char;
                          continue;
                        }
                        if (char === '"' && !escapeNext) {
                          inString = !inString;
                        }
                        if (!inString) {
                          if (char === '{') braceCount++;
                          if (char === '}') braceCount--;
                          if (char === '[') bracketCount++;
                          if (char === ']') bracketCount--;
                        }
                        validJson += char;
                      }
                      validJson += '\n';
                    }
                    
                    // Close any unclosed structures
                    while (bracketCount > 0) {
                      validJson += ']';
                      bracketCount--;
                    }
                    while (braceCount > 0) {
                      validJson += '}';
                      braceCount--;
                    }
                    
                    // Final cleanup
                    validJson = validJson
                      .replace(/,\s*}/g, '}')
                      .replace(/,\s*]/g, ']')
                      .replace(/,\s*,/g, ',')
                      .replace(/:\s*,/g, ': null,');
                    
                    parsed = JSON.parse(validJson);
                  } catch (e4) {
                    console.error("All JSON parsing attempts failed:", {
                      originalError: e.message,
                      regexError: e2.message,
                      cleanedError: e3.message,
                      finalError: e4.message,
                      jsonPreview: jsonMatch[0].substring(0, 1000),
                      jsonLength: jsonMatch[0].length
                    });
                    throw new Error("Format respons AI tidak valid. Silakan coba lagi.");
                  }
                }
              }
            }
          } else {
            console.error("No JSON object found in response:", {
              contentPreview: jsonString.substring(0, 500),
              contentLength: jsonString.length
            });
            throw new Error("Respons AI tidak valid. Silakan coba lagi.");
          }
        }
      }

      // Validate required fields
      if (!parsed.detail) {
        throw new Error("Detail konten tidak ditemukan. Silakan coba lagi.");
      }
      if (!parsed.detail.type) {
        throw new Error("Tipe konten tidak ditemukan. Silakan coba lagi.");
      }
      
      // Generate fallback caption if missing
      if (!parsed.caption || parsed.caption.trim() === '') {
        const { tag, title } = briefRow;
        const productName = product.name || 'Produk';
        const productDesc = product.description || '';
        const firstGain = (product.gains && product.gains.length > 0) ? product.gains[0] : 'kualitas terbaik';
        
        let fallbackCaption = '';
        
        if (tag === 'video') {
          fallbackCaption = `${title}\n\n${productDesc ? productDesc.substring(0, 100) + '... ' : ''}Dapatkan ${firstGain} dengan ${productName}. Jangan lewatkan kesempatan ini!\n\n#${productName.replace(/\s+/g, '')} #ProdukTerbaik #SolusiTerpercaya #Quality #BestChoice`;
        } else if (tag === 'carousel') {
          fallbackCaption = `${title}\n\n${productDesc ? productDesc.substring(0, 100) + '... ' : ''}Pelajari lebih lanjut tentang ${productName}. Swipe untuk melihat informasi lengkapnya!\n\n#${productName.replace(/\s+/g, '')} #ProdukTerbaik #SolusiTerpercaya #Quality #BestChoice`;
        } else {
          fallbackCaption = `${title}\n\n${productDesc ? productDesc.substring(0, 100) + '... ' : ''}Dapatkan ${firstGain} dengan ${productName}. Solusi tepat untuk kebutuhan Anda.\n\n#${productName.replace(/\s+/g, '')} #ProdukTerbaik #SolusiTerpercaya #Quality #BestChoice`;
        }
        
        parsed.caption = fallbackCaption;
      }
      
      // Validate type-specific fields dengan fallback
      if (parsed.detail.type === 'video') {
        if (!parsed.detail.scenes || !Array.isArray(parsed.detail.scenes) || parsed.detail.scenes.length === 0) {
          throw new Error("Data scene video tidak lengkap. Silakan coba lagi.");
        }
        // Pastikan minimal ada satu scene dengan description
        const hasValidScene = parsed.detail.scenes.some(s => s && s.description && typeof s.description === 'string' && s.description.trim().length > 0);
        if (!hasValidScene) {
          throw new Error("Data scene video tidak lengkap. Silakan coba lagi.");
        }
        // Pastikan ada visual description
        if (!parsed.detail.visual || typeof parsed.detail.visual !== 'string' || parsed.detail.visual.trim().length === 0) {
          throw new Error("Deskripsi visual video tidak ditemukan. Silakan coba lagi.");
        }
      } else if (parsed.detail.type === 'image') {
        if (!parsed.detail.headline || typeof parsed.detail.headline !== 'string' || parsed.detail.headline.trim().length === 0) {
          throw new Error("Headline tidak ditemukan. Silakan coba lagi.");
        }
        if (!parsed.detail.subheadline || typeof parsed.detail.subheadline !== 'string' || parsed.detail.subheadline.trim().length === 0) {
          throw new Error("Subheadline tidak ditemukan. Silakan coba lagi.");
        }
        // Pastikan ada visual description
        if (!parsed.detail.visual || typeof parsed.detail.visual !== 'string' || parsed.detail.visual.trim().length === 0) {
          throw new Error("Deskripsi visual image tidak ditemukan. Silakan coba lagi.");
        }
      } else if (parsed.detail.type === 'carousel') {
        if (!parsed.detail.slides || !Array.isArray(parsed.detail.slides) || parsed.detail.slides.length === 0) {
          throw new Error("Data slide carousel tidak lengkap. Silakan coba lagi.");
        }
        // Pastikan minimal ada satu slide dengan text
        const hasValidSlide = parsed.detail.slides.some(s => s && s.text && typeof s.text === 'string' && s.text.trim().length > 0);
        if (!hasValidSlide) {
          throw new Error("Data slide carousel tidak lengkap. Silakan coba lagi.");
        }
        // Pastikan ada visualTone
        if (!parsed.detail.visualTone || typeof parsed.detail.visualTone !== 'string' || parsed.detail.visualTone.trim().length === 0) {
          throw new Error("Deskripsi visual tone carousel tidak ditemukan. Silakan coba lagi.");
        }
      }

      return parsed;
    } catch (error) {
      console.error("AI Service Error:", {
        message: error.message,
        stack: error.stack,
        tag: briefRow.tag,
        title: briefRow.title,
        productName: product.name
      });
      // Return user-friendly error message, tapi tetap throw error asli untuk logging
      if (error.message.includes("Gagal generate detail") || 
          error.message.includes("Respons AI") ||
          error.message.includes("Format respons") ||
          error.message.includes("Data scene") ||
          error.message.includes("Data slide") ||
          error.message.includes("Headline") ||
          error.message.includes("Subheadline") ||
          error.message.includes("Deskripsi visual") ||
          error.message.includes("Quota OpenAI") ||
          error.message.includes("API key") ||
          error.message.includes("Server OpenAI") ||
          error.message.includes("Error API OpenAI")) {
        throw error;
      }
      throw new Error("Gagal generate detail. Silakan coba lagi.");
    }
  }
}

module.exports = AIService;

