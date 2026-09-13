import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { fmt, monthKey, monthLabel, todayISO } from '../utils/format';
import { EXPENSE_COLORS, colorFor } from '../utils/categoryColors';

function lastNMonthKeys(n) {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(dd.toISOString().slice(0, 7));
  }
  return out;
}

export default function Dashboard() {
  const { income, expenses, goals, settings } = useFinance();
  const currentMonth = monthKey(todayISO());

  const totals = useMemo(() => {
    const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalSaved = goals.reduce((s, g) => s + Number(g.saved), 0);
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, totalSaved };
  }, [income, expenses, goals]);

  const monthlyChartData = useMemo(() => {
    const keys = lastNMonthKeys(6);
    return keys.map((k) => ({
      month: monthLabel(k),
      Income: income.filter((i) => monthKey(i.date) === k).reduce((s, i) => s + Number(i.amount), 0),
      Expenses: expenses.filter((e) => monthKey(e.date) === k).reduce((s, e) => s + Number(e.amount), 0),
    }));
  }, [income, expenses]);

  const currentMonthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === currentMonth),
    [expenses, currentMonth]
  );

  const byCategory = useMemo(() => {
    const map = {};
    currentMonthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [currentMonthExpenses]);

  const currentMonthTotal = currentMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const overLimit = settings.alertsEnabled && currentMonthTotal > Number(settings.monthlyLimit || 0);

  const recent = useMemo(() => {
    const all = [
      ...income.map((i) => ({ ...i, kind: 'income', label: i.source })),
      ...expenses.map((e) => ({ ...e, kind: 'expense', label: e.title })),
    ];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [income, expenses]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Your finances at a glance, updated as you go.</p>
        </div>
      </div>

      {overLimit && (
        <div className="alert">
          <span>
            You've spent <b className="num">{fmt(currentMonthTotal)}</b> this month — over your{' '}
            <b className="num">{fmt(settings.monthlyLimit)}</b> limit.
          </span>
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Total income" value={fmt(totals.totalIncome)} tone="up" />
        <StatCard label="Total expenses" value={fmt(totals.totalExpenses)} tone="down" />
        <StatCard
          label="Available balance"
          value={fmt(totals.balance)}
          sub={totals.balance >= 0 ? 'Healthy' : 'Overspent'}
        />
        <StatCard label="Total savings" value={fmt(totals.totalSaved)} sub={`${goals.length} active goals`} />
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>Monthly income vs expenses</h3>
            <span className="hint">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyChartData} barGap={4}>
              <CartesianGrid vertical={false} stroke="#1e1e1e" />
              <XAxis dataKey="month" stroke="#5c5c5c" fontSize={12} tickLine={false} axisLine={{ stroke: '#1e1e1e' }} />
              <YAxis stroke="#5c5c5c" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: '#121212', border: '1px solid #1e1e1e', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: '#ededed' }}
                formatter={(v) => fmt(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Income" fill="#3ddc97" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ff6b5e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Expense categories</h3>
            <span className="hint">This month</span>
          </div>
          {byCategory.length === 0 ? (
            <div className="empty">No expenses logged this month yet.</div>
          ) : (
            byCategory.map(([cat, amt]) => (
              <div className="category-row" key={cat}>
                <span className="category-name">
                  <span className="dot" style={{ background: colorFor(EXPENSE_COLORS, cat) }} />
                  {cat}
                </span>
                <span className="num">{fmt(amt)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>Recent activity</h3>
          </div>
          {recent.length === 0 ? (
            <div className="empty">Nothing logged yet.</div>
          ) : (
            <table className="table">
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.label}</td>
                    <td>
                      <span className="pill">{r.category}</span>
                    </td>
                    <td className="num" style={{ color: '#5c5c5c' }}>
                      {r.date}
                    </td>
                    <td className={`num ${r.kind === 'income' ? 'up' : 'down'}`} style={{ textAlign: 'right' }}>
                      {r.kind === 'income' ? '+' : '-'}
                      {fmt(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Savings goals</h3>
          </div>
          {goals.length === 0 ? (
            <div className="empty">No goals yet.</div>
          ) : (
            goals.slice(0, 4).map((g) => {
              const pct = g.target ? Math.round((g.saved / g.target) * 100) : 0;
              return (
                <div key={g.id} style={{ marginBottom: 14 }}>
                  <div className="goal-amounts" style={{ marginBottom: 6 }}>
                    <span>{g.name}</span>
                    <span>
                      {fmt(g.saved)} / {fmt(g.target)}
                    </span>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
