import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Home = () => {
  const { t } = useTranslation();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setLoading(true);
      try {
        // Fetch featured properties from backend (e.g., filter by a 'featured' flag or just get latest)
        const res = await axios.get(
          "http://127.0.0.1:8000/api/properties/listings/",
          {
            params: { ordering: "-created_at", page_size: 6 },
          }
        );
        setFeaturedProperties(res.data.results || res.data); // If paginated, use .results
        setError(null);
      } catch (err) {
        console.error("Error fetching featured properties:", err);
        setError(t("Failed to load featured properties. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, [t]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Real Estate"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-70"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("Find Your Dream Home in South Sudan")}
          </h1>
          <p className="mt-6 text-xl text-white max-w-3xl">
            {t(
              "Discover the perfect property for you with JunubRental. We offer a wide range of properties for rent and sale across South Sudan."
            )}
          </p>
          <div className="mt-10 max-w-xl">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {t("Quick Search")}
                </h3>
                <form className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("Location")}
                    </label>
                    <select
                      id="location"
                      name="location"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">{t("All Locations")}</option>
                      <option value="juba">Juba</option>
                      <option value="wau">Wau</option>
                      <option value="malakal">Malakal</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="property_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("Property Type")}
                    </label>
                    <select
                      id="property_type"
                      name="property_type"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">{t("All Types")}</option>
                      <option value="apartment">{t("Apartment")}</option>
                      <option value="house">{t("House")}</option>
                      <option value="villa">{t("Villa")}</option>
                      <option value="land">{t("Land")}</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("Status")}
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">{t("All")}</option>
                      <option value="for_rent">{t("For Rent")}</option>
                      <option value="for_sale">{t("For Sale")}</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="bedrooms"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("Bedrooms")}
                    </label>
                    <select
                      id="bedrooms"
                      name="bedrooms"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">{t("Any")}</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Link
                      to="/properties"
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("Search Properties")}
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t("Featured Properties")}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {t("Discover our handpicked selection of properties")}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div
            className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
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
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {property.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
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

        <div className="mt-12 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t("View All Properties")}
          </Link>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
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
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
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
      </div>
    </div>
  );
};

export default Home;
