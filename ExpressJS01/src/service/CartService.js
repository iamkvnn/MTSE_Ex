import { Cart } from '../model/cart.js';
import { Product } from '../model/product.js';

class CartService {
    // Get cart by user ID
    async getCart(userId) {
        let cart = await Cart.findOne({ user: userId })
            .populate('items.product');
        
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }
        
        return cart;
    }

    // Add product to cart
    async addToCart(userId, productId, quantity = 1) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (product.stock < quantity) {
            throw new Error('Not enough stock');
        }

        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            cart = await Cart.create({ 
                user: userId, 
                items: [{ product: productId, quantity }] 
            });
        } else {
            const existingItem = cart.items.find(
                item => item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
            
            await cart.save();
        }

        return cart.populate('items.product');
    }

    // Update cart item quantity
    async updateCartItem(userId, productId, quantity) {
        if (quantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            throw new Error('Item not found in cart');
        }

        const product = await Product.findById(productId);
        if (product.stock < quantity) {
            throw new Error('Not enough stock');
        }

        item.quantity = quantity;
        await cart.save();

        return cart.populate('items.product');
    }

    // Remove item from cart
    async removeFromCart(userId, productId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );
        
        await cart.save();
        return cart.populate('items.product');
    }

    // Clear entire cart
    async clearCart(userId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.items = [];
        await cart.save();
        
        return cart;
    }
}

export default new CartService();
