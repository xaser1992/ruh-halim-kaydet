import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Geçerli bir e-posta adresi gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6 haneli rastgele kod üret
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Kodu hash'le ve database'e kaydet
    const { data: hashData, error: hashError } = await supabase.rpc('hash_password', { 
      password: code 
    });

    if (hashError) {
      console.error('Hash hatası:', hashError);
      return new Response(
        JSON.stringify({ error: 'Kod oluşturulamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Eski kodları sil
    await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email);

    // Yeni kodu kaydet (10 dakika geçerli)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        email,
        code_hash: hashData,
        expires_at: expiresAt,
        used: false
      });

    if (insertError) {
      console.error('Kod kaydetme hatası:', insertError);
      return new Response(
        JSON.stringify({ error: 'Kod kaydedilemedi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SendGrid ile e-posta gönder
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject: 'Giriş Kodunuz'
        }],
        from: {
          email: Deno.env.get('FROM_EMAIL'),
          name: Deno.env.get('FROM_NAME')
        },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Giriş Kodunuz</h2>
              <p>Merhaba,</p>
              <p>Giriş yapmak için aşağıdaki 6 haneli kodu kullanın:</p>
              <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
                ${code}
              </div>
              <p style="color: #666; font-size: 14px;">Bu kod 10 dakika geçerlidir.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
          `
        }]
      })
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid hatası:', errorText);
      return new Response(
        JSON.stringify({ error: 'E-posta gönderilemedi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`OTP gönderildi: ${email}`);

    return new Response(
      JSON.stringify({ status: 'ok', message: 'OTP gönderildi' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('send-otp hatası:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
