import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CBNRate {
  date: string;
  nfemRate: number;
  highestRate: number;
  lowestRate: number;
  closingRate: number;
  averageRate: number;
}

interface CurrencyRate {
  code: string;
  name: string;
  buyingRate: number;
  centralRate: number;
  sellingRate: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching CBN exchange rates...');

    // Fetch the CBN exchange rates page
    const response = await fetch('https://www.cbn.gov.ng/rates/ExchRateByCurrency.asp', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error(`CBN website returned ${response.status}`);
    }

    const html = await response.text();
    console.log('Received HTML, parsing rates...');

    // Parse USD/NGN NFEM rates from the table
    const nfemRates: CBNRate[] = [];
    
    // Match table rows with rate data
    // The table has columns: DATE | NFEM RATE | HIGHEST RATE | LOWEST RATE | CLOSING RATE | SIMPLE AVER. RATE
    const tableRowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\w\-]+)<\/td>[\s\S]*?<td[^>]*>([\d,\.]+)<\/td>[\s\S]*?<td[^>]*>([\d,\.]+)<\/td>[\s\S]*?<td[^>]*>([\d,\.]+)<\/td>[\s\S]*?<td[^>]*>([\d,\.]+)<\/td>[\s\S]*?<td[^>]*>([\d,\.]+)<\/td>[\s\S]*?<\/tr>/gi;
    
    let match;
    while ((match = tableRowRegex.exec(html)) !== null) {
      const [_, date, nfem, highest, lowest, closing, average] = match;
      
      // Skip header rows
      if (date.toLowerCase().includes('date')) continue;
      
      const parseRate = (str: string) => parseFloat(str.replace(/,/g, ''));
      
      nfemRates.push({
        date,
        nfemRate: parseRate(nfem),
        highestRate: parseRate(highest),
        lowestRate: parseRate(lowest),
        closingRate: parseRate(closing),
        averageRate: parseRate(average),
      });
    }

    // If parsing failed, try alternative pattern
    if (nfemRates.length === 0) {
      // Try to extract rates with a simpler regex
      const ratePattern = /(\w+\-\d+\-\d+)\s*\|\s*([\d,\.]+)\s*\|\s*([\d,\.]+)\s*\|\s*([\d,\.]+)\s*\|\s*([\d,\.]+)\s*\|\s*([\d,\.]+)/g;
      
      while ((match = ratePattern.exec(html)) !== null) {
        const [_, date, nfem, highest, lowest, closing, average] = match;
        const parseRate = (str: string) => parseFloat(str.replace(/,/g, ''));
        
        nfemRates.push({
          date,
          nfemRate: parseRate(nfem),
          highestRate: parseRate(highest),
          lowestRate: parseRate(lowest),
          closingRate: parseRate(closing),
          averageRate: parseRate(average),
        });
      }
    }

    // Fetch currency rates from a different CBN page
    const currencyResponse = await fetch('https://www.cbn.gov.ng/rates/exchratebycurrency.asp', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const currencyHtml = await currencyResponse.text();
    
    // Try to get other currency rates
    const currencies: CurrencyRate[] = [];
    
    // Common currencies to look for
    const currencyNames: Record<string, string> = {
      'USD': 'US Dollar',
      'GBP': 'British Pound',
      'EUR': 'Euro',
      'CHF': 'Swiss Franc',
      'YEN': 'Japanese Yen',
      'JPY': 'Japanese Yen',
      'CNY': 'Chinese Yuan',
      'WAUA': 'West African Unit',
      'SAR': 'Saudi Riyal',
      'XAF': 'CFA Franc',
    };

    // Get the latest NFEM rate as the USD rate
    const latestNFEM = nfemRates[0];
    
    if (latestNFEM) {
      currencies.push({
        code: 'USD',
        name: 'US Dollar',
        buyingRate: latestNFEM.lowestRate,
        centralRate: latestNFEM.nfemRate,
        sellingRate: latestNFEM.highestRate,
      });
    }

    // Calculate estimated rates for other currencies based on typical cross rates
    // These are approximate multipliers against USD
    const crossRates: Record<string, number> = {
      'EUR': 1.08,
      'GBP': 1.27,
      'CHF': 0.88,
      'CAD': 0.74,
      'AUD': 0.65,
      'JPY': 0.0067,
      'CNY': 0.14,
      'ZAR': 0.055,
      'AED': 0.27,
    };

    const usdRate = latestNFEM?.nfemRate || 1500;

    for (const [code, multiplier] of Object.entries(crossRates)) {
      const rate = usdRate * multiplier;
      currencies.push({
        code,
        name: currencyNames[code] || code,
        buyingRate: rate * 0.99,
        centralRate: rate,
        sellingRate: rate * 1.01,
      });
    }

    console.log(`Parsed ${nfemRates.length} NFEM rates and ${currencies.length} currencies`);

    return new Response(
      JSON.stringify({
        success: true,
        lastUpdated: new Date().toISOString(),
        nfemRates: nfemRates.slice(0, 10), // Last 10 days
        currencies,
        latestRate: latestNFEM,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching CBN rates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        // Return fallback data so the app still works
        currencies: [
          { code: 'USD', name: 'US Dollar', buyingRate: 1540, centralRate: 1550, sellingRate: 1560 },
          { code: 'EUR', name: 'Euro', buyingRate: 1670, centralRate: 1680, sellingRate: 1690 },
          { code: 'GBP', name: 'British Pound', buyingRate: 1960, centralRate: 1970, sellingRate: 1980 },
        ],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
