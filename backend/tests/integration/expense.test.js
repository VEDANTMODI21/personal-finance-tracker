const { request, app, resetDatabase, registerUser, createDefaultCategory } = require('./setup');

let token;
let userId;
let categoryId;

beforeEach(async () => {
  await resetDatabase();
  const { res } = await registerUser();
  token = res.body.data.accessToken;
  userId = res.body.data.user.id;
  const category = await createDefaultCategory(userId, 'Food');
  categoryId = category.id;
});

function authed(req) {
  return req.set('Authorization', `Bearer ${token}`);
}

describe('Expense CRUD', () => {
  test('creates an expense', async () => {
    const res = await authed(request(app).post('/api/expenses')).send({
      amount: 450,
      categoryId,
      description: 'Dinner',
      date: '2026-08-25',
      paymentMethod: 'UPI',
      notes: 'Dinner with friends',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.expense.amount).toBe(450);
  });

  test('rejects a negative or zero amount', async () => {
    const res = await authed(request(app).post('/api/expenses')).send({
      amount: 0,
      categoryId,
      description: 'Bad expense',
      date: '2026-08-25',
      paymentMethod: 'CASH',
    });
    expect(res.status).toBe(422);
  });

  test('rejects an invalid payment method', async () => {
    const res = await authed(request(app).post('/api/expenses')).send({
      amount: 100,
      categoryId,
      description: 'Test',
      date: '2026-08-25',
      paymentMethod: 'BITCOIN',
    });
    expect(res.status).toBe(422);
  });

  test('updates an expense', async () => {
    const createRes = await authed(request(app).post('/api/expenses')).send({
      amount: 100,
      categoryId,
      description: 'Original',
      date: '2026-08-25',
      paymentMethod: 'CASH',
    });
    const id = createRes.body.data.expense.id;

    const updateRes = await authed(request(app).put(`/api/expenses/${id}`)).send({ amount: 200, description: 'Updated' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.expense.amount).toBe(200);
    expect(updateRes.body.data.expense.description).toBe('Updated');
  });

  test('deletes an expense', async () => {
    const createRes = await authed(request(app).post('/api/expenses')).send({
      amount: 100,
      categoryId,
      description: 'To delete',
      date: '2026-08-25',
      paymentMethod: 'CASH',
    });
    const id = createRes.body.data.expense.id;

    const deleteRes = await authed(request(app).delete(`/api/expenses/${id}`));
    expect(deleteRes.status).toBe(200);

    const getRes = await authed(request(app).get(`/api/expenses/${id}`));
    expect(getRes.status).toBe(404);
  });

  test('searches and filters expenses', async () => {
    await authed(request(app).post('/api/expenses')).send({
      amount: 500,
      categoryId,
      description: 'Grocery shopping',
      date: '2026-08-05',
      paymentMethod: 'CASH',
    });
    await authed(request(app).post('/api/expenses')).send({
      amount: 1200,
      categoryId,
      description: 'Movie night',
      date: '2026-08-10',
      paymentMethod: 'UPI',
    });

    const searchRes = await authed(request(app).get('/api/expenses').query({ search: 'grocery' }));
    expect(searchRes.body.data.expenses).toHaveLength(1);
    expect(searchRes.body.data.expenses[0].description).toBe('Grocery shopping');

    const filterRes = await authed(request(app).get('/api/expenses').query({ minAmount: 1000 }));
    expect(filterRes.body.data.expenses).toHaveLength(1);
    expect(filterRes.body.data.expenses[0].description).toBe('Movie night');
  });

  test('paginates expense results', async () => {
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await authed(request(app).post('/api/expenses')).send({
        amount: 10 + i,
        categoryId,
        description: `Expense ${i}`,
        date: '2026-08-01',
        paymentMethod: 'CASH',
      });
    }
    const res = await authed(request(app).get('/api/expenses').query({ page: 1, limit: 2 }));
    expect(res.body.data.expenses).toHaveLength(2);
    expect(res.body.meta.total).toBe(5);
    expect(res.body.meta.totalPages).toBe(3);
  });
});

describe('Cross-user authorization', () => {
  test('user B cannot read, update, or delete user A expense', async () => {
    const createRes = await authed(request(app).post('/api/expenses')).send({
      amount: 999,
      categoryId,
      description: "User A's expense",
      date: '2026-08-25',
      paymentMethod: 'CASH',
    });
    const expenseId = createRes.body.data.expense.id;

    const { res: userBRes } = await registerUser();
    const tokenB = userBRes.body.data.accessToken;

    const getRes = await request(app).get(`/api/expenses/${expenseId}`).set('Authorization', `Bearer ${tokenB}`);
    expect(getRes.status).toBe(404);

    const updateRes = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ amount: 1 });
    expect(updateRes.status).toBe(404);

    const deleteRes = await request(app).delete(`/api/expenses/${expenseId}`).set('Authorization', `Bearer ${tokenB}`);
    expect(deleteRes.status).toBe(404);

    // User A's data must remain untouched.
    const stillThere = await authed(request(app).get(`/api/expenses/${expenseId}`));
    expect(stillThere.status).toBe(200);
  });

  test("user B's expense list never contains user A's expenses", async () => {
    await authed(request(app).post('/api/expenses')).send({
      amount: 100,
      categoryId,
      description: "User A's private expense",
      date: '2026-08-25',
      paymentMethod: 'CASH',
    });

    const { res: userBRes } = await registerUser();
    const tokenB = userBRes.body.data.accessToken;
    const listRes = await request(app).get('/api/expenses').set('Authorization', `Bearer ${tokenB}`);
    expect(listRes.body.data.expenses).toHaveLength(0);
  });
});
