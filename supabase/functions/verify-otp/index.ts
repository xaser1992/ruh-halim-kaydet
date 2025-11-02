import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { create } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

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

    // JWT token'ları oluştur
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      console.error('JWT_SECRET bulunamadı');
      return new Response(
        JSON.stringify({ error: 'Sunucu yapılandırma hatası' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpiry = now + (60 * 60); // 1 saat
    const refreshTokenExpiry = now + (60 * 60 * 24 * 30); // 30 gün

    // Access token oluştur
    const accessToken = await create(
      { alg: "HS256", typ: "JWT" },
      {
        sub: userId,
        aud: "authenticated",
        role: "authenticated",
        email: email,
        exp: accessTokenExpiry,
        iat: now,
      },
      jwtSecret
    );

    // Refresh token oluştur
    const refreshToken = await create(
      { alg: "HS256", typ: "JWT" },
      {
        sub: userId,
        aud: "authenticated",
        role: "authenticated",
        email: email,
        exp: refreshTokenExpiry,
        iat: now,
      },
      jwtSecret
    );

    console.log(`✅ OTP doğrulandı ve session oluşturuldu: ${email}`);

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Doğrulama başarılı',
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: userId,
            email: email,
            email_confirmed_at: new Date().toISOString(),
          }
        }
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
