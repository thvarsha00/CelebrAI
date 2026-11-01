import React, { useState, useRef } from 'react';
import { useEventContext } from '../context/EventContext';
import { 
  Mail, 
  Sparkles, 
  Download, 
  Copy, 
  Share2, 
  Check, 
  Palette, 
  Type, 
  Eye,
  Calendar,
  MapPin,
  Clock,
  Sliders
} from 'lucide-react';


export const InvitationStudioPage: React.FC = () => {
  const { currentEvent, updateCurrentEvent, addToast } = useEventContext();
  const inviteRef = useRef<HTMLDivElement>(null);

  const initialInvite = currentEvent?.invitation || {
    headline: "You Are Cordially Invited to Celebrate",
    subheading: "A Magical 25th Birthday Celebration",
    host_text: "Join us as we raise a toast to unforgettable memories",
    body_text: "Please join our circle of cherished friends and family for an evening of warmth, laughter, and gourmet treats.",
    date_time_text: "Saturday, November 20, 2026 at 6:30 PM",
    venue_text: "Skyline Glasshouse Rooftop Lounge, Bangalore",
    rsvp_text: "RSVP by November 15th to facilitate customized seating",
    suggested_palette: ["#DCEBFA", "#6750A4", "#20243A"]
  };

  const [headline, setHeadline] = useState(initialInvite.headline);
  const [subheading, setSubheading] = useState(initialInvite.subheading);
  const [hostText, setHostText] = useState(initialInvite.host_text);
  const [bodyText, setBodyText] = useState(initialInvite.body_text);
  const [dateTime, setDateTime] = useState(initialInvite.date_time_text);
  const [venue, setVenue] = useState(initialInvite.venue_text);
  const [rsvpText, setRsvpText] = useState(initialInvite.rsvp_text);

  // Styling controls
  const [cardTemplate, setCardTemplate] = useState<'pastel' | 'royal' | 'minimal' | 'floral'>('pastel');
  const [fontStyle, setFontStyle] = useState<'serif' | 'sans' | 'italic'>('serif');
  const [cardScale, setCardScale] = useState<'compact' | 'normal' | 'large'>('normal');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPNG = async () => {
    if (!inviteRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(inviteRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `celebrAI-invitation-${Date.now()}.png`;
      a.click();
      addToast('success', 'Invitation Downloaded', 'High-resolution PNG saved.');
    } catch (err: any) {
      addToast('error', 'Download error', 'Failed to generate PNG image.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyWhatsApp = () => {
    const text = `✨ *${headline.toUpperCase()}* ✨\n\n_${subheading}_\n\n${bodyText}\n\n📅 *When*: ${dateTime}\n📍 *Where*: ${venue}\n\n💌 *RSVP*: ${rsvpText}\n\n_Planned effortlessly with CelebrAI_`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('success', 'WhatsApp Format Copied', 'Formatted invitation text copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateWording = () => {
    const tone = currentEvent?.theme.vibe_keywords[0] || 'Elegant';
    const eventName = currentEvent?.title || 'Celebration';
    setHeadline(`Cordially Inviting You To`);
    setSubheading(`An Evening of ${tone} & Wonder`);
    setHostText(`Together with family and friends`);
    setBodyText(`Join us in honoring ${eventName}. Expect handcrafted refreshments, joyful laughter, and unforgettable moments together under the evening sky.`);
    addToast('info', 'AI Wording Refreshed', 'Generated fresh conversational invitation copy.');
  };

  // Card theme styling
  const getCardClasses = () => {
    switch (cardTemplate) {
      case 'royal':
        return 'bg-gradient-to-br from-[#161825] via-[#20243A] to-[#0E1019] text-[#F1F1F5] border-[#D4AF37]/50 shadow-2xl';
      case 'minimal':
        return 'bg-white dark:bg-[#1B1E2E] text-brand-navy dark:text-brand-warm-white border-gray-300 dark:border-white/10 shadow-premium';
      case 'floral':
        return 'bg-gradient-to-br from-[#FAEFF5] via-[#FFF9FB] to-[#F4DCE9] text-brand-navy border-pink-200 shadow-premium';
      case 'pastel':
      default:
        return 'bg-gradient-to-br from-brand-lavender/60 via-white to-brand-powder-blue/50 text-brand-navy border-brand-lavender dark:border-white/10 shadow-premium';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple">
            Visual Designer
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            AI Invitation Studio
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Interactive invitation card designer with live preview, custom fonts, and one-click PNG export
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleCopyWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-brand-navy dark:text-brand-warm-white text-xs font-semibold hover:bg-brand-lavender/40 flex items-center space-x-1.5 transition-all shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>Copy for WhatsApp</span>
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : 'Export as PNG'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl saas-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-serif text-base font-bold">Template & Typography</h3>
              <button
                onClick={handleRegenerateWording}
                className="text-xs font-semibold text-brand-purple hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rewrite with AI</span>
              </button>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Card Aesthetic Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pastel', label: 'Pastel Lavender' },
                  { id: 'royal', label: 'Imperial Navy & Gold' },
                  { id: 'minimal', label: 'Modern Studio Minimal' },
                  { id: 'floral', label: 'Blush Botanical' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setCardTemplate(t.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                      cardTemplate === t.id
                        ? 'border-brand-purple bg-brand-lavender/40 dark:bg-white/10 text-brand-purple dark:text-brand-lavender'
                        : 'border-brand-lavender/60 dark:border-white/5 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Style & Scale */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Editorial Font</label>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium cursor-pointer"
                >
                  <option value="serif">Playfair Serif</option>
                  <option value="sans">Inter Sans</option>
                  <option value="italic">Editorial Italic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Card Scale</label>
                <select
                  value={cardScale}
                  onChange={(e) => setCardScale(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium cursor-pointer"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Standard</option>
                  <option value="large">Spacious</option>
                </select>
              </div>
            </div>

            {/* Form Fields for Customization */}
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-white/5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Subheading / Occasion</label>
                <input
                  type="text"
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  className="w-full p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Body Wording</label>
                <textarea
                  rows={3}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Date & Time</label>
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">RSVP Deadline</label>
                  <input
                    type="text"
                    value={rsvpText}
                    onChange={(e) => setRsvpText(e.target.value)}
                    className="w-full p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Venue Location</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Visual Card Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-gray-400 mb-3 flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Live Card Canvas</span>
          </span>

          <div
            ref={inviteRef}
            className={`w-full max-w-md rounded-3xl border text-center transition-all duration-300 relative overflow-hidden ${getCardClasses()} ${
              cardScale === 'compact' ? 'p-6 sm:p-8' : cardScale === 'large' ? 'p-10 sm:p-14' : 'p-8 sm:p-12'
            } ${
              fontStyle === 'serif' ? 'font-serif' : fontStyle === 'italic' ? 'italic' : 'font-sans'
            }`}
          >
            {/* Delicate corner ornaments */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-current opacity-30"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-current opacity-30"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-current opacity-30"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-current opacity-30"></div>

            <div className="space-y-5 relative z-10">
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold opacity-70 block">
                {headline}
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                {subheading}
              </h2>

              <div className="w-12 h-0.5 bg-current mx-auto opacity-30 my-3" />

              <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-sans max-w-xs mx-auto">
                {bodyText}
              </p>

              <div className="space-y-2 py-4 border-y border-current/15 text-xs">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 opacity-60" />
                  <span className="font-semibold">{dateTime}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 opacity-60" />
                  <span>{venue}</span>
                </div>
              </div>

              <div className="pt-1">
                <p className="text-[11px] tracking-wider uppercase font-semibold opacity-75">
                  {rsvpText}
                </p>
                <span className="text-[9px] opacity-40 font-mono block mt-2">
                  CelebrAI • Unique RSVP Code #PW-2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
