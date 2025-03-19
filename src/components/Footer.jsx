import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        Contacto:{" "}
        <a
          href="mailto:soporte@vault4pos.com"
          style={{ color: "#3498db", textDecoration: "none" }}
        >
          soporte@vault4pos.com
        </a>
      </p>
      <p>&copy; 2023 Vault 4 POS. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;
