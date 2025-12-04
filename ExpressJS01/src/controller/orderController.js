import OrderService from '../service/OrderService.js';

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const order = await OrderService.createOrder(userId, req.body);
        
        return res.status(201).json({
            EC: 0,
            EM: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(400).json({
            EC: 1,
            EM: error.message || 'Error creating order'
        });
    }
};

// Get user's orders
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await OrderService.getOrdersByUser(userId, page, limit);
        
        return res.status(200).json({
            EC: 0,
            ...result
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error fetching orders'
        });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.role === 'Admin' ? null : req.user._id;
        
        const order = await OrderService.getOrderById(id, userId);
        
        return res.status(200).json({
            EC: 0,
            order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return res.status(404).json({
            EC: 1,
            EM: error.message || 'Order not found'
        });
    }
};

// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;
        
        const order = await OrderService.cancelOrder(id, userId, reason);
        
        return res.status(200).json({
            EC: 0,
            EM: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(400).json({
            EC: 1,
            EM: error.message || 'Error cancelling order'
        });
    }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const result = await OrderService.getAllOrders(page, limit, status);
        
        return res.status(200).json({
            EC: 0,
            ...result
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error fetching orders'
        });
    }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancelReason } = req.body;
        
        const order = await OrderService.updateOrderStatus(id, status, cancelReason);
        
        return res.status(200).json({
            EC: 0,
            EM: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(400).json({
            EC: 1,
            EM: error.message || 'Error updating order status'
        });
    }
};

// Get order statistics (admin)
export const getOrderStats = async (req, res) => {
    try {
        const stats = await OrderService.getOrderStats();
        
        return res.status(200).json({
            EC: 0,
            stats
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error fetching order statistics'
        });
    }
};
