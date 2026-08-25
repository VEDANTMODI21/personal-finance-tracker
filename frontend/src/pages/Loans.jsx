import React, { useEffect, useState, useCallback } from 'react';
import { Plus, HandCoins, Search } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageLoader from '../components/PageLoader.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import LoanCard from '../components/LoanCard.jsx';
import LoanForm from '../components/forms/LoanForm.jsx';
import RepaymentForm from '../components/forms/RepaymentForm.jsx';
import { loanApi } from '../services/loan.api';
import { useToast } from '../context/ToastContext.jsx';
import { useDebounce } from '../hooks/useDebounce';
import { LOAN_STATUSES, LABELS } from '../utils/constants';

export default function Loans() {
  const toast = useToast();
  const [loans, setLoans] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loansRes, dashRes] = await Promise.all([
        loanApi.list({ search: debouncedSearch || undefined, status: statusFilter || undefined, limit: 100 }),
        loanApi.dashboard(),
      ]);
      setLoans(loansRes.data.data.loans);
      setDashboard(dashRes.data.data);
    } catch {
      toast.error('Could not load loans.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setFormModalOpen(true); };
  const openEdit = (loan) => { setEditing(loan); setFormModalOpen(true); };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editing) {
        await loanApi.update(editing.id, values);
        toast.success('Loan updated.');
      } else {
        await loanApi.create(values);
        toast.success('Loan added.');
      }
      setFormModalOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (values) => {
    setSubmitting(true);
    try {
      await loanApi.addPayment(paymentTarget.id, values);
      toast.success('Repayment recorded.');
      setPaymentTarget(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await loanApi.remove(deleteTarget.id);
      toast.success('Loan deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Could not delete loan.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Loans">
      {dashboard && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard label="Total Lent" value={dashboard.totalLent} icon={HandCoins} />
          <SummaryCard label="Total Repaid" value={dashboard.totalRepaid} icon={HandCoins} tone="positive" />
          <SummaryCard label="Outstanding" value={dashboard.totalOutstanding} icon={HandCoins} tone="negative" />
          <SummaryCard label="Overdue" value={dashboard.overdueAmount} icon={HandCoins} tone="negative" />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by person…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {LOAN_STATUSES.map((s) => (
            <option key={s} value={s}>{LABELS[s]}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Loan
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : loans.length === 0 ? (
        <EmptyState icon={HandCoins} title="No loans found" description="Track money you lend to friends and family here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onRecordPayment={setPaymentTarget}
            />
          ))}
        </div>
      )}

      <Modal open={formModalOpen} onClose={() => setFormModalOpen(false)} title={editing ? 'Edit Loan' : 'Add Loan'}>
        <LoanForm initial={editing} onSubmit={handleSubmit} onCancel={() => setFormModalOpen(false)} submitting={submitting} />
      </Modal>

      <Modal open={!!paymentTarget} onClose={() => setPaymentTarget(null)} title={`Record Repayment — ${paymentTarget?.personName}`}>
        {paymentTarget && (
          <RepaymentForm
            remainingAmount={paymentTarget.remainingAmount}
            onSubmit={handleRecordPayment}
            onCancel={() => setPaymentTarget(null)}
            submitting={submitting}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        description={`Delete the loan record for "${deleteTarget?.personName}"? All repayments will also be removed.`}
      />
    </Layout>
  );
}
