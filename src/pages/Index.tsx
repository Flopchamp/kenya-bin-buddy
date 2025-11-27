import { MapPin, Trash2, TrendingUp, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Monitor all waste bins and collection vehicles in real-time with GPS tracking.",
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Data-driven insights for optimized routes and efficient waste management.",
    },
    {
      icon: Trash2,
      title: "Bin Management",
      description: "Track fill levels, schedule collections, and prevent overflow situations.",
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Dedicated portals for admins, drivers, and citizens with role-based features.",
    },
  ];

  const benefits = [
    "Reduce collection costs by up to 40%",
    "Minimize environmental impact",
    "Improve citizen satisfaction",
    "Optimize collection routes automatically",
    "Real-time alerts and notifications",
    "Comprehensive analytics dashboard",
  ];

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Header />
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Smart City Solution for Kenya</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Smart Garbage
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tracking System
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform waste management with real-time tracking, optimized routes, and intelligent analytics. 
            Built for Kenyan cities to create cleaner, smarter communities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-eco)] group"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary/30 hover:bg-primary/5"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need for efficient waste management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-eco)] transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Card className="border-border/50 shadow-[var(--shadow-card)] overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-[var(--gradient-eco)] p-12 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Trash2 className="h-20 w-20 text-white mx-auto" />
                  <h3 className="text-3xl font-bold text-white">
                    Cleaner Cities
                  </h3>
                  <p className="text-white/90">
                    Making Kenya's urban areas more sustainable
                  </p>
                </div>
              </div>
              
              <div className="p-12">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Key Benefits
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Transform Waste Management?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join the smart city revolution and make your community cleaner and more efficient.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-eco)]"
            onClick={() => navigate('/dashboard')}
          >
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
