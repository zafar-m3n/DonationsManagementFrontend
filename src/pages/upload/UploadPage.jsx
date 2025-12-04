import React, { useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Heading from "@/components/ui/Heading";
import AccentButton from "@/components/ui/AccentButton";
import Spinner from "@/components/ui/Spinner";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      Notification.error("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // field name MUST be "file" to match multer

    setIsUploading(true);

    try {
      const res = await API.private.importDonationsCsv(formData);

      if (res.data.code === "OK") {
        Notification.success(res.data.data?.message || "CSV imported successfully.");
        setFile(null);
        // reset the <input type="file" />
        e.target.reset();
      } else {
        Notification.error(res.data.error || "Unexpected response from server.");
      }
    } catch (error) {
      const status = error.response?.status;
      let msg = "Failed to upload CSV. Please try again.";

      if (status === 400) {
        msg = error.response?.data?.error || "Invalid CSV file or data.";
      } else if (status === 500) {
        msg = "Server error while importing CSV. Please try again later.";
      }

      Notification.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300">
        <Heading className="text-center mb-4">
          Import Donations via <span className="text-accent">CSV Upload</span>
        </Heading>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Upload a <span className="font-semibold">CSV file</span> to bulk add or update donation items and stock.
        </p>

        <div className="bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-3 mb-4 text-xs text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-1">Expected CSV columns (header row):</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              <code>category_name</code> – e.g. Food, Hygiene
            </li>
            <li>
              <code>item_name</code> – e.g. Rice, Milk powder
            </li>
            <li>
              <code>unit_type</code> – e.g. kg, packet, pcs
            </li>
            <li>
              <code>quantity</code> – positive number
            </li>
            <li>
              <code>variant_label</code> (optional) – e.g. 500g, L (10pcs)
            </li>
            <li>
              <code>description</code> (optional)
            </li>
            <li>
              <code>reason</code> (optional)
            </li>
            <li>
              <code>movement_type</code> (optional) – IN or OUT (defaults to IN)
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Select CSV file
            </label>
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 dark:text-gray-100
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-accent/10 file:text-accent
                         hover:file:bg-accent/20
                         dark:file:bg-accent/20 dark:file:text-accent
                         cursor-pointer"
            />
            {file && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Selected: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          <AccentButton
            type="submit"
            loading={isUploading}
            text={isUploading ? "Uploading..." : "Upload & Import CSV"}
            spinner={<Spinner color="white" />}
          />
        </form>
      </div>
    </DefaultLayout>
  );
};

export default UploadPage;
