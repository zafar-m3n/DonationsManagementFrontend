// src/pages/DonationsPage.jsx
import React, { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Icon from "@/components/ui/Icon";
import Table from "@/components/ui/Table";

const DonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await API.private.getDonations();
        console.log("📌 Donations API Response:", res.data);

        const apiDonations = res.data?.data?.donations || [];
        setDonations(apiDonations);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setErrorMsg("Unable to load donations right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const columns = [
    { key: "donated_at", label: "Date / Time" },
    { key: "donor_name", label: "Donor" },
    { key: "item", label: "Item & Category" },
    { key: "quantity", label: "Quantity" },
    { key: "notes", label: "Notes" },
    { key: "createdBy", label: "Entered By" },
  ];

  const renderCell = (row, col) => {
    switch (col.key) {
      case "donated_at": {
        const d = new Date(row.donated_at);
        return d.toLocaleString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      case "item": {
        const itemName = row.item?.name || "Unknown item";
        const categoryName = row.item?.category?.name || "Unknown category";
        return `${itemName} (${categoryName})`;
      }

      case "quantity":
        return row.quantity ?? 0;

      case "notes":
        return row.notes || "-";

      case "createdBy": {
        const name = row.createdBy?.name || "Unknown";
        const email = row.createdBy?.email ? ` (${row.createdBy.email})` : "";
        return `${name}${email}`;
      }

      case "donor_name":
        return row.donor_name;

      default:
        return row[col.key] ?? "-";
    }
  };

  return (
    <DefaultLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 flex items-center gap-2">
            <Icon icon="mdi:clipboard-list-outline" width={30} className="text-emerald-500" />
            Donation Records
          </h1>
          <p className="text-sm text-slate-500">
            View all recorded donations, including donor details and items contributed.
          </p>
        </div>

        {/* LOADING / ERROR STATES */}
        {loading && (
          <div className="w-full py-16 flex justify-center">
            <p className="text-slate-500 text-lg">Loading donations...</p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="w-full py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{errorMsg}</div>
          </div>
        )}

        {/* TABLE */}
        {!loading && !errorMsg && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Icon icon="mdi:table" width={22} className="text-slate-500" />
                All Donations
              </h2>
              <span className="text-xs text-slate-500">Total records: {donations.length}</span>
            </div>

            <Table
              columns={columns}
              data={donations}
              renderCell={renderCell}
              emptyMessage="No donations recorded yet."
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default DonationsPage;
