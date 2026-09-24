// components/icons/Icon.tsx
//
// Single shared line-icon set used across the app instead of emoji.
// Sized at 1em by default so it drops into text flow the same way an
// emoji glyph used to; pass a className (e.g. "w-5 h-5") to override.

import React from 'react'

export type IconName =
  | 'phone'
  | 'search'
  | 'graduation-cap'
  | 'check'
  | 'check-circle'
  | 'link'
  | 'close'
  | 'clipboard'
  | 'download'
  | 'sparkle'
  | 'sparkles'
  | 'crown'
  | 'pencil'
  | 'music-note'
  | 'music-notes'
  | 'mic'
  | 'book'
  | 'hat'
  | 'monitor'
  | 'eye'
  | 'palette'
  | 'brain'
  | 'headphones'
  | 'bolt'
  | 'smiley'
  | 'game-controller'
  | 'rocket'
  | 'clapperboard'
  | 'camera'
  | 'users'
  | 'user'
  | 'tag'
  | 'chat'
  | 'pizza'
  | 'coffee'
  | 'globe'
  | 'trophy'
  | 'chart-bar'
  | 'heart'
  | 'fire'
  | 'piano'
  | 'brick'
  | 'confetti'
  | 'warning'
  | 'ticket'
  | 'star'
  | 'menu'
  | 'printer'
  | 'calendar'
  | 'pin'
  | 'target'
  | 'home'
  | 'drum'
  | 'guitar'
  | 'tv'
  | 'refresh'
  | 'play'
  | 'pause'
  | 'logout'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  className?: string
}

const strokeProps = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const paths: Record<IconName, React.ReactNode> = {
  phone: (
    <path {...strokeProps} d="M7 3h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 15h.01" />
  ),
  search: (
    <>
      <circle {...strokeProps} cx={11} cy={11} r={6.5} />
      <path {...strokeProps} d="m20 20-3.7-3.7" />
    </>
  ),
  'graduation-cap': (
    <>
      <path {...strokeProps} d="M2 8.5 12 4l10 4.5-10 4.5-10-4.5Z" />
      <path {...strokeProps} d="M6 10.7v4.8c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.8" />
      <path {...strokeProps} d="M22 8.5v6" />
    </>
  ),
  check: <path {...strokeProps} d="M4 12.5 9.5 18 20 6" />,
  'check-circle': (
    <>
      <circle {...strokeProps} cx={12} cy={12} r={9} />
      <path {...strokeProps} d="m8 12.5 2.7 2.7L16 9.5" />
    </>
  ),
  link: (
    <>
      <path {...strokeProps} d="M9.5 14.5 14.5 9.5" />
      <path {...strokeProps} d="M11 6.5 13.3 4.2a4 4 0 0 1 5.7 5.6l-2.4 2.4" />
      <path {...strokeProps} d="M13 17.5 10.7 19.8a4 4 0 0 1-5.7-5.6l2.4-2.4" />
    </>
  ),
  close: <path {...strokeProps} d="M6 6 18 18M18 6 6 18" />,
  clipboard: (
    <>
      <rect {...strokeProps} x={6} y={4.5} width={12} height={16} rx={1.6} />
      <path {...strokeProps} d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7" />
      <path {...strokeProps} d="M9 11h6M9 15h6" />
    </>
  ),
  download: (
    <>
      <path {...strokeProps} d="M12 3v12" />
      <path {...strokeProps} d="m7 10.5 5 5 5-5" />
      <path {...strokeProps} d="M4.5 19.5h15" />
    </>
  ),
  sparkle: (
    <path
      fill="currentColor"
      d="M12 2c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z"
    />
  ),
  sparkles: (
    <>
      <path
        fill="currentColor"
        d="M11 2c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z"
      />
      <path
        fill="currentColor"
        d="M18.5 14c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8Z"
      />
    </>
  ),
  crown: (
    <path {...strokeProps} d="m3 8 4 3 5-6 5 6 4-3-2 10H5L3 8Z" strokeLinejoin="round" />
  ),
  pencil: (
    <>
      <path {...strokeProps} d="M4 20h4.2L19 9.2a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20Z" />
      <path {...strokeProps} d="m13.5 6.5 4 4" />
    </>
  ),
  'music-note': (
    <>
      <circle {...strokeProps} cx={7} cy={18} r={2.6} />
      <path {...strokeProps} d="M9.6 18V5.5L19 4v10" />
    </>
  ),
  'music-notes': (
    <>
      <circle {...strokeProps} cx={6.5} cy={18.5} r={2.3} />
      <circle {...strokeProps} cx={15.5} cy={16.5} r={2.3} />
      <path {...strokeProps} d="M8.8 18.5V6l9-2v12.5" />
    </>
  ),
  mic: (
    <>
      <rect {...strokeProps} x={9} y={2.5} width={6} height={11} rx={3} />
      <path {...strokeProps} d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path {...strokeProps} d="M12 18v3.5M9 21.5h6" />
    </>
  ),
  book: (
    <>
      <path {...strokeProps} d="M4 5.5c2-1 5-1 8 .5 3-1.5 6-1.5 8-.5v13c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5v-13Z" />
      <path {...strokeProps} d="M12 6v13" />
    </>
  ),
  hat: (
    <>
      <path {...strokeProps} d="M5 12h14l-1.5-6.5a2 2 0 0 0-2-1.5H8.5a2 2 0 0 0-2 1.5L5 12Z" />
      <path {...strokeProps} d="M3.5 12h17v2.2c0 .5-.4.8-.8.8H4.3a.8.8 0 0 1-.8-.8V12Z" />
    </>
  ),
  monitor: (
    <>
      <rect {...strokeProps} x={3} y={4.5} width={18} height={12} rx={1.6} />
      <path {...strokeProps} d="M8.5 20.5h7M12 16.5v4" />
    </>
  ),
  eye: (
    <>
      <path {...strokeProps} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle {...strokeProps} cx={12} cy={12} r={2.8} />
    </>
  ),
  palette: (
    <>
      <path
        {...strokeProps}
        d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2s-.5-1.4-.5-2 .5-1.5 1.7-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8.5-9-8.5Z"
      />
      <circle cx={7.5} cy={11} r={1.1} fill="currentColor" />
      <circle cx={9.5} cy={7.3} r={1.1} fill="currentColor" />
      <circle cx={14.2} cy={6.8} r={1.1} fill="currentColor" />
      <circle cx={16.8} cy={10.2} r={1.1} fill="currentColor" />
    </>
  ),
  brain: (
    <path
      {...strokeProps}
      d="M9 4.5a3 3 0 0 0-3 3v.3A3.2 3.2 0 0 0 4.5 13a3.2 3.2 0 0 0 2 5.8 2.8 2.8 0 0 0 2.7 1.7c1 0 1.8-.6 2.3-1.4M15 4.5a3 3 0 0 1 3 3v.3A3.2 3.2 0 0 1 19.5 13a3.2 3.2 0 0 1-2 5.8 2.8 2.8 0 0 1-2.7 1.7c-1 0-1.8-.6-2.3-1.4M12 4.5v15"
    />
  ),
  headphones: (
    <path
      {...strokeProps}
      d="M4 14v-2a8 8 0 0 1 16 0v2M4 14a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v-5H4Zm16 0a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v-5h1Z"
    />
  ),
  bolt: <path {...strokeProps} d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" />,
  smiley: (
    <>
      <circle {...strokeProps} cx={12} cy={12} r={9} />
      <path {...strokeProps} d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" />
      <path {...strokeProps} d="M8.5 9.5h.01M15.5 9.5h.01" />
    </>
  ),
  'game-controller': (
    <path
      {...strokeProps}
      d="M7 8h10a4 4 0 0 1 4 4.5l-.6 3a2.3 2.3 0 0 1-4-.9L16 13H8l-.4 1.6a2.3 2.3 0 0 1-4 .9l-.6-3A4 4 0 0 1 7 8Z M7 10.5v3M5.5 12h3M15.5 11h.01M17.5 13h.01"
    />
  ),
  rocket: (
    <path
      {...strokeProps}
      d="M14.5 9.5c2-2 4.5-2.5 6-2 .5 1.5 0 4-2 6l-2.5 2.5-3.5-3.5L14.5 9.5Z M12.5 14.5 9 18l-3.5.5L6 15l3.5-3.5 M6.5 17.5 5 19M9.5 6.5c1-1 2-1.3 3-1"
    />
  ),
  clapperboard: (
    <>
      <path {...strokeProps} d="M3.5 9.5 4.7 4.9a1.2 1.2 0 0 1 1.5-.9l12.4 3.3a1.2 1.2 0 0 1 .9 1.5l-.4 1.7" />
      <rect {...strokeProps} x={3.5} y={9.5} width={17} height={10.5} rx={1.4} />
      <path {...strokeProps} d="m6.5 5 2.2 4M11 3.9l2.2 4M15.5 5.2l2.2 4" />
    </>
  ),
  camera: (
    <>
      <path {...strokeProps} d="M4 8.5h3l1.4-2h7.2l1.4 2h3v11H4v-11Z" />
      <circle {...strokeProps} cx={12} cy={14} r={3.4} />
    </>
  ),
  users: (
    <>
      <circle {...strokeProps} cx={9} cy={8.5} r={3} />
      <path {...strokeProps} d="M3 20a6 6 0 0 1 12 0" />
      <path {...strokeProps} d="M16 8.8a3 3 0 1 1 3.3 5.9" />
      <path {...strokeProps} d="M15 14.5c2.8.2 5 1.9 6 5.5" />
    </>
  ),
  user: (
    <>
      <circle {...strokeProps} cx={12} cy={8} r={3.5} />
      <path {...strokeProps} d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  tag: (
    <>
      <path {...strokeProps} d="M11.5 3.5H5a1.5 1.5 0 0 0-1.5 1.5v6.5c0 .4.15.78.44 1.06l9 9a1.5 1.5 0 0 0 2.12 0l6.5-6.5a1.5 1.5 0 0 0 0-2.12l-9-9a1.5 1.5 0 0 0-1.06-.44Z" />
      <circle cx={8} cy={8} r={1.3} fill="currentColor" />
    </>
  ),
  chat: (
    <path
      {...strokeProps}
      d="M4 5.5h16v11H9.5L5 20v-3.5H4v-11Z"
    />
  ),
  pizza: (
    <>
      <path {...strokeProps} d="M12 3 3 20h18L12 3Z" strokeLinejoin="round" />
      <circle cx={12} cy={13} r={1} fill="currentColor" />
      <circle cx={10} cy={16.5} r={1} fill="currentColor" />
      <circle cx={14} cy={16.5} r={1} fill="currentColor" />
    </>
  ),
  coffee: (
    <>
      <path {...strokeProps} d="M4 8.5h13v5.5a5.5 5.5 0 0 1-5.5 5.5H9.5A5.5 5.5 0 0 1 4 14V8.5Z" />
      <path {...strokeProps} d="M17 9.5h1.5a2.8 2.8 0 0 1 0 5.5H17" />
      <path {...strokeProps} d="M7 3.5c0 1-1 1-1 2s1 1 1 2M11 3.5c0 1-1 1-1 2s1 1 1 2" />
    </>
  ),
  globe: (
    <>
      <circle {...strokeProps} cx={12} cy={12} r={9} />
      <path {...strokeProps} d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
    </>
  ),
  trophy: (
    <path
      {...strokeProps}
      d="M7 4h10v5a5 5 0 0 1-10 0V4Z M4.5 5.5H7v3a3 3 0 0 1-2.5-3ZM19.5 5.5H17v3a3 3 0 0 0 2.5-3ZM12 14v3M8.5 20.5h7M9.5 17h5l.5 3.5h-6l.5-3.5Z"
    />
  ),
  'chart-bar': (
    <>
      <path {...strokeProps} d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  heart: (
    <path
      {...strokeProps}
      d="M12 20.5s-7.5-4.6-9.8-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.8 5.5c-2.3 4.4-9.8 9-9.8 9Z"
    />
  ),
  fire: (
    <path
      {...strokeProps}
      d="M12 3s3.5 3 3.5 6.5c1.2-.7 1.8-2 1.8-2C19 9.5 20 12 20 14a8 8 0 1 1-16 0c0-2.2 1-4 2.3-5.3.2 1.3 1 2.3 1 2.3-.3-3 1-5.7 4.7-8Z"
    />
  ),
  piano: (
    <>
      <rect {...strokeProps} x={3} y={5.5} width={18} height={13} rx={1.2} />
      <path {...strokeProps} d="M7 5.5v8M11 5.5v8M13.5 5.5v8M17 5.5v8" />
    </>
  ),
  brick: (
    <>
      <rect {...strokeProps} x={3} y={5} width={8} height={6} rx={0.8} />
      <rect {...strokeProps} x={13} y={5} width={8} height={6} rx={0.8} />
      <rect {...strokeProps} x={3} y={13} width={8} height={6} rx={0.8} />
      <rect {...strokeProps} x={13} y={13} width={8} height={6} rx={0.8} />
    </>
  ),
  confetti: (
    <>
      <path {...strokeProps} d="m5 19 14-14" />
      <rect x={5} y={5} width={2.4} height={2.4} fill="currentColor" transform="rotate(20 5 5)" />
      <rect x={15} y={4} width={2.4} height={2.4} fill="currentColor" transform="rotate(-10 15 4)" />
      <rect x={18} y={13} width={2.4} height={2.4} fill="currentColor" transform="rotate(30 18 13)" />
      <circle cx={9} cy={17} r={1.3} fill="currentColor" />
      <circle cx={4} cy={13} r={1.1} fill="currentColor" />
    </>
  ),
  warning: (
    <>
      <path {...strokeProps} d="M12 3.5 22 20H2L12 3.5Z" strokeLinejoin="round" />
      <path {...strokeProps} d="M12 10v4.2M12 17h.01" />
    </>
  ),
  ticket: (
    <path
      {...strokeProps}
      d="M3 9.5a2 2 0 0 0 0-3.9V4.5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1.1a2 2 0 0 0 0 3.9v1.4a2 2 0 0 0 0 3.9v1.1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1.1a2 2 0 0 0 0-3.9V9.5ZM14 4v16"
    />
  ),
  star: (
    <path
      fill="currentColor"
      d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.5l-5.9 3.1 1.3-6.6-4.9-4.6 6.6-.8L12 2.5Z"
    />
  ),
  menu: <path {...strokeProps} d="M4 6.5h16M4 12h16M4 17.5h16" />,
  printer: (
    <>
      <path {...strokeProps} d="M7 8.5V4h10v4.5" />
      <rect {...strokeProps} x={3.5} y={8.5} width={17} height={8} rx={1.4} />
      <path {...strokeProps} d="M7 14h10v6H7v-6Z" />
    </>
  ),
  calendar: (
    <>
      <rect {...strokeProps} x={3.5} y={5} width={17} height={15.5} rx={1.6} />
      <path {...strokeProps} d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </>
  ),
  pin: (
    <>
      <path {...strokeProps} d="M12 21.5s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
      <circle {...strokeProps} cx={12} cy={9.5} r={2.4} />
    </>
  ),
  target: (
    <>
      <circle {...strokeProps} cx={12} cy={12} r={8.5} />
      <circle {...strokeProps} cx={12} cy={12} r={4.8} />
      <circle cx={12} cy={12} r={1.4} fill="currentColor" />
    </>
  ),
  home: <path {...strokeProps} d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z" strokeLinejoin="round" />,
  drum: (
    <>
      <ellipse {...strokeProps} cx={12} cy={7} rx={7.5} ry={3} />
      <path {...strokeProps} d="M4.5 7v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V7" />
      <path {...strokeProps} d="m6 3.5 2 2.3M18 3.5l-2 2.3" />
    </>
  ),
  guitar: (
    <>
      <circle {...strokeProps} cx={8} cy={16} r={4.5} />
      <path {...strokeProps} d="M11 13 17.5 6.5a2 2 0 0 1 3 2.6L15 15" />
      <path {...strokeProps} d="M15.5 4.5 19.5 8.5" />
    </>
  ),
  tv: (
    <>
      <rect {...strokeProps} x={3} y={6} width={18} height={12} rx={1.6} />
      <path {...strokeProps} d="M8 21.5h8M8.5 6l2.5-3M15.5 6 13 3" />
    </>
  ),
  refresh: (
    <path
      {...strokeProps}
      d="M4 4v5h5M20 20v-5h-5M4.5 15a8 8 0 0 0 14.1 2.7M19.5 9A8 8 0 0 0 5.4 6.3"
    />
  ),
  play: <path fill="currentColor" d="M7 4.5v15l13-7.5-13-7.5Z" />,
  pause: (
    <>
      <rect x={6.5} y={4.5} width={4} height={15} rx={1} fill="currentColor" />
      <rect x={13.5} y={4.5} width={4} height={15} rx={1} fill="currentColor" />
    </>
  ),
  logout: (
    <>
      <path {...strokeProps} d="M9 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3" />
      <path {...strokeProps} d="M14 15.5 19 12l-5-3.5" />
      <path {...strokeProps} d="M19 12H9" />
    </>
  ),
}

export default function Icon({ name, className = 'w-[1em] h-[1em]', ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block align-[-0.15em] ${className}`}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
