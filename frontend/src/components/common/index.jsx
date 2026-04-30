export function BookingStatusBadge({ status }) {
  const map = {
    confirmed: 'badge-green',
    pending:   'badge-yellow',
    cancelled: 'badge-red',
    completed: 'badge-blue',
    'no-show': 'badge-gray',
  };
  return <span className={map[status] || 'badge-gray'}>{status}</span>;
}

export function PaymentStatusBadge({ status }) {
  const map = {
    paid:    'badge-green',
    pending: 'badge-yellow',
    refunded:'badge-blue',
    failed:  'badge-red',
  };
  return <span className={map[status] || 'badge-gray'}>{status}</span>;
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-slate-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-display font-semibold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 p-5 border-t border-slate-100">{footer}</div>}
      </div>
    </div>
  );
}
