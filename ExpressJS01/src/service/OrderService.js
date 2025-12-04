import { Order } from '../model/order.js';
import { Product } from '../model/product.js';
import { Cart } from '../model/cart.js';

class OrderService {
    // Create a new order
    async createOrder(userId, orderData) {
        const { items, shippingAddress, paymentMethod } = orderData;

        // Validate and get product details
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product ${item.productId} not found`);
            }
            if (!product.isActive) {
                throw new Error(`Product ${product.name} is not available`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name}`);
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            totalAmount += product.price * item.quantity;

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        // Clear purchased items from cart
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
            const purchasedProductIds = items.map(item => item.productId);
            cart.items = cart.items.filter(
                cartItem => !purchasedProductIds.includes(cartItem.product.toString())
            );
            await cart.save();
        }

        return order.populate('items.product');
    }

    // Get orders by user
    async getOrdersByUser(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ user: userId })
                .populate('items.product')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ user: userId })
        ]);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Get order by ID
    async getOrderById(orderId, userId = null) {
        const query = { _id: orderId };
        if (userId) {
            query.user = userId;
        }

        const order = await Order.findOne(query)
            .populate('items.product')
            .populate('user', 'name email');

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    // Get all orders (admin)
    async getAllOrders(page = 1, limit = 10, status = null) {
        const skip = (page - 1) * limit;
        const query = status && status !== 'all' ? { status } : {};

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('items.product')
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(query)
        ]);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Update order status (admin)
    async updateOrderStatus(orderId, status, cancelReason = null) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Validate status transition
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['shipping', 'cancelled'],
            shipping: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: []
        };

        if (!validTransitions[order.status].includes(status)) {
            throw new Error(`Cannot change status from ${order.status} to ${status}`);
        }

        order.status = status;

        if (status === 'delivered') {
            order.deliveredAt = new Date();
            order.paymentStatus = 'paid';
        }

        if (status === 'cancelled') {
            order.cancelReason = cancelReason;
            // Restore stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        await order.save();
        return order.populate('items.product');
    }

    // Cancel order by user
    async cancelOrder(orderId, userId, reason) {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            throw new Error('Order not found');
        }

        if (!['pending', 'confirmed'].includes(order.status)) {
            throw new Error('Cannot cancel order at this stage');
        }

        order.status = 'cancelled';
        order.cancelReason = reason;

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        await order.save();
        return order;
    }

    // Get order statistics (admin)
    async getOrderStats() {
        const [totalOrders, ordersByStatus, revenue] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { status: 'delivered' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);

        return {
            totalOrders,
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            totalRevenue: revenue[0]?.total || 0
        };
    }
}

export default new OrderService();
