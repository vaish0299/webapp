import express from "express";


const app = express();
const port = process.env.PORT || "8000";

app.get("/healthCheck", (req, res) => {
    res.status(200).send({"statusCode":200, "message":"healthCheck successful!!!"});
});

app.listen(port, () => {
    console.log(`Server Running at port : ${port}`);
})