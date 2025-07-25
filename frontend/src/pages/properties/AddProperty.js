import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { propertiesAPI } from "../../services/api";

const AddProperty = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    address: "", // Added address field
    property_type_id: "", // Use property_type_id for backend compatibility
    bedrooms: "",
    bathrooms: "",
    area: "",
    property_status: "for_rent",
  });
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    propertiesAPI
      .getPropertyTypes()
      .then((res) => setPropertyTypes(res.data.results || res.data))
      .catch(() => setPropertyTypes([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // 1. Create property (without images)
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("address", form.address);
      formData.append("location", form.location);
      formData.append("property_status", form.property_status);
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);
      formData.append("area", form.area);
      if (form.property_type_id) formData.append("property_type_id", form.property_type_id);
      if (form.agent_id) formData.append("agent_id", form.agent_id);
      if (form.feature_ids && form.feature_ids.length > 0) {
        form.feature_ids.forEach(fid => formData.append("feature_ids", fid));
      }
      if (images && images.length > 0) {
        for (const img of images) {
          formData.append("uploaded_images", img);
        }
      }
      const res = await propertiesAPI.createProperty(formData);
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.detail || "Failed to add property.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12">
      {/* Consistent Back Arrow Button */}
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t("Add New Property")}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-8 space-y-6"
          encType="multipart/form-data"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Title")}
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Description")}
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Price")}
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Area (sqft)")}
              </label>
              <input
                name="area"
                type="number"
                value={form.area}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Bedrooms")}
              </label>
              <input
                name="bedrooms"
                type="number"
                value={form.bedrooms}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Bathrooms")}
              </label>
              <input
                name="bathrooms"
                type="number"
                value={form.bathrooms}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Location")}
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Address")}
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Property Type")}
            </label>
            <select
              name="property_type_id"
              value={form.property_type_id}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            >
              <option value="">{t("Select type")}</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Status")}
            </label>
            <select
              name="property_status"
              value={form.property_status}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="for_rent">{t("For Rent")}</option>
              <option value="for_sale">{t("For Sale")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Images")}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full"
            />
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="preview"
                    className="h-20 w-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm">
              {t("Property added successfully!")}
            </div>
          )}
          <div className="flex justify-between items-center">
            <Link to="/my-properties" className="text-blue-600 hover:underline">
              {t("Cancel")}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t("Adding...") : t("Add Property")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
