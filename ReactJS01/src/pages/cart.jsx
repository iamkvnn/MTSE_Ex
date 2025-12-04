import { useContext } from 'react';
import { useMutation, useQuery } from "@apollo/client/react";
import { 
  GET_CART, 
  UPDATE_CART_ITEM, 
  REMOVE_FROM_CART, 
  CLEAR_CART 
} from '../graphql/cartQueries';
import { AuthContext } from '../components/context/auth.context';
import { message, Empty, Card } from 'antd';
import { Cart } from '@iamkvnn/cart-ui-library';
import '@iamkvnn/cart-ui-library/cart-ui-library.css';

const CartPage = () => {
  const { auth } = useContext(AuthContext);
  const [messageApi, contextHolder] = message.useMessage();

  // GraphQL queries and mutations
  const { loading, error, data } = useQuery(GET_CART, {
    skip: !auth.isAuthenticated,
  });

  const [updateCartItem] = useMutation(UPDATE_CART_ITEM);
  const [removeFromCart] = useMutation(REMOVE_FROM_CART);
  const [clearCart] = useMutation(CLEAR_CART);

  // Handle quantity update
  const handleQuantityChange = async (productId, quantity) => {
    try {
      await updateCartItem({ 
        variables: { productId, quantity } 
      });
      messageApi.success('Đã cập nhật số lượng');
    } catch (err) {
      messageApi.error(err.message || 'Lỗi cập nhật số lượng');
    }
  };

  // Handle remove item
  const handleRemove = async (productId) => {
    try {
      await removeFromCart({ variables: { productId } });
      messageApi.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      messageApi.error(err.message || 'Lỗi xóa sản phẩm');
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    try {
      await clearCart();
      messageApi.success('Đã xóa toàn bộ giỏ hàng');
    } catch (err) {
      messageApi.error(err.message || 'Lỗi xóa giỏ hàng');
    }
  };

  // Handle checkout (selection is handled in frontend by library)
  const handleCheckout = (selectedItems, total) => {
    if (selectedItems.length === 0) {
      messageApi.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    messageApi.success(`Tiến hành thanh toán ${selectedItems.length} sản phẩm - Tổng: $${total.toFixed(2)}`);
    // TODO: Navigate to checkout page or show checkout modal
  };

  // Check authentication
  if (!auth.isAuthenticated) {
    return (
      <div style={{ maxWidth: 900, margin: '20px auto', padding: '0 16px' }}>
        {contextHolder}
        <Card>
          <Empty 
            description="Vui lòng đăng nhập để xem giỏ hàng" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: '20px auto', padding: '0 16px' }}>
        {contextHolder}
        <Card>
          <Empty description={`Lỗi: ${error.message}`} />
        </Card>
      </div>
    );
  }

  // Transform data for cart-ui-library
  const cartItems = (data?.getCart?.items || []).map(item => ({
    id: item.product._id,
    name: item.product.name,
    image: item.product.image,
    qty: item.quantity,
    price: item.product.price,
    stock: item.product.stock
  }));

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: '0 16px' }}>
      {contextHolder}
      
      <Cart
        items={cartItems}
        loading={loading}
        onQuantityChange={handleQuantityChange}
        onRemove={handleRemove}
        onClear={handleClearCart}
        onCheckout={handleCheckout}
        currency="$"
        title="Giỏ hàng của bạn"
        emptyMessage="Giỏ hàng trống"
      />
    </div>
  );
};

export default CartPage;
