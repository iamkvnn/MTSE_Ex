import CartService from '../../service/CartService.js';

export const cartResolvers = {
    Query: {
        getCart: async (_, __, context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }
            return CartService.getCart(context.user._id);
        }
    },

    Mutation: {
        addToCart: async (_, { productId, quantity = 1 }, context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }
            return CartService.addToCart(context.user._id, productId, quantity);
        },

        updateCartItem: async (_, { productId, quantity }, context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }
            return CartService.updateCartItem(context.user._id, productId, quantity);
        },

        removeFromCart: async (_, { productId }, context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }
            return CartService.removeFromCart(context.user._id, productId);
        },

        clearCart: async (_, __, context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }
            return CartService.clearCart(context.user._id);
        }
    },

    // Custom resolver for Cart to calculate totals
    Cart: {
        totalPrice: (cart) => {
            return cart.items.reduce((total, item) => {
                if (item.product && item.product.price) {
                    return total + (item.product.price * item.quantity);
                }
                return total;
            }, 0);
        }
    }
};
