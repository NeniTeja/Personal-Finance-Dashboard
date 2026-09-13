export const EXPENSE_COLORS = {
  Food: '#ff6b5e',
  Travel: '#e8b94e',
  Education: '#7c8cff',
  Shopping: '#c084fc',
  Bills: '#3ddc97',
  Other: '#8f8f8f',
};

export const INCOME_COLORS = {
  Salary: '#3ddc97',
  Freelance: '#7c8cff',
  Business: '#e8b94e',
  Investment: '#c084fc',
  Other: '#8f8f8f',
};

export const colorFor = (map, key) => map[key] || '#8f8f8f';
