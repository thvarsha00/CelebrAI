import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { 
  Palette, 
  Sparkles, 
  Check, 
  Camera, 
  Sun, 
  Layers, 
  Cake, 
  Shirt, 
  ArrowRight,
  Eye,
  Sliders
} from 'lucide-react';

interface ThemePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  hex_codes: string[];
  vibe_keywords: string[];
  lighting_style: string;
  table_styling: string;
  dress_code: string;
  cake_inspiration: string;
  decor_concepts: string[];
}

export const ThemeStudioPage: React.FC = () => {
  const { currentEvent, updateCurrentEvent, addToast } = useEventContext();

  const presets: ThemePreset[] = [
    {
      id: 'pastel',
      name: 'Pastel Dreamscape',
      category: 'Pastel',
      description: 'Ethereal lavender, baby blue, and blush pink with soft cloud textures and dreamy ambient glow.',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
      primary_color: '#EAE6FF',
      secondary_color: '#6750A4',
      accent_color: '#DCEBFA',
      hex_codes: ['#EAE6FF', '#6750A4', '#DCEBFA', '#F4DCE9', '#FAF9F7'],
      vibe_keywords: ['Whimsical', 'Dreamy', 'Airy', 'Pastel'],
      lighting_style: 'Soft 2700K fairy lights behind sheer chiffon with lavender uplighting',
      table_styling: 'Powder blue linen runner, ceramic bud vases with baby’s breath and tapered candles',
      dress_code: 'Pastel semi-formal with lilac, sage, or soft powder blue accents',
      cake_inspiration: '2-tier semi-naked buttercream cake decorated with pressed edible flowers',
      decor_concepts: ['Organic balloon cloud arch', 'Acrylic gold-lettered welcome easel', 'Fairy light curtain backdrop']
    },
    {
      id: 'minimalist',
      name: 'Nordic Minimalist',
      category: 'Minimalist',
      description: 'Clean architectural lines, monochromatic warm whites, sculptural florals and intentional whitespace.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
      primary_color: '#FAF9F7',
      secondary_color: '#20243A',
      accent_color: '#EAE6FF',
      hex_codes: ['#FAF9F7', '#20243A', '#EAE6FF', '#F1F1F5', '#A5A6B5'],
      vibe_keywords: ['Clean', 'Sculptural', 'Modern', 'Quiet Luxury'],
      lighting_style: 'Warm diffuse downlights and architectural pillar candles in hurricanes',
      table_styling: 'Raw off-white Belgian linen, single anthurium stems in ceramic pedestals',
      dress_code: 'Monochrome chic: crisp whites, stone grey, and midnight black',
      cake_inspiration: 'Single-tier sharp-edged white fondant cake with sculptural wafer paper sail',
      decor_concepts: ['Ribbed acrylic plinths', 'Floating calligraphic signage', 'Sculptural branch installations']
    },
    {
      id: 'royal',
      name: 'Imperial Royal & Gold',
      category: 'Royal',
      description: 'Majestic midnight navy, antique brass, deep velvet drapery, and opulent gilded accents.',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
      primary_color: '#20243A',
      secondary_color: '#D4AF37',
      accent_color: '#6750A4',
      hex_codes: ['#20243A', '#D4AF37', '#6750A4', '#FAF9F7', '#4F378B'],
      vibe_keywords: ['Opulent', 'Regal', 'Prestigious', 'Majestic'],
      lighting_style: 'Multi-arm crystal chandeliers, amber accent spotlights, and candelabras',
      table_styling: 'Midnight velvet table runners, vintage gold-rimmed chargers, and amber glassware',
      dress_code: 'Black tie / Royal evening wear with metallic gold or jewel-toned velvet',
      cake_inspiration: '3-tier navy velvet cake accented with 24k edible gold leaf marbling',
      decor_concepts: ['Ornate Baroque mirrors', 'Brass candelabras with ivory tapers', 'Deep velvet photo backdrop']
    },
    {
      id: 'bohemian',
      name: 'Boho Sunset & Pampas',
      category: 'Bohemian',
      description: 'Earthy terracotta, dried pampas grass, macrame textures, and warm golden hour sunsets.',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
      primary_color: '#E07A5F',
      secondary_color: '#F4F1DE',
      accent_color: '#3D405B',
      hex_codes: ['#E07A5F', '#F4F1DE', '#3D405B', '#81B29A', '#F2CC8F'],
      vibe_keywords: ['Earthy', 'Organic', 'Free-spirited', 'Rustic Chic'],
      lighting_style: 'Edison filament festoon bulbs and rattan woven pendant lanterns',
      table_styling: 'Low wooden pallet tables, kilim floor cushions, dried palm leaves, and brass vases',
      dress_code: 'Boho-chic: linen shirts, flowy terracotta maxi dresses, and earthy neutrals',
      cake_inspiration: 'Textured buttercream cake crowned with dried bunny tails and dried citrus wheels',
      decor_concepts: ['Tepee arch with pampas plumes', 'Woven macrame photobooth', 'Persian vintage rugs']
    },
    {
      id: 'traditional-indian',
      name: 'Vibrant Royal Marigold',
      category: 'Traditional Indian',
      description: 'Fragrant fresh marigolds, antique brass urulis with floating diyas, and rich festive vermilion.',
      image: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=600&auto=format&fit=crop&q=80',
      primary_color: '#FFA500',
      secondary_color: '#6750A4',
      accent_color: '#FAF9F7',
      hex_codes: ['#FFA500', '#B22222', '#6750A4', '#FAF9F7', '#FFD700'],
      vibe_keywords: ['Festive', 'Cultural', 'Auspicious', 'Luminous'],
      lighting_style: 'Ghee diyas in brass urulis paired with warm overhead fairy light canopies',
      table_styling: 'Banana leaf charger plates, brass tumblers, and fresh jasmine flower garlands',
      dress_code: 'Traditional Indian: Kurtas, silk sarees, or embroidered lehengas',
      cake_inspiration: 'Gulab Jamun infused pistachio cake with saffron cardamon cream',
      decor_concepts: ['Cascading marigold curtains', 'Brass bells and hanging kaleeras', 'Rangoli floral entryways']
    },
    {
      id: 'floral',
      name: 'Botanical Garden Blossom',
      category: 'Floral',
      description: 'Abundant wild garden roses, fresh eucalyptus vines, and natural conservatory greenery.',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&auto=format&fit=crop&q=80',
      primary_color: '#DCEBFA',
      secondary_color: '#2D6A4F',
      accent_color: '#F4DCE9',
      hex_codes: ['#DCEBFA', '#2D6A4F', '#F4DCE9', '#FAF9F7', '#EAE6FF'],
      vibe_keywords: ['Lush', 'Romantic', 'Organic', 'Botanical'],
      lighting_style: 'Twinkling fairy lights interwoven through hanging floral greenery chandeliers',
      table_styling: 'Full-length eucalyptus garlands running down tables dotted with English tea roses',
      dress_code: 'Floral prints, botanical sage green, or garden cocktail attire',
      cake_inspiration: 'Pressed flower botanical cake cascading with fresh organic blossoms',
      decor_concepts: ['Floral moon gate arch', 'Living moss escort card display', 'Vintage bicycle flower basket']
    }
  ];

  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(presets[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredPresets = activeCategory === 'All' 
    ? presets 
    : presets.filter(p => p.category === activeCategory);

  const handleApplyTheme = () => {
    updateCurrentEvent({
      theme: {
        primary_color: selectedTheme.primary_color,
        secondary_color: selectedTheme.secondary_color,
        accent_color: selectedTheme.accent_color,
        hex_codes: selectedTheme.hex_codes,
        vibe_keywords: selectedTheme.vibe_keywords,
        lighting_style: selectedTheme.lighting_style,
        dress_code: selectedTheme.dress_code
      },
      decorations: selectedTheme.decor_concepts
    });
    addToast('success', 'Theme Applied', `Applied "${selectedTheme.name}" to your active event.`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple">
            Visual Discovery Engine
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            AI Theme Studio & Moodboards
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Curated aesthetics featuring bespoke color palettes, lighting schemes, and table styling
          </p>
        </div>

        <button
          onClick={handleApplyTheme}
          className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply "{selectedTheme.name}" to Event</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {['All', 'Pastel', 'Minimalist', 'Royal', 'Bohemian', 'Traditional Indian', 'Floral'].map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-brand-purple text-white shadow-xs'
                : 'bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-gray-500 hover:text-brand-navy'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Theme Spotlight & Moodboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Moodboard Card */}
        <div className="lg:col-span-1 p-6 rounded-3xl saas-card flex flex-col justify-between">
          <div>
            <div className="relative rounded-2xl overflow-hidden h-52 mb-4 shadow-xs">
              <img 
                src={selectedTheme.image} 
                alt={selectedTheme.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs uppercase font-bold text-white tracking-wider">
                  {selectedTheme.category} Moodboard
                </span>
              </div>
            </div>

            <h3 className="font-serif text-xl font-bold">{selectedTheme.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {selectedTheme.description}
            </p>

            {/* Color Swatches */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <span className="text-xs font-semibold text-gray-400 block mb-2">Color Harmony</span>
              <div className="flex space-x-2">
                {selectedTheme.hex_codes.map((hex, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div 
                      className="h-8 rounded-lg shadow-xs border border-black/10"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[9px] font-mono text-gray-400 mt-1 block truncate">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleApplyTheme}
            className="w-full mt-6 py-2.5 rounded-xl bg-brand-lavender text-brand-purple font-semibold text-xs hover:bg-brand-purple hover:text-white transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Selected Theme</span>
          </button>
        </div>

        {/* Detailed Styling Specifications */}
        <div className="lg:col-span-2 p-6 rounded-3xl saas-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
            <h4 className="font-serif text-base font-bold">Curated Event Styling Blueprint</h4>
            <div className="flex space-x-1.5">
              {selectedTheme.vibe_keywords.map((k, i) => (
                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-lavender dark:bg-white/10 text-brand-purple dark:text-brand-lavender">
                  #{k}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/50 dark:border-white/5">
              <div className="flex items-center space-x-2 text-brand-purple mb-1">
                <Sun className="w-4 h-4" />
                <span className="text-xs font-semibold">Lighting & Atmosphere</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedTheme.lighting_style}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/50 dark:border-white/5">
              <div className="flex items-center space-x-2 text-blue-600 mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-semibold">Table & Place Setting</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedTheme.table_styling}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/50 dark:border-white/5">
              <div className="flex items-center space-x-2 text-pink-600 mb-1">
                <Shirt className="w-4 h-4" />
                <span className="text-xs font-semibold">Guest Dress Code Recommendation</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedTheme.dress_code}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/50 dark:border-white/5">
              <div className="flex items-center space-x-2 text-amber-600 mb-1">
                <Cake className="w-4 h-4" />
                <span className="text-xs font-semibold">Cake & Confectionery Design</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedTheme.cake_inspiration}
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-400 block mb-2">Key Decoration Elements</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedTheme.decor_concepts.map((concept, i) => (
                <div key={i} className="p-3 rounded-xl bg-brand-lavender/30 dark:bg-white/5 border border-brand-lavender/50 dark:border-white/10 text-xs text-brand-navy dark:text-brand-warm-white">
                  ✨ {concept}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Theme Selection Grid */}
      <div>
        <h3 className="font-serif text-lg font-bold mb-4">Browse All Visual Themes ({filteredPresets.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => {
            const isSelected = selectedTheme.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setSelectedTheme(preset)}
                className={`group rounded-2xl overflow-hidden p-4 bg-white dark:bg-[#1B1E2E] border cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-brand-purple ring-2 ring-brand-purple/20 shadow-premium' 
                    : 'border-brand-lavender/70 dark:border-white/10 hover:shadow-subtle'
                }`}
              >
                <div className="h-40 rounded-xl overflow-hidden mb-3 relative">
                  <img src={preset.image} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {isSelected && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-brand-purple text-white text-[10px] font-bold">
                      Selected
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold">{preset.name}</h4>
                  <span className="text-[10px] text-gray-400">{preset.category}</span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {preset.description}
                </p>

                <div className="flex space-x-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                  {preset.hex_codes.slice(0, 4).map((c, idx) => (
                    <span key={idx} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
