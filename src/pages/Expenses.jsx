import { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import { fmt, todayISO } from '../utils/format';
import { EXPENSE_COLORS, colorFor } from '../utils/categoryColors';
import { exportToCSV } from '../utils/csv';

const empty = { title: '', category: 'Food', amount: '', date: todayISO(), recurring: false, notes: '' };

export default function Expenses() {
  const { expenses, expenseCategories, addExpense, updateExpense, deleteExpense } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => (categoryFilter === 'All' ? true : e.category === categoryFilter))
      .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
      .filter((e) => (from ? e.date >= from : true))
      .filter((e) => (to ? e.date <= to : true))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, search, categoryFilter, from, to]);

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  function openAdd() {
    setEditingId(null);
    setForm(empty);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      amount: item.amount,
      date: item.date,
      recurring: !!item.recurring,
      notes: item.notes || '',
    });
    setModalOpen(true);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    const payload = { ...form, amount: Number(form.amount) };
    if (editingId) updateExpense(editingId, payload);
    else addExpense(payload);
    setModalOpen(false);
  }

  function handleExport() {
    exportToCSV(
      'expenses.csv',
      filtered.map((e) => ({
        title: e.title,
        category: e.category,
        amount: e.amount,
        date: e.date,
        recurring: e.recurring ? 'yes' : 'no',
        notes: e.notes || '',
      }))
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Expenses</h1>
          <p>
            Showing <span className="num">{fmt(total)}</span> across {filtered.length} of {expenses.length} entries
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={handleExport}>
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            + Add expense
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input search"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>All</option>
          {expenseCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <div className="panel" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty">No expenses match these filters.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ex) => (
                <tr key={ex.id}>
                  <td>
                    {ex.title}
                    {ex.recurring && (
                      <span className="pill" style={{ marginLeft: 8, fontSize: 10.5 }}>
                        Recurring
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="pill">
                      <span className="dot" style={{ background: colorFor(EXPENSE_COLORS, ex.category) }} />
                      {ex.category}
                    </span>
                  </td>
                  <td className="num" style={{ color: '#8f8f8f' }}>
                    {ex.date}
                  </td>
                  <td className="num down" style={{ textAlign: 'right' }}>
                    -{fmt(ex.amount)}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ex)}>
                      Edit
                    </button>
                    <button className="btn btn-ghost btn-sm btn-danger" onClick={() => deleteExpense(ex.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal title={editingId ? 'Edit expense' : 'Add expense'} onClose={() => setModalOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Groceries"
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {expenseCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="recurring"
                checked={form.recurring}
                onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              />
              <label htmlFor="recurring">This is a recurring expense</label>
            </div>
            <div className="field" style={{ marginTop: 13 }}>
              <label>Notes (optional)</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save changes' : 'Add expense'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
