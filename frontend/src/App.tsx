import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Schemes } from "./pages/Schemes";
import { SchemeDetails } from "./pages/SchemeDetails";
import { Eligibility } from "./pages/Eligibility";
import { Assistant } from "./pages/Assistant";
import { About } from "./pages/About";
import { Admin } from "./pages/Admin";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/schemes/:id" element={<SchemeDetails />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
