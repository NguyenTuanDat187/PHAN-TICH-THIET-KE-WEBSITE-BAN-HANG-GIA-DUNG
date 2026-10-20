import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-app flex">
      {/* Left: brand panel (ẩn trên mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-border-default">
        <div className="absolute inset-0 bg-linear-to-br from-bg-surface to-bg-app" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, #65D92833 0%, transparent 40%),
                              radial-gradient(circle at 80% 80%, #1084A933 0%, transparent 40%)`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-btn bg-accent-primary flex items-center justify-center">
              <span className="text-black font-bold text-xl">A</span>
            </div>
            <div>
              <p className="text-text-primary font-semibold">Admin</p>
              <p className="text-text-muted text-xs">Commerce Platform</p>
            </div>
          </Link>

          <div className="space-y-6 max-w-md">
            <h2 className="text-3xl font-bold text-text-primary leading-tight">
              Quản lý cửa hàng của bạn một cách chuyên nghiệp.
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Dashboard thống kê, quản lý đơn hàng, sản phẩm, khách hàng, coupon và đánh giá — tất cả trong một nơi.
            </p>
            <div className="flex gap-3">
              <span className="badge bg-status-success/15 text-status-success">● Live</span>
              <span className="badge bg-bg-elevated text-text-secondary">v1.0.0</span>
            </div>
          </div>

          <p className="text-text-muted text-xs">
            © 2024 Admin Commerce. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}