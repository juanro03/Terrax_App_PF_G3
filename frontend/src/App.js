import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-4"> {/* Aquí va tu contenido */}</main>
    </div>
  );
}

export default App;
