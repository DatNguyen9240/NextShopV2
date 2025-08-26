import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 mt-8 py-4">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <small className="text-gray-500">
          &copy; {new Date().getFullYear()} NextShop. All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;
