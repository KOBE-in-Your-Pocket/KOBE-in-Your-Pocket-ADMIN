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
