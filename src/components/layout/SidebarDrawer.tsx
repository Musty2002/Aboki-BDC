import { Phone, Mail, MessageCircle, Info, Share2, Star, Shield, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Browser } from "@capacitor/browser";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import abokiLogo from "@/assets/aboki-logo.jpg";
import { toast } from "@/hooks/use-toast";

interface SidebarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { icon: Phone, label: "Contact Us", action: "contact" },
  { icon: MessageCircle, label: "WhatsApp Support", action: "whatsapp" },
  { icon: Mail, label: "Email Us", action: "email" },
  { icon: Bell, label: "Enable Notifications", action: "notifications" },
  { icon: Share2, label: "Share App", action: "share" },
  { icon: Star, label: "Rate Us", action: "rate" },
  { icon: Shield, label: "Privacy Policy", action: "privacy" },
  { icon: Info, label: "About Aboki", action: "about" },
];

export function SidebarDrawer({ open, onOpenChange }: SidebarDrawerProps) {
  const isNative = Capacitor.isNativePlatform();

  const triggerHaptic = async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  };

  const handleMenuAction = async (action: string) => {
    await triggerHaptic();

    switch (action) {
      case "contact":
        if (isNative) {
          await Browser.open({ url: "tel:+2348012345678" });
        } else {
          window.open("tel:+2348012345678", "_self");
        }
        break;
      case "whatsapp":
        const whatsappUrl = "https://wa.me/2348012345678?text=Hello, I need help with Aboki Bureau De Change";
        if (isNative) {
          await Browser.open({ url: whatsappUrl });
        } else {
          window.open(whatsappUrl, "_blank");
        }
        break;
      case "email":
        if (isNative) {
          await Browser.open({ url: "mailto:support@abokibdc.com?subject=Support Request" });
        } else {
          window.open("mailto:support@abokibdc.com?subject=Support Request", "_self");
        }
        break;
      case "notifications":
        if (isNative) {
          const { PushNotifications } = await import("@capacitor/push-notifications");
          const result = await PushNotifications.requestPermissions();
          if (result.receive === "granted") {
            await PushNotifications.register();
            toast({
              title: "Notifications Enabled",
              description: "You'll receive rate alerts and news updates",
            });
          } else {
            toast({
              title: "Permission Denied",
              description: "Please enable notifications in your device settings",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Native App Required",
            description: "Push notifications are available in the mobile app",
          });
        }
        break;
      case "share":
        const shareData = {
          title: "Aboki Bureau De Change",
          text: "Check out Aboki BDC for the best exchange rates in Nigeria!",
          url: "https://abokibdc.com",
        };
        
        if (isNative) {
          await Share.share({
            title: shareData.title,
            text: shareData.text,
            url: shareData.url,
            dialogTitle: "Share Aboki BDC",
          });
        } else if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareData.url);
          toast({ title: "Link copied to clipboard!" });
        }
        break;
      case "rate":
        // Links to app stores
        const storeUrl = Capacitor.getPlatform() === "ios" 
          ? "https://apps.apple.com/app/aboki-bdc/id123456789" // Replace with actual App Store ID
          : "https://play.google.com/store/apps/details?id=com.abokibdc.app";
        
        if (isNative) {
          await Browser.open({ url: storeUrl });
        } else {
          toast({ 
            title: "Rate Us", 
            description: "Download our app to rate us on the app store!" 
          });
        }
        break;
      case "privacy":
        const privacyUrl = "https://abokibdc.com/privacy";
        if (isNative) {
          await Browser.open({ url: privacyUrl });
        } else {
          window.open(privacyUrl, "_blank");
        }
        break;
      case "about":
        toast({
          title: "About Aboki BDC",
          description: "Nigeria's trusted currency exchange platform. Providing real-time BDC rates since 2020.",
        });
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
