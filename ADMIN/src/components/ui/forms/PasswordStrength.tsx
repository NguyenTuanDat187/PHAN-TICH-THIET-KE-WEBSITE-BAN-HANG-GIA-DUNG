import { cn } from '../../../utils/cn';

function getStrength(pwd: string) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const final = Math.min(score, 4);
    const map = {
        0: { label: '', color: '', textColor: '' },
        1: { label: 'Yếu', color: 'bg-status-danger', textColor: 'text-status-danger' },
        2: { label: 'Trung bình', color: 'bg-status-warning', textColor: 'text-status-warning' },
        3: { label: 'Tốt', color: 'bg-status-info', textColor: 'text-status-info' },
        4: { label: 'Mạnh', color: 'bg-status-success', textColor: 'text-status-success' },
    };
    return { score: final, ...map[final as keyof typeof map] };
}

export function PasswordStrength({ password }: { password: string }) {
    if (!password) return null;
    const s = getStrength(password);

    return (
        <div className="mt-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            'h-1 flex-1 rounded-full transition-colors duration-app',
                            i <= s.score ? s.color : 'bg-bg-elevated'
                        )}
                    />
                ))}
            </div>
            <p className={cn('text-xs mt-1.5', s.textColor)}>{s.label}</p>
        </div>
    );
}