import { X, Phone, Mail, MessageCircle, Info, Settings, Share2, Star, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import abokiLogo from "@/assets/aboki-logo.jpg";

interface SidebarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { icon: Phone, label: "Contact Us", action: "contact" },
  { icon: MessageCircle, label: "WhatsApp Support", action: "whatsapp" },
  { icon: Mail, label: "Email Us", action: "email" },
  { icon: Share2, label: "Share App", action: "share" },
  { icon: Star, label: "Rate Us", action: "rate" },
  { icon: Shield, label: "Privacy Policy", action: "privacy" },
  { icon: Info, label: "About Aboki", action: "about" },
];

export function SidebarDrawer({ open, onOpenChange }: SidebarDrawerProps) {
  const handleMenuAction = (action: string) => {
    switch (action) {
      case "contact":
        window.open("tel:+2348012345678", "_self");
        break;
      case "whatsapp":
        window.open("https://wa.me/2348012345678?text=Hello, I need help with Aboki Bureau De Change", "_blank");
        break;
      case "email":
        window.open("mailto:support@abokibdc.com?subject=Support Request", "_self");
        break;
      case "share":
        if (navigator.share) {
          navigator.share({
            title: "Aboki Bureau De Change",
            text: "Check out Aboki BDC for the best exchange rates in Nigeria!",
            url: window.location.origin,
          });
        } else {
          navigator.clipboard.writeText(window.location.origin);
          alert("Link copied to clipboard!");
        }
        break;
      case "rate":
        // Would link to app store in production
        alert("Thank you for your interest! Rate us on the app store.");
        break;
      case "privacy":
        alert("Privacy Policy: We protect your data and never share it with third parties.");
        break;
      case "about":
        alert("Aboki Bureau De Change - Nigeria's trusted currency exchange platform since 2020.");
        break;
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-background">
        <SheetHeader className="bg-primary p-4 text-left">
          <div className="flex items-center gap-3">
            <img
              src={abokiLogo}
              alt="Aboki BDC"
              className="w-12 h-12 rounded-full object-cover border-2 border-primary-foreground/30"
            />
            <div>
              <SheetTitle className="text-primary-foreground text-lg">
                Aboki BDC
              </SheetTitle>
              <p className="text-primary-foreground/70 text-xs">
                Bureau De Change
              </p>
            </div>
          </div>
        </SheetHeader>

        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.action}
              onClick={() => handleMenuAction(item.action)}
              className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <p className="text-xs text-muted-foreground text-center">
            Version 1.0.0 • © 2024 Aboki BDC
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
