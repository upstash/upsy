import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { Redis } from "@upstash/redis";
import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Index } from "@upstash/vector"


const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0,
});

const embeddings = new OpenAIEmbeddings();

const DIRECTIVES_FOR_IM = `Act like a colleague in a slack channel. Your name is Upsy. Be kind and friendly. 
Try to answer using the following pieces of context.`;

const DIRECTIVES_FOR_CHANNEL = `Use the following pieces of context to answer the question below. If you don't know the answer, say NONE, don't try to make up an answer`;

const questionPromptForChannel = PromptTemplate.fromTemplate(
    `{directives}
  ----------------
  
  CONTEXT: {context}
  ----------------
  CHAT HISTORY: 
  {chatHistory}
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
  {chatHistory}
  ----------------
  USER SAYS: {question}
  ----------------
  Answer:`
);


const redis = Redis.fromEnv();
const index = new Index();


export async function isQuestion(question) {
    const chain = new ConversationChain({ llm: model });
    const question2 = question.replace("upsy", "");
    const resp = await chain.call({ input: "Is the following a question (Just answer YES or NO, nothing else.) ->  " + question2 });
    if (resp.response.toLowerCase().startsWith("yes")) {
        return true
    } else {
        return false
    }
}


async function getRelevantDocuments(question) {
    const vector = await embeddings.embedDocuments([question]);

    if(!vector || !vector[0]) {
        return;
    }

    const results = await index.query({
        vector: vector[0],
        includeVectors: false,
        includeMetadata: true,
        topK: 5,
    })

    console.log(results);

// Assuming 'results' is the array you get from the query
    let contentString = "";
    for (let i = 0; i < results.length; i++) {
        // Check if metadata and content exist to avoid errors
        if (results[i].metadata && results[i].metadata.content) {
            contentString += results[i].metadata.content + "\n";
        }
    }

// Now contentString contains all contents, each separated by a new line
    console.log("relevant documents:")
    console.log(contentString);

    return contentString;
}


export async function query(type, question, chatId, userId, sendHistory) {
    const chain = new ConversationChain({ llm: model });
    const question2 = question.replace("upsy", "");
    const context = await getRelevantDocuments(question2);

    let directives = DIRECTIVES_FOR_CHANNEL;
    let questionPrompt = questionPromptForChannel;

    if (type === "im") {
        directives = DIRECTIVES_FOR_IM;
        questionPrompt = questionPromptForIM;
    }

    let history = "";
    if (sendHistory) {
        let chatHistory = await redis.lrange("chat-" + chatId, 0, 2);
        history = chatHistory.reverse().join("\n");
    }

    let prompt = await questionPrompt.format({ directives: directives, question: question, chatHistory: history, context: context });
    console.log("prompt:" + prompt);
    const resp = await chain.call({ input: prompt });

    redis.lpush("chat-" + chatId, "User: " + question);
    redis.lpush("chat-" + chatId, "Upsy: " + resp.response);

    return resp.response;
}

export async function addDocument(metadata, content) {
    console.log("adding document:" + content + " with metadata:" + { metadata: metadata });
    const vector = await embeddings.embedDocuments([content]);

    if(!vector || !vector[0]) {
        return;
    }

    let response = await index.upsert({
        id: "id"+ Math.random(),
        vector: vector[0],
        metadata: metadata,
    });

    console.log(response);

}



export async function addDocuments(messages, channelId, type) {
    console.log("adding documents:" + messages.length);

    await index.reset();

    const vectors = await embeddings.embedDocuments(messages);
    const records = [];
    for (let i = 0; i < messages.length; i++) {
        records.push(
            {
                id: "id"+ Math.random(),
                vector: vectors[i],
                metadata: { content: messages[i] },
            }
        )
    }

    return await index.upsert(records);
}

