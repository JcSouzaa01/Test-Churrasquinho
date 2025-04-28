import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  products: Product[];
  editingOrder?: Order;
}

export function OrderModal({ isOpen, onClose, onSave, products, editingOrder }: OrderModalProps) {
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [status, setStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [productSearch, setProductSearch] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: 0 });
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [originalItems, setOriginalItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (editingOrder) {
      const itemsCopy = editingOrder.items.map(item => ({...item}));
      setCustomer(editingOrder.customer);
      setItems(itemsCopy);
      setOriginalItems(itemsCopy);
      setStatus(editingOrder.status);
    } else {
      resetForm();
    }
  }, [editingOrder, isOpen]);

  useEffect(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [productSearch, products]);

  const resetForm = () => {
    setCustomer('');
    setItems([]);
    setOriginalItems([]);
    setStatus('unpaid');
    setProductSearch('');
    setNewProduct({ name: '', price: 0 });
    setIsAddingNewProduct(false);
  };

  const handleClose = () => {
    if (editingOrder) {
      // If editing, revert to original order data
      setCustomer(editingOrder.customer);
      setItems(originalItems.map(item => ({...item})));
      setStatus(editingOrder.status);
    } else {
      // If creating new order, reset everything
      resetForm();
    }
    onClose();
  };

  const handleAddItem = (product: Product) => {
    const existingItem = items.find(item => item.product === product.name);
    
    if (existingItem) {
      setItems(items.map(item => 
        item.product === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { product: product.name, quantity: 1, price: product.price }]);
    }
    setProductSearch('');
  };

  const handleAddNewProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      handleAddItem(newProduct);
      setNewProduct({ name: '', price: 0 });
      setIsAddingNewProduct(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSave = () => {
    const order: Order = {
      id: editingOrder?.id || Date.now().toString(),
      customer,
      items,
      total: calculateTotal(),
      status,
      date: editingOrder?.date || new Date().toISOString(),
      updates: editingOrder?.updates || []
    };
    onSave(order);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {editingOrder ? 'Editar Pedido' : 'Novo Pedido'}
          </h2>
          <button onClick={handleClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Nome do cliente"
            className="w-full px-4 py-2 rounded-lg border"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />

          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produto..."
                className="w-full px-4 py-2 rounded-lg border"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              {productSearch && !isAddingNewProduct && (
                <div className="absolute w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.name}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => handleAddItem(product)}
                    >
                      {product.name} - R$ {product.price.toFixed(2)}
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <button
                      className="w-full px-4 py-2 text-left text-blue-500 hover:bg-gray-100"
                      onClick={() => {
                        setIsAddingNewProduct(true);
                        setNewProduct({ ...newProduct, name: productSearch });
                      }}
                    >
                      + Adicionar novo produto
                    </button>
                  )}
                </div>
              )}
            </div>

            {isAddingNewProduct && (
              <div className="space-y-2 p-4 border rounded-lg">
                <input
                  type="text"
                  placeholder="Nome do produto"
                  className="w-full px-4 py-2 rounded-lg border"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço"
                  className="w-full px-4 py-2 rounded-lg border"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNewProduct}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    disabled={!newProduct.name || newProduct.price <= 0}
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNewProduct(false);
                      setProductSearch('');
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                <span className="flex-1">{item.product}</span>
                <input
                  type="number"
                  min="1"
                  className="w-20 px-2 py-1 border rounded"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
                <span className="w-24 text-right">
                  R$ {(item.quantity * item.price).toFixed(2)}
                </span>
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  className="text-red-500 px-2"
                >
                  ×
                </button>
              </div>
            ))}
            {items.length > 0 && (
              <div className="flex justify-end font-bold">
                Total: R$ {calculateTotal().toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span>Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
              className="px-4 py-2 rounded-lg border"
            >
              <option value="paid">Pago</option>
              <option value="unpaid">Não Pago</option>
            </select>
          </div>

          {editingOrder && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Histórico de Atualizações:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {editingOrder.updates.map((update, index) => (
                  <p key={index}>
                    {new Date(update.timestamp).toLocaleString()}: {update.details}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white"
              disabled={!customer || items.length === 0}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}