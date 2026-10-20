import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function StepDone() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-status-success/15 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={32} className="text-status-success" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Đặt lại thành công!</h1>
      <p className="text-text-secondary text-sm mb-6">
        Mật khẩu của bạn đã được cập nhật. Đang chuyển về trang đăng nhập...
      </p>
      <Loader2 size={20} className="animate-spin text-accent-primary mx-auto" />
    </div>
  );
}