"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
	return (
		<ToastContainer autoClose={5000} closeOnClick draggable newestOnTop pauseOnFocusLoss pauseOnHover position="top-center" />
	);
}
