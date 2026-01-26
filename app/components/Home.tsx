"use client";
import { Session } from "next-auth";
import React, { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

export type Patient = {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone_number: string;
  pain_quality: string;
  location: string;
  stress: string;
  sob: string;
  hypertension: string;
  diabetes: string;
  hyperlipidemia: string;
  smoking: string;
  probability: number;
};

import { DataTable } from "../dashboard/DataTable";
import { columns } from "../dashboard/columns";

const Home = () => {
  const [currentView, setCurrentView] = useState("login");
  const [activeTab, setActiveTab] = useState("home");
  const [appointmentView, setAppointmentView] = useState("calendar");

  const handleLogout = () => {
    setCurrentView("login");
    signOut({ callbackUrl: "/" });
  };

  const API_BASE_URL = "http://localhost:8000";
  const ENDPOINT = "https://agilance-api.onrender.com";

  const [patients, setPatients] = useState<Patient[]>([]);

  console.log(patients);
  useEffect(() => {
    const fetchPatients = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/patients`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setPatients(data);
    };

    fetchPatients();
  }, []);

  return (
    <div>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">Doctor Portal</h1>
          </div>

          <nav className="mt-6">
            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === "home"
                  ? "bg-blue-50 border-r-4 border-blue-500 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 m-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("patients")}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === "patients"
                  ? "bg-blue-50 border-r-4 border-blue-500 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 m-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              Patients
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === "appointments"
                  ? "bg-blue-50 border-r-4 border-blue-500 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 m-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              Appointments
            </button>
          </nav>

          <div className="absolute bottom-6 w-64 px-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}

        {/* Home Tab */}

        <div>
          <h2 className="text-2xl  text-gray-800 mb-6">
            <div className="p-8"></div>
          </h2>

          <DataTable data={patients} columns={columns} />
        </div>

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              All Patients
            </h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pain Quality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SOB
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        hypertension
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        diabetes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        hyperlipidemia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Smoking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.age}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.pain_quality}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              patient.stress === "Yes"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {patient.stress}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              patient.sob === "Yes"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {patient.sob}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              patient.hypertension === "Yes"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {patient.hypertension}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              patient.diabetes === "Yes"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {patient.diabetes}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              patient.hyperlipidemia === "Yes"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {patient.hyperlipidemia}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              patient.smoking === "Yes"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {patient.smoking}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                patient.probability >= 0.8
                                  ? "bg-red-500"
                                  : patient.probability >= 0.5
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            ></div>
                            {(patient.probability * 100).toFixed(0)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setAppointmentView("calendar")}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    appointmentView === "calendar"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setAppointmentView("kanban")}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    appointmentView === "kanban"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Kanban
                </button>
              </div>
            </div>

            {appointmentView === "calendar" && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-7 gap-4 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-semibold text-gray-700 p-2"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = i - 6; // Start from previous month
                    const isToday = date === 4; // Aug 4th
                    const isTomorrow = date === 5; // Aug 5th
                    const hasAppointments = isToday || isTomorrow;

                    return (
                      <div
                        key={i}
                        className={`h-24 border rounded-lg p-2 ${
                          isToday
                            ? "bg-blue-50 border-blue-200"
                            : isTomorrow
                              ? "bg-gray-50 border-gray-200"
                              : "bg-white border-gray-100"
                        }`}
                      >
                        <div
                          className={`text-sm ${
                            isToday
                              ? "font-bold text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          {date > 0 && date <= 31 ? date : ""}
                        </div>
                        {hasAppointments && (
                          <div className="mt-1 space-y-1">
                            {/* {sampleAppointments
                                .filter(
                                  (apt) =>
                                    (isToday && apt.date === "2025-08-04") ||
                                    (isTomorrow && apt.date === "2025-08-05")
                                )
                                .slice(0, 2)
                                .map((apt) => (
                                  <div
                                    key={apt.id}
                                    className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                                  >
                                    {apt.time} {apt.patientName.split(" ")[0]}
                                  </div>
                                ))} */}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {appointmentView === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["scheduled", "in-progress", "completed"].map((status) => (
                  <div key={status} className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold text-gray-800 mb-4 capitalize">
                      {status.replace("-", " ")} (
                      {/* {
                          sampleAppointments.filter(
                            (apt) => apt.status === status
                          ).length
                        } */}
                      )
                    </h3>
                    <div className="space-y-3">
                      {/* {sampleAppointments
                          .filter((apt) => apt.status === status)
                          .map((appointment) => (
                            <div
                              key={appointment.id}
                              className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                            >
                              <p className="font-medium text-gray-800">
                                {appointment.patientName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {appointment.type}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">
                                  {appointment.date}
                                </span>
                                <span className="text-xs font-medium text-gray-700">
                                  {appointment.time}
                                </span>
                              </div>
                            </div>
                          ))} */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
