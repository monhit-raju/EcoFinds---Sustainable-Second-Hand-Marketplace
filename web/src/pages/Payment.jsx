import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'

export default function Payment() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
    address: '',
    city: '',
    pincode: ''
  });
  const navigate = useNavigate();

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setToken(token);
      const res = await api.get('/cart');
      setCartItems(res.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = total * 0.18; // 18% GST
  const finalTotal = total + tax;

  const handleInputChange = (field, value) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  }

  const processPayment = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Basic validation
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardholderName) {
        alert('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId) {
        alert('Please enter UPI ID');
        return;
      }
    }

    if (!paymentDetails.address || !paymentDetails.city || !paymentDetails.pincode) {
      alert('Please fill in delivery address');
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        paymentMethod,
        paymentDetails,
        total: finalTotal
      };

      const res = await api.post('/orders', orderData);
      
      alert('🎉 Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Payment Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>
        
        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Credit/Debit Card
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              UPI
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Cash on Delivery
            </label>
          </div>
        </div>

        {/* Card Details */}
        {paymentMethod === 'card' && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={paymentDetails.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )}

        {/* UPI Details */}
        {paymentMethod === 'upi' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
            <input
              type="text"
              placeholder="yourname@paytm"
              value={paymentDetails.upiId}
              onChange={(e) => handleInputChange('upiId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {/* Delivery Address */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Delivery Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                placeholder="Enter your full address"
                value={paymentDetails.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={paymentDetails.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={paymentDetails.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={processPayment}
          disabled={processing}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay ₹ ${finalTotal.toFixed(2)}`
          )}
        </button>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
        
        <div className="space-y-4 mb-6">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {item.product.image_url ? (
                  <img 
                    src={`http://localhost:4000${item.product.image_url}`} 
                    alt={item.product.title}
                    className="max-w-full max-h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{item.product.title}</h4>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹ {(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (18%):</span>
            <span>₹ {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>₹ {finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}