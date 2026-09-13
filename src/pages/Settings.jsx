import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function Settings() {
  const { settings, updateSettings } = useFinance();
  const [limit, setLimit] = useState(settings.monthlyLimit);

  function saveLimit(e) {
    e.preventDefault();
    updateSettings({ monthlyLimit: Number(limit) || 0 });
  }

  function clearAllData() {
    if (confirm('This clears all income, expenses, goals and settings from this browser. Continue?')) {
      localStorage.removeItem('pfd_income');
      localStorage.removeItem('pfd_expenses');
      localStorage.removeItem('pfd_goals');
      localStorage.removeItem('pfd_settings');
      window.location.reload();
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Control alerts and manage your locally stored data.</p>
        </div>
      </div>

      <div className="panel settings-block">
        <div className="panel-head">
          <h3>Spending alerts</h3>
        </div>

        <div className="settings-row">
          <div>
            <div>Monthly spending limit alert</div>
            <div>Warn me on the dashboard when a month's expenses cross this amount</div>
          </div>
        </div>
        <form onSubmit={saveLimit} style={{ display: 'flex', gap: 8, padding: '14px 0' }}>
          <input className="input" type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} />
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        </form>

        <div className="settings-row">
          <div>
            <div>Enable alerts</div>
            <div>Toggle the spending-limit banner on the dashboard</div>
          </div>
          <div
            className={`toggle ${settings.alertsEnabled ? 'on' : ''}`}
            onClick={() => updateSettings({ alertsEnabled: !settings.alertsEnabled })}
          >
            <div className="toggle-knob" />
          </div>
        </div>
      </div>

      <div className="panel settings-block">
        <div className="panel-head">
          <h3>Data</h3>
        </div>
        <div className="settings-row">
          <div>
            <div>Storage</div>
            <div>All data is saved locally in this browser via LocalStorage — no backend involved</div>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div>Clear all data</div>
            <div>Removes income, expenses, goals and settings permanently</div>
          </div>
          <button className="btn btn-danger" onClick={clearAllData}>
            Clear data
          </button>
        </div>
      </div>
    </>
  );
}
