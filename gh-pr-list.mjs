import { readFileSync } from 'fs';
import process from 'process';

let repositories = new Map();
    
const data = readFileSync(process.argv[2], 'utf8');
const prs = JSON.parse(data);

let totalDeletions = 0;
let totalAdditions = 0;
let totalChanges = 0;

for (const pr of prs) {
    const { owner, repo, number, title, deletions, additions, changes } = pr;
    if (repositories.has(`${owner}/${repo}`)) {
        repositories.set(`${owner}/${repo}`, repositories.get(`${owner}/${repo}`) + 1);
    } else {
        repositories.set(`${owner}/${repo}`, 1);
    }
        
    totalDeletions += deletions;
    totalAdditions += additions;
    totalChanges += changes;
    console.log(`${owner}/${repo}#${number} - ${title} - ${deletions} deletions, ${additions} additions, ${changes} changes`);
}

console.log(`Total PRs: ${prs.length}`);
console.log('Repositories:');
repositories.forEach((value, key) => {
  console.log(`${key}:${value}`);
});
console.log(`Total deletions: ${totalDeletions}`);
console.log(`Total additions: ${totalAdditions}`);
console.log(`Total changes: ${totalChanges}`);
