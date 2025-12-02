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
import { useNavigate } from "react-router-dom";

const schema = Yup.object().shape({
  category_id: Yup.number().typeError("Category is required").required("Category is required"),
  item_id: Yup.number().typeError("Item is required").required("Item is required"),
  donor_name: Yup.string().required("Donor name is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .integer("Quantity must be a whole number")
    .positive("Quantity must be greater than zero")
    .required("Quantity is required"),
  donated_at: Yup.string().required("Drop-off time is required"),
  notes: Yup.string().nullable(),
});

const NewDonationPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      category_id: "",
      item_id: "",
      donor_name: "",
      quantity: "",
      donated_at: "",
      notes: "",
    },
  });

  const selectedCategoryId = watch("category_id");

  // Fetch all categories on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await API.private.getCategories();
        const cats = res.data?.data?.categories || [];
        setCategories(cats);
      } catch (err) {
        console.error("Error loading categories:", err);
        Notification.error("Failed to load categories. Please refresh the page.");
      } finally {
        setIsLoadingMeta(false);
      }
    };

    fetchMeta();
  }, []);

  // Fetch items when category changes
  useEffect(() => {
    const fetchItemsForCategory = async () => {
      if (!selectedCategoryId) {
        setItems([]);
        return;
      }

      setItemsLoading(true);
      try {
        const res = await API.private.getItemsByCategory(selectedCategoryId);
        const itemsList = res.data?.data?.items || [];
        setItems(itemsList);
      } catch (err) {
        console.error("Error loading items:", err);
        setItems([]);
        Notification.error("Failed to load items for this category.");
      } finally {
        setItemsLoading(false);
      }
    };

    fetchItemsForCategory();
  }, [selectedCategoryId]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = {
        donor_name: data.donor_name,
        item_id: data.item_id,
        quantity: Number(data.quantity),
        notes: data.notes || undefined,
        // Optional: you can use this later by updating your controller to handle donated_at
        donated_at: data.donated_at ? new Date(data.donated_at).toISOString() : undefined,
      };

      const res = await API.private.createDonation(payload);

      if (res.data.code === "OK") {
        Notification.success(res.data.data?.message || "Donation recorded successfully.");
        reset();
        navigate("/dashboard");
      } else {
        Notification.error(res.data.error || "Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error creating donation:", error);
      const status = error.response?.status;
      let msg = "Failed to record donation. Please try again.";

      if (status === 400) {
        msg = error.response?.data?.error || "Validation error from server.";
      } else if (status === 401) {
        msg = "You are not authorized. Please log in again.";
      } else if (status === 500) {
        msg = "Server error. Please try again later.";
      }

      Notification.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-3xl mx-auto">
        <Heading className="mb-4">
          Record a <span className="text-accent">New Donation</span>
        </Heading>
        <p className="text-sm text-gray-600 mb-6">
          Fill in the details below when a donor drops off items at the SLMCS collection point.
        </p>

        {isLoadingMeta ? (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="bg-white shadow-2xl rounded-lg p-6 border border-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Category + Item */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Category"
                      placeholder="Select a category"
                      value={value}
                      onChange={(val) => {
                        // clear currently selected item when category changes
                        onChange(val);
                        reset(
                          (formValues) => ({
                            ...formValues,
                            category_id: val,
                            item_id: "",
                          }),
                          { keepErrors: true, keepDirty: true, keepTouched: true }
                        );
                      }}
                      options={categories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
                      error={errors.category_id?.message}
                      isClearable
                    />
                  )}
                />

                <Controller
                  name="item_id"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      label="Item"
                      placeholder={itemsLoading ? "Loading items..." : "Select an item"}
                      value={value}
                      onChange={onChange}
                      options={items.map((item) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                      isDisabled={!selectedCategoryId || itemsLoading}
                      error={errors.item_id?.message}
                      isClearable
                    />
                  )}
                />
              </div>

              {/* Donor name + Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Donor Name"
                  placeholder="Enter donor's name"
                  {...register("donor_name")}
                  error={errors.donor_name?.message}
                />

                <TextInput
                  label="Quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 5"
                  {...register("quantity")}
                  error={errors.quantity?.message}
                />
              </div>

              {/* Drop-off time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-800">Drop-off Time</label>
                  <input
                    type="datetime-local"
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.donated_at ? "border-red-400" : "border-gray-300"
                    }`}
                    {...register("donated_at")}
                  />
                  {errors.donated_at && <p className="text-red-500 text-sm mt-1">{errors.donated_at.message}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-800">
                  Notes <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.notes ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Any special notes about this donation..."
                  {...register("notes")}
                />
                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <AccentButton
                  type="submit"
                  loading={isSubmitting}
                  spinner={<Spinner color="white" />}
                  text="Submit Donation"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default NewDonationPage;
