import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CurrencyRate {
  code: string;
  name: string;
  buyingRate: number;
  centralRate: number;
  sellingRate: number;
}

// Currency metadata
const currencyInfo: Record<string, string> = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'CHF': 'Swiss Franc',
  'JPY': 'Japanese Yen',
  'CNY': 'Chinese Yuan',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'ZAR': 'South African Rand',
  'AED': 'UAE Dirham',
};

// Approximate cross rates against USD (these are typical market rates)
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching CBN exchange rates...');

    // Try multiple CBN URLs
    const urls = [
      'https://www.cbn.gov.ng/rates/ExchRateByCurrency.html',
      'https://www.cbn.gov.ng/rates/exchratebycurrency.asp',
      'https://www.cbn.gov.ng/rates/',
    ];

    let html = '';
    let fetchSuccess = false;

    for (const url of urls) {
      try {
        console.log(`Trying URL: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
        });

        if (response.ok) {
          html = await response.text();
          console.log(`Successfully fetched from ${url}, got ${html.length} bytes`);
          fetchSuccess = true;
          break;
        } else {
          console.log(`URL ${url} returned status ${response.status}`);
        }
      } catch (urlError) {
        console.log(`Failed to fetch ${url}:`, urlError);
      }
    }

    let usdRate = 1550; // Default fallback
    let latestRate = null;

    if (fetchSuccess && html.length > 0) {
      // Try to parse NFEM rate from the HTML
      // Look for patterns like: 1,445.6828 or 1445.68
      const nfemPatterns = [
        /NFEM\s*RATE[^0-9]*([\d,]+\.?\d*)/i,
        /(\d{1},?\d{3}\.?\d{0,4})\s*\|/g,
        /₦\/US\$[^0-9]*([\d,]+\.?\d*)/i,
        /December[^0-9]*([\d,]+\.?\d*)/i,
      ];

      for (const pattern of nfemPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const parsed = parseFloat(match[1].replace(/,/g, ''));
          if (parsed > 1000 && parsed < 5000) { // Reasonable NGN/USD range
            usdRate = parsed;
            console.log(`Found rate: ${usdRate} using pattern: ${pattern}`);
            break;
          }
        }
      }

      // Try to extract date
      const dateMatch = html.match(/(December|January|November|October)-(\d{1,2})-(\d{4})/i);
      if (dateMatch) {
        latestRate = {
          date: dateMatch[0],
          nfemRate: usdRate,
          highestRate: usdRate * 1.005,
          lowestRate: usdRate * 0.995,
          closingRate: usdRate,
          averageRate: usdRate,
        };
      }
    }

    // Build currency list
    const currencies: CurrencyRate[] = [
      {
        code: 'USD',
        name: 'US Dollar',
        buyingRate: usdRate * 0.995,
        centralRate: usdRate,
        sellingRate: usdRate * 1.005,
      },
    ];

    // Add other currencies based on cross rates
    for (const [code, multiplier] of Object.entries(crossRates)) {
      const rate = usdRate * multiplier;
      currencies.push({
        code,
        name: currencyInfo[code] || code,
        buyingRate: rate * 0.995,
        centralRate: rate,
        sellingRate: rate * 1.005,
      });
    }

    console.log(`Returning ${currencies.length} currencies with USD rate: ${usdRate}`);

    return new Response(
      JSON.stringify({
        success: fetchSuccess,
        lastUpdated: new Date().toISOString(),
        currencies,
        latestRate,
        source: fetchSuccess ? 'CBN Website' : 'Fallback Data',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching CBN rates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return comprehensive fallback data
    const fallbackUsdRate = 1550;
    const fallbackCurrencies: CurrencyRate[] = [
      { code: 'USD', name: 'US Dollar', buyingRate: 1542, centralRate: 1550, sellingRate: 1558 },
    ];

    for (const [code, multiplier] of Object.entries(crossRates)) {
      const rate = fallbackUsdRate * multiplier;
      fallbackCurrencies.push({
        code,
        name: currencyInfo[code] || code,
        buyingRate: rate * 0.995,
        centralRate: rate,
        sellingRate: rate * 1.005,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        currencies: fallbackCurrencies,
        source: 'Fallback Data',
        lastUpdated: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
