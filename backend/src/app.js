const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth.routes');
const expenseRoutes = require('./routes/expense.routes');
const incomeRoutes = require('./routes/income.routes');
const categoryRoutes = require('./routes/category.routes');
const loanRoutes = require('./routes/loan.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');
const transactionRoutes = require('./routes/transaction.routes');
const budgetRoutes = require('./routes/budget.routes');
const recurringExpenseRoutes = require('./routes/recurringExpense.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    // This is a JSON API only (no HTML/JS is ever served from here), so the
    // CSP mainly matters for the rare error page a proxy might render.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' },
  }),
);
app.use(
  cors({
    origin: env.CLIENT_URL.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (!env.isTest) {
  app.use(morgan(env.isProd ? 'combined' : 'dev'));
}

app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV, time: new Date().toISOString() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring-expenses', recurringExpenseRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
