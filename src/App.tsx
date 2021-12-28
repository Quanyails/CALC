import { HashRouter, Link, Route, Routes } from "react-router-dom";

import CalcPage from "features/calc/CalcPage";

const Sitemap = () => (
  <div>
    <h3>Quanyails&apos;s JavaScript Scripts</h3>
    <ul>
      <li>
        <Link to="calc">CAP Art Legality Checker</Link>
      </li>
    </ul>
  </div>
);

const App = () => (
  <HashRouter>
    <Routes>
      <Route element={<Sitemap />} path="/" />
      <Route element={<CalcPage />} path="/calc" />
    </Routes>
  </HashRouter>
);

export default App;
