import React from 'react';

export default function KhelvIcon({ name, className = 'w-6 h-6', style, ...props }) {
  const iconId = name.startsWith('icon-') ? name : `icon-${name}`;
  return (
    <svg className={className} style={style} aria-hidden="true" {...props}>
      <use href={`/assets/khelv_sprite.svg#${iconId}`} />
    </svg>
  );
}

