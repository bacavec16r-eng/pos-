import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePOSStore } from "@store/posStore";
import { useAuthStore } from "@store/authStore";
import { Product } from "@types";

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export default function POSModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customDiscount, setCustomDiscount] = useState(0);

  const cart = usePOSStore((state) => state.cart);
  const addToCart = usePOSStore((state) => state.addToCart);
  const removeFromCart = usePOSStore((state) => state.removeFromCart);
  const updateCartItem = usePOSStore((state) => state.updateCartItem);
  const clearCart = usePOSStore((state) => state.clearCart);
  const total = usePOSStore((state) => state.total);
  const user = useAuthStore((state) => state.user);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const result = await invoke("get_products", { search: query });
      setProducts(result as Product[]);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const product = await invoke("get_product_by_barcode", { barcode }) as Product;
      addToCart(product, 1);
      setSearchQuery("");
    } catch (error) {
      alert("Product not found");
    }
  };

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;

    try {
      const saleRequest = {
        cashier_id: user.id,
        customer_id: selectedCustomer,
        items: cart.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
        })),
        discount_amount: customDiscount,
        tax_amount: total * 0.1,
        payment_method: paymentMethod,
        notes: null,
      };

      const sale = await invoke("create_sale", saleRequest);
      alert("Sale completed successfully!");
      
      if (sale && typeof sale === "object" && "id" in sale) {
        await invoke("print_receipt", { sale_id: (sale as any).id });
      }
      
      clearCart();
      setCustomDiscount(0);
      setSelectedCustomer(null);
    } catch (error) {
      alert("Checkout failed: " + error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Product Search */}
      <div className="col-span-2 flex flex-col">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Scan barcode or search product..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery) {
                handleBarcodeScanned(searchQuery);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            autoFocus
          />
        </div>

        {/* Product List */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product, 1)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-pink-50 cursor-pointer transition-colors"
            >
              <div className="font-semibold text-sm">{product.name}</div>
              <div className="text-gray-600 text-xs">SKU: {product.sku}</div>
              <div className="text-pink-600 font-bold mt-1">${product.price.toFixed(2)}</div>
              <div className="text-gray-500 text-xs mt-1">Stock: {product.quantity}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <h3 className="font-bold text-lg mb-3">Shopping Cart</h3>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {cart.map((item) => (
            <div key={item.productId} className="bg-gray-50 p-2 rounded text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">{item.product?.name}</span>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-between items-center mt-1">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateCartItem(item.productId, parseInt(e.target.value))}
                  className="w-12 px-1 py-1 border border-gray-300 rounded text-xs"
                />
                <span className="text-pink-600 font-bold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Section */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${(total * 0.9).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount:</span>
            <input
              type="number"
              min="0"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(parseFloat(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%):</span>
            <span>${(total * 0.1).toFixed(2)}</span>
          </div>
          <div className="bg-pink-100 p-2 rounded text-lg font-bold text-pink-600 text-center">
            ${total.toFixed(2)}
          </div>
        </div>

        {/* Payment & Checkout */}
        <div className="mt-4 space-y-2">
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Transfer</option>
            <option value="mixed">Mixed</option>
          </select>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-bold hover:bg-pink-700 disabled:bg-gray-400 transition-colors"
          >
            Complete Sale
          </button>

          <button
            onClick={() => clearCart()}
            className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
