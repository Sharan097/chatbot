
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

interface Vote {
  messageId: string;
  chatId: string;
  userId: string;
  vote: 'up' | 'down';
  timestamp: string;
  messageContent?: string;
  model?: string;
}

interface SessionUser {
  id?: string;
  email?: string;
  name?: string;
  image?: string;
}

// In-memory vote storage (replace with database in production)
const votesStore = new Map<string, Vote>();

// to get user ID
function getUserId(user: SessionUser): string {
  return user.id || user.email || 'default-user';
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, chatId, vote, messageContent, model } = await request.json();
    const userId = getUserId(session.user as SessionUser);

    // Validate input
    if (!messageId || !chatId || !vote) {
      return NextResponse.json(
        { error: 'Missing required fields: messageId, chatId, vote' },
        { status: 400 }
      );
    }

    if (vote !== 'up' && vote !== 'down') {
      return NextResponse.json(
        { error: 'Invalid vote. Must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Create vote key
    const voteKey = `${userId}:${messageId}`;

    // Check if user already voted on this message
    const existingVote = votesStore.get(voteKey);

    if (existingVote && existingVote.vote === vote) {
      
      votesStore.delete(voteKey);                                          // User clicked the same vote again - remove vote (toggle off)
      console.log(`Vote removed for message ${messageId}`);
      
      return NextResponse.json({
        success: true,
        action: 'removed',
        vote: null,
      });
    }

    // Store or update vote
    const voteData: Vote = {
      messageId,
      chatId,
      userId,
      vote,
      timestamp: new Date().toISOString(),
      messageContent,
      model,
    };

    votesStore.set(voteKey, voteData);

    console.log(`VVote ${vote} recorded for message ${messageId}`);

    // In production, you might send this to analytics or training pipeline
    // await sendToAnalytics(voteData);

    return NextResponse.json({
      success: true,
      action: existingVote ? 'updated' : 'created',
      vote,
    });

  } catch (error) {
    const err = error as Error;
    console.error('VVote API Error:', err);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve votes for a specific message or chat
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');
    const chatId = searchParams.get('chatId');
    const userId = getUserId(session.user as SessionUser);

    if (messageId) {
      // Get vote for a specific message
      const voteKey = `${userId}:${messageId}`;
      const vote = votesStore.get(voteKey);
      
      return NextResponse.json({
        vote: vote?.vote || null,
      });
    }

    if (chatId) {
      // Get all votes for a chat
      const chatVotes: Vote[] = [];
      
      votesStore.forEach((vote) => {
        if (vote.chatId === chatId && vote.userId === userId) {
          chatVotes.push(vote);
        }
      });
      
      return NextResponse.json({
        votes: chatVotes,
      });
    }

    return NextResponse.json({ error: 'Missing messageId or chatId' }, { status: 400 });

  } catch (error) {
    const err = error as Error;
    console.error('VGet Vote Error:', err);
    return NextResponse.json(
      { error: 'Failed to get votes' },
      { status: 500 }
    );
  }
}
