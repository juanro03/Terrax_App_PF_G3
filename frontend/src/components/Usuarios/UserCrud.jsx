import { useState } from "react";

const UserCrud = () => {
  const [formType, setFormType] = useState(null); // create, edit, delete, refresh
  const [deleteOption, setDeleteOption] = useState("id");
  const [deleteValue, setDeleteValue] = useState("");

  const handleForm = (type) => {
    setFormType(type);
    setDeleteOption("id");
    setDeleteValue("");
  };

  const handleDelete = (e) => {
    e.preventDefault();
    // Aquí podrías llamar a tu backend con deleteValue y deleteOption
    console.log(`Eliminar por ${deleteOption}:`, deleteValue);
  };

  return (
    <div>
      {/* Botones CRUD */}
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={() => handleForm("create")}>Crear</button>
        <button className="btn btn-primary" onClick={() => handleForm("edit")}>Editar</button>
        <button className="btn btn-danger" onClick={() => handleForm("delete")}>Eliminar</button>
      </div>

      {/* Crear o Editar */}
      {(formType === "create" || formType === "edit") && (
        <form className="border p-3 rounded bg-light mb-3">
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input type="text" className="form-control" placeholder="Juan" />
          </div>
          <div className="mb-3">
            <label className="form-label">Apellido</label>
            <input type="text" className="form-control" placeholder="Pérez" />
          </div>
          <div className="mb-3">
            <label className="form-label">Nombre de Usuario</label>
            <input type="text" className="form-control" placeholder="juanperez123" />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="juan@mail.com" />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-control" placeholder="********" />
          </div>
          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select className="form-select">
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            {formType === "create" ? "Registrar Usuario" : "Actualizar Usuario"}
          </button>
        </form>
      )}

      {/* Eliminar */}
      {formType === "delete" && (
        <form className="border p-3 rounded bg-light mb-3" onSubmit={handleDelete}>
          <div className="mb-3">
            <label className="form-label">Eliminar usuario por:</label>
            <select
              className="form-select"
              value={deleteOption}
              onChange={(e) => setDeleteOption(e.target.value)}
            >
              <option value="id">ID</option>
              <option value="username">Nombre de Usuario</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">
              {deleteOption === "id"
                ? "Ingrese el ID"
                : deleteOption === "username"
                ? "Ingrese el nombre de usuario"
                : "Ingrese el email"}
            </label>
            <input
              type={deleteOption === "email" ? "email" : "text"}
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
