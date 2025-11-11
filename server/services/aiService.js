const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

class AIService {
  static async analyzeProductFromLink(product) {
    const prompt = `Kamu adalah seorang copywriter dan marketing strategist yang ahli dalam menganalisis produk untuk content marketing.

Tugas kamu adalah menganalisis produk berikut secara mendalam dan buatkan:
1. 10 Pain Points (masalah yang dihadapi customer terkait produk ini) - harus spesifik dan relevan
2. 10 Gains (keuntungan/benefit produk yang jelas dan spesifik) - fokus pada value yang diberikan
3. 10 Goals (tujuan yang ingin dicapai customer dengan produk ini) - harus realistis dan achievable

Informasi Produk:
- Nama Produk: ${product.name}
- Deskripsi: ${product.description || 'Tidak ada deskripsi'}
- Link Produk: ${product.link || 'Tidak ada link'}

${product.link ? `
PENTING: Analisa detail produk dari link berikut: ${product.link}
Perhatikan informasi dari link tersebut termasuk:
- Spesifikasi produk (dimensi, berat, material, dll)
- Fitur-fitur utama dan keunggulan produk
- Review atau feedback customer (jika ada) - gunakan untuk memahami pain points nyata
- Harga dan value proposition
- Target market dan use case
- Competitive advantage produk

Gunakan informasi dari link untuk membuat analisa yang lebih akurat dan mendalam.
` : 'Gunakan informasi yang tersedia untuk membuat analisa yang relevan.'}

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
      throw error;
    }
  }

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
      });

      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Invalid AI response format");
    } catch (error) {
      console.error("AI Service Error:", error.message);
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

REQUIREMENT DETAIL VIDEO (HARUS SANGAT RINCI DAN PANJANG):
1. Scene Breakdown (WAJIB 5-7 scene dengan deskripsi yang SANGAT DETAIL):
   - Scene 1 (0-2s): Hook yang sangat kuat dan menarik perhatian. Deskripsikan dengan detail: apa yang terlihat di layar, gerakan kamera, ekspresi talent, teks overlay jika ada, dan emosi yang ingin ditimbulkan. Minimal 3-4 kalimat deskripsi.
   - Scene 2 (3-5s): Transisi atau pengenalan masalah. Deskripsikan dengan detail: setting, props, lighting, angle kamera, dan bagaimana masalah ditampilkan secara visual. Minimal 3-4 kalimat deskripsi.
   - Scene 3 (6-9s): Solusi atau demo produk. Deskripsikan dengan SANGAT DETAIL: bagaimana produk ditampilkan, fitur yang ditonjolkan, cara penggunaan, close-up shots, dan visual impact. Minimal 4-5 kalimat deskripsi.
   - Scene 4 (10-12s): Benefit atau hasil yang didapat. Deskripsikan dengan detail: testimoni visual, before-after, atau demonstrasi manfaat. Minimal 3-4 kalimat deskripsi.
   - Scene 5 (13-15s): CTA dan closing yang kuat. Deskripsikan dengan detail: teks CTA, visual yang mendukung, dan closing statement. Minimal 3-4 kalimat deskripsi.

2. Visual Description (HARUS SANGAT DETAIL, minimal 8-10 kalimat):
   - Warna dominan dan palet warna yang digunakan (sebutkan kode warna jika perlu)
   - Mood dan atmosphere yang ingin diciptakan
   - Style visual (contoh: minimalist, vibrant, cozy, modern, dll)
   - Setting dan lokasi shooting (detail ruangan, outdoor, atau studio)
   - Props dan elemen visual yang digunakan
   - Lighting setup (natural light, soft lighting, dramatic lighting, dll)
   - Camera movement dan angle (close-up, wide shot, tracking shot, dll)
   - Style editing dan transisi antar scene

3. Music Suggestion (DETAIL, minimal 3-4 kalimat):
   - Genre musik yang tepat
   - Tempo dan beat (slow, medium, fast)
   - Mood musik (energetic, calm, dramatic, dll)
   - Contoh artist atau track yang mirip (jika ada)
   - Kapan musik mulai fade in/out

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
- Setiap scene breakdown HARUS sangat detail dan actionable, minimal 3-4 kalimat per scene
- Visual description HARUS sangat lengkap untuk memudahkan production, minimal 8-10 kalimat
- Caption HARUS panjang (8-12 kalimat, 150-250 kata) dan engaging
- Semua deskripsi harus spesifik, tidak generic
- Output harus siap pakai untuk production team

PENTING: Output HARUS dalam format JSON yang valid. Jangan tambahkan penjelasan atau teks lain di luar JSON.

Format output JSON:
{
  "detail": {
    "type": "video",
    "duration": "15 detik",
    "scenes": [
      {"time": "0-2s", "description": "Deskripsi scene 1 yang SANGAT DETAIL dan PANJANG (minimal 3-4 kalimat)"},
      {"time": "3-5s", "description": "Deskripsi scene 2 yang SANGAT DETAIL dan PANJANG (minimal 3-4 kalimat)"},
      {"time": "6-9s", "description": "Deskripsi scene 3 yang SANGAT DETAIL dan PANJANG (minimal 4-5 kalimat)"},
      {"time": "10-12s", "description": "Deskripsi scene 4 yang SANGAT DETAIL dan PANJANG (minimal 3-4 kalimat)"},
      {"time": "13-15s", "description": "Deskripsi scene 5 yang SANGAT DETAIL dan PANJANG (minimal 3-4 kalimat)"}
    ],
    "visual": "Deskripsi visual yang SANGAT DETAIL dan PANJANG (minimal 8-10 kalimat, mencakup warna, mood, style, setting, props, lighting, camera movement)",
    "music": "Rekomendasi musik yang DETAIL (minimal 3-4 kalimat, mencakup genre, tempo, mood, dan timing)"
  },
  "caption": "Caption yang SANGAT PANJANG (8-12 kalimat, 150-250 kata) dengan hook, masalah, solusi, manfaat, CTA, dan hashtag di akhir",
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

3. Visual Description (HARUS SANGAT DETAIL, minimal 10-12 kalimat):
   - Warna dominan dan palet warna lengkap (sebutkan kode warna hex, RGB, atau nama warna spesifik)
   - Mood dan atmosphere yang ingin diciptakan (energetic, calm, luxurious, dll)
   - Style visual (minimalist, vibrant, elegant, modern, vintage, dll) dengan penjelasan detail
   - Elemen visual yang digunakan (illustration, photography, icon, pattern, dll)
   - Props dan elemen pendukung (jika menggunakan foto produk)
   - Setting dan background (studio, lifestyle, abstract, dll)
   - Composition style (rule of thirds, centered, asymmetric, dll)
   - Lighting dan shadow effects
   - Texture dan material feel (glossy, matte, paper texture, dll)
   - Visual hierarchy dan focal point

4. Layout Description (HARUS SANGAT DETAIL, minimal 8-10 kalimat):
   - Posisi headline (top, center, bottom, dengan koordinat atau persentase jika perlu)
   - Posisi subheadline relatif terhadap headline
   - Posisi gambar produk (center, left, right, dengan size dan proportion)
   - Posisi CTA button (size, color, position, style)
   - Spacing dan padding antara elemen (spesifik dalam pixel atau persentase)
   - Typography hierarchy (font size untuk headline, subheadline, body text, CTA)
   - Alignment dan justification (left, center, right, justified)
   - Grid system atau layout structure yang digunakan
   - White space dan breathing room

5. Caption (HARUS PANJANG, minimal 8-12 kalimat, 150-250 kata):
   - Hook yang sangat menarik di awal (2-3 kalimat)
   - Penjelasan masalah atau pain point yang relevan (2-3 kalimat)
   - Penjelasan solusi dan manfaat produk secara detail (3-4 kalimat)
   - Social proof atau urgency jika relevan (1-2 kalimat)
   - Call to action yang jelas dan compelling (1-2 kalimat)
   - 8-12 hashtag yang relevan, trending, dan sesuai dengan produk dan platform di akhir caption
   - Gunakan emoji yang relevan untuk meningkatkan engagement (3-5 emoji)
   
   Format caption: [Teks caption panjang dengan hook, masalah, solusi, manfaat, dan CTA] [spasi] [8-12 hashtag dipisahkan spasi]

PENTING:
- Visual description HARUS sangat lengkap untuk memudahkan production, minimal 10-12 kalimat
- Layout description HARUS sangat detail untuk memudahkan design, minimal 8-10 kalimat
- Caption HARUS panjang (8-12 kalimat, 150-250 kata) dan engaging
- Semua deskripsi harus spesifik, tidak generic
- Output harus siap pakai untuk design team

PENTING: Output HARUS dalam format JSON yang valid. Jangan tambahkan penjelasan atau teks lain di luar JSON.

Format output JSON:
{
  "detail": {
    "type": "image",
    "headline": "Headline yang sangat kuat dan impactful",
    "subheadline": "Subheadline yang sangat mendukung headline (2-3 kalimat)",
    "visual": "Deskripsi visual yang SANGAT DETAIL dan PANJANG (minimal 10-12 kalimat, mencakup warna, mood, style, elemen visual, props, setting, composition, lighting, texture)",
    "layout": "Deskripsi layout yang SANGAT DETAIL dan PANJANG (minimal 8-10 kalimat, mencakup posisi semua elemen, spacing, typography, alignment, grid system)"
  },
  "caption": "Caption yang SANGAT PANJANG (8-12 kalimat, 150-250 kata) dengan hook, masalah, solusi, manfaat, CTA, dan hashtag di akhir",
  "hashtags": []
}`;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant that always responds with valid JSON format. Always provide detailed, comprehensive, and lengthy responses. Be specific and avoid generic descriptions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const content = completion.choices[0].message.content;
      
      // Try to parse JSON directly
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        // If direct parse fails, try to extract JSON from markdown code blocks or text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e) {
            throw new Error(`Invalid JSON format: ${e.message}`);
          }
        } else {
          throw new Error("No valid JSON found in AI response");
        }
      }

      // Validate required fields
      if (!parsed.detail) {
        throw new Error("Missing 'detail' field in AI response");
      }
      if (!parsed.caption) {
        throw new Error("Missing 'caption' field in AI response");
      }
      // hashtags is optional, can be empty array

      return parsed;
    } catch (error) {
      console.error("AI Service Error:", error.message);
      console.error("Error details:", error);
      console.error("Full error:", JSON.stringify(error, null, 2));
      // Throw error with more details
      throw new Error(`Gagal generate detail: ${error.message}`);
    }
  }
}

module.exports = AIService;

