import React, { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";
import TextInput from "@/components/form/TextInput";
import AccentButton from "@/components/ui/AccentButton";
import Heading from "@/components/ui/Heading";
import Select from "@/components/form/Select";

/* ================= Validation Schemas ================= */

const stockInSchema = Yup.object().shape({
  category_id: Yup.number().typeError("Category is required").required("Category is required"),
  item_id: Yup.number().typeError("Item is required").required("Item is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .integer("Quantity must be a whole number")
    .positive("Quantity must be greater than zero")
    .required("Quantity is required"),
  reason: Yup.string().nullable(),
});

const stockOutSchema = Yup.object().shape({
  category_id: Yup.number().typeError("Category is required").required("Category is required"),
  item_id: Yup.number().typeError("Item is required").required("Item is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .integer("Quantity must be a whole number")
    .positive("Quantity must be greater than zero")
    .required("Quantity is required"),
  reason: Yup.string().nullable(),
});

const NewDonationPage = () => {
  const [activeTab, setActiveTab] = useState("IN"); // "IN" or "OUT"
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isSubmittingIn, setIsSubmittingIn] = useState(false);
  const [isSubmittingOut, setIsSubmittingOut] = useState(false);

  /* =============== Forms: Stock IN & Stock OUT =============== */

  const {
    control: controlIn,
    register: registerIn,
    handleSubmit: handleSubmitIn,
    reset: resetIn,
    watch: watchIn,
    formState: { errors: errorsIn },
  } = useForm({
    resolver: yupResolver(stockInSchema),
    defaultValues: {
      category_id: "",
      item_id: "",
      quantity: "",
      reason: "",
    },
  });

  const {
    control: controlOut,
    register: registerOut,
    handleSubmit: handleSubmitOut,
    reset: resetOut,
    watch: watchOut,
    formState: { errors: errorsOut },
  } = useForm({
    resolver: yupResolver(stockOutSchema),
    defaultValues: {
      category_id: "",
      item_id: "",
      quantity: "",
      reason: "",
    },
  });

  const selectedCategoryIdIn = watchIn("category_id");
  const selectedCategoryIdOut = watchOut("category_id");

  /* ================= Fetch categories + items ================= */

  useEffect(() => {
    const fetchMeta = async () => {
      setIsLoadingMeta(true);
      try {
        const [catsRes, itemsRes] = await Promise.all([API.private.getCategories(), API.private.getItems()]);

        const cats = catsRes.data?.data?.categories || [];
        const allItems = itemsRes.data?.data?.items || [];

        setCategories(cats);
        setItems(allItems);
      } catch (err) {
        console.error("Error loading metadata:", err);
        Notification.error("Failed to load categories/items. Please refresh the page.");
      } finally {
        setIsLoadingMeta(false);
      }
    };

    fetchMeta();
  }, []);

  /* ================= Helpers ================= */

  const itemsForCategory = (categoryId) => {
    if (!categoryId) return [];
    const cid = Number(categoryId);
    return items.filter((item) => Number(item.category_id) === cid);
  };

  /* ================= Submit Handlers ================= */

  const onSubmitStockIn = async (data) => {
    setIsSubmittingIn(true);
    try {
      const payload = {
        item_id: Number(data.item_id),
        quantity: Number(data.quantity),
        reason: data.reason || undefined,
      };

      const res = await API.private.stockIn(payload);

      if (res.data.code === "OK") {
        Notification.success(res.data.data?.message || "Stock added successfully.");
        resetIn({
          category_id: "",
          item_id: "",
          quantity: "",
          reason: "",
        });
      } else {
        Notification.error(res.data.error || "Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error in stock-in:", error);
      const status = error.response?.status;
      let msg = "Failed to add stock. Please try again.";

      if (status === 400) {
        msg = error.response?.data?.error || "Validation error from server.";
      } else if (status === 401) {
        msg = "You are not authorized. Please log in again.";
      } else if (status === 500) {
        msg = "Server error. Please try again later.";
      }

      Notification.error(msg);
    } finally {
      setIsSubmittingIn(false);
    }
  };

  const onSubmitStockOut = async (data) => {
    setIsSubmittingOut(true);
    try {
      const payload = {
        item_id: Number(data.item_id),
        quantity: Number(data.quantity),
        reason: data.reason || undefined,
      };

      const res = await API.private.stockOut(payload);

      if (res.data.code === "OK") {
        Notification.success(res.data.data?.message || "Stock removed successfully.");
        resetOut({
          category_id: "",
          item_id: "",
          quantity: "",
          reason: "",
        });
      } else {
        Notification.error(res.data.error || "Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error in stock-out:", error);
      const status = error.response?.status;
      let msg = "Failed to remove stock. Please try again.";

      if (status === 400) {
        msg = error.response?.data?.error || "Validation error from server.";
      } else if (status === 401) {
        msg = "You are not authorized. Please log in again.";
      } else if (status === 500) {
        msg = "Server error. Please try again later.";
      }

      Notification.error(msg);
    } finally {
      setIsSubmittingOut(false);
    }
  };

  /* ================= Render ================= */

  return (
    <DefaultLayout>
      <div className="max-w-3xl mx-auto">
        <Heading className="mb-4">
          Manage <span className="text-accent">Stock Movements</span>
        </Heading>
        <p className="text-sm text-gray-600 mb-6">
          Use this page to record items coming <span className="font-semibold">into</span> or going{" "}
          <span className="font-semibold">out of</span> the SLMCS donation inventory.
        </p>

        {isLoadingMeta ? (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="bg-white shadow-2xl rounded-lg p-6 border border-gray-100">
            {/* Tabs */}
            <div className="flex mb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("IN")}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === "IN"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Stock In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("OUT")}
                className={`ml-4 px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === "OUT"
                    ? "border-rose-500 text-rose-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Stock Out
              </button>
            </div>

            {/* TAB CONTENT: STOCK IN */}
            {activeTab === "IN" && (
              <form onSubmit={handleSubmitIn(onSubmitStockIn)} className="space-y-5">
                {/* Category + Item */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="category_id"
                    control={controlIn}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        label="Category"
                        placeholder="Select a category"
                        value={value}
                        onChange={(val) => {
                          const numericVal = val ? Number(val) : "";
                          onChange(numericVal);
                          // Reset item when category changes
                          resetIn(
                            (formValues) => ({
                              ...formValues,
                              category_id: numericVal,
                              item_id: "",
                            }),
                            { keepErrors: true, keepDirty: true, keepTouched: true }
                          );
                        }}
                        options={categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        }))}
                        error={errorsIn.category_id?.message}
                        isClearable
                      />
                    )}
                  />

                  <Controller
                    name="item_id"
                    control={controlIn}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        label="Item"
                        placeholder={itemsLoading ? "Loading items..." : "Select an item"}
                        value={value}
                        onChange={(val) => onChange(val ? Number(val) : "")}
                        options={itemsForCategory(selectedCategoryIdIn).map((item) => ({
                          value: item.id,
                          label: item.variant_label ? `${item.name} (${item.variant_label})` : item.name,
                        }))}
                        isDisabled={!selectedCategoryIdIn}
                        error={errorsIn.item_id?.message}
                        isClearable
                      />
                    )}
                  />
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Quantity to add"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 10"
                    {...registerIn("quantity")}
                    error={errorsIn.quantity?.message}
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Reason / Notes <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errorsIn.reason ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="e.g. Donation drive, restock from main storage, etc."
                    {...registerIn("reason")}
                  />
                  {errorsIn.reason && <p className="text-red-500 text-sm mt-1">{errorsIn.reason.message}</p>}
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <AccentButton
                    type="submit"
                    loading={isSubmittingIn}
                    spinner={<Spinner color="white" />}
                    text="Record Stock In"
                  />
                </div>
              </form>
            )}

            {/* TAB CONTENT: STOCK OUT */}
            {activeTab === "OUT" && (
              <form onSubmit={handleSubmitOut(onSubmitStockOut)} className="space-y-5">
                {/* Category + Item */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="category_id"
                    control={controlOut}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        label="Category"
                        placeholder="Select a category"
                        value={value}
                        onChange={(val) => {
                          const numericVal = val ? Number(val) : "";
                          onChange(numericVal);
                          resetOut(
                            (formValues) => ({
                              ...formValues,
                              category_id: numericVal,
                              item_id: "",
                            }),
                            { keepErrors: true, keepDirty: true, keepTouched: true }
                          );
                        }}
                        options={categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        }))}
                        error={errorsOut.category_id?.message}
                        isClearable
                      />
                    )}
                  />

                  <Controller
                    name="item_id"
                    control={controlOut}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        label="Item"
                        placeholder={itemsLoading ? "Loading items..." : "Select an item"}
                        value={value}
                        onChange={(val) => onChange(val ? Number(val) : "")}
                        options={itemsForCategory(selectedCategoryIdOut).map((item) => ({
                          value: item.id,
                          label: item.variant_label ? `${item.name} (${item.variant_label})` : item.name,
                        }))}
                        isDisabled={!selectedCategoryIdOut}
                        error={errorsOut.item_id?.message}
                        isClearable
                      />
                    )}
                  />
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Quantity to remove"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 5"
                    {...registerOut("quantity")}
                    error={errorsOut.quantity?.message}
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-800">
                    Reason / Notes <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                      errorsOut.reason ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="e.g. Distributed at camp, given to family A, etc."
                    {...registerOut("reason")}
                  />
                  {errorsOut.reason && <p className="text-red-500 text-sm mt-1">{errorsOut.reason.message}</p>}
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <AccentButton
                    type="submit"
                    loading={isSubmittingOut}
                    spinner={<Spinner color="white" />}
                    text="Record Stock Out"
                  />
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default NewDonationPage;
