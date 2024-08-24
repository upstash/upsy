import {openai, RAGChat} from '@upstash/rag-chat';


export const ragChat = new RAGChat({
    model: openai('gpt-4-turbo'),
    debug: false,
    promptFn: ({context, question, chatHistory}) =>
        `You are an AI assistant with access to a Vector Store.
          Use the provided context and chat history to answer the question.
          If the answer isn't available, then try to answer yourself.
          Please note that history order is from latest to oldest. So the newest message is the first.
          ------
          Chat history:
          ${chatHistory}
          ------
          Context:
          ${context}
          ------
          Question: ${question}
          Answer:`,
});

// **Helper Functions**
export async function isQuestion(question: string): Promise<boolean> {
    const resp = await ragChat.chat("Does the following sentence look like a question semantically? Say just yes or no " + question, {disableRAG: true, disableHistory: true});
    console.log('isQuestion response:', resp);
    return resp.output.toLowerCase() === 'yes';
}

export async function isWorthReaction(sentence: string): Promise<string> {
    let response = await ragChat.chat(`If the sentence feels like angry return "eyes", announcements return "tada" and jokes return "laughing". Returned text must be without : and " . (Return JUST the emoji text, If no text returned just say NO)"  -> Message: ${sentence}`);
    return response.output;
}

// **Main Query Function**
export async function query(
    question: string,
    sessionId: string
): Promise<string> {
    const strippedQuestion = question.replace('upsy', '');
    console.log('SESSION-ID:', sessionId + ' QUESTION:', strippedQuestion);
    let response = await ragChat.chat(strippedQuestion, {
        historyLength: 7,
        sessionId: sessionId
    });
    return response.output;
}


export async function addDocument(content: string): Promise<any> {
    console.log('adding document:' + content );
    return await ragChat.context.add(content);
}

export async function addDocuments(messages: any[])   {
    console.log('adding many documents');
    return await ragChat.context.addMany(messages);
}