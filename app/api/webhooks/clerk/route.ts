import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/db-utils';

type ClerkEmailAddress = { email_address?: string };

type ClerkWebhookEvent = {
  type: string;
  data: {
    id?: string;
    email_addresses?: ClerkEmailAddress[];
    first_name?: string | null;
    last_name?: string | null;
  };
};

function isClerkWebhookEvent(value: unknown): value is ClerkWebhookEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const event = value as Partial<ClerkWebhookEvent>;
  if (typeof event.type !== 'string') {
    return false;
  }

  if (typeof event.data !== 'object' || event.data === null) {
    return false;
  }

  return true;
}

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

  let evt: unknown;

  // Verify the payload
  // Using the 'svix' library to verify is easier than doing it manually
  // and you do not need to check the timestamp. It validates the signature using the secret.
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error verifying webhook:', message);
    return new NextResponse('Error occurred', {
      status: 400,
    });
  }

  if (!isClerkWebhookEvent(evt)) {
    console.error('Invalid webhook payload received');
    return new NextResponse('Invalid payload', { status: 400 });
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
