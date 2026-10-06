import { Link } from "react-router-dom";
import { LogIn, UserPlus, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Dashboard par neeche-right corner me chhota account button (dashboard login ke baghair bhi khula rehta hai)
export default function DashAccount() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex gap-2">
      {user ? (
        <Link
          to="/profile"
          className="btn-primary px-5 py-2.5 text-xs shadow-lift"
        >
          <User size={15} /> {user.name.split(" ")[0]}
        </Link>
      ) : (
        <>
          <Link
            to="/login"
            className="btn-outline px-5 py-2.5 text-xs shadow-lift"
          >
            <LogIn size={15} /> Login
          </Link>
          <Link
            to="/signup"
            className="btn-primary px-5 py-2.5 text-xs shadow-lift"
          >
            <UserPlus size={15} /> Sign up
          </Link>
        </>
      )}
    </div>
  );
}
