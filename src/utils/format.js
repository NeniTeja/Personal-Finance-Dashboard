export const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(n) || 0
  );

export const monthKey = (dateStr) => (dateStr || '').slice(0, 7); // YYYY-MM

export const monthLabel = (key) => {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);
