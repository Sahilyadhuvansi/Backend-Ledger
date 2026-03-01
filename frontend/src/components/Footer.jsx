import React from "react";

const Footer = () => (
  <footer className="w-full py-4 bg-gray-900 text-center text-gray-400 text-sm mt-auto">
    &copy; {new Date().getFullYear()} Ledger App. All rights reserved.
  </footer>
);

export default Footer;
