import React from 'react';
export { KhelvSvgSprite } from './common/KhelvIcon';

export function KhelvIcon({ name, className = 'w-6 h-6', style, ...props }) {
  const iconId = name.startsWith('icon-') ? name : `icon-${name}`;
  return (
    <svg className={className} style={style} aria-hidden="true" focusable="false" {...props}>
      <use href={`#${iconId}`} xlinkHref={`#${iconId}`} />
    </svg>
  );
}

export default KhelvIcon;
