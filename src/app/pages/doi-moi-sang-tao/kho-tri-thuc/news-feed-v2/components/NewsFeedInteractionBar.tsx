import React from 'react';
import type { INewsFeedV2Item } from '../types';

interface Props {
  item: INewsFeedV2Item;
  /** Handler được bind sẵn với item tại NewsFeedCard — InteractionBar không cần biết về item */
  onLike: () => void;
}

export const NewsFeedInteractionBar: React.FC<Props> = ({ item, onLike }) => (
  <div className="d-flex gap-3 align-items-center border-top pt-2 mt-1">
    {/* Like button — pattern từ CongDongPage.renderPostCard footer stats */}
    <button
      className={`btn btn-sm btn-text d-flex align-items-center gap-1 p-0 ${
        item.daThich ? 'text-danger' : 'text-muted'
      }`}
      onClick={onLike}
    >
      <i className={`fa-${item.daThich ? 'solid' : 'regular'} fa-heart me-1`} />
      <span className="fs-8">{Math.max(0, item.soLuotThich ?? 0)}</span>
    </button>

    {/* Comment count — read-only (Commit #6+) */}
    <span className="d-flex align-items-center gap-1 text-muted fs-8">
      <i className="fa-regular fa-comment me-1" />
      <span>{item.soBinhLuan ?? 0}</span>
    </span>
  </div>
);
