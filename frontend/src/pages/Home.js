import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import alanBtn from "@alan-ai/alan-sdk-web";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { propertiesAPI, tenantAPI } from "../services/api";
import useAlan from "../hooks/useAlan";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    property_type: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
    bathrooms: "",
    search: "",
  });
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryProperty, setInquiryProperty] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState("");
  const [inquiryError, setInquiryError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const debounceTimeout = useRef(null);
  // Modal for login prompt when favoriting
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if any search filter is active
  const isSearchActive = Object.values(filters).some((v) => v && v !== "");

  // 1. Define handleSearchSubmit FIRST
  const handleSearchSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setSearchLoading(true);
      setSearchError(null);
      try {
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params[key] = value;
        });
        const res = await propertiesAPI.getProperties(params);
        setSearchResults(res.data.results || res.data);
      } catch (err) {
        setSearchError(t("Failed to load properties. Please try again."));
      } finally {
        setSearchLoading(false);
      }
    },
    [filters, t]
  );

  // 2. Alan AI: handle filter commands
  const handleAlanFilterCommand = useCallback(
    (command, data) => {
      if (command === "filter_properties") {
        setFilters((prev) => ({
          ...prev,
          ...(data.property_type && { property_type: data.property_type }),
          ...(data.min_price && { min_price: data.min_price }),
          ...(data.max_price && { max_price: data.max_price }),
          ...(data.search && { search: data.search }),
        }));
      }
      if (command === "clear_filters") {
        setFilters({
          property_type: "",
          min_price: "",
          max_price: "",
          bedrooms: "",
          bathrooms: "",
          search: "",
        });
        setSearchResults([]);
      }
      if (command === "submit_search") {
        handleSearchSubmit({ preventDefault: () => {} });
      }
    },
    [handleSearchSubmit]
  );

  useAlan(handleAlanFilterCommand);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://junub-real-estate.onrender.com/api/properties/listings/",
          {
            params: { ordering: "-created_at", page_size: 6 },
          }
        );
        setFeaturedProperties(res.data.results || res.data);
        setError(null);
      } catch (err) {
        setError(t("Failed to load featured properties. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    const fetchPropertyTypes = async () => {
      try {
        const res = await propertiesAPI.getPropertyTypes();
        setPropertyTypes(
          Array.isArray(res.data.results) ? res.data.results : res.data
        );
      } catch (err) {
        setPropertyTypes([]);
      }
    };

    const fetchFavorites = async () => {
      if (isAuthenticated() && user?.profile?.role === "tenant") {
        try {
          const res = await tenantAPI.getFavorites();
          setFavorites(res.data.results || res.data);
        } catch (err) {
          console.error("Error fetching favorites:", err);
        }
      }
    };

    fetchFeaturedProperties();
    fetchPropertyTypes();
    fetchFavorites();
  }, [t, isAuthenticated, user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Debounced auto-search effect
  useEffect(() => {
    if (!isSearchActive) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params[key] = value;
        });
        const res = await propertiesAPI.getProperties(params);
        setSearchResults(res.data.results || res.data);
      } catch (err) {
        setSearchError(t("Failed to load properties. Please try again."));
      } finally {
        setSearchLoading(false);
      }
    }, 500);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      property_type: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
      bathrooms: "",
      search: "",
    });
    setSearchResults([]);
  };

  const handleOpenInquiry = (property) => {
    setInquiryProperty(property);
    setInquiryMessage("");
    setInquirySuccess("");
    setInquiryError("");
    setShowInquiryModal(true);
  };

  const handleCloseInquiry = () => {
    setShowInquiryModal(false);
    setInquiryProperty(null);
    setInquiryMessage("");
    setInquirySuccess("");
    setInquiryError("");
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    setInquiryLoading(true);
    setInquirySuccess("");
    setInquiryError("");
    try {
      // Replace with your API call for sending inquiry
      // await sendInquiryAPI(inquiryProperty.id, inquiryMessage);
      setInquirySuccess(t("Inquiry sent successfully!"));
      setInquiryMessage("");
    } catch (err) {
      setInquiryError(t("Failed to send inquiry. Please try again."));
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleFavoriteToggle = async (propertyId) => {
    if (!isAuthenticated() || user?.profile?.role !== "tenant") {
      setShowLoginModal(true);
      return;
    }
    try {
      const isFav = isFavorite(propertyId);
      if (isFav) {
        const favoriteToRemove = favorites.find(
          (fav) => fav.house?.id === propertyId || fav.house_id === propertyId
        );
        if (favoriteToRemove && favoriteToRemove.id) {
          await tenantAPI.removeFavorite(favoriteToRemove.id);
          setFavorites(
            favorites.filter((fav) => fav.id !== favoriteToRemove.id)
          );
        }
      } else {
        const res = await tenantAPI.addFavorite(propertyId);
        if (res && res.data) {
          setFavorites([...favorites, res.data]);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some(
      (fav) =>
        fav.house?.id === propertyId ||
        fav.house_id === propertyId ||
        fav.id === propertyId // fallback if API returns just property id
    );
  };

  // --- Alan Custom Button (toggle start/stop) ---
  const alanCustomInstance = useRef(null);
  const [alanActive, setAlanActive] = useState(false);

  const handleAlanCustomClick = () => {
    if (!alanCustomInstance.current) {
      alanCustomInstance.current = window.alanBtn
        ? window.alanBtn({
            key:
              process.env.REACT_APP_ALAN_KEY ||
              "9798b1d6b292342e6db14d79b0741baf2e956eca572e1d8b807a3e2338fdd0dc/stage",
          })
        : alanBtn({
            key: "9798b1d6b292342e6db14d79b0741baf2e956eca572e1d8b807a3e2338fdd0dc/stage",
          });
      window.alanBtnInstance = alanCustomInstance.current;
    }

    if (!alanActive) {
      alanCustomInstance.current.activate();
      alanCustomInstance.current.playText(
        "Hello and welcome to Junub Real Estate. How may I help you today?"
      );
      setAlanActive(true);
    } else {
      alanCustomInstance.current.deactivate();
      setAlanActive(false);
    }
  };

  // Optional: Listen for Alan deactivation to update button state
  useEffect(() => {
    if (!alanCustomInstance.current) return;
    // Alan SDK does not provide a direct event for deactivation,
    // so we rely on our own state for toggling.
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Custom Alan Button (toggle start/stop) */}
      <button
        onClick={handleAlanCustomClick}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-200 border-4 border-white focus:outline-none focus:ring-4 focus:ring-blue-300
          ${
            alanActive
              ? "bg-gradient-to-br from-red-600 to-red-400 hover:from-red-700 hover:to-red-500"
              : "bg-gradient-to-br from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
          }
        `}
        style={{
          boxShadow: "0 4px 24px rgba(25, 118, 210, 0.18)",
          animation: "pulse 2s infinite",
        }}
        aria-label={alanActive ? "Stop Alan Assistant" : "Start Alan Assistant"}
      >
        {alanActive ? (
          // Stop icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Microphone icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.5a6.5 6.5 0 01-6.5-6.5V9a6.5 6.5 0 1113 0v3a6.5 6.5 0 01-6.5 6.5zm0 0v2m-4 0h8"
            />
          </svg>
        )}
      </button>
      {/* ...rest of your code remains unchanged... */}
      {/* Back Arrow */}
      {location.pathname !== "/" && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-20 left-4 z-50 bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="Go back"
        >
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-blue-400 text-white pt-20">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-40"
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Real Estate"
          />
          <div className="absolute inset-0 bg-blue-900 opacity-60"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-28 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-lg">
            {t("Find Your Dream Home in South Sudan")}
          </h1>
          <p className="mt-6 text-xl max-w-2xl mx-auto drop-shadow">
            {t(
              "Discover the perfect property for you with JunubRental. We offer a wide range of properties for rent and sale across South Sudan."
            )}
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative z-10 -mt-16 max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t("Quick Property Search")}
          </h3>
          <form
            onSubmit={handleSearchSubmit}
            className="space-y-6"
            aria-label="Property search form"
          >
            {/* First row: Location/Property Name full width */}
            <div>
              <label
                htmlFor="search"
                className="block text-base font-semibold text-gray-700 mb-1"
              >
                {t("Location or Property Name")}
              </label>
              <input
                type="text"
                name="search"
                id="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder={t("e.g. Juba, Malakia, or property name")}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-md p-3 transition-all duration-200 focus:outline-none focus:ring-2"
                autoComplete="off"
              />
            </div>
            {/* Second row: Property Type and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="property_type"
                  className="block text-base font-semibold text-gray-700 mb-1"
                >
                  {t("Property Type")}
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={filters.property_type}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-md p-3 transition-all duration-200 focus:outline-none focus:ring-2"
                >
                  <option value="">{t("All Types")}</option>
                  {Array.isArray(propertyTypes) &&
                    propertyTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="min_price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("Min Budget")}
                  </label>
                  <input
                    type="number"
                    name="min_price"
                    id="min_price"
                    value={filters.min_price}
                    onChange={handleFilterChange}
                    placeholder={t("Min")}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-md p-3 transition-all duration-200 focus:outline-none focus:ring-2"
                    min="0"
                  />
                </div>
                <div>
                  <label
                    htmlFor="max_price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("Max Budget")}
                  </label>
                  <input
                    type="number"
                    name="max_price"
                    id="max_price"
                    value={filters.max_price}
                    onChange={handleFilterChange}
                    placeholder={t("Max")}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base border-gray-300 rounded-md p-3 transition-all duration-200 focus:outline-none focus:ring-2"
                    min="0"
                  />
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                {isSearchActive ? t("Back to Featured") : t("Clear Filters")}
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 w-full md:w-auto"
              >
                {t("Search Properties")}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Properties Section (shows either search results or featured) */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {isSearchActive ? t("Search Results") : t("Featured Properties")}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {isSearchActive
              ? t("Properties matching your search criteria")
              : t("Discover our handpicked selection of properties")}
          </p>
        </div>

        {searchLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : searchError ? (
          <div
            className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{searchError}</span>
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {(isSearchActive ? searchResults : featuredProperties).map(
                (property) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="group"
                  >
                    <div className="bg-white overflow-hidden shadow-md rounded-lg transition-shadow duration-300 hover:shadow-xl">
                      <div className="relative h-64 w-full overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0].image}
                            alt={property.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">
                              {t("No image available")}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-0 right-0 p-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                              property.property_status === "for_sale"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {property.property_status === "for_sale"
                              ? t("For Sale")
                              : t("For Rent")}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 flex-1">
                            {property.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleFavoriteToggle(property.id);
                            }}
                            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            aria-label={
                              isFavorite(property.id)
                                ? t("Remove from favorites")
                                : t("Add to favorites")
                            }
                          >
                            <svg
                              className={`h-6 w-6 ${
                                isFavorite(property.id)
                                  ? "text-red-500 fill-current"
                                  : "text-gray-400 hover:text-red-500"
                              }`}
                              fill={
                                isFavorite(property.id)
                                  ? "currentColor"
                                  : "none"
                              }
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </button>
                          {/* Login Modal for Favorite (not logged in) - Previous Design, overlays home page */}
                          {showLoginModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in">
                                <button
                                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowLoginModal(false);
                                    navigate("/");
                                  }}
                                  aria-label={t("Close")}
                                >
                                  <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                                <div className="flex flex-col items-center text-center">
                                  <svg
                                    className="h-12 w-12 text-blue-600 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                                    {t("Login Required")}
                                  </h3>
                                  <p className="mb-4 text-gray-600">
                                    {t(
                                      "Please log in to add properties to your favorites and enjoy personalized features."
                                    )}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      navigate("/login");
                                      setShowLoginModal(false);
                                    }}
                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    {t("Login Now")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          {property.location}
                        </p>

                        <p className="mt-2 text-lg font-bold text-blue-600">
                          ${property.price.toLocaleString()}
                          {property.property_status === "for_rent" && (
                            <span className="text-sm font-normal text-gray-500">
                              /{t("month")}
                            </span>
                          )}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            <span>
                              {property.area} {t("sqft")}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M7 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10 0a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1z" />
                            </svg>
                            <span>
                              {property.bedrooms} {t("bd")}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              <path
                                fillRule="evenodd"
                                d="M9 16a1 1 0 102 0v-1a1 1 0 00-1-1H5a2 2 0 01-2-2V7a2 2 0 012-2h1.93a.5.5 0 000-1H5a3 3 0 00-3 3v5a3 3 0 003 3h5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              {property.bathrooms} {t("ba")}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenInquiry(property)}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white rounded-md shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
                          >
                            {t("Contact Agent")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
            {isSearchActive &&
              searchResults.length === 0 &&
              !searchLoading &&
              !searchError && (
                <div className="mt-8 text-center text-lg text-gray-500">
                  {t("No properties found matching your search criteria.")}
                </div>
              )}
          </>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t("View All Properties")}
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t("How It Works")}
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              {t("Find your perfect property in just a few simple steps")}
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  {t("Search")}
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  {t(
                    "Browse our extensive collection of properties and use filters to find exactly what you're looking for."
                  )}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  {t("View")}
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  {t(
                    "Explore detailed property listings with high-quality photos, comprehensive descriptions, and key features."
                  )}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">
                  {t("Contact")}
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  {t(
                    "Connect directly with property owners or agents to schedule viewings or ask questions about the property."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 mt-0">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">{t("Ready to find your dream home?")}</span>
            <span className="block text-blue-200">
              {t("Start browsing our properties today.")}
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/properties"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                {t("Browse Properties")}
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500"
              >
                {t("Create Account")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseInquiry}
              aria-label={t("Close")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {t("Contact Agent for")}: {inquiryProperty?.title}
            </h3>
            <form onSubmit={handleSendInquiry} className="space-y-4">
              <textarea
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder={t("Type your message to the agent...")}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                required
              />
              {inquiryError && (
                <div className="text-red-600 text-sm">{inquiryError}</div>
              )}
              {inquirySuccess && (
                <div className="text-green-600 text-sm">{inquirySuccess}</div>
              )}
              <button
                type="submit"
                disabled={inquiryLoading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {inquiryLoading ? t("Sending...") : t("Send Message")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
