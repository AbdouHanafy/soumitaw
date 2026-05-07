import { Suspense, lazy, useEffect, useState } from "react";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";

const Map = lazy(() => import("./pages/Map.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const SubmitPrice = lazy(() => import("./pages/SubmitPrice.jsx"));

export default function App() {
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "/");

  useEffect(() => {
    function handleHashChange() {
      setRoute(window.location.hash.replace("#", "") || "/");
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  let page = <Home />;
  if (route === "/map") page = <Map />;
  if (route === "/submit") page = <SubmitPrice />;
  if (route === "/profile") page = <Profile />;
  if (route.startsWith("/product/")) {
    const productId = route.replace("/product/", "");
    page = <ProductDetail productId={productId} />;
  }

  return (
    <>
      <Navbar currentPath={route} />
      <Suspense fallback={<main className="page-shell"><section className="panel"><p>Chargement...</p></section></main>}>
        {page}
      </Suspense>
    </>
  );
}
