// app/services/chatbot.js

import { PrismaClient } from '@prisma/client';
import { LangChain } from 'langchain';
import { ChromaDB } from 'chromadb';
import { Gemini } from 'gemini'; // Replace with the actual Gemini library

const prisma = new PrismaClient();
const chromaDB = new ChromaDB();
const gemini = new Gemini();

export async function handleUserQuery(query) {
  // Fetch relevant transcripts and articles
  const transcripts = await prisma.transcript.findMany({
    where: {
      OR: [
        { text: { contains: query } },
        { topics: { contains: query } }
      ]
    }
  });

  const articles = await prisma.article.findMany({
    where: {
      content: { contains: query }
    }
  });

  // Get embeddings for the query and documents
  const queryEmbedding = await chromaDB.getEmbedding(query);
  const documentEmbeddings = transcripts.concat(articles).map(doc => ({
    ...doc,
    embedding: chromaDB.getEmbedding(doc.text || doc.content)
  }));

  // Find the most relevant documents using ChromaDB
  const relevantDocuments = chromaDB.findMostRelevant(queryEmbedding, documentEmbeddings);

  // Use LangChain to generate the response
  const response = await gemini.generate({
    prompt: `User query: ${query}\nRelevant information: ${relevantDocuments.map(doc => doc.text || doc.content).join('\n')}\nAnswer:`
  });

  return response;
}
