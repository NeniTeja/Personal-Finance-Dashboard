import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { fmt, monthKey, todayISO } from '../utils/format';
import { EXPENSE_COLORS, colorFor } from '../utils/categoryColors';

function prevMonthKey(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return d.toISOString().slice(0, 7);
}

export default function Reports() {
  const { expenses, goals } = useFinance();
  const currentMonth = monthKey(todayISO());
  const lastMonth = prevMonthKey(currentMonth);

  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const goalProgress = useMemo(
    () => goals.map((g) => ({ name: g.name, pct: g.target ? Math.round((g.saved / g.target) * 100) : 0 })),
    [goals]
  );

  const thisMonthTotal = expenses.filter((e) => monthKey(e.date) === currentMonth).reduce((s, e) => s + Number(e.amount), 0);
  const lastMonthTotal = expenses.filter((e) => monthKey(e.date) === lastMonth).reduce((s, e) => s + Number(e.amount), 0);
  const delta = lastMonthTotal ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : null;

  const topCategory = categoryData.slice().sort((a, b) => b.value - a.value)[0];
  const recurringTotal = expenses.filter((e) => e.recurring).reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p>Where your money is going, and how your goals are tracking.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>Expense breakdown by category</h3>
            <span className="hint">All time</span>
          </div>
          {categoryData.length === 0 ? (
            <div className="empty">No expenses logged yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categoryData.map((entry, idx) => (
                    <Cell key={idx} fill={colorFor(EXPENSE_COLORS, entry.name)} stroke="#000" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#121212', border: '1px solid #1e1e1e', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => fmt(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Savings progress</h3>
            <span className="hint">All goals</span>
          </div>
          {goalProgress.length === 0 ? (
            <div className="empty">No goals yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={goalProgress} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid horizontal={false} stroke="#1e1e1e" />
                <XAxis type="number" domain={[0, 100]} stroke="#5c5c5c" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" stroke="#8f8f8f" fontSize={12} width={110} />
                <Tooltip
                  contentStyle={{ background: '#121212', border: '1px solid #1e1e1e', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => `${v}%`}
                />
                <Bar dataKey="pct" fill="#3ddc97" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Insights</h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.9, color: '#c9c9c9' }}>
          {topCategory && (
            <li>
              Your biggest spending category overall is <b>{topCategory.name}</b> at <span className="num">{fmt(topCategory.value)}</span>.
            </li>
          )}
          {delta !== null && (
            <li>
              This month's spending is{' '}
              <b className={delta > 0 ? 'down' : 'up'}>
                {delta > 0 ? `${delta}% higher` : `${Math.abs(delta)}% lower`}
              </b>{' '}
              than last month.
            </li>
          )}
          {recurringTotal > 0 && (
            <li>
              Recurring expenses add up to <span className="num">{fmt(recurringTotal)}</span> across your history — worth reviewing for savings.
            </li>
          )}
          {categoryData.length === 0 && <li>Add a few expenses to unlock spending insights.</li>}
        </ul>
      </div>
    </>
  );
}
