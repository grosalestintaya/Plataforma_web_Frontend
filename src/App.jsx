import React from "react";
import Titulo from "./Components/Titulo";
import SideBar from "./layouts/SideBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound/NotFoud";
import Introduction from "./pages/Introduction/Introduction";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SideBar />} />
        <Route path="/login" element={<div>login</div>} />
        <Route path="/i" element={<Introduction />} />
        <Route path="/Module_1" element={<div>contenido modulo 1</div>} />
        <Route path="/Module_2" element={<div>contenido modulo 2</div>} />
        <Route path="/Module_3" element={<div>contenido modulo 3</div>} />
        <Route path="/Module_4" element={<div>contenido modulo 4</div>} />
        <Route path="/Module_5" element={<div>contenido modulo 5</div>} />
        <Route path="/Module_6" element={<div>contenido modulo 6</div>} />
        {/* <Route path="por_definir" element={<div> </div>} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
