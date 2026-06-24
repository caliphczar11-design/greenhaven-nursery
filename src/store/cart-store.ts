import { create } from 'zustand'

export interface CartItemStore {
  id: string
  plantId: string
  plantName: string
  plantPrice: number
  plantImage: string
  quantity: number
}

interface CartState {
  items: CartItemStore[]
  sessionId: string
  isOpen: boolean
  checkoutOpen: boolean
  selectedPlantId: string | null
  setItems: (items: CartItemStore[]) => void
  addItem: (item: Omit<CartItemStore, 'id'>) => void
  removeItem: (plantId: string) => void
  updateQuantity: (plantId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  setCheckoutOpen: (open: boolean) => void
  setSelectedPlantId: (id: string | null) => void
  totalItems: () => number
  totalPrice: () => number
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('gh_session_id')
  if (!id) {
    id = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
    localStorage.setItem('gh_session_id', id)
  }
  return id
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  sessionId: typeof window !== 'undefined' ? getOrCreateSessionId() : '',
  isOpen: false,
  checkoutOpen: false,
  selectedPlantId: null,

  setItems: (items) => set({ items }),

  addItem: (item) => {
    const { items } = get()
    const existing = items.find(i => i.plantId === item.plantId)
    if (existing) {
      set({
        items: items.map(i =>
          i.plantId === item.plantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      })
    } else {
      set({ items: [...items, { ...item, id: 'cart_' + Date.now() }] })
    }
  },

  removeItem: (plantId) => {
    set({ items: get().items.filter(i => i.plantId !== plantId) })
  },

  updateQuantity: (plantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(plantId)
      return
    }
    set({
      items: get().items.map(i =>
        i.plantId === plantId ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => set({ items: [] }),

  toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),
  setCheckoutOpen: (open) => set({ checkoutOpen: open }),
  setSelectedPlantId: (id) => set({ selectedPlantId: id }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.plantPrice * i.quantity, 0),
}))