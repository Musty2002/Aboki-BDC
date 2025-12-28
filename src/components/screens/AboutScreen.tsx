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
    <div className="p-4 pb-8">
      {/* Company Info Card */}
      <div className="bg-card rounded-xl p-5 shadow-lg mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="font-brand text-primary-foreground text-lg">A</span>
          </div>
          <div>
            <h2 className="font-bold text-card-foreground text-lg">Aboki Bureau De Change</h2>
            <p className="text-sm text-muted-foreground">Licensed BDC Operator</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aboki Bureau De Change is a licensed and registered Bureau De Change operator in Nigeria. 
          We provide reliable and competitive foreign exchange services across multiple locations nationwide.
        </p>
      </div>

      {/* Operating Hours */}
      <div className="bg-card rounded-xl p-4 shadow-lg mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Operating Hours</h3>
        </div>
        <div className="space-y-2 text-sm">
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
      <h3 className="text-lg font-semibold text-foreground mb-3">Our Branches</h3>
      <div className="flex flex-col gap-3 mb-4">
        {branches.map((branch) => (
          <div key={branch.name} className="bg-card rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-card-foreground">{branch.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{branch.address}</p>
                <a
                  href={`tel:${branch.phone}`}
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium"
                >
                  <Phone className="w-4 h-4" />
                  {branch.phone}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <h3 className="text-lg font-semibold text-foreground mb-3">Contact Us</h3>
      <div className="bg-card rounded-xl p-4 shadow-lg mb-4">
        <div className="space-y-3">
          <a
            href="mailto:info@abokibdc.com"
            className="flex items-center gap-3 text-card-foreground"
          >
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-sm">info@abokibdc.com</span>
          </a>
          <a
            href="https://wa.me/2348001234567"
            className="flex items-center gap-3 text-card-foreground"
          >
            <MessageCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">WhatsApp: +234 800 123 4567</span>
          </a>
        </div>
      </div>

      {/* Social Media */}
      <div className="flex items-center justify-center gap-4 py-4">
        <button className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-lg touch-target">
          <Facebook className="w-6 h-6 text-blue-600" />
        </button>
        <button className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-lg touch-target">
          <Instagram className="w-6 h-6 text-pink-500" />
        </button>
        <button className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-lg touch-target">
          <Twitter className="w-6 h-6 text-blue-400" />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-secondary/30 rounded-xl p-4 mt-4">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Aboki Bureau De Change is licensed by the Central Bank of Nigeria (CBN). 
          All rates displayed are for informational purposes only and subject to change without notice.
        </p>
      </div>
    </div>
  );
};

export default AboutScreen;
