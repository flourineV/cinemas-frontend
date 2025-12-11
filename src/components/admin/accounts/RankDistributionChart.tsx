import React, { useEffect, useState } from "react";
import { userStatsService } from "@/services/userprofile";
import type { UserStatsResponse } from "@/types/userprofile";

interface RankData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const RANK_COLORS = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

const RankDistributionChart: React.FC = () => {
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userStatsService.getOverviewStats();
      console.log("📊 Dữ liệu thống kê:", data);
      setStats(data);
    } catch (err: any) {
      console.error("❌ Lỗi khi lấy thống kê:", err);
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const getRankData = (): RankData[] => {
    // Nếu chưa có stats thì trả về mảng rỗng để không crash
    if (!stats?.rankDistribution) return [];

    const { rankDistribution } = stats;

    // THAY ĐỔI Ở ĐÂY: Không dùng .filter() nữa để luôn trả về đủ 3 phần tử
    return [
      {
        name: "Đồng",
        count: rankDistribution.bronzeCount || 0,
        percentage: rankDistribution.bronzePercentage || 0,
        color: RANK_COLORS.bronze,
      },
      {
        name: "Bạc",
        count: rankDistribution.silverCount || 0,
        percentage: rankDistribution.silverPercentage || 0,
        color: RANK_COLORS.silver,
      },
      {
        name: "Vàng",
        count: rankDistribution.goldCount || 0,
        percentage: rankDistribution.goldPercentage || 0,
        color: RANK_COLORS.gold,
      },
    ];
  };

  // Tạo CSS conic-gradient cho pie chart
  const createPieChart = (data: RankData[]) => {
    // Logic cũ: nếu không có data thì trả về màu xám
    // Tuy nhiên ở dưới mình đã handle trường hợp totalUsers = 0 rồi
    // nên hàm này chỉ chạy khi có ít nhất 1 user

    let cumulativePercentage = 0;
    const gradientStops = data
      .map((item) => {
        const start = cumulativePercentage;
        cumulativePercentage += item.percentage;
        const end = cumulativePercentage;
        return `${item.color} ${start}% ${end}%`;
      })
      .join(", ");

    return {
      background: `conic-gradient(${gradientStops})`,
    };
  };

  // Xử lý hover trên pie chart
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;

    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;

    const rankData = getRankData();
    let cumulativePercentage = 0;

    for (const item of rankData) {
      // Nếu percentage = 0 thì bỏ qua logic hover
      if (item.percentage === 0) continue;

      const segmentEnd = cumulativePercentage + item.percentage * 3.6;
      if (angle >= cumulativePercentage * 3.6 && angle < segmentEnd) {
        setHoveredSegment(item.name);
        setMousePosition({ x: event.clientX, y: event.clientY });
        return;
      }
      cumulativePercentage += item.percentage;
    }

    setHoveredSegment(null);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-400 rounded-lg p-6 h-full">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-400 rounded-lg p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchStats}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rankData = getRankData();
  const totalUsers = rankData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-6 relative h-full">
      <div className="mb-4 text-center sm:text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Phân bố hạng thành viên
        </h3>
        <p className="text-sm text-gray-600">
          Tổng số thành viên:{" "}
          <span className="font-semibold">{totalUsers.toLocaleString()}</span>
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 py-4 pt-5">
        {/* Chỉ hiển thị Chart + Legend nếu rankData có dữ liệu (tức là đã load xong) */}
        {rankData.length > 0 ? (
          <>
            {/* Pie Chart */}
            <div
              className="w-32 h-32 rounded-full border-4 border-gray-200 cursor-pointer relative shrink-0"
              // Nếu tổng user > 0 thì vẽ biểu đồ, nếu = 0 thì hiện màu xám
              style={
                totalUsers > 0
                  ? createPieChart(rankData)
                  : { backgroundColor: "#e5e7eb" }
              }
              onMouseMove={totalUsers > 0 ? handleMouseMove : undefined}
              onMouseLeave={handleMouseLeave}
            />

            {/* Chú thích (Legend) - Luôn hiện đủ 3 dòng */}
            <div className="space-y-2 w-full max-w-[220px]">
              {rankData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    // Nếu count > 0 thì hiện màu chuẩn, nếu = 0 thì hiện màu xám nhạt cho đẹp (hoặc giữ nguyên màu chuẩn tùy bạn)
                    // Ở đây mình giữ nguyên màu chuẩn theo yêu cầu của bạn
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex items-center justify-between gap-4 w-full">
                    <span className="text-sm font-medium text-gray-700">
                      Hạng {item.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Trường hợp này rất hiếm khi xảy ra vì getRankData luôn trả về mảng 3 phần tử nếu có stats
          <div className="text-center py-4">
            <p className="text-gray-500">Chưa có dữ liệu thành viên</p>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredSegment && (
        <div
          className="fixed bg-black text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
          }}
        >
          {(() => {
            const item = rankData.find((r) => r.name === hoveredSegment);
            return item
              ? `Hạng ${item.name}: ${item.percentage.toFixed(1)}%`
              : "";
          })()}
        </div>
      )}
    </div>
  );
};

export default RankDistributionChart;
