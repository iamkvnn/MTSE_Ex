export const cartTypeDefs = `#graphql
    type Product {
        _id: ID!
        name: String!
        description: String
        price: Float!
        category: String
        image: String
        stock: Int
        isActive: Boolean
    }

    type CartItem {
        product: Product!
        quantity: Int!
    }

    type Cart {
        _id: ID!
        user: ID!
        items: [CartItem!]!
        totalPrice: Float
        createdAt: String
        updatedAt: String
    }

    type Query {
        # Get current user's cart
        getCart: Cart!
    }

    type Mutation {
        # Add product to cart
        addToCart(productId: ID!, quantity: Int): Cart!
        
        # Update item quantity in cart
        updateCartItem(productId: ID!, quantity: Int!): Cart!
        
        # Remove item from cart
        removeFromCart(productId: ID!): Cart!
        
        # Clear entire cart
        clearCart: Cart!
    }
`;
