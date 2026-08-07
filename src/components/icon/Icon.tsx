import type { ReactNode } from "react";

export type SvgProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

/** ADMIN-image shared/ui/Icon.tsx と同じ line アイコンのラッパー。 */
function Svg({
  size = 18,
  color = "currentColor",
  strokeWidth = 1.7,
  className,
  children,
}: SvgProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CloseIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  );
}

export function SearchIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={1.8} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </Svg>
  );
}

export function WarningIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </Svg>
  );
}

/** SVG path 一本で表現できるアイコン（サイドバーのナビ用）。 */
export function PathIcon({ path, ...props }: SvgProps & { path: string }) {
  return (
    <Svg {...props}>
      <path d={path} />
    </Svg>
  );
}

export function BellIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}

export function LogoutIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </Svg>
  );
}

export function LockIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

export function EyeIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={1.8} {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function EyeOffIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={1.8} {...props}>
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6A13.3 13.3 0 0 0 2 11s3.5 7 10 7a9.1 9.1 0 0 0 3.4-.66" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M1 1l22 22" />
    </Svg>
  );
}

export function UsersIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87" />
    </Svg>
  );
}

export function UserPlusIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M19 8v6 M22 11h-6" />
    </Svg>
  );
}

/** スポットのサムネイル・地図ピン。 */
export function PinIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </Svg>
  );
}

export function ChatIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function PlusIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function UploadIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={1.5} {...props}>
      <path d="M4 14.9A5 5 0 0 1 6 5a6.5 6.5 0 0 1 12.3 2A4.5 4.5 0 0 1 18 16" />
      <path d="M12 12v9M8 15l4-4 4 4" />
    </Svg>
  );
}

/** 「準備中」セクションのアイコン。 */
export function ToolboxIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={1.5} {...props}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5z" />
    </Svg>
  );
}

/** 一覧が空のときの空状態アイコン。 */
export function EmptyBoxIcon(props: SvgProps) {
  return (
    <Svg strokeWidth={1.4} {...props}>
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </Svg>
  );
}
