import React from "react";
import Image from "next/image";
import Link from "next/link";

const Logo = React.memo(function Logo() {
  return (
    <Link href="/" className="inline-block">
      <Image
        src="/logo/01.png"
        alt="Logo Tuệ Nhân Shop"
        width={180}
        height={120}
        priority
      />
    </Link>
  );
});

export default Logo;
