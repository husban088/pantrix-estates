import { motion } from "framer-motion";
import Logo from "./Logo";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="card w-full max-w-md p-8 sm:p-10"
      >
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-8 text-center text-4xl font-semibold text-pine-800">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </motion.div>
    </div>
  );
}

export function FormError({ msg }: { msg: string }) {
  return msg ? (
    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{msg}</p>
  ) : null;
}
