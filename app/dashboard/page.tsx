"use client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import React, { useState, useEffect } from "react";
import Home from "../components/Home";

export default async function DashboardPage() {
  // const session = await getServerSession(authOptions);
  // if (!session) return <div>Please log in</div>;

  return (
    <div>
      <Home />
    </div>
  );
}
