import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Redis } from '@upstash/redis';
import { Index } from '@upstash/vector';
import { ConversationChain } from 'langchain/chains';

// **Configuration**
const model = new ChatOpenAI({
    modelName: 'gpt-4', // Select your desired OpenAI model
    temperature: 0, // Set temperature for deterministic responses
});

const embeddings = new OpenAIEmbeddings();

// **Prompt Constants**
const DIRECTIVES_FOR_IM = `Act like a colleague in a slack channel. Your name is Upsy. Be kind and friendly. 
Try to answer using the following pieces of context.`;

const DIRECTIVES_FOR_CHANNEL = `Use the following pieces of context to answer the question below. If you don't know the answer, say NONE, don't try to make up an answer.`;

const questionPromptForChannel = PromptTemplate.fromTemplate(
    `{directives}
  ----------------
  
  CONTEXT: {context}
  ----------------
  CHAT HISTORY: 
  {savehistory}
  ----------------
  QUESTION: {question}
  ----------------
  Answer (say NONE if you don't know, NEVER make up an answer):`
);

const questionPromptForIM = PromptTemplate.fromTemplate(
    `{directives}
  ----------------
  CONTEXT: {context}
  ----------------
  CHAT HISTORY: 
  {savehistory}
  ----------------
  USER SAYS: {question}
  ----------------
  Answer (Should be less than 2000 characters.)`
);

// **Redis Configuration (Assuming you're using Upstash for Redis)**
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// **Vector Database Interface**
const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// **Helper Functions**
export async function isQuestion(question: string): Promise<boolean> {
    const chain = new ConversationChain({ llm: model });
    const response = await chain.call({
        input: `Is the following a question (Just answer YES or NO, nothing else.) ->  ${question}`,
    });
    return response.response.toLowerCase().startsWith('yes');
}

export async function isWorthReaction(sentence: string): Promise<string> {
    const chain = new ConversationChain({ llm: model });
    const response = await chain.call({
        input: `If the sentence feels like angry return "eyes", questions return "thinking_face", announcements return "tada" and jokes return "laughing". Returned text must be without : and " . (Return JUST the emoji text, If no text returned just say NO)"  -> Message: ${sentence}`,
    });

    console.log(response);

    if (response.response.toLowerCase().startsWith('no')) return;

    return response.response;
}

async function getRelevantDocuments(question: string): Promise<string | void> {
    const vector = await embeddings.embedDocuments([question]);

    if (!vector || !vector[0]) return;

    const results = await index.query({
        vector: vector[0],
        includeVectors: false,
        includeMetadata: true,
        topK: 5,
    });

    let contentString = '';
    results.forEach(result => {
        if (result.metadata && result.metadata.content) {
            contentString += String(result.metadata.content) + '\n';
        }
    });

    return contentString;
}

// **Main Query Function**
export async function query(
    type: 'im' | 'channel',
    question: string,
    channelId: string,
    userId: string,
    sendHistory: boolean
): Promise<string> {
    const chain = new ConversationChain({ llm: model });
    const strippedQuestion = question.replace('upsy', '');
    const context = await getRelevantDocuments(strippedQuestion);

    let directives = type === 'im' ? DIRECTIVES_FOR_IM : DIRECTIVES_FOR_CHANNEL;
    let questionPrompt = type === 'im' ? questionPromptForIM : questionPromptForChannel;

    if (type === 'im') {
        directives = DIRECTIVES_FOR_IM;
        questionPrompt = questionPromptForIM;
    }

    let history = '';
    if (sendHistory) {
        const savehistory = await redis.lrange('chat-' + channelId, 0, 2); // Fetch recent chat history
        history = savehistory.reverse().join('\n'); // Combine history in readable format
    }

    const prompt = await questionPrompt.format({
        directives: directives,
        question: question,
        savehistory: history,
        context: context,
    });

    const response = await chain.call({ input: prompt });

    await redis.lpush('chat-' + String(channelId), 'User: ' + String(question)); // Record question in history
    await redis.lpush('chat-' + channelId, 'Upsy: ' + response.response); // Record response

    return response.response;
}

// **Document Management Functions**
export async function addDocument(metadata: any, content: string): Promise<void> {
    console.log('adding document:' + content + ' with metadata:' + { metadata: metadata });
    const vector = await embeddings.embedDocuments([content]);

    if (!vector || !vector[0]) {
        return;
    }

    await index.upsert({
        id: metadata.id,
        vector: vector[0],
        metadata: metadata,
    });
}

export async function addDocuments(messages: any[]): Promise<void> {
    console.log('adding documents:' + messages.length);

    const vectors = await embeddings.embedDocuments(messages.map(m => m.content));
    const records = [];
    for (let i = 0; i < messages.length; i++) {
        records.push({
            id: messages[i].id,
            vector: vectors[i],
            metadata: messages[i].metadata,
        });
    }

    await index.upsert(records);
}
