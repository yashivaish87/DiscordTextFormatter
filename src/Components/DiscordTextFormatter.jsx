import React, { useState, useRef } from "react";
import { Button, Container, Group, Text, Stack,Paper, useMantineTheme  } from "@mantine/core";
import { Copy } from "tabler-icons-react";

const tooltipTexts = {
  "30": "Black",
  "31": "Red",
  "32": "Green",
  "33": "Yellow",
  "34": "Blue",
  "35": "Magenta",
  "36": "Cyan",
  "37": "White",

  "40": "Black BG",
  "41": "Red BG",
  "42": "Green BG",
  "43": "Yellow BG",
  "44": "Blue BG",
  "45": "Magenta BG",
  "46": "Cyan BG",
  "47": "White BG",
};

const DiscordTextFormatter = () => {
  const theme = useMantineTheme();
  const [copyButtonText, setCopyButtonText] = useState("Copy text");
  const textareaRef = useRef(null);
  
//apply style to selected text
  const applyStyleToSelection = (style, ansiCode) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; 

    let commonAncestor = range.commonAncestorContainer;
      while (commonAncestor.nodeType === 3) {
        commonAncestor = commonAncestor.parentNode;
      }

  if (commonAncestor.tagName === "SPAN" && commonAncestor.hasAttribute("data-ansi")) {
    // Split text into three parts: before, selected, after
    const fullText = commonAncestor.textContent;
    const selectedText = selection.toString();
    const startIndex = fullText.indexOf(selectedText);

    if (startIndex !== -1) {
      const beforeText = fullText.slice(0, startIndex);
      const afterText = fullText.slice(startIndex + selectedText.length);

      const newSpan = document.createElement("span");
      newSpan.style = style;
      newSpan.setAttribute("data-ansi", ansiCode);
      newSpan.textContent = selectedText;

      const parent = commonAncestor.parentNode;
      if (beforeText) {
        const beforeSpan = document.createElement("span");
        beforeSpan.style = commonAncestor.style.cssText;
        beforeSpan.setAttribute("data-ansi", commonAncestor.getAttribute("data-ansi"));
        beforeSpan.textContent = beforeText;
        parent.insertBefore(beforeSpan, commonAncestor);
      }

      parent.insertBefore(newSpan, commonAncestor);

      if (afterText) {
        const afterSpan = document.createElement("span");
        afterSpan.style = commonAncestor.style.cssText;
        afterSpan.setAttribute("data-ansi", commonAncestor.getAttribute("data-ansi"));
        afterSpan.textContent = afterText;
        parent.insertBefore(afterSpan, commonAncestor);
      }

      parent.removeChild(commonAncestor);
    }
  } else {
    const newSpan = document.createElement("span");
    newSpan.style = style;
    newSpan.setAttribute("data-ansi", ansiCode);
    newSpan.appendChild(range.extractContents());
    range.deleteContents();
    range.insertNode(newSpan);
  }
  };

  //handle button click
  const handleButtonClick = (ansiCode) => {
    let style = "";
    let ansiString = `\u001b[${ansiCode}m`;

    if (ansiCode === 1) {
      style = "font-weight: bold;";
    } else if (ansiCode === 4) {
      style = "text-decoration: underline;";
    } else if (ansiCode >= 30 && ansiCode < 40) {
      const colorMap = {
        30: "black",
        31: "red",
        32: "green",
        33: "yellow",
        34: "blue",
        35: "magenta",
        36: "cyan",
        37: "white",
      };
      style = `color: ${colorMap[ansiCode]};`;
    } else if (ansiCode >= 40) {
      const bgColorMap = {
        40: "black",
        41: "red",
        42: "green",
        43: "yellow",
        44: "blue",
        45: "magenta",
        46: "cyan",
        47: "white",
      };
      style = `background-color: ${bgColorMap[ansiCode]};`;
    }

    applyStyleToSelection(style, ansiString);
  };

  //handle reset
  const handleReset = () => {
    if (textareaRef.current) {
      textareaRef.current.innerHTML = "";
    }
  };

  //handle copy
  const handleCopy = () => {
    if (!textareaRef.current) return;

    let copiedText = "```ansi\n";
    const nodes = textareaRef.current.childNodes;

    nodes.forEach((node) => {
      if (node.nodeType === 3) {
        copiedText += node.textContent;
      } else if (node.nodeType === 1 && node.tagName === "SPAN") {
        const ansiCode = node.getAttribute("data-ansi") || "";
        copiedText += `${ansiCode}${node.textContent}\u001b[0m`;
      }
    });

    // Add a newline at the end
    copiedText += "\n```";

    // Copy to clipboard
    navigator.clipboard.writeText(copiedText).then(() => {
      setCopyButtonText("Copied!");
      setTimeout(() => {
        setCopyButtonText("Copy text"); 
      }, 2000);
    }).catch((err) => {
      console.error("Copy failed:", err);
    });
  };

  return (
    <Container size="lg" style={{   background: theme.colors.dark[8],textAlign: "center", minHeight: '100vh',
      padding: '2rem', }}>
     <Paper  shadow="xl" radius="lg" withBorder 
        style={{
          background: theme.colors.dark[7],
          padding: '2rem',
        }}> 

      <Text align="center" style={{ marginTop: "10px" , fontSize: "2rem", fontWeight: "bold", color:"white" }}> Discord Text Formatter</Text>

      <Group spacing={10} style={{ marginTop: "10px", marginBottom: "20px", display: "flex", justifyContent: "center" }}>
        <Button onClick={handleReset}>Reset All</Button>
        <Button onClick={() => handleButtonClick(1)}>Bold</Button>
        <Button onClick={() => handleButtonClick(4)}>Underline</Button>
      </Group>

      
      <Text style={{marginTop: "10px",marginBottom: "10px" , fontSize: "1rem", fontWeight: "bold", color:"white" }}>Foreground Colors</Text>
      <Group align="center" justify="center" spacing={5}>
        {Object.keys(tooltipTexts)
          .filter((code) => code >= 30 && code < 40)
          .map((code) => (
            <Button
              key={code}
              onClick={() => handleButtonClick(Number(code))}
              style={{
                backgroundColor: tooltipTexts[code].split(" ")[0].toLowerCase(),
                color: code === "37" ? "black" : "white",
              }}
            >
              {tooltipTexts[code]}
            </Button>
          ))}
      </Group>
 
      <Text style={{ marginTop: "10px",marginBottom: "10px"  , fontSize: "1rem", fontWeight: "bold", color:"white" }}>Background Colors</Text>
      <Group align="center" justify="center" spacing={5}>
        {Object.keys(tooltipTexts)
          .filter((code) => code >= 40)
          .map((code) => (
            <Button
              key={code}
              onClick={() => handleButtonClick(Number(code))}
              style={{
                backgroundColor: tooltipTexts[code].split(" ")[0].toLowerCase(),
                color: code === "47" ? "black" : "white",
              }}
            >
              {tooltipTexts[code]}
            </Button>
          ))}
      </Group>

      <Stack align="center" justify="center" style={{ marginTop: "1rem" }}>
        <div
          ref={textareaRef}
          contentEditable
          style={{
            width: "100%",
            height: "200px",
            borderRadius: "5px",
            resize: "both",
            overflow: "auto",
            fontFamily: "monospace",
            backgroundColor: "#2F3136",
            color: "#B9BBBE",
            border: "1px solid #202225",
            padding: "5px",
            whiteSpace: "pre-wrap",
            fontSize: "0.875rem",
            lineHeight: "1.125rem",
            textIndent: "0", 
            textAlign: "left",
            display: "block",
            position: "relative",
          }}
          

        ></div>
      </Stack>

      
      <Button onClick={handleCopy} leftIcon={<Copy />} style={{ marginTop: "20px" }}>
      {copyButtonText}
        </Button>
      </Paper>
    </Container>
  );
};

export default DiscordTextFormatter;
