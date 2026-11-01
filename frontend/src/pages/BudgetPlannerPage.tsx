import React, { useState, useEffect } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { Expense } from '../types';
import { 
  PieChart as PieChartIcon, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Filter,
  DollarSign,
  Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const BudgetPlannerPage: React.FC = () => {
  const { currentEvent, updateCurrentEvent, addToast } = useEventContext();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [instruction, setInstruction] = useState<string>('Reduce decorations by ₹1,000 and increase food budget by ₹1,000');
  const [aiOptimizing, setAiOptimizing] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');

  // Add Expense Modal/Form state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('Catering');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newAllocated, setNewAllocated] = useState<number>(1000);
  const [newActual, setNewActual] = useState<number>(0);
  const [newPaid, setNewPaid] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');

  const categories = [
    'Venue', 'Decorations', 'Catering', 'Photography', 'Cake', 'Entertainment', 'Gifts', 'Transportation', 'Miscellaneous'
  ];

  const sampleVoiceInstructions = [
    "Reduce decorations by ₹1,000 and increase food budget by ₹1,000",
    "Reduce venue by ₹500 and increase cake by ₹500",
    "Reduce photography by ₹400 and increase music by ₹400"
  ];

  const totalBudget = currentEvent?.total_budget || 15000;
  const allocations = currentEvent?.budget_breakdown || [];
  const totalAllocated = allocations.reduce((sum, item) => sum + item.allocated_amount, 0);

  // Load expenses for active event
  useEffect(() => {
    if (currentEvent) {
      api.getExpenses(currentEvent.id).then(res => {
        if (res && res.length > 0) {
          setExpenses(res);
        } else {
          // Initialize mock expenses from current event breakdown
          const initialExpenses: Expense[] = allocations.map((b, i) => ({
            id: `exp-${i}`,
            event_id: currentEvent.id,
            category: b.category.split('&')[0].trim(),
            item_name: `${b.category} Base Package`,
            allocated_amount: b.allocated_amount,
            actual_amount: Math.round(b.allocated_amount * 0.5),
            paid: i % 2 === 0,
            notes: b.notes
          }));
          setExpenses(initialExpenses);
        }
      });
    }
  }, [currentEvent?.id]);

  const totalActual = expenses.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  const remainingBalance = totalBudget - totalActual;
  const isOverBudget = totalAllocated > totalBudget;

  const handleAIOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    if (!instruction.trim()) {
      addToast('warning', 'Empty Instruction', 'Please type a rebalancing request.');
      return;
    }

    setAiOptimizing(true);
    setAiExplanation('');

    try {
      const res = await api.optimizeBudget(totalBudget, allocations, instruction);
      setAiExplanation(res.explanation);

      if (res.updated_allocations) {
        await updateCurrentEvent({
          budget_breakdown: res.updated_allocations
        });
      }

      if (res.budget_exceeded) {
        addToast('warning', 'Budget Warning', `Plan exceeds budget by ₹${res.difference}`);
      } else {
        addToast('success', 'Budget Optimized', 'Allocations updated via AI.');
      }
    } catch (err: any) {
      addToast('error', 'Optimization failed', err.message);
    } finally {
      setAiOptimizing(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;

    if (!newItemName.trim()) {
      setModalError('Please enter an expense title or vendor name.');
      return;
    }
    if (newAllocated < 0 || newActual < 0) {
      setModalError('Amounts cannot be negative.');
      return;
    }

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      event_id: currentEvent.id,
      category: newCategory,
      item_name: newItemName.trim(),
      allocated_amount: Number(newAllocated),
      actual_amount: Number(newActual),
      paid: newPaid,
      notes: ''
    };

    setExpenses(prev => [...prev, newExp]);
    api.addExpense(newExp);
    setShowAddModal(false);
    setNewItemName('');
    setModalError('');
    addToast('success', 'Expense recorded', 'Item added to tracker');
  };

  const handleDeleteExpense = (id?: string) => {
    if (!id) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    api.deleteExpense(id);
    addToast('info', 'Expense deleted');
  };

  const handleTogglePaid = (id?: string) => {
    if (!id) return;
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e));
  };

  const filteredExpenses = selectedCategory === 'All'
    ? expenses
    : expenses.filter(e => e.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const barData = allocations.map(a => {
    const matchedExp = expenses.filter(e => a.category.toLowerCase().includes(e.category.toLowerCase()));
    const actualSum = matchedExp.reduce((sum, e) => sum + e.actual_amount, 0);
    return {
      category: a.category.split('&')[0].trim(),
      Allocated: a.allocated_amount,
      Actual: actualSum
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple">
            Financial Architecture
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            Intelligent Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total Cap: <span className="font-bold text-brand-purple">₹{totalBudget.toLocaleString()}</span> • Real-time expense auditing & verbal AI rebalancing
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setModalError('');
          }}
          className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center space-x-1.5 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Warning banner if over budget */}
      {isOverBudget && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center space-x-3 text-xs animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <div>
            <span className="font-bold">Budget Exceeded Alert: </span>
            Allocated sum (₹{totalAllocated.toLocaleString()}) exceeds your specified ₹{totalBudget.toLocaleString()} budget by ₹{(totalAllocated - totalBudget).toLocaleString()}. Use the AI Optimizer below to rebalance immediately.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Total Budget</span>
          <div className="text-2xl font-bold font-serif text-brand-navy dark:text-brand-warm-white mt-1">
            ₹{totalBudget.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray-400">Fixed celebration ceiling</span>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Allocated Budget</span>
          <div className="text-2xl font-bold font-serif text-brand-purple dark:text-brand-lavender mt-1">
            ₹{totalAllocated.toLocaleString()}
          </div>
          <span className={`text-[11px] ${isOverBudget ? 'text-rose-500 font-semibold' : 'text-emerald-500'}`}>
            {Math.round((totalAllocated / totalBudget) * 100)}% of ceiling
          </span>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Actual Realized</span>
          <div className="text-2xl font-bold font-serif text-blue-600 dark:text-blue-400 mt-1">
            ₹{totalActual.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray-400">Tracked in expenses</span>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <span className="text-xs text-gray-400">Remaining Balance</span>
          <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{remainingBalance.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">Available to spend</span>
        </div>
      </div>

      {/* Standout AI Verbal Budget Optimizer */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-lavender/50 via-white to-brand-powder-blue/30 dark:from-[#1E2235] dark:via-[#1B1E2E] dark:to-[#171A29] border border-brand-lavender dark:border-white/10 shadow-premium">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-brand-purple" />
          <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-brand-warm-white">
            Conversational AI Budget Optimizer
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-purple text-white">
            Standout Feature #3
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Instruct the AI in plain English to shift allocations. It calculates exact transfers, prevents budget creep, and explains changes with zero errors.
        </p>

        <form onSubmit={handleAIOptimize} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Reduce decorations by ₹1,000 and increase food budget by ₹1,000"
            className="flex-1 p-3 rounded-xl border border-brand-lavender dark:border-white/10 bg-white dark:bg-[#141622] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />
          <button
            type="submit"
            disabled={aiOptimizing}
            className="px-6 py-3 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aiOptimizing ? 'Optimizing...' : 'Rebalance Budget'}</span>
          </button>
        </form>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[10px] font-semibold text-gray-400">Quick Prompts:</span>
          {sampleVoiceInstructions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInstruction(s)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-white/80 dark:bg-white/5 border border-brand-lavender/60 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:text-brand-purple transition-colors"
            >
              "{s}"
            </button>
          ))}
        </div>

        {aiExplanation && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-[#141622] border border-brand-purple/30 text-xs text-brand-navy dark:text-brand-warm-white leading-relaxed flex items-start space-x-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-brand-purple block mb-0.5">AI Rebalance Report:</span>
              {aiExplanation}
            </div>
          </div>
        )}
      </div>

      {/* Chart: Planned vs Actual by Category */}
      <div className="p-6 rounded-2xl saas-card">
        <h3 className="font-serif text-base font-bold text-brand-navy dark:text-brand-warm-white mb-2">
          Category Allocation vs Realized Spend
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#1B1E2E', borderColor: '#6750A4', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="Allocated" fill="#DCEBFA" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#6750A4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Expense Tracker Table */}
      <div className="p-6 rounded-2xl saas-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-serif text-base font-bold text-brand-navy dark:text-brand-warm-white">
              Itemized Expenses ({filteredExpenses.length})
            </h3>
            <p className="text-xs text-gray-400">Track vendor quotes, deposits and final payments</p>
          </div>

          {/* Category filter */}
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-1.5 rounded-lg border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs cursor-pointer"
            >
              <option>All</option>
              {categories.map((c, i) => <option key={i}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400">
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Item & Description</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-right">Allocated</th>
                <th className="pb-3 font-semibold text-right">Actual Spent</th>
                <th className="pb-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredExpenses.map((exp, i) => (
                <tr key={i} className="hover:bg-brand-warm-white/50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <button
                      onClick={() => handleTogglePaid(exp.id)}
                      className={`px-2 py-0.5 rounded-md font-semibold text-[10px] transition-all ${
                        exp.paid
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                      title="Click to toggle payment status"
                    >
                      {exp.paid ? 'Paid' : 'Pending'}
                    </button>
                  </td>
                  <td className="py-3 font-medium text-brand-navy dark:text-brand-warm-white">
                    {exp.item_name}
                  </td>
                  <td className="py-3 text-gray-500">
                    {exp.category}
                  </td>
                  <td className="py-3 text-right font-mono">
                    ₹{exp.allocated_amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-brand-purple dark:text-brand-lavender">
                    ₹{exp.actual_amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B1E2E] p-6 rounded-3xl max-w-md w-full border border-brand-lavender dark:border-white/10 shadow-2xl">
            <h3 className="font-serif text-lg font-bold mb-4">Record New Expense</h3>
            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {modalError}
              </div>
            )}
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Item / Vendor Title *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => {
                    setNewItemName(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  placeholder="e.g. Balloon Garland Vendor"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs cursor-pointer"
                >
                  {categories.map((c, i) => <option key={i}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Allocated (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newAllocated}
                    onChange={(e) => setNewAllocated(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Actual Spent (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newActual}
                    onChange={(e) => setNewActual(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="paidCheck"
                  checked={newPaid}
                  onChange={(e) => setNewPaid(e.target.checked)}
                  className="rounded text-brand-purple cursor-pointer"
                />
                <label htmlFor="paidCheck" className="text-xs cursor-pointer">Mark as paid immediately</label>
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
