interface FilterStatusProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function FilterStatus({ status, onStatusChange }: FilterStatusProps) {
  return (
    <div className="flex gap-2 my-4">
      <button
        className={`px-4 py-2 rounded-lg ${status === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => onStatusChange('all')}
      >
        Todos
      </button>
      <button
        className={`px-4 py-2 rounded-lg ${status === 'paid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => onStatusChange('paid')}
      >
        Pago
      </button>
      <button
        className={`px-4 py-2 rounded-lg ${status === 'unpaid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => onStatusChange('unpaid')}
      >
        Não Pago
      </button>
    </div>
  );
}