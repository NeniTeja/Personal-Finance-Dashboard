import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { uid } from '../utils/id';

const FinanceContext = createContext(null);

const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];
const DEFAULT_EXPENSE_CATEGORIES = ['Food', 'Travel', 'Education', 'Shopping', 'Bills', 'Other'];

const SEED_INCOME = [
  { id: uid(), source: 'Company Payroll', category: 'Salary', amount: 40000, date: monthDate(1), notes: '' },
];
const SEED_EXPENSES = [
  { id: uid(), title: 'Groceries', category: 'Food', amount: 3200, date: monthDate(3), recurring: false, notes: '' },
  { id: uid(), title: 'Metro pass', category: 'Travel', amount: 1200, date: monthDate(5), recurring: true, notes: '' },
  { id: uid(), title: 'Electricity bill', category: 'Bills', amount: 2100, date: monthDate(7), recurring: true, notes: '' },
  { id: uid(), title: 'Course subscription', category: 'Education', amount: 999, date: monthDate(10), recurring: true, notes: '' },
  { id: uid(), title: 'New shoes', category: 'Shopping', amount: 2600, date: monthDate(14), recurring: false, notes: '' },
];
const SEED_GOALS = [
  { id: uid(), name: 'Laptop Fund', target: 60000, saved: 25000, deadline: '' },
  { id: uid(), name: 'Emergency Fund', target: 100000, saved: 42000, deadline: '' },
];

function monthDate(day) {
  const d = new Date();
  d.setDate(Math.min(day, 28));
  return d.toISOString().slice(0, 10);
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function FinanceProvider({ children }) {
  const [income, setIncome] = useState(() => load('pfd_income', SEED_INCOME));
  const [expenses, setExpenses] = useState(() => load('pfd_expenses', SEED_EXPENSES));
  const [goals, setGoals] = useState(() => load('pfd_goals', SEED_GOALS));
  const [settings, setSettings] = useState(() =>
    load('pfd_settings', { monthlyLimit: 30000, alertsEnabled: true, currency: 'INR' })
  );

  useEffect(() => save('pfd_income', income), [income]);
  useEffect(() => save('pfd_expenses', expenses), [expenses]);
  useEffect(() => save('pfd_goals', goals), [goals]);
  useEffect(() => save('pfd_settings', settings), [settings]);

  const api = useMemo(
    () => ({
      income,
      expenses,
      goals,
      settings,
      incomeCategories: DEFAULT_INCOME_CATEGORIES,
      expenseCategories: DEFAULT_EXPENSE_CATEGORIES,

      addIncome: (entry) => setIncome((prev) => [{ id: uid(), ...entry }, ...prev]),
      updateIncome: (id, patch) => setIncome((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),
      deleteIncome: (id) => setIncome((prev) => prev.filter((i) => i.id !== id)),

      addExpense: (entry) => setExpenses((prev) => [{ id: uid(), ...entry }, ...prev]),
      updateExpense: (id, patch) => setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e))),
      deleteExpense: (id) => setExpenses((prev) => prev.filter((e) => e.id !== id)),

      addGoal: (entry) => setGoals((prev) => [{ id: uid(), saved: 0, ...entry }, ...prev]),
      updateGoal: (id, patch) => setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g))),
      deleteGoal: (id) => setGoals((prev) => prev.filter((g) => g.id !== id)),
      contributeToGoal: (id, amount) =>
        setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g))),

      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
    }),
    [income, expenses, goals, settings]
  );

  return <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
