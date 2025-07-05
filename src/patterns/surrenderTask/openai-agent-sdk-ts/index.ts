import { userAssistantThatCanSurrender } from './emailCaseThatCanSurrender';
import { userAssistantThatCannotSurrender } from './emailCaseThatCannotSurrender';
import { noisySearchCaseThatCanSurrender } from './noisySearchCaseThatCanSurrender';
import { noisySearchCaseThatCanNotSurrender } from './noisySearchCaseThatCanNotSurrender';

async function main() { 

    // EmailCase
    console.log("================================================");
    console.log("=== Running emailCase.");
    console.log("================================================");
    console.log("\n================================================");
    console.log("Running user assistant that can surrender");
    await userAssistantThatCanSurrender();

    console.log("================================================");
    console.log("Running user assistant that cannot surrender");
    await userAssistantThatCannotSurrender();

    console.log("================================================");
    console.log("=== Running noisy search case");
    console.log("================================================");
    console.log("\n================================================");
    console.log("Running noisy search case that can surrender + turn count");
    await noisySearchCaseThatCanSurrender();

    console.log("================================================");
    console.log("=== Running noisy search case");
    console.log("================================================");
    console.log("\n================================================");
    console.log("Running noisy search case that can not surrender");
    await noisySearchCaseThatCanNotSurrender();
}

main();