import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { MercadoPagoConfig, Preference } from 'npm:mercadopago@2.0.4';

const client = new MercadoPagoConfig({ 
  accessToken: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { items, payer } = await req.json();

    const preference = await new Preference(client).create({
      items,
      payer,
      back_urls: {
        success: `${Deno.env.get('SITE_URL')}/order-confirmation`,
        failure: `${Deno.env.get('SITE_URL')}/checkout`,
      },
      auto_return: 'approved',
    });

    return new Response(
      JSON.stringify(preference),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        } 
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});