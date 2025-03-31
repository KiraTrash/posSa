import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="copyright">
        © {new Date().getFullYear()} Vault 4 POS. Todos los derechos reservados.
      </div>
      <div className="version">
        v1.0.0
      </div>
    </footer>
  );
};

export default Footer;