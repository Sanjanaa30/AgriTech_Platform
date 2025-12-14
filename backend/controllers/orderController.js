const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');
const Counter = require('../models/Counter');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { cropId, quantity, deliveryAddress, contactNumber, notes } = req.body;

    if (!cropId || !quantity || !deliveryAddress || !contactNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get crop details
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (!crop.isListed) {
      return res.status(400).json({ message: 'This crop is not available for purchase' });
    }

    // Generate order ID
    const counter = await Counter.findOneAndUpdate(
      { role: 'order' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderId = `ORD_${String(counter.seq).padStart(5, '0')}`;

    // Calculate price (you can add pricing logic here)
    const pricePerUnit = 100; // Default price, should come from crop or be configurable
    const totalPrice = pricePerUnit * quantity;

    const newOrder = new Order({
      orderId,
      buyerId,
      farmerId: crop.userId,
      cropId: crop._id,
      cropName: crop.name,
      quantity,
      pricePerUnit,
      totalPrice,
      deliveryAddress,
      contactNumber,
      notes: notes || ''
    });

    await newOrder.save();
    
    res.status(201).json({ 
      message: 'Order placed successfully', 
      order: newOrder 
    });
  } catch (err) {
    console.error('❌ Error creating order:', err.message);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Get buyer's orders
exports.getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { status } = req.query;

    let query = { buyerId };
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Fetch farmer details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const farmer = await User.findOne({ _id: order.farmerId }, 'firstName lastName mobile').lean();
        return {
          ...order,
          farmerName: farmer ? `${farmer.firstName} ${farmer.lastName}` : 'Unknown',
          farmerContact: farmer?.mobile || 'N/A'
        };
      })
    );

    res.json(ordersWithDetails);
  } catch (err) {
    console.error('❌ Error fetching buyer orders:', err.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get farmer's orders (crops they're selling)
exports.getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { status } = req.query;

    let query = { farmerId };
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Fetch buyer details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const buyer = await User.findOne({ _id: order.buyerId }, 'firstName lastName mobile').lean();
        return {
          ...order,
          buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown',
          buyerContact: buyer?.mobile || 'N/A'
        };
      })
    );

    res.json(ordersWithDetails);
  } catch (err) {
    console.error('❌ Error fetching farmer orders:', err.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized (buyer or farmer)
    if (order.buyerId !== userId && order.farmerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error('❌ Error updating order status:', err.message);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ orderId }).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized
    if (order.buyerId !== userId && order.farmerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to view this order' });
    }

    const [buyer, farmer] = await Promise.all([
      User.findOne({ _id: order.buyerId }, 'firstName lastName mobile email state district').lean(),
      User.findOne({ _id: order.farmerId }, 'firstName lastName mobile email state district').lean()
    ]);

    res.json({
      ...order,
      buyerDetails: buyer ? {
        name: `${buyer.firstName} ${buyer.lastName}`,
        mobile: buyer.mobile,
        email: buyer.email,
        location: `${buyer.district}, ${buyer.state}`
      } : null,
      farmerDetails: farmer ? {
        name: `${farmer.firstName} ${farmer.lastName}`,
        mobile: farmer.mobile,
        email: farmer.email,
        location: `${farmer.district}, ${farmer.state}`
      } : null
    });
  } catch (err) {
    console.error('❌ Error fetching order details:', err.message);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
};
