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
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'E-posta ve kod gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return new Response(
        JSON.stringify({ error: 'Kod 6 haneli sayı olmalıdır' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Kodu hash'le
    const { data: codeHash, error: hashError } = await supabase.rpc('hash_password', { 
      password: code 
    });

    if (hashError) {
      console.error('Hash hatası:', hashError);
      return new Response(
        JSON.stringify({ error: 'Doğrulama başarısız' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Database'den kodu kontrol et
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code_hash', codeHash)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (fetchError || !otpRecord) {
      console.error('OTP bulunamadı veya geçersiz:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Kod hatalı veya süresi dolmuş' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Kodu kullanıldı olarak işaretle
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Kullanıcının auth.users'da olup olmadığını kontrol et
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    let userId: string;
    const existingUser = users?.find(u => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Yeni kullanıcı oluştur
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        console.error('Kullanıcı oluşturma hatası:', createError);
        return new Response(
          JSON.stringify({ error: 'Kullanıcı oluşturulamadı' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = newUser.user.id;
    }

    // Kullanıcı için Supabase OTP oluştur ve direkt doğrula
    const { data: otpData, error: otpError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (otpError || !otpData) {
      console.error('OTP link oluşturma hatası:', otpError);
      return new Response(
        JSON.stringify({ error: 'Oturum oluşturulamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Link'ten hashed_token'ı çıkar ve frontend'e gönder
    // Frontend bu token ile supabase.auth.verifyOtp çağrısı yapacak
    console.log(`OTP doğrulandı: ${email}, hashed_token gönderiliyor`);

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Doğrulama başarılı',
        email: email,
        hashed_token: otpData.properties.hashed_token,
        email_otp: otpData.properties.email_otp // Bu varsa gönder
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('verify-otp hatası:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
