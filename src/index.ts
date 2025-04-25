#!/usr/bin/env node

import { MCPServer } from "mcp-framework";

const server = new MCPServer({
  transport: { type: "stdio" }
});

server.start();