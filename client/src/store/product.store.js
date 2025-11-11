import { create } from 'zustand';

export const useProductStore = create((set) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (id, updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}));

