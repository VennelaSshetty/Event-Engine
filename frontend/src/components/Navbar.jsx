import { FiZap } from "react-icons/fi";

function Navbar() {
  return (
    <div className="border-b border-slate-700 bg-[#111827]">

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <FiZap size={24} />
          <h1 className="text-xl font-bold">
            Event Engine Dashboard
          </h1>
        </div>

        <div className="text-sm text-green-400">
          System Healthy
        </div>

      </div>

    </div>
  );
}

export default Navbar;