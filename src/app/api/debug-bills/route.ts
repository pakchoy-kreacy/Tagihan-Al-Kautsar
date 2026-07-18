import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId parameter is required' }, { status: 400 });
  }

  try {
    const { data: bills, error } = await supabase
      .from('bills')
      .select('id, month, year, status, amount, bill_types(name)')
      .eq('student_id', studentId)
      .order('year', { ascending: true })
      .order('month', { ascending: true }); // Order by month string ascending for raw comparison

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`--- Debug Bills for Student ID: ${studentId} ---`);
    console.log(JSON.stringify(bills, null, 2));
    console.log('------------------------------------------');

    return NextResponse.json({ studentId, bills });

  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
