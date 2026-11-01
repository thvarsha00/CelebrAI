import React, { useState, useEffect } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { Guest } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Send,
  Sparkles,
  Phone,
  Download,
  CheckCheck
} from 'lucide-react';

export const GuestManagerPage: React.FC = () => {
  const { currentEvent, addToast } = useEventContext();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [rsvpFilter, setRsvpFilter] = useState('All');

  // Add guest modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Family' | 'Friends' | 'Colleague' | 'VIP'>('Friends');
  const [dietary, setDietary] = useState('Vegetarian');
  const [plusOnes, setPlusOnes] = useState(0);

  // Load guests or initialize sample
  useEffect(() => {
    if (currentEvent) {
      api.getGuests(currentEvent.id).then(res => {
        if (res && res.length > 0) {
          setGuests(res);
        } else {
          // Initialize default mock roster
          const mockGuests: Guest[] = [
            { id: 'g-1', event_id: currentEvent.id, name: 'Ananya Sharma', email: 'ananya@example.com', phone: '+91 98450 12345', category: 'Friends', rsvp_status: 'Confirmed', dietary_preferences: 'Vegetarian', plus_ones: 1, invitation_sent: true },
            { id: 'g-2', event_id: currentEvent.id, name: 'Rahul Varma', email: 'rahul.v@example.com', phone: '+91 98210 98765', category: 'Family', rsvp_status: 'Confirmed', dietary_preferences: 'Vegetarian', plus_ones: 0, invitation_sent: true },
            { id: 'g-3', event_id: currentEvent.id, name: 'Pooja Iyer', email: 'pooja.i@example.com', phone: '+91 99000 54321', category: 'VIP', rsvp_status: 'Pending', dietary_preferences: 'Jain Vegetarian', plus_ones: 1, invitation_sent: true },
            { id: 'g-4', event_id: currentEvent.id, name: 'Kunal Deshmukh', email: 'kunal@example.com', phone: '+91 97312 45678', category: 'Colleague', rsvp_status: 'Declined', dietary_preferences: 'None', plus_ones: 0, invitation_sent: true },
            { id: 'g-5', event_id: currentEvent.id, name: 'Siddharth Patel', email: 'sid@example.com', phone: '+91 98860 11223', category: 'Friends', rsvp_status: 'Confirmed', dietary_preferences: 'Vegetarian', plus_ones: 0, invitation_sent: true },
          ];
          setGuests(mockGuests);
        }
      });
    }
  }, [currentEvent?.id]);

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;

    if (!name.trim()) {
      addToast('warning', 'Name Required', 'Please enter a guest name.');
      return;
    }

    const newGuest: Guest = {
      id: `g-${Date.now()}`,
      event_id: currentEvent.id,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      category,
      rsvp_status: 'Pending',
      dietary_preferences: dietary,
      plus_ones: Number(plusOnes),
      invitation_sent: false
    };

    setGuests(prev => [newGuest, ...prev]);
    api.addGuest(newGuest);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setPlusOnes(0);
    addToast('success', 'Guest Added', `${newGuest.name} was added to the roster.`);
  };

  const handleToggleRSVP = (id?: string) => {
    if (!id) return;
    setGuests(prev => prev.map(g => {
      if (g.id === id) {
        const nextStatus = g.rsvp_status === 'Pending' ? 'Confirmed' : g.rsvp_status === 'Confirmed' ? 'Declined' : 'Pending';
        api.updateGuest(id, { rsvp_status: nextStatus });
        return { ...g, rsvp_status: nextStatus };
      }
      return g;
    }));
  };

  const handleToggleInviteSent = (id?: string) => {
    if (!id) return;
    setGuests(prev => prev.map(g => {
      if (g.id === id) {
        const updated = !g.invitation_sent;
        api.updateGuest(id, { invitation_sent: updated });
        return { ...g, invitation_sent: updated };
      }
      return g;
    }));
    addToast('info', 'Status Updated', 'Invitation dispatch status changed.');
  };

  const handleDeleteGuest = (id?: string) => {
    if (!id) return;
    setGuests(prev => prev.filter(g => g.id !== id));
    api.deleteGuest(id);
    addToast('info', 'Guest Removed');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'RSVP Status', 'Plus Ones', 'Dietary Preferences', 'Email', 'Phone', 'Invitation Sent'];
    const rows = guests.map(g => [
      `"${g.name}"`,
      `"${g.category}"`,
      `"${g.rsvp_status}"`,
      g.plus_ones,
      `"${g.dietary_preferences || 'Standard'}"`,
      `"${g.email || ''}"`,
      `"${g.phone || ''}"`,
      g.invitation_sent ? 'Yes' : 'No'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guests-${currentEvent?.title.toLowerCase().replace(/\s+/g, '-') || 'celebrai'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Roster Exported', 'CSV downloaded.');
  };

  const handleBatchConfirmAll = () => {
    setGuests(prev => prev.map(g => ({ ...g, rsvp_status: 'Confirmed' })));
    addToast('success', 'Batch RSVP', 'All pending guests marked as Confirmed.');
  };

  // Stats
  const totalInvited = guests.reduce((sum, g) => sum + 1 + (g.plus_ones || 0), 0);
  const confirmedCount = guests.filter(g => g.rsvp_status === 'Confirmed').reduce((sum, g) => sum + 1 + (g.plus_ones || 0), 0);
  const pendingCount = guests.filter(g => g.rsvp_status === 'Pending').length;
  const declinedCount = guests.filter(g => g.rsvp_status === 'Declined').length;

  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || 
      (g.email && g.email.toLowerCase().includes(search.toLowerCase())) ||
      (g.phone && g.phone.includes(search));
    const matchCat = categoryFilter === 'All' || g.category === categoryFilter;
    const matchRsvp = rsvpFilter === 'All' || g.rsvp_status === rsvpFilter;
    return matchSearch && matchCat && matchRsvp;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple">
            Attendance Hub
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            Guest Management & RSVPs
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Target Headcount: <span className="font-bold text-brand-purple">{currentEvent?.guest_count || 30}</span> • Live RSVP tracking, plus-ones and dietary tags
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-xs font-semibold text-brand-navy dark:text-brand-warm-white hover:bg-brand-lavender/40 flex items-center space-x-1.5 transition-all shadow-xs"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleBatchConfirmAll}
            className="px-3.5 py-2.5 rounded-xl bg-brand-lavender dark:bg-white/10 text-brand-purple dark:text-brand-lavender text-xs font-semibold hover:bg-brand-purple hover:text-white flex items-center space-x-1.5 transition-all"
            title="Mark all as confirmed"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Confirm All</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center space-x-1.5 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Total Expected</span>
          <div className="text-2xl font-bold font-serif text-brand-navy dark:text-brand-warm-white mt-1">
            {totalInvited}
          </div>
          <span className="text-[11px] text-gray-400">Including plus-ones</span>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Confirmed Attendees</span>
          <div className="text-2xl font-bold font-serif text-emerald-600 mt-1">
            {confirmedCount}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">RSVP Confirmed</span>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Awaiting Response</span>
          <div className="text-2xl font-bold font-serif text-amber-500 mt-1">
            {pendingCount}
          </div>
          <span className="text-[11px] text-amber-500 font-medium">Pending reply</span>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Regretfully Declined</span>
          <div className="text-2xl font-bold font-serif text-rose-500 mt-1">
            {declinedCount}
          </div>
          <span className="text-[11px] text-gray-400">Cannot attend</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl saas-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            aria-label="Search guests by name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guest name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-purple"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            aria-label="Filter guests by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs cursor-pointer"
          >
            <option>All</option>
            <option>Family</option>
            <option>Friends</option>
            <option>Colleague</option>
            <option>VIP</option>
          </select>

          <select
            aria-label="Filter guests by RSVP status"
            value={rsvpFilter}
            onChange={(e) => setRsvpFilter(e.target.value)}
            className="p-2 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs cursor-pointer"
          >
            <option>All</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Declined</option>
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <div className="p-6 rounded-2xl saas-card overflow-x-auto">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">No guests found matching your filter criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400">
                <th className="pb-3 font-semibold">Guest</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">RSVP Status</th>
                <th className="pb-3 font-semibold">Dietary</th>
                <th className="pb-3 font-semibold">Plus Ones</th>
                <th className="pb-3 font-semibold">Invite Sent</th>
                <th className="pb-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredGuests.map((g, i) => (
                <tr key={i} className="hover:bg-brand-warm-white/50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-brand-navy dark:text-brand-warm-white">{g.name}</div>
                    <div className="text-[11px] text-gray-400">{g.email || g.phone || 'No contact specified'}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-lavender dark:bg-white/10 text-brand-purple dark:text-brand-lavender">
                      {g.category}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleRSVP(g.id)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        g.rsvp_status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : g.rsvp_status === 'Declined'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                      title="Click to toggle RSVP status"
                    >
                      {g.rsvp_status}
                    </button>
                  </td>
                  <td className="py-3 text-gray-500">
                    {g.dietary_preferences || 'Standard'}
                  </td>
                  <td className="py-3 font-mono">
                    +{g.plus_ones}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleInviteSent(g.id)}
                      className={`text-[11px] flex items-center space-x-1 ${
                        g.invitation_sent ? 'text-emerald-600 font-medium' : 'text-gray-400 hover:text-brand-purple'
                      }`}
                      title="Toggle dispatch status"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{g.invitation_sent ? 'Dispatched' : 'Draft'}</span>
                    </button>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => handleDeleteGuest(g.id)}
                      className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                      title="Delete guest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B1E2E] p-6 rounded-3xl max-w-md w-full border border-brand-lavender dark:border-white/10 shadow-2xl">
            <h3 className="font-serif text-lg font-bold mb-4">Add Guest to Celebration</h3>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Krishnan"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs cursor-pointer"
                  >
                    <option>Friends</option>
                    <option>Family</option>
                    <option>Colleague</option>
                    <option>VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Plus Ones</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Dietary Preferences</label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="e.g. Vegan, Nut Allergy, Jain Veg"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-purple text-white shadow-premium"
                >
                  Add to Guest List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
