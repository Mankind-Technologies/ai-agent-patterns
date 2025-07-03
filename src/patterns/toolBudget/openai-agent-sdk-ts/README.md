# Tool Budget Pattern Example: Research Assistant

This example demonstrates the **Tool Budget Pattern** with a practical research assistant that has both expensive and free tools.

## What This Example Shows

- **Strategic Tool Usage**: The agent learns to use free tools first, expensive tools only when necessary
- **Resource Management**: Prevents runaway costs from poorly prompted agents
- **Transparent Constraints**: Both agent and user understand resource limitations
- **Graceful Degradation**: When budget is exhausted, the agent adapts its approach

## Tools Available

1. **Web Scraping** (Limited to 3 uses)
   - Simulates expensive network operations
   - Provides latest information from external sources
   - Takes time and resources to process

2. **Local Search** (Unlimited)
   - Searches through local knowledge base
   - Instant responses with no cost
   - Good for basic concepts and known information

## How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set your OpenAI API key**:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Run the example**:
   ```bash
   npm start
   ```

## What You'll See

The example runs 5 research queries and shows how the agent strategically decides between expensive and free tools:

1. **"Tell me about JavaScript basics and frameworks"** - Uses local search (free)
2. **"What are the latest React features and updates?"** - May use web scraping for latest info
3. **"I need information about Python for data science"** - Uses local search (free)
4. **"What are the newest AI research developments?"** - May use web scraping for latest research
5. **"Explain React hooks and their usage"** - Uses local search (free)

## Expected Output

You'll see:
- Clear logging of tool usage decisions
- Budget tracking messages
- Agent explanations of why it chose each tool
- Graceful fallback when budget is exhausted

## Key Learning Points

1. **Cost Awareness**: The agent becomes cost-conscious and strategic
2. **Prioritization**: Expensive tools are saved for when they provide the most value
3. **Fallback Strategy**: When budget is depleted, the agent finds alternative approaches
4. **Transparency**: Users understand resource constraints and decision-making

## Real-World Applications

This pattern is valuable for:
- **API Rate Limiting**: Prevent hitting expensive API limits
- **Cloud Resource Management**: Control cloud computing costs
- **Content Generation**: Limit expensive AI operations
- **Data Processing**: Balance between expensive real-time and free cached data

## Customization

You can modify:
- **Budget limits** in the `budget()` function calls
- **Knowledge base** in `localKnowledgeBase` object
- **Queries** in the `queries` array
- **Agent instructions** to change decision-making strategy 