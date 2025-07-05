import { userAssistantThatCanSurrender } from './emailCaseThatCanSurrender';
import { userAssistantThatCannotSurrender } from './emailCaseThatCannotSurrender';
import { noisySearchCaseThatCanSurrender } from './noisySearchCaseThatCanSurrender';
import { noisySearchCaseThatCanNotSurrender } from './noisySearchCaseThatCanNotSurrender';

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🎯 SURRENDER TASK PATTERN - DEMONSTRATION");
    console.log("=".repeat(80));
    console.log("This demo shows how agents can fail gracefully with structured output\n");

    // Email Case Examples
    console.log("📧 EMAIL CASE EXAMPLES");
    console.log("=".repeat(50));
    
    console.log("\n🔄 Part 1: Agent WITH surrender capability");
    console.log("-".repeat(50));
    await userAssistantThatCanSurrender();

    console.log("\n🚫 Part 2: Agent WITHOUT surrender capability");
    console.log("-".repeat(50));
    await userAssistantThatCannotSurrender();

    // Search Case Examples
    console.log("\n" + "=".repeat(50));
    console.log("🔍 SEARCH CASE EXAMPLES");
    console.log("=".repeat(50));
    
    console.log("\n🔄 Part 1: Agent WITH surrender capability + turn counting");
    console.log("-".repeat(50));
    await noisySearchCaseThatCanSurrender();

    console.log("\n🚫 Part 2: Agent WITHOUT surrender capability");
    console.log("-".repeat(50));
    await noisySearchCaseThatCanNotSurrender();

    console.log("\n" + "=".repeat(80));
    console.log("✅ DEMONSTRATION COMPLETE");
    console.log("=".repeat(80));
    console.log("Key takeaways:");
    console.log("• Agents with surrender capability provide structured failure information");
    console.log("• Retry guidance helps users understand when to try again");
    console.log("• Resource management prevents wasted computational cycles");
    console.log("• Better user experience through clear, actionable feedback");
    console.log("=".repeat(80) + "\n");
}

main().catch(console.error);