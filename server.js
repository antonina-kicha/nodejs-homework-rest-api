const app = require('./app');
const mongoose = require('mongoose');

const { DB_HOST, PORT = 3000 } = process.env;

mongoose.set("strictQuery", true);

mongoose.connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`"Server running. Use our API on port: ${PORT}"`)
    })
  })
  .catch(e => {
    console.log(e.message);
    process.exit(1);
  })

