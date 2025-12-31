import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Branch data to seed
const branchesData = [
  {
    city: "ABUJA",
    branches: [
      {
        id: "abuja-wuse",
        name: "Wuse Zone 4 Office",
        address: "Plot 123, Wuse Zone 4, Behind Sheraton Hotel, Abuja",
        whatsappNumber: "2348012345678",
        operatingHours: "Mon-Fri: 8AM-5PM, Sat: 9AM-2PM",
        rating: 4.5,
        reviewCount: 128,
        currencies: [
          { code: "USD", buyRate: 1580, sellRate: 1620, denomination: "$100+" },
          { code: "USD", buyRate: 1550, sellRate: 1620, denomination: "$1" },
          { code: "USD", buyRate: 1560, sellRate: 1620, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1680, sellRate: 1720 },
          { code: "GBP", buyRate: 1950, sellRate: 2000 },
          { code: "CAD", buyRate: 1150, sellRate: 1180 },
          { code: "AED", buyRate: 425, sellRate: 440 },
          { code: "CNY", buyRate: 215, sellRate: 225 },
        ],
      },
      {
        id: "abuja-garki",
        name: "Garki Area 11 Office",
        address: "No. 45 Ahmadu Bello Way, Garki Area 11, Abuja",
        whatsappNumber: "2348023456789",
        operatingHours: "Mon-Fri: 8AM-5PM, Sat: 9AM-3PM",
        rating: 4.2,
        reviewCount: 89,
        currencies: [
          { code: "USD", buyRate: 1575, sellRate: 1615, denomination: "$100+" },
          { code: "USD", buyRate: 1545, sellRate: 1615, denomination: "$1" },
          { code: "USD", buyRate: 1555, sellRate: 1615, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1675, sellRate: 1715 },
          { code: "GBP", buyRate: 1945, sellRate: 1995 },
          { code: "CAD", buyRate: 1145, sellRate: 1175 },
        ],
      },
      {
        id: "abuja-maitama",
        name: "Maitama Office",
        address: "25 Aguiyi Ironsi Street, Maitama District, Abuja",
        whatsappNumber: "2348034567890",
        operatingHours: "Mon-Fri: 9AM-5PM",
        rating: 4.8,
        reviewCount: 156,
        currencies: [
          { code: "USD", buyRate: 1582, sellRate: 1622, denomination: "$100+" },
          { code: "USD", buyRate: 1552, sellRate: 1622, denomination: "$1" },
          { code: "USD", buyRate: 1562, sellRate: 1622, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1682, sellRate: 1722 },
          { code: "GBP", buyRate: 1952, sellRate: 2002 },
          { code: "CAD", buyRate: 1152, sellRate: 1182 },
          { code: "CHF", buyRate: 1780, sellRate: 1830 },
          { code: "AUD", buyRate: 1020, sellRate: 1060 },
        ],
      },
    ],
  },
  {
    city: "LAGOS",
    branches: [
      {
        id: "lagos-vi",
        name: "Victoria Island Office",
        address: "15 Adeola Odeku Street, Victoria Island, Lagos",
        whatsappNumber: "2348045678901",
        operatingHours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
        rating: 4.6,
        reviewCount: 234,
        currencies: [
          { code: "USD", buyRate: 1575, sellRate: 1615, denomination: "$100+" },
          { code: "USD", buyRate: 1545, sellRate: 1615, denomination: "$1" },
          { code: "USD", buyRate: 1555, sellRate: 1615, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1675, sellRate: 1715 },
          { code: "GBP", buyRate: 1945, sellRate: 1995 },
          { code: "CAD", buyRate: 1145, sellRate: 1175 },
          { code: "AED", buyRate: 420, sellRate: 435 },
        ],
      },
      {
        id: "lagos-ikeja",
        name: "Ikeja GRA Office",
        address: "8 Isaac John Street, Ikeja GRA, Lagos",
        whatsappNumber: "2348056789012",
        operatingHours: "Mon-Fri: 8AM-5PM, Sat: 10AM-3PM",
        rating: 4.3,
        reviewCount: 167,
        currencies: [
          { code: "USD", buyRate: 1572, sellRate: 1612, denomination: "$100+" },
          { code: "USD", buyRate: 1542, sellRate: 1612, denomination: "$1" },
          { code: "USD", buyRate: 1552, sellRate: 1612, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1672, sellRate: 1712 },
          { code: "GBP", buyRate: 1942, sellRate: 1992 },
        ],
      },
      {
        id: "lagos-lekki",
        name: "Lekki Phase 1 Office",
        address: "Plot 22, Admiralty Way, Lekki Phase 1, Lagos",
        whatsappNumber: "2348067890123",
        operatingHours: "Mon-Sat: 9AM-6PM",
        rating: 4.4,
        reviewCount: 145,
        currencies: [
          { code: "USD", buyRate: 1578, sellRate: 1618, denomination: "$100+" },
          { code: "USD", buyRate: 1548, sellRate: 1618, denomination: "$1" },
          { code: "USD", buyRate: 1558, sellRate: 1618, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1678, sellRate: 1718 },
          { code: "GBP", buyRate: 1948, sellRate: 1998 },
          { code: "CAD", buyRate: 1148, sellRate: 1178 },
        ],
      },
    ],
  },
  {
    city: "PORT HARCOURT",
    branches: [
      {
        id: "ph-gra",
        name: "GRA Phase 2 Office",
        address: "45 Aba Road, GRA Phase 2, Port Harcourt",
        whatsappNumber: "2348078901234",
        operatingHours: "Mon-Fri: 8AM-5PM",
        rating: 4.1,
        reviewCount: 78,
        currencies: [
          { code: "USD", buyRate: 1570, sellRate: 1610, denomination: "$100+" },
          { code: "USD", buyRate: 1540, sellRate: 1610, denomination: "$1" },
          { code: "USD", buyRate: 1550, sellRate: 1610, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1670, sellRate: 1710 },
          { code: "GBP", buyRate: 1940, sellRate: 1990 },
          { code: "CAD", buyRate: 1140, sellRate: 1170 },
        ],
      },
      {
        id: "ph-trans-amadi",
        name: "Trans Amadi Office",
        address: "12 Trans Amadi Industrial Layout, Port Harcourt",
        whatsappNumber: "2348089012345",
        operatingHours: "Mon-Fri: 9AM-4PM",
        rating: 3.9,
        reviewCount: 45,
        currencies: [
          { code: "USD", buyRate: 1568, sellRate: 1608, denomination: "$100+" },
          { code: "USD", buyRate: 1538, sellRate: 1608, denomination: "$1" },
          { code: "USD", buyRate: 1548, sellRate: 1608, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1668, sellRate: 1708 },
        ],
      },
    ],
  },
  {
    city: "KANO",
    branches: [
      {
        id: "kano-sabon-gari",
        name: "Sabon Gari Office",
        address: "23 Bompai Road, Sabon Gari, Kano",
        whatsappNumber: "2348090123456",
        operatingHours: "Mon-Sat: 8AM-5PM",
        rating: 4.0,
        reviewCount: 56,
        currencies: [
          { code: "USD", buyRate: 1585, sellRate: 1625, denomination: "$100+" },
          { code: "USD", buyRate: 1555, sellRate: 1625, denomination: "$1" },
          { code: "USD", buyRate: 1565, sellRate: 1625, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1685, sellRate: 1725 },
          { code: "GBP", buyRate: 1955, sellRate: 2005 },
        ],
      },
    ],
  },
  {
    city: "KADUNA",
    branches: [
      {
        id: "kaduna-barnawa",
        name: "Barnawa Office",
        address: "56 Ahmadu Bello Way, Barnawa, Kaduna",
        whatsappNumber: "2348001234567",
        operatingHours: "Mon-Fri: 8AM-4PM",
        rating: 4.2,
        reviewCount: 34,
        currencies: [
          { code: "USD", buyRate: 1582, sellRate: 1622, denomination: "$100+" },
          { code: "USD", buyRate: 1552, sellRate: 1622, denomination: "$1" },
          { code: "USD", buyRate: 1562, sellRate: 1622, denomination: "$5,$10,$20" },
          { code: "EUR", buyRate: 1682, sellRate: 1722 },
        ],
      },
    ],
  },
  {
    city: "BAUCHI",
    branches: [
      {
        id: "bauchi-main",
        name: "Bauchi Main Office",
        address: "15 Jos Road, Bauchi Central, Bauchi",
        whatsappNumber: "2348012345679",
        operatingHours: "Mon-Fri: 9AM-4PM",
        rating: 3.8,
        reviewCount: 23,
        currencies: [
          { code: "USD", buyRate: 1580, sellRate: 1620, denomination: "$100+" },
          { code: "USD", buyRate: 1550, sellRate: 1620, denomination: "$1" },
          { code: "USD", buyRate: 1560, sellRate: 1620, denomination: "$5,$10,$20" },
        ],
      },
    ],
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { setupKey } = await req.json();

    // Validate setup key
    const expectedSetupKey = Deno.env.get('ADMIN_SETUP_KEY') || 'aboki-admin-setup-2024';
    if (setupKey !== expectedSetupKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid setup key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if branches already exist
    const { count: branchCount } = await supabase
      .from('branches')
      .select('*', { count: 'exact', head: true });

    if (branchCount && branchCount > 0) {
      return new Response(
        JSON.stringify({ error: 'Branches already seeded', count: branchCount }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get currency map
    const { data: currenciesData, error: currError } = await supabase
      .from('currencies')
      .select('id, code');

    if (currError) throw new Error(`Error fetching currencies: ${currError.message}`);

    const currencyMap: Record<string, string> = {};
    currenciesData?.forEach(c => {
      currencyMap[c.code] = c.id;
    });

    let branchesCreated = 0;
    let ratesCreated = 0;

    for (const cityData of branchesData) {
      // Get or create city
      let cityId: string;
      
      const { data: existingCity } = await supabase
        .from('cities')
        .select('id')
        .ilike('name', cityData.city)
        .maybeSingle();

      if (existingCity) {
        cityId = existingCity.id;
      } else {
        const { data: newCity, error: cityError } = await supabase
          .from('cities')
          .insert({ name: cityData.city })
          .select()
          .single();

        if (cityError) throw new Error(`Error creating city ${cityData.city}: ${cityError.message}`);
        cityId = newCity.id;
      }

      // Create branches
      for (const branch of cityData.branches) {
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .insert({
            city_id: cityId,
            name: branch.name,
            address: branch.address,
            whatsapp_number: branch.whatsappNumber,
            operating_hours: branch.operatingHours,
            rating: branch.rating,
            review_count: branch.reviewCount,
          })
          .select()
          .single();

        if (branchError) {
          console.error(`Error creating branch ${branch.name}:`, branchError);
          continue;
        }

        branchesCreated++;

        // Create rates
        for (const currency of branch.currencies) {
          const currencyId = currencyMap[currency.code];
          if (!currencyId) {
            console.warn(`Currency ${currency.code} not found, skipping`);
            continue;
          }

          const { error: rateError } = await supabase
            .from('branch_rates')
            .insert({
              branch_id: branchData.id,
              currency_id: currencyId,
              denomination: currency.denomination || null,
              buy_rate: currency.buyRate,
              sell_rate: currency.sellRate,
            });

          if (rateError) {
            console.error(`Error creating rate for ${branch.name} ${currency.code}:`, rateError);
          } else {
            ratesCreated++;
          }
        }
      }
    }

    console.log(`Seeded ${branchesCreated} branches with ${ratesCreated} rates`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        branchesCreated,
        ratesCreated,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in seed-branches:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
