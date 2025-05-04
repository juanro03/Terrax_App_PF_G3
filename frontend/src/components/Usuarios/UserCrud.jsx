import { useState } from "react";
import axios from "axios";

const UserCrud = () => {
  const [formType, setFormType] = useState(null); // create, edit, delete
  const [deleteOption, setDeleteOption] = useState("id");
  const [deleteValue, setDeleteValue] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    username: "",
    email: "",
    password: "",
    rol: "productor",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForm = (type) => {
    setFormType(type);
    setDeleteOption("id");
    setDeleteValue("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/usuarios/",
        formData
      );
      alert("Usuario creado exitosamente");
      setFormData({
        nombre: "",
        apellido: "",
        username: "",
        email: "",
        password: "",
        rol: "productor",
      });
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Error al crear el usuario");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      if (deleteOption === "username") {
        await axios.delete(
          `http://localhost:8000/api/usuarios/delete-by-username/${deleteValue}/`
        );
      } else {
        await axios.delete(
          `http://localhost:8000/api/usuarios/${deleteValue}/`
        );
      }

      alert("Usuario eliminado exitosamente");
      setDeleteValue("");
    } catch (error) {
      console.error(
        "Error al eliminar:",
        error.response?.data || error.message
      );
      alert("Error al eliminar el usuario");
    }
  };

  return (
    <div>
      {/* Botones CRUD */}
      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-success"
          onClick={() => handleForm("create")}
        >
          Crear
        </button>
        <button className="btn btn-primary" onClick={() => handleForm("edit")}>
          Editar
        </button>
        <button className="btn btn-danger" onClick={() => handleForm("delete")}>
          Eliminar
        </button>
      </div>

      {/* Formulario Crear / Editar */}
      {(formType === "create" || formType === "edit") && (
        <form
          className="border p-3 rounded bg-light mb-3"
          onSubmit={handleSubmit}
        >
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              className="form-control"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nombre de Usuario</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
            >
              <option value="productor">Productor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            {formType === "create" ? "Registrar Usuario" : "Actualizar Usuario"}
          </button>
        </form>
      )}

      {/* Formulario Eliminar */}
      {formType === "delete" && (
        <form
          className="border p-3 rounded bg-light mb-3"
          onSubmit={handleDelete}
        >
          <div className="mb-3">
            <label className="form-label">Eliminar usuario por:</label>
            <select
              className="form-select"
              value={deleteOption}
              onChange={(e) => setDeleteOption(e.target.value)}
            >
              <option value="id">ID</option>
              <option value="username">Nombre de Usuario</option>
              {/* A futuro podrías implementar por username o email */}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">
              {deleteOption === "id" ? "Ingrese el ID" : "Ingrese el valor"}
            </label>
            <input
              type="text"
              className="form-control"
              value={deleteValue}
              onChange={(e) => setDeleteValue(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-danger">
            Eliminar
          </button>
        </form>
      )}
    </div>
  );
};

export default UserCrud;
