
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  userId: string;
}

// Extend session user type
interface SessionUser {
  id?: string;
  email?: string;
  name?: string;
  image?: string;
}

const chatHistoryStore = new Map<string, ChatHistoryItem[]>();
const recentSaves = new Map<string, number>();
const DEBOUNCE_TIME = 1000;

// Helper function to get user ID
function getUserId(user: SessionUser): string {
  return user.id || user.email || 'default-user';
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = getUserId(session.user as SessionUser);
    const chatId = searchParams.get('chatId');

    const history = chatHistoryStore.get(userId) || [];

    if (chatId) {
      const chat = history.find(item => item.id === chatId);
      if (chat) {
        return NextResponse.json(chat);
      }
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const uniqueHistory = Array.from(
      new Map(history.map(item => [item.id, item])).values()
    )
      .slice(-15)
      .reverse()
      .map(({ id, title, timestamp }) => ({ id, title, timestamp }));

    return NextResponse.json(uniqueHistory);
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, title, timestamp, messages = [] } = body;
    const userId = getUserId(session.user as SessionUser);

    if (!chatId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: chatId and title' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const lastSave = recentSaves.get(chatId);
    
    if (lastSave && (now - lastSave) < DEBOUNCE_TIME) {
      console.log(`⏸Debounced save for chat ${chatId}`);
      return NextResponse.json({ success: true, debounced: true }, { status: 200 });
    }

    recentSaves.set(chatId, now);

    const history = chatHistoryStore.get(userId) || [];
    const existingIndex = history.findIndex(item => item.id === chatId);

    if (existingIndex !== -1) {
      history[existingIndex] = {
        ...history[existingIndex],
        title,
        timestamp: timestamp || history[existingIndex].timestamp,
        messages,
        userId,
      };
    } else {
      history.push({
        id: chatId,
        title,
        timestamp: timestamp || new Date().toISOString(),
        messages,
        userId,
      });

      if (history.length > 15) {
        history.shift();
      }
    }

    chatHistoryStore.set(userId, history);

    // Cleanup old debounce entries
    for (const [id, time] of recentSaves.entries()) {
      if (now - time > 5000) {
        recentSaves.delete(id);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/history error:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = getUserId(session.user as SessionUser);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
    }

    const history = chatHistoryStore.get(userId) || [];
    const updatedHistory = history.filter(item => item.id !== chatId);

    chatHistoryStore.set(userId, updatedHistory);
    recentSaves.delete(chatId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/history error:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
