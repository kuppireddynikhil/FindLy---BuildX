import { MapPin, Calendar, Tag } from 'lucide-react';
import { Badge } from './Badge';
import type { Item } from '../../types/database';
import './ItemCard.css';

interface ItemCardProps {
  item: Item;
  onClick?: (item: Item) => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className="item-card"
      onClick={() => onClick?.(item)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(item);
        }
      }}
    >
      <div className="item-card__header">
        <Badge variant={item.type === 'lost' ? 'lost' : 'found'}>
          {item.type === 'lost' ? 'Lost' : 'Found'}
        </Badge>
        <Badge
          variant={
            item.status === 'open'
              ? 'warning'
              : item.status === 'resolved'
              ? 'success'
              : 'info'
          }
        >
          {item.status}
        </Badge>
      </div>

      {item.image_url && (
        <div className="item-card__image">
          <img src={item.image_url} alt={item.title} loading="lazy" />
        </div>
      )}

      <div className="item-card__body">
        <h3 className="item-card__title">{item.title}</h3>
        {item.description && (
          <p className="item-card__description">{item.description}</p>
        )}

        <div className="item-card__meta">
          <span className="item-card__meta-item">
            <Tag size={14} />
            {item.category}
          </span>
          <span className="item-card__meta-item">
            <MapPin size={14} />
            {item.location}
          </span>
          <span className="item-card__meta-item">
            <Calendar size={14} />
            {formattedDate}
          </span>
        </div>
      </div>
    </article>
  );
}
