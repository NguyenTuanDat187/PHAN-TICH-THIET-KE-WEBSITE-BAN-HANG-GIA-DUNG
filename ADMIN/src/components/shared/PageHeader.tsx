import Icon from '../ui/Icon';

type Props = { title: string; description: string; actionLabel?: string; onAction?: () => void };
export default function PageHeader({ title, description, actionLabel, onAction }: Props) {
  return <div className="ss-page-header">
    <div><div className="ss-eyebrow">OVERVIEW</div><h1>{title}</h1><p>{description}</p></div>
    {actionLabel && <button className="ss-button ss-button--primary" onClick={onAction}><Icon name="plus" size={17}/>{actionLabel}</button>}
  </div>;
}
