import { sendUpdateEmail } from '@/lib/updateEmail';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // console.log('LOGIN EMAIL TRIGGERED FOR:', email);

    await sendUpdateEmail(
      'akshit07032001@gmail.com',
      `New user logged in: ${email}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('error', error);
  }
}
