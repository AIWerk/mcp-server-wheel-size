# @aiwerk/mcp-server-wheel-size

Wheel-Size.com API MCP server — vehicle wheel and tyre fitment data for 10,000+ makes, models, and trim levels.

## Install

```bash
npx -y @aiwerk/mcp-server-wheel-size
```

Or add to your MCP client config:

```json
{
  "mcpServers": {
    "wheel-size": {
      "command": "npx",
      "args": ["-y", "@aiwerk/mcp-server-wheel-size"],
      "env": {
        "WHEEL_SIZE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Configure

| Variable | Required | Description |
|---|---|---|
| `WHEEL_SIZE_API_KEY` | ✅ | API key from [developer.wheel-size.com](https://developer.wheel-size.com/) |
| `WHEEL_SIZE_API_TIMEOUT_MS` | ❌ | Request timeout in ms (default: 30000) |

## Tools

| Name | Description |
|---|---|
| `list-regions` | List all market region codes (eudm, usdm, jdm, …) |
| `list-makes` | List manufacturers available in a region |
| `list-years` | List model years for a make |
| `list-models` | List models for a make + year |
| `list-generations` | List body generations for make/model/year |
| `list-modifications` | List trim variants for make/model/year/generation |
| `search-by-model` | **Primary tool** — OEM + aftermarket fitment specs (tyre size, rim, PCD, offset, centre bore) |
| `wheel-upsteps` | Aftermarket wheel upsize (plus-sizing) suggestions |

## Auth

Register for a free sandbox account at [developer.wheel-size.com](https://developer.wheel-size.com/). The sandbox tier allows 300 API calls per day.

> **Note:** The API key is sent as a `user_key` query parameter, not as an HTTP header.

## License

MIT — [AIWerk](https://aiwerkmcp.com)
