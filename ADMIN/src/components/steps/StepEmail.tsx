import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '../ui/buttons/Button';
import { cn } from '../../utils/cn';

interface StepEmailProps {
  onNext: (email: string) => void;
}

export function StepEmail({ onNext }: StepEmailProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext(email);   // ✅ không check gì
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Quên mật khẩu?</h1>
        <p className="text-text-secondary text-sm mt-2">
          Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP 6 số để xác thực.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-2">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shop.com"
              className={cn(
                'w-full h-input pl-11 pr-4 rounded-btn',
                'bg-bg-elevated border border-border-strong',
                'text-text-primary text-sm placeholder:text-text-muted',
                'transition-all duration-app',
                'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary'
              )}
              autoFocus
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Gửi mã OTP
        </Button>
      </form>
    </>
  );
}