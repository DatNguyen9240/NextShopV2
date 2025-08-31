import React from "react";

const SignUpButton = React.memo(function SignUpButton() {
  return (
    <button className="bg-black text-white rounded-lg px-6 py-2 font-semibold text-base ml-4 hover:bg-gray-900 transition-colors whitespace-nowrap">
      Đăng ký
    </button>
  );
});

export default SignUpButton;
