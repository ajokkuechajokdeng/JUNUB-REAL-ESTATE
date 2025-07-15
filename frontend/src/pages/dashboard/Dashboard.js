import React, { useState, useEffect, useContext } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { propertiesAPI } from "../../services/api";

const Dashboard = () => {
  // Floating voice command banner state
  const [showVoiceBanner, setShowVoiceBanner] = useState(true);
  // Floating Voice Command Banner (tenant only)
  const VoiceCommandBanner = () => (
    <div
      className="fixed z-50 top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in"
      style={{
        minWidth: 320,
        maxWidth: "90vw",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      }}
      role="alert"
    >
      <span className="inline-flex items-center justify-center bg-white bg-opacity-20 rounded-full p-2 mr-2">
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v2m0 0c-3.314 0-6-2.686-6-6h2a4 4 0 008 0h2c0 3.314-2.686 6-6 6zm0 0V4a4 4 0 018 0v8a4 4 0 01-8 0V4"
          />
        </svg>
      </span>
      <div className="flex-1">
        <span className="font-semibold">Voice Command Enabled</span>
        <span className="block text-sm opacity-90">
          You can use voice commands to navigate and search property. Try saying{" "}
          <span className="font-bold">"I want property"</span> or{" "}
          <span className="font-bold">"go to home page"</span>.
        </span>
      </div>
      <button
        onClick={() => setShowVoiceBanner(false)}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Dismiss voice command banner"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: Log user object when component mounts
  console.log("Dashboard mounted, user:", user);
  console.log("User role:", user?.profile?.role);

  const [activeTab, setActiveTab] = useState("overview");
  const [userProperties, setUserProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [respondingInquiryId, setRespondingInquiryId] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        // Debug: Log user role before fetching data
        console.log("Fetching data for user role:", user?.profile?.role);

        // Fetch different data based on user role
        if (user?.profile?.role === "tenant") {
          // For tenants: fetch favorites and recommendations
          const favoritesRes = await axios.get(
            "http://127.0.0.1:8000/api/properties/favorites/",
            { headers }
          );
          setFavorites(favoritesRes.data.results || favoritesRes.data);

          // Fetch recommended properties based on favorites
          const recommendationsRes = await axios.get(
            "http://127.0.0.1:8000/api/properties/favorites/recommended/",
            { headers }
          );
          setRecommendations(
            recommendationsRes.data.results || recommendationsRes.data
          );

          // Fetch tenant's inquiries
          const inquiriesRes = await axios.get(
            "http://127.0.0.1:8000/api/properties/inquiries/",
            { headers }
          );
          setInquiries(inquiriesRes.data.results || inquiriesRes.data);
        } else if (user?.profile?.role === "agent") {
          // Debug: Log that we're in the agent branch
          console.log("Fetching data for agent role");

          // For agents: fetch properties and inquiries
          const propertiesRes = await axios.get(
            "http://127.0.0.1:8000/api/properties/listings/agent_properties/",
            { headers }
          );
          console.log("Agent properties:", propertiesRes.data);
          setUserProperties(propertiesRes.data.results || propertiesRes.data);

          // Fetch inquiries about agent's properties
          const inquiriesRes = await axios.get(
            "http://127.0.0.1:8000/api/properties/inquiries/",
            { headers }
          );
          console.log("Agent inquiries:", inquiriesRes.data);
          setInquiries(inquiriesRes.data.results || inquiriesRes.data);
        } else {
          // Debug: Log if we're not in any role branch
          console.log("User role not recognized:", user?.profile?.role);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        // Show backend error message if available
        let backendMsg =
          err?.response?.data?.detail || err?.response?.data?.message;
        setError(
          backendMsg
            ? t(backendMsg)
            : t("Failed to load your data. Please try again.")
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [t, user]);

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

  // Handle property deletion for agents
  const handleDeleteProperty = async (id) => {
    if (!window.confirm(t("Are you sure you want to delete this property?")))
      return;
    try {
      await propertiesAPI.deleteProperty(id);
      setUserProperties((prev) =>
        prev.filter((property) => property.id !== id)
      );
    } catch (err) {
      setError(t("Failed to delete property. Please try again."));
    }
  };

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      await propertiesAPI.deleteProperty(propertyToDelete.id);
      setUserProperties((prev) =>
        prev.filter((p) => p.id !== propertyToDelete.id)
      );
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (err) {
      setError(t("Failed to delete property. Please try again."));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  const handleOpenRespondModal = (inquiryId) => {
    setRespondingInquiryId(inquiryId);
    setResponseText("");
    setResponding(true);
  };

  const handleCloseRespondModal = () => {
    setRespondingInquiryId(null);
    setResponseText("");
    setResponding(false);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    await handleRespondToInquiry(respondingInquiryId, responseText);
    handleCloseRespondModal();
  };

  const renderOverview = () => (
    <div>
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("Dashboard Overview")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* First card - role specific */}
        {user?.profile?.role === "agent" ? (
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setActiveTab("properties")}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                {t("Manage properties")}
                <svg
                  className="ml-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {t("Agent")}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
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
                <p className="text-sm text-gray-500">{t("My Favorites")}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {favorites.length}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setActiveTab("favorites")}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
              >
                {t("View favorites")}
                <svg
                  className="ml-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                {t("Tenant")}
              </span>
            </div>
          </div>
        )}

        {/* Second card - inquiries for both roles */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {user?.profile?.role === "agent"
                  ? t("Property Inquiries")
                  : t("My Inquiries")}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {inquiries.length}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setActiveTab("inquiries")}
              className="text-sm text-green-600 hover:text-green-800 flex items-center"
            >
              {user?.profile?.role === "agent"
                ? t("Manage inquiries")
                : t("View inquiries")}
              <svg
                className="ml-1 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {inquiries.length > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  user?.profile?.role === "agent"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {inquiries.filter((i) => i.status === "pending").length > 0
                  ? t("{{count}} pending", {
                      count: inquiries.filter((i) => i.status === "pending")
                        .length,
                    })
                  : t("All responded")}
              </span>
            )}
          </div>
        </div>

        {/* Third card - role specific */}
        {user?.profile?.role === "agent" ? (
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-amber-600 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("Performance")}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {inquiries.length > 0
                    ? Math.round(
                        (inquiries.filter((i) => i.status !== "pending")
                          .length /
                          inquiries.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-amber-600">{t("Response rate")}</div>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                {user?.date_joined
                  ? Math.floor(
                      (new Date() - new Date(user.date_joined)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}{" "}
                {t("days active")}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-600 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("Recommendations")}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {recommendations.length}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setActiveTab("recommendations")}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                {t("View recommendations")}
                <svg
                  className="ml-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                {t("For you")}
              </span>
            </div>
          </div>
        )}
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
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
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
        {user?.profile?.role === "agent" && (
          <Link
            to="/add-property"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            title={t("Add a new property listing")}
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
        )}
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
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
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
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(property)}
                      >
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
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
          {favorites.map((property) => {
            // Support both { ...property fields } and { house: { ...property fields } }
            const prop = property.house ? property.house : property;
            return (
              <div
                key={property.id}
                className="bg-white overflow-hidden shadow-md rounded-lg"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">
                    {t("No image available")}
                  </span>
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
                    {prop.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">{prop.location}</p>

                  <p className="mt-2 text-lg font-bold text-blue-600">
                    {typeof prop.price === "number"
                      ? `$${prop.price.toLocaleString()}`
                      : t("N/A")}
                    {prop.property_status === "for_rent" && (
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
                        {prop.area} {t("sqft")}
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
                        {prop.bedrooms} {t("bd")}
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
                        {prop.bathrooms} {t("ba")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      to={`/properties/${prop.id}`}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("View Details")}
                    </Link>
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

  // Function to handle responding to an inquiry (for agents)
  const handleRespondToInquiry = async (inquiryId, response) => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      await axios.post(
        `http://127.0.0.1:8000/api/properties/inquiries/${inquiryId}/respond/`,
        { response },
        { headers }
      );

      // Update the inquiries list to reflect the response
      setInquiries(
        inquiries.map((inquiry) =>
          inquiry.id === inquiryId
            ? { ...inquiry, response, status: "responded" }
            : inquiry
        )
      );
    } catch (err) {
      console.error("Error responding to inquiry:", err);
      setError(t("Failed to send response. Please try again."));
    }
  };

  // Render inquiries differently based on user role
  const renderInquiries = () => {
    const isAgent = user?.profile?.role === "agent";

    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {isAgent ? t("Property Inquiries") : t("My Inquiries")}
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
                        {isAgent
                          ? t("From: {{name}}", {
                              name: inquiry.tenant.username,
                            })
                          : t("Property: {{title}}", {
                              title: inquiry.house.title,
                            })}
                      </h3>

                      <p className="text-sm text-gray-500 mb-3">
                        {isAgent
                          ? t("Regarding: {{title}}", {
                              title: inquiry.house.title,
                            })
                          : t("Agent: {{name}}", { name: inquiry.agent_name })}
                      </p>

                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-gray-700">
                          {inquiry.message}
                        </p>
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

                    {/* For agents: show respond button if inquiry is pending */}
                    {isAgent && inquiry.status === "pending" && (
                      <div className="flex-shrink-0 w-full md:w-auto">
                        <button
                          onClick={() => handleOpenRespondModal(inquiry.id)}
                          className="w-full md:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t("Respond")}
                        </button>
                      </div>
                    )}

                    {/* For tenants: show view property button */}
                    {!isAgent && (
                      <div className="flex-shrink-0">
                        <Link
                          to={`/properties/${inquiry.house.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t("View Property")}
                        </Link>
                      </div>
                    )}
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {isAgent
                ? t("No inquiries about your properties")
                : t("You haven't made any inquiries yet")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isAgent
                ? t(
                    "When tenants inquire about your properties, they will appear here."
                  )
                : t(
                    "Find a property you're interested in and contact the agent."
                  )}
            </p>
            {!isAgent && (
              <div className="mt-6">
                <Link
                  to="/properties"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t("Browse Properties")}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Respond Modal */}
        {responding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("Respond to Inquiry")}
              </h3>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={t("Type your response here...")}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCloseRespondModal}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleSubmitResponse}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!responseText.trim()}
                >
                  {t("Send Response")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render recommended properties for tenants
  const renderRecommendations = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("Recommended Properties")}
        </h2>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((property) => (
              <div
                key={property.id}
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
                    onClick={() => {
                      // Add to favorites functionality
                      axios
                        .post(
                          "http://127.0.0.1:8000/api/properties/favorites/",
                          { house_id: property.id },
                          {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "token"
                              )}`,
                            },
                          }
                        )
                        .then(() => {
                          // Add to local favorites state
                          setFavorites([
                            ...favorites,
                            { house: property, id: Date.now() },
                          ]);
                        })
                        .catch((err) => {
                          console.error("Error adding to favorites:", err);
                        });
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md hover:bg-red-100"
                  >
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
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
                          axios
                            .post(
                              "http://127.0.0.1:8000/api/properties/inquiries/",
                              {
                                house_id: property.id,
                                message,
                              },
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                  )}`,
                                },
                              }
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t("No recommendations yet")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t(
                "Add some properties to your favorites to get personalized recommendations."
              )}
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              {/* Floating Voice Command Banner for Tenants */}
              {user?.profile?.role === "tenant" && showVoiceBanner && (
                <VoiceCommandBanner />
              )}
              <h1 className="text-3xl font-bold text-gray-900">
                {t("Dashboard")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("Welcome back")}, {user?.first_name || t("User")}!
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {user?.profile?.role === "agent" && (
                <Link
                  to="/add-property"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                  title={t("Add a new property listing")}
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
              )}
            </div>
          </div>

          {/* Role-specific welcome message */}
          <div className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-5 sm:flex sm:items-start sm:justify-between">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-shrink-0">
                  {user?.profile?.role === "agent" ? (
                    <svg
                      className="h-12 w-12 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-12 w-12 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                      />
                    </svg>
                  )}
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                  <h3 className="text-lg font-medium text-white">
                    {user?.profile?.role === "agent"
                      ? t("Welcome to your Agent Dashboard, {{name}}!", {
                          name: user?.first_name || t("Agent"),
                        })
                      : t("Welcome to your Tenant Dashboard, {{name}}!", {
                          name: user?.first_name || t("Tenant"),
                        })}
                  </h3>
                  <div className="mt-1 text-sm text-blue-100">
                    <p>
                      {user?.profile?.role === "agent"
                        ? t(
                            "Manage your properties, respond to inquiries, and grow your real estate business."
                          )
                        : t(
                            "Find your dream home, save favorites, and contact agents about properties you're interested in."
                          )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips section */}
            <div className="border-t border-blue-400 bg-blue-50 px-6 py-4">
              <h4 className="text-sm font-medium text-blue-800">
                {t("Quick Tips")}
              </h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                {user?.profile?.role === "agent" ? (
                  <>
                    <li className="flex items-start">
                      <svg
                        className="h-4 w-4 text-blue-500 mt-0.5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t(
                        "Add high-quality photos to make your listings stand out"
                      )}
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-4 w-4 text-blue-500 mt-0.5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t(
                        "Respond quickly to inquiries to improve your response rate"
                      )}
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-4 w-4 text-blue-500 mt-0.5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("Keep your property details complete and up-to-date")}
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start">
                      <svg
                        className="h-4 w-4 text-blue-500 mt-0.5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t(
                        "Save properties to your favorites for easy access later"
                      )}
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-4 w-4 text-blue-500 mt-0.5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t(
                        "Use filters to narrow down properties that match your needs"
                      )}
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-4 w-4 text-blue-500 mt-0.5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t(
                        "Check your recommendations for properties similar to your favorites"
                      )}
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
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

            {/* Show different tabs based on user role */}
            {user?.profile?.role === "agent" ? (
              // Agent-specific tabs
              <>
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
                  onClick={() => setActiveTab("inquiries")}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "inquiries"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {t("Inquiries")}
                </button>
              </>
            ) : (
              // Tenant-specific tabs
              <>
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
                <button
                  onClick={() => setActiveTab("recommendations")}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "recommendations"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {t("Recommendations")}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Render different content based on active tab */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "properties" &&
          user?.profile?.role === "agent" &&
          renderProperties()}
        {activeTab === "favorites" &&
          user?.profile?.role === "tenant" &&
          renderFavorites()}
        {activeTab === "inquiries" && renderInquiries()}
        {activeTab === "recommendations" &&
          user?.profile?.role === "tenant" &&
          renderRecommendations()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("Delete Property")}
            </h3>
            <p className="mb-6 text-gray-700">
              {t(
                "Are you sure you want to delete the property '{{title}}'? This action cannot be undone.",
                { title: propertyToDelete?.title }
              )}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
