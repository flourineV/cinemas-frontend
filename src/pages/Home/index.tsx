import Layout from '../../components/layout/Layout';
import './Home.css';

const Home = () => {
  return (
    <Layout>
      <div className="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Trải nghiệm điện ảnh <span className="highlight">tuyệt vời</span>
            </h1>
            <p className="hero-subtitle">
              Đặt vé xem phim online nhanh chóng, tiện lợi với CineHub
            </p>
            <div className="hero-actions">
              <button className="btn-primary">Xem phim ngay</button>
              <button className="btn-secondary">Tìm rạp gần bạn</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-placeholder">🎬</div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="container">
            <h2 className="section-title">Tại sao chọn CineHub?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎫</div>
                <h3>Đặt vé dễ dàng</h3>
                <p>Đặt vé xem phim chỉ trong vài cú click, không cần xếp hàng</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎭</div>
                <h3>Phim đa dạng</h3>
                <p>Từ bom tấn Hollywood đến phim độc lập, chúng tôi có tất cả</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎪</div>
                <h3>Rạp chất lượng</h3>
                <p>Hệ thống rạp hiện đại với âm thanh và hình ảnh tuyệt vời</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta">
          <div className="container">
            <h2>Sẵn sàng xem phim?</h2>
            <p>Khám phá những bộ phim hot nhất hiện tại</p>
            <button className="btn-primary">Xem phim ngay</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
