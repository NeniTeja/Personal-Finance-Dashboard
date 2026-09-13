import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import { fmt } from '../utils/format';

const empty = { name: '', target: '', saved: '', deadline: '' };

export default function SavingsGoals() {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [contributeFor, setContributeFor] = useState(null);
  const [contribAmount, setContribAmount] = useState('');

  function openAdd() {
    setEditingId(null);
    setForm(empty);
    setModalOpen(true);
  }

  function openEdit(g) {
    setEditingId(g.id);
    setForm({ name: g.name, target: g.target, saved: g.saved, deadline: g.deadline || '' });
    setModalOpen(true);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.target) return;
    const payload = { ...form, target: Number(form.target), saved: Number(form.saved) || 0 };
    if (editingId) updateGoal(editingId, payload);
    else addGoal(payload);
    setModalOpen(false);
  }

  function submitContribution(e) {
    e.preventDefault();
    const amt = Number(contribAmount);
    if (!amt) return;
    contributeToGoal(contributeFor.id, amt);
    setContributeFor(null);
    setContribAmount('');
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Savings Goals</h1>
          <p>Set targets and track how close you are to each one.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="panel">
          <div className="empty">No savings goals yet — add your first one.</div>
        </div>
      ) : (
        <div className="goal-grid">
          {goals.map((g) => {
            const pct = g.target ? Math.round((g.saved / g.target) * 100) : 0;
            const reached = g.saved >= g.target;
            return (
              <div className="goal-card" key={g.id}>
                <div className="goal-top">
                  <div>
                    <div className="goal-name">{g.name}</div>
                    {g.deadline && <div style={{ fontSize: 11.5, color: '#5c5c5c', marginTop: 3 }}>By {g.deadline}</div>}
                  </div>
                  <span className="goal-pct">{pct}%</span>
                </div>
                <ProgressBar pct={pct} />
                <div className="goal-amounts">
                  <span>{fmt(g.saved)}</span>
                  <span style={{ color: '#5c5c5c' }}>of {fmt(g.target)}</span>
                </div>
                {reached && <div style={{ fontSize: 12, color: '#3ddc97', marginBottom: 10 }}>Goal reached 🎉</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-sm" onClick={() => setContributeFor(g)}>
                    Add funds
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-sm btn-danger" onClick={() => deleteGoal(g.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editingId ? 'Edit goal' : 'New savings goal'} onClose={() => setModalOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Goal name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Laptop Fund" required />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Target amount (₹)</label>
                <input type="number" min="0" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required />
              </div>
              <div className="field">
                <label>Already saved (₹)</label>
                <input type="number" min="0" value={form.saved} onChange={(e) => setForm({ ...form, saved: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Target date (optional)</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save changes' : 'Create goal'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {contributeFor && (
        <Modal title={`Add funds to ${contributeFor.name}`} onClose={() => setContributeFor(null)}>
          <form onSubmit={submitContribution}>
            <div className="field">
              <label>Amount (₹)</label>
              <input
                type="number"
                min="1"
                autoFocus
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setContributeFor(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add funds
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
