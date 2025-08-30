import React from "react";
import Image from "next/image";
import Link from "next/link";

const Logo = React.memo(function Logo() {
  return (
    <Link href="/" className="inline-block">
      <Image
        src="/logo/01.png"
        alt="Logo Tuệ Nhân Shop"
        width={120}
        height={80}
        priority
      />
    </Link>
  );
});

export default Logo;
