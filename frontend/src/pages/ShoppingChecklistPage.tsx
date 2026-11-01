import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { ShoppingItem } from '../types';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Check, 
  Filter, 
  Sparkles, 
  ShoppingBag,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const ShoppingChecklistPage: React.FC = () => {
  const { currentEvent, updateCurrentEvent, addToast } = useEventContext();

  const [items, setItems] = useState<ShoppingItem[]>(
    currentEvent?.shopping_checklist || []
  );

  const [filterCategory, setFilterCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Decorations');
  const [quantity, setQuantity] = useState('1 pc');
  const [price, setPrice] = useState(300);

  // Fast inline adder
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState<number | ''>(500);

  const syncItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    updateCurrentEvent({ shopping_checklist: newItems });
  };

  const handleTogglePurchased = (id?: string) => {
    if (!id) return;
    const updated = items.map(it => it.id === id ? { ...it, purchased: !it.purchased } : it);
    syncItems(updated);
    addToast('info', 'Status Updated');
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const newItem: ShoppingItem = {
      id: `s-${Date.now()}`,
      item_name: quickName.trim(),
      category: 'Decorations',
      quantity: '1 set',
      estimated_price: Number(quickPrice) || 300,
      purchased: false
    };

    const updated = [...items, newItem];
    syncItems(updated);
    setQuickName('');
    setQuickPrice(500);
    addToast('success', 'Supply Added', newItem.item_name);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: ShoppingItem = {
      id: `s-${Date.now()}`,
      item_name: name.trim(),
      category,
      quantity: quantity.trim() || '1 pc',
      estimated_price: Number(price) || 0,
      purchased: false
    };
    const updated = [...items, newItem];
    syncItems(updated);
    setShowAddModal(false);
    setName('');
    addToast('success', 'Item Added to Checklist', newItem.item_name);
  };

  const handleDeleteItem = (id?: string) => {
    if (!id) return;
    const updated = items.filter(it => it.id !== id);
    syncItems(updated);
    addToast('info', 'Item Removed');
  };

  const categories = ['All', 'Decorations', 'Tableware', 'Cake', 'Memories', 'Favors', 'Beverages'];

  const filteredItems = filterCategory === 'All'
    ? items
    : items.filter(it => it.category.toLowerCase() === filterCategory.toLowerCase());

  const totalEstimated = items.reduce((sum, it) => sum + (it.estimated_price || 0), 0);
  const purchasedTotal = items.filter(it => it.purchased).reduce((sum, it) => sum + (it.estimated_price || 0), 0);
  const purchasedCount = items.filter(it => it.purchased).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple">
            Procurement & Supplies
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            Shopping Checklist
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Calculated supply orders tailored to your {currentEvent?.theme.vibe_keywords.join(', ') || 'celebration'} aesthetic
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center space-x-1.5 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Supply</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Total Estimated Procurement</span>
          <div className="text-2xl font-bold font-serif text-brand-navy dark:text-brand-warm-white mt-1">
            ₹{totalEstimated.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray-400">{items.length} items on checklist</span>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Purchased Value</span>
          <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{purchasedTotal.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">{purchasedCount} of {items.length} completed</span>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Pending Value</span>
          <div className="text-2xl font-bold font-serif text-amber-500 mt-1">
            ₹{(totalEstimated - purchasedTotal).toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-500 font-medium">Remaining to purchase</span>
        </div>
      </div>

      {/* Notion-style Quick Inline Add Bar */}
      <form onSubmit={handleQuickAdd} className="p-3 rounded-2xl saas-card flex items-center gap-3">
        <Plus className="w-4 h-4 text-brand-purple flex-shrink-0" />
        <input
          type="text"
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          placeholder="Quick add supply (e.g. Extra Fairy Light String, Helium Balloons)..."
          className="flex-1 bg-transparent text-xs text-brand-navy dark:text-brand-warm-white focus:outline-none"
        />
        <div className="flex items-center space-x-1 border-l border-gray-100 dark:border-white/10 pl-3">
          <span className="text-xs text-gray-400">₹</span>
          <input
            type="number"
            min={0}
            value={quickPrice}
            onChange={(e) => setQuickPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Est. Cost"
            className="w-20 bg-transparent text-xs font-mono text-brand-purple dark:text-brand-lavender font-bold focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!quickName.trim()}
          className="px-3.5 py-1.5 rounded-xl bg-brand-purple text-white text-xs font-semibold shadow-xs hover:bg-brand-purple-dark transition-all disabled:opacity-40"
        >
          Add
        </button>
      </form>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {categories.map((c, i) => (
          <button
            key={i}
            onClick={() => setFilterCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filterCategory === c
                ? 'bg-brand-purple text-white shadow-xs'
                : 'bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-gray-500 hover:text-brand-navy dark:hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Checklist Items Table */}
      <div className="p-6 rounded-2xl saas-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400">
              <th className="pb-3 font-semibold">Done</th>
              <th className="pb-3 font-semibold">Supply Item</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold">Quantity</th>
              <th className="pb-3 font-semibold text-right">Est. Price</th>
              <th className="pb-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {filteredItems.map((item, i) => (
              <tr key={item.id || i} className="hover:bg-brand-warm-white/50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3">
                  <button
                    onClick={() => handleTogglePurchased(item.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      item.purchased
                        ? 'bg-emerald-500 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:border-brand-purple'
                    }`}
                    title="Toggle purchased"
                  >
                    {item.purchased && <Check className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="py-3 font-medium">
                  <span className={item.purchased ? 'line-through text-gray-400' : 'text-brand-navy dark:text-brand-warm-white'}>
                    {item.item_name}
                  </span>
                </td>
                <td className="py-3 text-gray-500">
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-brand-lavender/60 dark:bg-white/10 text-brand-purple dark:text-brand-lavender font-medium">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 font-mono text-gray-500">
                  {item.quantity}
                </td>
                <td className="py-3 text-right font-mono font-bold text-brand-purple dark:text-brand-lavender">
                  ₹{item.estimated_price.toLocaleString()}
                </td>
                <td className="py-3 text-center">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B1E2E] p-6 rounded-3xl max-w-md w-full border border-brand-lavender dark:border-white/10 shadow-2xl">
            <h3 className="font-serif text-lg font-bold mb-4">Add Checklist Supply</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Polaroid Instant Film Double Pack"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs cursor-pointer"
                  >
                    {categories.filter(c => c !== 'All').map((c, i) => <option key={i}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Quantity</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 2 sets"
                    className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Estimated Cost (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
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
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
