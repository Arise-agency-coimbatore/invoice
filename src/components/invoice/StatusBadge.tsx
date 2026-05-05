'use client';

interface StatusBadgeProps {
  status: 'Pending' | 'Paid' | 'Overdue';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Paid: 'bg-green-500/10 text-green-400 border-green-500/20',
    Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span
      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-md ${styles[status]}`}
    >
      {status}
    </span>
  );
}
