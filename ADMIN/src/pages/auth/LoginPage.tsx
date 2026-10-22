import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/forms/Input';
import { Checkbox } from '../../components/ui/forms/Checkbox';
import { Button } from '../../components/ui/buttons/Button';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div>
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-btn bg-accent-primary flex items-center justify-center">
          <span className="text-black font-bold text-xl">A</span>
        </div>
        <div>
          <p className="text-text-primary font-semibold">Admin</p>
          <p className="text-text-muted text-xs">Commerce</p>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Đăng nhập</h1>
        <p className="text-text-secondary text-sm mt-2">
          Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email - Dùng Input component */}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@shop.com"
          icon={<Mail size={18} />}
        />

        {/* Password - Dùng Input component + custom label row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-text-secondary text-sm font-medium">Mật khẩu</label>
            <Link
              to="/forgot-password"
              className="text-accent-primary hover:text-accent-hover text-xs font-medium transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <Input
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={18} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        {/* Remember - Dùng Checkbox component */}
        <Checkbox
          label="Ghi nhớ đăng nhập"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />

        {/* Submit - Dùng Button component */}
        <Button type="submit" className="w-full">
          Đăng nhập
          <ArrowRight size={16} />
        </Button>
      </form>
    </div>
  );
}