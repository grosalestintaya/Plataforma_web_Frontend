function Titulo() {
  const nombre = "chanchito feliz";
  if (nombre) {
    return <h1>hola {nombre}</h1>;
  }
  return <h1>hola mundo</h1>;
}
export default Titulo;
