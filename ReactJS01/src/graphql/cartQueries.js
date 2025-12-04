import { gql } from '@apollo/client';

export const GET_CART = gql`
  query GetCart {
    getCart {
      _id
      items {
        product {
          _id
          name
          description
          price
          image
          stock
        }
        quantity
      }
      totalPrice
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int) {
    addToCart(productId: $productId, quantity: $quantity) {
      _id
      items {
        product {
          _id
          name
          price
          image
          stock
        }
        quantity
      }
      totalPrice
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($productId: ID!, $quantity: Int!) {
    updateCartItem(productId: $productId, quantity: $quantity) {
      _id
      items {
        product {
          _id
          name
          price
          image
          stock
        }
        quantity
      }
      totalPrice
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      _id
      items {
        product {
          _id
          name
          price
          image
          stock
        }
        quantity
      }
      totalPrice
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      _id
      items {
        product {
          _id
        }
        quantity
      }
      totalPrice
    }
  }
`;
