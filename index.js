const express = require("express");
const {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} = require("@apollo/client/core");
const gql = require("graphql-tag");
const XLSX = require("xlsx");

const app = express();

// Create an ApolloClient instance
const client = new ApolloClient({
  link: createHttpLink({ uri: "http://localhost:4000/gw/graphql" }),
  cache: new InMemoryCache({ addTypename: false }),
});

// Define a route to handle GraphQL requests
app.get("/export", async (req, res) => {
  try {
    // Make a GraphQL request using Apollo Client
    const { data } = await client.query({
      query: gql`
        {
          users {
            email
          }
        }
      `,
    });

    // Respond with the data from the GraphQL request
    // res.json(data);
    console.log(data);
    const worksheet = XLSX.utils.json_to_sheet(data.users);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send the buffer as the response
    res.send(buffer);
  } catch (error) {
    // Handle errors
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

