// src/components/Inicio/Carrusel.jsx
import React from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

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
          <h3>Registro de tus lotes</h3>
          <p>
            Mantené un historial en tiempo real de las tareas realizadas en cada
            uno de tus lotes
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/2.jpg"
          style={{ maxHeight: "400px", objectFit: "cover" }}
          //alt="Segunda imagen"
        />
        <Carousel.Caption>
          <h3>Mapeo de Malezas</h3>
          <p>
            Mapeo exhaustivo de malezas con tecnología Marrón sobre Verde,
            permitiendo identificar con precisión su distribución en el lote. .
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
          <h3>Pulverización Variable con Maquina</h3>
          <p>
            Preparamos la prescripción exacta para la maquinaria o monitor a
            usar, a partir del mapeo multiespectral, lo que permite la
            aplicación fitosanitaria exactamente donde el cultivo lo necesita,
            optimizando insumos y reduciendo costos.{" "}
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
          <h3>Procesamiento de mapas de Rinde</h3>
          <p>
            Conocer el rendimiento de cada zona ayuda a planificar mejor la
            próxima campaña y maximizar tu producción. Nosotros preparamos el
            monitor antes de la cosecha y nos encargamos del post-procesamiento
            e informe.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
};

export default Carrusel;
