import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getOrCreateUser, updateUserPremiumStatus } from '@/lib/db-utils';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET env var not set');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are missing headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const body = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload
  // Using the 'svix' library to verify is easier than doing it manually
  // and you do not need to check the timestamp. It validates the signature using the secret.
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err: any) {
    console.error('Error verifying webhook:', err.message);
    return new NextResponse('Error occurred', {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  // Handle user creation
  if (eventType === 'user.created') {
    const { id: userId, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (email) {
      await getOrCreateUser(userId, email, first_name, last_name);
      console.log(`Created user ${userId} in database`);
    }
  }

  // Handle user updates
  if (eventType === 'user.updated') {
    const { id: userId, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (email) {
      await getOrCreateUser(userId, email, first_name, last_name);
      console.log(`Updated user ${userId} in database`);
    }
  }

  // Handle user deletion
  if (eventType === 'user.deleted') {
    // You might want to soft-delete or archive the user instead
    console.log(`User ${id} deleted from Clerk`);
    // TODO: Implement user deletion/archiving if needed
  }

  return new NextResponse('Webhook received', { status: 200 });
}
