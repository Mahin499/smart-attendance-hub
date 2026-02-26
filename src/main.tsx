import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./ErrorBoundary";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
	<ErrorBoundary>
		<App />
	</ErrorBoundary>
);
