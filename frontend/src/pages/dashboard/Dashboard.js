import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("overview");
  const [userProperties, setUserProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch user properties and favorites from backend
        const propertiesRes = await axios.get(
          "http://127.0.0.1:8000/api/properties/listings/my_properties/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserProperties(propertiesRes.data.results || propertiesRes.data);
        const favoritesRes = await axios.get(
          "http://127.0.0.1:8000/api/properties/favorites/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFavorites(favoritesRes.data.results || favoritesRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(t("Failed to load your data. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [t]);

  const handleRemoveFavorite = async (id) => {
    try {
      // In a real application, you would call the API
      // await axios.delete(`/properties/favorites/${id}/`);

      // Update state
      setFavorites(favorites.filter((fav) => fav.id !== id));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  const renderOverview = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("Dashboard Overview")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("My Properties")}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userProperties.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("properties")}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            {t("View all")} →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("Favorites")}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {favorites.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("favorites")}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            {t("View all")} →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("Account Age")}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {user?.date_joined
                  ? Math.floor(
                      (new Date() - new Date(user.date_joined)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}{" "}
                {t("days")}
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 inline-block"
          >
            {t("View profile")} →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {t("Recent Properties")}
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {userProperties.length > 0 ? (
            userProperties.slice(0, 3).map((property) => (
              <div key={property.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        {property.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {property.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        property.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {property.status === "active"
                        ? t("Active")
                        : t("Pending")}
                    </span>
                    <Link
                      to={`/properties/${property.id}`}
                      className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {t("View")}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              {t("You have not added any properties yet.")}
            </div>
          )}
        </div>

        {userProperties.length > 0 && (
          <div className="px-6 py-4 bg-gray-50">
            <button
              onClick={() => setActiveTab("properties")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t("View all properties")} →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProperties = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("My Properties")}
        </h2>
        <Link
          to="/properties/add"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {t("Add Property")}
        </Link>
      </div>

      {userProperties.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("Property")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("Status")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("Price")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("Date Added")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userProperties.map((property) => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {property.status === "active"
                          ? t("Active")
                          : t("Pending")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${property.price.toLocaleString()}
                        {property.property_status === "for_rent" && (
                          <span className="text-xs text-gray-500">/month</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.property_status === "for_sale"
                          ? t("For Sale")
                          : t("For Rent")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(property.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/properties/${property.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        {t("View")}
                      </Link>
                      <Link
                        to={`/properties/edit/${property.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        {t("Edit")}
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        {t("Delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("No properties")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("Get started by adding a new property.")}
          </p>
          <div className="mt-6">
            <Link
              to="/properties/add"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {t("Add Property")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("My Favorites")}
      </h2>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((property) => (
            <div
              key={property.id}
              className="bg-white overflow-hidden shadow-md rounded-lg"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">{t("No image available")}</span>
                <button
                  onClick={() => handleRemoveFavorite(property.id)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md hover:bg-red-100"
                >
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {property.title}
                </h3>

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

                <div className="mt-4">
                  <Link
                    to={`/properties/${property.id}`}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t("View Details")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("No favorites")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("Browse properties and add them to your favorites.")}
          </p>
          <div className="mt-6">
            <Link
              to="/properties"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t("Browse Properties")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("Dashboard")}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("Welcome back")}, {user?.first_name || t("User")}!
          </p>
        </div>

        {error && (
          <div
            className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("Overview")}
            </button>
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "properties"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("My Properties")}
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "favorites"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("Favorites")}
            </button>
          </nav>
        </div>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "properties" && renderProperties()}
        {activeTab === "favorites" && renderFavorites()}
      </div>
    </div>
  );
};

export default Dashboard;
