__putout_processor_json({
   "name": "Node CI",
   "on": [
      "push",
      "pull_request"
   ],
   "jobs": {
      "build": {
         "runs-on": "ubuntu-latest",
         "steps": [
            {
               "uses": 'actions/checkout@v3'
            },
            {
               "name": "Use Node.js ${{ matrix.node-version }}",
               "uses": 'actions/setup-node@v3',
               "with": {
                  "node-version": "${{ matrix.node-version }}"
               }
            },
            {
               "name": "Install Redrun",
               "run": "npm i redrun -g"
            },
            {
               "name": "Install",
               "run": "npm install"
            },
            {
               "name": "Bootstrap",
               "run": "redrun bootstrap"
            },
            {
               "name": "Lint",
               "run": "redrun lint"
            },
            {
               "name": "Coverage",
               "run": "redrun coverage report"
            },
            {
               "name": "Coveralls",
               "uses": "coverallsapp/github-action@master",
               "with": {
                  "github-token": "${{ secrets.GITHUB_TOKEN }}"
               }
            }
         ]
      }
   }
});
