import { useState, useEffect, useContext, useMemo } from "react";
import {
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import ProductCard, { ProductCardSkeleton } from "../features/product/components/ProductCard";
import ProductModal from "../features/product/components/ProductModal";
import { CartContext } from "../context/CartContext";
import { getAllProducts } from "../services/productService";
import { motion } from "framer-motion";
import CountdownTimer from "../components/CountdownTimer";

const PRODUCTS_PER_PAGE = 10;
const RECENTLY_VIEWED_LIMIT = 5;

function Home() {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const category = searchParams.get("category") || "";
  const priceRange = Number(searchParams.get("price")) || 1000000;

  useEffect(() => {
  document.title = "Qyro - Elevate Your Style";
}, []);

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const syncRecentlyViewed = () => {
      try {
        const storedRecentlyViewed =
          JSON.parse(localStorage.getItem("recentlyViewedProducts")) || [];
        setRecentlyViewed(storedRecentlyViewed.slice(0, RECENTLY_VIEWED_LIMIT));
      } catch (error) {
        console.error("Recently viewed read error:", error);
        setRecentlyViewed([]);
      }
    };

    syncRecentlyViewed();
  }, [location.pathname]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedRecentlyViewed =
          JSON.parse(localStorage.getItem("recentlyViewedProducts")) || [];
        setRecentlyViewed(storedRecentlyViewed.slice(0, RECENTLY_VIEWED_LIMIT));
      } catch (error) {
        console.error("Recently viewed storage sync error:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const deals = useMemo(() => products.filter((p) => p.isDeal).slice(0, 4), [products]);

  const banners = useMemo(
    () => products.filter((p) => p.bannerType === "main"),
    [products]
  );

  const leftBanners = useMemo(
    () => products.filter((p) => p.bannerType === "left"),
    [products]
  );

  const rightBanners = useMemo(
    () => products.filter((p) => p.bannerType === "right"),
    [products]
  );

  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentLeftBanner, setCurrentLeftBanner] = useState(0);
  const [currentRightBanner, setCurrentRightBanner] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    if (leftBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentLeftBanner((prev) => (prev + 1) % leftBanners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [leftBanners]);

  useEffect(() => {
    if (rightBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRightBanner((prev) => (prev + 1) % rightBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [rightBanners]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) =>
        category ? p.category.toLowerCase() === category.toLowerCase() : true
      )
      .filter((p) => p.price <= priceRange)
      .sort((a, b) => {
        if (sort === "low") return a.price - b.price;
        if (sort === "high") return b.price - a.price;
        return 0;
      });
  }, [products, search, category, priceRange, sort]);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [search, sort, category, priceRange]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  const goToProductDetails = (product) => {
    navigate(`/product/${product._id}`, {
      state: { product },
    });
  };

  const openModal = (product) => {
    if (product?.variants && product.variants.length > 0) {
      goToProductDetails(product);
      return;
    }
    setSelectedProduct(product);
  };

  const closeModal = () => setSelectedProduct(null);

  const handleBannerClick = (product) => {
    if (!product) return;

    if (product?.variants && product.variants.length > 0) {
      goToProductDetails(product);
      return;
    }

    addToCart(product);
    navigate("/cart");
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-5 sm:py-6 md:px-6">
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div
          onClick={() => handleBannerClick(leftBanners[currentLeftBanner])}
          className="relative h-[220px] cursor-pointer overflow-hidden rounded-2xl bg-[#140427] group sm:h-[260px] md:h-[400px]"
        >
          <img
            src={
              leftBanners[currentLeftBanner]?.image ||
              "https://via.placeholder.com/500x300"
            }
            alt="left-side-banner"
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-4 left-4 z-10 text-white">
            <h3 className="text-lg font-semibold">
              {leftBanners[currentLeftBanner]?.name || "Featured"}
            </h3>
            <p className="text-xs text-gray-200">
              {leftBanners[currentLeftBanner]?.price
                ? `Starting at ₹${leftBanners[currentLeftBanner].price}`
                : "Best pick"}
            </p>
          </div>
        </div>

        <div
          onClick={() => handleBannerClick(banners[currentBanner])}
          className="relative h-[240px] cursor-pointer overflow-hidden rounded-2xl bg-[#140427] group md:col-span-2 sm:h-[280px] md:h-[400px]"
        >
          {loading && <div className="h-full w-full animate-pulse bg-gray-800" />}

          <img
            src={
              banners[currentBanner]?.image ||
              "https://via.placeholder.com/1200x400"
            }
            alt="banner"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2 space-y-3 text-white sm:left-8">
            <h2 className="text-xl font-bold sm:text-2xl md:text-4xl">
              Big Festive Sale 🎉
            </h2>
            <p className="text-xs text-gray-200 sm:text-sm md:text-base">
              Up to 60% OFF on top brands
            </p>
            <button className="btn-primary mt-2">Shop Now</button>
          </div>

          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {banners.map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBanner(i);
                  }}
                  className={`h-3 w-3 cursor-pointer rounded-full ${
                    i === currentBanner ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div
          onClick={() => handleBannerClick(rightBanners[currentRightBanner])}
          className="relative h-[220px] cursor-pointer overflow-hidden rounded-2xl bg-[#140427] group sm:h-[260px] md:h-[400px]"
        >
          <img
            src={
              rightBanners[currentRightBanner]?.image ||
              "https://via.placeholder.com/500x300"
            }
            alt="right-side-banner"
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute bottom-4 left-4 z-10 text-white">
            <h3 className="text-lg font-semibold">
              {rightBanners[currentRightBanner]?.name || "New Arrivals"}
            </h3>
            <p className="text-xs text-gray-200">
              {rightBanners[currentRightBanner]?.price
                ? `Starting at ₹${rightBanners[currentRightBanner].price}`
                : "Starting at ₹999"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-bold text-white">
    Grab or Gone 🔥
  </h2>

  <span className="text-sm text-red-400 animate-pulse">
    Limited deals
  </span>
</div>

{/* CONTAINER */}
<div className="rounded-2xl bg-[#140427]/60 backdrop-blur-xl border border-white/10 p-4">

  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

    {deals.map((item, index) => (
      <div
        key={item._id}
        onClick={() => handleBannerClick(item)}
        className={`group relative cursor-pointer rounded-xl overflow-hidden 
        bg-[#1a1035]/60 border border-white/10 
        hover:border-yellow-400/30 transition-all duration-300 hover:-translate-y-1
        ${index === 0 ? "ring-2 ring-yellow-400/40 scale-[1.02]" : ""}`}
      >

        {/* 🔥 BADGE */}
        <span className="absolute top-2 left-2 z-10 text-[10px] px-2 py-1 rounded-full 
        bg-red-500/30 border border-red-400/30 backdrop-blur-sm">
          Ends Soon
        </span>

        {/* IMAGE */}
        <div className="h-36 w-full overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        {/* CONTENT */}
        <div className="p-3">

          <p className="text-sm font-medium text-gray-200 truncate">
            {item.name}
          </p>

          {/* PRICE + TIMER */}
          <div className="flex items-center justify-between mt-2">

            <span className="text-white font-bold text-sm">
              ₹{item.price}
            </span>

            <div className="text-[11px] text-red-400 bg-purple-500/20 px-2 py-1 rounded-md border border-red-400/20">
              <CountdownTimer targetDate="2026-04-01T23:59:59" />
            </div>

          </div>

        </div>
      </div>
    ))}

    </div>
  </div>
</div>

      {recentlyViewed.length > 0 && (
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg text-white md:text-xl">
              Recently Viewed
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Check out your recently viewed products.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recentlyViewed.map((product, index) => (
              <div
                key={`${product._id}-${index}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard
                  product={product}
                  addToCart={addToCart}
                  openModal={openModal}
                  compact
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
  <div
    key={i}
    className="animate-fade-in"
    style={{ animationDelay: `${i * 0.05}s` }}
  >
    <ProductCardSkeleton />
  </div>
))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <span className="mb-4 text-5xl">🔍</span>
          <p className="text-lg font-medium text-gray-400">No products found.</p>
          <p className="mt-1 text-sm text-gray-300">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleProducts.map((product, index) => (
  <motion.div
    key={`${product._id}-${index}`}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.05 }}
    viewport={{ once: true }}
  >
    <ProductCard
      product={product}
      addToCart={addToCart}
      openModal={openModal}
    />
  </motion.div>
))}
          </div>

          {hasMoreProducts && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="rounded-full bg-gradient-to-r from-purple-500 to-purple-700 px-6 py-3 font-semibold text-white transition hover:scale-105"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

      <ProductModal
        product={selectedProduct}
        closeModal={closeModal}
        addToCart={addToCart}
      />
    </div>
  );
}

export default Home;