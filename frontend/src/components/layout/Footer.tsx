import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="govt-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg govt-gradient">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-primary">Civic</span>
                <span className="font-bold text-lg text-accent">Fusion</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Empowering transparent governance through citizen participation. 
              Track public projects, monitor budgets, and voice your concerns.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  View Projects
                </Link>
              </li>
              <li>
                <Link to="/issues" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Report Issues
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Register as Citizen
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CivicFusion. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            A Government of India Initiative for Transparent Governance
          </p>
        </div>
      </div>
    </footer>
  );
};
