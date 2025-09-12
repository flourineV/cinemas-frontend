# CineHub Frontend - Website Đặt Vé Xem Phim

Dự án frontend cho website đặt vé xem phim được xây dựng với React TypeScript + Vite và SWC.

## 🏗️ Cấu Trúc Thư Mục

```
src/
├── assets/                 # Static assets (images, icons)
├── components/            # React components
│   ├── common/           # Common/shared components
│   ├── layout/           # Layout components (Header, Footer, Layout)
│   ├── movie/            # Movie-related components (MovieCard, MovieGrid)
│   ├── booking/          # Booking-related components
│   └── auth/             # Authentication components
├── pages/                # Page components
│   ├── Home/             # Homepage
│   ├── Movies/           # Movies listing page
│   ├── MovieDetail/      # Movie detail page
│   ├── Booking/          # Booking flow pages
│   ├── Profile/          # User profile pages
│   └── Auth/             # Login/Register pages
├── hooks/                # Custom React hooks
│   ├── useMovies.ts      # Movies data fetching
│   ├── useBooking.ts     # Booking management
│   └── useSeatSelection.ts # Seat selection logic
├── services/             # API services and HTTP clients
│   └── api.ts            # Main API service
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── types/                # TypeScript type definitions
│   └── index.ts          # All type definitions
├── utils/                # Utility functions
│   └── index.ts          # Helper functions
├── constants/            # App constants
│   └── index.ts          # API endpoints, configs
├── styles/               # Global CSS styles
│   └── globals.css       # Global styling
└── stores/               # State management (future use)
```

## 🎯 Tính Năng Chính

- **Trang chủ**: Hero section, giới thiệu tính năng
- **Danh sách phim**: Hiển thị phim đang chiếu, sắp chiếu
- **Chi tiết phim**: Thông tin chi tiết, trailer, suất chiếu
- **Đặt vé**: Chọn rạp, suất chiếu, ghế ngồi
- **Thanh toán**: Xử lý thanh toán online
- **Quản lý tài khoản**: Đăng ký, đăng nhập, lịch sử đặt vé

## 🛠️ Công Nghệ Sử Dụng

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **SWC** - Fast compiler
- **CSS Modules** - Styling
- **Context API** - State management

## 📱 Responsive Design

- Mobile-first approach
- Tablet và desktop support
- Modern CSS Grid và Flexbox
