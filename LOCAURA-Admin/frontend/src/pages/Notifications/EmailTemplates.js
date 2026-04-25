// Email Templates for different notification types
export const EMAIL_TEMPLATES = {
  // ========== ORDER NOTIFICATIONS ==========
  ORDER_PLACED: {
    title: 'Order Placed',
    subject: '🎉 Your order #{orderID} has been placed',
    variables: ['orderID', 'consumerName', 'orderAmount', 'storeLink', 'trackingLink'],
    template: (vars) => `
Hi ${vars.consumerName},

Your order #${vars.orderID} has been placed successfully!
Order Amount: ₹${vars.orderAmount}
Store: ${vars.storeLink}

Track your order: ${vars.trackingLink}

Thank you for shopping with Locaura!
Best regards,
Locaura Team
    `,
  },

  ORDER_CONFIRMED: {
    title: 'Order Confirmed',
    subject: 'Your order #{orderID} has been confirmed',
    variables: ['orderID', 'consumerName', 'items', 'deliveryDate'],
    template: (vars) => `
Hi ${vars.consumerName},

Great! Your order #${vars.orderID} has been confirmed by the store.
Items: ${vars.items}
Estimated Delivery: ${vars.deliveryDate}

We'll notify you when your order is out for delivery.

Best regards,
Locaura Team
    `,
  },

  ORDER_OUT_FOR_DELIVERY: {
    title: 'Order Out for Delivery',
    subject: 'Your order #{orderID} is on its way!',
    variables: ['orderID', 'consumerName', 'riderName', 'riderPhone', 'trackingLink'],
    template: (vars) => `
Hi ${vars.consumerName},

Your order #${vars.orderID} is on its way!
Delivery Partner: ${vars.riderName}
Contact: ${vars.riderPhone}

Track your delivery: ${vars.trackingLink}

Best regards,
Locaura Team
    `,
  },

  ORDER_DELIVERED: {
    title: 'Order Delivered',
    subject: 'Your order #{orderID} has been delivered',
    variables: ['orderID', 'consumerName', 'deliveryTime', 'reviewLink'],
    template: (vars) => `
Hi ${vars.consumerName},

Your order #${vars.orderID} has been delivered!
Delivered at: ${vars.deliveryTime}

Please review your order: ${vars.reviewLink}

Thank you for your purchase!
Best regards,
Locaura Team
    `,
  },

  ORDER_CANCELLED: {
    title: 'Order Cancelled',
    subject: 'Your order #{orderID} has been cancelled',
    variables: ['orderID', 'consumerName', 'reason', 'refundAmount', 'refundDate'],
    template: (vars) => `
Hi ${vars.consumerName},

Your order #${vars.orderID} has been cancelled.
Reason: ${vars.reason}
Refund Amount: ₹${vars.refundAmount}
Expected Refund Date: ${vars.refundDate}

If you have any questions, please contact our support team.

Best regards,
Locaura Team
    `,
  },

  // ========== PAYMENT NOTIFICATIONS ==========
  PAYMENT_SUCCESS: {
    title: 'Payment Successful',
    subject: 'Payment of ₹{amount} received for order #{orderID}',
    variables: ['amount', 'orderID', 'consumerName', 'transactionID', 'invoiceLink'],
    template: (vars) => `
Hi ${vars.consumerName},

Your payment of ₹${vars.amount} for order #${vars.orderID} has been received successfully!
Transaction ID: ${vars.transactionID}

Download Invoice: ${vars.invoiceLink}

Thank you!
Best regards,
Locaura Team
    `,
  },

  PAYMENT_FAILED: {
    title: 'Payment Failed',
    subject: 'Payment failed for order #{orderID}',
    variables: ['orderID', 'consumerName', 'amount', 'reason', 'retryLink'],
    template: (vars) => `
Hi ${vars.consumerName},

Payment for order #${vars.orderID} (₹${vars.amount}) failed.
Reason: ${vars.reason}

Please retry: ${vars.retryLink}

Best regards,
Locaura Team
    `,
  },

  REFUND_INITIATED: {
    title: 'Refund Initiated',
    subject: 'Refund of ₹{amount} initiated for order #{orderID}',
    variables: ['amount', 'orderID', 'consumerName', 'refundDate'],
    template: (vars) => `
Hi ${vars.consumerName},

Your refund of ₹${vars.amount} for order #${vars.orderID} has been initiated.
Expected Date: ${vars.refundDate}

You will receive the refund to your original payment method.

Best regards,
Locaura Team
    `,
  },

  // ========== RETAILER NOTIFICATIONS ==========
  NEW_ORDER_RECEIVED: {
    title: 'New Order Received',
    subject: 'New order #{orderID} from {consumerName}',
    variables: ['orderID', 'consumerName', 'itemCount', 'orderAmount', 'dashboardLink'],
    template: (vars) => `
Hi Retailer,

A new order has been received!
Order ID: ${vars.orderID}
Customer: ${vars.consumerName}
Items: ${vars.itemCount}
Amount: ₹${vars.orderAmount}

View Details: ${vars.dashboardLink}

Please confirm the order within 15 minutes.

Best regards,
Locaura Team
    `,
  },

  PAYOUT_PROCESSED: {
    title: 'Payout Processed',
    subject: 'Your payout of ₹{amount} has been processed',
    variables: ['amount', 'payoutID', 'retailerName', 'bankName', 'processingDate'],
    template: (vars) => `
Hi ${vars.retailerName},

Your payout has been processed!
Amount: ₹${vars.amount}
Payout ID: ${vars.payoutID}
Bank: ${vars.bankName}
Processing Date: ${vars.processingDate}

The amount will be credited to your account within 2-3 business days.

Best regards,
Locaura Payments
    `,
  },

  // ========== RIDER NOTIFICATIONS ==========
  DELIVERY_ASSIGNED: {
    title: 'New Delivery Assigned',
    subject: 'New delivery order #${orderID} assigned to you',
    variables: ['orderID', 'pickupLocation', 'deliveryLocation', 'distance', 'estimatedFare', 'mapsLink'],
    template: (vars) => `
Hi Delivery Partner,

A new delivery has been assigned to you!
Order ID: ${vars.orderID}
Pickup: ${vars.pickupLocation}
Delivery: ${vars.deliveryLocation}
Distance: ${vars.distance} km
Estimated Fare: ₹${vars.estimatedFare}

Get Directions: ${vars.mapsLink}

Accept the delivery in the app to proceed.

Best regards,
Locaura Logistics
    `,
  },

  DELIVERY_COMPLETED: {
    title: 'Delivery Completed',
    subject: 'Delivery for order #{orderID} completed',
    variables: ['orderID', 'earnings', 'totalEarnings', 'rating', 'payoutLink'],
    template: (vars) => `
Hi Delivery Partner,

Your delivery has been completed successfully!
Order ID: ${vars.orderID}
Earnings: ₹${vars.earnings}
Total Today: ₹${vars.totalEarnings}

Rating: ${vars.rating} ⭐

Your earnings will be credited to your account in your next payout.

View Dashboard: ${vars.payoutLink}

Best regards,
Locaura Logistics
    `,
  },

  PAYOUT_RIDER: {
    title: 'Rider Earnings Payout',
    subject: 'Your payout of ₹{amount} is ready',
    variables: ['amount', 'earningsBreakdown', 'payoutDate', 'riderName'],
    template: (vars) => `
Hi ${vars.riderName},

Your earnings payout is ready!
Amount: ₹${vars.amount}
Breakdown: ${vars.earningsBreakdown}
Payout Date: ${vars.payoutDate}

Thank you for delivering with Locaura!

Best regards,
Locaura Logistics
    `,
  },

  // ========== GENERIC NOTIFICATIONS ==========
  WELCOME: {
    title: 'Welcome to Locaura',
    subject: 'Welcome to Locaura - {userType}!',
    variables: ['userName', 'userType', 'verifyLink'],
    template: (vars) => `
Hi ${vars.userName},

Welcome to Locaura as a ${vars.userType}!

We're excited to have you on board. Please verify your email to get started.
Verify Email: ${vars.verifyLink}

If you have any questions, feel free to reach out to our support team.

Best regards,
Locaura Team
    `,
  },

  ALERT: {
    title: 'Alert',
    subject: 'Important Alert from Locaura',
    variables: ['alertTitle', 'alertMessage', 'actionLink'],
    template: (vars) => `
Hi User,

${vars.alertTitle}

${vars.alertMessage}

Take Action: ${vars.actionLink}

Best regards,
Locaura Team
    `,
  },
};

export const NOTIFICATION_TYPES = [
  { key: 'order', label: 'Order Updates', icon: '📦', color: '#2196f3' },
  { key: 'payment', label: 'Payment Updates', icon: '💳', color: '#10b981' },
  { key: 'delivery', label: 'Delivery Updates', icon: '🚚', color: '#f59e0b' },
  { key: 'promotion', label: 'Promotions', icon: '🎉', color: '#8b5cf6' },
  { key: 'system', label: 'System Alerts', icon: '⚠️', color: '#ef4444' },
  { key: 'account', label: 'Account Updates', icon: '👤', color: '#6366f1' },
];

export const NOTIFICATION_CHANNELS = [
  { key: 'email', label: 'Email', icon: '✉️' },
  { key: 'sms', label: 'SMS', icon: '📱' },
  { key: 'push', label: 'Push Notification', icon: '🔔' },
];
