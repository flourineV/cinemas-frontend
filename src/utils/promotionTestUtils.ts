// Utility functions để test promotion API mới
import { promotionService } from "@/services/promotion/promotionService";
import type {
  PromotionType,
  DiscountType,
  UsageTimeRestriction,
} from "@/types/promotion/promotion.type";

export const testPromotionAPI = {
  // Test lấy promotion cho user
  testGetActivePromotionsForUser: async (userId: string) => {
    try {
      console.log(
        `🧪 Testing getActivePromotionsForUser for userId: ${userId}`
      );
      const result = await promotionService.getActivePromotionsForUser(userId);
      console.log("✅ Result:", result);
      console.log(
        `📊 Applicable: ${result.applicable.length}, Not Applicable: ${result.notApplicable.length}`
      );
      return result;
    } catch (error) {
      console.error("❌ Error:", error);
      throw error;
    }
  },

  // Test tạo promotion mới với type mới
  testCreatePromotionWithNewTypes: async () => {
    const testPromotion = {
      code: "TEST_BIRTHDAY_2024",
      promotionType: "BIRTHDAY" as PromotionType,
      discountType: "PERCENTAGE" as DiscountType,
      discountValue: 15,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isActive: true,
      usageTimeRestriction: "WEEKENDS_ONLY" as UsageTimeRestriction,
      allowedDaysOfWeek: "6,0", // Saturday and Sunday
      description: "Khuyến mãi sinh nhật - chỉ áp dụng cuối tuần",
      promoDisplayUrl: "https://example.com/birthday-promo.jpg",
    };

    try {
      console.log("🧪 Testing createPromotion with new types:", testPromotion);
      const result = await promotionService.createPromotion(testPromotion);
      console.log("✅ Created promotion:", result);
      return result;
    } catch (error) {
      console.error("❌ Error creating promotion:", error);
      throw error;
    }
  },

  // Test admin filter
  testAdminFilter: async () => {
    try {
      console.log("🧪 Testing admin filter - all promotions");
      const all = await promotionService.getAllPromotionsForAdmin();
      console.log("✅ All promotions:", all);

      console.log("🧪 Testing admin filter - only BIRTHDAY type");
      const birthdayOnly = await promotionService.getAllPromotionsForAdmin(
        undefined,
        undefined,
        "BIRTHDAY",
        undefined
      );
      console.log("✅ Birthday promotions:", birthdayOnly);

      console.log("🧪 Testing admin filter - only active");
      const activeOnly = await promotionService.getAllPromotionsForAdmin(
        undefined,
        undefined,
        undefined,
        true
      );
      console.log("✅ Active promotions:", activeOnly);

      return { all, birthdayOnly, activeOnly };
    } catch (error) {
      console.error("❌ Error in admin filter:", error);
      throw error;
    }
  },
};

// Helper để log promotion types
export const logPromotionTypes = () => {
  console.log("📋 Available Promotion Types:");
  console.log("- GENERAL: Khuyến mãi chung");
  console.log("- BIRTHDAY: Khuyến mãi sinh nhật");
  console.log("- MEMBERSHIP: Khuyến mãi thành viên");
  console.log("- SPECIAL_EVENT: Khuyến mãi sự kiện đặc biệt");

  console.log("\n📋 Available Usage Time Restrictions:");
  console.log("- ANYTIME: Bất kỳ lúc nào");
  console.log("- WEEKDAYS_ONLY: Chỉ ngày trong tuần");
  console.log("- WEEKENDS_ONLY: Chỉ cuối tuần");
  console.log("- SPECIFIC_DAYS: Ngày cụ thể");
};
