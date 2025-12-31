import { useState, useEffect, forwardRef } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, Instagram, Twitter, Shield, Target, AlertCircle } from "lucide-react";
import { AboutSkeleton } from "@/components/ui/LoadingSkeleton";
import abokiLogo from "@/assets/aboki-logo.jpg";

const branches = [
  { name: "Abuja", address: "123 Central Business District, Abuja", phone: "+234 800 123 4567" },
  { name: "Lagos", address: "45 Victoria Island, Lagos", phone: "+234 800 123 4568" },
  { name: "Port Harcourt", address: "78 Trans Amadi, Port Harcourt", phone: "+234 800 123 4569" },
  { name: "Kano", address: "12 Sabon Gari, Kano", phone: "+234 800 123 4570" },
  { name: "Kaduna", address: "34 Ahmadu Bello Way, Kaduna", phone: "+234 800 123 4571" },
  { name: "Bauchi", address: "56 Jos Road, Bauchi", phone: "+234 800 123 4572" },
];

interface AboutScreenProps {
  onRefresh?: () => Promise<void>;
}

const AboutScreen = forwardRef<HTMLDivElement, AboutScreenProps>(
  ({ onRefresh }, ref) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
      return <AboutSkeleton />;
    }

    return (
      <div ref={ref} className="p-3 pb-6">
        {/* Company Info Card */}
        <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
          <div className="flex items-center gap-2">
            <img 
              src={abokiLogo} 
              alt="Aboki BDC" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <h2 className="font-bold text-card-foreground text-sm">Aboki Bureau De Change</h2>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-card-foreground text-xs">Our Mission</h3>
          </div>
          <p className="text-xs text-card-foreground leading-relaxed">
            At Aboki Bureau De Change, our mission is to empower individuals and businesses with accurate, 
            up-to-date foreign exchange information—delivered in a safe, legal, and fully transparent manner.
          </p>
        </div>

        {/* Compliance Statement */}
        <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-card-foreground text-xs">Regulatory Compliance</h3>
          </div>
          <p className="text-xs text-card-foreground leading-relaxed">
            Aboki Bureau De Change operates in strict accordance with the Nigerian Foreign Exchange 
            (Monitoring and Miscellaneous Provisions) Act and all applicable Central Bank of Nigeria (CBN) regulations. 
            We are committed to upholding the highest standards of legal and ethical conduct in the foreign exchange industry.
          </p>
        </div>

        {/* Operating Hours */}
        <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-card-foreground text-xs">Operating Hours</h3>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monday - Friday</span>
              <span className="text-card-foreground font-medium">8:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saturday</span>
              <span className="text-card-foreground font-medium">9:00 AM - 4:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sunday</span>
              <span className="text-card-foreground font-medium">Closed</span>
            </div>
          </div>
        </div>

        {/* Branch Locations */}
        <h3 className="text-sm font-semibold text-foreground mb-2">Our Offices</h3>
        <div className="flex flex-col gap-2 mb-3">
          {branches.map((branch) => (
            <div key={branch.name} className="bg-card rounded-xl p-3 shadow-lg">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground text-xs">{branch.name}</h4>
                  <p className="text-[10px] text-muted-foreground mb-1">{branch.address}</p>
                  <a
                    href={`tel:${branch.phone}`}
                    className="inline-flex items-center gap-1 text-[10px] text-primary font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    {branch.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <h3 className="text-sm font-semibold text-foreground mb-2">Contact Us</h3>
        <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
          <div className="space-y-2">
            <a
              href="mailto:info@abokibdc.com"
              className="flex items-center gap-2 text-card-foreground"
            >
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs">info@abokibdc.com</span>
            </a>
            <a
              href="https://wa.me/2348001234567"
              className="flex items-center gap-2 text-card-foreground"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs">WhatsApp: +234 800 123 4567</span>
            </a>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex items-center justify-center gap-3 py-3">
          <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg touch-target">
            <Facebook className="w-5 h-5 text-blue-600" />
          </button>
          <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg touch-target">
            <Instagram className="w-5 h-5 text-pink-500" />
          </button>
          <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg touch-target">
            <Twitter className="w-5 h-5 text-blue-400" />
          </button>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mt-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-[11px] mb-1">Important Disclaimer</h4>
              <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
                This app does not facilitate the buying, selling, or transfer of foreign currency. All exchange rate data 
                is sourced from publicly available financial information and CBN-licensed providers. While we strive for 
                accuracy, we do not guarantee the completeness or correctness of rates displayed and accept no responsibility 
                for financial decisions made based on this information.
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed mt-2">
                All phone numbers listed in this app belong to entities fully licensed by the Central Bank of Nigeria (CBN) 
                and are provided for informational purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-[10px] text-muted-foreground">
            © 2024 Aboki Bureau De Change. All rights reserved.
          </p>
          <p className="text-[9px] text-muted-foreground mt-1">
            Licensed by the Central Bank of Nigeria
          </p>
        </div>
      </div>
    );
  }
);

AboutScreen.displayName = "AboutScreen";

export default AboutScreen;
