import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "./assets/logoEI.jpeg";
import { API_ROOT } from "./config";
import PortalNav from "./PortalNav";

function PeopleTable({ title, people, emptyLabel }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
        <h3 className="text-sm font-semibold text-slate-800">
          {title}{" "}
          <span className="font-normal text-slate-500">({people?.length ?? 0})</span>
        </h3>
      </div>
      {!people || people.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Membership ID</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {people.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3 font-medium text-slate-900">{person.name}</td>
                  <td className="px-6 py-3 text-slate-600">{person.membership_id || "—"}</td>
                  <td className="px-6 py-3 text-slate-600">{person.email || "—"}</td>
                  <td className="px-6 py-3 text-slate-600">{person.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PaymentReport() {
  const { chapterId } = useParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [chapterName, setChapterName] = useState("");

  // Fetch available cycles for dropdown
  const loadCycles = async () => {
    try {
      const res = await fetch(`${API_ROOT}/cycles-dropdown/`);
      if (!res.ok) throw new Error("Failed to load cycles");
      const data = await res.json();
      setCycles(data.cycles);
      
      // Select current cycle by default
      const currentCycle = data.cycles.find((c) => c.is_current);
      if (currentCycle) {
        setSelectedCycle(currentCycle.cycle_start);
      }
    } catch (err) {
      console.error("Error loading cycles:", err);
    }
  };

  // Fetch payment report for selected cycle
  const loadReport = async (cycleStart) => {
    if (!cycleStart) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `${API_ROOT}/chapters/${chapterId}/payment-report/?cycle_start=${cycleStart}`
      );
      if (!res.ok) throw new Error("Failed to load report");
      const data = await res.json();
      setReport(data);
      setChapterName(data.chapter.name);
    } catch (err) {
      console.error("Error loading report:", err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  useEffect(() => {
    if (selectedCycle) {
      loadReport(selectedCycle);
    }
  }, [selectedCycle]);

  return (
    <div className="min-h-screen bg-[#EEF4F4]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Enterprise-Infotech Logo" className="h-14 w-auto object-contain" />
            <PortalNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          to={`/chapters/${chapterId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#2D5A5D]"
        >
          <ArrowLeft size={16} />
          Back to {chapterName || "Chapter"}
        </Link>

        <div className="space-y-6">
          {/* Title and Cycle Selector */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Payment Report</h1>
              <p className="mt-1 text-sm text-slate-500">{chapterName}</p>
            </div>

            {/* Cycle Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Select Cycle</label>
              <select
                value={selectedCycle || ""}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:ring-2 focus:ring-[#2D5A5D]/20"
              >
                {cycles.map((cycle) => (
                  <option key={cycle.cycle_start} value={cycle.cycle_start}>
                    {cycle.display} {cycle.is_current ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
              Loading payment report...
            </div>
          ) : !report ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
              No data available for this cycle.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Total Members
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {report.total_count ?? 0}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Paid
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    {report.paid_count ?? 0}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Unpaid
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">
                    {report.unpaid_count ?? 0}
                  </p>
                </div>
              </div>

              {/* Paid and Unpaid Tables */}
              <div className="space-y-4">
                <PeopleTable
                  title={`Paid (${report.paid_count})`}
                  people={report.paid}
                  emptyLabel="No one has paid yet for this cycle."
                />

                <PeopleTable
                  title={`Unpaid (${report.unpaid_count})`}
                  people={report.unpaid}
                  emptyLabel="Everyone has paid for this cycle!"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}