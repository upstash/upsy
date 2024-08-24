import * as mammoth from "mammoth";

export async function extractTextFromPDF(): Promise<string> {
  return "xx"
}

export async function extractTextFromDocx(attachment: string): Promise<string> {
  try {
    const response = await fetch(attachment, {
      headers: { Authorization: `Bearer ${process.env.SLACK_ACCESS_TOKEN}` },
    });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await mammoth.extractRawText({ buffer });
    let docxText = text.value;
    docxText = docxText.replace(/[^\p{L}\p{N}]/gu, " ");
    return docxText;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw error; // Rethrow the error to handle it at the calling site
  }
}
