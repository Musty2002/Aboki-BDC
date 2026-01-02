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

// Currencies we want to display
const targetCurrencies = ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'CNY', 'ZAR', 'AED'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching exchange rates from ExchangeRate-API...');
    
    const apiKey = Deno.env.get('EXCHANGERATE_API_KEY');
    
    if (!apiKey) {
      console.error('EXCHANGERATE_API_KEY not configured');
      throw new Error('API key not configured');
    }

    // Fetch rates from ExchangeRate-API (NGN as base to get how much 1 foreign currency = X NGN)
    // We need to fetch USD as base and then convert
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ExchangeRate-API error:', response.status, errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('ExchangeRate-API response result:', data.result);

    if (data.result !== 'success') {
      console.error('API returned error:', data['error-type']);
      throw new Error(data['error-type'] || 'API error');
    }

    const rates = data.conversion_rates;
    const ngnPerUsd = rates.NGN; // How many NGN per 1 USD
    
    console.log(`NGN per USD: ${ngnPerUsd}`);

    // Build currency list
    const currencies: CurrencyRate[] = [];
    
    for (const code of targetCurrencies) {
      if (code === 'USD') {
        // USD rate is direct
        currencies.push({
          code: 'USD',
          name: currencyInfo['USD'],
          buyingRate: ngnPerUsd * 0.995, // 0.5% spread
          centralRate: ngnPerUsd,
          sellingRate: ngnPerUsd * 1.005,
        });
      } else if (rates[code]) {
        // Calculate how many NGN for 1 unit of this currency
        // rates[code] = how many [code] per 1 USD
        // So 1 [code] = (1 / rates[code]) USD = (ngnPerUsd / rates[code]) NGN
        const ngnPerUnit = ngnPerUsd / rates[code];
        
        currencies.push({
          code,
          name: currencyInfo[code] || code,
          buyingRate: ngnPerUnit * 0.995,
          centralRate: ngnPerUnit,
          sellingRate: ngnPerUnit * 1.005,
        });
      }
    }

    console.log(`Returning ${currencies.length} currencies with USD rate: ₦${ngnPerUsd.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        success: true,
        lastUpdated: data.time_last_update_utc || new Date().toISOString(),
        currencies,
        latestRate: {
          date: new Date().toISOString().split('T')[0],
          nfemRate: ngnPerUsd,
          closingRate: ngnPerUsd,
          averageRate: ngnPerUsd,
        },
        source: 'ExchangeRate-API',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return fallback data with error info
    const fallbackUsdRate = 1550;
    const fallbackCurrencies: CurrencyRate[] = [
      { code: 'USD', name: 'US Dollar', buyingRate: 1542, centralRate: 1550, sellingRate: 1558 },
      { code: 'EUR', name: 'Euro', buyingRate: 1665, centralRate: 1674, sellingRate: 1682 },
      { code: 'GBP', name: 'British Pound', buyingRate: 1959, centralRate: 1969, sellingRate: 1978 },
      { code: 'CHF', name: 'Swiss Franc', buyingRate: 1357, centralRate: 1364, sellingRate: 1371 },
      { code: 'CAD', name: 'Canadian Dollar', buyingRate: 1141, centralRate: 1147, sellingRate: 1153 },
      { code: 'AUD', name: 'Australian Dollar', buyingRate: 1002, centralRate: 1008, sellingRate: 1013 },
      { code: 'JPY', name: 'Japanese Yen', buyingRate: 10.33, centralRate: 10.39, sellingRate: 10.44 },
      { code: 'CNY', name: 'Chinese Yuan', buyingRate: 216, centralRate: 217, sellingRate: 218 },
      { code: 'ZAR', name: 'South African Rand', buyingRate: 85, centralRate: 85, sellingRate: 86 },
      { code: 'AED', name: 'UAE Dirham', buyingRate: 416, centralRate: 419, sellingRate: 421 },
    ];

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
