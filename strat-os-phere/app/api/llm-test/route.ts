import { NextResponse } from 'next/server'

import { callLLM } from '@/lib/llm/callLLM'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const hello = await callLLM({
      messages: [
        { role: 'system', content: 'You are helpful.' },
        { role: 'user', content: "Say 'hello world' exactly." },
      ],
    })

    const jsonMode = await callLLM({
      messages: [
        { role: 'system', content: 'You are helpful.' },
        { role: 'user', content: 'Return {"ok": true}' },
      ],
      jsonMode: true,
    })

    // Basic logging so we can see behaviour in server logs.
    // eslint-disable-next-line no-console
    console.log('[llm-test] hello=', {
      text: hello.text,
      provider: hello.provider,
      model: hello.model,
    })
    // eslint-disable-next-line no-console
    console.log('[llm-test] jsonMode=', {
      text: jsonMode.text,
      provider: jsonMode.provider,
      model: jsonMode.model,
    })

    return NextResponse.json({
      hello: {
        text: hello.text,
        provider: hello.provider,
        model: hello.model,
      },
      jsonMode: {
        text: jsonMode.text,
        provider: jsonMode.provider,
        model: jsonMode.model,
      },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[llm-test] Error while calling LLM', error)

    return NextResponse.json(
      {
        error: 'Failed to call LLM',
      },
      { status: 500 }
    )
  }
}


