// Constants untuk aplikasi

export const FUNNEL_STAGES = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'consideration', label: 'Consideration' },
  { value: 'retargeting_visitor', label: 'Retargeting Visitor' },
  { value: 'retargeting_atc_not_purchase', label: 'Retargeting ATC Not Purchase' },
  { value: 'after_purchase', label: 'After Purchase' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'loyalty', label: 'Loyalty' },
];

export const BRIEF_TYPES = [
  { value: 'ugc', label: 'User-Generated Content (UGC)' },
  { value: 'problem_solution_action', label: 'Problem–Solution–Action (P-S-A)' },
  { value: 'tiktok_affiliate_review', label: 'TikTok Affiliate Review (Casual Style)' },
  { value: 'step_by_step_demo', label: 'Step-by-Step Product Demo (Clear Explanation)' },
  { value: 'in_depth_review', label: 'In-Depth Review (Honest Pros & Cons)' },
  { value: 'problem_agitate_solve', label: 'Problem–Agitate–Solve (PAS)' },
  { value: 'attention_interest_desire_action', label: 'Attention–Interest–Desire–Action (AIDA)' },
  { value: 'before_after_bridge', label: 'Before–After–Bridge (BAB)' },
  { value: 'hook_value_proof_cta', label: 'Hook–Value–Proof–CTA' },
  { value: 'feature_advantage_benefit', label: 'Feature–Advantage–Benefit (FAB)' },
  { value: 'emotional_storytelling', label: 'Emotional Storytelling' },
  { value: 'question_tension_resolution', label: 'Question–Tension–Resolution' },
  { value: 'offer_scarcity_urgency_cta', label: 'Offer–Scarcity–Urgency–CTA' },
  { value: 'mechanism_based_script', label: 'Mechanism-Based Script' },
  { value: 'social_proof_angle', label: 'Social Proof Angle' },
  { value: 'comparison_formula', label: 'Comparison Formula' },
  { value: 'time_saving_formula', label: 'Time-Saving Formula' },
  { value: 'result_oriented_formula', label: 'Result-Oriented Formula' },
  { value: 'bonus_based_formula', label: 'Bonus-Based Formula' },
  { value: 'myth_busting_formula', label: 'Myth-Busting Formula' },
  { value: 'fear_of_missing_out', label: 'Fear of Missing Out (FOMO)' },
  { value: 'transformation_journey', label: 'Transformation Journey' },
  { value: 'vision_solution_proof', label: 'Vision–Solution–Proof' },
  { value: 'testimonial_story_formula', label: 'Testimonial Story Formula' },
  { value: 'pain_dream_fix', label: 'Pain–Dream–Fix (PDF)' },
  { value: 'logic_emotion_trust', label: 'Logic–Emotion–Trust (LET)' },
  { value: 'attention_problem_insight_offer', label: 'Attention–Problem–Insight–Offer (APIO)' },
  { value: 'fast_result_formula', label: 'Fast-Result Formula' },
  { value: 'lifestyle_insertion_formula', label: 'Lifestyle Insertion Formula' },
  { value: 'secret_reveal_formula', label: 'Secret-Reveal Formula' },
];

export const getStatusLabel = (status) => {
  const statusLabels = {
    draft: 'Draft',
    ready: 'Siap Submit',
    approved: 'Approved',
    scheduled: 'Scheduled',
    pending_approval: 'Pending Review',
    rejected: 'Rejected',
  };
  return statusLabels[status] || status;
};

export const TONE_OF_VOICE = [
  { value: 'casual_mom_style', label: 'Casual Mom Style' },
  { value: 'casual_conversation', label: 'Casual Conversation' },
  { value: 'educational_informative', label: 'Educational / Informative' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'humorous_funny', label: 'Humorous / Funny' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'professional', label: 'Professional' },
  { value: 'storytelling_narrative', label: 'Storytelling Narrative' },
  { value: 'gen_z_slang_style', label: 'Gen-Z / Slang Style' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'relatable_everyday_tone', label: 'Relatable Everyday Tone' },
  { value: 'sarcastic', label: 'Sarcastic' },
  { value: 'motivational', label: 'Motivational' },
  { value: 'assertive_direct', label: 'Assertive / Direct' },
  { value: 'melancholic', label: 'Melancholic' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'mysterious_teaser_style', label: 'Mysterious / Teaser Style' },
  { value: 'classy_elegant', label: 'Classy / Elegant' },
  { value: 'poetic', label: 'Poetic' },
  { value: 'silly_lighthearted_humor', label: 'Silly / Lighthearted Humor' },
  { value: 'sassy_confident', label: 'Sassy / Confident' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'soft_selling', label: 'Soft-Selling' },
  { value: 'hard_selling_aggressive', label: 'Hard-Selling / Aggressive' },
  { value: 'friendly_warm', label: 'Friendly / Warm' },
  { value: 'visionary', label: 'Visionary' },
  { value: 'nostalgic', label: 'Nostalgic' },
  { value: 'trendy_modern', label: 'Trendy / Modern' },
  { value: 'self_love_empowering', label: 'Self-Love / Empowering' },
];

export const PLATFORM_COLORS = {
  TikTok: 'bg-black text-white',
  Instagram: 'bg-pink-500 text-white',
  Shopee: 'bg-orange-500 text-white',
  Meta: 'bg-blue-500 text-white',
  YouTube: 'bg-red-500 text-white',
};

