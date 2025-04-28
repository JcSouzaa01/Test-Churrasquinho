import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

interface OrderUpdate {
  timestamp: string;
  action: 'created' | 'updated' | 'status_changed';
  details: string;
}

interface Order {
  id: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: 'paid' | 'unpaid';
  date: string;
  updates: OrderUpdate[];
}

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

export function OrderList({ orders, onEdit, onDelete }: OrderListProps) {
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const handleDeleteClick = (orderId: string) => {
    setDeletingOrderId(orderId);
  };

  const handleConfirmDelete = () => {
    if (deletingOrderId) {
      onDelete(deletingOrderId);
      setDeletingOrderId(null);
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">{order.customer}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(order)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <PencilIcon className="w-5 h-5 text-blue-500" />
              </button>
              <button
                onClick={() => handleDeleteClick(order.id)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <TrashIcon className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            <p>Status: {order.status === 'paid' ? 'Pago' : 'Não Pago'}</p>
            <p>Data: {new Date(order.date).toLocaleDateString()}</p>
          </div>

          <div className="space-y-2 mb-3 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-sm">Itens do pedido:</p>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.product}</span>
                <span>R$ {(item.quantity * item.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 font-bold flex justify-between">
              <span>Total:</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>

          {deletingOrderId === order.id && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 mb-2">
                Tem certeza que deseja excluir este pedido?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeletingOrderId(null)}
                  className="px-3 py-1 text-sm bg-gray-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}