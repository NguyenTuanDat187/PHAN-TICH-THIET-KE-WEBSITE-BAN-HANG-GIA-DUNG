import { DollarSign, ShoppingBag, Users, Clock, ArrowUpRight } from 'lucide-react';
import Header from '../../layouts/Header';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { stats, recentOrders, topProducts } from '../../mocks/dashboard.mock';
import { cn } from '../../utils/cn';

const iconMap = { DollarSign, ShoppingBag, Users, Clock };

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" subtitle="Overview of your store performance" />

      <div className="p-6 lg:p-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              change={s.change}
              accent={s.accent}
              icon={iconMap[s.icon as keyof typeof iconMap]}
            />
          ))}
        </div>

        {/* Chart + Top products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">

          {/* Revenue chart */}
          <div className="xl:col-span-2 p-5 bg-bg-surface border border-border-default rounded-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-text-primary font-semibold">Revenue Overview</h2>
                <p className="text-text-muted text-xs mt-0.5">Last 30 days</p>
              </div>
              <select className={cn(
                'h-9 px-3 rounded-btn text-xs',
                'bg-bg-elevated border border-border-strong text-text-primary',
                'focus:outline-none focus:border-accent-primary'
              )}>
                <option>30 days</option>
                <option>7 days</option>
                <option>90 days</option>
              </select>
            </div>

            <div className="h-64 flex items-end gap-2 border-b border-border-default pb-2">
              {[40, 55, 48, 70, 62, 85, 78, 90, 72, 88, 95, 82].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full rounded-t-md bg-accent-primary/20 hover:bg-accent-primary/40 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between text-text-muted text-[11px] mt-2">
              {['Nov 1', 'Nov 5', 'Nov 10', 'Nov 15', 'Nov 20', 'Nov 25', 'Nov 30'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          {/* Top products */}
          <div className="p-5 bg-bg-surface border border-border-default rounded-card">
            <h2 className="text-text-primary font-semibold mb-4">Top Products</h2>
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-btn bg-bg-elevated flex items-center justify-center text-text-secondary text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">{p.name}</p>
                    <p className="text-text-muted text-xs">{p.sold} sold</p>
                  </div>
                  <p className="text-text-primary text-sm font-semibold">{p.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-bg-surface border border-border-default rounded-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border-default">
            <h2 className="text-text-primary font-semibold">Recent Orders</h2>
            <Button variant="ghost" className="!h-8 !text-xs">
              View all <ArrowUpRight size={14} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className={cn(
                      'h-12 border-b border-border-default cursor-pointer',
                      'transition-colors duration-app hover:bg-bg-hover/50'
                    )}
                  >
                    <td className="px-5 text-text-primary text-sm font-medium">{o.id}</td>
                    <td className="px-5 text-text-secondary text-sm">{o.customer}</td>
                    <td className="px-5 text-text-muted text-sm">{o.date}</td>
                    <td className="px-5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 text-text-primary text-sm font-semibold text-right">{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}