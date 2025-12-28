import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, Instagram, Twitter } from "lucide-react";

const branches = [
  { name: "Abuja", address: "123 Central Business District, Abuja", phone: "+234 800 123 4567" },
  { name: "Lagos", address: "45 Victoria Island, Lagos", phone: "+234 800 123 4568" },
  { name: "Port Harcourt", address: "78 Trans Amadi, Port Harcourt", phone: "+234 800 123 4569" },
  { name: "Kano", address: "12 Sabon Gari, Kano", phone: "+234 800 123 4570" },
  { name: "Kaduna", address: "34 Ahmadu Bello Way, Kaduna", phone: "+234 800 123 4571" },
  { name: "Bauchi", address: "56 Jos Road, Bauchi", phone: "+234 800 123 4572" },
];

const AboutScreen = () => {
  return (
    <div className="p-3 pb-6">
      {/* Company Info Card */}
      <div className="bg-card rounded-xl p-3 shadow-lg mb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <span className="font-bold text-primary-foreground text-sm">A</span>
          </div>
          <div>
            <h2 className="font-bold text-card-foreground text-sm">Aboki Bureau De Change</h2>
            <p className="text-[10px] text-muted-foreground">Licensed BDC Operator</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Aboki Bureau De Change is a licensed and registered Bureau De Change operator in Nigeria. 
          We provide reliable and competitive foreign exchange services across multiple locations nationwide.
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
      <h3 className="text-sm font-semibold text-foreground mb-2">Our Branches</h3>
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

      {/* Disclaimer */}
      <div className="bg-secondary/30 rounded-xl p-3 mt-3">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Aboki Bureau De Change is licensed by the Central Bank of Nigeria (CBN). 
          All rates displayed are for informational purposes only and subject to change without notice.
        </p>
      </div>
    </div>
  );
};

export default AboutScreen;
