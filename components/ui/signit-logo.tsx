import React from "react";

export interface SignItIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
}

export function SignItIcon({
  size = 40,
  className = "size-10 rounded-xl",
  alt = "SignIt! Logo",
  ...props
}: SignItIconProps) {
  return (
    // Logo SVG statis dari aset publik; optimizer gambar Next tidak diperlukan.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/signit_icon.svg"
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      {...props}
    />
  );
}

export interface SignItLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  height?: number;
}

export function SignItLogo({
  height = 36,
  className = "h-9 w-auto",
  alt = "SignIt! Digital Campus Approval",
  ...props
}: SignItLogoProps) {
  return (
    // Logo SVG statis dari aset publik; optimizer gambar Next tidak diperlukan.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/signit_logo_horizontal.svg"
      alt={alt}
      height={height}
      className={`shrink-0 object-contain ${className}`}
      {...props}
    />
  );
}
export default SignItIcon;
