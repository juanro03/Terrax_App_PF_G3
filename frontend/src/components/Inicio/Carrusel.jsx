// src/components/Inicio/Carrusel.jsx
import React from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const sombraTexto = {
  textShadow: "2px 2px 3px rgba(0, 0, 0, 0.69)",
};

const Carrusel = () => {
  return (
    <Carousel>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/1.jpg"
          //alt="Primera imagen"
          style={{ maxHeight: "400px", objectFit: "cover" }}
        />
        <Carousel.Caption>
          <h3 style={sombraTexto}>Registro de tus lotes</h3>
          <p style={sombraTexto}>
            Registrá tus lotes y llevá un control sobre las campañas realizadas
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/2.jpg"
          style={{ maxHeight: "400px", objectFit: "cover" }}          
        />
        <Carousel.Caption>
          <h3 style={sombraTexto}>Mapeo de Malezas</h3>
          <p style={sombraTexto}>
            Visualizá el estado de tus lotes a través de mapas de malezas desde la pestaña "Reportes"
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/3.jpeg"
          style={{ maxHeight: "400px", objectFit: "cover" }}
        />
        <Carousel.Caption>
          <h3 style={sombraTexto}>Aplicaciones con drones</h3>
          <p style={sombraTexto}>
            Solicitá aplicaciones de agroquímicos o fertilizantes a través del botón "Solicitar Servicio"
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/7.png"
          style={{ maxHeight: "400px", objectFit: "cover" }}
          //alt="Segunda imagen"
        />
        <Carousel.Caption>
          <h3 style={sombraTexto}>Trazabilidad de tus tareas</h3>
          <p style={sombraTexto}>
            Llevá un control detallado de todas las tareas y campañas realizadas en tus lotes 
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
};

export default Carrusel;
