import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { fnbService, type FnbItem } from "@/services/fnb/fnbService";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { ChevronDown, Plus, Minus, ShoppingCart } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";

interface CartItem extends FnbItem {
  quantity: number;
}

const PopcornDrinkPage = () => {
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [selectedTheater, setSelectedTheater] =
    useState<TheaterResponse | null>(null);
  const [fnbItems, setFnbItems] = useState<FnbItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load theaters on mount
  useEffect(() => {
    const loadTheaters = async () => {
      try {
        const theaterList = await fnbService.getTheaters();
        setTheaters(theaterList);
      } catch (error) {
        console.error("Error loading theaters:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTheaters();
  }, []);

  // Load FnB items when theater is selected
  useEffect(() => {
    if (selectedTheater) {
      const loadFnbItems = async () => {
        setLoadingItems(true);
        try {
          const items = await fnbService.getFnbItems(selectedTheater.id);
          setFnbItems(items);
        } catch (error) {
          console.error("Error loading FnB items:", error);
          setFnbItems([]);
        } finally {
          setLoadingItems(false);
        }
      };
      loadFnbItems();
    }
  }, [selectedTheater]);

  const addToCart = (item: FnbItem) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prev.filter((cartItem) => cartItem.id !== itemId);
      }
    });
  };

  const getItemQuantity = (itemId: string) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!selectedTheater || cart.length === 0) return;

    // Navigate to FnB checkout with cart data
    navigate("/fnb-checkout", {
      state: {
        theater: selectedTheater,
        cart: cart,
        totalAmount: getTotalAmount(),
      },
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 pt-8 pb-16">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <h1 className="text-4xl font-extrabold text-yellow-500 text-center mb-8">
            ĐẶT BẮP NƯỚC
          </h1>

          {/* Theater Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              CHỌN RẠP GẦN BẠN
            </h2>

            <div className="relative max-w-md mx-auto">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span
                  className={
                    selectedTheater ? "text-gray-900" : "text-gray-500"
                  }
                >
                  {selectedTheater ? selectedTheater.name : "CHỌN RẠP"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {theaters.map((theater) => (
                    <button
                      key={theater.id}
                      onClick={() => {
                        setSelectedTheater(theater);
                        setIsDropdownOpen(false);
                        setCart([]); // Clear cart when changing theater
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold text-gray-900">
                        {theater.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {theater.address}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FnB Items */}
        {selectedTheater && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                THỰC ĐƠN TẠI {selectedTheater.name}
              </h3>

              {loadingItems ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
                </div>
              ) : fnbItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Rạp này hiện chưa có thực đơn
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fnbItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-bold text-lg text-gray-900 mb-2">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-yellow-600">
                            {item.price.toLocaleString()}đ
                          </span>

                          {getItemQuantity(item.id) === 0 ? (
                            <button
                              onClick={() => addToCart(item)}
                              disabled={!item.available}
                              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Thêm
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-semibold text-lg min-w-[2rem] text-center">
                                {getItemQuantity(item.id)}
                              </span>
                              <button
                                onClick={() => addToCart(item)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {cart.reduce((total, item) => total + item.quantity, 0)} món
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {getTotalAmount().toLocaleString()}đ
                  </p>
                </div>
              </div>

              <AnimatedButton
                variant="orange-to-f3ea28"
                onClick={handleCheckout}
                className="px-8 py-3"
              >
                THANH TOÁN
              </AnimatedButton>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PopcornDrinkPage;
