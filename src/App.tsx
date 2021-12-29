import { HashRouter, Link, Route, Routes } from "react-router-dom";

import CalcPage from "features/calc/CalcPage";
import QedPage from "features/qed/QedPage";

const Sitemap = () => (
  <div>
    <h3>Quanyails&apos;s JavaScript Scripts</h3>
      <ul>
        <li>
          <Link to="calc">CAP Art Legality Checker</Link>
        </li>
        <li>
          <Link to="qed">Edge Detection</Link>
        </li>
      </ul>
  </div>
);

const App = () => (
  <HashRouter>
    <Routes>
      <Route element={<Sitemap />} path="/" />
      <Route element={<CalcPage />} path="/calc" />
      <Route element={<QedPage />} path="/qed" />
    </Routes>
  </HashRouter>
);

export default App;
