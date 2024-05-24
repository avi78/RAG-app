import { handleUserQuery } from "../../app/services/chatbot";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { query } = req.body;
    try {
      const response = await handleUserQuery(query);
      res.status(200).json({ response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
