export interface Currency {
  code: string;
  flag: string;
  buyRate: number;
  sellRate: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  whatsappNumber: string;
  operatingHours: string;
  rating: number;
  reviewCount: number;
  currencies: Currency[];
}

export interface CityData {
  city: string;
  branches: Branch[];
}

export const branchesData: CityData[] = [
  {
    city: "ABUJA",
    branches: [
      {
        id: "abuja-wuse",
        name: "Wuse Zone 4 Branch",
        address: "Plot 123, Wuse Zone 4, Behind Sheraton Hotel, Abuja",
        city: "ABUJA",
        whatsappNumber: "2348012345678",
        operatingHours: "Mon-Fri: 8AM-5PM, Sat: 9AM-2PM",
        rating: 4.5,
        reviewCount: 128,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1580, sellRate: 1620 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1680, sellRate: 1720 },
          { code: "GBP", flag: "🇬🇧", buyRate: 1950, sellRate: 2000 },
          { code: "CAD", flag: "🇨🇦", buyRate: 1150, sellRate: 1180 },
          { code: "AED", flag: "🇦🇪", buyRate: 425, sellRate: 440 },
          { code: "CNY", flag: "🇨🇳", buyRate: 215, sellRate: 225 },
        ],
      },
      {
        id: "abuja-garki",
        name: "Garki Area 11 Branch",
        address: "No. 45 Ahmadu Bello Way, Garki Area 11, Abuja",
        city: "ABUJA",
        whatsappNumber: "2348023456789",
        operatingHours: "Mon-Fri: 8AM-5PM, Sat: 9AM-3PM",
        rating: 4.2,
        reviewCount: 89,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1575, sellRate: 1615 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1675, sellRate: 1715 },
          { code: "GBP", flag: "🇬🇧", buyRate: 1945, sellRate: 1995 },
          { code: "CAD", flag: "🇨🇦", buyRate: 1145, sellRate: 1175 },
        ],
      },
      {
        id: "abuja-maitama",
        name: "Maitama Branch",
        address: "25 Aguiyi Ironsi Street, Maitama District, Abuja",
        city: "ABUJA",
        whatsappNumber: "2348034567890",
        operatingHours: "Mon-Fri: 9AM-5PM",
        rating: 4.8,
        reviewCount: 156,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1582, sellRate: 1622 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1682, sellRate: 1722 },
          { code: "GBP", flag: "🇬🇧", buyRate: 1952, sellRate: 2002 },
          { code: "CAD", flag: "🇨🇦", buyRate: 1152, sellRate: 1182 },
          { code: "CHF", flag: "🇨🇭", buyRate: 1780, sellRate: 1830 },
          { code: "AUD", flag: "🇦🇺", buyRate: 1020, sellRate: 1060 },
        ],
      },
    ],
  },
  {
    city: "LAGOS",
    branches: [
      {
        id: "lagos-vi",
        name: "Victoria Island Branch",
        address: "15 Adeola Odeku Street, Victoria Island, Lagos",
        city: "LAGOS",
        whatsappNumber: "2348045678901",
        operatingHours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
        rating: 4.6,
        reviewCount: 234,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1575, sellRate: 1615 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1675, sellRate: 1715 },
          { code: "GBP", flag: "🇬🇧", buyRate: 1945, sellRate: 1995 },
          { code: "CAD", flag: "🇨🇦", buyRate: 1145, sellRate: 1175 },
          { code: "AED", flag: "🇦🇪", buyRate: 420, sellRate: 435 },
        ],
      },
      {
        id: "lagos-ikeja",
        name: "Ikeja GRA Branch",
        address: "8 Isaac John Street, Ikeja GRA, Lagos",
        city: "LAGOS",
        whatsappNumber: "2348056789012",
        operatingHours: "Mon-Fri: 8AM-5PM, Sat: 10AM-3PM",
        rating: 4.3,
        reviewCount: 167,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1572, sellRate: 1612 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1672, sellRate: 1712 },
          { code: "GBP", flag: "🇬🇧", buyRate: 1942, sellRate: 1992 },
        ],
      },
      {
        id: "lagos-lekki",
        name: "Lekki Phase 1 Branch",
        address: "Plot 22, Admiralty Way, Lekki Phase 1, Lagos",
        city: "LAGOS",
        whatsappNumber: "2348067890123",
        operatingHours: "Mon-Sat: 9AM-6PM",
        rating: 4.4,
        reviewCount: 145,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1578, sellRate: 1618 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1678, sellRate: 1718 },
          { code: "GBP", flag: "🇬🇧", buyRate: 1948, sellRate: 1998 },
          { code: "CAD", flag: "🇨🇦", buyRate: 1148, sellRate: 1178 },
        ],
      },
    ],
  },
  {
    city: "PORT HARCOURT",
    branches: [
      {
        id: "ph-gra",
        name: "GRA Phase 2 Branch",
        address: "45 Aba Road, GRA Phase 2, Port Harcourt",
        city: "PORT HARCOURT",
        whatsappNumber: "2348078901234",
        operatingHours: "Mon-Fri: 8AM-5PM",
        rating: 4.1,
        reviewCount: 78,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1570, sellRate: 1610 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1670, sellRate: 1710 },
          { code: "GBP", flag: "🇬🇧", buyRate: 1940, sellRate: 1990 },
          { code: "CAD", flag: "🇨🇦", buyRate: 1140, sellRate: 1170 },
        ],
      },
      {
        id: "ph-trans-amadi",
        name: "Trans Amadi Branch",
        address: "12 Trans Amadi Industrial Layout, Port Harcourt",
        city: "PORT HARCOURT",
        whatsappNumber: "2348089012345",
        operatingHours: "Mon-Fri: 9AM-4PM",
        rating: 3.9,
        reviewCount: 45,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1568, sellRate: 1608 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1668, sellRate: 1708 },
        ],
      },
    ],
  },
  {
    city: "KANO",
    branches: [
      {
        id: "kano-sabon-gari",
        name: "Sabon Gari Branch",
        address: "23 Bompai Road, Sabon Gari, Kano",
        city: "KANO",
        whatsappNumber: "2348090123456",
        operatingHours: "Mon-Sat: 8AM-5PM",
        rating: 4.0,
        reviewCount: 56,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1585, sellRate: 1625 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1685, sellRate: 1725 },
          { code: "GBP", flag: "🇬🇧", buyRate: 1955, sellRate: 2005 },
        ],
      },
    ],
  },
  {
    city: "KADUNA",
    branches: [
      {
        id: "kaduna-barnawa",
        name: "Barnawa Branch",
        address: "56 Ahmadu Bello Way, Barnawa, Kaduna",
        city: "KADUNA",
        whatsappNumber: "2348001234567",
        operatingHours: "Mon-Fri: 8AM-4PM",
        rating: 4.2,
        reviewCount: 34,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1582, sellRate: 1622 },
          { code: "EUR", flag: "🇪🇺", buyRate: 1682, sellRate: 1722 },
        ],
      },
    ],
  },
  {
    city: "BAUCHI",
    branches: [
      {
        id: "bauchi-main",
        name: "Bauchi Main Branch",
        address: "15 Jos Road, Bauchi Central, Bauchi",
        city: "BAUCHI",
        whatsappNumber: "2348012345679",
        operatingHours: "Mon-Fri: 9AM-4PM",
        rating: 3.8,
        reviewCount: 23,
        currencies: [
          { code: "USD", flag: "🇺🇸", buyRate: 1580, sellRate: 1620 },
        ],
      },
    ],
  },
];

export const allCurrencies = ["USD", "EUR", "GBP", "CAD", "AED", "CNY", "CHF", "AUD"];
