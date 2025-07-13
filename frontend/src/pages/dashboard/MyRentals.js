import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const MyRentals = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState("favorites");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      setLoading(true);
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        // Fetch favorites
        const favoritesRes = await axios.get(
          "https://junub-real-estate.onrender.com/api/properties/favorites/",
          { headers }
        );
        setFavorites(favoritesRes.data.results || favoritesRes.data);

        // Fetch inquiries
        const inquiriesRes = await axios.get(
          "https://junub-real-estate.onrender.com/api/properties/inquiries/",
          { headers }
        );
        setInquiries(inquiriesRes.data.results || inquiriesRes.data);

        setError(null);
      } catch (err) {
        console.error("Error fetching tenant data:", err);
        setError(t("Failed to load your data. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTenantData();
    }
  }, [t, user]);

  const handleRemoveFavorite = async (id) => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      await axios.delete(
        `https://junub-real-estate.onrender.com/api/properties/favorites/${id}/`,
        { headers }
      );

      // Update state
      setFavorites(favorites.filter((fav) => fav.id !== id));
    } catch (err) {
      console.error("Error removing favorite:", err);
      setError(t("Failed to remove favorite. Please try again."));
    }
  };

  const renderFavorites = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("My Favorite Properties")}
      </h2>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            const property = favorite.house;
            return (
              <div
                key={favorite.id}
                className="bg-white overflow-hidden shadow-md rounded-lg"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0].image}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">
                      {t("No image available")}
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
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

                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("View Details")}
                    </Link>
                    <button
                      onClick={() => {
                        // Create inquiry functionality
                        const message = prompt(
                          t("Enter your inquiry message:")
                        );
                        if (message) {
                          const headers = {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          };

                          axios
                            .post(
                              "https://junub-real-estate.onrender.com/api/properties/inquiries/",
                              {
                                house_id: property.id,
                                message,
                              },
                              { headers }
                            )
                            .then((response) => {
                              // Add to local inquiries state
                              setInquiries([...inquiries, response.data]);
                              alert(t("Inquiry sent successfully!"));
                            })
                            .catch((err) => {
                              console.error("Error sending inquiry:", err);
                              alert(
                                t("Failed to send inquiry. Please try again.")
                              );
                            });
                        }
                      }}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {t("Contact Agent")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

  const renderInquiries = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("My Property Inquiries")}
      </h2>

      {inquiries.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="mb-4 md:mb-0 md:mr-6 flex-grow">
                    <div className="flex items-center mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inquiry.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : inquiry.status === "responded"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {inquiry.status === "pending"
                          ? t("Pending")
                          : inquiry.status === "responded"
                          ? t("Responded")
                          : t("Closed")}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {t("Property: {{title}}", { title: inquiry.house.title })}
                    </h3>

                    <p className="text-sm text-gray-500 mb-3">
                      {t("Agent: {{name}}", { name: inquiry.agent_name })}
                    </p>

                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-700">{inquiry.message}</p>
                    </div>

                    {inquiry.response && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {t("Response:")}
                        </p>
                        <p className="text-sm text-gray-700">
                          {inquiry.response}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <Link
                      to={`/properties/${inquiry.house.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("View Property")}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("You haven't made any inquiries yet")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("Find a property you're interested in and contact the agent.")}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("My Rentals")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("Manage your favorite properties and inquiries")}
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
              onClick={() => setActiveTab("favorites")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "favorites"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("My Favorites")}
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "inquiries"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("My Inquiries")}
            </button>
          </nav>
        </div>

        {activeTab === "favorites" && renderFavorites()}
        {activeTab === "inquiries" && renderInquiries()}
      </div>
    </div>
  );
};

export default MyRentals;
