import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import type { AddressInfo } from "net";

export enum FieldType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  ARRAY = 'Array (Split by comma)',
  DATE = 'Date',
}

function parsePort(): { port: number; isRandom: boolean; isUserExplicit: boolean } {
  const args = process.argv.slice(2);

  // 1. Check --random-port or -r
  if (args.includes('--random-port') || args.includes('-r')) {
    return { port: 0, isRandom: true, isUserExplicit: true };
  }

  // 2. Check --port <number> or -p <number>
  const portIndex = args.findIndex(arg => arg === '--port' || arg === '-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const val = parseInt(args[portIndex + 1], 10);
    if (!isNaN(val)) {
      return { port: val, isRandom: val === 0, isUserExplicit: true };
    }
  }

  // 3. Check --port=<number>
  const portEqualArg = args.find(arg => arg.startsWith('--port='));
  if (portEqualArg) {
    const val = parseInt(portEqualArg.split('=')[1], 10);
    if (!isNaN(val)) {
      return { port: val, isRandom: val === 0, isUserExplicit: true };
    }
  }

  // 4. Check environment variable PORT
  if (process.env.PORT) {
    const val = parseInt(process.env.PORT, 10);
    if (!isNaN(val)) {
      return { port: val, isRandom: val === 0, isUserExplicit: true };
    }
  }

  // Default to 3000 (not explicitly forced by user)
  return { port: 3000, isRandom: false, isUserExplicit: false };
}

async function startServer() {
  const app = express();
  const { port: initialPort, isUserExplicit } = parsePort();

  app.use(express.json());

  // API routes
  app.post("/api/suggest-mapping", async (req, res) => {
    try {
      const { headers, userInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not found. Please set GEMINI_API_KEY" });
      }
      
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        I have an Excel file with the following headers: ${JSON.stringify(headers)}.
        
        The user wants to convert this to a JSON structure described as: "${userInstruction}".
        
        If the user instruction is vague, create a best-effort logical mapping based on the headers (e.g., camelCase keys).
        Return a list of mapping fields. Each field should map a target JSON key to one of the source headers.
        
        For nested JSON, use dot notation for the targetKey (e.g., "user.address.city").
        Infer the most appropriate data type.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                targetKey: { type: Type.STRING, description: "The output JSON key (use dot notation for nesting)" },
                sourceColumn: { type: Type.STRING, description: "The exact header string from the Excel list provided" },
                type: { type: Type.STRING, enum: Object.values(FieldType), description: "The data type" }
              },
              required: ["targetKey", "sourceColumn", "type"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) {
        return res.json([]);
      }
      
      const rawMappings = JSON.parse(text);
      res.json(rawMappings);
    } catch (error: any) {
      console.error("Gemini mapping error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const listen = (portToTry: number) => {
    const server = app.listen(portToTry, "0.0.0.0", () => {
      const address = server.address() as AddressInfo | null;
      const actualPort = address ? address.port : portToTry;
      console.log(`\n> 服务运行于: http://localhost:${actualPort}`);
      if (actualPort !== 3000) {
        console.log(`> 提示: 已使用自定义/空闲端口 ${actualPort}\n`);
      }
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        if (!isUserExplicit && portToTry > 0 && portToTry < 3020) {
          console.warn(`[提示] 端口 ${portToTry} 已被占用，自动尝试端口 ${portToTry + 1}...`);
          listen(portToTry + 1);
        } else if (!isUserExplicit) {
          console.warn(`[提示] 端口已占用，自动分配系统随机空闲端口...`);
          listen(0);
        } else {
          console.error(`\n[错误] 端口 ${portToTry} 已被占用！可以使用 --port <端口> 或 --random-port 指定其他端口。\n`);
          process.exit(1);
        }
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  };

  listen(initialPort);
}

startServer();
