import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { propertiesAPI, tenantAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

const PropertyDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await propertiesAPI.getProperty(id);
        setProperty(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError(t("Failed to load property details. Please try again."));
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, t]);

  useEffect(() => {
    // Pre-fill contact form if user is authenticated
    if (isAuthenticated() && user) {
      setContactForm((prev) => ({
        ...prev,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        phone: user.profile?.phone_number || "",
      }));
    }
  }, [isAuthenticated, user]);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!contactForm.name) {
      errors.name = t("Name is required");
    }

    if (!contactForm.email) {
      errors.email = t("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      errors.email = t("Email is invalid");
    }

    if (!contactForm.phone) {
      errors.phone = t("Phone number is required");
    }

    if (!contactForm.message) {
      errors.message = t("Message is required");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await tenantAPI.createInquiry(id, contactForm.message);
        setSubmitSuccess(true);
        setFormErrors({});
      } catch (err) {
        setFormErrors({
          submit:
            err.response && err.response.data && err.response.data.detail
              ? err.response.data.detail
              : t("Failed to send message. Please try again."),
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <Link to="/properties" className="text-blue-600 hover:text-blue-800">
            {t("Back to Properties")}
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t("Property not found")}
          </h2>
          <p className="mt-2 text-gray-600">
            {t(
              "The property you are looking for does not exist or has been removed."
            )}
          </p>
          <div className="mt-4">
            <Link
              to="/properties"
              className="text-blue-600 hover:text-blue-800"
            >
              {t("Browse other properties")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12">
      {/* Consistent Back Arrow Button */}
      {location.pathname !== "/" && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 z-50 bg-white rounded-full shadow p-2 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  {t("Home")}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <Link
                  to="/properties"
                  className="ml-4 text-gray-400 hover:text-gray-500"
                >
                  {t("Properties")}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span
                  className="ml-4 text-gray-500 font-medium"
                  aria-current="page"
                >
                  {property.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Property Title and Status */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {property.images && property.images.length > 0 ? (
                <>
                  <div className="relative h-96">
                    <img
                      src={property.images[activeImage].image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {property.images.length > 1 && (
                    <div className="p-4 flex space-x-2 overflow-x-auto">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                            activeImage === index
                              ? "border-blue-500"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={image.image}
                            alt={`${property.title} - ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">
                    {t("No images available")}
                  </span>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t("Property Details")}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm">{t("Price")}</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${property.price.toLocaleString()}
                      {property.property_status === "for_rent" && (
                        <span className="text-sm font-normal text-gray-500">
                          /month
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm">{t("Area")}</span>
                    <span className="text-lg font-bold">
                      {property.area} {t("sqft")}
                    </span>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm">
                      {t("Bedrooms")}
                    </span>
                    <span className="text-lg font-bold">
                      {property.bedrooms}
                    </span>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm">
                      {t("Bathrooms")}
                    </span>
                    <span className="text-lg font-bold">
                      {property.bathrooms}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("Description")}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {property.description}
                  </p>
                </div>

                {property.features && property.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("Features")}
                    </h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {property.features.map((feature) => (
                        <li key={feature.id} className="flex items-center">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("Location")}
                  </h3>
                  <p className="text-gray-700">{property.location}</p>
                  {/* Here you could add a map component if you have coordinates */}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t("Contact Agent")}
                </h2>

                {submitSuccess ? (
                  <div
                    className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <p className="font-bold">{t("Message Sent!")}</p>
                    <p className="block sm:inline">
                      {t("We will get back to you soon.")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    {formErrors.submit && (
                      <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                        role="alert"
                      >
                        <span className="block sm:inline">
                          {formErrors.submit}
                        </span>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("Your Name")}
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={contactForm.name}
                          onChange={handleContactChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border ${
                            formErrors.name
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md p-2`}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("Email")}
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={contactForm.email}
                          onChange={handleContactChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border ${
                            formErrors.email
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md p-2`}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("Phone")}
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={contactForm.phone}
                          onChange={handleContactChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border ${
                            formErrors.phone
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md p-2`}
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("Message")}
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="message"
                          id="message"
                          rows={4}
                          value={contactForm.message}
                          onChange={handleContactChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border ${
                            formErrors.message
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md p-2`}
                          placeholder={t("I am interested in this property...")}
                        />
                        {formErrors.message && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSubmitting ? t("Sending...") : t("Send Message")}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("Property Agent")}
                  </h3>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {property.agent?.name || t("Agent Name")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {property.agent?.phone || "+211 920 000 000"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
