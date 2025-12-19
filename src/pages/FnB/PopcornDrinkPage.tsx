import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { fnbService } from "@/services/fnb/fnbService";
import type { FnbItemResponse } from "@/types/fnb/fnb.type";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { ChevronDown, Plus, Minus, ShoppingCart } from "lucide-react";
import FnbSummaryBar from "@/components/fnb/FnbSummaryBar";
import { useAuthStore } from "@/stores/authStore";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";

interface CartItem extends FnbItemResponse {
  quantity: number;
}

const PopcornDrinkPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t, language } = useLanguage();
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [selectedTheater, setSelectedTheater] =
    useState<TheaterResponse | null>(null);
  const [fnbItems, setFnbItems] = useState<FnbItemResponse[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Load theaters and FnB items on mount (tất cả rạp đều có cùng thực đơn)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [theaterList, items] = await Promise.all([
          fnbService.getTheaters(),
          fnbService.getAllFnbItems(), // Load tất cả FnB items ngay từ đầu
        ]);
        setTheaters(theaterList);
        setFnbItems(items);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addToCart = (item: FnbItemResponse) => {
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
    return cart.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    // Check authentication first
    if (!user) {
      return Swal.fire({
        title: t("fnb.loginRequired"),
        text: t("fnb.loginRequiredDesc"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("fnb.login"),
        cancelButtonText: t("fnb.cancel"),
        confirmButtonColor: "#eab308",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth");
        }
      });
    }

    // Validation
    if (!selectedTheater) {
      return Swal.fire({
        icon: "warning",
        title: t("fnb.noTheaterSelected"),
        text: t("fnb.noTheaterSelectedDesc"),
        confirmButtonColor: "#eab308",
      });
    }

    if (cart.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: t("fnb.emptyCart"),
        text: t("fnb.emptyCartDesc"),
        confirmButtonColor: "#eab308",
      });
    }

    // Validate total amount > 0
    const total = getTotalAmount();
    if (total <= 0) {
      return Swal.fire({
        icon: "error",
        title: t("fnb.cartError"),
        text: t("fnb.cartErrorDesc"),
        confirmButtonColor: "#eab308",
      });
    }

    setCreatingOrder(true);

    try {
      // Create FnB order
      const orderData = {
        userId: user.id,
        theaterId: selectedTheater.id,
        paymentMethod: "ZALOPAY",
        items: cart.map((item) => ({
          fnbItemId: item.id,
          quantity: item.quantity,
        })),
      };

      const order = await fnbService.createOrder(orderData);

      console.log("🔍 [PopcornDrink] Order created:", order);
      console.log("🔍 [PopcornDrink] Order ID:", order.id);
      console.log("🔍 [PopcornDrink] Order expiresAt:", order.expiresAt);

      // Calculate TTL from expiresAt
      const expiresAt = new Date(order.expiresAt);
      const ttl = Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      );

      // Navigate to FnB checkout with order data and TTL
      navigate("/fnb-checkout", {
        state: {
          theater: selectedTheater,
          cart: cart,
          totalAmount: total,
          order: order,
          ttl: ttl,
          ttlTimestamp: Date.now(),
        },
      });
    } catch (error: any) {
      console.error("❌ [PopcornDrink] Create order error:", error);
      console.error("❌ [PopcornDrink] Error response:", error.response?.data);
      console.error("❌ [PopcornDrink] Error status:", error.response?.status);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi tạo đơn hàng";

      Swal.fire({
        icon: "error",
        title: t("fnb.error"),
        text: `${errorMessage}. ${t("fnb.tryAgain")}`,
        confirmButtonColor: "#eab308",
      });
    } finally {
      setCreatingOrder(false);
    }
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
      <div className="min-h-screen bg-gray-100 pt-8 pb-16 relative">
        {/* Loading Overlay */}
        {creatingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("fnb.creatingOrder")}
              </h3>
              <p className="text-gray-600">{t("fnb.pleaseWait")}</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
              {t("fnb.title")}
            </h1>
            <p className="text-gray-600 text-lg">{t("fnb.subtitle")}</p>
          </div>

          {/* Theater Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <ShoppingCart className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {t("fnb.selectTheater")}
              </h2>
            </div>

            <div className="relative max-w-lg mx-auto">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full border-2 rounded-xl px-6 py-4 text-left flex items-center justify-between transition-all duration-200 ${
                  selectedTheater
                    ? "border-yellow-400 bg-yellow-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md"
                }`}
              >
                <span
                  className={
                    selectedTheater
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500"
                  }
                >
                  {selectedTheater
                    ? (language === "en" && selectedTheater.nameEn) ||
                      selectedTheater.name
                    : t("fnb.selectTheaterPlaceholder")}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto">
                  {theaters.map((theater) => (
                    <button
                      key={theater.id}
                      onClick={() => {
                        setSelectedTheater(theater);
                        setIsDropdownOpen(false);
                        setCart([]); // Clear cart when changing theater
                      }}
                      className="w-full px-6 py-4 text-left hover:bg-yellow-50 transition-colors border-b border-gray-50 last:border-b-0 group"
                    >
                      <div className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                        {(language === "en" && theater.nameEn) || theater.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        📍{" "}
                        {(language === "en" && theater.addressEn) ||
                          theater.address}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FnB Items */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                🍿 {t("fnb.menuTitle")}
              </h3>
              <p className="text-gray-600">{t("fnb.menuSubtitle")}</p>
            </div>

            {fnbItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">{t("fnb.noItems")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {fnbItems.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-yellow-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {false && ( // Tạm thời disable available check
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-bold">Hết hàng</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h4 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                        {(language === "en" && item.nameEn) || item.name}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {(language === "en" && item.descriptionEn) ||
                          item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-yellow-600">
                          {item.unitPrice.toLocaleString()}
                          <span className="text-sm text-gray-500 ml-1">đ</span>
                        </div>

                        {getItemQuantity(item.id) === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            disabled={false}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Plus className="w-4 h-4" />
                            {t("fnb.add")}
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="bg-white hover:bg-red-50 text-red-500 w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm border border-gray-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-xl min-w-[2.5rem] text-center text-gray-900">
                              {getItemQuantity(item.id)}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-yellow-400 hover:bg-yellow-500 text-black w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm"
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

        {/* FnB Summary Bar */}
        <FnbSummaryBar
          theaterName={
            selectedTheater
              ? (language === "en" && selectedTheater.nameEn) ||
                selectedTheater.name
              : t("fnb.noTheater")
          }
          totalPrice={getTotalAmount()}
          itemCount={cart.reduce((total, item) => total + item.quantity, 0)}
          isVisible={cart.length > 0}
          onSubmit={handleCheckout}
          loading={creatingOrder}
        />
      </div>
    </Layout>
  );
};

export default PopcornDrinkPage;
