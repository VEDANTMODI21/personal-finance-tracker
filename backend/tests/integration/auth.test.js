const { request, app, resetDatabase, registerUser } = require('./setup');

beforeEach(async () => {
  await resetDatabase();
});

describe('Authentication', () => {
  test('registers a new user and seeds default categories', async () => {
    const { res } = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBeDefined();
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('rejects registration with mismatched passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad User',
      email: 'bad@example.com',
      password: 'Password123!',
      confirmPassword: 'Different123!',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('rejects duplicate email registration', async () => {
    const { payload } = await registerUser();
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
  });

  test('logs in with correct credentials', async () => {
    const { payload } = await registerUser();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: payload.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('rejects login with an invalid password', async () => {
    const { payload } = await registerUser();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: 'WrongPassword1!' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('rejects login for a non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123!' });
    expect(res.status).toBe(401);
  });

  test('blocks access to a protected route without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('blocks access to a protected route with a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('allows access to a protected route with a valid token', async () => {
    const { res: registerRes } = await registerUser();
    const token = registerRes.body.data.accessToken;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(registerRes.body.data.user.email);
  });

  test('changes password and revokes existing sessions', async () => {
    const { res: registerRes, payload } = await registerUser();
    const token = registerRes.body.data.accessToken;

    const changeRes = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: payload.password, newPassword: 'NewPassword123!', confirmNewPassword: 'NewPassword123!' });
    expect(changeRes.status).toBe(200);

    const loginOld = await request(app).post('/api/auth/login').send({ email: payload.email, password: payload.password });
    expect(loginOld.status).toBe(401);

    const loginNew = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: 'NewPassword123!' });
    expect(loginNew.status).toBe(200);
  });
});
