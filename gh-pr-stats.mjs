import { Octokit } from 'octokit';
import process from 'node:process';
import commandLineArgs from 'command-line-args'

const octokit = new Octokit({
  auth: process.env.GITHUB_API_TOKEN 
});

const daysOfMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const getPRStats = async (owner, repo, pull_number) => {
  let deletions = 0; 
  let additions = 0;
  let changes = 0;

  const files = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
    owner,
    repo,
    pull_number,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  files.data.forEach((file) => {
    deletions += file.deletions;
    additions += file.additions;
    changes += file.changes;
  });

  return { deletions, additions, changes };
};

const main = async (options) => {
  const { author, year } = options;  

  let PRs = [];
  for (let month of options.month) {
    for (let day = 1; day <= daysOfMonth[month-1]; day++) {
      const date = `${year}-${(month).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const response = await octokit.request('GET /search/issues', {
        q: `is:pr author:${author} is:merged created:${date}`,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
  
      const prs = response.data.items;
      for (const pr of prs) {
        const [, , owner, repo] = URL.parse(pr.url).pathname.split('/');
        const { deletions, additions, changes } = await getPRStats(owner, repo, pr.number);
        PRs.push({ owner, repo, number: pr.number, title: pr.title, deletions, additions, changes });
      }
    }
  }

  console.log(JSON.stringify(PRs));
};

const optionDefinitions = [
  { name: 'author', alias: 'a', type: String },
  { name: 'year', alias: 'y', type: Number, defaultValue: new Date().getFullYear() },
  { name: 'month', alias: 'm', type: Number, multiple: true, defaultValue: new Date().getMonth() + 1 },
];
const options = commandLineArgs(optionDefinitions);
if (!options.author) {
  console.error('You must specify an author');
  process.exit(1);
}
main(options);
