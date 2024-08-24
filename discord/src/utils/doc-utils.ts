import { Attachment, AttachmentBuilder } from 'discord.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as mammoth from 'mammoth';
// eslint-disable-next-line import/no-extraneous-dependencies
import pdf from "pdf-parse";

// export async function extractTextFromPDF(pdfUrl: string): Promise<string> {}

export async function extractTextFromPDF(attachment: Attachment): Promise<string> {
    let url = attachment.url;
    let attachmentBuilder = new AttachmentBuilder(url);
    let attachmentObj = attachmentBuilder.attachment;
    let url2 = JSON.stringify(attachmentObj);
    const response = await fetch(url2.replaceAll('"', ''));
    const data = await pdf(Buffer.from(await response.arrayBuffer()));
    let pdfText = data.text;
    // also add number check to this pdfText = pdfText.replace(/[^\p{L}]/gu, ' ');
    pdfText = pdfText.replace(/[^\p{L}\p{N}]/gu, ' ');
    pdfText = pdfText.replace(/\s+/g, ' ').trim();

    return pdfText;
}

export async function extractTextFromDocx(attachment: Attachment): Promise<string> {
    let url = attachment.url;
    let attachmentBuilder = new AttachmentBuilder(url);
    let attachmentObj = attachmentBuilder.attachment;
    let url2 = JSON.stringify(attachmentObj);
    const response = await fetch(url2.replaceAll('"', ''));

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await mammoth.extractRawText({ buffer });
    let docxText = text.value;

    docxText = docxText.replace(/[^\p{L}\p{N}]/gu, ' ');

    return docxText;
}
