import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { Toaster, toast } from 'react-hot-toast';
import { SearchBar } from './components/SearchBar';
import { FilterStatus } from './components/FilterStatus';
import { OrderList } from './components/OrderList';
import { OrderModal } from './components/OrderModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import menuData from './data/menu.json';

interface Product {
  name: string;
  price: number;
}

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

function App() {
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSaveOrder = (order: Order) => {
    const isEditing = orders.some(o => o.id === order.id);
    const timestamp = new Date().toISOString();
    
    if (isEditing) {
      const existingOrder = orders.find(o => o.id === order.id)!;
      const updates = [...existingOrder.updates];
      
      if (existingOrder.status !== order.status) {
        updates.push({
          timestamp,
          action: 'status_changed',
          details: `Status alterado de ${existingOrder.status === 'paid' ? 'Pago' : 'Não Pago'} para ${order.status === 'paid' ? 'Pago' : 'Não Pago'}`
        });
      }
      
      updates.push({
        timestamp,
        action: 'updated',
        details: 'Pedido atualizado'
      });
      
      order.updates = updates;
      setOrders(orders.map(o => o.id === order.id ? order : o));
      toast.success('Pedido atualizado com sucesso!');
    } else {
      order.updates = [{
        timestamp,
        action: 'created',
        details: 'Pedido criado'
      }];
      setOrders([...orders, order]);
      toast.success('Pedido salvo com sucesso!');
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
    toast.success('Pedido excluído com sucesso!');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <FilterStatus status={statusFilter} onStatusChange={setStatusFilter} />
        
        <OrderList
          orders={filteredOrders}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
        />

        <button
          onClick={() => {
            setEditingOrder(undefined);
            setIsModalOpen(true);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-8 h-8" />
        </button>

        <OrderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrder(undefined);
          }}
          onSave={handleSaveOrder}
          products={menuData.products}
          editingOrder={editingOrder}
        />

        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}

export default App;