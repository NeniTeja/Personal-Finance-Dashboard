import { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import { fmt, todayISO } from '../utils/format';

const empty = { source: '', category: 'Salary', amount: '', date: todayISO(), notes: '' };

export default function Income() {
  const { income, incomeCategories, addIncome, updateIncome, deleteIncome } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const total = income.reduce((s, i) => s + Number(i.amount), 0);

  const filtered = useMemo(() => {
    return income
      .filter((i) => (categoryFilter === 'All' ? true : i.category === categoryFilter))
      .filter((i) => i.source.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [income, search, categoryFilter]);

  function openAdd() {
    setEditingId(null);
    setForm(empty);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({ source: item.source, category: item.category, amount: item.amount, date: item.date, notes: item.notes || '' });
    setModalOpen(true);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.source || !form.amount) return;
    const payload = { ...form, amount: Number(form.amount) };
    if (editingId) updateIncome(editingId, payload);
    else addIncome(payload);
    setModalOpen(false);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Income</h1>
          <p>
            Total recorded: <span className="num">{fmt(total)}</span> across {income.length} entries
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add income
        </button>
      </div>

      <div className="toolbar">
        <input
          className="input search"
          placeholder="Search by source…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>All</option>
          {incomeCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty">No income entries match.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td>{i.source}</td>
                  <td>
                    <span className="pill">{i.category}</span>
                  </td>
                  <td className="num" style={{ color: '#8f8f8f' }}>
                    {i.date}
                  </td>
                  <td className="num up" style={{ textAlign: 'right' }}>
                    +{fmt(i.amount)}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(i)}>
                      Edit
                    </button>
                    <button className="btn btn-ghost btn-sm btn-danger" onClick={() => deleteIncome(i.id)}>
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
        <Modal title={editingId ? 'Edit income' : 'Add income'} onClose={() => setModalOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Source</label>
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="e.g. Company Payroll"
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {incomeCategories.map((c) => (
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
            <div className="field">
              <label>Notes (optional)</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save changes' : 'Add income'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
