import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  FolderKanban,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Building2,
  TrendingUp,
  Eye,
  MessageSquare,
  Landmark,
  Shield,
  Vote,
} from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  const stats = [
    { label: "Total Projects", value: "1,247", icon: FolderKanban, color: "text-primary" },
    { label: "Active Citizens", value: "45,000+", icon: Users, color: "text-success" },
    { label: "Issues Resolved", value: "3,892", icon: CheckCircle2, color: "text-status-ongoing" },
    { label: "Departments", value: "28", icon: Building2, color: "text-accent" },
  ];

  const features = [
    {
      icon: Eye,
      title: "Transparent Projects",
      description: "View all public infrastructure projects with real-time progress tracking and budget allocation details.",
    },
    {
      icon: TrendingUp,
      title: "Budget Monitoring",
      description: "Track how public funds are allocated and spent across various government projects and initiatives.",
    },
    {
      icon: AlertCircle,
      title: "Report Issues",
      description: "Raise concerns and grievances about any project directly to the responsible officials.",
    },
    {
      icon: MessageSquare,
      title: "Community Engagement",
      description: "Comment on projects, share feedback, and participate in discussions with fellow citizens.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Register as Citizen",
      description: "Create your account with basic details to become a verified citizen participant.",
    },
    {
      step: "02",
      title: "Browse Projects",
      description: "Explore all ongoing and planned government projects in your area and beyond.",
    },
    {
      step: "03",
      title: "Track & Monitor",
      description: "Follow project progress, budget utilization, and timeline updates in real-time.",
    },
    {
      step: "04",
      title: "Raise Concerns",
      description: "Report issues, provide feedback, and engage with officials for better governance.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden govt-gradient py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMHY2aDZ2LTZoLTZ6bTEwIDB2Nmg2di02aC02em0wIDEwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        
        <div className="govt-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm mb-6">
              <Landmark className="h-4 w-4" />
              Government of India Initiative
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transparent Governance for{" "}
              <span className="text-accent">Every Citizen</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Track public projects, monitor budgets, and participate in civic 
              governance. Your voice matters in building a better nation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="saffron-gradient text-white border-0 text-lg h-12 px-8"
              >
                <Link to={isAuthenticated ? "/projects" : "/signup"}>
                  {isAuthenticated ? "View Projects" : "Get Started"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg h-12 px-8"
              >
                <Link to="/projects">
                  Explore Projects
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100V30C240 0 480 60 720 60C960 60 1200 0 1440 30V100H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-8 relative z-10">
        <div className="govt-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="govt-shadow border-0">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-1 animate-count-up">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="govt-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Empowering Citizens Through{" "}
              <span className="text-gradient">Transparency</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              CivicFusion brings government projects and civic participation 
              to your fingertips with powerful features designed for every citizen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 govt-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg saffron-gradient flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="govt-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started with CivicFusion is easy. Follow these simple steps 
              to become an active participant in transparent governance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full govt-gradient flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="govt-container">
          <Card className="govt-gradient border-0 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMHY2aDZ2LTZoLTZ6bTEwIDB2Nmg2di02aC02em0wIDEwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Shield className="h-8 w-8 text-accent" />
                  <Vote className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Join the Movement for Transparent Governance
                </h2>
                <p className="text-white/80 max-w-xl mx-auto mb-6">
                  Be part of the change. Register today and contribute to 
                  building a more accountable and transparent government.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Link to="/signup">
                      Register Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Link to="/projects">
                      View Projects
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
