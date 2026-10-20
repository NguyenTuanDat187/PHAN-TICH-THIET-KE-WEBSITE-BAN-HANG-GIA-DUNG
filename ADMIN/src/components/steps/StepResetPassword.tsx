import { useState, type FormEvent } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/buttons/Button';
import { PasswordStrength } from '../ui/forms/PasswordStrength';
import { cn } from '../../utils/cn';


interface StepResetPasswordProps {
  email: string;
  onNext: () => void;
}

export function StepResetPassword({ email, onNext }: StepResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext();   // ✅ không check gì
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Đặt mật khẩu mới</h1>
        <p className="text-text-secondary text-sm mt-2">
          Tạo mật khẩu mới cho tài khoản <span className="text-text-primary font-medium">{email || 'của bạn'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New password */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">Mật khẩu mới</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className={cn(
                'w-full h-input pl-11 pr-11 rounded-btn',
                'bg-bg-elevated border border-border-strong',
                'text-text-primary text-sm placeholder:text-text-muted',
                'transition-all duration-app',
                'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary'
              )}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">Xác nhận mật khẩu</label>
          <div className="relative">
            <ShieldCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className={cn(
                'w-full h-input pl-11 pr-11 rounded-btn',
                'bg-bg-elevated border border-border-strong',
                'text-text-primary text-sm placeholder:text-text-muted',
                'transition-all duration-app',
                'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Đặt lại mật khẩu
        </Button>
      </form>
    </>
  );
}