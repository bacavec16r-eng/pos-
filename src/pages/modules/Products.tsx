import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Product } from "@types";

export default function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category_id: "",
    price: 0,
    cost_price: 0,
    quantity: 0,
    unit: "piece",
    description: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await invoke("get_products");
      setProducts(result as Product[]);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invoke("create_product", { request: formData });
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        category_id: "",
        price: 0,
        cost_price: 0,
        quantity: 0,
        unit: "piece",
        description: "",
      });
      setShowForm(false);
      loadProducts();
      alert("Product created successfully!");
    } catch (error) {
      alert("Failed to create product: " + error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          {showForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Price"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Cost Price"
              step="0.01"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={3}
          />
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Create Product
          </button>
        </form>
      )}

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-sm mb-2">{product.name}</h3>
            <p className="text-gray-600 text-xs mb-2">SKU: {product.sku}</p>
            <p className="text-gray-600 text-xs mb-2">Barcode: {product.barcode || "N/A"}</p>
            <div className="flex justify-between items-center mt-3">
              <div>
                <p className="text-pink-600 font-bold">${product.price.toFixed(2)}</p>
                <p className="text-gray-500 text-xs">Stock: {product.quantity}</p>
              </div>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-semibold">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
