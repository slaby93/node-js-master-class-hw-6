const http = require('http')
const url = require('url')
const os = require('os')
const cluster = require('cluster')

// Port on which servers are going to bind to
const PORT = 3000

const app = {
  // Main entry of application
  init: () => {
    // When this is the master thread ( there is only one master thread )
    if (cluster.isMaster) {
      // Get total number of CPUs ( actually, total number of threads that CPU can run :)
      const numberOfCores = os.cpus().length
      // Spawn new threads one per cpu thread
      for (let index = 0; index < numberOfCores; index++) {
        cluster.fork()
      }
      return
    }
    // every slave thread should create HTTP server and bind to PORT
    if (cluster.isWorker) { app.startServer() }
  },
  startServer: () => {
    // create new HTTP Server
    http
      .createServer((req, res) => {
        // Get url from request
        const parsedUrl = url.parse(req.url).pathname.trim()
        // Pass request to router and get HTTP Code and response content
        const { code, output } = router(req, res, { parsedUrl })
        // assign HTTP code to response
        res.statusCode = code
        // Send response with content
        res.end(output)
        console.log(`Server responded with status ${res.statusCode} and output: ${output}`);
      })
      // Bind server to PORT and display process PID ( different per each thread )
      .listen(PORT, () => console.log(`Server started on port ${PORT}. PID: ${process.pid}`))

    const router = (req, res, { parsedUrl }) => {
      switch (parsedUrl) {
        case '/hello':
          res.setHeader('Content-type', 'application/json')
          return { code: 200, output: JSON.stringify({ message: 'Hi Pirple!' }) }
          break
        default:
          return { code: 404, output: 'Not found!' }
      }
    }
  }
}

app.init()