import React, { useEffect, useState, useRef } from "react";
import { Container } from "@mui/material";
import "./App.css";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";

interface iChat {
  question: string;
  answer: string;
}

function App() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [textContents, setTextContents] = useState<iChat[]>([]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendQuery = () => {
    setLoading(true);
    axios
      .post("http://localhost:3030/chat/query", { query: query })
      .then((response) => {
        console.log(
          "Payload sent to Zapier - Hubspot Prescription:",
          response.status,
          response.statusText
        );
        // console.info(response.data);
        setTextContents([
          ...textContents,
          { question: query, answer: response.data?.content },
        ]);
        setLoading(false);
        setQuery("");

        setTimeout(scrollToBottom, 500);
      })
      .catch((error) => {
        console.error(
          "Error sending payload to Zapier - Hubspot Prescription:",
          error
        );
        setLoading(false);
      });
  };

  useEffect(() => {}, []);
  return (
    <Container maxWidth={false} className="chat-container">
      <div className="chat-content">
        <div className="chat-panel">
          {textContents.map((item, i) => (
            <React.Fragment key={i}>
              <div className={`question ${i ? "margin-top" : ""}`}>
                {item.question}
              </div>
              <ReactMarkdown>{item?.answer}</ReactMarkdown>
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-box">
          <Paper
            // component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Ask your question"
              inputProps={{ "aria-label": "Ask your question" }}
              value={query}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setQuery(target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendQuery();
                  return;
                }
              }}
              disabled={loading}
            />

            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton
              color="primary"
              sx={{ p: "10px" }}
              aria-label="directions"
              onClick={sendQuery}
              disabled={loading}
            >
              {loading ? <CircularProgress size="23px" /> : <SendIcon />}
            </IconButton>
          </Paper>
        </div>
      </div>
    </Container>
  );
}

export default App;
