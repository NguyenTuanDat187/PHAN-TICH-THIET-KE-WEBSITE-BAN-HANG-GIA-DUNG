import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Stepper } from '../../components/ui/Stepper';
import { OtpInput } from '../../components/ui/OtpInput';
import { PasswordStrength } from '../../components/ui/PasswordStrength';

type Step = 'email' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  
  // State cho OTP & Password
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleBack = () => {
    if (step === 'otp') setStep('email');
    else if (step === 'reset') setStep('otp');
    else navigate('/login');
  };

  // 1. Submit Email
  const handleSendEmail = (e: FormEvent) => {
    e.preventDefault();
    setStep('otp'); // Không validate, bấm là qua
  };

  // 2. Submit OTP
  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    setStep('reset'); // Không validate, bấm là qua
  };

  // 3. Submit Password
  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();
    setStep('done'); // Không validate, bấm là qua
  };

  return (
    <div>
      {/* Nút quay lại */}
      {step !== 'done' && (
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          {step === 'email' ? 'Quay lại đăng nhập' : 'Quay lại bước trước'}
        </button>
      )}

      {/* Thanh tiến trình (Stepper) */}
      {step !== 'email' && step !== 'done' && <Stepper current={step} />}

      {/* BƯỚC 1: NHẬP EMAIL */}
      {step === 'email' && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Quên mật khẩu?</h1>
            <p className="text-text-secondary text-sm mt-2">
              Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP 6 số để xác thực.
            </p>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="admin@shop.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full">
              Gửi mã OTP
            </Button>
          </form>
        </>
      )}

      {/* BƯỚC 2: NHẬP OTP */}
      {step === 'otp' && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Nhập mã OTP</h1>
            <p className="text-text-secondary text-sm mt-2">
              Mã 6 số đã được gửi tới <span className="text-text-primary font-medium">{email || 'email của bạn'}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-3 text-center">
                Mã xác thực
              </label>
              <OtpInput value={otp} onChange={setOtp} autoFocus />
            </div>
            <Button type="submit" className="w-full">
              Xác thực OTP
            </Button>
          </form>
        </>
      )}

      {/* BƯỚC 3: ĐẶT LẠI MẬT KHẨU */}
      {step === 'reset' && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Đặt mật khẩu mới</h1>
            <p className="text-text-secondary text-sm mt-2">
              Tạo mật khẩu mới cho tài khoản <span className="text-text-primary font-medium">{email || 'của bạn'}</span>
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <Input
                label="Mật khẩu mới"
                type={showPwd ? 'text' : 'password'}
                placeholder="Tối thiểu 8 ký tự"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
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
              <PasswordStrength password={password} />
            </div>

            <Input
              label="Xác nhận mật khẩu"
              type={showPwd ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              icon={<ShieldCheck size={18} />}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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

            <Button type="submit" className="w-full">
              Đặt lại mật khẩu
            </Button>
          </form>
        </>
      )}

      {/* BƯỚC 4: HOÀN TẤT */}
      {step === 'done' && (
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
      )}
    </div>
  );
}