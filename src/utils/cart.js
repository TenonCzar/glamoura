// utils/cart.js
import { useAuth } from '@/stores/auth'

export const addToCart = async (product) => {
  const auth = useAuth()

  try {
    // Handle local cart
    let cart = JSON.parse(localStorage.getItem('cart')) || []

    const existingIndex = cart.findIndex(
      (item) =>
        item.product_id === product.id &&
        (item.variant_id || null) === (product.variant_id || null),
    )

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        variant_id: product.variant_id || null,
        quantity: 1,
        price: product.price,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))

    if (auth.isAuthenticated()) {
      const res = await fetch('/api/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: product.variant_id || null,
          quantity: 1,
          price: product.price,
        }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      return { success: true, message: 'Added to your cart!' }
    }

    return { success: true, message: 'Added to cart. Login to save your cart.' }
  } catch (err) {
    console.error('Cart error:', err)
    throw err
  }
}
