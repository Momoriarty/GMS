<!DOCTYPE html>
<html>
<head>
    <title>Kode OTP Reset Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333333; text-align: center;">Reset Password</h2>
        <p style="color: #555555; line-height: 1.5;">Halo,</p>
        <p style="color: #555555; line-height: 1.5;">Kami menerima permintaan untuk melakukan reset password pada akun Anda. Berikut adalah kode OTP 6 digit Anda:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; background-color: #f59e0b; color: #ffffff; border-radius: 8px; letter-spacing: 5px;">
                {{ $otp }}
            </span>
        </div>
        
        <p style="color: #555555; line-height: 1.5;">Masukkan kode ini pada aplikasi untuk melanjutkan proses pembuatan password baru.</p>
        <p style="color: #999999; font-size: 12px; margin-top: 30px; text-align: center;">Jika Anda tidak merasa meminta reset password, silakan abaikan email ini.</p>
    </div>
</body>
</html>
