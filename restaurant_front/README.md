# Getting Started with Vite

This project is built with [Vite](https://vitejs.dev/).

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode with Vite.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run preview`

Locally preview the production build on port 3000.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Environment

Vite uses `VITE_`-prefixed variables. Copy `.env.example` to `.env` and set `VITE_API_URL`.

### Docker

Production image is a multi-stage build that serves static files with Nginx.\
Build: `docker build -t your/image:tag .`\
Run: `docker run -p 8080:80 your/image:tag`

## Learn More

You can learn more in the [Vite documentation](https://vitejs.dev/guide/).

To learn React, check out the [React documentation](https://react.dev/).
