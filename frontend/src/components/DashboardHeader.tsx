import { Leaf, BarChart3, Bell } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="tea-gradient px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center backdrop-blur-sm">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-primary-foreground tracking-wide">
            TeaBiz
          </h1>
          <p className="text-xs text-primary-foreground/70 font-body">
            Admin Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
          <BarChart3 className="w-4 h-4 text-primary-foreground" />
        </button>
        <button className="w-9 h-9 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors relative">
          <Bell className="w-4 h-4 text-primary-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-primary" />
        </button>
        <div className="ml-2 w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-sm font-bold text-accent-foreground">
          TB
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
