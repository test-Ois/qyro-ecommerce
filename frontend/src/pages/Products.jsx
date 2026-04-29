import { useEffect } from "react";
import Home from "./Home";

function Products() {
  useEffect(() => {
    document.title = "Qyro Products";
  }, []);

  return <Home />;
}

export default Products;
