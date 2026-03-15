const BACKEND_URL = "/api";
let paperID = null;

// Tab Switching Logic
function switchTab(type) {
    const pdfTab = document.getElementById('pdfTab');
    const textTab = document.getElementById('textTab');
    const pdfSection = document.getElementById('pdfUploadSection');
    const textSection = document.getElementById('rawTextSection');

    if (type === 'pdf') {
        pdfTab.classList.add('active');
        textTab.classList.remove('active');
        pdfSection.style.display = 'block';
        textSection.style.display = 'none';
        document.getElementById("uploadStatus").innerText = "";
    } else {
        pdfTab.classList.remove('active');
        textTab.classList.add('active');
        pdfSection.style.display = 'none';
        textSection.style.display = 'block';
        document.getElementById("uploadStatus").innerText = "";
    }
}

// Helper to handle loading state
function setLoading(btnId, spinnerId, textId, active, loadingText, defaultText) {
    const btn = document.getElementById(btnId);
    const spinner = document.getElementById(spinnerId);
    const textSpan = document.getElementById(textId);
    
    btn.disabled = active;
    if (active) {
        spinner.classList.add('active');
        textSpan.innerText = loadingText;
    } else {
        spinner.classList.remove('active');
        textSpan.innerText = defaultText;
    }
}

// Upload PDF
async function uploadPDF() {
    let fileInput = document.getElementById("pdfFile");
    let statusDiv = document.getElementById("uploadStatus");
    
    if (fileInput.files.length === 0) {
        statusDiv.innerText = "❌ Please select a PDF file first.";
        statusDiv.style.color = "#ef4444";
        return;
    }
    
    setLoading("uploadBtn", "uploadSpinner", "uploadBtnText", true, "Uploading...", "Upload PDF");
    statusDiv.style.color = "var(--text-muted)";
    statusDiv.innerHTML = "Uploading and processing document... <span class='pulse'>This may take a minute.</span>";
    
    let formData = new FormData();
    formData.append("file", fileInput.files[0]);
    
    try {
        let response = await fetch(`${BACKEND_URL}/upload`, {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        paperID = data.paper_id;
        
        statusDiv.style.color = "#10b981";
        statusDiv.innerHTML = "✅ Document uploaded and processed successfully!";
        
        // Reset states
        document.getElementById("summaryOutput").style.display = "none";
        document.getElementById("answersOutput").style.display = "none";
        document.getElementById("exportContainer").style.display = "none";
        
        // Enable subsequent sections
        document.getElementById("summarySection").classList.remove("disabled-section");
        document.getElementById("summaryBtn").disabled = false;
        
        document.getElementById("insightsSection").classList.remove("disabled-section");
        document.getElementById("questions").disabled = false;
        document.getElementById("insightsBtn").disabled = false;
        
    } catch (error) {
        console.error('Error:', error);
        statusDiv.style.color = "#ef4444";
        statusDiv.innerText = "❌ Upload failed. Make sure you are logged in.";
    } finally {
        setLoading("uploadBtn", "uploadSpinner", "uploadBtnText", false, "", "Upload PDF");
    }
}

// Upload Raw Text
async function uploadText() {
    let textInput = document.getElementById("rawTextInput");
    let filenameInput = document.getElementById("rawTextFilename");
    let statusDiv = document.getElementById("uploadStatus");
    
    let text = textInput.value.trim();
    if (!text) {
        statusDiv.innerText = "❌ Please enter some text first.";
        statusDiv.style.color = "#ef4444";
        return;
    }
    
    setLoading("uploadTextBtn", "uploadTextSpinner", "uploadTextBtnText", true, "Processing...", "Process Text");
    statusDiv.style.color = "var(--text-muted)";
    statusDiv.innerHTML = "Processing text content... <span class='pulse'>This may take a moment.</span>";
    
    try {
        let response = await fetch(`${BACKEND_URL}/upload-text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                filename: filenameInput.value.trim() || "Raw Text Input"
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        paperID = data.paper_id;
        
        statusDiv.style.color = "#10b981";
        statusDiv.innerHTML = "✅ Text processed successfully!";
        
        // Reset states
        document.getElementById("summaryOutput").style.display = "none";
        document.getElementById("answersOutput").style.display = "none";
        document.getElementById("exportContainer").style.display = "none";
        
        // Enable subsequent sections
        document.getElementById("summarySection").classList.remove("disabled-section");
        document.getElementById("summaryBtn").disabled = false;
        
        document.getElementById("insightsSection").classList.remove("disabled-section");
        document.getElementById("questions").disabled = false;
        document.getElementById("insightsBtn").disabled = false;
        
    } catch (error) {
        console.error('Error:', error);
        statusDiv.style.color = "#ef4444";
        statusDiv.innerText = "❌ Processing failed. Make sure you are logged in.";
    } finally {
        setLoading("uploadTextBtn", "uploadTextSpinner", "uploadTextBtnText", false, "", "Process Text");
    }
}

// Load Document from History Sidebar
function loadDocument(id, summary_text) {
    paperID = id;
    
    document.getElementById("uploadStatus").style.color = "var(--accent-1)";
    document.getElementById("uploadStatus").innerText = "Loaded document from memory.";
    
    document.getElementById("summarySection").classList.remove("disabled-section");
    document.getElementById("summaryBtn").disabled = false;
    
    document.getElementById("insightsSection").classList.remove("disabled-section");
    document.getElementById("questions").disabled = false;
    document.getElementById("insightsBtn").disabled = false;
    
    let outputDiv = document.getElementById("summaryOutput");
    let answersDiv = document.getElementById("answersOutput");
    
    answersDiv.style.display = "none";
    
    if (summary_text && summary_text.trim().length > 0) {
        outputDiv.style.display = "block";
        outputDiv.innerText = summary_text;
        document.getElementById("exportContainer").style.display = "flex";
    } else {
        outputDiv.style.display = "none";
        document.getElementById("exportContainer").style.display = "none";
    }
}

// Export Summary
function exportFile(format) {
    if (!paperID) return;
    window.location.href = `/export/${paperID}?format=${format}`;
}

// Generate Summary
async function summarize() {
    if (!paperID) return;
    
    let outputDiv = document.getElementById("summaryOutput");
    
    setLoading("summaryBtn", "summarySpinner", "summaryBtnText", true, "Analyzing...", "Generate Summary");
    
    outputDiv.style.display = "block";
    outputDiv.innerHTML = "<span class='pulse'>Generating executive summary...</span>";
    document.getElementById("exportContainer").style.display = "none";
    
    try {
        let response = await fetch(`${BACKEND_URL}/summarize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                paper_id: paperID,
                length: "short"
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        outputDiv.innerText = data.summary;
        document.getElementById("exportContainer").style.display = "flex";
        
    } catch (error) {
        console.error('Error:', error);
        outputDiv.innerHTML = "<span style='color: #ef4444'>❌ Failed to generate summary. Please try again.</span>";
    } finally {
        setLoading("summaryBtn", "summarySpinner", "summaryBtnText", false, "", "Generate Summary");
    }
}

// Get Insights
async function getInsights() {
    if (!paperID) return;
    
    let text = document.getElementById("questions").value.trim();
    let outputDiv = document.getElementById("answersOutput");
    
    if (!text) {
        outputDiv.style.display = "block";
        outputDiv.innerHTML = "<span style='color: #ef4444'>⚠️ Please enter at least one question.</span>";
        return;
    }
    
    setLoading("insightsBtn", "insightsSpinner", "insightsBtnText", true, "Extracting...", "Extract Answers");
    
    outputDiv.style.display = "block";
    outputDiv.innerHTML = "<span class='pulse'>Scanning document for answers...</span>";
    
    let questions = text.split("\n").filter(q => q.trim().length > 0);
    
    try {
        let response = await fetch(`${BACKEND_URL}/insights`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                paper_id: paperID,
                questions: questions
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        let formattedAnswers = "";
        
        for (let q in data.answers) {
            formattedAnswers += `**Q: ${q}**\n${data.answers[q]}\n\n`;
        }
        
        outputDiv.innerText = formattedAnswers.trim();
    } catch (error) {
        console.error('Error:', error);
        outputDiv.innerHTML = "<span style='color: #ef4444'>❌ Failed to extract insights. Please try again.</span>";
    } finally {
        setLoading("insightsBtn", "insightsSpinner", "insightsBtnText", false, "", "Extract Answers");
    }
}
