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
      .single();

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

    // Admin olarak kullanıcı için session token'ları oluştur
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: 'https://ruh-halim-kaydet.lovable.app'
      }
    });

    if (sessionError || !sessionData?.properties?.action_link) {
      console.error('Session oluşturma hatası:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Oturum oluşturulamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // URL'den token'ları çıkar
    const actionLink = sessionData.properties.action_link;
    const urlParams = new URLSearchParams(actionLink.split('?')[1] || '');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      console.error('Token parse hatası. Action link:', actionLink);
      return new Response(
        JSON.stringify({ error: 'Token oluşturulamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`OTP doğrulandı: ${email}, tokens parsed successfully`);

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Doğrulama başarılı',
        access_token: accessToken,
        refresh_token: refreshToken
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
