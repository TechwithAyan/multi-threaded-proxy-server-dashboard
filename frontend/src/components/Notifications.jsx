import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Notifications(){
  return <ToastContainer position="top-right" autoClose={4000} hideProgressBar newestOnTop />;
}
