const { request, app, resetDatabase, registerUser, createDefaultCategory } = require('./setup');

let token;
let categoryId;

beforeEach(async () => {
  await resetDatabase();
  const { res } = await registerUser();
  token = res.body.data.accessToken;
  const category = await createDefaultCategory(res.body.data.user.id, 'Food');
  categoryId = category.id;
});

function authed(req) {
  return req.set('Authorization', `Bearer ${token}`);
}

describe('Monthly calculations', () => {
  test('dashboard balance equals total income minus total expenses for the selected month', async () => {
    await authed(request(app).post('/api/income')).send({
      amount: 50000,
      source: 'SALARY',
      date: '2026-08-01',
    });
    await authed(request(app).post('/api/expenses')).send({
      amount: 28500,
      categoryId,
      description: 'August spending',
      date: '2026-08-15',
      paymentMethod: 'UPI',
    });

    const res = await authed(request(app).get('/api/dashboard').query({ month: '2026-08' }));
    expect(res.body.data.summary.income).toBe(50000);
    expect(res.body.data.summary.expenses).toBe(28500);
    expect(res.body.data.summary.balance).toBe(21500);
  });

  test('excludes transactions outside the selected month', async () => {
    await authed(request(app).post('/api/expenses')).send({
      amount: 1000,
      categoryId,
      description: 'July expense',
      date: '2026-07-15',
      paymentMethod: 'CASH',
    });
    await authed(request(app).post('/api/expenses')).send({
      amount: 2000,
      categoryId,
      description: 'August expense',
      date: '2026-08-15',
      paymentMethod: 'CASH',
    });

    const res = await authed(request(app).get('/api/dashboard').query({ month: '2026-08' }));
    expect(res.body.data.summary.expenses).toBe(2000);
  });

  test('category breakdown percentages sum to ~100%', async () => {
    await authed(request(app).post('/api/expenses')).send({
      amount: 300,
      categoryId,
      description: 'A',
      date: '2026-08-01',
      paymentMethod: 'CASH',
    });
    await authed(request(app).post('/api/expenses')).send({
      amount: 700,
      categoryId,
      description: 'B',
      date: '2026-08-02',
      paymentMethod: 'CASH',
    });

    const res = await authed(request(app).get('/api/dashboard').query({ month: '2026-08' }));
    const totalPct = res.body.data.categoryBreakdown.reduce((acc, c) => acc + c.percentage, 0);
    expect(totalPct).toBeGreaterThan(99);
    expect(totalPct).toBeLessThanOrEqual(100.1);
  });
});
