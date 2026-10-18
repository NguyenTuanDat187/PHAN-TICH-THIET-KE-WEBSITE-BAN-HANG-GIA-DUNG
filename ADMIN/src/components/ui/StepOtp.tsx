import { useState, type FormEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { OtpInput } from './OtpInput';
interface StepOtpProps {
  email: string;
  onNext: () => void;
}

export function StepOtp({ email, onNext }: StepOtpProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown] = useState(60);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext();   // ✅ không check gì
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Nhập mã OTP</h1>
        <p className="text-text-secondary text-sm mt-2">
          Mã 6 số đã được gửi tới <span className="text-text-primary font-medium">{email || 'email của bạn'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-text-secondary text-sm font-medium mb-3 text-center">
            Mã xác thực
          </label>
          <OtpInput value={otp} onChange={setOtp} autoFocus />
        </div>

        <Button type="submit" className="w-full">
          Xác thực OTP
        </Button>

        <div className="text-center text-sm">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-accent-primary hover:text-accent-hover font-medium transition-colors"
          >
            <RotateCcw size={14} />
            Gửi lại mã OTP
          </button>
        </div>
      </form>
    </>
  );
}