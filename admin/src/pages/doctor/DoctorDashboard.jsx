import { useEffect, useMemo, useState, useRef } from "react";
import {
  getStaffBranchServices,
  getStaffBranchCounters,
  startStaffTask,
  getCurrentStaffTask,
  getWaitingTokenCount,
  callNextToken,
  endStaffTask,
} from "../../services/staffService";
import { useAuth } from "../../context/AuthContext";

const formatDuration = (totalSeconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedCounter, setSelectedCounter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTask, setCurrentTask] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const pollRef = useRef(null);
  const sessionTimerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [svcRes, ctrRes, taskRes] = await Promise.all([
          getStaffBranchServices(),
          getStaffBranchCounters(),
          getCurrentStaffTask(),
        ]);

        if (!mounted) return;

        setServices(Array.isArray(svcRes?.services) ? svcRes.services : []);
        setCounters(Array.isArray(ctrRes?.counters) ? ctrRes.counters : []);
        setCurrentTask(taskRes?.currentTask || null);

        // preselect if only one available
        if (!selectedService && svcRes?.services?.length === 1) {
          setSelectedService(svcRes.services[0]._id || svcRes.services[0].id);
        }

        if (!selectedCounter && ctrRes?.counters?.length === 1) {
          setSelectedCounter(ctrRes.counters[0]._id || ctrRes.counters[0].id);
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    if (!currentTask?.startedAt) {
      setSessionDuration(0);
      return undefined;
    }

    const startedAt = new Date(currentTask.startedAt);

    const updateDuration = () => {
      const elapsedSeconds = Math.max(
        0,
        Math.floor((new Date().getTime() - startedAt.getTime()) / 1000),
      );
      setSessionDuration(elapsedSeconds);
    };

    updateDuration();
    sessionTimerRef.current = setInterval(updateDuration, 1000);

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    };
  }, [currentTask?.startedAt]);

  const fetchWaiting = async (serviceId) => {
    try {
      const res = await getWaitingTokenCount({ serviceId });
      setWaitingCount(Number(res?.count || 0));
    } catch (err) {
      console.error("waiting count", err);
    }
  };

  useEffect(() => {
    if (currentTask) {
      // start polling waiting count
      fetchWaiting(currentTask.serviceId);
      pollRef.current = setInterval(() => fetchWaiting(currentTask.serviceId), 5000);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setWaitingCount(0);
      setCurrentToken(null);
      setSessionDuration(0);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [currentTask]);

  const handleStart = async () => {
    setError("");
    if (!selectedService || !selectedCounter) {
      setError("Please select a service and counter before starting work.");
      return;
    }

    try {
      setLoading(true);
      const res = await startStaffTask({ serviceId: selectedService, counterId: selectedCounter });
      if (res?.success) {
        setCurrentTask(res.workSession || null);
        setCurrentToken(null);

        // Auto-call first token after starting session
        try {
          const counterId = res.workSession?.counterId || selectedCounter;
          const callRes = await callNextToken(counterId);
          if (callRes?.success) {
            setCurrentToken(callRes?.token || callRes?.called || null);
            if (res.workSession?.serviceId) fetchWaiting(res.workSession.serviceId);
          }
        } catch (err) {
          console.error("auto call next after start", err);
        }
      } else {
        setError(res?.message || "Failed to start session");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error starting session");
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (!selectedCounter && !currentTask?.counterId) return;
    const counterId = currentTask?.counterId || selectedCounter;
    try {
      const res = await callNextToken(counterId);
      if (res?.success) {
        setCurrentToken(res?.token || res?.called || null);
        // refresh waiting count
        if (currentTask?.serviceId) fetchWaiting(currentTask.serviceId);
      } else {
        setError(res?.message || "Failed to call next token");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error calling next token");
    }
  };

  const handleEnd = async () => {
    try {
      setLoading(true);
      const res = await endStaffTask();
      if (res?.success) {
        setCurrentTask(null);
        setCurrentToken(null);
        setSessionDuration(0);
      } else {
        setError(res?.message || "Failed to end session");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error ending session");
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = useMemo(() => services || [], [services]);
  const counterOptions = useMemo(() => counters || [], [counters]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Select your service and counter to start seeing patients</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        )}

        {!currentTask && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select service</option>
                  {serviceOptions.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>{s.serviceName || s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Counter</label>
                <select
                  value={selectedCounter}
                  onChange={(e) => setSelectedCounter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select counter</option>
                  {counterOptions.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.counterName || c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleStart}
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Work"}
              </button>
            </div>
          </section>
        )}

        {currentTask && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <span className="font-medium text-slate-600">Session Duration</span>
                  <span className="font-mono text-base font-semibold tracking-wider text-slate-900">
                    {formatDuration(sessionDuration)}
                  </span>
                </span>
                <span>Service: {currentTask.serviceName}</span>
              </div>
              <div className="text-6xl font-extrabold text-emerald-700">{currentToken?.label || currentToken?.tokenNumber || currentToken?.number || "—"}</div>
              <div className="text-sm text-slate-600">Waiting: <span className="font-semibold">{waitingCount}</span></div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleCallNext}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Call Next Patient
                </button>

                <button
                  onClick={handleEnd}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  End Session
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
