/**
 * CLI Usage Examples
 * 
 * Demonstrates how to use the CLI programmatically.
 */

import { spawn } from 'child_process';
import path from 'path';

async function cliUsageExample(): Promise<void> {
  const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
  
  console.log('Example CLI usage:');
  console.log('# Validate OpenAI key:');
  console.log(`node ${cliPath} -p openai -k sk-proj-example123`);
  console.log('');
  console.log('# Interactive mode:');
  console.log(`node ${cliPath} interactive`);
  console.log('');
  console.log('# Help:');
  console.log(`node ${cliPath} --help`);
  
  // Example: Programmatic CLI execution
  const child = spawn('node', [cliPath, '--help'], {
    stdio: 'pipe'
  });
  
  child.stdout.on('data', (data) => {
    console.log('CLI Output:', data.toString());
  });
  
  child.stderr.on('data', (data) => {
    console.error('CLI Error:', data.toString());
  });
}

// Run the example
if (require.main === module) {
  cliUsageExample();
}