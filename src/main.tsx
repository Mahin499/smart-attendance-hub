import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);
root.render(
	<ErrorBoundary>
		<App />
	</ErrorBoundary>
);

// Remove the loading placeholder if present after React mounts
try {
	const loader = document.getElementById('app-loading');
	if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
} catch (e) {
	// ignore
}
