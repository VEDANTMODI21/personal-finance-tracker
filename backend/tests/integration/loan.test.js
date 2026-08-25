const { request, app, resetDatabase, registerUser } = require('./setup');

let token;

beforeEach(async () => {
  await resetDatabase();
  const { res } = await registerUser();
  token = res.body.data.accessToken;
});

function authed(req) {
  return req.set('Authorization', `Bearer ${token}`);
}

async function createLoan(overrides = {}) {
  return authed(request(app).post('/api/loans')).send({
    personName: 'Rahul',
    amount: 10000,
    dateGiven: '2026-08-15',
    dueDate: '2026-08-30',
    ...overrides,
  });
}

describe('Loan lifecycle', () => {
  test('creates a loan defaulting to OUTSTANDING status', async () => {
    const res = await createLoan();
    expect(res.status).toBe(201);
    expect(res.body.data.loan.status).toBe('OUTSTANDING');
    expect(res.body.data.loan.remainingAmount).toBe(10000);
  });

  test('rejects a non-positive loan amount', async () => {
    const res = await createLoan({ amount: 0 });
    expect(res.status).toBe(422);
  });

  test('adding a repayment moves status to PARTIALLY_PAID and reduces remaining balance', async () => {
    const loanRes = await createLoan();
    const loanId = loanRes.body.data.loan.id;

    const payRes = await authed(request(app).post(`/api/loans/${loanId}/payments`)).send({
      amount: 3000,
      paymentDate: '2026-08-20',
    });
    expect(payRes.status).toBe(201);
    expect(payRes.body.data.loan.status).toBe('PARTIALLY_PAID');
    expect(payRes.body.data.loan.totalRepaid).toBe(3000);
    expect(payRes.body.data.loan.remainingAmount).toBe(7000);
  });

  test('fully repaying a loan moves status to PAID', async () => {
    const loanRes = await createLoan();
    const loanId = loanRes.body.data.loan.id;

    await authed(request(app).post(`/api/loans/${loanId}/payments`)).send({ amount: 6000, paymentDate: '2026-08-20' });
    const finalRes = await authed(request(app).post(`/api/loans/${loanId}/payments`)).send({
      amount: 4000,
      paymentDate: '2026-08-23',
    });

    expect(finalRes.body.data.loan.status).toBe('PAID');
    expect(finalRes.body.data.loan.remainingAmount).toBe(0);
  });

  test('rejects a repayment that would exceed the outstanding balance', async () => {
    const loanRes = await createLoan();
    const loanId = loanRes.body.data.loan.id;

    const res = await authed(request(app).post(`/api/loans/${loanId}/payments`)).send({
      amount: 15000,
      paymentDate: '2026-08-20',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects a repayment that exceeds the *remaining* balance after partial repayment', async () => {
    const loanRes = await createLoan();
    const loanId = loanRes.body.data.loan.id;
    await authed(request(app).post(`/api/loans/${loanId}/payments`)).send({ amount: 8000, paymentDate: '2026-08-20' });

    const res = await authed(request(app).post(`/api/loans/${loanId}/payments`)).send({
      amount: 3000, // only 2000 remains outstanding
      paymentDate: '2026-08-22',
    });
    expect(res.status).toBe(400);
  });

  test('marks a loan OVERDUE once its due date has passed with a remaining balance', async () => {
    const res = await createLoan({ dueDate: '2020-01-01' });
    expect(res.body.data.loan.status).toBe('OVERDUE');
  });

  test('loan dashboard aggregates totals correctly', async () => {
    const loan1 = await createLoan({ personName: 'Rahul', amount: 10000 });
    await authed(request(app).post(`/api/loans/${loan1.body.data.loan.id}/payments`)).send({
      amount: 4000,
      paymentDate: '2026-08-20',
    });
    await createLoan({ personName: 'Priya', amount: 5000, dueDate: '2026-09-01' });

    const dashRes = await authed(request(app).get('/api/loans/dashboard'));
    expect(dashRes.body.data.totalLent).toBe(15000);
    expect(dashRes.body.data.totalRepaid).toBe(4000);
    expect(dashRes.body.data.totalOutstanding).toBe(11000);
  });
});

describe('Loan cross-user authorization', () => {
  test('user B cannot view or pay against user A loan', async () => {
    const loanRes = await createLoan();
    const loanId = loanRes.body.data.loan.id;

    const { res: userBRes } = await registerUser();
    const tokenB = userBRes.body.data.accessToken;

    const getRes = await request(app).get(`/api/loans/${loanId}`).set('Authorization', `Bearer ${tokenB}`);
    expect(getRes.status).toBe(404);

    const payRes = await request(app)
      .post(`/api/loans/${loanId}/payments`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ amount: 100, paymentDate: '2026-08-20' });
    expect(payRes.status).toBe(404);
  });
});
