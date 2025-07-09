import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { propertiesAPI, tenantAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

const PropertyList = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
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
  const [favorites, setFavorites] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const res = await propertiesAPI.getPropertyTypes();
        setPropertyTypes(
          Array.isArray(res.data.results) ? res.data.results : res.data
        );
      } catch (err) {
        console.error("Error fetching property types:", err);
        setPropertyTypes([]);
      }
    };

    const fetchFavorites = async () => {
      if (isAuthenticated() && user?.profile?.role === 'tenant') {
        try {
          const res = await tenantAPI.getFavorites();
          setFavorites(res.data.results || res.data);
        } catch (err) {
          console.error("Error fetching favorites:", err);
        }
      }
    };

    fetchPropertyTypes();
    fetchFavorites();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = {};
        if (filters.property_type) params.property_type = filters.property_type;
        if (filters.min_price) params.min_price = filters.min_price;
        if (filters.max_price) params.max_price = filters.max_price;
        if (filters.bedrooms) params.bedrooms = filters.bedrooms;
        if (filters.bathrooms) params.bathrooms = filters.bathrooms;
        if (filters.search) params.search = filters.search;
        const res = await propertiesAPI.getProperties(params);
        setProperties(res.data.results || res.data); // Support paginated or non-paginated
        setError(null);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(t("Failed to load properties. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters, t]);

  // On mount and whenever the query string changes, parse query params and set filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters((prev) => ({
      ...prev,
      property_type: params.get("property_type") || "",
      min_price: params.get("min_price") || "",
      max_price: params.get("max_price") || "",
      bedrooms: params.get("bedrooms") || "",
      bathrooms: params.get("bathrooms") || "",
      search: params.get("search") || "",
    }));
  }, [location.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The useEffect will trigger the API call when filters change
  };

  const clearFilters = () => {
    setFilters({
      property_type: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
      bathrooms: "",
      search: "",
    });
  };

  const handleFavoriteToggle = async (propertyId) => {
    if (!isAuthenticated() || user?.profile?.role !== 'tenant') {
      navigate('/login');
      return;
    }

    try {
      const isFavorite = favorites.some(fav => fav.house?.id === propertyId || fav.house_id === propertyId);
      
      if (isFavorite) {
        const favoriteToRemove = favorites.find(fav => fav.house?.id === propertyId || fav.house_id === propertyId);
        await tenantAPI.removeFavorite(favoriteToRemove.id);
        setFavorites(favorites.filter(fav => fav.id !== favoriteToRemove.id));
      } else {
        const res = await tenantAPI.addFavorite(propertyId);
        setFavorites([...favorites, res.data]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some(fav => fav.house?.id === propertyId || fav.house_id === propertyId);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("Find Your Perfect Property")}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {t("Browse our selection of properties for rent and sale")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="col-span-1 md:col-span-3">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("Search")}
                </label>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder={t("Search by location, property name, etc.")}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="property_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("Property Type")}
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={filters.property_type}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
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

              <div>
                <label
                  htmlFor="min_price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("Min Price")}
                </label>
                <input
                  type="number"
                  name="min_price"
                  id="min_price"
                  value={filters.min_price}
                  onChange={handleFilterChange}
                  placeholder={t("Min Price")}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="max_price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("Max Price")}
                </label>
                <input
                  type="number"
                  name="max_price"
                  id="max_price"
                  value={filters.max_price}
                  onChange={handleFilterChange}
                  placeholder={t("Max Price")}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="bedrooms"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("Bedrooms")}
                </label>
                <select
                  id="bedrooms"
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                >
                  <option value="">{t("Any")}</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="bathrooms"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("Bathrooms")}
                </label>
                <select
                  id="bathrooms"
                  name="bathrooms"
                  value={filters.bathrooms}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                >
                  <option value="">{t("Any")}</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("Clear Filters")}
              </button>

              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("Search")}
              </button>
            </div>
          </form>
        </div>

        {/* Property Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">
              {t("No properties found")}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {t("Try adjusting your filters or search criteria")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="group"
              >
                <div className="bg-white overflow-hidden shadow-md rounded-lg transition-shadow duration-300 hover:shadow-xl">
                  <div className="relative h-48 w-full overflow-hidden">
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

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 flex-1">
                        {property.title}
                      </h3>
                      {isAuthenticated() && user?.profile?.role === 'tenant' && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleFavoriteToggle(property.id);
                          }}
                          className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                          aria-label={isFavorite(property.id) ? t('Remove from favorites') : t('Add to favorites')}
                        >
                          <svg
                            className={`h-6 w-6 ${isFavorite(property.id) ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`}
                            fill={isFavorite(property.id) ? 'currentColor' : 'none'}
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
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {property.location}
                    </p>

                    <p className="mt-2 text-lg font-bold text-blue-600">
                      ${property.price.toLocaleString()}
                      {property.property_status === "for_rent" && (
                        <span className="text-sm font-normal text-gray-500">
                          /month
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
