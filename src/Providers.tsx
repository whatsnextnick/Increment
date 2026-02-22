import { Outlet } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import { ToastProvider } from "./components/ui/Toast";

const Providers = () => {
  return (
    <SessionProvider>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </SessionProvider>
  );
};

export default Providers;
