import { Octokit } from "octokit";
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

// Initialize Octokit with your GitHub personal access token
const octokit = new Octokit({ auth: 'SUPER_SECRET' });

// Define the parameters for fetching pull requests
const org = 'Acivilate';
const repo = 'mypokket-db';
const branch = 'develop';
const startDate = '2023-07-01T00:00:00Z';
const endDate = '2024-06-30T23:59:59Z';

// Function to fetch and process pull requests
async function fetchPullRequests() {
  try {

	  console.log('github_token==>',process.env.GITHUB_TOKEN);
    // Fetch pull requests from the specified repository
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner: org,
      repo: repo,
      state: 'closed',
      base: branch,
//      sort: 'updated',
      direction: 'desc'
    });

    // Filter pull requests merged between the specified dates
    const filteredPullRequests = response.data.filter(pr => {
      const mergedDate = new Date(pr.merged_at);
      return (pr.merged_at !== null || pr.merged_at !== undefined )  && mergedDate >= new Date(startDate) && mergedDate <= new Date(endDate);
    });

    // Extract relevant information from filtered pull requests
    const prData = filteredPullRequests.map(pr => {
      return {
        number: `"${pr.number}"`,
        name: `"${pr.title}"`,
        date: `${pr.merged_at}"`,
        author: `"${pr.user.login}"`,
	url: `${pr.html_url}"`	,
	      repo
      };
    });

//	  console.log(filteredPullRequests);
	   console.log(prData);
    // Write PR data to CSV file
	  
    const csvWriter = createObjectCsvWriter({
      path: `merged_pull_requests_${repo}.csv`,
      header: [
        { id: 'number', title: '"PR Number"' },
        { id: 'name', title: 'Name' },
        { id: 'date', title: 'Date' },
        { id: 'author', title: 'Author' },
        { id: 'url', title: 'Url' },
        { id: 'repo', title: 'repo' }
      ]
    });

    await csvWriter.writeRecords(prData);
    
    console.log('CSV file generated successfully: merged_pull_requests.csv');
  } catch (error) {
    console.error('Error fetching and processing pull requests:', error);
  }
}

// Execute the function to fetch and process pull requests
fetchPullRequests();

