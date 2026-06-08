import { redirect } from 'next/navigation';
import { getAuthUrl } from '@/lib/instagram';

export function GET() {
  redirect(getAuthUrl());
}
