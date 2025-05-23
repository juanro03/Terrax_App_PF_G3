import { useState, useEffect } from "react";
import axios from "axios";
import "./Usuarios.css";
import { useNavigate, useParams } from "react-router-dom";

const FormularioUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    rol: "productor",
    is_active: true,
  });

  const [imagenPerfil, setImagenPerfil] = useState(null);

  useEffect(() => {
    if (isEdit) {
      axios.get(`http://localhost:8000/api/usuarios/${id}/`).then((res) => {
        setFormData({ ...res.data, password: "" });
        setImagenPerfil(null); // no mostramos la imagen actual aquí, solo permite cambiarla
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImagenPerfil(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    for (const key in formData) {
      data.append(key, formData[key]);
    }

    if (imagenPerfil) {
      data.append("imagen_perfil", imagenPerfil); // nombre debe coincidir con models.py
    }

    try {
      if (isEdit) {
        await axios.put(`http://localhost:8000/api/usuarios/${id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Usuario actualizado");
      } else {
        await axios.post("http://localhost:8000/api/usuarios/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Usuario creado");
      }
      navigate("/usuarios");
    } catch (err) {
      console.error("Error al guardar usuario:", err.response?.data || err);
      alert("Error al guardar usuario");
    }
  };

  return (
    <div className="container">
      <h2>{isEdit ? "Editar Usuario" : "Registrar Usuario"}</h2>
      <form
        onSubmit={handleSubmit}
        className="border p-4 bg-light rounded"
        encType="multipart/form-data"
      >
        <div className="mb-3">
          <label>Nombre</label>
          <input
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Apellido</label>
          <input
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Username</label>
          <input
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Rol</label>
          <select
            name="rol"
            className="form-select"
            value={formData.rol}
            onChange={handleChange}
          >
            <option value="productor">Productor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
          />
          <label className="form-check-label" htmlFor="is_active">
            Usuario activo
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          {isEdit ? "Guardar Cambios" : "Crear Usuario"}
        </button>
      </form>
    </div>
  );
};

export default FormularioUsuario;
